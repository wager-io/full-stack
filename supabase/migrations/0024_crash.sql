-- =============================================================================
-- 0024_crash.sql  —  Crash
--
-- There is no long-running server. A round is fully described by timestamps:
-- betting closes at betting_ends_at; the multiplier t ms after that is
-- exp(6e-5 * t); the round crashes at
--     crash_at = betting_ends_at + ln(crash_point) / 6e-5   ms.
-- crash_tick() advances the state machine from the clock and is idempotent. It
-- is run every second by pg_cron (hosted) and by every crash_state() call.
-- Cash-outs are priced from the server clock, so a client can never cash out
-- late.
--
-- Crash point (ported from stake-cloneBackend/controllers/games/crash/utils.js):
--   r = first 13 hex chars of HMAC_SHA256(key = salt utf8, msg = hex-decoded hash)
--   X = r / 2^52, rounded to 9 significant digits;  cp = max(1, floor(99/(1-X))/100)
--
-- Money only ever moves through place_bet()/settle_bet() from 0004.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- pf_crash_point — the crash point for a (hash, salt) pair.
--
-- X is computed exactly: r / 2^52 == r * 5^52 / 10^52, so numeric round() sees
-- the same exact value JS toPrecision(9) does (both round half up on the exact
-- binary value). 99/(1-X) and floor() are done in float8 to match JS doubles.
-- ---------------------------------------------------------------------------
create or replace function public.pf_crash_point(p_hash text, p_salt text)
returns numeric
language plpgsql immutable
set search_path = public, extensions
as $$
declare
  v_hex text := encode(hmac(decode(p_hash, 'hex'), convert_to(p_salt, 'UTF8'), 'sha256'), 'hex');
  v_r   bigint := (('x' || substr(v_hex, 1, 13))::bit(52))::bigint;
  v_x   numeric := (v_r::numeric * (5::numeric ^ 52)) / (10::numeric ^ 52);   -- exact
  v_xf  float8;
  v_fl  float8;
begin
  if v_x > 0 then
    v_x := round(v_x, 8 - floor(log(v_x))::int);      -- 9 significant digits
  end if;
  v_xf := v_x::float8;
  if v_xf >= 1 then
    return 9999999999.99;                              -- JS would give Infinity; unreachable in practice (p ~ 5e-10)
  end if;
  v_fl := floor(99::float8 / (1::float8 - v_xf));
  return greatest(1::numeric, v_fl::numeric / 100)::numeric(12,2);
end $$;

revoke execute on function public.pf_crash_point(text, text) from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.crash_settings (
  id          boolean primary key default true check (id),
  salt        text not null,                         -- public: needed to verify rounds
  max_profit  numeric(18,2) not null default 10000,
  betting_ms  int not null default 5000,
  cooldown_ms int not null default 3000
);
insert into public.crash_settings (salt) values ('');      -- set by crash_init_chain

alter table public.crash_settings enable row level security;
create policy crash_settings_select_all on public.crash_settings for select using (true);
revoke all on public.crash_settings from anon, authenticated;
grant select on public.crash_settings to anon, authenticated;


create table public.crash_hashes (
  idx   bigint primary key,
  hash  text not null,
  used  boolean not null default false
);
alter table public.crash_hashes enable row level security;
-- Rounds take the highest unused idx; without this the scan walks every used row first.
create index crash_hashes_unused_idx on public.crash_hashes (idx desc) where not used;
revoke all on public.crash_hashes from anon, authenticated;


create table public.crash_rounds (
  id              bigint generated always as identity primary key,
  phase           text not null check (phase in ('betting','running','crashed')),
  betting_ends_at timestamptz not null,
  crash_point     numeric(12,2),                     -- NULL until phase = 'crashed'
  hash            text,                              -- NULL until phase = 'crashed'
  crashed_at      timestamptz,
  created_at      timestamptz not null default now()
);
create index on public.crash_rounds (phase, id desc);
alter table public.crash_rounds enable row level security;
create policy crash_rounds_select_all on public.crash_rounds for select using (true);
revoke all on public.crash_rounds from anon, authenticated;
grant select on public.crash_rounds to anon, authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.crash_rounds;
  end if;
