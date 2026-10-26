-- =============================================================================
-- 0017_ledger_and_withdrawal_state_machine.sql
--
-- The money layer, rebuilt on the discipline the poker platform's financial-core
-- uses. CCPayment stays the on-chain rail; what changes is everything around it.
--
-- Three things were missing, and each of them is a way to lose money quietly:
--
-- 1. NO HOLD. 0015 debited the balance the instant a withdrawal was requested,
--    then refunded on failure. Between those two points the money existed
--    nowhere a human could see, and a refund that failed to run was simply
--    gone. Here the amount moves available -> clearing and stays visible on the
--    player's own row until it is either sent or handed back.
--
-- 2. NO APPROVAL. A withdrawal went straight to the gateway. Now it is
--    REQUESTED until an administrator approves it, and above
--    withdrawal_dual_confirm_usd() it takes two DISTINCT administrators.
--
-- 3. NO DOUBLE ENTRY. `bills` is a single-sided activity log: it records that a
--    player's balance moved and nothing about where the money came from or went.
--    There was no figure anywhere for "what do we owe players in total". The
--    EXTERNAL boundary account below is that figure — its balance, negated, is
--    the on-chain reserve the platform must actually custody.
--
-- `bills` is still written exactly as before. It is what the player's
-- transaction history reads, and this migration does not disturb it.
--
--   REQUESTED ──▶ APPROVED ──▶ BROADCASTING ──▶ CONFIRMED    (terminal, sent)
--        │            │              │
--        └────────────┴──────────────┴────────▶ ROLLED_BACK  (terminal, refunded)
--
--   REQUESTED    balance untouched — the request is a claim, not a movement.
--   APPROVED     available -> clearing. Held: unspendable, un-re-withdrawable.
--   BROADCASTING gateway has it, tx hash known. Still held.
--   CONFIRMED    clearing drained, PLAYER -> EXTERNAL posted. Money is gone.
--   ROLLED_BACK  hold released back to available, if any was held.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. The clearing balance.
--
-- A second balance on the profile rather than a separate table: the player's
-- row is already the source of truth for `balance`, and splitting the two
-- halves of one wallet across two tables is how they drift apart.
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists clearing_balance numeric(18,2) not null default 0;

-- Same backstop balance got in 0012. NOT VALID to avoid a full-table lock; it
-- binds every future write immediately.
alter table public.profiles drop constraint if exists profiles_clearing_is_a_number;
alter table public.profiles add  constraint profiles_clearing_is_a_number
  check (clearing_balance = clearing_balance) not valid;

alter table public.profiles drop constraint if exists profiles_clearing_non_negative;
alter table public.profiles add  constraint profiles_clearing_non_negative
  check (clearing_balance >= 0) not valid;

-- Clients may not SELECT-then-UPDATE their way into a hold either.
revoke update (clearing_balance) on public.profiles from anon, authenticated;

-- ---------------------------------------------------------------------------
-- The 0001 guard only watched `balance`. A clearing balance that anything can
-- write is a balance an attacker can move back to available, so it joins the
-- same gate: changeable only inside a definer function that opts in.
-- ---------------------------------------------------------------------------
create or replace function public.guard_balance_change()
returns trigger language plpgsql as $$
begin
  if (new.balance is distinct from old.balance
      or new.clearing_balance is distinct from old.clearing_balance)
     and coalesce(current_setting('app.allow_balance_change', true), 'off') <> 'on' then
    raise exception 'balance can only be changed by privileged functions';
  end if;
  return new;
end $$;

revoke execute on function public.guard_balance_change() from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- 2. hold / release / settle — the three moves across the two balances.
--
-- Each is a single guarded UPDATE, exactly like adjust_balance: the
-- sufficiency test lives in the WHERE clause, so two concurrent calls cannot
-- both pass it. A null result means "not enough", never "maybe".
-- ---------------------------------------------------------------------------

-- available -> clearing. Raises insufficient_balance rather than overdrawing.
create or replace function public.hold_funds(p_user uuid, p_amount numeric)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare v_balance numeric;
begin
  if p_amount is null or p_amount = 'NaN'::numeric or p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;

  perform set_config('app.allow_balance_change', 'on', true);
  update public.profiles
     set balance          = balance - p_amount,
         clearing_balance = clearing_balance + p_amount
   where id = p_user
     and balance >= p_amount
  returning balance into v_balance;
  perform set_config('app.allow_balance_change', 'off', true);

  if v_balance is null then
    raise exception 'insufficient_balance';
  end if;
  return v_balance;
end $$;

revoke execute on function public.hold_funds(uuid, numeric) from public, anon, authenticated;

-- clearing -> available. The refund path; the hold must still be there.
create or replace function public.release_hold(p_user uuid, p_amount numeric)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare v_balance numeric;
begin
  if p_amount is null or p_amount = 'NaN'::numeric or p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;

  perform set_config('app.allow_balance_change', 'on', true);
  update public.profiles
     set clearing_balance = clearing_balance - p_amount,
         balance          = balance + p_amount
   where id = p_user
     and clearing_balance >= p_amount
  returning balance into v_balance;
  perform set_config('app.allow_balance_change', 'off', true);

  if v_balance is null then
    raise exception 'hold_not_found';
  end if;
  return v_balance;
end $$;

revoke execute on function public.release_hold(uuid, numeric) from public, anon, authenticated;

