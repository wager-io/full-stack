-- =============================================================================
-- 0021_keno.sql — Keno on Postgres.
--
-- Keno was reachable in the UI and had no backend at all: no RPC, no socket,
-- nothing. `place_bet` accepts 'keno' as a game name, which made it look
-- supported — that enum is just permissive. The Bet button had nowhere to go.
--
-- Shape follows the other instant games (0005): one call does everything,
-- settles immediately, and returns the proof. Nothing is stored mid-round
-- because there is no mid-round — unlike Mines or Hilo, Keno resolves in one
-- step, so there is no secret to keep between calls and no table to hold it.
--
-- 40 tiles, numbered 1..40. The player picks 1..10; the house draws 10. The
-- payout depends on how many picks are hit AND how many were made — hitting 3
-- of 3 is a different thing from hitting 3 of 10.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- The draw.
--
-- Same Fisher-Yates over a hash chain as pf_mines_grid, for the same reason:
-- one audited shuffle, so a player verifying a Keno round uses exactly the
-- technique they would use for Mines. The only differences are the pool (40,
-- not 25) and that it is 1-based — Keno tiles are labelled 1..40 and showing a
-- player "0" would be a tile that does not exist on the board.
-- ---------------------------------------------------------------------------
create or replace function public.pf_keno_draw(
  p_server_seed text, p_client_seed text, p_nonce bigint
)
returns int[]
language plpgsql
immutable
set search_path = public, extensions
as $$
declare
  v_pos  int[] := array(select generate_series(1, 40));
  v_cur  text  := encode(hmac(p_client_seed || ':' || p_nonce::text, p_server_seed, 'sha256'), 'hex');
  i int; j int; v_val bigint; v_tmp int;
begin
  for i in reverse 39 .. 1 loop
    v_val := (('x' || substr(v_cur, 1, 8))::bit(32)::bigint) & x'ffffffff'::bigint;
    v_cur := encode(digest(v_cur, 'sha256'), 'hex');   -- hash the hex string, as JS does
    j := (v_val % (i + 1))::int;
    v_tmp := v_pos[i + 1];
    v_pos[i + 1] := v_pos[j + 1];
    v_pos[j + 1] := v_tmp;
  end loop;
  -- Ten drawn, sorted — the board shows them in order, not draw order.
  return (select array(select v_pos[k] from generate_series(1, 10) k order by v_pos[k]));
end $$;

revoke execute on function public.pf_keno_draw(text, text, bigint) from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- The paytable.
--
-- A table rather than a CASE expression with sixty branches: this is the house
-- edge, and it should be something a person can SELECT and audit rather than
-- something they have to read a function body to work out. Same posture as
-- vip_tiers.
--
-- No client access at all — not even read. A player who can see the paytable
-- before choosing is fine; a player who can WRITE it owns the house edge, and
-- the cheapest way to guarantee the difference is to expose neither.
-- ---------------------------------------------------------------------------
create table if not exists public.keno_paytable (
  risk       text not null check (risk in ('classic','low','medium','high')),
  picks      int  not null check (picks between 1 and 10),
  hits       int  not null check (hits between 0 and 10),
  multiplier numeric(10,4) not null check (multiplier >= 0),
  primary key (risk, picks, hits),
  -- You cannot hit more than you picked. Without this a typo in a future
  -- paytable row could pay out for an outcome that can never occur, and
  -- nobody would notice because it never fires.
  constraint keno_hits_not_above_picks check (hits <= picks)
);

alter table public.keno_paytable enable row level security;
revoke select, insert, update, delete on public.keno_paytable from anon, authenticated;

-- Classic risk. Every unlisted (picks, hits) pays nothing, which is handled by
-- the lookup returning 0 rather than by listing dozens of zero rows.
insert into public.keno_paytable (risk, picks, hits, multiplier) values
  ('classic',  1, 1,  3.9600),
  ('classic',  2, 1,  1.9000), ('classic',  2, 2,  4.5000),
  ('classic',  3, 1,  1.0000), ('classic',  3, 2,  3.1000), ('classic',  3, 3, 10.4000),
  ('classic',  4, 1,  0.8000), ('classic',  4, 2,  1.8000), ('classic',  4, 3,  5.0000),
  ('classic',  4, 4, 22.5000),
  ('classic',  5, 1,  0.2500), ('classic',  5, 2,  1.4000), ('classic',  5, 3,  4.1000),
  ('classic',  5, 4, 16.5000), ('classic',  5, 5, 36.0000),
  ('classic',  6, 2,  1.0000), ('classic',  6, 3,  3.6800), ('classic',  6, 4,  7.0000),
  ('classic',  6, 5, 16.5000), ('classic',  6, 6, 40.0000),
  ('classic',  7, 2,  0.4700), ('classic',  7, 3,  3.0000), ('classic',  7, 4,  4.5000),
  ('classic',  7, 5, 14.0000), ('classic',  7, 6, 31.0000), ('classic',  7, 7, 60.0000),
  ('classic',  8, 3,  2.2000), ('classic',  8, 4,  4.0000), ('classic',  8, 5, 13.0000),
  ('classic',  8, 6, 22.0000), ('classic',  8, 7, 55.0000), ('classic',  8, 8, 70.0000),
  ('classic',  9, 3,  1.5500), ('classic',  9, 4,  3.0000), ('classic',  9, 5,  8.0000),
  ('classic',  9, 6, 15.0000), ('classic',  9, 7, 44.0000), ('classic',  9, 8, 60.0000),
  ('classic',  9, 9, 85.0000),
  ('classic', 10, 3,  1.4000), ('classic', 10, 4,  2.2500), ('classic', 10, 5,  4.5000),
  ('classic', 10, 6,  8.0000), ('classic', 10, 7, 17.0000), ('classic', 10, 8, 50.0000),
  ('classic', 10, 9, 80.0000), ('classic', 10, 10, 100.0000)
