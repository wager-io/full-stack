-- =============================================================================
-- 0010_profile_and_notifications.sql
--
-- The profile and notification gaps from the parity audit, as RPCs.
--
-- WHY THESE ARE FUNCTIONS AND NOT JUST RLS. A signed-in player can already
-- update their own profile row (profiles_update_self), so a few of these could
-- have been plain client updates. These could not:
--
--   referred_by and referral_count are LOCKED by guard_privileged_columns
--   (0003) — the client cannot write them at all, which is correct: a player
--   who could set their own referrer could farm their own commission.
--
--   notifications has a select and an update policy but NO delete policy, so
--   "clear" and "delete one" are impossible from the browser by design.
--
--   Uniqueness (username, referral code) needs to be checked and taken in one
--   statement, or two players racing both pass the check.
--
-- The rest are here so the whole surface reads one way — a screen calls
-- profile_set_username, not sometimes an RPC and sometimes a raw table write.
--
-- WHAT IS NOT HERE, and why:
--   password / email change, OTP, email verification -> Supabase Auth already
--     owns these; a second implementation would be a second source of truth
--   avatar upload -> Supabase Storage, which is its own piece of work (the
--     audit lists it separately)
--   default wallet -> there is no column for it and no screen asking; adding
--     one on spec is how you get a column nothing reads
-- =============================================================================

-- ---------------------------------------------------------------------------
-- profile_set_username — take a username, if it is free.
--
-- Case-insensitive: 'Samuel' and 'samuel' are the same name to a human reading
-- a bet feed, so they cannot both exist. The unique index does the work, and
-- the exception handler turns the race into a clean refusal.
-- ---------------------------------------------------------------------------
create unique index if not exists profiles_username_lower_key
  on public.profiles (lower(username)) where username is not null;

