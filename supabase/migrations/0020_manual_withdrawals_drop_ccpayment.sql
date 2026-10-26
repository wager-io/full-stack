-- =============================================================================
-- 0020_manual_withdrawals_drop_ccpayment.sql
--
-- CCPayment is gone, and withdrawals are sent by hand from the treasury wallet.
--
-- ── Why there is no sending code here ─────────────────────────────────────
--
-- TRON on this platform is DEPOSITS ONLY by design: addresses are derived from
-- a BIP-44 *public* xpub (0016), so the private key never touches the server.
-- That is the whole point of the arrangement, and it means nothing here can
-- move USDT out — there is no key to sign with.
--
-- Rather than put a key on the server to fix that, the send stays off it. An
-- administrator approves, sends from the treasury wallet, and records the
-- transaction hash. The state machine is unchanged and rail-agnostic; only the
-- middle step is a human instead of an API call.
--
-- What that costs: a withdrawal is as fast as somebody looking at the queue.
-- What it buys: the server cannot move player funds even if it is wholly
-- compromised, because it has nothing to move them with.
--
-- The hold is what makes this safe to do slowly. From APPROVED the amount sits
-- in the player's clearing balance — not spendable, not re-withdrawable — so
-- the gap between "approved" and "actually sent" cannot be used twice.
--
-- ── The flow ──────────────────────────────────────────────────────────────
--
--   REQUESTED      player asks
--   APPROVED       admin approves      -> available moves to clearing
--   BROADCASTING   admin sends USDT by hand, records the tx hash
--   CONFIRMED      admin confirms once it has confirmations on chain
--                                      -> clearing drained, ledger posted
--
-- The last two are the new RPCs below. broadcast_withdrawal and
-- confirm_withdrawal (0017) stay service-role-only; these are thin, is_admin()
-- gated wrappers so the admin panel can drive them with the operator's own
-- token, which is also what records WHO did it.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. Record the on-chain send.
--
-- The hash is validated as a shape, not merely as non-empty: a TRON txid is 64
-- hex characters. A typo pasted here is the only link between the platform's
-- record and the chain, and a wrong one is discovered much later, by someone
-- trying to prove a player was paid.
-- ---------------------------------------------------------------------------
create or replace function public.admin_mark_withdrawal_sent(
  p_order_id text,
  p_tx_hash  text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_hash text := lower(btrim(coalesce(p_tx_hash, '')));
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'not_authorised';
  end if;

  -- Tolerate a leading 0x: explorers show hashes both ways and an operator
  -- copying from one of them should not have to know which.
  if left(v_hash, 2) = '0x' then
    v_hash := substr(v_hash, 3);
  end if;

  if v_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid_tx_hash: expected 64 hex characters, got %', length(v_hash);
  end if;

  return public.broadcast_withdrawal(p_order_id, v_hash, null, null, null);
end $$;

revoke execute on function public.admin_mark_withdrawal_sent(text, text) from public, anon;
grant  execute on function public.admin_mark_withdrawal_sent(text, text) to authenticated;


-- ---------------------------------------------------------------------------
-- 2. Confirm it landed.
--
-- Separate from marking it sent, and deliberately so. This is the step that
-- drains the clearing balance and writes the ledger entry — the point at which
-- the platform's books say the money is gone. Collapsing it into the send
-- would record that before the chain had agreed.
-- ---------------------------------------------------------------------------
create or replace function public.admin_confirm_withdrawal(p_order_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'not_authorised';
  end if;

  return public.confirm_withdrawal(p_order_id, null, null);
end $$;

revoke execute on function public.admin_confirm_withdrawal(text) from public, anon;
grant  execute on function public.admin_confirm_withdrawal(text) to authenticated;


-- ---------------------------------------------------------------------------
-- 3. BROADCASTING joins the queue.
--
-- 0017 listed REQUESTED and APPROVED, on the reasoning that those were the two
-- states waiting on a person. With a gateway that was true — BROADCASTING
-- meant the API had it and a webhook would finish the job.
--
-- Sending by hand changes that. BROADCASTING now means an operator has sent
-- the USDT and recorded the hash, and somebody still has to confirm it landed.
-- Nothing else will: there is no webhook. Leaving it out would hide money that
-- is mid-flight from the only screen that watches it, which is the same
-- mistake dropping APPROVED would have been.
-- ---------------------------------------------------------------------------
-- Dropped first, not replaced: this adds `tx_hash` to the returned table, and
-- `create or replace` cannot change a function's return type — it fails with
-- "cannot change return type of existing function" rather than adapting.
drop function if exists public.withdrawal_queue(int);

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
  tx_hash     text,
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
         -- Carried so the panel can show, and link, the transaction an
         -- operator is being asked to confirm.
         w.tx_hash,
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
   where w.state in ('REQUESTED', 'APPROVED', 'BROADCASTING')
     and public.is_admin()          -- definer function: the gate is in the body
   order by w.created_at asc        -- oldest first. A queue, not a feed.
   limit least(greatest(coalesce(p_limit, 200), 1), 500);
$$;

revoke execute on function public.withdrawal_queue(int) from public, anon;
grant  execute on function public.withdrawal_queue(int) to authenticated;

-- The index 0017 created covered only the first two states.
drop index if exists public.withdrawals_open_state;
create index if not exists withdrawals_open_state
  on public.withdrawals (created_at)
  where state in ('REQUESTED', 'APPROVED', 'BROADCASTING');


-- ---------------------------------------------------------------------------
-- 4. A destination address has to look like one.
--
-- This matters more now than it did with a gateway. CCPayment would reject a
-- malformed address and the withdrawal would roll back automatically. With a
-- human sending from a wallet, the address is simply whatever the player
-- typed, and the first thing that validates it is the wallet — after an
-- operator has already spent the time, or worse, after a send to an address
-- that parses but is not theirs.
--
-- TRON base58: a leading 'T' then 33 more base58 characters (no 0, O, I or l).
-- Checked for SHAPE only — no checksum — because a shape check catches the
-- realistic failure, which is a truncated paste, not a forged address.
--
-- NOT VALID: applies to every future row without scanning the table behind a
-- lock. The table is empty anyway; the habit is what matters.
-- ---------------------------------------------------------------------------
alter table public.withdrawals drop constraint if exists withdrawals_tron_address_shape;
alter table public.withdrawals add  constraint withdrawals_tron_address_shape
  check (
    chain is null
    or upper(chain) not in ('TRON', 'TRC20', 'TRX')
    or address ~ '^T[1-9A-HJ-NP-Za-km-z]{33}$'
  ) not valid;


-- ---------------------------------------------------------------------------
-- 5. Remove CCPayment.
--
-- It never worked in this project: CCPayment answers only whitelisted IPs and
-- Edge Functions have no static egress address, so every call returned 224076
-- unless a paid proxy sat in front. Deposits are TRON now (0016); withdrawals
-- are manual. Nothing is left for it to do.
--
-- All of these tables are empty. Dropped rather than left dormant because a
-- dormant money path is one somebody can still call.
-- ---------------------------------------------------------------------------

-- The trigger 0017 hung on ccp_deposits goes with its table; the function
-- behind it has to be named explicitly.
drop trigger if exists ccp_deposits_ledger on public.ccp_deposits;
drop function if exists public.ccp_deposit_to_ledger();

-- FUNCTIONS BEFORE TABLES, and the order is not cosmetic.
--
-- ccp_bind_address is declared `returns public.ccp_deposit_addresses` — the
-- table IS its return type, so Postgres refuses to drop the table while the
-- function exists: "cannot drop table ccp_deposit_addresses because other
-- objects depend on it". Dropping the functions first removes the dependency
-- instead of forcing through it with CASCADE, which would also silently take
-- anything else that happened to depend on these tables.
--
-- By name across every overload, for the reason 0019 spells out: a
-- signature-targeted drop silently matched nothing once already, because the
-- live function's argument list was not the one the migration named.
do $$
declare
  r record;
  v_dropped int := 0;
begin
  for r in
    select p.oid::regprocedure as sig
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and p.proname like 'ccp\_%'
  loop
    execute format('drop function if exists %s', r.sig);
    raise notice 'dropped CCPayment function %', r.sig;
    v_dropped := v_dropped + 1;
  end loop;

  if v_dropped = 0 then
    raise notice 'no CCPayment functions remained';
  end if;
end $$;

drop table if exists public.ccp_deposits;
drop table if exists public.ccp_withdrawals;
drop table if exists public.ccp_deposit_addresses;
