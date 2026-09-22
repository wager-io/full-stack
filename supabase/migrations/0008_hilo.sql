-- =============================================================================
-- 0008_hilo.sql  —  Phase 3: Hilo (closes the phase; Mines was the other half)
--
-- Ported from controllers/games/hilo/hilo.controller.js — the LIVE one.
--
-- WHICH ORIGINAL THIS IS. The old backend carries three Hilo implementations
-- and they disagree about the house edge and about whether an Ace is high:
--
--   controllers/games/hilo/hilo.controller.js   1% edge, A = 1   <- THIS ONE
--   controllers/games/hilo/HiloUtils.js         5% edge, A = 14  (dead)
--   controllers/games/hilo/HiloGameLogic.js     1% edge, A = 1, different deck (dead)
--
-- Only the first is reachable: socket/index.js requires controllers/games/hilo,
-- whose index.js requires ./hilo.controller. The other two are imported by
-- nothing. `games/hilo.controller.js` is a near-copy behind routes that
-- route.manager.js never mounts. Porting the wrong file would have quietly
-- changed every payout.
--
-- THE GAME. One card is dealt. You call the next card higher-or-same or
-- lower-or-same, or skip it. Win and the profit compounds; lose and the round
-- is over. Cash out any time.
--
-- Card RNG, ported exactly:
--   hash = HMAC_SHA256(server_seed, client_seed:nonce:round)   -- round, not a chain
--   sum  = Σ i=0..3  byte_pair_i / 256^(i+1)                   -- first 4 byte pairs
--   card = deck[ floor(sum * 52) % 52 ]
--
-- Ties belong to BOTH sides — "higher" means >=, "lower" means <= — except at
-- the ends: on an Ace (1) higher is strictly >, on a King (13) lower is
-- strictly <. That is what makes an Ace's "lower" and a King's "higher" pay
-- almost nothing, and it is deliberate in the original.
--
-- ── One difference from the original, deliberate and worth knowing ─────────
--
-- THE NONCE. The original deals the opening card with the seed's CURRENT nonce
-- and increments afterwards, so a game's later rounds share a nonce with the
-- next game's opening card. Here the nonce is incremented first and one nonce
-- is pinned to the whole round, which is also what the Mines port does. Every
-- card is still verifiable from (server_seed, client_seed, nonce, round) — the
-- nonce a player verifies against is the one stored on their game — but a
-- verifier written against the ORIGINAL's numbering will disagree about the
-- first card. Changing it would make Hilo inconsistent with Mines, so it is
-- recorded here rather than silently differing.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- The deck, in the original's fixed order. Position matters: the RNG indexes
-- straight into this array, so any reordering changes every historical result.
--
-- The suits are \uXXXX ESCAPES, not literal glyphs, so every DATA line here is
-- pure ASCII. Loaded through psql on a machine whose console is not UTF-8
-- (Windows cp437, say) raw characters arrive double-encoded and every card
-- comes out wrong - an audit saw parity fail 500/500 that way, and pass once
-- the client encoding was pinned. jsonb decodes the escapes itself, so the
-- stored value is identical either way and the file cannot be corrupted in
-- transit. Comments above may hold non-ASCII; only the data matters.
--
-- IT IS NOT A VALID 52-CARD DECK, and that is faithful. Positions 51 and 52
-- repeat Q♣ and 9♥; Q♥ and 9♠ appear nowhere. Every RANK still appears exactly
-- four times, so probabilities and payouts are unaffected — the only visible
-- effect is that two cards show a duplicate suit. Fixing it here would change
-- the card a given seed produces and break parity with every past game, so it
-- is recorded and left alone.
-- ---------------------------------------------------------------------------
create or replace function public.hilo_deck()
returns jsonb
language sql immutable
set search_path = public
as $$
  select $json$[
    {"rank":"A","suite":"\u2660","red":false,"number":161,"rank_value":1},
    {"rank":"4","suite":"\u2665","red":true,"number":180,"rank_value":4},
    {"rank":"7","suite":"\u2663","red":false,"number":199,"rank_value":7},
    {"rank":"10","suite":"\u2666","red":true,"number":218,"rank_value":10},
    {"rank":"2","suite":"\u2660","red":false,"number":162,"rank_value":2},
    {"rank":"K","suite":"\u2663","red":false,"number":205,"rank_value":13},
    {"rank":"5","suite":"\u2665","red":true,"number":181,"rank_value":5},
    {"rank":"8","suite":"\u2663","red":false,"number":200,"rank_value":8},
    {"rank":"J","suite":"\u2666","red":true,"number":219,"rank_value":11},
    {"rank":"3","suite":"\u2660","red":false,"number":163,"rank_value":3},
    {"rank":"6","suite":"\u2665","red":true,"number":182,"rank_value":6},
    {"rank":"Q","suite":"\u2666","red":true,"number":220,"rank_value":12},
    {"rank":"9","suite":"\u2663","red":false,"number":201,"rank_value":9},
    {"rank":"A","suite":"\u2665","red":true,"number":177,"rank_value":1},
    {"rank":"4","suite":"\u2663","red":false,"number":196,"rank_value":4},
    {"rank":"7","suite":"\u2666","red":true,"number":215,"rank_value":7},
    {"rank":"10","suite":"\u2660","red":false,"number":170,"rank_value":10},
    {"rank":"2","suite":"\u2665","red":true,"number":178,"rank_value":2},
    {"rank":"K","suite":"\u2666","red":true,"number":221,"rank_value":13},
    {"rank":"5","suite":"\u2663","red":false,"number":197,"rank_value":5},
    {"rank":"8","suite":"\u2666","red":true,"number":216,"rank_value":8},
    {"rank":"J","suite":"\u2660","red":false,"number":171,"rank_value":11},
    {"rank":"3","suite":"\u2665","red":true,"number":179,"rank_value":3},
    {"rank":"6","suite":"\u2663","red":false,"number":198,"rank_value":6},
    {"rank":"Q","suite":"\u2660","red":false,"number":172,"rank_value":12},
    {"rank":"9","suite":"\u2666","red":true,"number":217,"rank_value":9},
    {"rank":"A","suite":"\u2663","red":false,"number":193,"rank_value":1},
    {"rank":"4","suite":"\u2666","red":true,"number":212,"rank_value":4},
    {"rank":"7","suite":"\u2660","red":false,"number":167,"rank_value":7},
    {"rank":"10","suite":"\u2665","red":true,"number":186,"rank_value":10},
    {"rank":"2","suite":"\u2663","red":false,"number":194,"rank_value":2},
    {"rank":"K","suite":"\u2660","red":false,"number":173,"rank_value":13},
    {"rank":"5","suite":"\u2666","red":true,"number":213,"rank_value":5},
    {"rank":"8","suite":"\u2660","red":false,"number":168,"rank_value":8},
    {"rank":"J","suite":"\u2665","red":true,"number":187,"rank_value":11},
    {"rank":"3","suite":"\u2663","red":false,"number":195,"rank_value":3},
    {"rank":"6","suite":"\u2666","red":false,"number":214,"rank_value":6},
    {"rank":"Q","suite":"\u2663","red":false,"number":188,"rank_value":12},
    {"rank":"9","suite":"\u2665","red":true,"number":169,"rank_value":9},
    {"rank":"A","suite":"\u2666","red":true,"number":209,"rank_value":1},
    {"rank":"4","suite":"\u2660","red":false,"number":164,"rank_value":4},
    {"rank":"7","suite":"\u2665","red":true,"number":183,"rank_value":7},
    {"rank":"10","suite":"\u2663","red":false,"number":202,"rank_value":10},
    {"rank":"2","suite":"\u2666","red":false,"number":210,"rank_value":2},
    {"rank":"K","suite":"\u2665","red":true,"number":189,"rank_value":13},
    {"rank":"5","suite":"\u2660","red":false,"number":165,"rank_value":5},
    {"rank":"8","suite":"\u2665","red":true,"number":184,"rank_value":8},
    {"rank":"J","suite":"\u2663","red":false,"number":203,"rank_value":11},
    {"rank":"3","suite":"\u2666","red":false,"number":211,"rank_value":3},
    {"rank":"6","suite":"\u2660","red":false,"number":166,"rank_value":6},
    {"rank":"Q","suite":"\u2663","red":false,"number":204,"rank_value":12},
    {"rank":"9","suite":"\u2665","red":true,"number":185,"rank_value":9}
  ]$json$::jsonb;
