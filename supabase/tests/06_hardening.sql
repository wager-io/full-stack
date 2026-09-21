-- =============================================================================
-- 06_hardening.sql — the six audit findings closed by 0013.
--
--   psql -h 127.0.0.1 -p 55433 -U postgres -d wager_local -f supabase/tests/06_hardening.sql
--
-- IMPORTANT: the grant checks below `set role authenticated` first. As the
-- superuser psql connects as, every grant check passes whether or not the
-- grant exists -- superusers bypass privileges and RLS both. A test that
-- cannot fail is worse than no test, so these run as the role the browser
-- actually uses.
-- =============================================================================
\set ON_ERROR_STOP on

-- --- fixtures ---------------------------------------------------------------
do $$
declare
  v_a uuid := '88888888-8888-8888-8888-888888888888';
  v_b uuid := '99999999-9999-9999-9999-999999999999';
begin
  delete from auth.users where id in (v_a, v_b);
  insert into auth.users (id, email) values (v_a, 'harden_a@test.local'),
                                            (v_b, 'harden_b@test.local');
  update public.profiles set username = 'harden_a' where id = v_a;
  update public.profiles set username = 'harden_b' where id = v_b;
  insert into public.notifications (user_id, type, title, message, action_url)
  values (v_a, 'system', 'Welcome', 'original text', '/home');
end $$;

-- =============================================================================
-- 1. A player can no longer rewrite the notifications we sent them.
-- =============================================================================
set role authenticated;
select set_config('request.jwt.claim.sub', '88888888-8888-8888-8888-888888888888', false);

do $$
begin
  -- The attack: turn a system message into a fake bonus with a link of my
  -- choosing. Before 0013 this succeeded.
  begin
    update public.notifications
       set title = 'You won a 500 USDT bonus', action_url = 'https://example.invalid/phish'
     where user_id = auth.uid();
    raise exception 'FAIL: a player rewrote a notification we sent them';
  exception when insufficient_privilege then
    null;                                       -- refused, as it should be
  end;

  -- ...while the one thing a player legitimately does still works.
  update public.notifications set read = true, read_at = now() where user_id = auth.uid();
  if not exists (select 1 from public.notifications where user_id = auth.uid() and read) then
    raise exception 'FAIL: marking a notification read no longer works';
  end if;
end $$;

-- =============================================================================
-- 2. Profile rules are enforced, not advisory.
-- =============================================================================
do $$
declare v_row public.profiles;
begin
  -- The attack: write the column directly and skip every rule in the RPC.
  begin
    update public.profiles set username = 'a', profile_image = 'javascript:alert(1)'
     where id = auth.uid();
    raise exception 'FAIL: the browser still writes profile columns directly';
  exception when insufficient_privilege then
    null;
  end;

  -- The supported route still works, and still validates.
  v_row := public.profile_set_details(
    '{"firstName":"Ada","lastName":"Lovelace","country":"UK","city":"London"}'::jsonb);
  if v_row.first_name <> 'Ada' or v_row.city <> 'London' then
    raise exception 'FAIL: profile_set_details did not save (% / %)', v_row.first_name, v_row.city;
  end if;

  -- A field the caller left out keeps its value rather than being nulled.
  v_row := public.profile_set_details('{"city":"Manchester"}'::jsonb);
  if v_row.first_name <> 'Ada' then
    raise exception 'FAIL: an omitted field was wiped';
  end if;

  -- Age is checked on the server now, not only in the modal.
  begin
    perform public.profile_set_details(
      ('{"dateOfBirth":"' || to_char(current_date - interval '17 years', 'YYYY-MM-DD') || '"}')::jsonb);
    raise exception 'FAIL: a 17-year-old was accepted';
  exception when sqlstate 'P0001' then
    if sqlerrm like 'FAIL:%' then raise; end if;
    if sqlerrm not like '%under_18%' then raise; end if;
  end;

  -- Hiding yourself is a real preference and still reachable.
  if public.profile_set_visibility(true) is not true then
    raise exception 'FAIL: profile_set_visibility did not take';
  end if;
  perform public.profile_set_visibility(false);
end $$;

reset role;

-- =============================================================================
-- 3. Referrals: no reciprocal pairs, no suspended referrers.
-- =============================================================================
do $$
declare
  v_a uuid := '88888888-8888-8888-8888-888888888888';
  v_b uuid := '99999999-9999-9999-9999-999999999999';
  v_code_a text;
  v_code_b text;
