-- =============================================================================
-- 10_keno_guards.sql — Keno guards and paytable (0025).
--
--   psql -h 127.0.0.1 -p 5439 -U postgres -d wager_main -f supabase/tests/10_keno_guards.sql
-- =============================================================================
\set ON_ERROR_STOP on

do $$
begin
  if current_database() not in ('wager_main', 'wager_local', 'wager_test') then
    raise exception 'refusing to run: % is not a local test database', current_database();
  end if;
end $$;

-- Fresh user every run: ledger rows reference profiles with ON DELETE RESTRICT.
select set_config('kg.user', gen_random_uuid()::text, false) \gset

do $$
declare
  v_user  uuid := current_setting('kg.user')::uuid;
  v_bal0  numeric; v_bal1 numeric;
  v_n0    bigint;  v_n1   bigint;
  v_risk  text; v_msg text;
  v_bet   record;
  c       record;
  v_cases jsonb := jsonb_build_array(
    jsonb_build_object('name','null risk',    'code','invalid_risk',      'risk',null,      'picks','{1,2,3}'),
    jsonb_build_object('name','unknown risk', 'code','invalid_risk',      'risk','extreme', 'picks','{1,2,3}'),
    jsonb_build_object('name','null element', 'code','pick_out_of_range', 'risk','low',     'picks','{1,NULL,3}'),
    jsonb_build_object('name','two nulls',    'code','pick_out_of_range', 'risk','low',     'picks','{NULL,NULL}'),
    jsonb_build_object('name','2-D array',    'code','invalid_pick_count','risk','low',     'picks','{{1,2},{3,4}}'),
    jsonb_build_object('name','11 picks',     'code','invalid_pick_count','risk','low',     'picks','{1,2,3,4,5,6,7,8,9,10,11}'),
    jsonb_build_object('name','empty array',  'code','invalid_pick_count','risk','low',     'picks','{}'),
    jsonb_build_object('name','null array',   'code','invalid_pick_count','risk','low',     'picks',null),
    jsonb_build_object('name','duplicate',    'code','duplicate_picks',   'risk','low',     'picks','{4,4,7}'),
    jsonb_build_object('name','zero',         'code','pick_out_of_range', 'risk','low',     'picks','{0,5}'),
    jsonb_build_object('name','forty-one',    'code','pick_out_of_range', 'risk','low',     'picks','{5,41}')
  );
begin
  insert into auth.users (id, email) values (v_user, v_user || '@kg.local');
  perform public.adjust_balance(v_user, 1000);
  perform set_config('request.jwt.claim.sub', v_user::text, false);

  -- A first valid play creates the keno seed row, so the nonce comparisons
  -- below are against a real row rather than "no row".
  perform * from public.keno_play(1, array[1,2,3], 'classic');

  -- --- Every guard raises its code and moves neither balance nor nonce -------
  for c in select j from jsonb_array_elements(v_cases) e(j) loop
    select balance into v_bal0 from public.profiles where id = v_user;
    select nonce   into v_n0   from public.game_seeds where user_id = v_user and game = 'keno';
    v_msg := null;
    begin
      perform * from public.keno_play(
        10,
        case when c.j->>'picks' is null then null else (c.j->>'picks')::int[] end,
        c.j->>'risk');
    exception when others then v_msg := sqlerrm; end;
    if v_msg is distinct from c.j->>'code' then
      raise exception 'FAIL: % raised % not %', c.j->>'name', v_msg, c.j->>'code';
    end if;
    select balance into v_bal1 from public.profiles where id = v_user;
    select nonce   into v_n1   from public.game_seeds where user_id = v_user and game = 'keno';
    if v_bal1 <> v_bal0 or v_n1 <> v_n0 then
      raise exception 'FAIL: % moved money or nonce (bal % -> %, nonce % -> %)',
        c.j->>'name', v_bal0, v_bal1, v_n0, v_n1;
    end if;
  end loop;
  raise notice 'PASS: % guard cases', jsonb_array_length(v_cases);

  -- --- risk_not_priced: remove one (risk, picks) set inside this transaction -
  select balance into v_bal0 from public.profiles where id = v_user;
  select nonce   into v_n0   from public.game_seeds where user_id = v_user and game = 'keno';
  v_msg := null;
  begin
    delete from public.keno_paytable where risk = 'high' and picks = 3;
    perform * from public.keno_play(10, array[1,2,3], 'high');
  exception when others then v_msg := sqlerrm; end;  -- the exception also rolls the delete back
  if v_msg is distinct from 'risk_not_priced' then
    raise exception 'FAIL: unpriced set raised % not risk_not_priced', v_msg;
  end if;
  select balance into v_bal1 from public.profiles where id = v_user;
  select nonce   into v_n1   from public.game_seeds where user_id = v_user and game = 'keno';
  if v_bal1 <> v_bal0 or v_n1 <> v_n0 then raise exception 'FAIL: risk_not_priced moved money or nonce'; end if;
  if not exists (select 1 from public.keno_paytable where risk = 'high' and picks = 3) then
    raise exception 'FAIL: test delete was not rolled back';
  end if;
  raise notice 'PASS: risk_not_priced';

  -- --- A valid play on each risk settles and the balance matches the payout --
  foreach v_risk in array array['classic','low','medium','high'] loop
    select balance into v_bal0 from public.profiles where id = v_user;
    select * into v_bet from public.keno_play(10, array[1,2,3,4,5], v_risk);
    select balance into v_bal1 from public.profiles where id = v_user;
    if v_bal1 <> v_bal0 - 10 + v_bet.payout then
      raise exception 'FAIL: % balance % -> % but payout %', v_risk, v_bal0, v_bal1, v_bet.payout;
    end if;
    if not exists (select 1 from public.bets where bet_id = v_bet.bet_id and state <> 'pending') then
      raise exception 'FAIL: % bet % not settled', v_risk, v_bet.bet_id;
    end if;
  end loop;
  raise notice 'PASS: valid play on each risk';
