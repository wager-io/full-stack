-- =============================================================================
-- 09_rakeback.sql — rakeback (0023).
--
--   psql -h 127.0.0.1 -p 5439 -U postgres -d wager_main -f supabase/tests/09_rakeback.sql
--
-- Concurrency note: rakeback_claim() locks the account row FOR UPDATE and only
-- then reads `accrued`. Under READ COMMITTED a second claim blocks on the lock,
-- and when it resumes it reads the row as the first claim committed it
-- (accrued already reduced), so it finds nothing to pay. A single psql file is
-- one session and cannot show that; see the two-session check run alongside
-- this file (two backgrounded psql sessions, the first holding its transaction
-- open with pg_sleep) in the implementation report.
-- =============================================================================
\set ON_ERROR_STOP on

do $$
begin
  if current_database() not in ('wager_main', 'wager_local', 'wager_test') then
    raise exception 'refusing to run: % is not a local test database', current_database();
  end if;
end $$;

-- Fresh users every run: ledger rows reference profiles with ON DELETE RESTRICT,
-- so a previous run's players cannot be deleted.
select set_config('rb.none', gen_random_uuid()::text, false),
       set_config('rb.bronze', gen_random_uuid()::text, false) \gset

do $$
declare
  v_none   uuid := current_setting('rb.none')::uuid;
  v_bronze uuid := current_setting('rb.bronze')::uuid;
  v_acc    numeric;
  v_bal0   numeric;
  v_bal1   numeric;
  v_bet    public.bets;
  v_n      int;
  r        record;
  v_ok     boolean;
