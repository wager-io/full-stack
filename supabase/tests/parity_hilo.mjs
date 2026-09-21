// Byte-parity: original Node Hilo (card draw + chances + profit) vs Postgres port.
//
// Source of truth: controllers/games/hilo/hilo.controller.js in stake-cloneBackend —
// the LIVE implementation. The repo also carries HiloUtils.js (5% edge, Ace high)
// and HiloGameLogic.js, both dead. See the header of 0008_hilo.sql.
//
// Run:  node supabase/tests/parity_hilo.mjs
// Needs the local Postgres the other parity tests use. Without it this FAILS
// rather than passing quietly — a parity test that skips its own comparison is
// worse than no parity test, because it reports success.
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// --- original algorithm, verbatim from hilo.controller.js --------------------
const rankValues = { A: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, J: 11, Q: 12, K: 13 }

const cardOrder = [
  { rank: 'A', suite: '♠' }, { rank: '4', suite: '♥', red: true }, { rank: '7', suite: '♣' },
  { rank: '10', suite: '♦', red: true }, { rank: '2', suite: '♠' }, { rank: 'K', suite: '♣' },
  { rank: '5', suite: '♥', red: true }, { rank: '8', suite: '♣' }, { rank: 'J', suite: '♦', red: true },
  { rank: '3', suite: '♠' }, { rank: '6', suite: '♥', red: true }, { rank: 'Q', suite: '♦', red: true },
  { rank: '9', suite: '♣' }, { rank: 'A', suite: '♥', red: true }, { rank: '4', suite: '♣' },
  { rank: '7', suite: '♦', red: true }, { rank: '10', suite: '♠' }, { rank: '2', suite: '♥', red: true },
  { rank: 'K', suite: '♦', red: true }, { rank: '5', suite: '♣' }, { rank: '8', suite: '♦', red: true },
  { rank: 'J', suite: '♠' }, { rank: '3', suite: '♥', red: true }, { rank: '6', suite: '♣' },
  { rank: 'Q', suite: '♠' }, { rank: '9', suite: '♦', red: true }, { rank: 'A', suite: '♣' },
  { rank: '4', suite: '♦', red: true }, { rank: '7', suite: '♠' }, { rank: '10', suite: '♥', red: true },
  { rank: '2', suite: '♣' }, { rank: 'K', suite: '♠' }, { rank: '5', suite: '♦', red: true },
  { rank: '8', suite: '♠' }, { rank: 'J', suite: '♥', red: true }, { rank: '3', suite: '♣' },
  { rank: '6', suite: '♦' }, { rank: 'Q', suite: '♣' }, { rank: '9', suite: '♥', red: true },
  { rank: 'A', suite: '♦', red: true }, { rank: '4', suite: '♠' }, { rank: '7', suite: '♥', red: true },
  { rank: '10', suite: '♣' }, { rank: '2', suite: '♦' }, { rank: 'K', suite: '♥', red: true },
  { rank: '5', suite: '♠' }, { rank: '8', suite: '♥', red: true }, { rank: 'J', suite: '♣' },
  { rank: '3', suite: '♦' }, { rank: '6', suite: '♠' }, { rank: 'Q', suite: '♣' },
  { rank: '9', suite: '♥', red: true },
]

const numbers = [
  161, 180, 199, 218, 162, 205, 181, 200, 219, 163, 182, 220, 201, 177, 196,
  215, 170, 178, 221, 197, 216, 171, 179, 198, 172, 217, 193, 212, 167, 186,
  194, 173, 213, 168, 187, 195, 214, 188, 169, 209, 164, 183, 202, 210, 189,
  165, 184, 203, 211, 166, 204, 185,
]

const deck = cardOrder.map((card, index) => ({
  suite: card.suite,
  rank: card.rank,
  red: card.red || false,
  number: numbers[index],
  rankValue: rankValues[card.rank],
}))

const pickRandomCard = (clientSeed, serverSeed, nonce, round) => {
  const hmac = crypto.createHmac('sha256', serverSeed).update(`${clientSeed}:${nonce}:${round}`).digest('hex')
  let sum = 0
  for (let i = 0; i < 4; i++) {
    const pair = hmac.substring(i * 2, i * 2 + 2)
    const pairDecimal = parseInt(pair, 16)
    sum += pairDecimal / 256 ** (i + 1)
  }
  const cardIndex = Math.floor(sum * 52)
  return deck[cardIndex % 52]
}

