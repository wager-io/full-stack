-- =============================================================================
-- 0002_harden_foundation.sql
--
-- Closes a critical hole in 0001 and fills two foundation gaps.
--
-- THE HOLE
-- --------
-- Supabase exposes every function in `public` as a PostgREST RPC endpoint, and
-- Postgres grants EXECUTE on new functions to PUBLIC by default. 0001 created
-- `adjust_balance()` as SECURITY DEFINER and never revoked that default grant.
--
-- `adjust_balance` is the function that flips the `app.allow_balance_change`
-- GUC which the `guard_balance_change` trigger checks. So any authenticated
-- user could call:
--
--     supabase.rpc('adjust_balance', { p_user: <own id>, p_delta: 1e6 })
--
-- ...and mint themselves an arbitrary balance. The trigger does not help: the
-- caller IS the privileged function the trigger trusts.
--
-- Fix: revoke the default grant, and flip the schema to deny-by-default so no
-- future migration can reintroduce this by omission. Every RPC the browser is
-- meant to call must from now on carry an explicit GRANT.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. Deny-by-default for functions created from here on.
--    (Applies to objects created later by this role; existing functions are
--    handled explicitly below.)
-- ---------------------------------------------------------------------------
alter default privileges in schema public revoke execute on functions from public;


-- ---------------------------------------------------------------------------
-- 2. Money mover: server-side callers only.
--    Game/payment RPCs are themselves SECURITY DEFINER and owned by the same
--    role, so their internal calls to adjust_balance() still succeed.
-- ---------------------------------------------------------------------------
revoke execute on function public.adjust_balance(uuid, numeric) from public;
revoke execute on function public.adjust_balance(uuid, numeric) from anon;
revoke execute on function public.adjust_balance(uuid, numeric) from authenticated;
grant  execute on function public.adjust_balance(uuid, numeric) to  service_role;


-- ---------------------------------------------------------------------------
-- 3. Trigger functions are not RPCs. Calling them over PostgREST would error
--    anyway (no trigger context), but they should not be reachable at all.
-- ---------------------------------------------------------------------------
revoke execute on function public.set_updated_at()        from public, anon, authenticated;
revoke execute on function public.handle_new_user()       from public, anon, authenticated;
revoke execute on function public.guard_balance_change()  from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- 4. is_admin() stays callable: it is read-only, reveals only the caller's own
--    admin status, and RLS policies invoke it.
-- ---------------------------------------------------------------------------
grant execute on function public.is_admin() to anon, authenticated;


-- ---------------------------------------------------------------------------
-- 5. Gap: 0001 created a profile on signup but no vip_progress row, so the VIP
--    page reads an empty set for every new user. Create both, atomically.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.vip_progress (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end $$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Backfill anyone who signed up before this migration.
insert into public.vip_progress (user_id)
select p.id from public.profiles p
where not exists (select 1 from public.vip_progress v where v.user_id = p.id);


-- ---------------------------------------------------------------------------
-- 6. Gap: admin bootstrap. `is_admin` defaults to false and nothing sets it,
--    so /admin was unreachable on a fresh database.
--
--    Deliberately NOT an RPC — there is no promote-to-admin endpoint for a
--    client to find. Promotion happens out-of-band via the service role
--    (see scripts/promote-admin.mjs), which is exactly the trust boundary we
--    want: holding the service key is the authorisation.
--
--    This helper exists so that script (and the SQL editor) has one audited
--    place to do it, rather than ad-hoc UPDATEs.
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

  update public.profiles
     set is_admin = true, admin_role = p_role
   where lower(email) = lower(p_email)
  returning * into v_row;

  if v_row.id is null then
    raise exception 'no profile with email %  (sign up first, then promote)', p_email;
  end if;
  return v_row;
end $$;

revoke execute on function public.promote_to_admin(text, text) from public, anon, authenticated;
grant  execute on function public.promote_to_admin(text, text) to  service_role;
