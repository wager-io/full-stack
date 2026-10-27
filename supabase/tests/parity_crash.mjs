// Byte-parity: the old Node calculateCrashPoint (stake-cloneBackend/controllers/games/crash/utils.js,
// with node:crypto HMAC in place of crypto-js) vs Postgres pf_crash_point.
//
//   WAGER_PG_PORT=5439 node supabase/tests/parity_crash.mjs
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// --- verbatim algorithm (HMAC via node:crypto: key = salt utf8, msg = hex-decoded hash)
function calculateCrashPoint(seed, SALT) {
  const nBits = 52
  const hmac = crypto.createHmac('sha256', Buffer.from(SALT, 'utf8')).update(Buffer.from(seed, 'hex')).digest('hex')
  seed = hmac.slice(0, nBits / 4)
  const r = parseInt(seed, 16)
  let X = r / Math.pow(2, nBits)
  X = parseFloat(X.toPrecision(9))
  X = 99 / (1 - X)
  const result = Math.floor(X)
  return Math.max(1, result / 100)
}

const PORT = process.env.WAGER_PG_PORT ?? '55433'
const PSQL = 'C:/Program Files/PostgreSQL/18/bin/psql.exe'
const CONN = ['-h', '127.0.0.1', '-p', PORT, '-U', 'postgres', '-d', process.env.WAGER_PG_DB ?? 'wager_local', '-tA', '-w']
const lit = (s) => `'${String(s).replace(/'/g, "''")}'`

function psql(sql) {
  const f = join(tmpdir(), `pcrash_${process.pid}.sql`)
  writeFileSync(f, sql)
  return execFileSync(PSQL, [...CONN, '-f', f], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    .trim().split('\n').filter(Boolean)
}

function pgBatch(rows) {
  const values = rows.map((r, i) => `(${i}, ${lit(r.hash)}, ${lit(r.salt)})`).join(',')
  return psql(`with t(i, h, s) as (values ${values})
    select t.i, public.pf_crash_point(t.h, t.s) from t order by t.i;`)
    .map((l) => { const [i, v] = l.split('|'); return { i: +i, v: Number(v) } })
}

const N = 6000
const rows = []
for (let i = 0; i < N; i++) {
  // mix of salts: fixed-style hex, random printable, and some non-ASCII / quote characters
  const kind = i % 3
  const salt = kind === 0 ? crypto.randomBytes(32).toString('hex')
    : kind === 1 ? crypto.randomBytes(12).toString('base64')
    : `s\u00e9l't-${i}-\u2603`
  rows.push({ hash: crypto.randomBytes(32).toString('hex'), salt })
}

const pg = []
for (let i = 0; i < rows.length; i += 500) pg.push(...pgBatch(rows.slice(i, i + 500)))

let mismatches = 0, ge2 = 0, ones = 0, maxCp = 0
rows.forEach((r, i) => {
  const js = calculateCrashPoint(r.hash, r.salt)
  if (pg[i].v !== js) {
    if (mismatches < 10) console.log('MISMATCH', r, 'js=', js, 'pg=', pg[i].v)
    mismatches++
  }
  if (js >= 2) ge2++
  if (js === 1) ones++
  if (js > maxCp) maxCp = js
})

const p2 = ge2 / N
console.log(`samples=${N}  mismatches=${mismatches}  P(cp>=2)=${p2.toFixed(4)}  P(cp=1.00)=${(ones / N).toFixed(4)}  max=${maxCp}`)
const okParity = mismatches === 0
const okDist = Math.abs(p2 - 0.495) <= 0.02
console.log(`parity: ${okParity ? 'PASS' : 'FAIL'}`)
console.log(`distribution P(cp>=2) ~ 0.495 +/- 0.02: ${okDist ? 'PASS' : 'FAIL'}`)
console.log(okParity && okDist ? 'PASS' : 'FAIL')
process.exit(okParity && okDist ? 0 : 1)