$$;

revoke execute on function public.hilo_deck() from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- The card a seed pair produces for one round. Isolated so the parity test has
-- a single target, exactly as pf_mines_grid is.
--
-- float8 throughout, because the original sums JS doubles and floors the
-- result: numeric would be MORE accurate and would therefore disagree at the
-- boundaries, which is the one thing a port must not do.
-- ---------------------------------------------------------------------------
create or replace function public.pf_hilo_card(p_server_seed text, p_client_seed text, p_nonce bigint, p_round int)
returns jsonb
language plpgsql immutable
set search_path = public, extensions
as $$
declare
  v_hash text := encode(hmac(p_client_seed || ':' || p_nonce::text || ':' || p_round::text, p_server_seed, 'sha256'), 'hex');
  v_sum  float8 := 0;
  i int;
  v_pair int;
begin
  for i in 0 .. 3 loop
    v_pair := ('x' || substr(v_hash, i * 2 + 1, 2))::bit(8)::int;
    v_sum  := v_sum + v_pair::float8 / (256::float8 ^ (i + 1));
  end loop;
  -- floor(sum * 52) then % 52: the modulo is redundant for sum < 1 but is in
  -- the original, and a port keeps the guard rather than reasoning it away.
  return public.hilo_deck() -> ((floor(v_sum * 52)::int) % 52);
