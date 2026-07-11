-- Test harness: the parts of a Supabase database that our migrations depend on.
-- This is NOT part of the product; it stands in for what Supabase provisions,
-- so the real migrations can run unmodified against a vanilla Postgres.

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
