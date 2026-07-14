-- =============================================================================
-- 0005_provably_fair_and_instant_games.sql  —  Phase 2: Dice + Limbo
--
-- Provably-fair engine + the two single-roll instant games. The RNG is ported
-- byte-for-byte from the old Node backend (games/dice/DiceGameLogic.js and
-- games/limbo/LimboGameLogic.js) so historical bets verify identically:
--
--   hash = HMAC_SHA512(server_seed, client_seed || ':' || nonce)
--   x    = first 8 hex chars of hash, as a uint32
--   dice roll  = x / 0xffffffff * 100        (2 dp)
--   limbo roll = max(1, 99 / ((x/0xffffffff) * 100))   (2 dp)
--
-- Money still only ever moves through place_bet()/settle_bet() from 0004.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- game_seeds — the active provably-fair seed pair, one row per (user, game).
--
-- Fully server-side: the live server_seed is the secret whose hash the player
-- was shown BEFORE betting; revealing it early would break the guarantee. So
-- clients never select this table. They read seed info through
-- game_seed_info() (which never returns the live server_seed) and rotate
-- through rotate_seed() (which reveals the OLD seed as it retires it).
-- ---------------------------------------------------------------------------
create table public.game_seeds (
  user_id              uuid not null references public.profiles(id) on delete cascade,
  game                 text not null,
  server_seed          text not null default encode(gen_random_bytes(32), 'hex'),
  server_seed_hash     text not null,
  client_seed          text not null default encode(gen_random_bytes(8), 'hex'),
  nonce                bigint not null default 0,
  previous_server_seed text,               -- revealed when a pair is rotated out
  created_at           timestamptz not null default now(),
  primary key (user_id, game)
);

alter table public.game_seeds enable row level security;
-- No client access at all; the RPCs below are the only doorway.
revoke select, insert, update, delete on public.game_seeds from anon, authenticated;

-- Keep the published hash consistent with the secret it commits to.
-- search_path includes `extensions` because Supabase installs pgcrypto there,
-- while a bare local `create extension` puts it in public. Listing both keeps
-- digest()/hmac()/gen_random_bytes() resolvable on either. (Missing schemas in
-- search_path are ignored, so this is safe where `extensions` does not exist.)
create or replace function public.game_seeds_set_hash()
returns trigger language plpgsql set search_path = public, extensions as $$
begin
  new.server_seed_hash := encode(digest(new.server_seed, 'sha256'), 'hex');
  return new;
end $$;

create trigger game_seeds_hash
  before insert or update of server_seed on public.game_seeds
  for each row execute function public.game_seeds_set_hash();

revoke execute on function public.game_seeds_set_hash() from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- The RNG primitive. Isolated so every game shares one audited implementation
-- and the parity test has a single target.
--
-- Returns the uint32 taken from the first 8 hex chars of the HMAC. Casting
-- bit(32) straight to bigint is signed (can go negative); masking with
-- x'ffffffff' forces the unsigned 0..4294967295 that `parseInt(hex,16)` gives.
-- ---------------------------------------------------------------------------
create or replace function public.pf_uint32(p_server_seed text, p_client_seed text, p_nonce bigint)
returns bigint
language sql immutable
set search_path = public, extensions
as $$
  select (('x' || substr(encode(hmac(p_client_seed || ':' || p_nonce::text, p_server_seed, 'sha512'), 'hex'), 1, 8))::bit(32)::bigint) & x'ffffffff'::bigint;
$$;

revoke execute on function public.pf_uint32(text, text, bigint) from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- Public seed info for the fairness UI. Never returns the live server_seed.
-- ---------------------------------------------------------------------------
create or replace function public.game_seed_info(p_game text)
returns table (server_seed_hash text, client_seed text, nonce bigint, previous_server_seed text)
language plpgsql
security definer
set search_path = public
as $$
declare v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'not_authenticated'; end if;

  -- Lazily create the seed pair on first look.
  insert into public.game_seeds (user_id, game, server_seed_hash)
  values (v_user, p_game, '')  -- hash filled by trigger
  on conflict (user_id, game) do nothing;

  return query
    select s.server_seed_hash, s.client_seed, s.nonce, s.previous_server_seed
      from public.game_seeds s
     where s.user_id = v_user and s.game = p_game;