end $$;

-- --- Paytable shape ----------------------------------------------------------
do $$
declare r record; v_n int;
begin
  select count(*) into v_n from public.keno_paytable;
  for r in select risk, count(*) n from public.keno_paytable group by risk order by risk loop
    raise notice 'INFO: % has % rows', r.risk, r.n;
  end loop;
  raise notice 'INFO: keno_paytable has % rows (4 x 65 = 260 if classic lists zeros)', v_n;
  for r in select k.risk, p.picks
             from (values ('classic'),('low'),('medium'),('high')) k(risk), generate_series(1,10) p(picks)
            where not exists (select 1 from public.keno_paytable t where t.risk = k.risk and t.picks = p.picks) loop
    raise exception 'FAIL: (%, %) has no paytable row', r.risk, r.picks;
  end loop;
  if exists (select 1 from public.keno_paytable where hits > picks) then
    raise exception 'FAIL: a row has hits > picks';
  end if;
  -- low/medium/high list every hit count 0..picks.
  if exists (select 1 from public.keno_paytable where risk <> 'classic'
              group by risk, picks having count(*) <> picks + 1) then
    raise exception 'FAIL: a low/medium/high (risk, picks) is missing a hit count';
  end if;
  raise notice 'PASS: paytable shape';
end $$;

-- --- RTP: sum over hits of hypergeometric probability x multiplier ------------
do $$
declare r record; v_bad int := 0;
begin
  for r in
    select risk, picks, round(rtp, 4) rtp from (
      select m.risk, m.picks,
             sum( (factorial(m.picks)        / (factorial(m.hits)      * factorial(m.picks - m.hits)))
                * (factorial(40 - m.picks)   / (factorial(10 - m.hits) * factorial(30 - m.picks + m.hits)))
                / (factorial(40) / (factorial(10) * factorial(30)))
                * m.multiplier ) rtp
        from public.keno_paytable m
       group by m.risk, m.picks) s
     order by risk, picks
  loop
    raise notice 'RTP % % picks: %', r.risk, r.picks, r.rtp;
    if r.rtp < 0.98 or r.rtp > 0.995 then
      v_bad := v_bad + 1;
      raise notice 'RTP OUT OF BAND: % % picks: %', r.risk, r.picks, r.rtp;
    end if;
  end loop;
  if v_bad > 0 then raise exception 'FAIL: % (risk, picks) outside 0.98..0.995', v_bad; end if;
  raise notice 'PASS: RTP in band';
end $$;
