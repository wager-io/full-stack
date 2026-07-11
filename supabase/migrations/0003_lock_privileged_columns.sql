-- =============================================================================
-- 0003_lock_privileged_columns.sql
--
-- THE HOLE (found by running the attack suite against a real Postgres)
-- -------------------------------------------------------------------
-- 0001's policy:
--     create policy profiles_update_self on public.profiles
--       for update using (id = auth.uid()) with check (id = auth.uid());
--
-- RLS policies gate WHICH ROWS you may update, never WHICH COLUMNS. So this
-- permits a logged-in player to update ANY column of their own row:
--
--     supabase.from('profiles')
--       .update({ is_admin: true, admin_role: 'super_admin' })
--       .eq('id', myId)
--
-- The balance column was covered by the guard trigger, but is_admin was not.
-- Worse, it cascades: profiles_select_self reads
--   `using (id = auth.uid() or public.is_admin())`,
-- so the moment a player promotes themselves they can read EVERY profile and,
-- via bills_select_self, EVERY user's transaction ledger. One missing control,
-- total account takeover.
--
-- THE FIX
-- -------
-- Column-level GRANTs. Postgres checks these before RLS and before triggers,
-- so a privileged column is simply not writable by a client session — there is
-- no policy or trigger left to outsmart. The guard trigger stays as
-- defence-in-depth for balance.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. Take away blanket UPDATE, then hand back exactly the columns a player
--    legitimately edits about themselves. Anything not on this list — balance,
--    is_admin, admin_role, permissions, commission_rate, withdrawal_disabled,
--    status, is_verified, referred_by, affiliate_code, current_level,
--    referral_count — is now unwritable from the browser.
--
--    Adding a column to `profiles` later does NOT auto-grant it. That is
--    deliberate: new columns are locked until someone opts them in here.
-- ---------------------------------------------------------------------------
revoke update on public.profiles from anon, authenticated;

grant update (
  username,
  first_name,
  last_name,
  country,
  state,
  place,
  date_of_birth,
  resident_address,
  city,
  postal_code,
  language,
  profile_image,
  hidden_from_public,
  agree_to_terms
) on public.profiles to authenticated;

-- Clients never insert or delete profiles; the signup trigger owns that.
revoke insert, delete on public.profiles from anon, authenticated;


-- ---------------------------------------------------------------------------
-- 2. Defence in depth: even if a future migration re-grants a column by
--    mistake, refuse the write at the row level. Mirrors guard_balance_change.
-- ---------------------------------------------------------------------------
create or replace function public.guard_privileged_columns()
returns trigger language plpgsql as $$
begin
  if coalesce(current_setting('app.allow_balance_change', true), 'off') = 'on' then
    return new;  -- inside a privileged definer function; it knows what it's doing
  end if;

  if new.is_admin            is distinct from old.is_admin
  or new.admin_role          is distinct from old.admin_role
  or new.permissions         is distinct from old.permissions
  or new.commission_rate     is distinct from old.commission_rate
  or new.withdrawal_disabled is distinct from old.withdrawal_disabled
  or new.status              is distinct from old.status
  or new.is_verified         is distinct from old.is_verified
  or new.referred_by         is distinct from old.referred_by
  or new.current_level       is distinct from old.current_level
  or new.referral_count      is distinct from old.referral_count
  then
    raise exception 'privileged column may only be changed by privileged functions';
  end if;

  return new;
end $$;

create trigger profiles_guard_privileged
  before update on public.profiles
  for each row execute function public.guard_privileged_columns();

revoke execute on function public.guard_privileged_columns() from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- 3. promote_to_admin() must still work. It is SECURITY DEFINER (runs as the
--    owner, so column grants do not apply to it), but the trigger above would
--    still fire — so it opts in via the same GUC the balance guard uses.
-- ---------------------------------------------------------------------------
create or replace function public.promote_to_admin(p_email text, p_role text default 'super_admin')
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare v_row public.profiles;
begin
  if p_role not in ('super_admin', 'admin', 'moderator', 'support') then
    raise exception 'invalid admin_role: %', p_role;
  end if;

  perform set_config('app.allow_balance_change', 'on', true);
  update public.profiles
     set is_admin = true, admin_role = p_role
   where lower(email) = lower(p_email)
  returning * into v_row;
  perform set_config('app.allow_balance_change', 'off', true);

  if v_row.id is null then
    raise exception 'no profile with email %  (sign up first, then promote)', p_email;
  end if;
  return v_row;
end $$;

revoke execute on function public.promote_to_admin(text, text) from public, anon, authenticated;
grant  execute on function public.promote_to_admin(text, text) to  service_role;


-- ---------------------------------------------------------------------------
-- 4. public_profiles leaked users who opted out of public listings.
--
--    The view is intentionally NOT security_invoker: it must bypass RLS on
--    profiles so that anon can read the live bet feed / leaderboards at all.
--    But that means the view IS the access control — so the filter has to live
--    here, and it was missing.
-- ---------------------------------------------------------------------------
-- Dropped rather than replaced: `create or replace view` cannot remove a
-- column, and the 0001 version exposed hidden_from_public itself.
drop view if exists public.public_profiles;

create view public.public_profiles as
  select id, username, profile_image, current_level
    from public.profiles
   where not coalesce(hidden_from_public, false);

grant select on public.public_profiles to anon, authenticated;