end $$;

revoke execute on function public.pf_hilo_card(text, text, bigint, int) from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- The two chances, as PERCENTAGES, for the card now showing. Counted over the
-- deck itself rather than from 4-per-rank arithmetic: the deck is the authority
-- (see the duplicate-suit note above), and counting it cannot drift from it.
-- ---------------------------------------------------------------------------
create or replace function public.hilo_chances(p_rank_value int)
returns jsonb
language sql immutable
set search_path = public
as $$
  select jsonb_build_object(
    'hi_chance', (
      select count(*)::float8 * 100 / 52
        from jsonb_array_elements(public.hilo_deck()) c
       where case when p_rank_value = 1
                  then (c->>'rank_value')::int >  p_rank_value
                  else (c->>'rank_value')::int >= p_rank_value end),
    'lo_chance', (
      select count(*)::float8 * 100 / 52
        from jsonb_array_elements(public.hilo_deck()) c
       where case when p_rank_value = 13
                  then (c->>'rank_value')::int <  p_rank_value
                  else (c->>'rank_value')::int <= p_rank_value end)
  );
$$;

revoke execute on function public.hilo_chances(int) from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- Profit for each call, at a 1% house edge: stake * ((1/p) * 0.99) - stake.
-- The stake passed in is bet_amount + profit so far, which is what makes a
-- winning streak compound.
-- ---------------------------------------------------------------------------
create or replace function public.hilo_profit(p_stake numeric, p_hi_chance float8, p_lo_chance float8)
returns jsonb
language sql immutable
set search_path = public
as $$
  select jsonb_build_object(
    'hi_profit', case when p_hi_chance > 0
      then p_stake * ((1::float8 / (p_hi_chance / 100)) * (1 - 0.01)) - p_stake else 0 end,
    'lo_profit', case when p_lo_chance > 0
      then p_stake * ((1::float8 / (p_lo_chance / 100)) * (1 - 0.01)) - p_stake else 0 end
  );
$$;

revoke execute on function public.hilo_profit(numeric, float8, float8) from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- hilo_games — one row per round, like mines_games.
--
-- Nothing here is secret: the next card is not decided until it is dealt, so
-- unlike Mines there is no layout to hide. The table is still closed to the
-- client, because `profit` and `payout` are money and must only ever move
-- through the RPCs below.
-- ---------------------------------------------------------------------------
create table public.hilo_games (
  id          bigint generated always as identity primary key,
  game_id     text not null unique default encode(gen_random_bytes(9), 'hex'),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  bet_id      text not null references public.bets(bet_id),
  bet_amount  numeric(18,2) not null check (bet_amount > 0),
  currency    text not null default 'USDT',
  nonce       bigint not null,
  -- The seed pair is PINNED to the round, not read back from game_seeds each
  -- time. A player may rotate their seed at any moment; the original binds a
  -- game to the seed_id it started with, and re-reading the live row would
  -- deal the rest of the run from a different seed, leaving the finished game
  -- unverifiable against the seed it was played under.
  server_seed text not null,
  client_seed text not null,
  round       int not null default 0,
  -- Every card dealt so far, oldest first, each with the call that was made on
  -- it. The client redraws the whole run from this after a refresh.
  rounds      jsonb not null default '[]'::jsonb,
  hi_chance   float8 not null,
  lo_chance   float8 not null,
  /*
   * UNSCALED on purpose. The next round's stake is bet_amount + profit, so
   * rounding here compounds: at numeric(18,2) a 30-round run drifted 2.35 from
   * the original's doubles, always in the player's favour. Money is rounded
   * once, at settlement, by settle_bet.
   */
  profit      numeric not null default 0,
  /*
   * Unscaled, like profit above: it is 1 + profit/stake, so a scaled column
   * rounds a number derived from an unrounded one and the two stop agreeing.
   * Nothing is paid from this column - hilo_cashout recomputes the multiplier
   * - so the width costs nothing.
   */
  payout      numeric not null default 0.99,
  state       text not null default 'active' check (state in ('active','lost','cashed')),
  created_at  timestamptz not null default now(),
  ended_at    timestamptz
);

