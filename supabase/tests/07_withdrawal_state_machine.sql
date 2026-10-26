-- =============================================================================
-- 07_withdrawal_state_machine.sql — the hold, the approvals, the ledger (0017).
--
--   psql -h 127.0.0.1 -p 55433 -U postgres -d wager_local \
--        -v ON_ERROR_STOP=1 -f supabase/tests/07_withdrawal_state_machine.sql
--
-- Against the local Supabase stack, through its own container:
--
--   docker exec -i supabase_db_wager psql -U postgres -d postgres \
--     -v ON_ERROR_STOP=1 < supabase/tests/07_withdrawal_state_machine.sql
--
-- Or paste the whole file into the Studio SQL editor — it runs there unchanged.
--
-- NOTE: there is deliberately no `\set ON_ERROR_STOP on` line in this file,
-- unlike the older tests. That is a psql meta-command, not SQL, so Studio
-- sends it to Postgres verbatim and gets `syntax error at or near "\"` before
-- a single check has run. The flag is passed on the command line above
-- instead, which does the same job for psql and leaves the file portable.
--
-- A PASS LOOKS LIKE NOTHING IN STUDIO. The PASS lines below are RAISE NOTICE,
-- and the Results pane renders rows, not notices — so a successful run reports
-- "Success. No rows returned". That IS the pass. A failure cannot be missed:
-- every check raises, so it comes back as a red error naming what broke.
-- For a run that shows its working, use 08_withdrawal_walkthrough.sql.
--
-- What this pins down, in the order the money moves:
--
--   * A request does NOT debit. The old flow took the money the moment somebody
--     clicked withdraw, and gave it back only if a refund path ran.
--   * One open withdrawal per player. Without that rule, $100 of balance can
--     back ten $100 requests, each of which passes its own balance check.
--   * A large withdrawal needs two DISTINCT administrators, and the same person
--     clicking twice is one approval.
--   * Confirming drains the hold and posts a matched ledger pair exactly once.
--   * Rolling back returns the hold, and only when there was one to return.
-- =============================================================================

do $$
declare
  v_player  uuid := 'bbbbbbbb-0000-4000-8000-bbbbbbbbbbbb';
  v_admin1  uuid := 'cccccccc-0000-4000-8000-cccccccccccc';
  v_admin2  uuid := 'dddddddd-0000-4000-8000-dddddddddddd';
  v_order   text;
  v_order2  text;
  v_res     jsonb;
  v_avail   numeric;
  v_clear   numeric;
  v_ext     numeric;
  v_ext0    numeric;
  v_n       int;
  v_ok      boolean;
