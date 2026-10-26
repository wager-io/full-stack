-- =============================================================================
-- 08_withdrawal_walkthrough.sql — the whole lifecycle, by hand, in Studio.
--
-- Paste the ENTIRE file into the Supabase SQL editor and hit run. There is
-- nothing to fill in: it creates its own player and its own two admins, uses
-- fixed UUIDs, and cleans up the previous run every time, so it is safe to run
-- over and over.
--
-- Unlike 07 (which asserts and stays silent on success), this one ENDS IN
-- SELECTs. You get four result grids showing what actually moved — because
-- Studio's Results pane renders rows, and ignores the RAISE NOTICE that 07
-- reports through.
--
-- This is a demo against seeded fixtures, not a test. 07 is the test.
--
-- CCPayment is never contacted. request/approve/broadcast/confirm are pure
-- SQL; only the Edge Functions talk to the gateway. So this runs on a local
-- stack with no API credentials at all.
-- =============================================================================

-- --- fixtures: fixed ids so the SELECTs at the bottom can find them ---------
do $$
declare
  v_player uuid := '11111111-1111-4111-8111-111111111111';
  v_admin1 uuid := '22222222-2222-4222-8222-222222222222';
  v_admin2 uuid := '33333333-3333-4333-8333-333333333333';
  v_small  text;
  v_large  text;
  v_res    jsonb;
begin
  -- Previous run. Ledger entries first: they hold a RESTRICT reference to the
  -- profile precisely so money history cannot be deleted by accident.
  delete from public.ledger_entries
   where account_user_id in (v_player, v_admin1, v_admin2)
      or counterparty_user_id in (v_player, v_admin1, v_admin2);
  delete from auth.users where id in (v_player, v_admin1, v_admin2);

  insert into auth.users (id, email) values
    (v_player, 'walkthrough-player@test.local'),
    (v_admin1, 'walkthrough-admin1@test.local'),
    (v_admin2, 'walkthrough-admin2@test.local');

  -- is_admin is a privileged column (0003); the GUC is how a definer function
  -- opts in to changing one.
  perform set_config('app.allow_balance_change', 'on', true);
  update public.profiles set is_admin = true where id in (v_admin1, v_admin2);
  perform set_config('app.allow_balance_change', 'off', true);

  perform public.adjust_balance(v_player, 20000);

  -- =========================================================================
  -- A small withdrawal, start to finish.
  -- =========================================================================
  perform set_config('request.jwt.claim.sub', v_player::text, false);
  v_res   := public.request_withdrawal(500.00, 'TXwalkthrough000000000000000000000', 'TRX', 'USDT');
  v_small := v_res ->> 'order_id';
  raise notice 'small withdrawal % requested — balance NOT yet touched', v_small;

  -- One admin is enough below the dual-confirm threshold. This is the step
  -- that moves available -> clearing.
  perform set_config('request.jwt.claim.sub', v_admin1::text, false);
  perform public.approve_withdrawal(v_small);

  -- Standing in for the gateway: normally withdrawal-dispatch submits to
  -- CCPayment and writes the hash, then the webhook confirms.
  perform public.broadcast_withdrawal(v_small, '0xwalkthroughhash', 'rec-walk-1', null, 500.0);
  perform public.confirm_withdrawal(v_small, '0xwalkthroughhash');

  -- =========================================================================
  -- A large one, to show the two-person rule refusing a single signature.
  -- =========================================================================
  perform set_config('request.jwt.claim.sub', v_player::text, false);
  v_res   := public.request_withdrawal(15000.00, 'TXwalkthroughbig000000000000000000', 'TRX', 'USDT');
  v_large := v_res ->> 'order_id';

  perform set_config('request.jwt.claim.sub', v_admin1::text, false);
  v_res := public.approve_withdrawal(v_large);
  raise notice 'after admin1: % of % approvals, held=%',
    v_res ->> 'approvals', v_res ->> 'required', v_res ->> 'held';

  -- The same admin again. Deliberately does not count twice.
  v_res := public.approve_withdrawal(v_large);
  raise notice 'after admin1 clicking AGAIN: still % approvals, held=%',
    v_res ->> 'approvals', v_res ->> 'held';

  -- Left sitting at one-of-two on purpose, so the queue below has something in
  -- it and you can approve it yourself from the admin screen.
  perform set_config('request.jwt.claim.sub', '', false);
end $$;


-- =============================================================================
-- 1. The wallet. `balance` is spendable; `clearing_balance` is held.
--
--    Expect 19500 available / 0 held:
--      20000 start
--       -500 small withdrawal — approved, confirmed, gone for good
--          0 large withdrawal — NOT held, because one of its two required
--            approvals is still missing
--
--    That second line is the point. An under-approved withdrawal holds
--    NOTHING: a half-approved $15,000 request must not lock up a player's
--    balance while it waits for a manager to come back from lunch. The hold
--    happens on the LAST required approval, not the first.
--
--    Approve it as admin2 and re-run this query to watch 15000 move across:
--      select set_config('request.jwt.claim.sub',
--                        '33333333-3333-4333-8333-333333333333', false);
--      select public.approve_withdrawal('<order_id from grid 2>');
-- =============================================================================
select username,
       balance            as available,
       clearing_balance   as held_in_clearing,
       balance + clearing_balance as total
  from public.profiles
 where id = '11111111-1111-4111-8111-111111111111';


-- =============================================================================
-- 2. Both withdrawals and where each one stopped.
-- =============================================================================
select order_id,
       amount,
       state,
       status            as legacy_status,
       array_length(approvals, 1) as approvals,
       case when amount > public.withdrawal_dual_confirm_usd() then 2 else 1 end as required,
       tx_hash
  from public.withdrawals
 where user_id = '11111111-1111-4111-8111-111111111111'
 -- By id, not created_at: both rows are written in one transaction, where
 -- now() is frozen, so ordering by created_at is a coin toss.
 order by id;


-- =============================================================================
-- 3. The ledger. Two rows per movement — same idempotency_key, opposite
--    directions. Only the CONFIRMED withdrawal appears: nothing is written to
--    the book until money has actually left.
-- =============================================================================
select idempotency_key,
       account_kind,
       counterparty_kind,
       direction,
       amount,
       type
  from public.ledger_entries
 where business_id in (
         select order_id from public.withdrawals
          where user_id = '11111111-1111-4111-8111-111111111111')
 order by idempotency_key, direction;


-- =============================================================================
-- 4. The review queue, as the admin screen sees it.
--
--    Shows the large withdrawal at 1 of 2. Run this as one of the admins to
--    get rows back — withdrawal_queue gates on is_admin() internally, so a
--    non-admin gets an empty grid rather than an error:
--
--      select set_config('request.jwt.claim.sub',
--                        '22222222-2222-4222-8222-222222222222', false);
-- =============================================================================
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', false);

select order_id, username, amount, state, approved_by, required, address
  from public.withdrawal_queue(50);