function calculateProbabilities(lastCardRankValue) {
  const higherOrSameProbability =
    (deck.filter((card) => (lastCardRankValue === 1 ? card.rankValue > lastCardRankValue : card.rankValue >= lastCardRankValue)).length / deck.length) * 100
  const lowerOrSameProbability =
    (deck.filter((card) => (lastCardRankValue === 13 ? card.rankValue < lastCardRankValue : card.rankValue <= lastCardRankValue)).length / deck.length) * 100
  return { hi_chance: higherOrSameProbability, lo_chance: lowerOrSameProbability }
}

function calculateProfit({ bet_amount, hi_chance, lo_chance }) {
  const probability_higher = hi_chance / 100
  const probability_lower = lo_chance / 100
  const house_edge = 1 / 100
  const multiplier_higher = 1 / probability_higher
  const multiplier_lower = 1 / probability_lower
  const edge_multiplier_higher = multiplier_higher * (1 - house_edge)
  const edge_multiplier_lower = multiplier_lower * (1 - house_edge)
  return {
    hi_profit: bet_amount * edge_multiplier_higher - bet_amount,
    lo_profit: bet_amount * edge_multiplier_lower - bet_amount,
  }
}

// --- the cases --------------------------------------------------------------
const CASES = 500
const rnd = () => crypto.randomBytes(16).toString('hex')
const cases = Array.from({ length: CASES }, (_, i) => ({
  seed: rnd(),
  client: rnd().slice(0, 10),
  nonce: i,
  round: i % 53,                       // 0..52, so the skip ceiling is covered
  stake: 1 + (i % 97) * 1.37,          // a spread of stakes, two decimals in play
}))

// Every rank gets its chances and profits checked, not just the ones the random
// cards happen to land on — Ace and King are the whole point of the tie rule.
const RANKS = Array.from({ length: 13 }, (_, i) => i + 1)

// --- Postgres side ----------------------------------------------------------
const PSQL = 'C:/Program Files/PostgreSQL/18/bin/psql.exe'
const CONN = ['-h', '127.0.0.1', '-p', '55433', '-U', 'postgres', '-d', 'wager_local', '-tA', '-w']
const lit = (s) => `'${String(s).replace(/'/g, "''")}'`

if (!existsSync(PSQL)) {
  console.error(`\nFAIL — cannot verify: no psql at ${PSQL}`)
  console.error('This test compares the Postgres port against the original JS. Without a')
  console.error('database it can only re-run the JS against itself, which proves nothing.')
  console.error('Bring up the local Postgres the other parity tests use, then run again.\n')
  process.exit(1)
}