create unique index hilo_one_active_per_user on public.hilo_games (user_id) where state = 'active';
create index on public.hilo_games (user_id, created_at desc);

alter table public.hilo_games enable row level security;
revoke select, insert, update, delete on public.hilo_games from anon, authenticated;


-- Client-safe projection. Everything here is already known to the player.
create or replace function public.hilo_client_state(g public.hilo_games)
returns jsonb language sql stable set search_path = public as $$
  select jsonb_build_object(
    'game_id', g.game_id,
    'bet_amount', g.bet_amount,
    'currency', g.currency,
    'round', g.round,
    'rounds', g.rounds,
    'current_card', g.rounds -> -1,
    'hi_chance', g.hi_chance,
    'lo_chance', g.lo_chance,
    'profit', g.profit,
    'payout', g.payout,
    'state', g.state,
    -- What each call would add if it wins, from the CURRENT stake. The client
    -- shows these as the two multipliers on the buttons.
    'next', public.hilo_profit(g.bet_amount + g.profit, g.hi_chance, g.lo_chance),
    'potential_payout', round(g.bet_amount + g.profit, 2),
    -- Skip is refused from round 52 on, matching the original's guard.
    'can_skip', g.state = 'active' and g.round < 52
  );
$$;

revoke execute on function public.hilo_client_state(public.hilo_games) from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- hilo_start — deal the first card and debit the stake.
-- ---------------------------------------------------------------------------
create or replace function public.hilo_start(p_amount numeric, p_currency text default 'USDT')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_seed public.game_seeds;
  v_bet  public.bets;
  v_card jsonb;
  v_ch   jsonb;
  v_game public.hilo_games;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;

  if exists (select 1 from public.hilo_games where user_id = v_user and state = 'active') then
    raise exception 'active_game_exists';
  end if;

  insert into public.game_seeds (user_id, game, server_seed_hash)
  values (v_user, 'hilo', '') on conflict (user_id, game) do nothing;
  update public.game_seeds set nonce = game_seeds.nonce + 1
   where user_id = v_user and game = 'hilo'
  returning * into v_seed;

  -- Round 0 is the opening card, as in the original.
  v_card := public.pf_hilo_card(v_seed.server_seed, v_seed.client_seed, v_seed.nonce, 0);
  v_ch   := public.hilo_chances((v_card->>'rank_value')::int);

  v_bet := public.place_bet('hilo', p_amount, p_currency);

  insert into public.hilo_games (user_id, bet_id, bet_amount, currency, nonce, server_seed, client_seed, rounds, hi_chance, lo_chance)
  values (v_user, v_bet.bet_id, p_amount, p_currency, v_seed.nonce,
          v_seed.server_seed, v_seed.client_seed,
          jsonb_build_array(v_card),
          (v_ch->>'hi_chance')::float8, (v_ch->>'lo_chance')::float8)
  returning * into v_game;

  return public.hilo_client_state(v_game);
end $$;

revoke execute on function public.hilo_start(numeric, text) from public, anon;
grant  execute on function public.hilo_start(numeric, text) to  authenticated;


