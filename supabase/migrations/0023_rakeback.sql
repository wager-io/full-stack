-- =============================================================================
-- 0023_rakeback.sql — rakeback, Stake policy.
--
-- "For every play you make, you receive 3.5% of the edge back", unlocked at
-- Bronze.
--
--   * Every wager by a player whose VIP tier is Bronze or above accrues
--       bet_amount * game_edge * rate        (rate 0.035), win or lose.
--   * The tier that counts is the one held WHEN THE BET IS PLACED. place_bet
--     inserts the bet and only then runs vip_recalc, so the bet that carries a
--     player across into Bronze does not itself earn. That is intended.
--   * Accrual is continuous; the player claims whenever they like. A claim pays
--     whole cents and the sub-cent remainder stays accrued.
--   * Same rate for every tier (min_tier is the only gate).
--
-- Money path: the claim credits through adjust_balance (the only balance
-- writer), writes a 'rakeback' bills row, and posts a TREASURY -> PLAYER ledger
-- pair of type ADJUSTMENT, same as any other house-funded credit.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Config. Single-row settings and a per-game edge table. Readable by clients
-- (the UI shows the rate), writable by nobody but a migration.
-- ---------------------------------------------------------------------------
create table if not exists public.rakeback_settings (
  id       boolean primary key default true check (id),
  rate     numeric(6,4) not null default 0.035,
  min_tier text not null default 'Bronze'
);
insert into public.rakeback_settings (id) values (true) on conflict do nothing;

create table if not exists public.rakeback_game_edge (
  game text primary key,
  edge numeric(6,4) not null check (edge >= 0 and edge < 0.2)
);
insert into public.rakeback_game_edge (game, edge) values
  ('dice',   0.01),
  ('limbo',  0.01),
  ('plinko', 0.01),
  ('mines',  0.01),
  ('hilo',   0.01),
  ('keno',   0.01),
  ('crash',  0.01)
on conflict do nothing;

alter table public.rakeback_settings  enable row level security;
alter table public.rakeback_game_edge enable row level security;
revoke insert, update, delete on public.rakeback_settings  from anon, authenticated;
revoke insert, update, delete on public.rakeback_game_edge from anon, authenticated;
grant  select on public.rakeback_settings  to anon, authenticated;
grant  select on public.rakeback_game_edge to anon, authenticated;
create policy rakeback_settings_select  on public.rakeback_settings  for select to anon, authenticated using (true);
create policy rakeback_game_edge_select on public.rakeback_game_edge for select to anon, authenticated using (true);

-- ---------------------------------------------------------------------------
-- Per-player state.
-- ---------------------------------------------------------------------------
create table if not exists public.rakeback_accounts (
  user_id          uuid primary key references public.profiles(id) on delete cascade,
  accrued          numeric(20,8) not null default 0 check (accrued >= 0),
  lifetime_accrued numeric(20,8) not null default 0,
  lifetime_claimed numeric(18,2) not null default 0,
  updated_at       timestamptz not null default now()
);

create table if not exists public.rakeback_claims (
  id         bigint generated always as identity primary key,
  claim_id   text not null unique default encode(gen_random_bytes(9), 'hex'),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  amount     numeric(18,2) not null check (amount > 0),
  created_at timestamptz not null default now()
);
create index if not exists rakeback_claims_user_idx on public.rakeback_claims (user_id, created_at desc);

alter table public.rakeback_accounts enable row level security;
alter table public.rakeback_claims   enable row level security;
revoke select, insert, update, delete on public.rakeback_accounts from anon, authenticated;
revoke select, insert, update, delete on public.rakeback_claims   from anon, authenticated;
grant  select on public.rakeback_accounts to authenticated;
grant  select on public.rakeback_claims   to authenticated;
create policy rakeback_accounts_select on public.rakeback_accounts
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy rakeback_claims_select on public.rakeback_claims
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- Accrual. AFTER INSERT on bets. Must never raise: an unknown game, a missing
-- vip_progress row, missing settings — all simply accrue nothing. Raising here
-- would block betting.
-- ---------------------------------------------------------------------------
create or replace function public.rakeback_accrue()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_amount numeric;
begin
  select new.bet_amount * e.edge * s.rate
    into v_amount
    from public.rakeback_settings s
    join public.rakeback_game_edge e on e.game = new.game
    join public.vip_progress vp      on vp.user_id = new.user_id
    join public.vip_tiers cur        on cur.name = vp.current_tier
    join public.vip_tiers mn         on mn.name = s.min_tier
   where cur.level >= mn.level
   limit 1;

  if v_amount is null or v_amount <= 0 then
    return new;
  end if;

  insert into public.rakeback_accounts (user_id, accrued, lifetime_accrued)
  values (new.user_id, v_amount, v_amount)
  on conflict (user_id) do update
     set accrued          = public.rakeback_accounts.accrued + excluded.accrued,
         lifetime_accrued = public.rakeback_accounts.lifetime_accrued + excluded.lifetime_accrued,
         updated_at       = now();
  return new;
