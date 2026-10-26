// Compare the functions that actually exist in a hosted Supabase project
// against the ones the migrations in this repo define.
//
// Why this exists: the live Wager project was found carrying
// `ccp_settle_withdrawal(text, text, jsonb)` — three arguments, where 0015
// declares four. 0017's `drop function ... (text,text,text,jsonb)` therefore
// matched nothing and reported success, leaving the superseded
// debit-at-request path callable beside the new state machine. Nothing in the
// repo could have told you that; only the database knows what the database
// has.
//
//   SUPABASE_ACCESS_TOKEN=sbp_... SUPABASE_PROJECT_REF=xxxx \
//     node scripts/schema-drift.mjs
//
// Read-only. It reports; it never changes anything.

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = process.env.SUPABASE_PROJECT_REF;

if (!token || !ref) {
  console.error('Set SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_REF.');
  process.exit(2);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

async function query(sql) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/database/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: sql }),
    },
  );
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 500)}`);
  }
  return res.json();
}

const migrationsDir = join(root, 'supabase', 'migrations');
const sources = readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .map((f) => readFileSync(join(migrationsDir, f), 'utf8'))
  .join('\n');

// Escaped before interpolation: function names are safe today, but building a
// regex out of an external string without escaping is how this kind of script
// starts throwing "Unterminated group" on someone else's database.
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const definedInRepo = (name) =>
  new RegExp(`function\\s+public\\.${escape(name)}\\s*\\(`, 'i').test(sources);

const live = await query(`
  select p.proname as name,
         pg_get_function_identity_arguments(p.oid) as args,
         coalesce(array_to_string(p.proconfig, ','), '') as config,
         -- The BODY, so the pgcrypto check below can look at what a function
         -- actually calls instead of guessing from its search_path.
         coalesce(p.prosrc, '') as body
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.prokind = 'f'
   order by 1, 2;
`);

const orphans = live.filter((f) => !definedInRepo(f.name));

// Functions that are ACTUALLY BROKEN, not merely suspicious.
//
// Supabase installs pgcrypto into `extensions`, so a function declaring
// `search_path = public` cannot resolve gen_random_bytes/digest/hmac/crypt
// and dies at call time with "function ... does not exist".
//
// Both conditions are required. Pinning `public` is normal and correct — most
// functions never touch pgcrypto. Flagging all of them buries the two that
// matter in a list of fifty that don't, which is how a real warning gets
// trained away. So the body has to actually call one of these.
//
// Word boundaries, and `\.` excluded before the name, so an already-qualified
// `extensions.digest(...)` is not reported as broken.
const PGCRYPTO = /(?<![.\w])(gen_random_bytes|digest|hmac|crypt|gen_salt)\s*\(/;
const pgcryptoRisk = live.filter(
  (f) =>
    /search_path=/.test(f.config) &&
    !/extensions/.test(f.config) &&
    PGCRYPTO.test(f.body),
);

console.log(`live functions in public: ${live.length}`);
console.log(`migrations scanned:       ${readdirSync(migrationsDir).length}`);

console.log(`\n── Live but not defined by any migration (${orphans.length}) ──`);
if (orphans.length === 0) console.log('  (none — the repo accounts for everything live)');
else {
  for (const f of orphans) console.log(`  ${f.name}(${f.args})`);
  console.log('\n  Each is either a migration that was never committed, or a leftover');
  console.log('  that should be dropped. Both are worth resolving: a live function');
  console.log('  nobody can read is a live function nobody can review.');
}

console.log(`\n── Calls pgcrypto but cannot see it (${pgcryptoRisk.length}) ──`);
if (pgcryptoRisk.length === 0) console.log('  (none — every pgcrypto caller can resolve it)');
else {
  for (const f of pgcryptoRisk) {
    const call = f.body.match(PGCRYPTO)?.[1] ?? '?';
    console.log(`  ${f.name}(${f.args})`);
    console.log(`      calls ${call}() with ${f.config} -> fails at runtime`);
  }
  console.log("\n  Fix: `set search_path = public, extensions` on each.");
}

process.exit(orphans.length > 0 || pgcryptoRisk.length > 0 ? 1 : 0);