begin
  -- --- fixtures -------------------------------------------------------------
  delete from auth.users where id in (v_player, v_admin1, v_admin2);
  insert into auth.users (id, email) values
    (v_player, 'wd-player@test.local'),
    (v_admin1, 'wd-admin1@test.local'),
    (v_admin2, 'wd-admin2@test.local');

  perform set_config('app.allow_balance_change', 'on', true);
  update public.profiles set is_admin = true where id in (v_admin1, v_admin2);
  perform set_config('app.allow_balance_change', 'off', true);

  perform public.adjust_balance(v_player, 20000);

  select balance from public.system_accounts where kind = 'EXTERNAL' into v_ext0;

  -- =========================================================================
  -- 1. REQUESTED moves nothing.
  -- =========================================================================
  perform set_config('request.jwt.claim.sub', v_player::text, false);
  v_res := public.request_withdrawal(500.00, 'TXyz000000000000000000000000000000', 'TRX', 'USDT');
  v_order := v_res ->> 'order_id';

  select balance, clearing_balance into v_avail, v_clear
    from public.profiles where id = v_player;
  if v_avail <> 20000 or v_clear <> 0 then
    raise exception 'FAIL: a request moved money (available=%, clearing=%)', v_avail, v_clear;
  end if;

  -- =========================================================================
  -- 2. One open withdrawal at a time.
  -- =========================================================================
  v_ok := false;
  begin
    perform public.request_withdrawal(100.00, 'TXabc00000000000000000000000000000', 'TRX', 'USDT');
  exception when others then
    if sqlerrm not like '%withdrawal_already_pending%' then raise; end if;
    v_ok := true;
  end;
  if not v_ok then
    raise exception 'FAIL: a second concurrent withdrawal was accepted';
  end if;

  -- =========================================================================
  -- 3. A non-admin cannot approve.
  -- =========================================================================
  v_ok := false;
  begin
    perform public.approve_withdrawal(v_order);
  exception when others then
    if sqlerrm not like '%not_authorised%' then raise; end if;
    v_ok := true;
  end;
  if not v_ok then
    raise exception 'FAIL: a player approved their own withdrawal';
  end if;

  -- =========================================================================
  -- 4. Small withdrawal: one approval holds the funds.
  -- =========================================================================
  perform set_config('request.jwt.claim.sub', v_admin1::text, false);
  v_res := public.approve_withdrawal(v_order);

  if (v_res ->> 'required')::int <> 1 then
    raise exception 'FAIL: $500 should need one approval, needs %', v_res ->> 'required';
  end if;
  if not (v_res ->> 'held')::boolean then
    raise exception 'FAIL: a fully approved withdrawal did not hold the funds';
  end if;

  select balance, clearing_balance into v_avail, v_clear
    from public.profiles where id = v_player;
  if v_avail <> 19500 or v_clear <> 500 then
    raise exception 'FAIL: hold is wrong (available=%, clearing=%)', v_avail, v_clear;
  end if;

  -- =========================================================================
  -- 5. Illegal transitions are refused, not forced.
  --    REQUESTED -> CONFIRMED skips the hold and the send entirely.
  -- =========================================================================
  v_res := public.confirm_withdrawal(v_order);   -- from APPROVED, not BROADCASTING
  if (v_res ->> 'ok')::boolean then
    raise exception 'FAIL: confirmed a withdrawal that was never broadcast';
  end if;

  -- =========================================================================
  -- 6. BROADCASTING -> CONFIRMED drains the hold and posts the ledger pair.
  -- =========================================================================
  v_res := public.broadcast_withdrawal(v_order, '0xdeadbeef', 'rec-1', null, 500.0);
  if not (v_res ->> 'ok')::boolean then
    raise exception 'FAIL: broadcast refused: %', v_res;
  end if;

  v_res := public.confirm_withdrawal(v_order, '0xdeadbeef');
  if not (v_res ->> 'ok')::boolean then
    raise exception 'FAIL: confirm refused: %', v_res;
  end if;

  select balance, clearing_balance into v_avail, v_clear
    from public.profiles where id = v_player;
  if v_avail <> 19500 or v_clear <> 0 then
    raise exception 'FAIL: confirm left the wallet wrong (available=%, clearing=%)', v_avail, v_clear;
  end if;

  select count(*) into v_n from public.ledger_entries
   where idempotency_key = 'withdraw:' || v_order;
  if v_n <> 2 then
    raise exception 'FAIL: expected a DEBIT/CREDIT pair, found % entries', v_n;
  end if;

  select balance into v_ext from public.system_accounts where kind = 'EXTERNAL';
  if v_ext <> v_ext0 + 500 then
    raise exception 'FAIL: EXTERNAL did not receive the outflow (% -> %)', v_ext0, v_ext;
  end if;

  -- Replayed confirmation: a no-op, not a second pair.
  v_res := public.confirm_withdrawal(v_order, '0xdeadbeef');
  if (v_res ->> 'changed')::boolean then
    raise exception 'FAIL: a repeated confirm changed state';
  end if;
  select count(*) into v_n from public.ledger_entries
   where idempotency_key = 'withdraw:' || v_order;
  if v_n <> 2 then
    raise exception 'FAIL: a repeated confirm double-posted the ledger (% entries)', v_n;
  end if;

  -- =========================================================================
  -- 7. Large withdrawal: two DISTINCT administrators.
  -- =========================================================================
  perform set_config('request.jwt.claim.sub', v_player::text, false);
  v_res := public.request_withdrawal(15000.00, 'TXbig00000000000000000000000000000', 'TRX', 'USDT');
  v_order2 := v_res ->> 'order_id';

  perform set_config('request.jwt.claim.sub', v_admin1::text, false);
  v_res := public.approve_withdrawal(v_order2);
  if (v_res ->> 'required')::int <> 2 then
    raise exception 'FAIL: $15000 should need two approvals, needs %', v_res ->> 'required';
  end if;
  if (v_res ->> 'held')::boolean then
    raise exception 'FAIL: funds were held on a single approval of a large withdrawal';
  end if;

  -- The same administrator again. Must not count as the second signature.
  v_res := public.approve_withdrawal(v_order2);
  if (v_res ->> 'approvals')::int <> 1 then
    raise exception 'FAIL: one administrator clicking twice counted as % approvals',
      v_res ->> 'approvals';
  end if;
  if (v_res ->> 'held')::boolean then
    raise exception 'FAIL: one administrator approved a two-person withdrawal by clicking twice';
  end if;

  select clearing_balance into v_clear from public.profiles where id = v_player;
  if v_clear <> 0 then
    raise exception 'FAIL: an under-approved withdrawal held funds (clearing=%)', v_clear;
  end if;

  -- A second, different administrator completes it.
  perform set_config('request.jwt.claim.sub', v_admin2::text, false);
  v_res := public.approve_withdrawal(v_order2);
  if not (v_res ->> 'held')::boolean then
    raise exception 'FAIL: two distinct approvals did not hold the funds';
  end if;

  select balance, clearing_balance into v_avail, v_clear
    from public.profiles where id = v_player;
  if v_avail <> 4500 or v_clear <> 15000 then
    raise exception 'FAIL: large hold is wrong (available=%, clearing=%)', v_avail, v_clear;
  end if;

  -- =========================================================================
  -- 8. Rollback returns the hold, exactly once.
  -- =========================================================================
  v_res := public.rollback_withdrawal(v_order2, 'test rollback');
  if not (v_res ->> 'ok')::boolean then
    raise exception 'FAIL: rollback refused: %', v_res;
  end if;

  select balance, clearing_balance into v_avail, v_clear
    from public.profiles where id = v_player;
  if v_avail <> 19500 or v_clear <> 0 then
    raise exception 'FAIL: rollback did not return the hold (available=%, clearing=%)',
      v_avail, v_clear;
  end if;

  v_res := public.rollback_withdrawal(v_order2, 'test rollback again');
  if (v_res ->> 'changed')::boolean then
    raise exception 'FAIL: a repeated rollback changed state';
  end if;
  select balance into v_avail from public.profiles where id = v_player;
  if v_avail <> 19500 then
    raise exception 'FAIL: a repeated rollback refunded twice (balance=%)', v_avail;
  end if;

  -- =========================================================================
  -- 9. Rollback from REQUESTED: nothing was held, so nothing is returned.
  -- =========================================================================
  perform set_config('request.jwt.claim.sub', v_player::text, false);
  v_res := public.request_withdrawal(100.00, 'TXnew00000000000000000000000000000', 'TRX', 'USDT');
  v_order2 := v_res ->> 'order_id';

  perform public.rollback_withdrawal(v_order2, 'rejected at review');
  select balance, clearing_balance into v_avail, v_clear
    from public.profiles where id = v_player;
  if v_avail <> 19500 or v_clear <> 0 then
    raise exception 'FAIL: rolling back an unheld request moved money (available=%, clearing=%)',
      v_avail, v_clear;
  end if;

  -- =========================================================================
  -- 10. A player cannot overdraw by requesting more than they hold.
  -- =========================================================================
  v_ok := false;
  begin
    perform public.request_withdrawal(999999.00, 'TXzzz00000000000000000000000000000', 'TRX', 'USDT');
  exception when others then
    if sqlerrm not like '%insufficient_balance%' then raise; end if;
    v_ok := true;
  end;
  if not v_ok then
    raise exception 'FAIL: a withdrawal larger than the balance was accepted';
  end if;

  -- --- cleanup --------------------------------------------------------------
  -- The ledger holds a RESTRICT reference to the profile on purpose: a player
  -- with money history cannot simply be deleted. Only a test tears its own
  -- entries down first — production deactivates the account instead.
  perform set_config('request.jwt.claim.sub', '', false);
  delete from public.ledger_entries
   where account_user_id = v_player or counterparty_user_id = v_player;
  delete from auth.users where id in (v_player, v_admin1, v_admin2);

  raise notice 'PASS — hold, dual approval, ledger pairing and rollback all hold';
