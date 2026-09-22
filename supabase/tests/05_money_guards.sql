-- =============================================================================
-- 05_money_guards.sql — stake validation (0012).
--
--   psql -h 127.0.0.1 -p 55433 -U postgres -d wager_local -f supabase/tests/05_money_guards.sql
--
-- NaN is the case worth pinning: it is not a weird input, it is a value that
-- passes every ordinary comparison. `NaN <= 0` is false and `NaN > 0` is true,
-- so the original guards waved it through and the balance became NaN — after
-- which every debit "succeeds" forever. PostgREST coerces {"p_amount":"NaN"}
-- to exactly this, so it is reachable from the open internet.
-- =============================================================================
\set ON_ERROR_STOP on

do $$
declare
  v_user    uuid := 'aaaaaaaa-0000-4000-8000-aaaaaaaaaaaa';
  v_before  numeric;
  v_after   numeric;
  v_ok      boolean;
  v_game    text;
begin
  delete from auth.users where id = v_user;
  insert into auth.users (id, email) values (v_user, 'moneyguard@test.local');
  perform public.adjust_balance(v_user, 1000);
  perform set_config('request.jwt.claim.sub', v_user::text, false);

  -- The premise, stated as a check so it cannot rot: NaN really does pass the
  -- comparisons that look like they would stop it.
  if not ('NaN'::numeric > 0) or ('NaN'::numeric <= 0) then
    raise exception 'FAIL: this database does not order NaN the way the fix assumes';
  end if;

  -- --- NaN stake -----------------------------------------------------------
  select balance into v_before from public.profiles where id = v_user;
  v_ok := false;
  begin
    perform public.place_bet('dice', 'NaN'::numeric);
  exception when others then
    if sqlerrm not like '%invalid_amount%' then raise; end if;
    v_ok := true;
  end;
  if not v_ok then raise exception 'FAIL: a NaN stake was accepted'; end if;

  select balance into v_after from public.profiles where id = v_user;
  if v_after <> v_after then
    raise exception 'FAIL: balance is NaN — the account is now an infinite bankroll';
  end if;
  if v_after <> v_before then
    raise exception 'FAIL: a refused stake still moved the balance (% -> %)', v_before, v_after;
  end if;

  -- --- NaN through the credit side too --------------------------------------
  v_ok := false;
  begin
    perform public.adjust_balance(v_user, 'NaN'::numeric);
  exception when others then
    if sqlerrm not like '%invalid_amount%' then raise; end if;
    v_ok := true;
  end;
  if not v_ok then raise exception 'FAIL: adjust_balance accepted NaN'; end if;

  -- --- sub-cent stake -------------------------------------------------------
  -- 0.005 debits 0.00 against a numeric(18,2) balance but is stored and paid
  -- out as 0.01: the difference is minted.
  v_ok := false;
  begin
    perform public.place_bet('dice', 0.005);
  exception when others then
    if sqlerrm not like '%invalid_amount_precision%' then raise; end if;
    v_ok := true;
  end;
  if not v_ok then raise exception 'FAIL: a sub-cent stake was accepted'; end if;

  -- --- the ordinary cases still work ----------------------------------------
  select balance into v_before from public.profiles where id = v_user;
  v_game := (public.place_bet('dice', 10.25)).bet_id;
  select balance into v_after from public.profiles where id = v_user;
  if v_after <> v_before - 10.25 then
    raise exception 'FAIL: a valid two-decimal stake did not debit correctly (% -> %)', v_before, v_after;
  end if;
  perform public.settle_bet(v_game, 2.0, '{}'::jsonb);

  -- and the guards that were already there are untouched
  for v_ok in select unnest(array[true]) loop end loop;
  begin
    perform public.place_bet('dice', -5);
    raise exception 'FAIL: a negative stake was accepted';
  exception when others then
    if sqlerrm like 'FAIL:%' then raise; end if;
    if sqlerrm not like '%invalid_amount%' then raise; end if;
  end;
  begin
    perform public.place_bet('dice', 999999);
    raise exception 'FAIL: an unaffordable stake was accepted';
  exception when others then
    if sqlerrm like 'FAIL:%' then raise; end if;
    if sqlerrm not like '%insufficient_balance%' then raise; end if;
  end;

  perform set_config('request.jwt.claim.sub', '', false);
  delete from auth.users where id = v_user;

  raise notice 'PASS — NaN and sub-cent stakes refused; ordinary stakes unaffected';
end $$;