begin
  insert into auth.users (id, email) values (v_none, v_none || '@rb.local'), (v_bronze, v_bronze || '@rb.local');
  perform public.adjust_balance(v_none, 1000);
  perform public.adjust_balance(v_bronze, 100000);
  -- Bronze requires 10000 wagered; set the wager too or vip_recalc would
  -- demote the player on their first bet.
  update public.vip_progress set current_wager = 10000, current_tier = 'Bronze' where user_id = v_bronze;

  -- --- None tier: nothing accrues ------------------------------------------
  perform set_config('request.jwt.claim.sub', v_none::text, false);
  perform public.place_bet('dice', 100);
  if exists (select 1 from public.rakeback_accounts where user_id = v_none) then
    raise exception 'FAIL: a None-tier bet accrued rakeback';
  end if;

  -- --- Bronze: dice 1000 -> exactly 0.35 -------------------------------------
  perform set_config('request.jwt.claim.sub', v_bronze::text, false);
  v_bet := public.place_bet('dice', 1000);
  select accrued into v_acc from public.rakeback_accounts where user_id = v_bronze;
  if v_acc <> 0.35 then raise exception 'FAIL: dice 1000 accrued % not 0.35', v_acc; end if;

  -- a losing bet accrues
  perform public.settle_bet(v_bet.bet_id, 0, '{}');
  perform public.place_bet('dice', 1000);
  select accrued into v_acc from public.rakeback_accounts where user_id = v_bronze;
  if v_acc <> 0.70 then raise exception 'FAIL: second bet accrued to % not 0.70', v_acc; end if;

  -- a winning bet accrues too
  v_bet := public.place_bet('dice', 1000);
  perform public.settle_bet(v_bet.bet_id, 2, '{}');
  select accrued into v_acc from public.rakeback_accounts where user_id = v_bronze;
  if v_acc <> 1.05 then raise exception 'FAIL: winning bet accrued to % not 1.05', v_acc; end if;

  -- --- several games --------------------------------------------------------
  update public.rakeback_accounts set accrued = 0, lifetime_accrued = 0 where user_id = v_bronze;
  perform public.place_bet('limbo', 200);   -- 0.07
  perform public.place_bet('plinko', 300);  -- 0.105
  perform public.place_bet('mines', 400);   -- 0.14
  perform public.place_bet('hilo', 500);    -- 0.175
  perform public.place_bet('keno', 600);    -- 0.21
  perform public.place_bet('crash', 700);   -- 0.245
  select accrued into v_acc from public.rakeback_accounts where user_id = v_bronze;
  if v_acc <> 0.945 then raise exception 'FAIL: multi-game accrual % not 0.945', v_acc; end if;

  -- a different edge is honoured
  update public.rakeback_game_edge set edge = 0.02 where game = 'dice';
  update public.rakeback_accounts set accrued = 0 where user_id = v_bronze;
  perform public.place_bet('dice', 1000);   -- 1000*0.02*0.035
  select accrued into v_acc from public.rakeback_accounts where user_id = v_bronze;
  if v_acc <> 0.70 then raise exception 'FAIL: edge 0.02 accrued % not 0.70', v_acc; end if;
  update public.rakeback_game_edge set edge = 0.01 where game = 'dice';

  -- --- edge-less game: no accrual, bet still succeeds ---------------------------
  update public.rakeback_accounts set accrued = 0 where user_id = v_bronze;
  delete from public.rakeback_game_edge where game = 'crash';
  perform public.place_bet('crash', 1000);
  insert into public.bets (user_id, game, bet_amount) values (v_bronze, 'no_such_game', 1000);
  select accrued into v_acc from public.rakeback_accounts where user_id = v_bronze;
  if v_acc <> 0 then raise exception 'FAIL: edge-less game accrued %', v_acc; end if;
  insert into public.rakeback_game_edge (game, edge) values ('crash', 0.01);

  -- a bet row for a player with no vip_progress row must not raise either
  delete from public.vip_progress where user_id = v_bronze;
  perform public.place_bet('dice', 1000);
  select accrued into v_acc from public.rakeback_accounts where user_id = v_bronze;
  if v_acc <> 0 then raise exception 'FAIL: player without vip_progress accrued %', v_acc; end if;
  insert into public.vip_progress (user_id, current_wager, current_tier) values (v_bronze, 10000, 'Bronze');

  -- --- status ---------------------------------------------------------------
  update public.rakeback_accounts set accrued = 1.23456789 where user_id = v_bronze;
  if (public.rakeback_status() ->> 'claimable')::numeric <> 1.23
     or (public.rakeback_status() ->> 'eligible')::boolean is not true then
    raise exception 'FAIL: status wrong: %', public.rakeback_status();
  end if;
  perform set_config('request.jwt.claim.sub', v_none::text, false);
  if (public.rakeback_status() ->> 'eligible')::boolean is not false then
    raise exception 'FAIL: None tier reported eligible';
  end if;
  perform set_config('request.jwt.claim.sub', v_bronze::text, false);

  -- --- claim: < 0.01 -> nothing_to_claim ----------------------------------------
  update public.rakeback_accounts set accrued = 0.009 where user_id = v_bronze;
  v_ok := false;
  begin
    perform * from public.rakeback_claim();
  exception when others then
    if sqlerrm <> 'nothing_to_claim' then raise; end if;
    v_ok := true;
  end;
  if not v_ok then raise exception 'FAIL: sub-cent claim did not raise nothing_to_claim'; end if;

  -- --- claim: floors to cents, remainder stays ----------------------------------
  update public.rakeback_accounts set accrued = 1.23456789 where user_id = v_bronze;
  select balance into v_bal0 from public.profiles where id = v_bronze;
  select * into r from public.rakeback_claim();
  select balance into v_bal1 from public.profiles where id = v_bronze;
  if r.amount <> 1.23 then raise exception 'FAIL: paid % not 1.23', r.amount; end if;
  if v_bal1 <> v_bal0 + 1.23 or r.balance <> v_bal1 then
    raise exception 'FAIL: balance % -> % (returned %)', v_bal0, v_bal1, r.balance;
  end if;
  select accrued into v_acc from public.rakeback_accounts where user_id = v_bronze;
  if v_acc <> 0.00456789 then raise exception 'FAIL: remainder % not 0.00456789', v_acc; end if;
  if (select lifetime_claimed from public.rakeback_accounts where user_id = v_bronze) <> 1.23 then
    raise exception 'FAIL: lifetime_claimed wrong';
  end if;

  select count(*) into v_n from public.bills
   where user_id = v_bronze and transaction_type = 'rakeback' and bill_id = r.claim_id and trx_amount = 1.23;
  if v_n <> 1 then raise exception 'FAIL: expected 1 rakeback bills row, got %', v_n; end if;

  select count(*) into v_n from public.ledger_entries
   where idempotency_key = 'rakeback:' || r.claim_id and type = 'ADJUSTMENT' and amount = 1.23
     and ((direction = 'DEBIT'  and account_kind = 'TREASURY')
       or (direction = 'CREDIT' and account_kind = 'PLAYER' and account_user_id = v_bronze));
  if v_n <> 2 then raise exception 'FAIL: expected a 2-row ledger pair, got %', v_n; end if;

  select count(*) into v_n from public.rakeback_claims where claim_id = r.claim_id and amount = 1.23;
  if v_n <> 1 then raise exception 'FAIL: rakeback_claims row missing'; end if;

  -- --- second immediate claim --------------------------------------------------
  v_ok := false;
  begin
    perform * from public.rakeback_claim();
  exception when others then
    if sqlerrm <> 'nothing_to_claim' then raise; end if;
    v_ok := true;
  end;
  if not v_ok then raise exception 'FAIL: second claim did not raise nothing_to_claim'; end if;

  -- eligibility is not re-checked at claim time
  update public.vip_progress set current_tier = 'None', current_wager = 0 where user_id = v_bronze;
  update public.rakeback_accounts set accrued = 0.5 where user_id = v_bronze;
  select * into r from public.rakeback_claim();
  if r.amount <> 0.5 then raise exception 'FAIL: de-tiered player could not claim accrued rakeback'; end if;

  raise notice 'PASS: accrual, claim, ledger and bills';
