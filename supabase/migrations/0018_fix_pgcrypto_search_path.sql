-- =============================================================================
-- 0017_fix_pgcrypto_search_path.sql — a pgcrypto call that cannot see pgcrypto.
--
-- `profile_set_referral_code` (0010) is declared `set search_path = public` and
-- calls `gen_random_bytes(4)` in its body. On Supabase, pgcrypto is installed
-- into the `extensions` schema, not `public` — so the call does not resolve and
-- the function dies with:
--
--     ERROR: function gen_random_bytes(integer) does not exist
--
-- Every auto-generated affiliate code fails. Passing an explicit `p_code`
-- still works, which is why this survived: the branch that takes a
-- user-supplied code never reaches the generator.
--
-- WHY IT PASSED THE TESTS. A bare `create extension pgcrypto` — which is what
-- 0001 does, and what a local Postgres honours — installs into `public`, where
-- `search_path = public` finds it. The test harness was that bare Postgres, so
-- the suite and production disagreed about where pgcrypto lives.
--
-- Found while fixing the same mistake in 0017's `request_withdrawal`, which
-- failed on a real Supabase database after passing locally. The harness
-- (`00_supabase_harness.sql`) now installs pgcrypto into `extensions` and sets
-- the postgres role's search_path exactly as Supabase does, so this class of
-- bug fails locally from now on rather than in production.
--
-- A DEFAULT is unaffected and needs no fix: `bets.bet_id default
-- encode(gen_random_bytes(9),'hex')` is resolved once, at CREATE TABLE, against
-- the session search_path — which on Supabase includes `extensions`. Only
-- function BODIES re-resolve at call time, against the function's own setting.
--
-- Fixed in a new migration rather than by editing 0010, which has already been
-- applied. The body below is 0010's verbatim; the ONLY change is the
-- search_path line.
-- =============================================================================

create or replace function public.profile_set_referral_code(p_code text default null)
returns jsonb
language plpgsql
security definer
-- Both schemas listed, matching 0005: `extensions` is where Supabase puts
-- pgcrypto, `public` is where a bare local `create extension` puts it. A
-- schema that does not exist is ignored rather than an error, so this is
-- correct on either.
set search_path = public, extensions
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
