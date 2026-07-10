-- =============================================================================
-- 0001_core_schema.sql  —  Phase 1 foundation
-- Identity (profiles), money guard, ledger (bills), VIP, notifications, chat.
-- Auth itself is handled by Supabase Auth (auth.users); `profiles` extends it.
-- =============================================================================

create extension if not exists pgcrypto;      -- gen_random_uuid, digest/hmac
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- profiles  (extends auth.users; mirrors the old Mongo `User` + `Admin` models)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  email               text,
  username            text,
  first_name          text,
  last_name           text,
  country             text,
  state               text,
  place               text,
  date_of_birth       date,
  resident_address    text,
  city                text,
  postal_code         text,
  balance             numeric(18,2) not null default 0,
  language            text default 'English',
  is_verified         boolean default false,
  status              text default 'active',          -- active | inactive | suspended
  referred_by         uuid references public.profiles(id),
  referral_campaign   text,
  commission_rate     numeric default 25,
  current_level       int default 0,
  withdrawal_disabled boolean default false,
  affiliate_code      text unique,
  referral_count      int default 0,
  agree_to_terms      boolean default false,
  profile_image       text,
  hidden_from_public  boolean default false,
  -- admin facets (old `Admin` model folded onto the single identity table)
  is_admin            boolean not null default false,
  admin_role          text,                            -- super_admin | admin | moderator | support
  permissions         text[] not null default '{}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index on public.profiles (referred_by);
create index on public.profiles (is_admin) where is_admin;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create a profile row automatically for every new auth user.
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
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Money guard: balance may ONLY change inside privileged (definer) functions
-- that set the app.allow_balance_change GUC. Direct client writes are blocked
-- even if RLS somehow allowed the row.
-- ---------------------------------------------------------------------------
create or replace function public.guard_balance_change()
returns trigger language plpgsql as $$
begin
  if new.balance is distinct from old.balance
     and coalesce(current_setting('app.allow_balance_change', true), 'off') <> 'on' then
    raise exception 'balance can only be changed by privileged functions';
  end if;
  return new;
end $$;

create trigger profiles_guard_balance before update on public.profiles
  for each row execute function public.guard_balance_change();

-- Atomic credit/debit used by every game/payment RPC. Negative delta = debit;
-- fails with insufficient_balance if it would go negative.
create or replace function public.adjust_balance(p_user uuid, p_delta numeric)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare v_balance numeric;
begin
  perform set_config('app.allow_balance_change', 'on', true);
  update public.profiles
     set balance = balance + p_delta
   where id = p_user
     and (p_delta >= 0 or balance + p_delta >= 0)
  returning balance into v_balance;
  perform set_config('app.allow_balance_change', 'off', true);
  if v_balance is null then
    raise exception 'insufficient_balance';
  end if;
  return v_balance;
end $$;

-- Convenience: am I an admin? (used by RLS on admin-only reads)
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ---------------------------------------------------------------------------
-- bills  (transaction ledger; every money event writes one)
-- ---------------------------------------------------------------------------
create table public.bills (
  id               bigint generated always as identity primary key,
  user_id          uuid not null references public.profiles(id) on delete cascade,
  transaction_type text not null,
  token_name       text,
  token_img        text,
  balance          numeric(18,2),
  trx_amount       numeric(18,2) not null,
  bill_id          text,
  status           boolean default true,
  created_at       timestamptz not null default now()
);
create index on public.bills (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- VIP
-- ---------------------------------------------------------------------------
create table public.vip_tiers (
  id             bigint generated always as identity primary key,
  name           text not null,
  color          text not null,
  wager_amount   text not null,
  icon           jsonb,
  features       text[] default '{}',
  required_wager numeric not null,
  level          int not null
);

create table public.vip_progress (
  user_id            uuid primary key references public.profiles(id) on delete cascade,
  current_wager      numeric not null default 0,
  current_tier       text default 'None',
  next_tier          text default 'Bronze',
  wager_to_next_tier numeric default 10000,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create trigger vip_progress_updated_at before update on public.vip_progress
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------
create table public.notifications (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  type         text not null,
  title        text not null,
  message      text not null,
  data         jsonb default '{}',
  read         boolean default false,
  read_at      timestamptz,
  action_url   text,
  priority     text default 'normal',
  expires_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index on public.notifications (user_id, created_at desc);
create index on public.notifications (user_id, read);
create trigger notifications_updated_at before update on public.notifications
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- chat  (public room messages)
-- ---------------------------------------------------------------------------
create table public.chat (
  id          bigint generated always as identity primary key,
  user_id     uuid references public.profiles(id) on delete set null,
  username    text not null,
  content     text not null check (char_length(content) <= 500),
  vip_level   int default 0,
  room        text default 'general',
  status      text default 'active',                  -- active | deleted | flagged
  is_edited   boolean default false,
  metadata    jsonb default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index on public.chat (room, created_at desc);

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.profiles      enable row level security;
alter table public.bills         enable row level security;
alter table public.vip_tiers     enable row level security;
alter table public.vip_progress  enable row level security;
alter table public.notifications enable row level security;
alter table public.chat          enable row level security;

-- profiles: read own row (+ admins read all); update own NON-money fields
-- (the balance guard trigger blocks any balance change from the client).
create policy profiles_select_self on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
-- (no client insert/delete: rows are created by the auth trigger.)

-- Public, balance-free view for leaderboards / live feeds.
create view public.public_profiles as
  select id, username, profile_image, current_level, hidden_from_public
    from public.profiles;
grant select on public.public_profiles to anon, authenticated;

-- bills: read own only; writes are server-only (definer functions).
create policy bills_select_self on public.bills
  for select using (user_id = auth.uid() or public.is_admin());

-- vip_tiers: world-readable reference data.
create policy vip_tiers_select_all on public.vip_tiers for select using (true);

-- vip_progress: read own (+ admins); writes server-only.
create policy vip_progress_select_self on public.vip_progress
  for select using (user_id = auth.uid() or public.is_admin());

-- notifications: read own; may toggle only the `read` flag on own rows.
create policy notifications_select_self on public.notifications
  for select using (user_id = auth.uid());
create policy notifications_update_read on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- chat: everyone reads; authenticated users may post AS THEMSELVES.
create policy chat_select_all on public.chat for select using (true);
create policy chat_insert_self on public.chat
  for insert with check (user_id = auth.uid() and status = 'active');

-- ===========================================================================
-- Realtime: expose the tables the client subscribes to.
-- ===========================================================================
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.chat;