on conflict (risk, picks, hits) do nothing;


create or replace function public.keno_multiplier(p_risk text, p_picks int, p_hits int)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  -- Absent means zero. Listing every losing combination explicitly would be
  -- forty more rows that all say the same thing.
  select coalesce(
    (select multiplier from public.keno_paytable
      where risk = p_risk and picks = p_picks and hits = p_hits),
    0
  );
$$;

revoke execute on function public.keno_multiplier(text, int, int) from public, anon;
grant  execute on function public.keno_multiplier(text, int, int) to authenticated;


-- ---------------------------------------------------------------------------
-- keno_play — pick, draw, settle. One call.
--
-- The picks are validated hard before any money moves, and the reason is that
-- every one of these is a way to get paid for something you did not do:
--   * more than 10 picks -> more chances to hit against a paytable priced for 10
--   * a duplicate pick   -> one drawn number counted twice as two hits
--   * a number off-board -> a pick that can never be drawn, which is harmless,
--                           but it means `picks` no longer describes the bet
--                           the paytable is pricing
-- ---------------------------------------------------------------------------
create or replace function public.keno_play(
  p_amount   numeric,
  p_picks    int[],
  p_risk     text default 'classic',
  p_currency text default 'USDT'
)
returns table (
  bet_id text, drawn int[], picks int[], hits int[], hit_count int,
  multiplier numeric, payout numeric, nonce bigint, server_seed_hash text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user  uuid := auth.uid();
  v_seed  public.game_seeds;
  v_nonce bigint;
  v_drawn int[];
  v_hits  int[];
  v_n     int;
  v_mult  numeric;
  v_bet   public.bets;
  v_picks int[];
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if p_risk not in ('classic','low','medium','high') then raise exception 'invalid_risk'; end if;

  v_n := coalesce(array_length(p_picks, 1), 0);
  if v_n < 1 or v_n > 10 then raise exception 'invalid_pick_count'; end if;

  -- Sorted and de-duplicated in one step; the count is re-checked against the
  -- original so a duplicate is an ERROR rather than being quietly collapsed
  -- into a smaller bet the player did not place.
  v_picks := (select array(select distinct unnest(p_picks) order by 1));
  if coalesce(array_length(v_picks, 1), 0) <> v_n then raise exception 'duplicate_picks'; end if;
  if exists (select 1 from unnest(v_picks) x where x < 1 or x > 40) then
    raise exception 'pick_out_of_range';
  end if;

  -- Advance the nonce and read the active seed under one lock, as the other
  -- games do — the nonce is what makes two identical bets different rounds.
  insert into public.game_seeds (user_id, game, server_seed_hash)
  values (v_user, 'keno', '') on conflict (user_id, game) do nothing;
  update public.game_seeds set nonce = game_seeds.nonce + 1
   where user_id = v_user and game = 'keno'
  returning * into v_seed;
  v_nonce := v_seed.nonce;

  v_drawn := public.pf_keno_draw(v_seed.server_seed, v_seed.client_seed, v_nonce);
  v_hits  := (select array(select unnest(v_picks) intersect select unnest(v_drawn) order by 1));
  v_mult  := public.keno_multiplier(p_risk, v_n, coalesce(array_length(v_hits, 1), 0));

  -- Debit and settle through the shared wallet primitives. place_bet raises
  -- insufficient_balance and aborts the whole call, so a round is never
  -- recorded for a bet that could not be paid for.
  v_bet := public.place_bet('keno', p_amount, p_currency);
  perform public.settle_bet(
    v_bet.bet_id, v_mult,
    jsonb_build_object(
      'drawn', v_drawn, 'picks', v_picks, 'hits', v_hits,
      'hit_count', coalesce(array_length(v_hits, 1), 0),
      'risk', p_risk, 'nonce', v_nonce
    )
  );

  return query select v_bet.bet_id, v_drawn, v_picks, v_hits,
                      coalesce(array_length(v_hits, 1), 0), v_mult,
                      round(p_amount * v_mult, 2), v_nonce, v_seed.server_seed_hash;
end $$;

revoke execute on function public.keno_play(numeric, int[], text, text) from public, anon;
grant  execute on function public.keno_play(numeric, int[], text, text) to authenticated;
