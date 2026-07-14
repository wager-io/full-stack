-- =============================================================================
-- 0007_mines.sql  —  Phase 3: Mines (first STATEFUL game)
--
-- Ported from controllers/games/mines/MinesGameInstance.js + payoutCalculator.js.
--
-- Unlike the instant games, a Mines round stays open across many tile clicks.
-- The old backend held that state in a per-user in-memory Map (lost on restart,
-- rebuilt from the DB on reconnect). Here the game IS a database row, so
-- surviving a refresh/disconnect is a property of the design, not a feature.
--
-- THE SECURITY CRUX: the mine layout is fixed when the game starts, but it must
-- NOT reach the browser until the game is over — otherwise a player sees where
-- the bombs are. So mines_games is never client-readable; the RPCs return only
-- a client-safe view (revealed tiles + multiplier), and expose the full grid
-- only once the game has ended.
--
-- Grid RNG (MMP-SHA256 hash-chain Fisher-Yates), ported byte-for-byte:
--   hash = HMAC_SHA256(server_seed, client_seed:nonce)
--   getRand(max): val = first 8 hex of current_hash as uint32; then
--                 current_hash = sha256(current_hash) ; return val % max
--   shuffle [0..24] high->low; first `mines_count` positions are mines.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Multiplier for `revealed` gems out of a `mines`-mine board. Ported from
-- payoutCalculator.calculateMultiplier (1% house edge, floored to 2 dp).
-- ---------------------------------------------------------------------------
create or replace function public.mines_multiplier(p_mines int, p_revealed int)
returns numeric
language plpgsql immutable
set search_path = public
as $$
declare v_mult float8 := 1.0; i int;
begin
  if p_revealed = 0 then return 1.0; end if;
  for i in 0 .. p_revealed - 1 loop
    v_mult := v_mult * ((25 - i)::float8 / ((25 - p_mines) - i)::float8);
  end loop;
  v_mult := v_mult * (1 - 0.01);                 -- 1% house edge
  return floor(v_mult * 100) / 100.0;            -- matches JS Math.floor
end $$;

revoke execute on function public.mines_multiplier(int, int) from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- Deterministic mine layout for a seed pair + nonce + mines count. Isolated so
-- the parity test has one target and the game logic stays readable.
-- ---------------------------------------------------------------------------
create or replace function public.pf_mines_grid(p_server_seed text, p_client_seed text, p_nonce bigint, p_mines int)
returns int[]
language plpgsql immutable
set search_path = public, extensions
as $$
declare
  v_pos  int[] := array(select generate_series(0, 24));
  v_hash text  := encode(hmac(p_client_seed || ':' || p_nonce::text, p_server_seed, 'sha256'), 'hex');
  v_cur  text  := v_hash;
  i int; j int; v_val bigint; v_tmp int;
begin
  -- Fisher-Yates, high index down to 1, hash-chained PRNG (see header).
  for i in reverse 24 .. 1 loop
    v_val := (('x' || substr(v_cur, 1, 8))::bit(32)::bigint) & x'ffffffff'::bigint;
    v_cur := encode(digest(v_cur, 'sha256'), 'hex');   -- hash the hex string, as JS does
    j := (v_val % (i + 1))::int;                         -- 0-based index into v_pos
    v_tmp := v_pos[i + 1];                               -- v_pos is 1-based in PG
    v_pos[i + 1] := v_pos[j + 1];
    v_pos[j + 1] := v_tmp;
  end loop;
  -- Return the first `p_mines` shuffled positions, sorted ascending — the same
  -- canonical layout the old getMinePositions() produced.
  return (select array(select v_pos[k] from generate_series(1, p_mines) k order by v_pos[k]));
end $$;

revoke execute on function public.pf_mines_grid(text, text, bigint, int) from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- mines_games — one row per round. mine_positions is the SECRET layout; the
-- table is never client-readable (RPCs gate every access).
-- ---------------------------------------------------------------------------
create table public.mines_games (
  id             bigint generated always as identity primary key,
  game_id        text not null unique default encode(gen_random_bytes(9), 'hex'),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  bet_id         text not null references public.bets(bet_id),
  bet_amount     numeric(18,2) not null,
  currency       text not null default 'USDT',
  mines_count    int not null check (mines_count between 1 and 24),
  mine_positions int[] not null,              -- SECRET until state <> 'active'
  revealed_tiles int[] not null default '{}',
  nonce          bigint not null,
  state          text not null default 'active' check (state in ('active','won','lost','cashed')),
  created_at     timestamptz not null default now(),
  ended_at       timestamptz
);