end $$;


create table public.crash_round_secrets (
  round_id    bigint primary key references public.crash_rounds(id) on delete cascade,
  hash_idx    bigint not null,
  hash        text not null,
  crash_point numeric(12,2) not null,
  crash_at    timestamptz not null
);
alter table public.crash_round_secrets enable row level security;
revoke all on public.crash_round_secrets from anon, authenticated;


-- Holds user_id, so no client access: players are exposed only via crash_state().
create table public.crash_bets (
  id                 bigint generated always as identity primary key,
  round_id           bigint not null references public.crash_rounds(id) on delete cascade,
  user_id            uuid not null references public.profiles(id) on delete cascade,
  bet_id             text not null unique references public.bets(bet_id),
  display_name       text,                           -- copied from bets: hidden profiles stay hidden
  avatar_url         text,
  amount             numeric(18,2) not null,
  currency           text not null,
  auto_cashout       numeric(12,2),
  cap_multiplier     numeric(12,2) not null,
  cashout_multiplier numeric(12,2),
  payout             numeric(18,2),
  state              text not null default 'active' check (state in ('active','cashed','lost')),
  created_at         timestamptz not null default now(),
  unique (round_id, user_id)
);
create index on public.crash_bets (round_id, state);
alter table public.crash_bets enable row level security;
revoke all on public.crash_bets from anon, authenticated;