end $$;


-- =============================================================================
-- Deposits reach the ledger — from BOTH rails, and exactly once.
--
-- 0017 does not rewrite either deposit function. It hangs a trigger off the
-- row each one writes, so the ledger records what already happened rather than
-- deciding it. These checks drive the tables directly, which is the same thing
-- the functions do and keeps the test independent of their signatures.
-- =============================================================================
do $$
declare
  v_player uuid := 'eeeeeeee-0000-4000-8000-eeeeeeeeeeee';
  v_ext0   numeric;
  v_ext    numeric;
  v_n      int;
  v_notes  int;
begin
  delete from public.ledger_entries
   where account_user_id = v_player or counterparty_user_id = v_player;
  delete from auth.users where id = v_player;
  insert into auth.users (id, email) values (v_player, 'dep-player@test.local');

  select balance from public.system_accounts where kind = 'EXTERNAL' into v_ext0;

  -- --- TRON: the primary deposit rail (0016) --------------------------------
  insert into public.tron_deposits
    (tx_hash, user_id, address, amount, contract, credited_usd, credited_at)
  values
    ('0xtrontest1', v_player, 'TXtest000000000000000000000000000', 250.123456,
     'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', 250.12, now());

  select count(*) into v_n from public.ledger_entries
   where idempotency_key = 'deposit:tron:0xtrontest1';
  if v_n <> 2 then
    raise exception 'FAIL: a credited TRON deposit did not post a DEBIT/CREDIT pair (% entries)', v_n;
  end if;

  -- EXTERNAL goes NEGATIVE on a deposit. That is correct: negated, it is what
  -- the platform owes players and must hold on chain.
  select balance into v_ext from public.system_accounts where kind = 'EXTERNAL';
  if v_ext <> v_ext0 - 250.12 then
    raise exception 'FAIL: EXTERNAL did not fund the TRON deposit (% -> %)', v_ext0, v_ext;
  end if;

  -- The player is told. 0016 credits silently on its own.
  select count(*) into v_notes from public.notifications
   where user_id = v_player and type = 'deposit';
  if v_notes < 1 then
    raise exception 'FAIL: a credited TRON deposit notified nobody';
  end if;

  -- A re-scan. The watcher has no memory beyond this table, so seeing the same
  -- transfer again is normal, not exceptional.
  update public.tron_deposits set raw = '{"rescan":true}'::jsonb
   where tx_hash = '0xtrontest1';

  select count(*) into v_n from public.ledger_entries
   where idempotency_key = 'deposit:tron:0xtrontest1';
  if v_n <> 2 then
    raise exception 'FAIL: re-touching a credited deposit double-posted the ledger (% entries)', v_n;
  end if;

  -- --- A deposit that was REFUSED must post nothing --------------------------
  insert into public.tron_deposits
    (tx_hash, user_id, address, amount, contract, rejected_reason)
  values
    ('0xtronreject', v_player, 'TXtest000000000000000000000000000', 5,
     'TBadContract000000000000000000000', 'wrong_contract');

  select count(*) into v_n from public.ledger_entries
   where idempotency_key = 'deposit:tron:0xtronreject';
  if v_n <> 0 then
    raise exception 'FAIL: a REJECTED deposit reached the ledger (% entries)', v_n;
  end if;

  -- --- CCPayment: still live for coins TRON does not carry -------------------
  select balance from public.system_accounts where kind = 'EXTERNAL' into v_ext0;

  insert into public.ccp_deposits
    (record_id, user_id, coin, amount, coin_usd_price, amount_usd, status, credited_at)
  values
    ('rec-ccp-1', v_player, 'ETH', 0.05, 2000, 100.00, 'Success', now());

  select count(*) into v_n from public.ledger_entries
   where idempotency_key = 'deposit:ccp:rec-ccp-1';
  if v_n <> 2 then
    raise exception 'FAIL: a credited CCPayment deposit did not post a pair (% entries)', v_n;
  end if;

  select balance into v_ext from public.system_accounts where kind = 'EXTERNAL';
  if v_ext <> v_ext0 - 100.00 then
    raise exception 'FAIL: EXTERNAL did not fund the CCPayment deposit (% -> %)', v_ext0, v_ext;
  end if;

  -- An uncredited CCPayment row (held for review, or still Processing) posts
  -- nothing — `credited_at` is the flag, not `status`.
  insert into public.ccp_deposits
    (record_id, user_id, coin, amount, coin_usd_price, amount_usd, status, is_risky)
  values
    ('rec-ccp-risky', v_player, 'ETH', 1, 2000, 2000.00, 'Success', true);

  select count(*) into v_n from public.ledger_entries
   where idempotency_key = 'deposit:ccp:rec-ccp-risky';
  if v_n <> 0 then
    raise exception 'FAIL: an uncredited deposit reached the ledger (% entries)', v_n;
  end if;

  -- --- cleanup --------------------------------------------------------------
  delete from public.tron_deposits where user_id = v_player;
  delete from public.ccp_deposits  where user_id = v_player;
  delete from public.ledger_entries
   where account_user_id = v_player or counterparty_user_id = v_player;
  delete from auth.users where id = v_player;

  raise notice 'PASS — both deposit rails post to the ledger once, refused deposits post nothing';
