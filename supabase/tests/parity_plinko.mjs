// Byte-parity: original Node plinko vs Postgres port, over every risk/row combo.
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { PAYOUTS } = require('c:/Users/valia/Documents/projects/wager/stake-cloneBackend/controllers/games/plinko/plinkoLogic.js')

// --- original algorithms, verbatim -----------------------------------------
function generateHash(clientSeed, nonce, serverSeed) {
  return crypto.createHmac('sha512', serverSeed).update(`${clientSeed}:${nonce}`).digest('hex')
}
function generatePlinkoBallPath(clientSeed, nonce, serverSeed, rows) {
  const hash = generateHash(clientSeed, nonce, serverSeed)
  const hashList = String(hash).match(/.{2}/g)
  const path = []
  for (let i = 0, l = hashList.length; i < l && path.length < rows; i += 4) {
    const num =
      parseInt(hashList[i], 16) / 256 +
      parseInt(hashList[i + 1], 16) / 256 ** 2 +
      parseInt(hashList[i + 2], 16) / 256 ** 3 +
      parseInt(hashList[i + 3], 16) / 256 ** 4
    path.push(num)
  }
  return path
}
function getPayout(risk, rows, path) {
  return PAYOUTS[risk][rows][path.map((p) => Math.round(p)).reduce((t, e) => t + e, 0)]
}

// --- Postgres side ---------------------------------------------------------
const PSQL = 'C:/Program Files/PostgreSQL/18/bin/psql.exe'
const CONN = ['-h', '127.0.0.1', '-p', '55433', '-U', 'postgres', '-d', 'wager_local', '-tA', '-w']
const lit = (s) => `'${String(s).replace(/'/g, "''")}'`

function pgBatch(rows) {
  const values = rows.map((r, i) => `(${i}, ${lit(r.seed)}, ${lit(r.client)}, ${r.nonce}, ${r.risk}, ${r.rows})`).join(',')
  const sql = `
    with t(i, seed, client, nonce, risk, rows) as (values ${values})
    select t.i,
           (select coalesce(sum(x),0) from unnest(public.pf_plinko_path(t.seed, t.client, t.nonce, t.rows)) x) as bucket,
           pp.payouts[(select coalesce(sum(x),0) from unnest(public.pf_plinko_path(t.seed, t.client, t.nonce, t.rows)) x) + 1] as mult
      from t join public.plinko_payouts pp on pp.risk = t.risk and pp.rows = t.rows
     order by t.i;`
  const f = join(tmpdir(), `pplinko_${process.pid}.sql`)
  writeFileSync(f, sql)
  const out = execFileSync(PSQL, [...CONN, '-f', f], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  return out.trim().split('\n').filter(Boolean).map((l) => {
    const [i, bucket, mult] = l.split('|')
    return { i: +i, bucket: +bucket, mult: parseFloat(mult) }
  })
}

const N = 4000
const rows = []
for (let i = 0; i < N; i++) {
  const risk = 1 + (i % 3)
  const nrows = 8 + (i % 9)
  rows.push({ seed: crypto.randomBytes(32).toString('hex'), client: crypto.randomBytes(8).toString('hex'), nonce: Math.floor(Math.random() * 1e6), risk, rows: nrows })
}

const pg = []
for (let i = 0; i < rows.length; i += 500) pg.push(...pgBatch(rows.slice(i, i + 500)))

let bucketMiss = 0, multMiss = 0
for (let i = 0; i < rows.length; i++) {
  const r = rows[i]
  const path = generatePlinkoBallPath(r.client, r.nonce, r.seed, r.rows)
  const jsBucket = path.map((p) => Math.round(p)).reduce((t, e) => t + e, 0)
  const jsMult = getPayout(r.risk, r.rows, path)
  const p = pg[i]
  if (p.bucket !== jsBucket) { if (bucketMiss < 3) console.log(`  bucket #${i} risk${r.risk} rows${r.rows}: js=${jsBucket} pg=${p.bucket}`); bucketMiss++ }
  if (p.mult !== jsMult) { if (multMiss < 3) console.log(`  mult #${i}: js=${jsMult} pg=${p.mult}`); multMiss++ }
}

console.log(`\n  cases: ${N} (all 27 risk/row combos)`)
console.log(`  bucket mismatches: ${bucketMiss}`)
console.log(`  multiplier mismatches: ${multMiss}`)
console.log(`\n  ${bucketMiss + multMiss === 0 ? 'PLINKO PARITY PROVEN — Postgres == original Node' : 'PARITY BROKEN'}`)
process.exit(bucketMiss + multMiss === 0 ? 0 : 1)
