-- =============================================================================
-- 0012_money_amount_guards.sql  —  SECURITY FIX
--
-- Two ways a stake got past place_bet's validation.
--
-- 1. NaN. In Postgres NaN compares as GREATER than every number, so
--    `NaN <= 0` is false and `NaN > 0` is true: both existing guards pass.
--
--      select p_amount, p_amount <= 0, p_amount > 0
--        from json_to_record('{"p_amount":"NaN"}') as x(p_amount numeric);
--        ->  NaN | f | t
--
--    That coercion is exactly what PostgREST performs on an RPC body, so
--    `{"p_amount":"NaN"}` reaches place_bet from the open internet. Observed:
--    a balance of 1000.00 became NaN, and from then on every debit "succeeded"
--    because NaN - anything is NaN and NaN >= 0 is true. The account becomes
--    an infinite bankroll and its ledger is unrecoverable arithmetic.
--
--    The browser cannot send it (Number('NaN') -> NaN -> JSON null ->
--    invalid_amount), which is why it went unnoticed. The API is the boundary,
--    not the client.
--
-- 2. Sub-cent stakes mint money. profiles.balance is numeric(18,2) but the
--    parameter is unconstrained numeric: a 0.005 stake debits 0.00 (rounded to
--    the column) while bets.bet_amount stores 0.01 and settlement pays the
--    winner on 0.01. Observed net +0.03 on a 0.005 stake. Small per call, and
--    a loop.
--
-- Both are pre-existing in 0004 and reachable through every game, Hilo and
-- Mines included.
--
-- The column constraint at the end is the backstop: even if some future
-- function forgets, a balance can never again hold NaN.
-- =============================================================================

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
  -- NaN is compared BY VALUE, not with the IEEE `x <> x` trick: Postgres
  -- numeric deliberately breaks from IEEE and treats NaN as equal to itself
  -- and greater than every number. So `p_amount <> p_amount` is FALSE for NaN
  -- and catches nothing, while `> 0` is TRUE — which is exactly how a NaN
  -- stake walked through both original guards.
  if p_amount is null or p_amount = 'NaN'::numeric or p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;
  -- The stake must be expressible in the currency it is charged in: balance is
  -- numeric(18,2), so anything finer is debited as less than it is staked, and
  -- paid out on the larger figure.
  if p_amount <> round(p_amount, 2) then
    raise exception 'invalid_amount_precision';
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

  /*
   * ...and the tier that total buys, when 0009 is present.
   *
   * Called through to_regprocedure rather than directly because this migration
   * and 0009 sit on different branches and either may land first. A direct call
   * makes this file unappliable before 0009 (every bet fails with "function
   * public.vip_recalc(uuid) does not exist"), and simply dropping the line
   * would silently undo 0009 whenever this lands second. This works in both
   * orders and starts recalculating the moment 0009 exists.
   */
  if to_regprocedure('public.vip_recalc(uuid)') is not null then
    execute 'select public.vip_recalc($1)' using v_user;
  end if;

  return v_bet;
end $$;

revoke execute on function public.place_bet(text, numeric, text) from public, anon;
grant  execute on function public.place_bet(text, numeric, text) to  authenticated;


-- ---------------------------------------------------------------------------
-- settle_bet takes a multiplier from the calling game, not from a player, but
-- the same arithmetic applies: a NaN multiplier would write a NaN payout and
-- NaN the balance from the credit side instead.
-- ---------------------------------------------------------------------------
create or replace function public.adjust_balance(p_user uuid, p_delta numeric)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare v_balance numeric;
begin
  -- The ONLY change from 0001: refuse NaN before it can be added to a balance.
  -- Compared by value: Postgres numeric NaN equals itself, so the IEEE idiom
  -- `p_delta <> p_delta` would never fire here.
  -- Everything below is 0001's body verbatim — in particular the sufficiency
  -- test stays in the UPDATE's WHERE clause, and a null result still means
  -- 'insufficient_balance' for both an unknown user and an overdraw.
  if p_delta is null or p_delta = 'NaN'::numeric then
    raise exception 'invalid_amount';
  end if;

  perform set_config('app.allow_balance_change', 'on', true);
  update public.profiles
     set balance = balance + p_delta
   where id = p_user
     and (p_delta >= 0 or balance + p_delta >= 0)
  returning balance into v_balance;
  perform set_config('app.allow_balance_change', 'off', true);
  if v_balance is null then
    raise exception 'insufficient_balance';
  end if;
  return v_balance;
end $$;

revoke execute on function public.adjust_balance(uuid, numeric) from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- The backstop. A balance is money: it may not be NaN, whatever writes it.
--
-- NOT VALID so the statement does not scan the whole table while holding a
-- lock; it applies to every future write immediately. Validate separately when
-- convenient — and if validation ever fails, that row is an account whose
-- balance was already corrupted and needs a human.
-- ---------------------------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_balance_is_a_number;
alter table public.profiles add  constraint profiles_balance_is_a_number
  check (balance = balance) not valid;
