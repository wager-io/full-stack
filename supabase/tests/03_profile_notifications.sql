-- =============================================================================
-- 03_profile_notifications.sql — the profile and notification RPCs, asserted.
--
--   psql -h 127.0.0.1 -p 55433 -U postgres -d wager_local -f supabase/tests/03_profile_notifications.sql
--
-- Every check RAISES on failure, so psql exits non-zero. Self-contained: two
-- players, created and removed here, so it can be run again.
--
-- The checks that matter most are the refusals — self-referral, double
-- referral, self-verification, and reaching another player's notifications.
-- Those are the reasons these are functions rather than client table writes.
-- =============================================================================
\set ON_ERROR_STOP on

do $$
declare
  v_a    uuid := '44444444-4444-4444-4444-444444444444';   -- the referrer
  v_b    uuid := '55555555-5555-5555-5555-555555555555';   -- the referred
  v_code text;
  v_res  jsonb;
  v_n    bigint;
  v_ok   boolean;
begin
  -- --- two clean players ----------------------------------------------------
  delete from auth.users where id in (v_a, v_b);
  insert into auth.users (id, email) values (v_a, 'ref_a@test.local'), (v_b, 'ref_b@test.local');

  -- === username =============================================================
  perform set_config('request.jwt.claim.sub', v_a::text, false);
  perform public.profile_set_username('Referrer_A');

  begin
    perform public.profile_set_username('ab');                 -- too short
    raise exception 'FAIL: a 2-character username was accepted';
  exception when others then
    if sqlerrm not like '%invalid_username%' then raise; end if;
  end;

  -- Case-insensitive uniqueness: 'referrer_a' is the same name to a reader.
  perform set_config('request.jwt.claim.sub', v_b::text, false);
  begin
    perform public.profile_set_username('referrer_a');
    raise exception 'FAIL: the same username was taken twice in different case';
  exception when others then
    if sqlerrm not like '%username_taken%' and sqlerrm not like 'FAIL:%' then raise; end if;
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  perform public.profile_set_username('Referred_B');

  -- === KYC ==================================================================
  begin
    perform public.profile_kyc_step1('Kid', 'Underage', (current_date - interval '10 years')::date, 'NG');
    raise exception 'FAIL: an under-18 date of birth was accepted';
  exception when others then
    if sqlerrm not like '%under_18%' and sqlerrm not like 'FAIL:%' then raise; end if;
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;

  v_res := public.profile_kyc_step1('Queen', 'Esther', date '1996-04-02', 'Nigeria', 'Lagos');
  -- Filling in your own details is a claim, not a verification.
  select is_verified into v_ok from public.profiles where id = v_b;
  if v_ok is true then
    raise exception 'FAIL: profile_kyc_step1 verified the account itself';
  end if;

  -- === referral =============================================================
  perform set_config('request.jwt.claim.sub', v_a::text, false);
  v_code := public.profile_set_referral_code() ->> 'affiliate_code';
  if v_code !~ '^[A-Z0-9]{8}$' then
    raise exception 'FAIL: generated referral code looks wrong: %', v_code;
  end if;

  -- Nobody refers themselves.
  begin
    perform public.profile_register_referral(v_code);
    raise exception 'FAIL: a player referred themselves';
  exception when others then
    if sqlerrm not like '%cannot_refer_self%' and sqlerrm not like 'FAIL:%' then raise; end if;
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;

  perform set_config('request.jwt.claim.sub', v_b::text, false);
  perform public.profile_register_referral(lower(v_code));     -- case-insensitive
  if (select referred_by from public.profiles where id = v_b) <> v_a then
    raise exception 'FAIL: referred_by was not set';
  end if;
  if (select referral_count from public.profiles where id = v_a) <> 1 then
    raise exception 'FAIL: the referrer''s count did not move';
  end if;

  -- Set once. A referral that can be re-pointed is a commission that can be moved.
  --
  -- WHAT THIS CHECK DOES NOT PROVE. The RPC has two guards: a `select ... for
  -- update` that locks the row before the read, and an `and referred_by is
  -- null` on the write itself. This is a single session, so only the first one
  -- is ever reached here -- deleting the conditional write leaves this check
  -- green, and that was verified, not assumed. The conditional write only
  -- matters if two calls arrive at once, which no DO block can arrange. The
  -- second guard is therefore carried on the argument in the migration's
  -- comment, not on a test. Proving it needs two concurrent connections, which
  -- this harness (psql, one session) cannot open.
  begin
    perform public.profile_register_referral(v_code);
    raise exception 'FAIL: a referral was registered twice';
  exception when others then
    if sqlerrm not like '%already_referred%' and sqlerrm not like 'FAIL:%' then raise; end if;
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;

  -- === signup must survive a colliding email local part ======================
  -- The case-insensitive username index added by 0010 collides with the signup
  -- trigger, which derives a username from the email local part. Before the
  -- trigger was taught to find a free name, the SECOND of these raised inside
  -- the trigger and aborted the auth.users insert entirely: signup stopped
  -- working, and any name could be denied by registering it first.
  delete from auth.users where email like 'collide@%';
  insert into auth.users (id, email) values (gen_random_uuid(), 'collide@one.test');
  insert into auth.users (id, email) values (gen_random_uuid(), 'collide@two.test');
  insert into auth.users (id, email) values (gen_random_uuid(), 'collide@three.test');
  if (select count(*) from public.profiles where email like 'collide@%') <> 3 then
    raise exception 'FAIL: colliding signups did not all create profiles (got %)',
      (select count(*) from public.profiles where email like 'collide@%');
  end if;
  if (select count(distinct lower(username)) from public.profiles where email like 'collide@%') <> 3 then
    raise exception 'FAIL: colliding signups did not get distinct usernames';
  end if;
  delete from auth.users where email like 'collide@%';

  -- === notifications ========================================================
  insert into public.notifications (user_id, type, title, message)
  values (v_b, 'system', 'One',   'first'),
         (v_b, 'system', 'Two',   'second'),
         (v_a, 'system', 'Other', 'belongs to A');

  if public.notification_unread_count() <> 2 then
    raise exception 'FAIL: B should have 2 unread, got %', public.notification_unread_count();
  end if;

  select id into v_n from public.notifications where user_id = v_b order by id limit 1;
  perform public.notification_mark_read(v_n);
  if public.notification_unread_count() <> 1 then
    raise exception 'FAIL: marking one read left % unread', public.notification_unread_count();
  end if;

  -- A's notification must be untouchable from B's session, and must not even
  -- report whether it exists.
  select id into v_n from public.notifications where user_id = v_a limit 1;
  v_res := public.notification_mark_read(v_n);
  if (v_res->>'marked')::int <> 0 then
    raise exception 'FAIL: B marked A''s notification read';
  end if;
  v_res := public.notification_delete(v_n);
  if (v_res->>'deleted')::int <> 0 then
    raise exception 'FAIL: B deleted A''s notification';
  end if;
  if not exists (select 1 from public.notifications where user_id = v_a) then
    raise exception 'FAIL: A''s notification is gone';
  end if;

  perform public.notification_mark_all_read();
  if public.notification_unread_count() <> 0 then
    raise exception 'FAIL: mark-all left unread rows';
  end if;

  v_res := public.notification_clear_all();
  if (v_res->>'deleted')::int <> 2 then
    raise exception 'FAIL: clear-all removed % rows, expected 2', v_res->>'deleted';
  end if;
  if not exists (select 1 from public.notifications where user_id = v_a) then
    raise exception 'FAIL: clear-all reached across to A';
  end if;

  -- === preferences ==========================================================
  -- FIRST save on an account that has never read its preferences. This used to
  -- fail outright (NULL || jsonb against a NOT NULL column), and the obvious
  -- repair — merging into '{}' — silently switched off the eight defaults the
  -- player never touched. Both are wrong; both are checked.
  delete from public.notification_preferences where user_id = v_b;
  v_res := public.notification_set_preferences('{"levelUp": false}'::jsonb);
  if (v_res->>'levelUp')::boolean is not false then
    raise exception 'FAIL: the first save did not take';
  end if;
  if (v_res->>'betWin')::boolean is not true or (v_res->>'emailEnabled')::boolean is not true then
    raise exception 'FAIL: the first save dropped the defaults: %', v_res;
  end if;
  delete from public.notification_preferences where user_id = v_b;

  v_res := public.notification_preferences();
  if (v_res->>'betWin')::boolean is not true or (v_res->>'emailEnabled')::boolean is not true then
    raise exception 'FAIL: defaults are not all on: %', v_res;
  end if;

  -- One switch off must not clear the other eight.
  v_res := public.notification_set_preferences('{"betLoss": false}'::jsonb);
  if (v_res->>'betLoss')::boolean is not false then
    raise exception 'FAIL: betLoss did not turn off';
  end if;
  if (v_res->>'betWin')::boolean is not true then
    raise exception 'FAIL: setting one preference cleared the others';
  end if;

  -- A key nobody defined is dropped, not stored.
  v_res := public.notification_set_preferences('{"madeUpKey": true}'::jsonb);
  if v_res ? 'madeUpKey' then
    raise exception 'FAIL: an unknown preference key was stored';
  end if;

  begin
    perform public.notification_set_preferences('{"betWin": "yes"}'::jsonb);
    raise exception 'FAIL: a non-boolean preference was accepted';
  exception when others then
    if sqlerrm not like '%invalid_preference_value%' and sqlerrm not like 'FAIL:%' then raise; end if;
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;

  -- --- cleanup --------------------------------------------------------------
  perform set_config('request.jwt.claim.sub', '', false);
  delete from auth.users where id in (v_a, v_b);

  raise notice 'PASS — profile and notification RPCs behave as specified';
end $$;