end $$;

revoke execute on function public.rakeback_accrue() from public, anon, authenticated;

drop trigger if exists rakeback_accrue_trg on public.bets;
create trigger rakeback_accrue_trg
  after insert on public.bets
  for each row execute function public.rakeback_accrue();

-- ---------------------------------------------------------------------------
-- rakeback_status()
-- ---------------------------------------------------------------------------
create or replace function public.rakeback_status()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user     uuid := auth.uid();
  v_set      public.rakeback_settings;
  v_tier     text;
  v_eligible boolean;
  v_accrued  numeric;
  v_claimed  numeric;
begin
  if v_user is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_set from public.rakeback_settings where id;
  select vp.current_tier into v_tier from public.vip_progress vp where vp.user_id = v_user;

  select coalesce((select cur.level >= mn.level
                     from public.vip_tiers cur, public.vip_tiers mn
                    where cur.name = v_tier and mn.name = v_set.min_tier), false)
    into v_eligible;

  select ra.accrued, ra.lifetime_claimed into v_accrued, v_claimed
    from public.rakeback_accounts ra where ra.user_id = v_user;

  return jsonb_build_object(
    'eligible',         v_eligible,
    'tier',             coalesce(v_tier, 'None'),
    'min_tier',         v_set.min_tier,
    'rate',             v_set.rate,
    'accrued',          coalesce(v_accrued, 0),
    'claimable',        floor(coalesce(v_accrued, 0) * 100) / 100,
    'lifetime_claimed', coalesce(v_claimed, 0)
  );
end $$;

revoke execute on function public.rakeback_status() from public, anon;
grant  execute on function public.rakeback_status() to  authenticated;

-- ---------------------------------------------------------------------------
-- rakeback_claim()
--
-- The account row is locked FOR UPDATE and the claimable amount is read AFTER
-- the lock is held, so two concurrent claims serialise: the second waits, then
-- sees the reduced accrued and raises nothing_to_claim. Eligibility is NOT
-- re-checked: rakeback already accrued belongs to the player.
-- ---------------------------------------------------------------------------
create or replace function public.rakeback_claim()
returns table (claim_id text, amount numeric, balance numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user    uuid := auth.uid();
  v_accrued numeric;
  v_pay     numeric;
  v_claim   text;
  v_balance numeric;
begin
  if v_user is null then
    raise exception 'not_authenticated';
  end if;

  select ra.accrued into v_accrued
    from public.rakeback_accounts ra
   where ra.user_id = v_user
     for update;

  v_pay := floor(coalesce(v_accrued, 0) * 100) / 100;
  if v_pay < 0.01 then
    raise exception 'nothing_to_claim';
  end if;

  insert into public.rakeback_claims as rc (user_id, amount)
  values (v_user, v_pay)
  returning rc.claim_id into v_claim;

  update public.rakeback_accounts ra
     set accrued          = ra.accrued - v_pay,
         lifetime_claimed = ra.lifetime_claimed + v_pay,
         updated_at       = now()
   where ra.user_id = v_user;

  v_balance := public.adjust_balance(v_user, v_pay);

  insert into public.bills (user_id, transaction_type, token_name, trx_amount, balance, bill_id)
  values (v_user, 'rakeback', 'USDT', v_pay, v_balance, v_claim);

  perform public.post_ledger_pair(
    'rakeback:' || v_claim, v_claim,
    'TREASURY', null, 'PLAYER', v_user,
    v_pay, 'ADJUSTMENT', jsonb_build_object('kind', 'rakeback'));

  return query select v_claim, v_pay, v_balance;
end $$;

revoke execute on function public.rakeback_claim() from public, anon;
grant  execute on function public.rakeback_claim() to  authenticated;
