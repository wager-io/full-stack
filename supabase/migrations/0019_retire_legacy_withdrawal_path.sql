-- =============================================================================
-- 0019_retire_legacy_withdrawal_path.sql — one way to withdraw, not two.
--
-- 0015 shipped a complete CCPayment withdrawal path:
--
--     ccp_withdrawal_request(numeric, text, text, text, text)
--     ccp_fail_withdrawal(text, text)
--     ccp_settle_withdrawal(text, text, jsonb)
--
-- It works, and that is the problem. ccp_withdrawal_request DEBITS THE BALANCE
-- IMMEDIATELY and hands the order straight to the gateway: no clearing hold, no
-- administrator approval, no second signature above the threshold, and no
-- ledger entry. Anything still able to call it bypasses every control 0017
-- adds, and the money is gone before a person has looked at the request.
--
-- Two withdrawal paths where one skips the safeguards is not a fallback. It is
-- the safeguards being optional.
--
-- WHAT IS DELIBERATELY KEPT. The DEPOSIT side of 0015 is untouched —
-- ccp_credit_deposit and ccp_bind_address stay exactly as they are, and the
-- ccpayment-webhook and ccpayment-address functions keep calling them.
-- CCPayment is still a live deposit rail for coins the TRON path in 0016 does
-- not carry. Only the withdrawal half is superseded.
--
-- ORDERING. The replacement edge function (withdrawal-dispatch) must be
-- deployed BEFORE this migration runs, and ccpayment-withdraw removed, or a
-- request in flight hits a function that no longer exists.
--
-- Dropped BY NAME, every overload, not by a named signature. The live project
-- was found carrying ccp_settle_withdrawal(text, text, jsonb) — three
-- arguments — where an earlier draft of this work named four; the drop matched
-- nothing and reported success, and the superseded path stayed callable. A
-- signature-specific drop can only remove the shape you already expected.
-- =============================================================================

do $$
declare
  r record;
  v_dropped int := 0;
begin
  for r in
    select p.oid::regprocedure as sig
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and p.proname in (
         'ccp_withdrawal_request',
         'ccp_fail_withdrawal',
         'ccp_settle_withdrawal'
       )
  loop
    execute format('drop function if exists %s', r.sig);
    raise notice 'dropped superseded %', r.sig;
    v_dropped := v_dropped + 1;
  end loop;

  if v_dropped = 0 then
    raise notice 'nothing to drop — legacy withdrawal path already absent';
  end if;
end $$;


-- ---------------------------------------------------------------------------
-- ccp_withdrawals keeps its rows.
--
-- It is not dropped and not migrated into public.withdrawals. Any row in it
-- was created under the old model — the balance was ALREADY debited at request
-- time, and there is no clearing hold behind it. Copying those rows into the
-- new table would present them to withdrawal_queue as awaiting approval, and
-- approving one would call hold_funds and debit the same player a SECOND time.
--
-- So the table stays, read-only in practice, as the historical record of
-- withdrawals made the old way. Anything still open in it has to be settled by
-- hand, by someone who can see that the money already left the balance.
-- ---------------------------------------------------------------------------
comment on table public.ccp_withdrawals is
  'SUPERSEDED by public.withdrawals (0017). Historical rows only: these were '
  'debited at request time with no clearing hold, so they must NOT be migrated '
  'into the new table — approving one there would debit the player twice. '
  'Settle anything still open by hand.';
