-- =============================================================================
-- 0015_ccpayment.sql  —  Phase 5: money in and money out
--
-- Ported from controllers/ccpayment.controllers.js + services/ccpayment.services.js.
--
-- WHAT LIVES WHERE. The Edge Function verifies that a webhook really came from
-- CCPayment; everything after that — deciding whether a deposit has already
-- been credited, moving the balance, writing the ledger — happens in here, in
-- one transaction, behind functions the browser cannot call. The Edge Function
-- holds the service role key, so these are granted to service_role only and
-- revoked from everyone else.
--
-- WHY THE WEBHOOK CANNOT JUST TRUST ITSELF. CCPayment retries a webhook until
-- it gets a 200, and it may deliver the same event more than once even after
-- one. Every function here is therefore idempotent by construction: the
-- deposit's recordId and the withdrawal's orderId are unique, and money moves
-- only on the transition into a settled state, never on seeing a settled state
-- again. A retry after a successful credit is a no-op that still answers 200.
--
-- -- Two bugs in the original, fixed here rather than ported -----------------
--
-- 1. A FAILED WITHDRAWAL NEVER REFUNDED THE PLAYER. The original meant to,
--    and could not:
--
--      if (newStatus !== withdrawalRequest.status) {
--        withdrawalRequest.status = newStatus;                     // assigned
--        ...
--        else if (newStatus === 'failed'
--                 && withdrawalRequest.status !== 'failed') {      // now false
--          // refund
--
--    The status was overwritten one line above the test that reads it, so the
--    refund branch was unreachable for every withdrawal that ever failed or
--    was rejected. The amount left the balance when the request was made and
--    nothing put it back. Here the refund is driven by a `refunded_at` stamp
--    instead of by comparing a field to a value it was just assigned.
--
-- 2. DEPOSITS CREDITED THE COIN AMOUNT, NOT ITS VALUE. The original passed
--    `amount: depositAmount` — 0.4 ETH credited as 0.4 — because it kept a
--    wallet per currency. This schema keeps ONE balance, in USDT, so a deposit
--    credits amount * coinUSDPrice. Carrying the old line over would have
--    valued every non-USDT deposit at the coin's face number.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- The permanent address a player deposits to. One per (user, chain); the
-- reference_id is what CCPayment echoes back in the webhook, and is how an
-- incoming deposit finds its owner.
-- ---------------------------------------------------------------------------
create table public.ccp_deposit_addresses (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  chain        text not null,
  address      text not null,
  memo         text,
  reference_id text not null unique,
  created_at   timestamptz not null default now(),
  unique (user_id, chain)
);

create index on public.ccp_deposit_addresses (user_id);

alter table public.ccp_deposit_addresses enable row level security;
revoke insert, update, delete on public.ccp_deposit_addresses from anon, authenticated;
-- A player may see their own addresses; there is nothing secret in them, and
-- the deposit screen needs them.
create policy ccp_addresses_select_self on public.ccp_deposit_addresses
  for select to authenticated using (user_id = auth.uid());


-- ---------------------------------------------------------------------------
-- Deposits. `record_id` is CCPayment's, and its uniqueness IS the idempotency
-- key — a replayed webhook collides here rather than crediting twice.
--
-- `credited_at` is the money flag, deliberately separate from `status`. Status
-- says what CCPayment thinks; credited_at says what we actually paid. Keeping
-- them apart is what makes "Processing, then Success, then Success again"
-- credit exactly once.
-- ---------------------------------------------------------------------------
create table public.ccp_deposits (
  id             bigint generated always as identity primary key,
  record_id      text not null unique,
  user_id        uuid not null references public.profiles(id) on delete cascade,
  reference_id   text,
  coin           text not null,
  -- The coin amount and its USD price at the time, both as reported by
  -- CCPayment's record endpoint. Unscaled: a coin amount is not money in this
  -- schema, and rounding it to 2 places would destroy small-unit assets.
  amount         numeric not null,
  coin_usd_price numeric,
  -- What we actually credited, in USDT, at profiles.balance's scale.
  amount_usd     numeric(18,2),
  status         text not null,        -- CCPayment's: Success | Processing | ...
  is_risky       boolean not null default false,
  credited_at    timestamptz,
  raw            jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index on public.ccp_deposits (user_id, created_at desc);

alter table public.ccp_deposits enable row level security;
revoke insert, update, delete on public.ccp_deposits from anon, authenticated;
create policy ccp_deposits_select_self on public.ccp_deposits
  for select to authenticated using (user_id = auth.uid());


-- ---------------------------------------------------------------------------
-- Withdrawals. `order_id` is ours, generated when the player asks, and is what
-- CCPayment quotes back. The balance leaves at request time — a player must
-- not be able to spend money that is already on its way out — so a failure
-- has to put it back, which is what refunded_at tracks.
-- ---------------------------------------------------------------------------
create table public.ccp_withdrawals (
  id           bigint generated always as identity primary key,
  order_id     text not null unique default encode(gen_random_bytes(12), 'hex'),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  amount       numeric(18,2) not null check (amount > 0),
  coin         text not null,
  chain        text not null,
  address      text not null,
  memo         text,
  -- Ours, not CCPayment's: pending | processing | completed | failed
  status       text not null default 'pending'
    check (status in ('pending','processing','completed','failed')),
  cc_status    text,                   -- CCPayment's last word, verbatim
  refunded_at  timestamptz,
  completed_at timestamptz,
  raw          jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index on public.ccp_withdrawals (user_id, created_at desc);

alter table public.ccp_withdrawals enable row level security;
revoke insert, update, delete on public.ccp_withdrawals from anon, authenticated;
create policy ccp_withdrawals_select_self on public.ccp_withdrawals
  for select to authenticated using (user_id = auth.uid());


-- ---------------------------------------------------------------------------
-- ccp_bind_address — record the permanent address CCPayment issued.
--
-- Called by the Edge Function after getOrCreateAppDepositAddress. Idempotent:
-- CCPayment returns the same address for the same referenceId forever, so a
-- second call updates rather than duplicates.
-- ---------------------------------------------------------------------------
create or replace function public.ccp_bind_address(
  p_user uuid, p_chain text, p_address text, p_reference_id text, p_memo text default null
)
returns public.ccp_deposit_addresses
language plpgsql
security definer
set search_path = public
as $$
declare v_row public.ccp_deposit_addresses;
begin
  if p_user is null or coalesce(btrim(p_address), '') = '' or coalesce(btrim(p_reference_id), '') = '' then
    raise exception 'invalid_address_binding';
  end if;

  insert into public.ccp_deposit_addresses (user_id, chain, address, reference_id, memo)
  values (p_user, p_chain, p_address, p_reference_id, p_memo)
  on conflict (user_id, chain) do update
    set address = excluded.address, memo = excluded.memo, reference_id = excluded.reference_id
  returning * into v_row;

  return v_row;
end $$;

revoke execute on function public.ccp_bind_address(uuid, text, text, text, text) from public, anon, authenticated;
grant  execute on function public.ccp_bind_address(uuid, text, text, text, text) to service_role;


-- ---------------------------------------------------------------------------
-- ccp_credit_deposit — the deposit webhook's landing point.
--
-- Returns what it did, so the function can log it honestly:
--   credited          money moved, first time
--   already_credited  a retry; nothing moved
--   recorded          seen and stored, but not payable (Processing, risky, or
--                     a value that rounds to nothing)
--
-- The amount is passed in from the deposit RECORD endpoint, not from the
-- webhook body — the DirectDeposit payload carries no amount at all, which is
-- why the original re-fetched too. Nothing here invents a number.
-- ---------------------------------------------------------------------------
create or replace function public.ccp_credit_deposit(
  p_record_id      text,
  p_reference_id   text,
  p_coin           text,
  p_amount         numeric,
  p_coin_usd_price numeric,
  p_status         text,
  p_is_risky       boolean default false,
  p_raw            jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user    uuid;
  v_usd     numeric(18,2);
  v_dep     public.ccp_deposits;
  v_balance numeric;
begin
  if coalesce(btrim(p_record_id), '') = '' then raise exception 'missing_record_id'; end if;

  -- NaN and friends, the 0012 lesson: these arrive over the network as JSON
  -- and `NaN > 0` is TRUE for a Postgres numeric, so a bare positivity test
  -- would wave them through and poison the balance permanently.
  if p_amount is null or p_amount = 'NaN'::numeric or p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;
  if p_coin_usd_price is null or p_coin_usd_price = 'NaN'::numeric or p_coin_usd_price < 0 then
    raise exception 'invalid_price';
  end if;

  select user_id into v_user from public.ccp_deposit_addresses where reference_id = p_reference_id;
  if v_user is null then
    -- Money arrived for an address we have no owner for. Reported as a result
    -- rather than raised, so CCPayment gets its 200 and stops retrying a thing
    -- that will never succeed; this needs a human, not another delivery.
    return jsonb_build_object('action', 'unknown_reference', 'reference_id', p_reference_id);
  end if;

  -- Value, at profiles.balance's scale. Rounded ONCE, here.
  v_usd := round(p_amount * p_coin_usd_price, 2);

  insert into public.ccp_deposits (
    record_id, user_id, reference_id, coin, amount, coin_usd_price, amount_usd, status, is_risky, raw
  ) values (
    p_record_id, v_user, p_reference_id, p_coin, p_amount, p_coin_usd_price, v_usd,
    p_status, coalesce(p_is_risky, false), p_raw
  )
  on conflict (record_id) do update
    set status         = excluded.status,
        is_risky       = excluded.is_risky,
        amount         = excluded.amount,
        coin_usd_price = excluded.coin_usd_price,
        amount_usd     = excluded.amount_usd,
        raw            = excluded.raw,
        updated_at     = now()
  returning * into v_dep;

  -- Lock the row before deciding to pay: two deliveries of the same event can
  -- land concurrently, and both would otherwise read credited_at as null.
  select * into v_dep from public.ccp_deposits where id = v_dep.id for update;

  if v_dep.credited_at is not null then
    return jsonb_build_object('action', 'already_credited', 'deposit_id', v_dep.id,
                              'user_id', v_user, 'amount_usd', v_dep.amount_usd);
  end if;

  -- Only a confirmed, unflagged deposit worth at least a cent pays out. A
  -- risky one is held deliberately: it is recorded, visible, and waiting for
  -- someone to decide, which is what the original did too.
  if p_status <> 'Success' or coalesce(p_is_risky, false) or v_usd <= 0 then
    return jsonb_build_object(
      'action', 'recorded', 'deposit_id', v_dep.id, 'user_id', v_user,
      'status', p_status, 'risky', coalesce(p_is_risky, false), 'amount_usd', v_usd);
  end if;

  v_balance := public.adjust_balance(v_user, v_usd);

  update public.ccp_deposits set credited_at = now(), updated_at = now() where id = v_dep.id;

  insert into public.bills (user_id, transaction_type, token_name, trx_amount, balance, bill_id)
  values (v_user, 'deposit', p_coin, v_usd, v_balance, 'ccp_dep_' || p_record_id);

  return jsonb_build_object('action', 'credited', 'deposit_id', v_dep.id,
                            'user_id', v_user, 'amount_usd', v_usd, 'balance', v_balance);
end $$;

revoke execute on function public.ccp_credit_deposit(text, text, text, numeric, numeric, text, boolean, jsonb)
  from public, anon, authenticated;
grant  execute on function public.ccp_credit_deposit(text, text, text, numeric, numeric, text, boolean, jsonb)
  to service_role;


-- ---------------------------------------------------------------------------
-- ccp_settle_withdrawal — the withdrawal webhook's landing point.
--
-- CCPayment's vocabulary mapped onto ours:
--   Success                    -> completed
--   Processing                 -> processing
--   Failed, Rejected           -> failed   (and the money goes back)
--   WaitingApproval, anything  -> pending
--
-- The refund is guarded by refunded_at, not by comparing status to itself.
-- That is the bug described at the top of this file, and the reason a player
-- whose withdrawal was rejected used to simply lose the amount.
-- ---------------------------------------------------------------------------
create or replace function public.ccp_settle_withdrawal(
  p_order_id  text,
  p_cc_status text,
  p_raw       jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_w       public.ccp_withdrawals;
  v_status  text;
  v_balance numeric;
begin
  if coalesce(btrim(p_order_id), '') = '' then raise exception 'missing_order_id'; end if;

  select * into v_w from public.ccp_withdrawals where order_id = p_order_id for update;
  if v_w.id is null then
    -- Same reasoning as an unknown deposit reference: answer 200 and let a
    -- human look, rather than have CCPayment retry forever.
    return jsonb_build_object('action', 'unknown_order', 'order_id', p_order_id);
  end if;

  v_status := case p_cc_status
    when 'Success'    then 'completed'
    when 'Processing' then 'processing'
    when 'Failed'     then 'failed'
    when 'Rejected'   then 'failed'
    else 'pending'
  end;

  update public.ccp_withdrawals
     set status       = v_status,
         cc_status    = p_cc_status,
         completed_at = case when v_status = 'completed' then coalesce(completed_at, now()) else completed_at end,
         raw          = p_raw,
         updated_at   = now()
   where id = v_w.id
  returning * into v_w;

  -- Put the money back exactly once, however many times a failure is
  -- delivered, and never for a withdrawal that went out fine.
  if v_status = 'failed' and v_w.refunded_at is null then
    v_balance := public.adjust_balance(v_w.user_id, v_w.amount);

    update public.ccp_withdrawals set refunded_at = now(), updated_at = now() where id = v_w.id;

    insert into public.bills (user_id, transaction_type, token_name, trx_amount, balance, bill_id)
    values (v_w.user_id, 'withdrawal_refund', v_w.coin, v_w.amount, v_balance,
            'ccp_wdr_refund_' || v_w.order_id);

    return jsonb_build_object('action', 'refunded', 'order_id', p_order_id,
                              'user_id', v_w.user_id, 'amount', v_w.amount, 'balance', v_balance);
  end if;

  return jsonb_build_object('action', 'updated', 'order_id', p_order_id,
                            'user_id', v_w.user_id, 'status', v_status,
                            'refunded', v_w.refunded_at is not null);
end $$;

revoke execute on function public.ccp_settle_withdrawal(text, text, jsonb) from public, anon, authenticated;
grant  execute on function public.ccp_settle_withdrawal(text, text, jsonb) to service_role;


-- ---------------------------------------------------------------------------
-- ccp_withdrawal_request — the player's side.
--
-- Debits immediately. Holding the balance until CCPayment confirms would let
-- the same money be withdrawn twice, or gambled while it is already leaving,
-- so the amount goes on request and comes back on failure. adjust_balance
-- refuses an overdraw and aborts the whole transaction, so a refused
-- withdrawal leaves no row behind.
--
-- Returns the order_id the Edge Function then hands to CCPayment. If that call
-- fails, the function calls ccp_fail_withdrawal below, which refunds through
-- the same guarded path a failure webhook uses.
-- ---------------------------------------------------------------------------
create or replace function public.ccp_withdrawal_request(
  p_amount  numeric,
  p_coin    text,
  p_chain   text,
  p_address text,
  p_memo    text default null
)
returns public.ccp_withdrawals
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user    uuid := auth.uid();
  v_profile public.profiles;
  v_row     public.ccp_withdrawals;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;

  if p_amount is null or p_amount = 'NaN'::numeric or p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;
  -- Same reasoning as place_bet in 0012: balance is numeric(18,2), so a finer
  -- amount would be debited as less than it is sent.
  if p_amount <> round(p_amount, 2) then raise exception 'invalid_amount_precision'; end if;
  if coalesce(btrim(p_address), '') = '' then raise exception 'invalid_address'; end if;
  if coalesce(btrim(p_chain), '')   = '' then raise exception 'invalid_chain';   end if;

  select * into v_profile from public.profiles where id = v_user;
  if v_profile.status <> 'active' then raise exception 'account_not_active'; end if;
  if coalesce(v_profile.withdrawal_disabled, false) then raise exception 'withdrawals_disabled'; end if;

  perform public.adjust_balance(v_user, -p_amount);

  insert into public.ccp_withdrawals (user_id, amount, coin, chain, address, memo)
  values (v_user, p_amount, coalesce(nullif(btrim(p_coin), ''), 'USDT'), p_chain, p_address, p_memo)
  returning * into v_row;

  insert into public.bills (user_id, transaction_type, token_name, trx_amount, balance, bill_id)
  values (v_user, 'withdrawal', v_row.coin, -p_amount,
          (select balance from public.profiles where id = v_user), 'ccp_wdr_' || v_row.order_id);

  return v_row;
end $$;

revoke execute on function public.ccp_withdrawal_request(numeric, text, text, text, text) from public, anon;
grant  execute on function public.ccp_withdrawal_request(numeric, text, text, text, text) to authenticated;


-- ---------------------------------------------------------------------------
-- ccp_fail_withdrawal — the Edge Function's undo when CCPayment refuses the
-- request it just made. Same refund path as a failure webhook, same guard, so
-- the two cannot both pay it back.
-- ---------------------------------------------------------------------------
create or replace function public.ccp_fail_withdrawal(p_order_id text, p_reason text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.ccp_settle_withdrawal(
    p_order_id, 'Failed',
    jsonb_build_object('source', 'api_rejected', 'reason', coalesce(p_reason, 'unknown')));
end $$;

revoke execute on function public.ccp_fail_withdrawal(text, text) from public, anon, authenticated;
grant  execute on function public.ccp_fail_withdrawal(text, text) to service_role;
