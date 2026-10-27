-- TRON deposit accounting: unique player addresses, correct-token checks,
-- cent flooring, replay protection, and the watcher's address queue.
--
--   psql -h 127.0.0.1 -p 5439 -U postgres -d wager_main -f supabase/tests/11_tron_deposits.sql
\set ON_ERROR_STOP on

do $$
begin
  if current_database() not in ('wager_main', 'wager_local', 'wager_test') then
    raise exception 'refusing to run: % is not a local test database', current_database();
  end if;
end $$;

-- Fresh ids every run: ledger rows reference profiles with ON DELETE RESTRICT,
-- so a previous run's player cannot be deleted. tx hashes, addresses and the
-- derivation index are unique too, so they are randomised alongside the user.
select set_config('td.user', gen_random_uuid()::text, false),
       set_config('td.tag', substr(md5(random()::text), 1, 12), false),
       set_config('td.idx', (900000000 + floor(random() * 90000000))::bigint::text, false) \gset

insert into auth.users (id, email)
values (current_setting('td.user')::uuid, current_setting('td.user') || '@td.local');

select set_config('request.jwt.claim.sub', current_setting('td.user'), false);
set role service_role;

do $$
declare
  v_user uuid := current_setting('td.user')::uuid;
  v_tag text := current_setting('td.tag');
  v_idx bigint := current_setting('td.idx')::bigint;
  v_addr text := 'TQA' || v_tag;
  v_addr2 text := 'TQB' || v_tag;
  v_contract text := 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
  v_result jsonb;
  v_address public.tron_deposit_addresses;
  v_balance numeric;
  v_count int;
begin
  select * into v_address
    from public.tron_bind_address(v_user, v_idx, v_addr);
  if v_address.derivation_index <> v_idx or v_address.address <> v_addr then
    raise exception 'FAIL: the first address binding was not stored';
  end if;

  select * into v_address
    from public.tron_bind_address(v_user, (v_idx + 1), v_addr2);
  if v_address.derivation_index <> v_idx or v_address.address <> v_addr then
    raise exception 'FAIL: rebinding changed a permanent deposit address';
  end if;

  v_result := public.tron_credit_deposit(
    'qa_tx_001_' || v_tag, v_addr, 1.239999, v_contract, '{}');
  if v_result->>'action' <> 'credited'
     or (v_result->>'credited_usd')::numeric <> 1.23 then
    raise exception 'FAIL: confirmed deposit returned %', v_result;
  end if;

  v_result := public.tron_credit_deposit(
    'qa_tx_001_' || v_tag, v_addr, 1.239999, v_contract, '{}');
  if v_result->>'action' <> 'already_seen' then
    raise exception 'FAIL: replayed deposit returned %', v_result;
  end if;

  select balance into v_balance from public.profiles where id = v_user;
  if v_balance <> 1.23 then
    raise exception 'FAIL: expected one floored credit of 1.23, got %', v_balance;
  end if;

  v_result := public.tron_credit_deposit(
    'qa_tx_wrong_contract_' || v_tag, v_addr, 5, 'fake-token', '{}');
  if v_result->>'action' <> 'rejected' or v_result->>'reason' <> 'wrong_contract' then
    raise exception 'FAIL: unsupported token returned %', v_result;
  end if;

  v_result := public.tron_credit_deposit(
    'qa_tx_unknown_address_' || v_tag, 'TUnknown' || v_tag, 5, v_contract, '{}');
  if v_result->>'action' <> 'unknown_address' then
    raise exception 'FAIL: unowned address returned %', v_result;
  end if;

  v_result := public.tron_credit_deposit(
    'qa_tx_below_cent_' || v_tag, v_addr, 0.009999, v_contract, '{}');
  if v_result->>'action' <> 'rejected' or v_result->>'reason' <> 'below_one_cent' then
    raise exception 'FAIL: below-cent deposit returned %', v_result;
  end if;

  begin
    perform public.tron_credit_deposit(
      'qa_tx_nan_' || v_tag, v_addr, 'NaN'::numeric, v_contract, '{}');
    raise exception 'FAIL: a NaN deposit amount was accepted';
  exception when sqlstate 'P0001' then
    if sqlerrm not like '%invalid_amount%' or sqlerrm like 'FAIL:%' then raise; end if;
  end;

  select count(*) into v_count
    from public.bills
   where user_id = v_user and bill_id = 'tron_qa_tx_001_' || v_tag;
  if v_count <> 1 then
    raise exception 'FAIL: expected one ledger row for the deposit, got %', v_count;
  end if;

  select count(*) into v_count
    from public.tron_addresses_to_scan(500)
   where user_id = v_user;
  if v_count <> 1 then
    raise exception 'FAIL: the watcher did not receive the bound address';
  end if;
end $$;

reset role;

do $$
begin
  raise notice 'PASS — TRON deposit address, confirmation accounting, replay, rejection, and watcher queue';
end $$;
