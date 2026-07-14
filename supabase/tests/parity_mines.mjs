// Byte-parity: original Node Mines (grid + multiplier) vs Postgres port.
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// --- original algorithms, verbatim from MinesGameInstance.js / payoutCalculator.js
function generateGrid(serverSeed, clientSeed, nonce, minesCount) {
  const hash = crypto.createHmac('sha256', serverSeed).update(`${clientSeed}:${nonce}`).digest('hex')
  const allPositions = Array.from({ length: 25 }, (_, i) => i)
  let currentHash = hash
  const getRand = (max) => {
    const val = parseInt(currentHash.substring(0, 8), 16)
    currentHash = crypto.createHash('sha256').update(currentHash).digest('hex')
    return val % max
  }
  for (let i = allPositions.length - 1; i > 0; i--) {
    const j = getRand(i + 1)
    ;[allPositions[i], allPositions[j]] = [allPositions[j], allPositions[i]]
  }
  return allPositions.slice(0, minesCount).sort((a, b) => a - b)
}
function calculateMultiplier(minesCount, revealedCount) {
  if (revealedCount === 0) return 1.0
  let multiplier = 1.0
  for (let i = 0; i < revealedCount; i++) {
    multiplier *= (25 - i) / ((25 - minesCount) - i)
  }
  multiplier *= 1 - 0.01
  return Math.floor(multiplier * 100) / 100
}

// --- Postgres side ---------------------------------------------------------
const PSQL = 'C:/Program Files/PostgreSQL/18/bin/psql.exe'
const CONN = ['-h', '127.0.0.1', '-p', '55433', '-U', 'postgres', '-d', 'wager_local', '-tA', '-w']
const lit = (s) => `'${String(s).replace(/'/g, "''")}'`

function pgBatch(rows) {
  const values = rows.map((r, i) => `(${i}, ${lit(r.seed)}, ${lit(r.client)}, ${r.nonce}, ${r.mines}, ${r.reveal})`).join(',')
  const sql = `
    with t(i, seed, client, nonce, mines, reveal) as (values ${values})
    select t.i,
           array_to_string(public.pf_mines_grid(t.seed, t.client, t.nonce, t.mines), ',') as grid,
           public.mines_multiplier(t.mines, t.reveal) as mult
      from t order by t.i;`
  const f = join(tmpdir(), `pmines_${process.pid}.sql`)
  writeFileSync(f, sql)
  const out = execFileSync(PSQL, [...CONN, '-f', f], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  return out.trim().split('\n').filter(Boolean).map((l) => {
    const [i, grid, mult] = l.split('|')
    return { i: +i, grid: grid === '' ? [] : grid.split(',').map(Number), mult: parseFloat(mult) }
  })
}

const N = 4000
const rows = []
for (let i = 0; i < N; i++) {
  const mines = 1 + (i % 24)
  const totalGems = 25 - mines
  rows.push({
    seed: crypto.randomBytes(32).toString('hex'),
    client: crypto.randomBytes(8).toString('hex'),
    nonce: Math.floor(Math.random() * 1e6),
    mines,
    reveal: totalGems === 0 ? 0 : Math.floor(Math.random() * (totalGems + 1)),
  })
}

const pg = []
for (let i = 0; i < rows.length; i += 400) pg.push(...pgBatch(rows.slice(i, i + 400)))

let gridMiss = 0, multMiss = 0
for (let i = 0; i < rows.length; i++) {
  const r = rows[i]
  const jsGrid = generateGrid(r.seed, r.client, r.nonce, r.mines)
  const jsMult = calculateMultiplier(r.mines, r.reveal)
  const p = pg[i]
  const gridEq = jsGrid.length === p.grid.length && jsGrid.every((v, k) => v === p.grid[k])
  if (!gridEq) { if (gridMiss < 3) console.log(`  grid #${i} mines${r.mines}: js=[${jsGrid}] pg=[${p.grid}]`); gridMiss++ }
  if (p.mult !== jsMult) { if (multMiss < 3) console.log(`  mult #${i} mines${r.mines} rev${r.reveal}: js=${jsMult} pg=${p.mult}`); multMiss++ }
}

console.log(`\n  cases: ${N} (mines 1..24, random reveal counts)`)
console.log(`  grid mismatches: ${gridMiss}`)
console.log(`  multiplier mismatches: ${multMiss}`)
console.log(`\n  ${gridMiss + multMiss === 0 ? 'MINES PARITY PROVEN — Postgres == original Node' : 'PARITY BROKEN'}`)
process.exit(gridMiss + multMiss === 0 ? 0 : 1)