end $$;




-- =============================================================================
-- The flow whitelist, and who may call what.
-- =============================================================================
do $$
declare v_ok boolean;
begin
  -- An unlisted path is refused outright. TREASURY -> EXTERNAL would be the
  -- house quietly paying itself out through the player off-ramp.
  if public.is_flow_allowed('TREASURY', 'EXTERNAL') then
    raise exception 'FAIL: TREASURY -> EXTERNAL is on the whitelist';
  end if;
  if public.is_flow_allowed('EXTERNAL', 'TREASURY') then
    raise exception 'FAIL: EXTERNAL -> TREASURY is on the whitelist';
  end if;
  if not public.is_flow_allowed('EXTERNAL', 'PLAYER') then
    raise exception 'FAIL: deposits are not on the whitelist';
  end if;

  v_ok := false;
  begin
    perform public.post_ledger_pair(
      'test:illegal', 'x', 'TREASURY', null, 'EXTERNAL', null, 10.00, 'ADJUSTMENT');
  exception when others then
    if sqlerrm not like '%illegal_fund_flow%' then raise; end if;
    v_ok := true;
  end;
  if not v_ok then
    raise exception 'FAIL: post_ledger_pair wrote an unlisted flow';
  end if;

  -- The service-role transitions must not be reachable from a browser session.
  if has_function_privilege('authenticated', 'public.confirm_withdrawal(text,text,jsonb)', 'execute') then
    raise exception 'FAIL: authenticated may call confirm_withdrawal';
  end if;
  if has_function_privilege('authenticated', 'public.rollback_withdrawal(text,text,jsonb)', 'execute') then
    raise exception 'FAIL: authenticated may call rollback_withdrawal';
  end if;
  if has_function_privilege('authenticated', 'public.hold_funds(uuid,numeric)', 'execute') then
    raise exception 'FAIL: authenticated may call hold_funds';
  end if;
  if has_function_privilege('authenticated', 'public.post_ledger_pair(text,text,text,uuid,text,uuid,numeric,text,jsonb)', 'execute') then
    raise exception 'FAIL: authenticated may post ledger entries directly';
  end if;
  -- ...but the player-facing one must be.
  if not has_function_privilege('authenticated', 'public.request_withdrawal(numeric,text,text,text,text,int,numeric)', 'execute') then
    raise exception 'FAIL: authenticated cannot request a withdrawal';
  end if;

  raise notice 'PASS — unlisted flows refused; privileged transitions unreachable from the client';
end $$;
