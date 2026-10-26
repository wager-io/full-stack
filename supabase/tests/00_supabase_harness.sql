-- Test harness: the parts of a Supabase database that our migrations depend on.
-- This is NOT part of the product; it stands in for what Supabase provisions,
-- so the real migrations can run unmodified against a vanilla Postgres.

-- ---------------------------------------------------------------------------
-- pgcrypto goes in `extensions`, NOT `public` — because that is where Supabase
-- puts it, and the difference is load-bearing.
--
-- A bare `create extension pgcrypto` installs into public, so every function
-- declaring `set search_path = public` can see gen_random_bytes()/digest()/
-- hmac(). On Supabase it cannot, and the function dies at runtime with
-- `function gen_random_bytes(integer) does not exist` — in production, on a
-- path the tests swore was green.
--
-- That happened: request_withdrawal (0016) passed every local test and failed
-- the moment it ran against a real Supabase database. Creating the extension
-- where Supabase creates it means a missing `extensions` entry in a function's
-- search_path now fails HERE instead.
--
-- Migrations run `create extension if not exists pgcrypto` without naming a
-- schema; because it already exists after this, that is a no-op and it stays
-- put.
-- ---------------------------------------------------------------------------
-- (The grant to the client roles comes after they are created, below.)
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
create extension if not exists "uuid-ossp" with schema extensions;

-- The other half, and both halves are needed to reproduce Supabase.
--
-- Supabase ships `search_path = "$user", public, extensions` on the postgres
-- role. That SESSION path is what resolves a column DEFAULT like
-- `bets.bet_id default encode(gen_random_bytes(9),'hex')` — defaults are
-- resolved once, at CREATE TABLE, against whatever is in scope then.
--
-- A FUNCTION BODY is different: it resolves at call time against the
-- function's own `set search_path`, which overrides the session. So this line
-- makes the DDL behave exactly as it does on Supabase, while a function that
-- declares `set search_path = public` and calls gen_random_bytes() still
-- fails here — which is the bug this harness exists to catch.
--
-- Applies to new sessions, which is every psql invocation after this file.
alter role postgres set search_path = "$user", public, extensions;

-- Supabase's roles. Idempotent: roles are cluster-wide, so they survive a
-- `create database`, and a bare `create role` would abort a re-run.
do $$
begin
  if not exists (select 1 from pg_roles where rolname='anon')          then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname='service_role')  then create role service_role nologin bypassrls; end if;
  if not exists (select 1 from pg_roles where rolname='authenticator') then create role authenticator noinherit login password 'x'; end if;
end $$;
grant anon, authenticated, service_role to authenticator;

-- PostgREST exposes `public` to these roles.
grant usage on schema public to anon, authenticated, service_role;
-- ...and `extensions`, which is where pgcrypto now lives (see the top).
grant usage on schema extensions to anon, authenticated, service_role;

-- Supabase grants table DML to the client roles by default and relies on RLS to
-- do the actual gating. Reproduce that, otherwise RLS is never exercised —
-- a bare "permission denied for table" would masquerade as a policy working.
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated, service_role;

-- Supabase's auth schema + users table (only the columns we touch).
create schema if not exists auth;
create table auth.users (
  id                 uuid primary key default gen_random_uuid(),
  email              text unique,
  raw_user_meta_data jsonb default '{}',
  created_at         timestamptz default now()
);
-- Real Supabase grants auth-schema usage to the client roles so RLS policies
-- can call auth.uid().
grant usage on schema auth to postgres, anon, authenticated, service_role;

-- auth.uid() — in real Supabase this reads the JWT claim. Here we drive it from
-- a GUC so a test can impersonate a specific user.
create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
grant execute on function auth.uid() to anon, authenticated, service_role;

-- Realtime publication that migrations ALTER.
create publication supabase_realtime;
