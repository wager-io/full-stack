// Byte-parity proof: the ORIGINAL Node game logic vs the Postgres port.
// If a single case disagrees, the "provably fair, identical outcomes" promise
// is broken — so this runs thousands of cases across random seeds and nonces.
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// --- the original algorithms, copied verbatim from the old backend ---------
function generateHash(clientSeed, nonce, serverSeed) {
  return crypto.createHmac('sha512', serverSeed).update(`${clientSeed}:${nonce}`).digest('hex')
}
function diceRoll(hash) {
  return parseFloat(((parseInt(hash.substr(0, 8), 16) / 0xffffffff) * 100).toFixed(2))
}
function limboRoll(hash) {
  const h = parseInt(hash.substr(0, 8), 16)
  const result = h / 0xffffffff
  return parseFloat(Math.max(1.0, 99 / (result * 100)).toFixed(2))
}

// --- Postgres side ---------------------------------------------------------
const PSQL = 'C:/Program Files/PostgreSQL/18/bin/psql.exe'
const CONN = ['-h', '127.0.0.1', '-p', '55433', '-U', 'postgres', '-d', 'wager_local', '-tA', '-w']

function pgBatch(rows) {
  // rows: [{seed, client, nonce}]  -> ask PG for uint32, dice roll, limbo roll
  const values = rows
    .map((r, i) => `(${i}, ${lit(r.seed)}, ${lit(r.client)}, ${r.nonce})`)
    .join(',')
  const sql = `
    with t(i, seed, client, nonce) as (values ${values})
    select i,
           public.pf_uint32(seed, client, nonce) as x,
           round((public.pf_uint32(seed, client, nonce)::numeric / 4294967295.0) * 100, 2) as dice,
           greatest(1.00, round(99 / ((public.pf_uint32(seed, client, nonce)::numeric / 4294967295.0) * 100), 2)) as limbo
      from t order by i;`
  const f = join(tmpdir(), `parity_${process.pid}.sql`)
  writeFileSync(f, sql)
  const out = execFileSync(PSQL, [...CONN, '-f', f], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  return out.trim().split('\n').filter(Boolean).map((l) => {
    const [i, x, dice, limbo] = l.split('|')
    return { i: +i, x: BigInt(x), dice: parseFloat(dice), limbo: parseFloat(limbo) }
  })
}
const lit = (s) => `'${String(s).replace(/'/g, "''")}'`

// --- run -------------------------------------------------------------------
const N = 3000
const rows = []
for (let i = 0; i < N; i++) {
  rows.push({
    seed: crypto.randomBytes(32).toString('hex'),
    client: crypto.randomBytes(8).toString('hex'),
    nonce: Math.floor(Math.random() * 1_000_000),
  })
}

let diceMismatch = 0, limboMismatch = 0, x32Mismatch = 0
const CHUNK = 500
const pg = []
for (let i = 0; i < rows.length; i += CHUNK) pg.push(...pgBatch(rows.slice(i, i + CHUNK)))

for (let i = 0; i < rows.length; i++) {
  const r = rows[i]
  const hash = generateHash(r.client, r.nonce, r.seed)
  const jsX = BigInt(parseInt(hash.substr(0, 8), 16))
  const jsDice = diceRoll(hash)
  const jsLimbo = limboRoll(hash)
  const p = pg[i]
  if (p.x !== jsX) { if (x32Mismatch < 3) console.log(`  x32 #${i}: js=${jsX} pg=${p.x}`); x32Mismatch++ }
  if (p.dice !== jsDice) { if (diceMismatch < 3) console.log(`  dice #${i}: js=${jsDice} pg=${p.dice}  (seed ${r.seed.slice(0,8)} n${r.nonce})`); diceMismatch++ }
  if (p.limbo !== jsLimbo) { if (limboMismatch < 3) console.log(`  limbo #${i}: js=${jsLimbo} pg=${p.limbo}`); limboMismatch++ }
}

console.log(`\n  cases: ${N}`)
console.log(`  uint32 mismatches: ${x32Mismatch}`)
console.log(`  dice   mismatches: ${diceMismatch}`)
console.log(`  limbo  mismatches: ${limboMismatch}`)
console.log(`\n  ${x32Mismatch + diceMismatch + limboMismatch === 0 ? 'PARITY PROVEN — Postgres == original Node, byte for byte' : 'PARITY BROKEN'}`)
process.exit(x32Mismatch + diceMismatch + limboMismatch === 0 ? 0 : 1)