-- ---------------------------------------------------------------------------
-- crash_init_chain — build the hash chain. Operator only.
-- Rounds consume the HIGHEST unused idx first, so each revealed hash, sha256'd,
-- equals the hash revealed in the round before it.
-- ---------------------------------------------------------------------------
create or replace function public.crash_init_chain(p_count int, p_salt text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_h    text;
  v_base bigint;
  i      int;
begin
  if p_count is null or p_count < 1 then raise exception 'invalid_count'; end if;
  if p_salt is null or p_salt = '' then raise exception 'invalid_salt'; end if;
  if exists (select 1 from public.crash_hashes where not used) then
    raise exception 'chain_not_exhausted';
  end if;

  select coalesce(max(idx), 0) into v_base from public.crash_hashes;
  v_h := encode(gen_random_bytes(32), 'hex');
  for i in 1 .. p_count loop
    insert into public.crash_hashes (idx, hash) values (v_base + i, v_h);
    v_h := encode(digest(v_h, 'sha256'), 'hex');      -- hash of the hex STRING, as the old generator did
  end loop;

  update public.crash_settings set salt = p_salt;
end $$;

revoke execute on function public.crash_init_chain(int, text) from public, anon, authenticated;
grant  execute on function public.crash_init_chain(int, text) to service_role;


-- ---------------------------------------------------------------------------
-- crash_tick — advance the state machine from the clock. Idempotent.
-- ---------------------------------------------------------------------------
create or replace function public.crash_tick()
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_now   timestamptz;
  v_set   public.crash_settings;
  v_round public.crash_rounds;
  v_sec   public.crash_round_secrets;
  v_hash  public.crash_hashes;
  v_cp    numeric;
  v_bea   timestamptz;
  v_id    bigint;
  v_eff   numeric;
  r       record;
  v_bet   public.bets;
begin
  if not pg_try_advisory_xact_lock(hashtext('crash_tick')) then
    return;
  end if;
  v_now := clock_timestamp();
  select * into v_set from public.crash_settings;

  loop
    select * into v_round from public.crash_rounds order by id desc limit 1 for update;

    if v_round.id is null
       or (v_round.phase = 'crashed'
           and v_now >= v_round.crashed_at + v_set.cooldown_ms * interval '1 millisecond') then
      -- New round from the highest unused hash.
      select * into v_hash from public.crash_hashes where not used order by idx desc limit 1 for update;
      if v_hash.idx is null then
        raise warning 'crash_chain_exhausted';
        return;
      end if;
      update public.crash_hashes set used = true where idx = v_hash.idx;
      v_cp  := public.pf_crash_point(v_hash.hash, v_set.salt);
      v_bea := v_now + v_set.betting_ms * interval '1 millisecond';
      insert into public.crash_rounds (phase, betting_ends_at) values ('betting', v_bea)
        returning id into v_id;
      insert into public.crash_round_secrets (round_id, hash_idx, hash, crash_point, crash_at)
        values (v_id, v_hash.idx, v_hash.hash, v_cp,
                v_bea + (ln(v_cp) / 0.00006) * interval '1 millisecond');

    elsif v_round.phase = 'betting' and v_now >= v_round.betting_ends_at then
      update public.crash_rounds set phase = 'running' where id = v_round.id;

    elsif v_round.phase = 'running' then
      select * into v_sec from public.crash_round_secrets where round_id = v_round.id;
      exit when v_now < v_sec.crash_at;

      for r in select * from public.crash_bets
                where round_id = v_round.id and state = 'active'
                order by id for update
      loop
        v_eff := least(coalesce(r.auto_cashout, r.cap_multiplier), r.cap_multiplier);
        if v_eff <= v_sec.crash_point then
          v_bet := public.settle_bet(r.bet_id, v_eff);
          update public.crash_bets
             set state = 'cashed', cashout_multiplier = v_eff, payout = v_bet.payout
           where id = r.id;
        else
          v_bet := public.settle_bet(r.bet_id, 0);
          update public.crash_bets set state = 'lost', payout = 0 where id = r.id;
        end if;
      end loop;

      update public.crash_rounds
         set phase = 'crashed', crashed_at = v_sec.crash_at,
             crash_point = v_sec.crash_point, hash = v_sec.hash
       where id = v_round.id;

    else
      exit;
    end if;
  end loop;
end $$;

revoke execute on function public.crash_tick() from public, anon, authenticated;
grant  execute on function public.crash_tick() to service_role;


-- ---------------------------------------------------------------------------
-- crash_bet — join the current round (betting phase only).
-- ---------------------------------------------------------------------------
create or replace function public.crash_bet(
  p_amount        numeric,
  p_auto_cashout  numeric default null,
  p_currency      text default 'USDT'
)
returns table (round_id bigint, bet_id text, cap_multiplier numeric)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_user  uuid := auth.uid();
  v_round public.crash_rounds;
  v_set   public.crash_settings;
  v_bet   public.bets;
  v_cap   numeric;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if p_auto_cashout is not null
     and (p_auto_cashout = 'NaN'::numeric
          or p_auto_cashout < 1.01 or p_auto_cashout > 1000000
          or p_auto_cashout <> round(p_auto_cashout, 2)) then
    raise exception 'invalid_auto_cashout';
  end if;

  select * into v_round from public.crash_rounds order by id desc limit 1 for share;
  if v_round.id is null or v_round.phase <> 'betting' or clock_timestamp() >= v_round.betting_ends_at then
    raise exception 'round_closed';
  end if;
  if exists (select 1 from public.crash_bets cb where cb.round_id = v_round.id and cb.user_id = v_user) then
    raise exception 'already_bet';
  end if;

  v_bet := public.place_bet('crash', p_amount, p_currency);

  select * into v_set from public.crash_settings;
  v_cap := floor((1 + v_set.max_profit / p_amount) * 100) / 100;

  insert into public.crash_bets
    (round_id, user_id, bet_id, display_name, avatar_url, amount, currency, auto_cashout, cap_multiplier)
  values
    (v_round.id, v_user, v_bet.bet_id, v_bet.display_name, v_bet.avatar_url,
     v_bet.bet_amount, v_bet.currency, p_auto_cashout, v_cap);

  return query select v_round.id, v_bet.bet_id, v_cap;
end $$;

revoke execute on function public.crash_bet(numeric, numeric, text) from public, anon;
grant  execute on function public.crash_bet(numeric, numeric, text) to authenticated;


-- ---------------------------------------------------------------------------
-- crash_cashout — priced from the server clock. Decisions are made from
-- timestamps, not from `phase` (the tick may lag).
-- ---------------------------------------------------------------------------
create or replace function public.crash_cashout()
returns table (multiplier numeric, payout numeric)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_user  uuid := auth.uid();
  v_round public.crash_rounds;
  v_cb    public.crash_bets;
  v_sec   public.crash_round_secrets;
  v_now   timestamptz;
  v_rate  numeric;
  v_mult  numeric;
  v_bet   public.bets;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;

  select * into v_round from public.crash_rounds order by id desc limit 1;
  select * into v_cb from public.crash_bets cb
   where cb.round_id = v_round.id and cb.user_id = v_user and cb.state = 'active'
   for update;
  if v_cb.id is null then raise exception 'no_active_bet'; end if;

  v_now := clock_timestamp();
  select * into v_sec from public.crash_round_secrets where round_id = v_round.id;
  if v_now < v_round.betting_ends_at then raise exception 'not_running'; end if;
  if v_now >= v_sec.crash_at then raise exception 'crashed'; end if;

  v_rate := floor(exp(0.00006::float8 * (extract(epoch from (v_now - v_round.betting_ends_at)) * 1000)::float8) * 100)::numeric / 100;
  v_mult := least(v_rate, coalesce(v_cb.auto_cashout, v_rate), v_cb.cap_multiplier);

  v_bet := public.settle_bet(v_cb.bet_id, v_mult);
  update public.crash_bets
     set state = 'cashed', cashout_multiplier = v_mult, payout = v_bet.payout
   where id = v_cb.id;

  return query select v_mult, v_bet.payout;
end $$;

revoke execute on function public.crash_cashout() from public, anon;
grant  execute on function public.crash_cashout() to authenticated;


-- ---------------------------------------------------------------------------
-- crash_state — everything the client renders, in one call.
-- ---------------------------------------------------------------------------
create or replace function public.crash_state()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user  uuid := auth.uid();
  v_set   public.crash_settings;
  v_round public.crash_rounds;
  v_players jsonb;
  v_my      jsonb;
  v_hist    jsonb;
begin
  perform public.crash_tick();

  select * into v_set from public.crash_settings;
  select * into v_round from public.crash_rounds order by id desc limit 1;

  select coalesce(jsonb_agg(jsonb_build_object(
           'display_name', cb.display_name, 'avatar_url', cb.avatar_url,
           'amount', cb.amount, 'currency', cb.currency,
           'cashout_multiplier', case when cb.state = 'cashed' then cb.cashout_multiplier end,
           'state', cb.state) order by cb.id), '[]'::jsonb)
    into v_players
    from public.crash_bets cb where cb.round_id = v_round.id;

  select jsonb_build_object(
           'bet_id', cb.bet_id, 'amount', cb.amount, 'auto_cashout', cb.auto_cashout,
           'cap_multiplier', cb.cap_multiplier, 'cashout_multiplier', cb.cashout_multiplier,
           'payout', cb.payout, 'state', cb.state)
    into v_my
    from public.crash_bets cb
   where v_user is not null and cb.round_id = v_round.id and cb.user_id = v_user;

  select coalesce(jsonb_agg(jsonb_build_object(
           'id', h.id, 'crash_point', h.crash_point, 'hash', h.hash, 'crashed_at', h.crashed_at)
           order by h.id desc), '[]'::jsonb)
    into v_hist
    from (select * from public.crash_rounds where phase = 'crashed' order by id desc limit 15) h;

  return jsonb_build_object(
    'server_now', clock_timestamp(),
    'max_profit', v_set.max_profit,
    'betting_ms', v_set.betting_ms,
    'round', case when v_round.id is null then null else jsonb_build_object(
        'id', v_round.id, 'phase', v_round.phase, 'betting_ends_at', v_round.betting_ends_at,
        'crash_point', v_round.crash_point, 'hash', v_round.hash, 'crashed_at', v_round.crashed_at) end,
    'players', v_players,
    'my_bet', v_my,
    'history', v_hist);
end $$;

revoke execute on function public.crash_state() from public;
grant  execute on function public.crash_state() to anon, authenticated;


-- ---------------------------------------------------------------------------
-- Ticker. On hosted Supabase pg_cron must be enabled BEFORE this migration, or
-- the schedule below must be run by hand afterwards. Without it rounds still
-- advance whenever anyone calls crash_state(), but not while nobody is looking.
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('crash-tick', '1 seconds', 'select public.crash_tick()');
  end if;
end $$;