-- At most one active game per user (mirrors the old per-user engine Map).
create unique index mines_one_active_per_user on public.mines_games (user_id) where state = 'active';
create index on public.mines_games (user_id, created_at desc);

alter table public.mines_games enable row level security;
-- No direct client access whatsoever; the RPCs below are the only doorway, so
-- mine_positions can never leak to an active player.
revoke select, insert, update, delete on public.mines_games from anon, authenticated;


-- Client-safe projection of a game: never includes mine_positions while active.
create or replace function public.mines_client_state(g public.mines_games)
returns jsonb language sql immutable set search_path = public as $$
  select jsonb_build_object(
    'game_id', g.game_id,
    'bet_amount', g.bet_amount,
    'currency', g.currency,
    'mines_count', g.mines_count,
    'revealed_tiles', g.revealed_tiles,
    'revealed_count', coalesce(array_length(g.revealed_tiles, 1), 0),
    'state', g.state,
    'current_multiplier', public.mines_multiplier(g.mines_count, coalesce(array_length(g.revealed_tiles, 1), 0)),
    -- next_multiplier is only meaningful while there is a safe tile left to
    -- reveal; beyond that it would divide by zero (0 gems remaining).
    'next_multiplier', case
      when g.state = 'active'
       and coalesce(array_length(g.revealed_tiles, 1), 0) < (25 - g.mines_count)
      then public.mines_multiplier(g.mines_count, coalesce(array_length(g.revealed_tiles, 1), 0) + 1)
      else null end,
    'potential_payout', round(g.bet_amount * public.mines_multiplier(g.mines_count, coalesce(array_length(g.revealed_tiles, 1), 0)), 2),
    -- The grid is revealed ONLY once the game is over.
    'mine_positions', case when g.state <> 'active' then to_jsonb(g.mine_positions) else null end
  );
$$;

revoke execute on function public.mines_client_state(public.mines_games) from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- mines_start — open a round: debit via place_bet, fix the layout, return the
-- client-safe state (no mine positions).
-- ---------------------------------------------------------------------------
create or replace function public.mines_start(p_amount numeric, p_mines int, p_currency text default 'USDT')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_seed public.game_seeds;
  v_bet  public.bets;
  v_grid int[];
  v_game public.mines_games;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if p_mines < 1 or p_mines > 24 then raise exception 'invalid_mines_count'; end if;

  if exists (select 1 from public.mines_games where user_id = v_user and state = 'active') then
    raise exception 'active_game_exists';       -- must finish/cash the current one first
  end if;

  insert into public.game_seeds (user_id, game, server_seed_hash)
  values (v_user, 'mines', '') on conflict (user_id, game) do nothing;
  update public.game_seeds set nonce = game_seeds.nonce + 1
   where user_id = v_user and game = 'mines'
  returning * into v_seed;

  v_grid := public.pf_mines_grid(v_seed.server_seed, v_seed.client_seed, v_seed.nonce, p_mines);

  -- Debit the stake now; the bet stays 'pending' for the life of the round.
  v_bet := public.place_bet('mines', p_amount, p_currency);

  insert into public.mines_games (user_id, bet_id, bet_amount, currency, mines_count, mine_positions, nonce)
  values (v_user, v_bet.bet_id, p_amount, p_currency, p_mines, v_grid, v_seed.nonce)
  returning * into v_game;

  return public.mines_client_state(v_game);
end $$;

revoke execute on function public.mines_start(numeric, int, text) from public, anon;
grant  execute on function public.mines_start(numeric, int, text) to  authenticated;


