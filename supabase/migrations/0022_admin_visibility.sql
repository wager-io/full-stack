-- =============================================================================
-- 0022_admin_visibility.sql — let operators see what they are responsible for.
--
-- Two things, both discovered by trying to wire the admin screens to real data
-- and finding there was nothing an admin was allowed to read.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. tron_deposits and tron_deposit_addresses were the only money tables
--    without an admin clause.
--
--    Every other one carries `user_id = auth.uid() OR is_admin()` — bills,
--    bets, profiles, withdrawals, ledger_entries. These two say only
--    `user_id = auth.uid()`, so an administrator sees their OWN deposits and
--    nobody else's.
--
--    That is not merely a missing screen. "I deposited and it did not arrive"
--    is the single most common support request a casino gets, and until now
--    there was no way for anyone to look. The row exists — credited or
--    rejected, with the reason — and the person being asked about it could
--    not see it.
--
--    Read-only. An operator needs to see a deposit, never to edit one: the
--    watcher owns these rows and the tx_hash is the idempotency key. Nothing
--    good comes of a hand-edited deposit.
-- ---------------------------------------------------------------------------
drop policy if exists tron_dep_select_self on public.tron_deposits;
create policy tron_dep_select_self on public.tron_deposits
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists tron_addr_select_self on public.tron_deposit_addresses;
create policy tron_addr_select_self on public.tron_deposit_addresses
  for select using (user_id = auth.uid() or public.is_admin());


-- ---------------------------------------------------------------------------
-- 2. admin_dashboard_stats — the figures the dashboard was inventing.
--
--    An RPC rather than letting the client run count(*) over every table:
--    the numbers are derived together, in one round trip, from one consistent
--    snapshot. Five separate client queries would be five points in time, and
--    a dashboard whose halves disagree is worse than one that is merely slow.
--
--    Everything here is a COUNT or a SUM. No personal data crosses the
--    boundary, which is why it is safe to compute in one place and hand over
--    whole.
-- ---------------------------------------------------------------------------
create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare v jsonb;
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'not_authorised';
  end if;

  select jsonb_build_object(
    'players_total',      (select count(*) from public.profiles),
    'players_active',     (select count(*) from public.profiles where status = 'active'),
    'players_new_7d',     (select count(*) from public.profiles where created_at > now() - interval '7 days'),

    -- What players hold, split the way the money layer splits it: `available`
    -- is spendable, `held` is in clearing against an approved withdrawal.
    -- Summing them into one figure would hide the only number that answers
    -- "how much are we about to pay out".
    'balance_available',  (select coalesce(sum(balance), 0) from public.profiles),
    'balance_held',       (select coalesce(sum(clearing_balance), 0) from public.profiles),

    'deposits_count',     (select count(*) from public.tron_deposits where credited_at is not null),
    'deposits_total',     (select coalesce(sum(credited_usd), 0) from public.tron_deposits where credited_at is not null),
    'deposits_rejected',  (select count(*) from public.tron_deposits where rejected_reason is not null),

    'withdrawals_pending',(select count(*) from public.withdrawals where state in ('REQUESTED','APPROVED','BROADCASTING')),
    'withdrawals_paid',   (select coalesce(sum(amount), 0) from public.withdrawals where state = 'CONFIRMED'),

    'bets_total',         (select count(*) from public.bets where state <> 'pending'),
    'wagered_total',      (select coalesce(sum(bet_amount), 0) from public.bets where state <> 'pending'),
    'paid_out_total',     (select coalesce(sum(payout), 0) from public.bets where state <> 'pending'),
    -- Positive means the house is ahead. Derived here rather than subtracted
    -- in the browser so every screen quotes the same figure.
    'gross_gaming_revenue',
      (select coalesce(sum(bet_amount) - sum(payout), 0) from public.bets where state <> 'pending'),

    'wagered_24h',        (select coalesce(sum(bet_amount), 0) from public.bets
                            where state <> 'pending' and created_at > now() - interval '24 hours'),
    'bets_24h',           (select count(*) from public.bets
                            where state <> 'pending' and created_at > now() - interval '24 hours')
  ) into v;

  return v;
end $$;

revoke execute on function public.admin_dashboard_stats() from public, anon;
grant  execute on function public.admin_dashboard_stats() to authenticated;  -- is_admin() gates the body


-- ---------------------------------------------------------------------------
-- 3. admin_recent_activity — the money feed the dashboard listed as fiction.
--
--    Deposits and withdrawals interleaved, newest first. A union rather than
--    two lists, because an operator reading a dashboard wants to know what
--    happened last, not what happened last per table.
-- ---------------------------------------------------------------------------
create or replace function public.admin_recent_activity(p_limit int default 20)
returns table (
  kind       text,
  reference  text,
  user_id    uuid,
  username   text,
  amount     numeric,
  status     text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select * from (
    select 'deposit'::text,
           d.tx_hash,
           d.user_id,
           p.username,
           coalesce(d.credited_usd, 0),
           case
             when d.credited_at is not null then 'completed'
             when d.rejected_reason is not null then 'rejected'
             else 'pending'
           end,
           d.created_at
      from public.tron_deposits d
      join public.profiles p on p.id = d.user_id

    union all

    select 'withdrawal'::text,
           w.order_id,
           w.user_id,
           p.username,
           w.amount,
           lower(w.state),
           w.created_at
      from public.withdrawals w
      join public.profiles p on p.id = w.user_id
  ) rows(kind, reference, user_id, username, amount, status, created_at)
  where public.is_admin()
  order by created_at desc
  limit least(greatest(coalesce(p_limit, 20), 1), 200);
$$;

revoke execute on function public.admin_recent_activity(int) from public, anon;
grant  execute on function public.admin_recent_activity(int) to authenticated;