-- ---------------------------------------------------------------------------
-- hilo_choice — call the next card 'hi', 'lo', or 'skip'.
--
-- A win compounds: the profit for this call is worked out from the stake AS IT
-- STANDS (bet + profit so far) and the chances of the card that was showing
-- when the call was made — not the new one. Capped at 5000, as the original.
-- ---------------------------------------------------------------------------
create or replace function public.hilo_choice(p_game_id text, p_choice text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_game public.hilo_games;
  v_prev jsonb;
  v_next jsonb;
  v_prev_rv int;
  v_next_rv int;
  v_won  boolean;
  v_ch   jsonb;
  v_pf   jsonb;
  v_gain numeric;
  v_profit numeric;
  v_payout numeric;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if p_choice not in ('hi', 'lo', 'skip') then raise exception 'invalid_choice'; end if;

  select * into v_game from public.hilo_games
   where game_id = p_game_id and user_id = v_user for update;
  if v_game.id is null then raise exception 'game_not_found'; end if;
  if v_game.state <> 'active' then raise exception 'game_not_active'; end if;
  if p_choice = 'skip' and v_game.round >= 52 then raise exception 'skip_limit_reached'; end if;

  v_prev    := v_game.rounds -> -1;
  v_prev_rv := (v_prev->>'rank_value')::int;
  v_next    := public.pf_hilo_card(v_game.server_seed, v_game.client_seed, v_game.nonce, v_game.round + 1);
  v_next_rv := (v_next->>'rank_value')::int;

  -- Ties go to both sides, except off an Ace (hi is strict) or a King (lo is
  -- strict). Skip always survives.
  v_won := case p_choice
    when 'skip' then true
    when 'hi'   then case when v_prev_rv = 1  then v_next_rv >  v_prev_rv else v_next_rv >= v_prev_rv end
    when 'lo'   then case when v_prev_rv = 13 then v_next_rv <  v_prev_rv else v_next_rv <= v_prev_rv end
  end;

  if not v_won then
    update public.hilo_games
       set state = 'lost', ended_at = now(), profit = 0, payout = 0,
           round = round + 1,
           rounds = rounds || jsonb_build_array(
             v_next || jsonb_build_object('guess', p_choice, 'won', false,
                                          'hi_chance', v_game.hi_chance, 'lo_chance', v_game.lo_chance))
     where id = v_game.id returning * into v_game;

    perform public.settle_bet(v_game.bet_id, 0,
      jsonb_build_object('rounds', v_game.rounds, 'nonce', v_game.nonce, 'lost_on', p_choice));

    return public.hilo_client_state(v_game) || jsonb_build_object('won', false, 'card', v_next);
  end if;

  -- Survived. Skip banks nothing and moves the card on; hi/lo compound.
  if p_choice = 'skip' then
    v_profit := v_game.profit;
    v_payout := v_game.payout;
  else
    v_pf   := public.hilo_profit(v_game.bet_amount + v_game.profit, v_game.hi_chance, v_game.lo_chance);
    v_gain := (v_pf ->> (case when p_choice = 'hi' then 'hi_profit' else 'lo_profit' end))::numeric;
    v_profit := least(5000.0, v_game.profit + v_gain);
    v_payout := 1 + (v_game.profit + v_gain) / v_game.bet_amount;
  end if;

  v_ch := public.hilo_chances(v_next_rv);

  update public.hilo_games
     set round = round + 1,
         rounds = rounds || jsonb_build_array(
           v_next || jsonb_build_object('guess', p_choice, 'won', true,
                                        'hi_chance', v_game.hi_chance, 'lo_chance', v_game.lo_chance,
                                        'payout', v_payout)),
         hi_chance = (v_ch->>'hi_chance')::float8,
         lo_chance = (v_ch->>'lo_chance')::float8,
         profit = v_profit,
         payout = v_payout
   where id = v_game.id returning * into v_game;

  return public.hilo_client_state(v_game) || jsonb_build_object('won', true, 'card', v_next);
end $$;

revoke execute on function public.hilo_choice(text, text) from public, anon;
grant  execute on function public.hilo_choice(text, text) to  authenticated;


-- ---------------------------------------------------------------------------
-- hilo_cashout — bank the run.
--
-- Settled through settle_bet at 1 + profit/stake, so the stake returns with the
-- profit on top. A round with no winning call yet has nothing to bank and is
-- refused rather than silently returning the stake.
-- ---------------------------------------------------------------------------
create or replace function public.hilo_cashout(p_game_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_game public.hilo_games;
  v_mult numeric;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;

  select * into v_game from public.hilo_games
   where game_id = p_game_id and user_id = v_user for update;
  if v_game.id is null then raise exception 'game_not_found'; end if;
  if v_game.state <> 'active' then raise exception 'game_not_active'; end if;
  if v_game.profit <= 0 then raise exception 'nothing_to_cash_out'; end if;

  v_mult := 1 + v_game.profit / v_game.bet_amount;

  update public.hilo_games set state = 'cashed', ended_at = now(), payout = v_mult
   where id = v_game.id returning * into v_game;

  perform public.settle_bet(v_game.bet_id, v_mult,
    jsonb_build_object('rounds', v_game.rounds, 'nonce', v_game.nonce, 'cashed', true));

  return public.hilo_client_state(v_game) || jsonb_build_object('cashed', true);
end $$;

revoke execute on function public.hilo_cashout(text) from public, anon;
grant  execute on function public.hilo_cashout(text) to  authenticated;


-- ---------------------------------------------------------------------------
-- hilo_active_game — restore an in-progress round after a refresh.
-- ---------------------------------------------------------------------------
create or replace function public.hilo_active_game()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_user uuid := auth.uid(); v_game public.hilo_games;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  select * into v_game from public.hilo_games where user_id = v_user and state = 'active'
   order by created_at desc limit 1;
  if v_game.id is null then return null; end if;
  return public.hilo_client_state(v_game);
end $$;

revoke execute on function public.hilo_active_game() from public, anon;
grant  execute on function public.hilo_active_game() to  authenticated;
