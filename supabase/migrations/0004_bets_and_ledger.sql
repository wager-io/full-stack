-- =============================================================================
-- 0004_bets_and_ledger.sql  —  Phase 1: wallet ledger + global bet feed
--
-- The money primitives every game sits on. Games (Phase 2+) never touch
-- balances directly; they call place_bet() and settle_bet(), which are the
-- only paths that move money, and each runs in a single transaction.
--
-- Replaces the old Socket.io `global-new-bet` broadcast with Realtime inserts
-- on public.bets.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- bets — one row per wager, across every game.
--
-- display_name / avatar_url are DENORMALISED on purpose. Realtime delivers the
-- changed row and nothing else — it cannot join to profiles — so the feed row
-- has to carry everything the UI renders. Denormalising also lets us enforce
-- the privacy rule at WRITE time: a player who opted out of public listings
-- gets NULL here, so their name is not merely hidden by the client, it never
-- leaves the database.
-- ---------------------------------------------------------------------------
create table public.bets (
  id           bigint generated always as identity primary key,
  bet_id       text not null unique default encode(gen_random_bytes(9), 'hex'),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  game         text not null,                      -- dice | limbo | plinko | mines | hilo | crash | keno
  bet_amount   numeric(18,2) not null check (bet_amount > 0),
  multiplier   numeric(12,4) not null default 0,
  payout       numeric(18,2) not null default 0,
  profit       numeric(18,2) not null default 0,   -- payout - bet_amount
  currency     text not null default 'USDT',
  state        text not null default 'pending' check (state in ('pending','won','lost')),
  outcome      jsonb default '{}',                 -- per-game detail (roll, path, grid...)
  display_name text,                               -- NULL when the player is hidden
  avatar_url   text,
  created_at   timestamptz not null default now(),
  settled_at   timestamptz
);

create index on public.bets (user_id, created_at desc);
create index on public.bets (created_at desc);
create index on public.bets (game, created_at desc);
-- Drives the high-roller feed.
create index on public.bets (payout desc) where state = 'won';

alter table public.bets enable row level security;

-- The bet feed is public on the live site, so anyone may read a settled bet.
-- The row carries no identity beyond display_name (already NULL if hidden).
-- Pending bets stay private — an open Mines/Hilo game must not leak.
create policy bets_select_settled on public.bets
  for select using (state <> 'pending' or user_id = auth.uid() or public.is_admin());

-- No client writes at all: place_bet()/settle_bet() own this table.
revoke insert, update, delete on public.bets from anon, authenticated;

alter publication supabase_realtime add table public.bets;


-- ---------------------------------------------------------------------------
-- place_bet — debit, record, return. One transaction.
--
-- SECURITY DEFINER so it can move money, but it derives the user from
-- auth.uid() and NEVER from an argument: there is no parameter a caller could
-- point at somebody else's account.
-- ---------------------------------------------------------------------------
create or replace function public.place_bet(
  p_game     text,
  p_amount   numeric,
  p_currency text default 'USDT'
)
returns public.bets
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user    uuid := auth.uid();
  v_profile public.profiles;
  v_bet     public.bets;
begin
  if v_user is null then
    raise exception 'not_authenticated';
  end if;
  if p_game not in ('dice','limbo','plinko','mines','hilo','crash','keno') then
    raise exception 'unknown_game: %', p_game;
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;

  select * into v_profile from public.profiles where id = v_user;
  if v_profile.status <> 'active' then
    raise exception 'account_not_active';
  end if;

  -- Debit first. adjust_balance raises insufficient_balance if it would go
  -- negative, which aborts the whole transaction — no bet row is left behind.
  perform public.adjust_balance(v_user, -p_amount);

  insert into public.bets (
    user_id, game, bet_amount, currency, state, display_name, avatar_url
  ) values (
    v_user, p_game, p_amount, p_currency, 'pending',
    case when coalesce(v_profile.hidden_from_public, false) then null
         else v_profile.username end,
    case when coalesce(v_profile.hidden_from_public, false) then null
         else v_profile.profile_image end
  )
  returning * into v_bet;

  insert into public.bills (user_id, transaction_type, token_name, trx_amount, balance, bill_id)
  values (v_user, 'bet', p_currency, -p_amount,
          (select balance from public.profiles where id = v_user), v_bet.bet_id);

  -- Wagering counts toward VIP whether or not the bet wins.
  update public.vip_progress
     set current_wager = current_wager + p_amount
   where user_id = v_user;

  return v_bet;
end $$;

revoke execute on function public.place_bet(text, numeric, text) from public, anon;
grant  execute on function public.place_bet(text, numeric, text) to  authenticated;


-- ---------------------------------------------------------------------------
-- settle_bet — credit any winnings and close the bet.
--
-- Internal: games call it from inside their own definer functions, so it is
-- NOT granted to authenticated. If a player could call this they would name
-- their own multiplier.
-- ---------------------------------------------------------------------------
create or replace function public.settle_bet(
  p_bet_id     text,
  p_multiplier numeric,
  p_outcome    jsonb default '{}'
)
returns public.bets
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bet    public.bets;
  v_payout numeric;
begin
  select * into v_bet from public.bets where bet_id = p_bet_id for update;
  if v_bet.id is null then
    raise exception 'unknown_bet: %', p_bet_id;
  end if;
  if v_bet.state <> 'pending' then
    raise exception 'bet_already_settled: %', p_bet_id;   -- guards double-payout
  end if;
  if p_multiplier is null or p_multiplier < 0 then
    raise exception 'invalid_multiplier';
  end if;

  v_payout := round(v_bet.bet_amount * p_multiplier, 2);

  if v_payout > 0 then
    perform public.adjust_balance(v_bet.user_id, v_payout);

    insert into public.bills (user_id, transaction_type, token_name, trx_amount, balance, bill_id)
    values (v_bet.user_id, 'win', v_bet.currency, v_payout,
            (select balance from public.profiles where id = v_bet.user_id), v_bet.bet_id);
  end if;

  update public.bets
     set multiplier = p_multiplier,
         payout     = v_payout,
         profit     = v_payout - bet_amount,
         outcome    = coalesce(p_outcome, '{}'),
         state      = case when v_payout > 0 then 'won' else 'lost' end,
         settled_at = now()
   where id = v_bet.id
  returning * into v_bet;

  return v_bet;
end $$;

revoke execute on function public.settle_bet(text, numeric, jsonb) from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- Read models for the feeds. Both are plain views over settled bets, so anon
-- can render the landing page without a session.
-- ---------------------------------------------------------------------------
create view public.recent_bets as
  select bet_id, game, bet_amount, multiplier, payout, profit, currency,
         display_name, avatar_url, created_at
    from public.bets
   where state <> 'pending'
   order by created_at desc
   limit 50;

create view public.high_rollers as
  select bet_id, game, bet_amount, multiplier, payout, profit, currency,
         display_name, avatar_url, created_at
    from public.bets
   where state = 'won'
   order by payout desc
   limit 50;

grant select on public.recent_bets, public.high_rollers to anon, authenticated;