end $$;

revoke execute on function public.game_seed_info(text) from public, anon;
grant  execute on function public.game_seed_info(text) to  authenticated;


-- ---------------------------------------------------------------------------
-- Rotate seeds: reveal the current server_seed, activate a fresh one, and set
-- a new client_seed. Returns the revealed seed so the player can verify past
-- bets against the hash they were shown.
-- ---------------------------------------------------------------------------
create or replace function public.rotate_seed(p_game text, p_new_client_seed text default null)
returns table (revealed_server_seed text, revealed_server_seed_hash text, new_server_seed_hash text, client_seed text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user uuid := auth.uid();
  v_old  public.game_seeds;
  v_new_seed text := encode(gen_random_bytes(32), 'hex');
begin
  if v_user is null then raise exception 'not_authenticated'; end if;

  insert into public.game_seeds (user_id, game, server_seed_hash)
  values (v_user, p_game, '') on conflict (user_id, game) do nothing;

  select * into v_old from public.game_seeds where user_id = v_user and game = p_game for update;

  update public.game_seeds
     set previous_server_seed = v_old.server_seed,
         server_seed          = v_new_seed,
         client_seed          = coalesce(nullif(p_new_client_seed, ''), encode(gen_random_bytes(8), 'hex')),
         nonce                = 0
   where user_id = v_user and game = p_game;

  return query
    select v_old.server_seed,
           v_old.server_seed_hash,
           encode(digest(v_new_seed, 'sha256'), 'hex'),
           s.client_seed
      from public.game_seeds s where s.user_id = v_user and s.game = p_game;
end $$;

revoke execute on function public.rotate_seed(text, text) from public, anon;
grant  execute on function public.rotate_seed(text, text) to  authenticated;


-- ---------------------------------------------------------------------------
-- DICE. Ported from DiceGameLogic.js.
-- ---------------------------------------------------------------------------
create or replace function public.dice_roll(
  p_amount numeric,
  p_target numeric,
  p_mode   text,
  p_currency text default 'USDT'
)
returns table (bet_id text, roll numeric, won boolean, multiplier numeric, payout numeric, nonce bigint, server_seed_hash text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user  uuid := auth.uid();
  v_seed  public.game_seeds;
  v_nonce bigint;
  v_x     bigint;
  v_roll  numeric;
  v_chance numeric;
  v_won   boolean;
  v_mult  numeric;
  v_bet   public.bets;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if p_mode not in ('over','under') then raise exception 'invalid_mode'; end if;
  if p_target < 2 or p_target > 98 then raise exception 'invalid_target'; end if;   -- matches old validateBet

  -- Advance the nonce and read the active seed under one lock.
  insert into public.game_seeds (user_id, game, server_seed_hash)
  values (v_user, 'dice', '') on conflict (user_id, game) do nothing;
  update public.game_seeds set nonce = game_seeds.nonce + 1
   where user_id = v_user and game = 'dice'
  returning * into v_seed;
  v_nonce := v_seed.nonce;

  v_x    := public.pf_uint32(v_seed.server_seed, v_seed.client_seed, v_nonce);
  v_roll := round((v_x::numeric / 4294967295.0) * 100, 2);

  v_chance := case when p_mode = 'over' then 100 - p_target else p_target end;
  v_won    := case when p_mode = 'over' then v_roll > p_target else v_roll < p_target end;
  v_mult   := case when v_won then round(99 / v_chance, 2) else 0 end;

  -- Debit + record via the shared wallet primitive, then settle.
  v_bet := public.place_bet('dice', p_amount, p_currency);
  perform public.settle_bet(
    v_bet.bet_id, v_mult,
    jsonb_build_object('roll', v_roll, 'target', p_target, 'mode', p_mode, 'nonce', v_nonce)
  );

  return query select v_bet.bet_id, v_roll, v_won, v_mult,
                      round(p_amount * v_mult, 2), v_nonce, v_seed.server_seed_hash;
end $$;

revoke execute on function public.dice_roll(numeric, numeric, text, text) from public, anon;
grant  execute on function public.dice_roll(numeric, numeric, text, text) to  authenticated;


-- ---------------------------------------------------------------------------
-- LIMBO. Ported from LimboGameLogic.js. `p_target` is the player's chosen
-- multiplier; they win if the generated multiplier clears it.
-- ---------------------------------------------------------------------------
create or replace function public.limbo_roll(
  p_amount numeric,
  p_target numeric,
  p_mode   text default 'over',
  p_currency text default 'USDT'
)
returns table (bet_id text, roll numeric, won boolean, multiplier numeric, payout numeric, nonce bigint, server_seed_hash text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user  uuid := auth.uid();
  v_seed  public.game_seeds;
  v_nonce bigint;
  v_x     bigint;
  v_result numeric;
  v_gen   numeric;
  v_chance numeric;
  v_won   boolean;
  v_mult  numeric;
  v_bet   public.bets;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if p_mode not in ('over','under') then raise exception 'invalid_mode'; end if;
  if p_target < 1.01 or p_target > 1000 then raise exception 'invalid_target'; end if;

  insert into public.game_seeds (user_id, game, server_seed_hash)
  values (v_user, 'limbo', '') on conflict (user_id, game) do nothing;
  update public.game_seeds set nonce = game_seeds.nonce + 1
   where user_id = v_user and game = 'limbo'
  returning * into v_seed;
  v_nonce := v_seed.nonce;

  v_x      := public.pf_uint32(v_seed.server_seed, v_seed.client_seed, v_nonce);
  v_result := v_x::numeric / 4294967295.0;
  v_gen    := greatest(1.00, round(99 / (v_result * 100), 2));

  -- calculateWinChance / calculatePayoutMultiplier, ported verbatim.
  v_chance := case when p_mode = 'over' then round(99 / p_target, 2)
                   else round((p_target - 1) / 99 * 100, 2) end;
  v_won    := case when p_mode = 'over' then v_gen > p_target else v_gen < p_target end;
  v_mult   := case when v_won then round(99 / v_chance, 2) else 0 end;

  v_bet := public.place_bet('limbo', p_amount, p_currency);
  perform public.settle_bet(
    v_bet.bet_id, v_mult,
    jsonb_build_object('roll', v_gen, 'target', p_target, 'mode', p_mode, 'nonce', v_nonce)
  );

  return query select v_bet.bet_id, v_gen, v_won, v_mult,
                      round(p_amount * v_mult, 2), v_nonce, v_seed.server_seed_hash;
end $$;

revoke execute on function public.limbo_roll(numeric, numeric, text, text) from public, anon;
grant  execute on function public.limbo_roll(numeric, numeric, text, text) to  authenticated;


-- ---------------------------------------------------------------------------
-- my_recent_bets — the caller's own recent bets for a game, with the per-game
-- outcome flattened out of the JSON so the history/table UIs read
-- bet.roll / bet.target / bet.won directly (their existing shape).
-- ---------------------------------------------------------------------------
create or replace function public.my_recent_bets(p_game text, p_limit int default 10)
returns table (
  bet_id text, game text, roll numeric, target numeric, won boolean,
  multiplier numeric, payout numeric, "betAmount" numeric, created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select b.bet_id, b.game,
         (b.outcome->>'roll')::numeric,
         (b.outcome->>'target')::numeric,
         b.state = 'won',
         b.multiplier, b.payout, b.bet_amount, b.created_at
    from public.bets b
   where b.user_id = auth.uid() and b.game = p_game and b.state <> 'pending'
   order by b.created_at desc
   limit greatest(1, least(p_limit, 50));
$$;

revoke execute on function public.my_recent_bets(text, int) from public, anon;
grant  execute on function public.my_recent_bets(text, int) to  authenticated;
