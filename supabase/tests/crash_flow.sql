\set ON_ERROR_STOP on
do $$ begin if current_database() not in ('wager_local','wager_main','wager_test') then raise exception 'crash_flow.sql wipes crash_* tables; refusing to run on %', current_database(); end if; end $$;
-- =============================================================================
-- crash_flow.sql — Crash end to end (0024).
--
--   psql -h 127.0.0.1 -p 5439 -U postgres -d wager_main -f supabase/tests/crash_flow.sql
--
-- Runs as postgres inside ONE transaction that is rolled back, switching to the
-- `authenticated` / `anon` roles for client calls. Time is simulated by moving
-- crash_rounds.betting_ends_at / crash_round_secrets.crash_at; specific crash
-- points are forced by overwriting crash_round_secrets.crash_point (as postgres).
-- =============================================================================
\set ON_ERROR_STOP on
\set QUIET on
begin;

create temp table t_log (n serial, ok boolean, msg text);
grant all on t_log to public;
grant usage on sequence t_log_n_seq to public;

create or replace function pg_temp.chk(p_ok boolean, p_msg text) returns void language plpgsql as $$
begin
  insert into t_log (ok, msg) values (coalesce(p_ok, false), p_msg);
  if not coalesce(p_ok, false) then raise exception 'FAIL: %', p_msg; end if;
end $$;

-- Run a statement as a client role / user and capture the error (or 'OK').
create or replace function pg_temp.try(p_role text, p_user uuid, p_sql text) returns text language plpgsql as $$
declare v text := 'OK';
begin
  perform set_config('request.jwt.claim.sub', coalesce(p_user::text, ''), true);
  execute 'set local role ' || p_role;
  begin
    execute p_sql;
  exception when others then v := sqlerrm;
  end;
  execute 'reset role';
  return v;
end $$;

-- Force the current round's timeline: betting ended p_since_ms ago; crash point p_cp.
create or replace function pg_temp.warp(p_since_ms int, p_cp numeric default null) returns void language plpgsql as $$
declare v_id bigint; v_cp numeric; v_bea timestamptz;
begin
  select id into v_id from public.crash_rounds order by id desc limit 1;
  if p_cp is not null then update public.crash_round_secrets set crash_point = p_cp where round_id = v_id; end if;
  select crash_point into v_cp from public.crash_round_secrets where round_id = v_id;
  v_bea := clock_timestamp() - p_since_ms * interval '1 millisecond';
  update public.crash_rounds set betting_ends_at = v_bea where id = v_id;
  update public.crash_round_secrets
     set crash_at = v_bea + (ln(v_cp) / 0.00006) * interval '1 millisecond' where round_id = v_id;
end $$;

create or replace function pg_temp.as_user(p_user uuid) returns void language plpgsql as $$
begin perform set_config('request.jwt.claim.sub', p_user::text, true); end $$;

do $$
declare
  ua uuid := 'c0000000-0000-4000-8000-00000000000a';
  ub uuid := 'c0000000-0000-4000-8000-00000000000b';
  uc uuid := 'c0000000-0000-4000-8000-00000000000c';
  ud uuid := 'c0000000-0000-4000-8000-00000000000d';
  ue uuid := 'c0000000-0000-4000-8000-00000000000e';
  v_state jsonb; v_r1 bigint; v_r2 bigint; v_r3 bigint;
  v_h1 text; v_h2 text; v_h3 text;
  v_res text; v_mult numeric; v_pay numeric; v_bal numeric; v_bal0 numeric;
  v_snap1 text; v_snap2 text;
  v_u uuid; v_exp numeric; v_cb public.crash_bets;
  v_all uuid[] := array[ua, ub, uc, ud, ue];