begin
  perform set_config('request.jwt.claim.sub', v_a::text, false);
  v_code_a := public.profile_set_referral_code() ->> 'affiliate_code';
  perform set_config('request.jwt.claim.sub', v_b::text, false);
  v_code_b := public.profile_set_referral_code() ->> 'affiliate_code';

  -- B is referred by A. Legitimate.
  perform public.profile_register_referral(v_code_a);

  -- Now A tries to be referred by B: the pair would credit each other.
  perform set_config('request.jwt.claim.sub', v_a::text, false);
  begin
    perform public.profile_register_referral(v_code_b);
    raise exception 'FAIL: a reciprocal referral was accepted';
  exception when sqlstate 'P0001' then
    if sqlerrm like 'FAIL:%' then raise; end if;
    if sqlerrm not like '%reciprocal_referral%' then raise; end if;
  end;

  -- A suspended account earns nothing. Suspend B and have a third player try.
  perform set_config('app.allow_balance_change', 'on', true);
  update public.profiles set status = 'suspended' where id = v_b;
  perform set_config('app.allow_balance_change', 'off', true);

  perform set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);
  delete from auth.users where id = '22222222-2222-2222-2222-222222222222';
  insert into auth.users (id, email)
  values ('22222222-2222-2222-2222-222222222222', 'harden_c@test.local');
  begin
    perform public.profile_register_referral(v_code_b);
    raise exception 'FAIL: a suspended account was credited as a referrer';
  exception when sqlstate 'P0001' then
    if sqlerrm like 'FAIL:%' then raise; end if;
    if sqlerrm not like '%referrer_not_active%' then raise; end if;
  end;

  perform set_config('app.allow_balance_change', 'on', true);
  update public.profiles set status = 'active' where id = v_b;
  perform set_config('app.allow_balance_change', 'off', true);
end $$;

-- =============================================================================
-- 4. A tie between two tiers resolves the same way every time.
-- =============================================================================
do $$
declare
  v_user uuid := '88888888-8888-8888-8888-888888888888';
  v_seen text;
  v_first text;
  i int;
begin
  -- Two tiers, same requirement. Without a tie-break the winner is whichever
  -- row the plan returns, which can differ call to call.
  -- icon is jsonb and wager_amount is text in this schema; features defaults.
  insert into public.vip_tiers (name, color, wager_amount, icon, required_wager, level)
  values ('TieLow',  '#111', '$777k', '"x"'::jsonb, 777000, 41),
         ('TieHigh', '#222', '$777k', '"x"'::jsonb, 777000, 42);

  perform set_config('request.jwt.claim.sub', v_user::text, false);
  perform public.adjust_balance(v_user, 800000);
  perform public.place_bet('dice', 777000);

  select current_tier into v_first from public.vip_progress where user_id = v_user;
  if v_first <> 'TieHigh' then
    raise exception 'FAIL: a tie should award the higher level, got %', v_first;
  end if;

  -- ...and it is the same answer every time, not just this time.
  for i in 1 .. 5 loop
    perform public.vip_recalc(v_user);
    select current_tier into v_seen from public.vip_progress where user_id = v_user;
    if v_seen <> v_first then
      raise exception 'FAIL: the tie resolved to % then %', v_first, v_seen;
    end if;
  end loop;

  delete from public.vip_tiers where name in ('TieLow', 'TieHigh');
  perform public.vip_recalc(v_user);
end $$;

-- =============================================================================
-- 5 & 6 are asserted in 02_vip_stats.sql (same answer for hidden and unknown
-- names, case-insensitive lookup). What is left here is the progress figure,
-- which must come from the tier table rather than from a stored column.
-- =============================================================================
do $$
declare
  v_user uuid := '88888888-8888-8888-8888-888888888888';
  v_stats jsonb;
begin
  perform set_config('request.jwt.claim.sub', v_user::text, false);

  -- Corrupt the STORED figure. If vipProgress still reads it, the percentage
  -- moves; if it is computed from vip_tiers, nothing changes.
  update public.vip_progress set wager_to_next_tier = 999999999 where user_id = v_user;
  v_stats := public.user_stats('harden_a');
  perform public.vip_recalc(v_user);

  if (v_stats->>'vipProgress')::numeric <> (public.user_stats('harden_a')->>'vipProgress')::numeric then
    raise exception 'FAIL: vipProgress still depends on the stored column';
  end if;
end $$;

-- --- cleanup ----------------------------------------------------------------
do $$
begin
  perform set_config('request.jwt.claim.sub', '', false);
  delete from public.bets where user_id in (
    '88888888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999');
  delete from auth.users where email like 'harden_%@test.local';
  raise notice 'PASS — the six audit findings are closed';
end $$;
