-- =============================================================================
-- 07_ccpayment.sql — deposits, withdrawals, and the two ways they double-pay (0015).
--
--   psql -h 127.0.0.1 -p 55433 -U postgres -d wager_local -f supabase/tests/07_ccpayment.sql
--
-- A webhook is delivered at least once, not exactly once: CCPayment retries
-- until it gets a 200, and may repeat a delivery it already got one for. So
-- the questions worth asking here are not "does a deposit credit" but "does
-- the SECOND copy of that deposit credit as well", and the same for a failed
-- withdrawal's refund.
--
-- The refund case is the one that was actually broken in the Node original,
-- and broken in the direction that costs the player rather than the house: the
-- status was overwritten one line above the test that read it, so the refund
-- branch never ran and a rejected withdrawal simply vanished. That is pinned
-- twice below — once that it refunds at all, once that it refunds only once.
-- =============================================================================
\set ON_ERROR_STOP on

do $$
declare
  v_user   uuid := 'cccccccc-0000-4000-8000-cccccccccccc'::uuid;
  v_ref    text := 'user_ccp_test_chain_ETH';
  v_bal    numeric;
  v_before numeric;
  v_res    jsonb;
  v_order  text;
  v_n      int;
begin
  -- --- a player with a balance ---------------------------------------------
  delete from auth.users where id = v_user;
  insert into auth.users (id, email) values (v_user, 'ccpayment@test.local');
  perform public.adjust_balance(v_user, 1000);
  perform public.ccp_bind_address(v_user, 'ETH', '0xdeadbeef', v_ref, null);

  -- =========================================================================
  -- DEPOSITS
  -- =========================================================================

  -- A deposit still confirming pays nothing. It is recorded so the player can
  -- see it pending, which is the whole reason Processing is delivered at all.
  select balance into v_before from public.profiles where id = v_user;
  v_res := public.ccp_credit_deposit('rec_proc', v_ref, 'ETH', 0.5, 2000, 'Processing', false, '{}');
  if v_res->>'action' <> 'recorded' then
    raise exception 'FAIL: a Processing deposit returned %', v_res->>'action';
  end if;
  select balance into v_bal from public.profiles where id = v_user;
  if v_bal <> v_before then raise exception 'FAIL: a Processing deposit moved the balance'; end if;

  -- The same record, now confirmed. Credit is the USD VALUE, not the coin
  -- amount: 0.5 ETH at 2000 is 1000.00, not 0.5. Crediting the face number is
  -- what the original did, because it kept a wallet per currency.
  v_res := public.ccp_credit_deposit('rec_proc', v_ref, 'ETH', 0.5, 2000, 'Success', false, '{}');
  if v_res->>'action' <> 'credited' then
    raise exception 'FAIL: a confirmed deposit returned %', v_res->>'action';
  end if;
  select balance into v_bal from public.profiles where id = v_user;
  if v_bal <> v_before + 1000 then
    raise exception 'FAIL: 0.5 ETH at 2000 credited % (expected %)', v_bal - v_before, 1000;
  end if;

  -- CRUX: the retry. Same recordId, same Success, delivered again.
  v_before := v_bal;
  v_res := public.ccp_credit_deposit('rec_proc', v_ref, 'ETH', 0.5, 2000, 'Success', false, '{}');
  if v_res->>'action' <> 'already_credited' then
    raise exception 'FAIL: a replayed deposit returned %', v_res->>'action';
  end if;
  select balance into v_bal from public.profiles where id = v_user;
  if v_bal <> v_before then
    raise exception 'FAIL: a replayed deposit credited a second time (+%)', v_bal - v_before;
  end if;

  -- One ledger row for one deposit, however many deliveries.
  select count(*) into v_n from public.bills where bill_id = 'ccp_dep_rec_proc';
  if v_n <> 1 then raise exception 'FAIL: % ledger rows for one deposit', v_n; end if;

  -- A flagged deposit is held, not paid. It is visible and waiting for a human.
  v_before := v_bal;
  v_res := public.ccp_credit_deposit('rec_risky', v_ref, 'ETH', 1, 2000, 'Success', true, '{}');
  if v_res->>'action' <> 'recorded' then
    raise exception 'FAIL: a risky deposit returned %', v_res->>'action';
  end if;
  select balance into v_bal from public.profiles where id = v_user;
  if v_bal <> v_before then raise exception 'FAIL: a risky deposit was credited'; end if;

  -- NaN, the 0012 lesson, arriving this time through a webhook rather than a
  -- stake. `NaN > 0` is true, so a bare positivity check would let it through
  -- and the balance would never be a number again.
  begin
    perform public.ccp_credit_deposit('rec_nan', v_ref, 'ETH', 'NaN'::numeric, 2000, 'Success', false, '{}');
    raise exception 'FAIL: a NaN deposit amount was accepted';
  exception when others then
    if sqlerrm not like '%invalid_amount%' then raise; end if;
  end;
  select balance into v_bal from public.profiles where id = v_user;
  if v_bal <> v_bal then raise exception 'FAIL: the balance is NaN'; end if;

  -- Money for an address nobody owns. Answered, not raised, so the Edge
  -- Function can return 200 and stop a retry that can never succeed.
  v_res := public.ccp_credit_deposit('rec_orphan', 'user_nobody_chain_ETH', 'ETH', 1, 2000, 'Success', false, '{}');
  if v_res->>'action' <> 'unknown_reference' then
    raise exception 'FAIL: an unowned deposit returned %', v_res->>'action';
  end if;

  -- =========================================================================
  -- WITHDRAWALS
  -- =========================================================================
  perform set_config('request.jwt.claim.sub', v_user::text, false);

  select balance into v_before from public.profiles where id = v_user;
  v_order := (public.ccp_withdrawal_request(100, 'USDT', 'ETH', '0xabc', null)).order_id;

  -- The balance leaves on request: money already on its way out must not also
  -- be spendable.
  select balance into v_bal from public.profiles where id = v_user;
  if v_bal <> v_before - 100 then
    raise exception 'FAIL: requesting a withdrawal moved the balance by %', v_bal - v_before;
  end if;


  -- Processing changes nothing financially.
  v_before := v_bal;
  v_res := public.ccp_settle_withdrawal(v_order, 'Processing', '{}');
  select balance into v_bal from public.profiles where id = v_user;
  if v_bal <> v_before then raise exception 'FAIL: a Processing withdrawal moved the balance'; end if;

  -- CRUX: it fails, and the player gets their money back. This is the branch
  -- that never ran in the original.
  v_res := public.ccp_settle_withdrawal(v_order, 'Failed', '{}');
  if v_res->>'action' <> 'refunded' then
    raise exception 'FAIL: a failed withdrawal returned % (the original bug: no refund)', v_res->>'action';
  end if;
  select balance into v_bal from public.profiles where id = v_user;
  if v_bal <> v_before + 100 then
    raise exception 'FAIL: a failed withdrawal refunded % (expected 100)', v_bal - v_before;
  end if;

  -- CRUX: and only once, however many times the failure is delivered.
  v_before := v_bal;
  v_res := public.ccp_settle_withdrawal(v_order, 'Failed', '{}');
  if v_res->>'action' = 'refunded' then raise exception 'FAIL: a replayed failure refunded twice'; end if;
  perform public.ccp_settle_withdrawal(v_order, 'Rejected', '{}');
  select balance into v_bal from public.profiles where id = v_user;
  if v_bal <> v_before then
    raise exception 'FAIL: repeated failures refunded again (+%)', v_bal - v_before;
  end if;

  select count(*) into v_n from public.bills where bill_id = 'ccp_wdr_refund_' || v_order;
  if v_n <> 1 then raise exception 'FAIL: % refund ledger rows for one withdrawal', v_n; end if;

  -- A withdrawal that succeeds is never refunded.
  perform set_config('request.jwt.claim.sub', v_user::text, false);
  v_order := (public.ccp_withdrawal_request(50, 'USDT', 'ETH', '0xabc', null)).order_id;

  select balance into v_before from public.profiles where id = v_user;
  perform public.ccp_settle_withdrawal(v_order, 'Success', '{}');
  perform public.ccp_settle_withdrawal(v_order, 'Success', '{}');
  select balance into v_bal from public.profiles where id = v_user;
  if v_bal <> v_before then
    raise exception 'FAIL: a completed withdrawal moved the balance by %', v_bal - v_before;
  end if;

  -- Overdrawing is refused, and leaves no row behind to reconcile later.
  perform set_config('request.jwt.claim.sub', v_user::text, false);
  select count(*) into v_n from public.ccp_withdrawals where user_id = v_user;
  begin
    perform public.ccp_withdrawal_request(999999, 'USDT', 'ETH', '0xabc', null);
    raise exception 'FAIL: a withdrawal beyond the balance was accepted';
  exception when others then
    if sqlerrm not like '%insufficient_balance%' then raise; end if;
  end;
  select count(*) - v_n into v_n from public.ccp_withdrawals where user_id = v_user;
  if v_n <> 0 then raise exception 'FAIL: a refused withdrawal left % row(s) behind', v_n; end if;

  -- Sub-cent amounts, the other half of the 0012 lesson: numeric(18,2) would
  -- debit less than it sends.
  perform set_config('request.jwt.claim.sub', v_user::text, false);
  begin
    perform public.ccp_withdrawal_request(0.005, 'USDT', 'ETH', '0xabc', null);
    raise exception 'FAIL: a sub-cent withdrawal was accepted';
  exception when others then
    if sqlerrm not like '%invalid_amount_precision%' then raise; end if;
  end;

  raise notice 'PASS 07_ccpayment: deposits credit once, failures refund once, neither repeats';
end $$;

-- A player may read their own deposits and withdrawals and nobody else's, and
-- may not write either: the rows are money, and only the RPCs move money.
do $$
declare v_n int;
begin
  select count(*) into v_n
    from information_schema.role_table_grants
   where table_schema = 'public'
     and table_name in ('ccp_deposits','ccp_withdrawals','ccp_deposit_addresses')
     and grantee in ('anon','authenticated')
     and privilege_type in ('INSERT','UPDATE','DELETE');
  if v_n <> 0 then
    raise exception 'FAIL: the client holds % write grant(s) on the CCPayment tables', v_n;
  end if;
  raise notice 'PASS 07_ccpayment: CCPayment tables are read-only to the client';
end $$;