function pgRows(sql) {
  const f = join(tmpdir(), `philo_${process.pid}.sql`)
  writeFileSync(f, sql)
  const out = execFileSync(PSQL, [...CONN, '-f', f], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  return out.trim().split('\n').filter(Boolean).map((l) => l.split('|'))
}

let failures = 0
const report = (what, i, expected, actual) => {
  failures++
  if (failures <= 20) console.error(`  ${what} #${i}: expected ${expected}, got ${actual}`)
}

// 1. The card a seed produces, for each case.
{
  const values = cases.map((c, i) => `(${i}, ${lit(c.seed)}, ${lit(c.client)}, ${c.nonce}, ${c.round})`).join(',')
  const rows = pgRows(`
    with t(i, seed, client, nonce, round) as (values ${values})
    select t.i,
           public.pf_hilo_card(t.seed, t.client, t.nonce, t.round) ->> 'rank',
           public.pf_hilo_card(t.seed, t.client, t.nonce, t.round) ->> 'suite',
           (public.pf_hilo_card(t.seed, t.client, t.nonce, t.round) ->> 'number')::int,
           (public.pf_hilo_card(t.seed, t.client, t.nonce, t.round) ->> 'rank_value')::int
      from t order by t.i;`)
  for (const [i, rank, suite, number, rankValue] of rows) {
    const want = pickRandomCard(cases[+i].client, cases[+i].seed, cases[+i].nonce, cases[+i].round)
    const got = { rank, suite, number: +number, rankValue: +rankValue }
    if (want.rank !== got.rank || want.suite !== got.suite || want.number !== got.number || want.rankValue !== got.rankValue) {
      report('card', i, `${want.rank}${want.suite}/${want.number}`, `${got.rank}${got.suite}/${got.number}`)
    }
  }
  console.log(`cards            ${rows.length} compared`)
}

// 2. Chances per rank.
{
  const rows = pgRows(`
    with t(rv) as (values ${RANKS.map((r) => `(${r})`).join(',')})
    select t.rv,
           (public.hilo_chances(t.rv) ->> 'hi_chance')::float8,
           (public.hilo_chances(t.rv) ->> 'lo_chance')::float8
      from t order by t.rv;`)
  for (const [rv, hi, lo] of rows) {
    const want = calculateProbabilities(+rv)
    if (Math.abs(want.hi_chance - +hi) > 1e-9 || Math.abs(want.lo_chance - +lo) > 1e-9) {
      report('chances', rv, `${want.hi_chance}/${want.lo_chance}`, `${hi}/${lo}`)
    }
  }
  console.log(`chances          ${rows.length} ranks compared`)
}

// 3. Profit for each rank at several stakes — the compounding input.
{
  const pairs = []
  for (const rv of RANKS) for (const c of cases.slice(0, 40)) pairs.push({ rv, stake: c.stake })
  const values = pairs.map((p, i) => {
    const { hi_chance, lo_chance } = calculateProbabilities(p.rv)
    return `(${i}, ${p.stake}, ${hi_chance}::float8, ${lo_chance}::float8)`
  }).join(',')
  const rows = pgRows(`
    with t(i, stake, hi, lo) as (values ${values})
    select t.i,
           (public.hilo_profit(t.stake::numeric, t.hi, t.lo) ->> 'hi_profit')::float8,
           (public.hilo_profit(t.stake::numeric, t.hi, t.lo) ->> 'lo_profit')::float8
      from t order by t.i;`)
  for (const [i, hiP, loP] of rows) {
    const p = pairs[+i]
    const { hi_chance, lo_chance } = calculateProbabilities(p.rv)
    const want = calculateProfit({ bet_amount: p.stake, hi_chance, lo_chance })
    // Relative tolerance: these are float products, and the stake carries cents.
    const off = (a, b) => Math.abs(a - b) > Math.max(1e-9, Math.abs(a) * 1e-12)
    if (off(want.hi_profit, +hiP) || off(want.lo_profit, +loP)) {
      report('profit', i, `${want.hi_profit}/${want.lo_profit}`, `${hiP}/${loP}`)
    }
  }
  console.log(`profit           ${rows.length} combinations compared`)
}


// 4. THE ROUND LOGIC, played for real.
//
// Sections 1-3 only exercise the three pure helpers. An audit mutated the win
// rule, the 5000 cap and the opening nonce inside hilo_choice/hilo_start and
// this file stayed green on all three, because nothing here ever played a
// round. This section does: it starts a real game through the RPCs, drives a
// scripted sequence of calls, and replays the same sequence in JS using the
// ORIGINAL's arithmetic (handleHiloNextRound), comparing card, profit and
// payout after every single call.
{
  /*
   * A FIXED SEED that deals four Kings in a row, found by search.
   *
   * Random play does not reach the two rules that matter most. A tie needs the
   * next card to repeat the current rank (~8% a round) and the 5000 cap needs a
   * run of very unlikely wins; with four scripts of six rounds, neither showed
   * up, and mutating the tie rule and the cap left this file green.
   *
   * Four Kings forces both at once: 'hi' off a King wins ONLY on a tie (nothing
   * ranks above it), and each such win pays ~12.9x, so the third one takes the
   * profit past 5000 and pins the cap.
   */
  const FORCED = {
    server: '77a25f2d8a90417acc85f42adafe385f6bb70de30cfc5fdbd59ee303f30268cf',
    client: 'parityforce',
    nonce: 1,
    script: ['hi', 'hi', 'hi'],
  }

  const SCRIPTS = [
    ['hi', 'hi', 'hi', 'hi', 'hi', 'hi'],
    ['lo', 'lo', 'lo', 'lo', 'lo', 'lo'],
    ['hi', 'skip', 'hi', 'skip', 'lo', 'hi'],
    ['lo', 'hi', 'lo', 'hi', 'lo', 'hi'],
  ]
  const STAKE = 13.37
  let played = 0

  const CASES = [...SCRIPTS.map((script) => ({ script, forced: null })),
                 { script: FORCED.script, forced: FORCED }]

  for (const [n, kase] of CASES.entries()) {
    const script = kase.script
    const uid = `bbbbbbbb-0000-4000-8000-${String(n).padStart(12, '0')}`
    // Everything happens inside one DO block: psql's \gset does not survive
    // being generated here, and a temp table gives the same rows without it.
    const choices = script.map((c) => lit(c)).join(', ')
    const sql = `
      drop table if exists parity_play;
      create temp table parity_play (seq int, card int, profit numeric, payout numeric, state text);
      delete from auth.users where id = ${lit(uid)};
      insert into auth.users (id, email) values (${lit(uid)}, ${lit('parity' + n + '@test.local')});
      select public.adjust_balance(${lit(uid)}, 1000000);
      select set_config('request.jwt.claim.sub', ${lit(uid)}, false);
      ${kase.forced ? `
      insert into public.game_seeds (user_id, game, server_seed_hash)
        values (${lit(uid)}, 'hilo', '') on conflict (user_id, game) do nothing;
      update public.game_seeds set server_seed = ${lit(kase.forced.server)},
             client_seed = ${lit(kase.forced.client)}, nonce = ${kase.forced.nonce - 1}
       where user_id = ${lit(uid)} and game = 'hilo';` : ''}
      do $$
      declare
        v_game text;
        v_choices text[] := array[${choices}];
        v_i int;
        v_g public.hilo_games;
      begin
        v_game := public.hilo_start(${STAKE}) ->> 'game_id';
        select * into v_g from public.hilo_games where game_id = v_game;
        insert into parity_play values (0, (v_g.rounds->0->>'number')::int, v_g.profit, v_g.payout, v_g.state);
        for v_i in 1 .. array_length(v_choices, 1) loop
          exit when (select state from public.hilo_games where game_id = v_game) <> 'active';
          perform public.hilo_choice(v_game, v_choices[v_i]);
          select * into v_g from public.hilo_games where game_id = v_game;
          insert into parity_play values (v_i, (v_g.rounds->-1->>'number')::int, v_g.profit, v_g.payout, v_g.state);
        end loop;
        insert into parity_play values (-1, null, null, null,
          (select server_seed || '|' || client_seed || '|' || nonce from public.hilo_games where game_id = v_game));
      end $$;
      select 'SEED|' || state from parity_play where seq = -1;
      select 'R|' || seq || '|' || card || '|' || profit || '|' || payout || '|' || state
        from parity_play where seq >= 0 order by seq;
      delete from auth.users where id = ${lit(uid)};`
    const f = join(tmpdir(), `philo_play_${process.pid}_${n}.sql`)
    writeFileSync(f, sql)
    const out = execFileSync(PSQL, [...CONN, '-f', f], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    const lines = out.split(String.fromCharCode(10)).map((l) => l.trim()).filter(Boolean)

    const seedLine = lines.find((l) => l.startsWith('SEED|'))
    if (!seedLine) { report('play', n, 'a game', 'no game started'); continue }
    const [, server, client, nonceStr] = seedLine.split('|')
    const nonce = Number(nonceStr)
    const rows = lines.filter((l) => l.startsWith('R|')).map((l) => l.split('|'))

    // --- the original's arithmetic, replayed ---
    let card = pickRandomCard(client, server, nonce, 0)
    let profit = 0
    let payout = 0.99
    let dead = false

    for (const row of rows) {
      const [, roundStr, numberStr, pgProfit, pgPayout, pgState] = row
      const round = Number(roundStr)

      if (round > 0) {
        const choice = script[round - 1]
        const prev = card
        const { hi_chance, lo_chance } = calculateProbabilities(prev.rankValue)
        const next = pickRandomCard(client, server, nonce, round)
        const won = choice === 'skip' ? true
          : choice === 'hi' ? (prev.rankValue === 1 ? next.rankValue > prev.rankValue : next.rankValue >= prev.rankValue)
          : (prev.rankValue === 13 ? next.rankValue < prev.rankValue : next.rankValue <= prev.rankValue)
        if (!won) {
          profit = 0; payout = 0; dead = true
        } else if (choice !== 'skip') {
          const { hi_profit, lo_profit } = calculateProfit({ bet_amount: STAKE + profit, hi_chance, lo_chance })
          const gain = choice === 'hi' ? hi_profit : lo_profit
          payout = 1 + (profit + gain) / STAKE
          profit = Math.min(5000, profit + gain)
        }
        card = next
      }

      if (Number(numberStr) !== card.number) {
        report('play card', `${n}.${round}`, card.number, numberStr)
      }
      // Cents of tolerance would hide exactly the drift this is here to catch.
      if (Math.abs(Number(pgProfit) - profit) > 1e-9) {
        report('play profit', `${n}.${round}`, profit, pgProfit)
      }
      if (Math.abs(Number(pgPayout) - payout) > 1e-9) {
        report('play payout', `${n}.${round}`, payout, pgPayout)
      }
      if (dead && pgState === 'active') {
        report('play state', `${n}.${round}`, 'lost', pgState)
      }
      played++
      if (dead) break
    }
  }
  console.log(`rounds played    ${played} compared (card, profit, payout, state)`)
}
if (failures) {
  console.error(`\nFAIL — ${failures} mismatch(es). The port does not match the original.\n`)
  process.exit(1)
}
console.log('\nPASS — Postgres Hilo matches the original JS byte for byte.\n')