-- ---------------------------------------------------------------------------
-- mines_reveal — reveal one tile. Hit a mine -> lose (settle 0). Clear the last
-- gem -> auto-win (settle at final multiplier). Otherwise stay active.
-- ---------------------------------------------------------------------------
create or replace function public.mines_reveal(p_game_id text, p_position int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_game public.mines_games;
  v_is_mine boolean;
  v_revealed int;
  v_total_gems int;
  v_mult numeric;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if p_position < 0 or p_position > 24 then raise exception 'invalid_position'; end if;

  select * into v_game from public.mines_games
   where game_id = p_game_id and user_id = v_user for update;   -- own game only + lock
  if v_game.id is null then raise exception 'game_not_found'; end if;
  if v_game.state <> 'active' then raise exception 'game_not_active'; end if;
  if v_game.revealed_tiles @> array[p_position] then raise exception 'tile_already_revealed'; end if;

  v_is_mine := v_game.mine_positions @> array[p_position];

  if v_is_mine then
    update public.mines_games
       set revealed_tiles = revealed_tiles || p_position, state = 'lost', ended_at = now()
     where id = v_game.id returning * into v_game;
    perform public.settle_bet(v_game.bet_id, 0,
      jsonb_build_object('mines', v_game.mines_count, 'revealed', v_game.revealed_tiles,
                         'mine_positions', v_game.mine_positions, 'hit', p_position, 'nonce', v_game.nonce));
    return public.mines_client_state(v_game) || jsonb_build_object('hit_mine', true, 'position', p_position);
  end if;

  -- Gem.
  update public.mines_games
     set revealed_tiles = revealed_tiles || p_position
   where id = v_game.id returning * into v_game;

  v_revealed   := coalesce(array_length(v_game.revealed_tiles, 1), 0);
  v_total_gems := 25 - v_game.mines_count;

  if v_revealed = v_total_gems then
    -- Board cleared: auto-win at the final multiplier.
    v_mult := public.mines_multiplier(v_game.mines_count, v_revealed);
    update public.mines_games set state = 'won', ended_at = now() where id = v_game.id returning * into v_game;
    perform public.settle_bet(v_game.bet_id, v_mult,
      jsonb_build_object('mines', v_game.mines_count, 'revealed', v_game.revealed_tiles,
                         'mine_positions', v_game.mine_positions, 'nonce', v_game.nonce));
  end if;

  return public.mines_client_state(v_game) || jsonb_build_object('hit_mine', false, 'position', p_position);
end $$;

revoke execute on function public.mines_reveal(text, int) from public, anon;
grant  execute on function public.mines_reveal(text, int) to  authenticated;


-- ---------------------------------------------------------------------------
-- mines_cashout — bank the current multiplier and end the round.
-- ---------------------------------------------------------------------------
create or replace function public.mines_cashout(p_game_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_game public.mines_games;
  v_revealed int;
  v_mult numeric;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;

  select * into v_game from public.mines_games
   where game_id = p_game_id and user_id = v_user for update;
  if v_game.id is null then raise exception 'game_not_found'; end if;
  if v_game.state <> 'active' then raise exception 'game_not_active'; end if;

  v_revealed := coalesce(array_length(v_game.revealed_tiles, 1), 0);
  if v_revealed = 0 then raise exception 'nothing_revealed'; end if;   -- can't cash a fresh board

  v_mult := public.mines_multiplier(v_game.mines_count, v_revealed);
  update public.mines_games set state = 'cashed', ended_at = now() where id = v_game.id returning * into v_game;
  perform public.settle_bet(v_game.bet_id, v_mult,
    jsonb_build_object('mines', v_game.mines_count, 'revealed', v_game.revealed_tiles,
                       'mine_positions', v_game.mine_positions, 'cashed', true, 'nonce', v_game.nonce));

  return public.mines_client_state(v_game) || jsonb_build_object('cashed', true);
end $$;

revoke execute on function public.mines_cashout(text) from public, anon;
grant  execute on function public.mines_cashout(text) to  authenticated;


-- ---------------------------------------------------------------------------
-- mines_active_game — restore the in-progress round after a refresh/reconnect.
-- Returns null when there is none. This is what makes the game survive a
-- page reload with no extra client work.
-- ---------------------------------------------------------------------------
create or replace function public.mines_active_game()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_user uuid := auth.uid(); v_game public.mines_games;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  select * into v_game from public.mines_games where user_id = v_user and state = 'active'
   order by created_at desc limit 1;
  if v_game.id is null then return null; end if;
  return public.mines_client_state(v_game);
end $$;

revoke execute on function public.mines_active_game() from public, anon;
grant  execute on function public.mines_active_game() to  authenticated;