create or replace function public.profile_set_username(p_username text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  p_username := btrim(p_username);
  if p_username !~ '^[A-Za-z0-9_]{3,20}$' then
    raise exception 'invalid_username';   -- 3-20, letters/digits/underscore
  end if;

  begin
    update public.profiles set username = p_username where id = v_user;
  exception when unique_violation then
    raise exception 'username_taken';
  end;

  return jsonb_build_object('username', p_username);
end $$;

revoke execute on function public.profile_set_username(text) from public, anon;
grant  execute on function public.profile_set_username(text) to  authenticated;


-- ---------------------------------------------------------------------------
-- profile_set_privacy — hide or show yourself in public feeds.
--
-- Only affects bets placed AFTER the change: place_bet copies the display name
-- onto the bet row at the time it is placed, so old rows keep what they had.
-- Clearing them retroactively would rewrite a public feed other people have
-- already seen, which is a product decision, not this function's to make.
-- ---------------------------------------------------------------------------
create or replace function public.profile_set_privacy(p_hidden boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  update public.profiles set hidden_from_public = coalesce(p_hidden, false) where id = v_user;
  return jsonb_build_object('hidden_from_public', coalesce(p_hidden, false));
end $$;

revoke execute on function public.profile_set_privacy(boolean) from public, anon;
grant  execute on function public.profile_set_privacy(boolean) to  authenticated;


-- ---------------------------------------------------------------------------
-- profile_kyc_step1 — the identity details, step one.
--
-- It does NOT set is_verified. That column is locked in 0003 and stays locked:
-- a player filling in their own details is a claim, not a verification, and the
-- one thing this function must never do is let someone verify themselves.
-- ---------------------------------------------------------------------------
create or replace function public.profile_kyc_step1(
  p_first_name       text,
  p_last_name        text,
  p_date_of_birth    date,
  p_country          text,
  p_state            text default null,
  p_city             text default null,
  p_resident_address text default null,
  p_postal_code      text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if coalesce(btrim(p_first_name), '') = '' or coalesce(btrim(p_last_name), '') = '' then
    raise exception 'name_required';
  end if;
  if p_date_of_birth is null then raise exception 'date_of_birth_required'; end if;
  -- Gambling: under 18 is not a validation detail, it is the whole point.
  if p_date_of_birth > (current_date - interval '18 years') then
    raise exception 'under_18';
  end if;
  if coalesce(btrim(p_country), '') = '' then raise exception 'country_required'; end if;

  update public.profiles
     set first_name       = btrim(p_first_name),
         last_name        = btrim(p_last_name),
         date_of_birth    = p_date_of_birth,
         country          = btrim(p_country),
         state            = nullif(btrim(coalesce(p_state, '')), ''),
         city             = nullif(btrim(coalesce(p_city, '')), ''),
         resident_address = nullif(btrim(coalesce(p_resident_address, '')), ''),
         postal_code      = nullif(btrim(coalesce(p_postal_code, '')), '')
   where id = v_user;

  return jsonb_build_object('submitted', true, 'is_verified', false);
end $$;

revoke execute on function public.profile_kyc_step1(text, text, date, text, text, text, text, text) from public, anon;
grant  execute on function public.profile_kyc_step1(text, text, date, text, text, text, text, text) to  authenticated;


-- ---------------------------------------------------------------------------
-- profile_set_referral_code — claim your own affiliate code.
--
-- Given one, it is validated and taken; given nothing, one is generated. The
-- generator retries on collision rather than trusting a single draw.
-- ---------------------------------------------------------------------------
create or replace function public.profile_set_referral_code(p_code text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_code text;
  v_try  int := 0;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;

  if p_code is not null then
    v_code := upper(btrim(p_code));
    if v_code !~ '^[A-Z0-9]{4,16}$' then raise exception 'invalid_code'; end if;
    begin
      update public.profiles set affiliate_code = v_code where id = v_user;
    exception when unique_violation then
      raise exception 'code_taken';
    end;
    return jsonb_build_object('affiliate_code', v_code);
  end if;

  -- Generated: 8 hex characters, upper-cased. Collisions are unlikely and
  -- handled rather than assumed away.
  loop
    v_try := v_try + 1;
    v_code := upper(encode(gen_random_bytes(4), 'hex'));
    begin
      update public.profiles set affiliate_code = v_code where id = v_user;
      return jsonb_build_object('affiliate_code', v_code);
    exception when unique_violation then
      if v_try >= 5 then raise exception 'could_not_generate_code'; end if;
    end;
  end loop;
end $$;

revoke execute on function public.profile_set_referral_code(text) from public, anon;
grant  execute on function public.profile_set_referral_code(text) to  authenticated;


-- ---------------------------------------------------------------------------
-- profile_register_referral — say who referred you. Once, and never yourself.
--
-- This is the function that could not have been a client update: referred_by
-- and referral_count are locked in 0003. A player able to write them could
-- name themselves as their own referrer, or re-point an existing referral at a
-- friend after the fact.
--
-- Set-once on purpose: a referral that can be changed is a commission that can
-- be moved after it was earned.
-- ---------------------------------------------------------------------------
create or replace function public.profile_register_referral(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user     uuid := auth.uid();
  v_existing uuid;
  v_referrer public.profiles;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;

  select referred_by into v_existing from public.profiles where id = v_user;
  if v_existing is not null then raise exception 'already_referred'; end if;

  select * into v_referrer from public.profiles
   where affiliate_code = upper(btrim(p_code));
  if v_referrer.id is null then raise exception 'unknown_code'; end if;
  if v_referrer.id = v_user then raise exception 'cannot_refer_self'; end if;

  -- Both columns are locked by guard_privileged_columns (0003), and being a
  -- definer function is not enough on its own: the guard honours one
  -- transaction-local flag, the same one adjust_balance raises to move a
  -- balance. Raised for these two writes and lowered straight after, so the
  -- opening is as narrow as the work.
  perform set_config('app.allow_balance_change', 'on', true);
  update public.profiles set referred_by = v_referrer.id where id = v_user;
  update public.profiles set referral_count = coalesce(referral_count, 0) + 1
   where id = v_referrer.id;
  perform set_config('app.allow_balance_change', 'off', true);

  return jsonb_build_object('referred_by', v_referrer.username);
end $$;

revoke execute on function public.profile_register_referral(text) from public, anon;
grant  execute on function public.profile_register_referral(text) to  authenticated;


-- =============================================================================
-- Notifications
-- =============================================================================

-- ---------------------------------------------------------------------------
-- notification_preferences — a real table.
--
-- The original endpoint returned a hardcoded object and its update handler
-- logged to the console with the comment "In a real app, save to user
-- preferences". So the screen could offer switches that did nothing. Stored
-- here, defaults matching the nine keys that endpoint pretended to have.
-- ---------------------------------------------------------------------------
create table if not exists public.notification_preferences (
  user_id    uuid primary key references public.profiles(id) on delete cascade,
  prefs      jsonb not null default jsonb_build_object(
               'betWin', true, 'betLoss', true, 'levelUp', true,
               'bonusReceived', true, 'depositSuccess', true,
               'withdrawalSuccess', true, 'affiliateCommission', true,
               'pushEnabled', true, 'emailEnabled', true),
  updated_at timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;
drop policy if exists notification_prefs_select_self on public.notification_preferences;
create policy notification_prefs_select_self on public.notification_preferences
  for select using (user_id = auth.uid());
revoke insert, update, delete on public.notification_preferences from anon, authenticated;

drop trigger if exists notification_prefs_updated_at on public.notification_preferences;
create trigger notification_prefs_updated_at before update on public.notification_preferences
  for each row execute function public.set_updated_at();


create or replace function public.notification_preferences()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_user uuid := auth.uid(); v_prefs jsonb;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  insert into public.notification_preferences (user_id) values (v_user)
    on conflict (user_id) do nothing;
  select prefs into v_prefs from public.notification_preferences where user_id = v_user;
  return v_prefs;
end $$;

revoke execute on function public.notification_preferences() from public, anon;
grant  execute on function public.notification_preferences() to  authenticated;


-- Merged, not replaced: a client sending one switch must not clear the other
-- eight. Unknown keys are dropped rather than stored, so a typo in the browser
-- cannot quietly become a preference nothing reads.
create or replace function public.notification_set_preferences(p_prefs jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user  uuid := auth.uid();
  v_known text[] := array['betWin','betLoss','levelUp','bonusReceived','depositSuccess',
                          'withdrawalSuccess','affiliateCommission','pushEnabled','emailEnabled'];
  v_clean jsonb := '{}'::jsonb;
  k text;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if p_prefs is null or jsonb_typeof(p_prefs) <> 'object' then
    raise exception 'invalid_preferences';
  end if;

  foreach k in array v_known loop
    if p_prefs ? k then
      if jsonb_typeof(p_prefs -> k) <> 'boolean' then
        raise exception 'invalid_preference_value: %', k;
      end if;
      v_clean := v_clean || jsonb_build_object(k, p_prefs -> k);
    end if;
  end loop;

  insert into public.notification_preferences (user_id, prefs)
  values (v_user, (select prefs from public.notification_preferences where user_id = v_user) || v_clean)
  on conflict (user_id) do update set prefs = public.notification_preferences.prefs || v_clean;

  return (select prefs from public.notification_preferences where user_id = v_user);
end $$;

revoke execute on function public.notification_set_preferences(jsonb) from public, anon;
grant  execute on function public.notification_set_preferences(jsonb) to  authenticated;


-- ---------------------------------------------------------------------------
-- The list operations. Read and mark-read are also possible through RLS; these
-- exist so a screen has one way to do all of it, and because delete is not.
-- ---------------------------------------------------------------------------
create or replace function public.notification_unread_count()
returns int
language sql
security definer
set search_path = public
as $$
  select count(*)::int from public.notifications
   where user_id = auth.uid() and coalesce(read, false) = false
     and (expires_at is null or expires_at > now());
$$;

revoke execute on function public.notification_unread_count() from public, anon;
grant  execute on function public.notification_unread_count() to  authenticated;


create or replace function public.notification_mark_read(p_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_user uuid := auth.uid(); v_n int;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  update public.notifications set read = true, read_at = now()
   where id = p_id and user_id = v_user and coalesce(read, false) = false;
  get diagnostics v_n = row_count;
  -- Not found and already-read are the same answer on purpose: a player
  -- probing ids must not learn which ones exist.
  return jsonb_build_object('marked', v_n);
end $$;

revoke execute on function public.notification_mark_read(bigint) from public, anon;
grant  execute on function public.notification_mark_read(bigint) to  authenticated;


create or replace function public.notification_mark_all_read()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_user uuid := auth.uid(); v_n int;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  update public.notifications set read = true, read_at = now()
   where user_id = v_user and coalesce(read, false) = false;
  get diagnostics v_n = row_count;
  return jsonb_build_object('marked', v_n);
end $$;

revoke execute on function public.notification_mark_all_read() from public, anon;
grant  execute on function public.notification_mark_all_read() to  authenticated;


create or replace function public.notification_delete(p_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_user uuid := auth.uid(); v_n int;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  delete from public.notifications where id = p_id and user_id = v_user;
  get diagnostics v_n = row_count;
  return jsonb_build_object('deleted', v_n);
end $$;

revoke execute on function public.notification_delete(bigint) from public, anon;
grant  execute on function public.notification_delete(bigint) to  authenticated;


create or replace function public.notification_clear_all()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_user uuid := auth.uid(); v_n int;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  delete from public.notifications where user_id = v_user;
  get diagnostics v_n = row_count;
  return jsonb_build_object('deleted', v_n);
end $$;

revoke execute on function public.notification_clear_all() from public, anon;
grant  execute on function public.notification_clear_all() to  authenticated;
