// Configure TRON deposits: write the account xpub and TronGrid settings into
// public.tron_config, and PROVE the xpub is the right one before trusting it.
//
//   SUPABASE_ACCESS_TOKEN=sbp_... SUPABASE_PROJECT_REF=xxxx \
//   TRON_ACCOUNT_XPUB=xpub... TRON_API_KEY=... \
//     deno run --allow-env --allow-net scripts/tron-setup.ts
//
// Optional: TRON_API_URL (default https://api.trongrid.io),
//           USDT_CONTRACT / MIN_CONFIRMATIONS (0016 already seeds mainnet
//           defaults; only pass these to override),
//           KNOWN_OTHER_ADDRESSES (comma-separated — see below),
//           SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (only needed if you ARE
//           overriding the two tron_config values).
//
// ── Two different places, because the code reads them from two places ─────
//
//   Edge Function SECRETS  TRON_ACCOUNT_XPUB, TRON_API_URL, TRON_API_KEY
//                          — read via Deno.env in tron-address / _shared/tron.ts
//   tron_config TABLE      usdt_contract, min_confirmations
//                          — read with a query, and already seeded by 0016
//
// Writing the xpub into tron_config would do nothing at all: nothing reads it
// from there. It goes in the secrets, which is also where it belongs — the
// table is readable by anything holding the service role.
//
// Deno, not Node, and it imports the REAL derivation from
// supabase/functions/_shared/tron.ts. The addresses it prints are produced by
// the same code the Edge Function will use, so checking them against your
// wallet checks the thing that actually matters. A second implementation here
// could agree with the wallet and still disagree with production.
//
// ── Use a DIFFERENT account index from any other platform ─────────────────
//
// Player addresses derive at m/44'/195'/0'/5/{index}, and the poker platform
// uses the identical path. Point two platforms at the SAME account xpub and
// player #7 on each is handed the SAME address — a deposit into it belongs to
// both, and whichever watcher sees it first credits the wrong person.
//
// Export WAGER's xpub from a different account of the same wallet —
// m/44'/195'/1' against poker's 0'. Same seed, same backup, same recovery
// phrase, completely separate address space. Still only the PUBLIC key:
// nothing that can spend goes near the server, which is the whole reason the
// deposit side was built this way.
//
// This script cannot tell which account an xpub came from; that information is
// not in the key. So it does the two things it can: prints the first addresses
// for you to check against the wallet, and refuses to continue if any of them
// appears in KNOWN_OTHER_ADDRESSES — paste a few of poker's player addresses
// in there and exporting the wrong account becomes impossible to miss.

import { tronAddressFromXpub } from '../supabase/functions/_shared/tron.ts';

function need(k: string): string {
  const v = Deno.env.get(k);
  if (!v) {
    console.error(`Missing ${k}`);
    Deno.exit(2);
  }
  return v;
}

const ACCESS_TOKEN = need('SUPABASE_ACCESS_TOKEN');
const PROJECT_REF = need('SUPABASE_PROJECT_REF');
const XPUB = need('TRON_ACCOUNT_XPUB').trim();
const API_KEY = Deno.env.get('TRON_API_KEY') ?? '';
const API_URL = Deno.env.get('TRON_API_URL') ?? 'https://api.trongrid.io';
const USDT = Deno.env.get('USDT_CONTRACT') ?? 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
const MIN_CONF = Deno.env.get('MIN_CONFIRMATIONS') ?? '20';
const KNOWN_OTHER = new Set(
  (Deno.env.get('KNOWN_OTHER_ADDRESSES') ?? '').split(',').map((s) => s.trim()).filter(Boolean),
);

if (!/^xpub[1-9A-HJ-NP-Za-km-z]+$/.test(XPUB)) {
  console.error('TRON_ACCOUNT_XPUB does not look like an xpub (base58, starting "xpub").');
  Deno.exit(2);
}