end $$;

-- --- client access ----------------------------------------------------------------
do $$
declare
  v_bronze uuid := current_setting('rb.bronze')::uuid;
  v_t text;
  v_ok boolean;
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', v_bronze::text, false);

  foreach v_t in array array['rakeback_accounts','rakeback_claims','rakeback_settings','rakeback_game_edge'] loop
    v_ok := false;
    begin
      execute format('delete from public.%I where false', v_t);
    exception when insufficient_privilege then v_ok := true; end;
    if not v_ok then raise exception 'FAIL: authenticated can DELETE from %', v_t; end if;
  end loop;

  -- concrete forged writes
  v_ok := false;
  begin
    update public.rakeback_settings set rate = 1;
  exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FAIL: client updated rakeback_settings'; end if;

  v_ok := false;
  begin
    insert into public.rakeback_accounts (user_id, accrued) values (v_bronze, 1000000);
  exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FAIL: client inserted rakeback_accounts'; end if;

  v_ok := false;
  begin
    update public.rakeback_accounts set accrued = 1000000 where user_id = v_bronze;
  exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FAIL: client updated rakeback_accounts'; end if;

  v_ok := false;
  begin
    insert into public.rakeback_claims (user_id, amount) values (v_bronze, 1000000);
  exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FAIL: client inserted rakeback_claims'; end if;

  v_ok := false;
  begin
    update public.rakeback_game_edge set edge = 0;
  exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FAIL: client updated rakeback_game_edge'; end if;

  -- own-row read works
  if (select count(*) from public.rakeback_accounts) <> 1 then
    raise exception 'FAIL: player cannot read exactly their own account row';
  end if;

  -- anon cannot call claim or status
  set local role anon;
  v_ok := false;
  begin
    perform * from public.rakeback_claim();
  exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FAIL: anon can call rakeback_claim'; end if;
  v_ok := false;
  begin
    perform public.rakeback_status();
  exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FAIL: anon can call rakeback_status'; end if;

  raise notice 'PASS: client privileges';
end $$;

reset role;