begin
  -- --- fixtures -------------------------------------------------------------
  delete from public.crash_bets; delete from public.crash_round_secrets;
  delete from public.crash_rounds; delete from public.crash_hashes;
  update public.crash_settings set salt = '', max_profit = 50, betting_ms = 5000, cooldown_ms = 3000;
  foreach v_u in array v_all loop
    delete from auth.users where id = v_u;
    insert into auth.users (id, email) values (v_u, 'crash-' || right(v_u::text, 1) || '@test.local');
    perform public.adjust_balance(v_u, 1000);
  end loop;

  -- --- chain init -----------------------------------------------------------
  perform pg_temp.chk(pg_temp.try('authenticated', ua, 'select public.crash_init_chain(5, ''x'')') like '%permission denied%',
    'crash_init_chain not callable by authenticated');
  perform pg_temp.chk(pg_temp.try('anon', null, 'select public.crash_init_chain(5, ''x'')') like '%permission denied%',
    'crash_init_chain not callable by anon');
  perform pg_temp.chk(pg_temp.try('authenticated', ua, 'select public.crash_tick()') like '%permission denied%',
    'crash_tick not callable by authenticated');
  perform pg_temp.chk(pg_temp.try('postgres', null, 'select public.crash_init_chain(0, ''salt'')') = 'invalid_count', 'init: count < 1 refused');
  perform pg_temp.chk(pg_temp.try('postgres', null, 'select public.crash_init_chain(5, '''')') = 'invalid_salt', 'init: empty salt refused');
  perform public.crash_init_chain(10, 'flow-test-salt');
  perform pg_temp.chk((select count(*) from public.crash_hashes) = 10 and (select salt from public.crash_settings) = 'flow-test-salt',
    'chain of 10 created, salt set');
  perform pg_temp.chk(pg_temp.try('postgres', null, 'select public.crash_init_chain(5, ''s2'')') = 'chain_not_exhausted',
    'init refused while unused hashes remain');
  perform pg_temp.chk((select bool_and(h.hash = encode(digest(l.hash, 'sha256'), 'hex'))
                         from public.crash_hashes h join public.crash_hashes l on l.idx = h.idx - 1),
    'stored chain: hash[idx] = sha256(hash[idx-1])');

  -- --- client tables are closed --------------------------------------------
  perform pg_temp.chk(pg_temp.try('authenticated', ua, 'select * from public.crash_bets') like '%permission denied%', 'crash_bets: no client access');
  perform pg_temp.chk(pg_temp.try('authenticated', ua, 'select * from public.crash_hashes') like '%permission denied%', 'crash_hashes: no client access');
  perform pg_temp.chk(pg_temp.try('anon', null, 'select * from public.crash_round_secrets') like '%permission denied%', 'crash_round_secrets: no client access');
  perform pg_temp.chk(pg_temp.try('authenticated', ua, 'update public.crash_rounds set phase=''crashed''') like '%permission denied%', 'crash_rounds: no client writes');

  -- --- round 1: opens on first crash_state (anon) --------------------------
  set local role anon;
  select public.crash_state() into v_state;
  reset role;
  v_r1 := (v_state->'round'->>'id')::bigint;
  perform pg_temp.chk(v_state->'round'->>'phase' = 'betting', 'round 1 opens in betting phase');
  perform pg_temp.chk(v_state->'round'->'crash_point' = 'null'::jsonb and v_state->'round'->'hash' = 'null'::jsonb,
    'crash_point/hash hidden while betting');
  perform pg_temp.chk(v_state->'my_bet' = 'null'::jsonb or v_state->'my_bet' is null, 'anon has no my_bet');
  perform pg_temp.chk((select count(*) from public.crash_hashes where used) = 1, 'one hash consumed');
  perform pg_temp.chk((select hash from public.crash_round_secrets where round_id = v_r1) =
                      (select hash from public.crash_hashes where idx = 10), 'highest idx consumed first');
  perform pg_temp.chk((select crash_point from public.crash_round_secrets where round_id = v_r1) =
                      public.pf_crash_point((select hash from public.crash_round_secrets where round_id = v_r1), 'flow-test-salt'),
    'secret crash_point = pf_crash_point(hash, salt)');
  perform pg_temp.warp(-4000, 3.00);   -- betting ends in 4s; cp forced to 3.00

  -- --- bets -----------------------------------------------------------------
  perform pg_temp.chk(pg_temp.try('anon', null, 'select * from public.crash_bet(10)') like '%permission denied%', 'anon cannot crash_bet');
  perform pg_temp.chk(pg_temp.try('authenticated', null, 'select * from public.crash_bet(10)') = 'not_authenticated', 'no user -> not_authenticated');
  perform pg_temp.chk(pg_temp.try('authenticated', ua, 'select * from public.crash_bet(10, 1.005)') = 'invalid_auto_cashout', 'auto 1.005 refused (3 dp)');
  perform pg_temp.chk(pg_temp.try('authenticated', ua, 'select * from public.crash_bet(10, 1.00)') = 'invalid_auto_cashout', 'auto 1.00 refused');
  perform pg_temp.chk(pg_temp.try('authenticated', ua, 'select * from public.crash_bet(10, 1000001)') = 'invalid_auto_cashout', 'auto > 1000000 refused');
  perform pg_temp.chk(pg_temp.try('authenticated', ua, 'select * from public.crash_bet(10, ''NaN'')') = 'invalid_auto_cashout', 'auto NaN refused');

  -- A: 100, no auto  (max_profit 50 -> cap 1.50)
  perform pg_temp.chk(pg_temp.try('authenticated', ua, 'select * from public.crash_bet(100)') = 'OK', 'A bet 100 accepted in betting');
  select * into v_cb from public.crash_bets where user_id = ua;
  perform pg_temp.chk(v_cb.cap_multiplier = 1.50 and v_cb.state = 'active' and v_cb.round_id = v_r1, 'A cap_multiplier = 1.50');
  perform pg_temp.chk((select balance from public.profiles where id = ua) = 900, 'A balance debited via place_bet');
  perform pg_temp.chk(pg_temp.try('authenticated', ua, 'select * from public.crash_bet(5)') = 'already_bet', 'already_bet');
  -- B: 10, auto 2.00 (cap 6.00); C: 10, auto 3.50 (> cp); D: 10 manual
  perform pg_temp.chk(pg_temp.try('authenticated', ub, 'select * from public.crash_bet(10, 2.00)') = 'OK', 'B bet auto 2.00');
  perform pg_temp.chk(pg_temp.try('authenticated', uc, 'select * from public.crash_bet(10, 3.50)') = 'OK', 'C bet auto 3.50');
  perform pg_temp.chk(pg_temp.try('authenticated', ud, 'select * from public.crash_bet(10)') = 'OK', 'D bet manual');
  perform pg_temp.chk((select cap_multiplier from public.crash_bets where user_id = ub) = 6.00, 'B cap 6.00');
  perform pg_temp.chk(pg_temp.try('authenticated', ud, 'select * from public.crash_cashout()') = 'not_running', 'cashout before start -> not_running');
  perform pg_temp.chk(pg_temp.try('authenticated', ue, 'select * from public.crash_cashout()') = 'no_active_bet', 'cashout without bet -> no_active_bet');

  -- --- betting closes -------------------------------------------------------
  perform pg_temp.warp(5000);          -- running for 5s; crash_at ~ 13.3s later
  perform pg_temp.chk(pg_temp.try('authenticated', ue, 'select * from public.crash_bet(10)') = 'round_closed', 'round_closed after betting_ends_at');
  set local role authenticated; perform pg_temp.as_user(ud);
  select public.crash_state() into v_state;
  reset role;
  perform pg_temp.chk(v_state->'round'->>'phase' = 'running', 'tick moved round to running');
  perform pg_temp.chk(v_state->'round'->'crash_point' = 'null'::jsonb and v_state->'round'->'hash' = 'null'::jsonb, 'cp/hash hidden while running');
  perform pg_temp.chk(jsonb_array_length(v_state->'players') = 4, 'four players listed');
  perform pg_temp.chk(v_state::text !~ 'user_id' and v_state::text !~ 'auto_cashout"\s*:\s*3.5', 'no user_id / other players'' auto_cashout in state');
  perform pg_temp.chk(v_state->'my_bet'->>'state' = 'active' and (v_state->'my_bet'->>'amount')::numeric = 10, 'my_bet shown to D');

  -- --- manual cash-out: pays floor(rate) --------------------------------------
  set local role authenticated; perform pg_temp.as_user(ud);
  select c.multiplier, c.payout into v_mult, v_pay from public.crash_cashout() c;
  reset role;
  -- elapsed ~5000ms .. few hundred ms of test overhead
  perform pg_temp.chk(v_mult >= floor(exp(0.00006 * 5000) * 100) / 100 and v_mult <= floor(exp(0.00006 * 6500) * 100) / 100,
    format('D cash-out multiplier %s within server-clock window', v_mult));
  perform pg_temp.chk(v_mult = floor(v_mult * 100) / 100 and v_pay = round(10 * v_mult, 2), 'D payout = stake * floor(rate)');
  perform pg_temp.chk((select balance from public.profiles where id = ud) = 990 + v_pay, 'D balance credited');
  perform pg_temp.chk(pg_temp.try('authenticated', ud, 'select * from public.crash_cashout()') = 'no_active_bet', 'second cash-out -> no_active_bet');

  -- --- crash: cash-out after crash_at is refused ------------------------------
  update public.crash_round_secrets set crash_at = clock_timestamp() - interval '100 milliseconds' where round_id = v_r1;
  perform pg_temp.chk(pg_temp.try('authenticated', ua, 'select * from public.crash_cashout()') = 'crashed', 'cash-out after crash_at -> crashed (tick not yet run)');
  perform pg_temp.chk((select balance from public.profiles where id = ua) = 900, 'A not paid by refused cash-out');

  -- --- tick settles -----------------------------------------------------------
  set local role anon; select public.crash_state() into v_state; reset role;
  perform pg_temp.chk(v_state->'round'->>'phase' = 'crashed', 'round 1 crashed');
  perform pg_temp.chk((v_state->'round'->>'crash_point')::numeric = 3.00 and v_state->'round'->>'hash' is not null, 'crash_point + hash revealed');
  v_h1 := v_state->'round'->>'hash';
  select * into v_cb from public.crash_bets where user_id = ua and round_id = v_r1;
  perform pg_temp.chk(v_cb.state = 'cashed' and v_cb.cashout_multiplier = 1.50 and v_cb.payout = 150, 'A: cap 1.50 pays 150 at settle (cp 3.00, no auto)');
  select * into v_cb from public.crash_bets where user_id = ub and round_id = v_r1;
  perform pg_temp.chk(v_cb.state = 'cashed' and v_cb.cashout_multiplier = 2.00 and v_cb.payout = 20, 'B: auto 2.00 <= cp paid exactly 2.00');
  select * into v_cb from public.crash_bets where user_id = uc and round_id = v_r1;
  perform pg_temp.chk(v_cb.state = 'lost' and v_cb.payout = 0, 'C: auto 3.50 > cp lost');
  perform pg_temp.chk((select state from public.crash_bets where user_id = ud and round_id = v_r1) = 'cashed', 'D remains cashed');
  perform pg_temp.chk((select balance from public.profiles where id = ua) = 1050, 'A balance 1050');
  perform pg_temp.chk((select balance from public.profiles where id = uc) = 990, 'C balance 990');
  perform pg_temp.chk((select count(*) from public.bets b join public.crash_bets cb on cb.bet_id = b.bet_id where b.state = 'pending') = 0, 'no pending crash bets left');
  perform pg_temp.chk(v_state->'history'->0->>'id' = v_r1::text, 'history lists round 1');

  -- --- tick idempotent --------------------------------------------------------
  select (select string_agg(id::text || balance, ',' order by id) from public.profiles where id = any(v_all))
      || (select count(*) || max(id)::text || string_agg(phase, ',' order by id) from public.crash_rounds)
      || (select count(*) || coalesce(sum(payout), 0)::text from public.crash_bets)
      || (select count(*) from public.bills) into v_snap1;
  perform public.crash_tick(); perform public.crash_tick();
  select (select string_agg(id::text || balance, ',' order by id) from public.profiles where id = any(v_all))
      || (select count(*) || max(id)::text || string_agg(phase, ',' order by id) from public.crash_rounds)
      || (select count(*) || coalesce(sum(payout), 0)::text from public.crash_bets)
      || (select count(*) from public.bills) into v_snap2;
  perform pg_temp.chk(v_snap1 = v_snap2, 'crash_tick idempotent (twice more, nothing changed)');
  perform pg_temp.chk((select count(*) from public.crash_rounds) = 1, 'cooldown holds: still 1 round');

  -- --- round 2: cp 1.00, every bet lost ---------------------------------------
  update public.crash_rounds set crashed_at = clock_timestamp() - interval '4 seconds' where id = v_r1;
  select public.crash_state() into v_state;
  v_r2 := (v_state->'round'->>'id')::bigint;
  perform pg_temp.chk(v_r2 = v_r1 + 1 and v_state->'round'->>'phase' = 'betting', 'round 2 opened after cooldown');
  perform pg_temp.warp(-4000, 1.00);
  perform pg_temp.chk((select crash_at from public.crash_round_secrets where round_id = v_r2) =
                      (select betting_ends_at from public.crash_rounds where id = v_r2), 'cp 1.00 -> crash_at = betting_ends_at');
  perform pg_temp.chk(pg_temp.try('authenticated', ua, 'select * from public.crash_bet(10)') = 'OK', 'A bets round 2');
  perform pg_temp.chk(pg_temp.try('authenticated', ub, 'select * from public.crash_bet(20, 1.01)') = 'OK', 'B bets round 2 auto 1.01');
  perform pg_temp.warp(100);           -- betting over, crash_at == betting_ends_at -> already crashed
  perform public.crash_tick();
  select * into v_cb from public.crash_bets where user_id = ua and round_id = v_r2;
  perform pg_temp.chk(v_cb.state = 'lost' and v_cb.payout = 0, 'cp 1.00: A lost');
  select * into v_cb from public.crash_bets where user_id = ub and round_id = v_r2;
  perform pg_temp.chk(v_cb.state = 'lost' and v_cb.payout = 0, 'cp 1.00: B auto 1.01 lost');
  perform pg_temp.chk((select phase from public.crash_rounds where id = v_r2) = 'crashed' and (select crash_point from public.crash_rounds where id = v_r2) = 1.00,
    'round 2 crashed at 1.00');
  select hash into v_h2 from public.crash_rounds where id = v_r2;

  -- --- round 3: natural crash point, hash chain -------------------------------
  update public.crash_rounds set crashed_at = clock_timestamp() - interval '4 seconds' where id = v_r2;
  perform public.crash_tick();
  select id into v_r3 from public.crash_rounds order by id desc limit 1;
  perform pg_temp.chk(v_r3 = v_r2 + 1, 'round 3 opened');
  perform pg_temp.warp(5000);
  update public.crash_round_secrets set crash_at = clock_timestamp() - interval '1 millisecond' where round_id = v_r3;
  perform public.crash_tick();
  select hash into v_h3 from public.crash_rounds where id = v_r3;
  perform pg_temp.chk(v_h3 is not null and (select crash_point from public.crash_rounds where id = v_r3) = public.pf_crash_point(v_h3, 'flow-test-salt'),
    'round 3 revealed crash_point = pf_crash_point(revealed hash, public salt)');
  perform pg_temp.chk(encode(digest(v_h2, 'sha256'), 'hex') = v_h1, 'chain: sha256(round 2 hash) = round 1 hash');
  perform pg_temp.chk(encode(digest(v_h3, 'sha256'), 'hex') = v_h2, 'chain: sha256(round 3 hash) = round 2 hash');

  -- --- history ---------------------------------------------------------------
  set local role anon; select public.crash_state() into v_state; reset role;
  perform pg_temp.chk(jsonb_array_length(v_state->'history') = 3 and (v_state->'history'->0->>'id')::bigint = v_r3, 'history: 3 crashed rounds, newest first');

  -- --- ledger: balance == start - sum(bets) + sum(payouts) --------------------
  foreach v_u in array v_all loop
    select balance into v_bal from public.profiles where id = v_u;
    select 1000 - coalesce(sum(bet_amount), 0) + coalesce(sum(payout), 0) into v_exp
      from public.bets where user_id = v_u and game = 'crash';
    perform pg_temp.chk(v_bal = v_exp, format('ledger %s: balance %s = 1000 - bets + payouts (%s)', right(v_u::text, 1), v_bal, v_exp));
    perform pg_temp.chk((select coalesce(sum(payout), 0) from public.crash_bets where user_id = v_u) =
                        (select coalesce(sum(payout), 0) from public.bets where user_id = v_u and game = 'crash'),
      format('crash_bets payouts match bets payouts for %s', right(v_u::text, 1)));
  end loop;
end $$;

select case when ok then 'PASS  ' else 'FAIL  ' end || msg as result from t_log order by n;
select case when bool_and(ok) then 'ALL PASS (' || count(*) || ' checks)' else 'SOME FAILED' end as summary from t_log;

rollback;