-- clearing -> nowhere. The money has left the platform; this is the only
-- function in the schema that destroys a player balance without crediting
-- anything back, which is why it is reachable from exactly one caller.
create or replace function public.settle_hold(p_user uuid, p_amount numeric)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare v_clearing numeric;
begin
  if p_amount is null or p_amount = 'NaN'::numeric or p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;

  perform set_config('app.allow_balance_change', 'on', true);
  update public.profiles
     set clearing_balance = clearing_balance - p_amount
   where id = p_user
     and clearing_balance >= p_amount
  returning clearing_balance into v_clearing;
  perform set_config('app.allow_balance_change', 'off', true);

  if v_clearing is null then
    raise exception 'hold_not_found';
  end if;
  return v_clearing;
end $$;

revoke execute on function public.settle_hold(uuid, numeric) from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- 3. System accounts — the non-player side of every entry.
--
-- EXTERNAL is not a fund pool. It is the outside world: the counterparty that
-- deposits come from and withdrawals go to. It is ALLOWED TO GO NEGATIVE, and
-- that is the whole point — minus its balance is the total players hold on
-- platform, which is the number the hot wallet has to cover.
--
-- TREASURY is a real pool: house income. Nothing in this migration moves money
-- into it; it exists so the house edge has somewhere to be recorded later
-- rather than being invented at that point.
-- ---------------------------------------------------------------------------
create table if not exists public.system_accounts (
  kind       text primary key check (kind in ('EXTERNAL', 'TREASURY')),
  balance    numeric(24,2) not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.system_accounts (kind) values ('EXTERNAL'), ('TREASURY')
  on conflict (kind) do nothing;

alter table public.system_accounts enable row level security;

-- Dropped first so the whole migration can be re-applied. Every other
-- statement here is already guarded (`if not exists`, `on conflict do
-- nothing`, `create or replace`); `create policy` has no such form in
-- Postgres 15, and an unguarded one is what turns "run it again to pick up a
-- fix" into "the migration dies halfway through".
drop policy if exists system_accounts_admin_read on public.system_accounts;
create policy system_accounts_admin_read on public.system_accounts
  for select using (public.is_admin());

revoke insert, update, delete on public.system_accounts from anon, authenticated;


-- ---------------------------------------------------------------------------
-- 4. The clearing-path whitelist.
--
-- Funds may only flow along a listed pair. Anything else is refused outright.
-- HARDCODED here and deliberately not a table: a whitelist an administrator can
-- edit is not a control, and the point of this list is that changing it takes a
-- migration and a second pair of eyes.
-- ---------------------------------------------------------------------------
create or replace function public.is_flow_allowed(p_from text, p_to text)
returns boolean
language sql
immutable
as $$
  select (p_from, p_to) in (
    ('EXTERNAL', 'PLAYER'),    -- deposit: the world funds a player
    ('PLAYER',   'EXTERNAL'),  -- withdrawal: a player cashes out
    ('PLAYER',   'TREASURY'),  -- house income (rake / margin)
    ('TREASURY', 'PLAYER')     -- winnings, goodwill credits, manual correction
  );
$$;

revoke execute on function public.is_flow_allowed(text, text) from public, anon;
grant  execute on function public.is_flow_allowed(text, text) to  authenticated;


-- ---------------------------------------------------------------------------
-- 5. ledger_entries — matched DEBIT/CREDIT pairs.
--
-- Two rows per movement, same idempotency_key, opposite directions. The unique
-- index on (idempotency_key, direction) is what makes replay safe: a webhook
-- delivered twice produces one pair, not two, and the guarantee is a database
-- constraint rather than an if-statement that two concurrent callers can both
-- pass.
--
-- `amount` is always POSITIVE. Direction carries the sign — a signed amount
-- plus a direction gives you two ways to say the same thing and eventually they
-- disagree.
-- ---------------------------------------------------------------------------
create table if not exists public.ledger_entries (
  id                   bigint generated always as identity primary key,
  idempotency_key      text not null,
  business_id          text,
  account_kind         text not null check (account_kind in ('PLAYER','TREASURY','EXTERNAL')),
  -- ON DELETE RESTRICT, not CASCADE, and that is a decision rather than an
  -- oversight. deposits and withdrawals cascade because they are operational
  -- records; the ledger is the account of what actually happened to money, and
  -- deleting a player must not be able to erase it. The practical effect is
  -- that a profile with ledger history cannot be deleted at all — such an
  -- account gets `status` set to inactive instead. If a deletion is ever
  -- genuinely required (a GDPR erasure, say), the entries are anonymised by a
  -- deliberate migration, which is the point: it takes a decision, not a
  -- DELETE that silently takes the books with it.
  account_user_id      uuid references public.profiles(id) on delete restrict,
  counterparty_kind    text not null check (counterparty_kind in ('PLAYER','TREASURY','EXTERNAL')),
  counterparty_user_id uuid references public.profiles(id) on delete restrict,
  direction            text not null check (direction in ('DEBIT','CREDIT')),
  amount               numeric(18,2) not null check (amount > 0),
  type                 text not null check (type in (
                         'DEPOSIT','WITHDRAW','WITHDRAW_REFUND','BET','WIN_PAYOUT','RAKE','ADJUSTMENT')),
  status               text not null default 'SETTLED'
                         check (status in ('PENDING','SETTLED','FAILED','ROLLED_BACK')),
  metadata             jsonb,
  created_at           timestamptz not null default now(),

  -- A PLAYER side names a player; a system side does not. Enforced rather than
  -- assumed, because an entry with a null player is an entry that belongs to
  -- nobody and will never be found again.
  constraint ledger_player_side_has_user
    check ((account_kind = 'PLAYER') = (account_user_id is not null)),
  constraint ledger_counterparty_side_has_user
    check ((counterparty_kind = 'PLAYER') = (counterparty_user_id is not null))
);

create unique index if not exists ledger_entries_idem_direction
  on public.ledger_entries (idempotency_key, direction);
create index if not exists ledger_entries_player
  on public.ledger_entries (account_user_id, created_at desc)
  where account_user_id is not null;
create index if not exists ledger_entries_business
  on public.ledger_entries (business_id);

alter table public.ledger_entries enable row level security;

-- A player may read their own side of the book. Admins read all of it.
drop policy if exists ledger_entries_own_read on public.ledger_entries;
create policy ledger_entries_own_read on public.ledger_entries
  for select using (account_user_id = auth.uid() or public.is_admin());

revoke insert, update, delete on public.ledger_entries from anon, authenticated;


-- ---------------------------------------------------------------------------
-- post_ledger_pair — write one movement as two entries.
--
-- SCOPE, because getting this wrong double-moves money: this function owns the
-- SYSTEM account balance and the ledger rows. It does NOT touch a player's
-- balance — that is the caller's, through adjust_balance/hold_funds, which
-- already carry the overdraft guards. Caller and callee run in the same
-- transaction, so the pair either both happen or neither does.
--
-- Returns false when the movement was already posted under this key.
-- ---------------------------------------------------------------------------
create or replace function public.post_ledger_pair(
  p_key          text,
  p_business_id  text,
  p_from_kind    text,
  p_from_user    uuid,
  p_to_kind      text,
  p_to_user      uuid,
  p_amount       numeric,
  p_type         text,
  p_metadata     jsonb default '{}'
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare v_inserted int;
begin
  if p_key is null or btrim(p_key) = '' then
    raise exception 'missing_idempotency_key';
  end if;
  if p_amount is null or p_amount = 'NaN'::numeric or p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;
  if p_amount <> round(p_amount, 2) then
    raise exception 'invalid_amount_precision';
  end if;

  -- CB6, the one that matters: an unlisted flow is refused, not logged and
  -- allowed through.
  if not public.is_flow_allowed(p_from_kind, p_to_kind) then
    raise exception 'illegal_fund_flow: % -> %', p_from_kind, p_to_kind;
  end if;

  insert into public.ledger_entries (
    idempotency_key, business_id,
    account_kind, account_user_id, counterparty_kind, counterparty_user_id,
    direction, amount, type, status, metadata
  )
  values
    (p_key, p_business_id, p_from_kind, p_from_user, p_to_kind, p_to_user,
     'DEBIT',  p_amount, p_type, 'SETTLED', coalesce(p_metadata, '{}')),
    (p_key, p_business_id, p_to_kind, p_to_user, p_from_kind, p_from_user,
     'CREDIT', p_amount, p_type, 'SETTLED', coalesce(p_metadata, '{}'))
  on conflict (idempotency_key, direction) do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return false;   -- already posted; say so instead of posting it again
  end if;

  -- System-account balances. EXTERNAL carries no floor on purpose: it is the
  -- outside world, and it going negative is the normal, correct state.
  if p_from_kind <> 'PLAYER' then
    update public.system_accounts
       set balance = balance - p_amount, updated_at = now()
     where kind = p_from_kind;
  end if;

  if p_to_kind <> 'PLAYER' then
    update public.system_accounts
       set balance = balance + p_amount, updated_at = now()
     where kind = p_to_kind;
  end if;

  return true;
end $$;

revoke execute on function public.post_ledger_pair(
  text, text, text, uuid, text, uuid, numeric, text, jsonb
) from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- 6. The withdrawal state machine.
--
-- Its own table, NOT an extension of ccp_withdrawals (0015), and that is the
-- point. A withdrawal is a promise to send a player money; which rail carries
-- it — CCPayment today, self-custody TRON next to the deposits in 0016
-- tomorrow — is a detail of how it gets there. Putting the state machine on
-- the gateway's table would mean a second, divergent copy of the hold and the
-- approval the first time a withdrawal leaves by any other route.
--
-- `chain` and `coin_id` say which rail; everything else is rail-agnostic.
--
-- `status` is the coarse legacy projection of `state`, kept because the admin
-- screens and the player's transaction list read it. `state` is the truth;
-- `status` is written by the same statement every time, so the two cannot
-- drift.
-- ---------------------------------------------------------------------------
create table if not exists public.withdrawals (
  id         bigint generated always as identity primary key,
  order_id   text not null unique,
  record_id  text,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  amount     numeric(18,2) not null check (amount > 0),
  currency   text,
  chain      text,
  address    text,
  memo       text,
  status     text not null default 'pending'
               check (status in ('pending', 'processing', 'completed', 'failed')),
  refunded   boolean not null default false,
  raw        jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists withdrawals_user_created on public.withdrawals (user_id, created_at desc);

drop trigger if exists withdrawals_updated_at on public.withdrawals;
create trigger withdrawals_updated_at before update on public.withdrawals
  for each row execute function public.set_updated_at();

alter table public.withdrawals enable row level security;

-- Read-your-own; admins read all. No write policy at all: the browser holds
-- the anon key and must never write a money row. Everything below is a
-- SECURITY DEFINER RPC or service role.
drop policy if exists withdrawals_own_read on public.withdrawals;
create policy withdrawals_own_read on public.withdrawals
  for select using (user_id = auth.uid() or public.is_admin());

revoke insert, update, delete on public.withdrawals from anon, authenticated;
alter table public.withdrawals
  add column if not exists state text not null default 'REQUESTED',
  add column if not exists approvals uuid[] not null default '{}',
  add column if not exists tx_hash text,
  add column if not exists failure_reason text,
  add column if not exists coin_id int,
  add column if not exists coin_amount numeric(36,18),
  add column if not exists approved_at timestamptz,
  add column if not exists broadcast_at timestamptz,
  add column if not exists settled_at timestamptz;

alter table public.withdrawals drop constraint if exists withdrawals_state_check;
alter table public.withdrawals add  constraint withdrawals_state_check
  check (state in ('REQUESTED','APPROVED','BROADCASTING','CONFIRMED','ROLLED_BACK'));

-- A withdrawal is only ever held once, for its own amount. Index supports the
-- ops queue, which reads exactly these two states.
create index if not exists withdrawals_open_state
  on public.withdrawals (created_at)
  where state in ('REQUESTED', 'APPROVED');

-- The legacy projection. One place, so there is one answer.
create or replace function public.withdrawal_legacy_status(p_state text)
returns text
language sql
immutable
as $$
  select case p_state
    when 'REQUESTED'    then 'pending'
    when 'APPROVED'     then 'pending'
    when 'BROADCASTING' then 'processing'
    when 'CONFIRMED'    then 'completed'
    when 'ROLLED_BACK'  then 'failed'
    else 'pending'
  end;
$$;

revoke execute on function public.withdrawal_legacy_status(text) from public, anon;
grant  execute on function public.withdrawal_legacy_status(text) to authenticated;


-- Permitted transitions. Any live state may roll back; terminal states move
-- nowhere at all.
create or replace function public.can_transition(p_from text, p_to text)
returns boolean
language sql
immutable
as $$
  select (p_from, p_to) in (
    ('REQUESTED',    'APPROVED'),
    ('REQUESTED',    'ROLLED_BACK'),
    ('APPROVED',     'BROADCASTING'),
    ('APPROVED',     'ROLLED_BACK'),
    ('BROADCASTING', 'CONFIRMED'),
    ('BROADCASTING', 'ROLLED_BACK')
  );
$$;

revoke execute on function public.can_transition(text, text) from public, anon;
grant  execute on function public.can_transition(text, text) to authenticated;


-- States in which the amount is sitting in the player's clearing balance.
-- Whether a rollback has something to give back is decided from this and
-- nothing else.
create or replace function public.is_held_in_clearing(p_state text)
returns boolean
language sql
immutable
as $$
  select p_state in ('APPROVED', 'BROADCASTING');
$$;

revoke execute on function public.is_held_in_clearing(text) from public, anon, authenticated;


-- Above this, one administrator is not enough. Changing it is a migration,
-- on purpose.
create or replace function public.withdrawal_dual_confirm_usd()
returns numeric
language sql
immutable
as $$
  select 10000::numeric;
$$;

revoke execute on function public.withdrawal_dual_confirm_usd() from public, anon;
grant  execute on function public.withdrawal_dual_confirm_usd() to authenticated;


-- ---------------------------------------------------------------------------
-- Notification helper. Every transition tells the player something, because
-- the failure mode of the old flow was silence: money left a balance, or came
-- back to it, and nothing ever said so.
-- ---------------------------------------------------------------------------
create or replace function public.notify_user(
  p_user uuid, p_type text, p_title text, p_message text, p_data jsonb default '{}'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, message, data)
  values (p_user, p_type, p_title, p_message, coalesce(p_data, '{}'));
exception when others then
  -- A notification must never be able to fail the money movement that
  -- triggered it. Losing a message is bad; rolling back a confirmed
  -- withdrawal because the message could not be written is worse.
  raise warning 'notify_user failed for % (%): %', p_user, p_type, sqlerrm;
end $$;

revoke execute on function public.notify_user(uuid, text, text, text, jsonb)
  from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- REQUESTED — record the claim. No balance moves.
--
-- Deliberately: the player is asking, and risk review has not happened. Holding
-- the funds here would mean a rejected request still took the money out of
-- their wallet for however long the review took.
--
-- The user comes from auth.uid() and never from an argument, so there is no
-- parameter a caller could aim at somebody else's balance.
-- ---------------------------------------------------------------------------
create or replace function public.request_withdrawal(
  p_amount      numeric,
  p_address     text,
  p_chain       text,
  p_currency    text default 'USDT',
  p_memo        text default null,
  p_coin_id     int  default null,
  p_coin_amount numeric default null
)
returns jsonb
language plpgsql
security definer
-- `extensions` as well as `public`, following 0005: Supabase installs pgcrypto
-- into `extensions`, while a bare local `create extension` puts it in
-- `public`. gen_random_bytes() below is resolved at RUNTIME against this
-- search_path (unlike a column DEFAULT, which binds the function OID when the
-- table is created — which is why bets.bet_id gets away with naming it
-- unqualified). Listing both schemas keeps it resolvable either way; a schema
-- that does not exist is ignored rather than an error.
set search_path = public, extensions
as $$
declare
  v_user     uuid := auth.uid();
  v_profile  public.profiles;
  v_order_id text;
begin
  if v_user is null then
    raise exception 'not_authenticated';
  end if;

  -- Same NaN reasoning as 0012: Postgres numeric NaN is equal to itself and
  -- greater than everything, so it walks straight through `<= 0`.
  if p_amount is null or p_amount = 'NaN'::numeric or p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;
  if p_amount <> round(p_amount, 2) then
    raise exception 'invalid_amount_precision';
  end if;
  if p_address is null or btrim(p_address) = '' then
    raise exception 'missing_address';
  end if;

  select * into v_profile from public.profiles where id = v_user;
  if v_profile.id is null then
    raise exception 'unknown_user';
  end if;
  if v_profile.status <> 'active' then
    raise exception 'account_not_active';
  end if;
  if coalesce(v_profile.withdrawal_disabled, false) then
    raise exception 'withdrawals_disabled';
  end if;

  -- An early, honest answer. Re-checked atomically at approval, which is the
  -- point that actually moves the money — between here and there the player can
  -- spend, and the approval is what must not overdraw.
  if v_profile.balance < p_amount then
    raise exception 'insufficient_balance';
  end if;

  -- One open withdrawal at a time. Without this a player with $100 can queue
  -- ten $100 requests: each passes the check above, and whichever two an
  -- administrator approves first race for the same funds.
  if exists (
    select 1 from public.withdrawals
     where user_id = v_user and state in ('REQUESTED','APPROVED','BROADCASTING')
  ) then
    raise exception 'withdrawal_already_pending';
  end if;

  v_order_id := encode(gen_random_bytes(9), 'hex');

  insert into public.withdrawals (
    order_id, user_id, amount, currency, chain, address, memo,
    coin_id, coin_amount, state, status
  ) values (
    v_order_id, v_user, p_amount, coalesce(p_currency, 'USDT'), p_chain,
    btrim(p_address), nullif(btrim(coalesce(p_memo, '')), ''),
    p_coin_id, coalesce(p_coin_amount, p_amount),
    'REQUESTED', public.withdrawal_legacy_status('REQUESTED')
  );

  -- Sent now, before anything moves. This is the message that tells somebody
  -- about a withdrawal they did not make, and it is worth least once the money
  -- is already gone.
  perform public.notify_user(
    v_user, 'withdrawal',
    'Withdrawal requested',
    format('Your withdrawal of $%s is awaiting review.', trim(to_char(p_amount, 'FM999999999990.00'))),
    jsonb_build_object('order_id', v_order_id, 'amount', p_amount, 'address', btrim(p_address))
  );

  return jsonb_build_object('ok', true, 'order_id', v_order_id, 'state', 'REQUESTED');
end $$;

revoke execute on function public.request_withdrawal(numeric, text, text, text, text, int, numeric)
  from public, anon;
grant  execute on function public.request_withdrawal(numeric, text, text, text, text, int, numeric)
  to authenticated;


-- ---------------------------------------------------------------------------
-- APPROVED — record this approver, and once enough DISTINCT ones have signed,
-- hold the funds.
--
-- Under-approved is a real, reportable state, not an error: a large withdrawal
-- with one signature stays REQUESTED and the caller is told "1 of 2". The funds
-- are not held until the last required approval, so a half-approved withdrawal
-- never locks a player's balance.
-- ---------------------------------------------------------------------------
create or replace function public.approve_withdrawal(p_order_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin    uuid := auth.uid();
  v_wd       public.withdrawals%rowtype;
  v_required int;
  v_count    int;
begin
  if v_admin is null or not public.is_admin() then
    raise exception 'not_authorised';
  end if;

  -- FOR UPDATE before anything is read off the row: two administrators
  -- clicking at once must queue here, or both read one approval and both
  -- decide they are the second.
  select * into v_wd from public.withdrawals where order_id = p_order_id for update;
  if v_wd.id is null then
    raise exception 'unknown_withdrawal';
  end if;
  if v_wd.state <> 'REQUESTED' then
    raise exception 'invalid_transition: % -> APPROVED', v_wd.state;
  end if;

  v_required := case when v_wd.amount > public.withdrawal_dual_confirm_usd() then 2 else 1 end;

  -- The same administrator cannot count twice, however many times they click.
  if not (v_admin = any(v_wd.approvals)) then
    v_wd.approvals := v_wd.approvals || v_admin;
    update public.withdrawals
       set approvals = v_wd.approvals
     where id = v_wd.id;
  end if;

  v_count := array_length(v_wd.approvals, 1);

  if v_count < v_required then
    return jsonb_build_object(
      'ok', true, 'state', 'REQUESTED',
      'approvals', v_count, 'required', v_required, 'held', false
    );
  end if;

  -- Now the money moves. hold_funds re-tests sufficiency inside its own
  -- UPDATE, so a balance spent since the request fails here rather than
  -- overdrawing.
  perform public.hold_funds(v_wd.user_id, v_wd.amount);

  update public.withdrawals
     set state       = 'APPROVED',
         status      = public.withdrawal_legacy_status('APPROVED'),
         approved_at = now()
   where id = v_wd.id;

  perform public.notify_user(
    v_wd.user_id, 'withdrawal',
    'Withdrawal approved',
    format('Your withdrawal of $%s has been approved and is being sent.',
           trim(to_char(v_wd.amount, 'FM999999999990.00'))),
    jsonb_build_object('order_id', v_wd.order_id, 'amount', v_wd.amount)
  );

  return jsonb_build_object(
    'ok', true, 'state', 'APPROVED',
    'approvals', v_count, 'required', v_required, 'held', true
  );
end $$;

revoke execute on function public.approve_withdrawal(text) from public, anon;
grant  execute on function public.approve_withdrawal(text) to authenticated;  -- is_admin() gates the body


-- ---------------------------------------------------------------------------
-- BROADCASTING — the gateway has accepted it and a tx hash exists.
--
-- Called by the dispatcher Edge Function, not by a person. The funds stay held:
-- nothing about handing a transaction to the network makes it final.
-- ---------------------------------------------------------------------------
create or replace function public.broadcast_withdrawal(
  p_order_id    text,
  p_tx_hash     text default null,
  p_record_id   text default null,
  p_raw         jsonb default null,
  -- The coin amount actually sent, priced by the dispatcher at send time. Null
  -- from the webhook, which only reports on a send it did not make.
  p_coin_amount numeric default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_wd public.withdrawals%rowtype;
begin
  select * into v_wd from public.withdrawals where order_id = p_order_id for update;
  if v_wd.id is null then
    return jsonb_build_object('ok', false, 'reason', 'unknown_order_id');
  end if;

  -- Already past this point. A retried dispatch is not an error — say so and
  -- change nothing.
  if v_wd.state in ('BROADCASTING', 'CONFIRMED') then
    return jsonb_build_object('ok', true, 'changed', false, 'state', v_wd.state);
  end if;
  if not public.can_transition(v_wd.state, 'BROADCASTING') then
    return jsonb_build_object('ok', false, 'reason', 'invalid_transition', 'state', v_wd.state);
  end if;

  update public.withdrawals
     set state        = 'BROADCASTING',
         status       = public.withdrawal_legacy_status('BROADCASTING'),
         tx_hash      = coalesce(p_tx_hash, tx_hash),
         record_id    = coalesce(p_record_id, record_id),
         coin_amount  = coalesce(p_coin_amount, coin_amount),
         raw          = coalesce(p_raw, raw),
         broadcast_at = now()
   where id = v_wd.id;

  -- Sent here rather than at confirmation because the hash exists from this
  -- point, and the hash is the thing a player can actually paste into an
  -- explorer while they wait.
  perform public.notify_user(
    v_wd.user_id, 'withdrawal',
    'Withdrawal sent',
    format('Your withdrawal of $%s is on its way. Arrival depends on network confirmations.',
           trim(to_char(v_wd.amount, 'FM999999999990.00'))),
    jsonb_build_object('order_id', v_wd.order_id, 'amount', v_wd.amount, 'tx_hash', p_tx_hash)
  );

  return jsonb_build_object('ok', true, 'changed', true, 'state', 'BROADCASTING');
end $$;

revoke execute on function public.broadcast_withdrawal(text, text, text, jsonb, numeric)
  from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- CONFIRMED — the money has left. Drain the hold, post PLAYER -> EXTERNAL.
--
-- This is the only point at which a withdrawal is written to the ledger. Up to
-- here nothing had irreversibly happened, and a ledger entry for a movement
-- that might still roll back is a ledger that has to be un-written.
-- ---------------------------------------------------------------------------
create or replace function public.confirm_withdrawal(
  p_order_id  text,
  p_tx_hash   text default null,
  p_raw       jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_wd public.withdrawals%rowtype;
begin
  select * into v_wd from public.withdrawals where order_id = p_order_id for update;
  if v_wd.id is null then
    return jsonb_build_object('ok', false, 'reason', 'unknown_order_id');
  end if;
  if v_wd.state = 'CONFIRMED' then
    return jsonb_build_object('ok', true, 'changed', false, 'state', 'CONFIRMED');
  end if;
  if not public.can_transition(v_wd.state, 'CONFIRMED') then
    return jsonb_build_object('ok', false, 'reason', 'invalid_transition', 'state', v_wd.state);
  end if;

  -- Hold -> gone. Guarded, so a withdrawal whose hold is somehow missing fails
  -- loudly here instead of silently confirming money that was never held.
  perform public.settle_hold(v_wd.user_id, v_wd.amount);

  perform public.post_ledger_pair(
    'withdraw:' || v_wd.order_id, v_wd.order_id,
    'PLAYER', v_wd.user_id,
    'EXTERNAL', null,
    v_wd.amount, 'WITHDRAW',
    jsonb_build_object('address', v_wd.address, 'tx_hash', coalesce(p_tx_hash, v_wd.tx_hash),
                       'chain', v_wd.chain, 'currency', v_wd.currency)
  );

  update public.withdrawals
     set state      = 'CONFIRMED',
         status     = public.withdrawal_legacy_status('CONFIRMED'),
         tx_hash    = coalesce(p_tx_hash, tx_hash),
         raw        = coalesce(p_raw, raw),
         settled_at = now()
   where id = v_wd.id;

  -- The end of the story. Without it a player is left on "arrival depends on
  -- confirmations" forever and has to go and check their own wallet.
  perform public.notify_user(
    v_wd.user_id, 'withdrawal',
    'Withdrawal complete',
    format('Your withdrawal of $%s has been sent.',
           trim(to_char(v_wd.amount, 'FM999999999990.00'))),
    jsonb_build_object('order_id', v_wd.order_id, 'amount', v_wd.amount,
                       'tx_hash', coalesce(p_tx_hash, v_wd.tx_hash))
  );

  return jsonb_build_object('ok', true, 'changed', true, 'state', 'CONFIRMED');
end $$;

revoke execute on function public.confirm_withdrawal(text, text, jsonb)
  from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- ROLLED_BACK — terminal failure. Give the hold back, if there was one.
--
-- From REQUESTED there is nothing held and nothing to release; from APPROVED or
-- BROADCASTING there is. is_held_in_clearing() decides, so the two cases cannot
-- be confused into a double refund.
-- ---------------------------------------------------------------------------
create or replace function public.rollback_withdrawal(
  p_order_id text,
  p_reason   text,
  p_raw      jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wd      public.withdrawals%rowtype;
  v_balance numeric;
begin
  select * into v_wd from public.withdrawals where order_id = p_order_id for update;
  if v_wd.id is null then
    return jsonb_build_object('ok', false, 'reason', 'unknown_order_id');
  end if;
  if v_wd.state = 'ROLLED_BACK' then
    return jsonb_build_object('ok', true, 'changed', false, 'state', 'ROLLED_BACK');
  end if;
  if not public.can_transition(v_wd.state, 'ROLLED_BACK') then
    return jsonb_build_object('ok', false, 'reason', 'invalid_transition', 'state', v_wd.state);
  end if;

  if public.is_held_in_clearing(v_wd.state) then
    v_balance := public.release_hold(v_wd.user_id, v_wd.amount);

    -- The player's own history should show the money coming back, in the same
    -- place every other movement appears.
    insert into public.bills
      (user_id, transaction_type, token_name, balance, trx_amount, bill_id, status)
    values
      (v_wd.user_id, 'Withdrawal Refund', v_wd.currency, v_balance,
       v_wd.amount, v_wd.order_id, true);
  end if;

  update public.withdrawals
     set state          = 'ROLLED_BACK',
         status         = public.withdrawal_legacy_status('ROLLED_BACK'),
         failure_reason = p_reason,
         refunded       = public.is_held_in_clearing(v_wd.state),
         raw            = coalesce(p_raw, raw),
         settled_at     = now()
   where id = v_wd.id;

  -- `p_reason` is deliberately NOT shown to the player: it carries the
  -- rejecting administrator's id and internal failure text. What they need is
  -- the outcome, which is the same either way.
  perform public.notify_user(
    v_wd.user_id, 'withdrawal',
    'Withdrawal returned',
    format('Your withdrawal of $%s could not be completed. The amount is back in your balance.',
           trim(to_char(v_wd.amount, 'FM999999999990.00'))),
    jsonb_build_object('order_id', v_wd.order_id, 'amount', v_wd.amount)
  );

  return jsonb_build_object('ok', true, 'changed', true, 'state', 'ROLLED_BACK');
end $$;

revoke execute on function public.rollback_withdrawal(text, text, jsonb)
  from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- reject_withdrawal — the administrator-facing door onto rollback.
--
-- Separate from rollback_withdrawal because that one is service-role only and
-- takes a free-text reason; this one establishes WHO rejected it and stamps
-- that into the reason itself.
-- ---------------------------------------------------------------------------
create or replace function public.reject_withdrawal(p_order_id text, p_reason text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_admin uuid := auth.uid();
begin
  if v_admin is null or not public.is_admin() then
    raise exception 'not_authorised';
  end if;

  return public.rollback_withdrawal(
    p_order_id,
    format('rejected by %s: %s', v_admin, coalesce(nullif(btrim(p_reason), ''), 'no reason given')),
    null
  );
end $$;

revoke execute on function public.reject_withdrawal(text, text) from public, anon;
grant  execute on function public.reject_withdrawal(text, text) to authenticated;  -- is_admin() gates the body


-- ---------------------------------------------------------------------------
-- The review queue. Facts only.
--
-- REQUESTED and APPROVED both appear. An APPROVED withdrawal has had its funds
-- held but not sent, and it is still something a human has to watch — dropping
-- it at approval would hide money that is mid-flight from the only screen
-- looking at it.
--
-- Whether an amount is "large" is a rule, and it lives with the function that
-- enforces it. The queue reports the amount, the signatures so far, and how
-- many are needed; the UI's second confirm is a courtesy, not the control.
-- ---------------------------------------------------------------------------
create or replace function public.withdrawal_queue(p_limit int default 200)
returns table (
  order_id    text,
  user_id     uuid,
  username    text,
  email       text,
  amount      numeric,
  currency    text,
  chain       text,
  address     text,
  state       text,
  approvals   uuid[],
  approved_by int,
  required    int,
  total_wager numeric,
  vip_level   int,
  created_at  timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select w.order_id,
         w.user_id,
         p.username,
         p.email,
         w.amount,
         w.currency,
         w.chain,
         w.address,
         w.state,
         w.approvals,
         coalesce(array_length(w.approvals, 1), 0),
         case when w.amount > public.withdrawal_dual_confirm_usd() then 2 else 1 end,
         coalesce(v.current_wager, 0),
         coalesce(p.current_level, 0),
         w.created_at
    from public.withdrawals w
    join public.profiles p on p.id = w.user_id
    left join public.vip_progress v on v.user_id = w.user_id
   where w.state in ('REQUESTED', 'APPROVED')
     and public.is_admin()          -- definer function: the gate has to be in the body
   order by w.created_at asc        -- oldest first. A queue, not a feed.
   limit least(greatest(coalesce(p_limit, 200), 1), 500);
$$;

revoke execute on function public.withdrawal_queue(int) from public, anon;
grant  execute on function public.withdrawal_queue(int) to authenticated;  -- is_admin() gates the rows


-- ---------------------------------------------------------------------------
-- ---------------------------------------------------------------------------
-- 7. Deposits join the ledger — BOTH deposit paths.
--
-- There are two, and the ledger is worth nothing if it only sees one:
--
--   tron_credit_deposit  (0016) — self-custody USDT-TRC20, the primary path
--   ccp_credit_deposit   (0015) — CCPayment, still live for other coins
--
-- Each is wrapped rather than rewritten. The original function keeps its name
-- and its behaviour; a trigger on the row it writes posts the matching
-- EXTERNAL -> PLAYER pair. That way this migration cannot change what a
-- deposit credits — it only records, in a second place, what already happened.
--
-- Wrapping by trigger and not by editing the function bodies is deliberate:
-- those bodies belong to 0015 and 0016, and a later change to either must not
-- have to remember to keep a ledger call in step. The trigger fires off the
-- data, so it stays correct whatever the function does.
-- ---------------------------------------------------------------------------

-- TRON deposits. `credited_at` is the flag: a row with it set is money that
-- moved, and a row without it was seen and refused (wrong contract,
-- unconfirmed, below a cent).
create or replace function public.tron_deposit_to_ledger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only when the deposit actually credited, and only on the transition into
  -- that state, so an UPDATE that touches the row again posts nothing.
  if new.credited_at is null or coalesce(new.credited_usd, 0) <= 0 then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.credited_at is not null then
    return new;
  end if;

  perform public.post_ledger_pair(
    'deposit:tron:' || new.tx_hash, new.tx_hash,
    'EXTERNAL', null,
    'PLAYER', new.user_id,
    new.credited_usd, 'DEPOSIT',
    jsonb_build_object('chain', 'TRON', 'currency', 'USDT',
                       'coin_amount', new.amount, 'address', new.address)
  );
  return new;
end $$;

revoke execute on function public.tron_deposit_to_ledger() from public, anon, authenticated;

drop trigger if exists tron_deposits_ledger on public.tron_deposits;
create trigger tron_deposits_ledger
  after insert or update of credited_at on public.tron_deposits
  for each row execute function public.tron_deposit_to_ledger();


-- CCPayment deposits. `credited_at` plays the same role here, but the USD
-- figure is `amount_usd` on this table and `credited_usd` on tron_deposits —
-- the two were written at different times. Named explicitly rather than
-- assumed: a trigger reading a column that does not exist fails at deposit
-- time, on the money path.
create or replace function public.ccp_deposit_to_ledger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.credited_at is null or coalesce(new.amount_usd, 0) <= 0 then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.credited_at is not null then
    return new;
  end if;

  perform public.post_ledger_pair(
    'deposit:ccp:' || new.record_id, new.record_id,
    'EXTERNAL', null,
    'PLAYER', new.user_id,
    new.amount_usd, 'DEPOSIT',
    jsonb_build_object('currency', new.coin, 'coin_amount', new.amount)
  );
  return new;
end $$;

revoke execute on function public.ccp_deposit_to_ledger() from public, anon, authenticated;

drop trigger if exists ccp_deposits_ledger on public.ccp_deposits;
create trigger ccp_deposits_ledger
  after insert or update of credited_at on public.ccp_deposits
  for each row execute function public.ccp_deposit_to_ledger();


-- A player deposit notification, for the TRON path. 0016 credits silently —
-- the money arrives and nothing says so.
create or replace function public.tron_deposit_notify()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.credited_at is null or coalesce(new.credited_usd, 0) <= 0 then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.credited_at is not null then
    return new;
  end if;

  perform public.notify_user(
    new.user_id, 'deposit',
    'Deposit received',
    format('$%s has been added to your balance.',
           trim(to_char(new.credited_usd, 'FM999999999990.00'))),
    jsonb_build_object('tx_hash', new.tx_hash, 'amount_usd', new.credited_usd,
                       'currency', 'USDT', 'chain', 'TRON')
  );
  return new;
end $$;

revoke execute on function public.tron_deposit_notify() from public, anon, authenticated;

drop trigger if exists tron_deposits_notify on public.tron_deposits;
create trigger tron_deposits_notify
  after insert or update of credited_at on public.tron_deposits
  for each row execute function public.tron_deposit_notify();


-- 8. ccp_settle_withdrawal is retired.
--
-- It debited at request time and refunded on failure — the model this migration
-- replaces. Leaving it in place would leave a second, service-role-reachable
-- path that moves withdrawal money without a hold, an approval or a ledger
-- entry, which is precisely the path we are closing.
-- ---------------------------------------------------------------------------
-- Dropped BY NAME, every overload, rather than by the one signature 0015
-- happens to declare.
--
-- A named signature only drops the argument list it names. The live project
-- turned out to carry `ccp_settle_withdrawal(text, text, jsonb)` — three
-- arguments, not 0015's four — so `drop function ... (text,text,text,jsonb)`
-- matched nothing and reported success. The old debit-at-request path stayed
-- callable next to the new state machine: two ways to settle a withdrawal,
-- one of which never takes a hold and never writes a ledger entry.
--
-- Schema drift like that is exactly what a targeted drop cannot see. Dropping
-- by name removes whatever is actually there.
do $$
declare r record;
begin
  for r in
    select p.oid::regprocedure as sig
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.proname = 'ccp_settle_withdrawal'
  loop
    execute format('drop function if exists %s', r.sig);
    raise notice 'dropped superseded %', r.sig;
  end loop;
end $$;


-- ---------------------------------------------------------------------------
-- 9. Reconciliation view — the question the old schema could not answer:
--    how much do we owe players, and how much of that came in through the door?
--
-- READ THE LAST COLUMN BEFORE USING THIS. The ledger currently records only
-- money crossing the platform boundary: deposits in, withdrawals out. Bets and
-- wins move `profiles.balance` through place_bet/settle_bet without posting
-- entries, so `player_total` and `net_deposited` are NOT expected to be equal
-- and a difference between them is not a discrepancy.
--
-- The difference IS the net gaming position — what players have won from, or
-- lost to, the house since launch. It is reported here as a derived figure
-- rather than left as an unexplained gap, so nobody reads this view as a
-- balance check that is permanently failing. Posting BET/WIN pairs to the
-- ledger would turn this into a true reconciliation; that is a larger change
-- than the deposit/withdrawal path and is deliberately not made here.
-- ---------------------------------------------------------------------------
create or replace view public.money_reconciliation as
  with player as (
    select coalesce(sum(balance), 0)          as available,
           coalesce(sum(clearing_balance), 0) as clearing
      from public.profiles
  ), external as (
    -- EXTERNAL runs negative in normal operation: every deposit debits it.
    -- Negated, it is what the boundary has handed to players, net of what has
    -- been paid back out.
    select -coalesce(balance, 0) as net_deposited
      from public.system_accounts where kind = 'EXTERNAL'
  )
  select
    player.available                                   as player_available,
    player.clearing                                    as player_clearing,
    player.available + player.clearing                 as player_total,
    external.net_deposited                             as net_deposited,
    (select coalesce(balance, 0) from public.system_accounts where kind = 'TREASURY')
                                                       as treasury,
    -- Positive: players are collectively up on the house. Negative: the house
    -- is ahead. Expected to be non-zero at all times.
    player.available + player.clearing - external.net_deposited
                                                       as net_gaming_position
  from player, external;

revoke all on public.money_reconciliation from anon, authenticated;