// Mainnet or testnet is a decision, not a default. Nile is the testnet the
// poker platform points at, and silently inheriting it would mean real players
// depositing into addresses watched on a chain with no real money on it.
if (/nile|shasta|test/i.test(API_URL)) {
  console.warn(`\n  WARNING: TRON_API_URL is ${API_URL} — that is a TESTNET.`);
  console.warn('  Real deposits will never be seen. Mainnet is https://api.trongrid.io\n');
}
if (!API_KEY) {
  console.warn('  WARNING: TRON_API_KEY is empty. TronGrid rate-limits anonymous callers');
  console.warn('  hard, and the watcher will silently miss transfers under load.\n');
}

let preview: { index: number; address: string }[];
try {
  preview = [0, 1, 2].map((index) => ({ index, address: tronAddressFromXpub(XPUB, index) }));
} catch (err) {
  console.error(`Could not derive from that xpub: ${err instanceof Error ? err.message : err}`);
  Deno.exit(2);
}

console.log('\nFirst three player addresses from this xpub — check against your wallet:\n');
for (const p of preview) console.log(`  /5/${p.index}   ${p.address}`);

const collision = preview.find((p) => KNOWN_OTHER.has(p.address));
if (collision) {
  console.error(
    `\nREFUSING: /5/${collision.index} derives ${collision.address}, which you listed as ` +
    `belonging to another platform.\n` +
    `This is the wrong account. Export the xpub from a different account index ` +
    `(m/44'/195'/1') and run again.\n`,
  );
  Deno.exit(1);
}
if (KNOWN_OTHER.size === 0) {
  console.log('\n  (KNOWN_OTHER_ADDRESSES not set — the collision check was skipped.)');
}

// --- Edge Function secrets -------------------------------------------------
const secrets = [
  { name: 'TRON_ACCOUNT_XPUB', value: XPUB },
  { name: 'TRON_API_URL', value: API_URL },
  ...(API_KEY ? [{ name: 'TRON_API_KEY', value: API_KEY }] : []),
];

console.log('\nSetting Edge Function secrets…');
const secretRes = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECT_REF}/secrets`,
  {
    method: 'POST',
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(secrets),
  },
);
if (!secretRes.ok) {
  console.error(`Failed: HTTP ${secretRes.status} ${(await secretRes.text()).slice(0, 300)}`);
  Deno.exit(1);
}
// Confirmed, never echoed — the xpub is not a password, but the API key is.
for (const s of secrets) console.log(`  ${s.name} (set)`);

// --- tron_config overrides, only if asked for ------------------------------
const overrides: Record<string, string> = {};
if (Deno.env.get('USDT_CONTRACT')) overrides.usdt_contract = USDT;
if (Deno.env.get('MIN_CONFIRMATIONS')) overrides.min_confirmations = MIN_CONF;

if (Object.keys(overrides).length) {
  const url = Deno.env.get('SUPABASE_URL')?.replace(/\/$/, '');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) {
    console.error('\nUSDT_CONTRACT/MIN_CONFIRMATIONS given, but SUPABASE_URL and');
    console.error('SUPABASE_SERVICE_ROLE_KEY are needed to write tron_config.');
    Deno.exit(2);
  }
  console.log('\nOverriding tron_config…');
  for (const [k, v] of Object.entries(overrides)) {
    const res = await fetch(`${url}/rest/v1/tron_config`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({ key: k, value: v }),
    });
    if (!res.ok) throw new Error(`${k}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
    console.log(`  ${k} = ${v}`);
  }
}

console.log('\nRedeploy so the functions pick the secrets up:');
console.log(`  supabase functions deploy tron-address --project-ref ${PROJECT_REF}`);
console.log(`  supabase functions deploy tron-watch   --project-ref ${PROJECT_REF}`);
console.log('\nThen open the deposit tab — it should return an address instead of');
console.log('"Deposits are unavailable". Send a small amount and confirm it credits.\n');
