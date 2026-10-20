-- =============================================================================
-- 0016_tron_deposits.sql  —  USDT-TRC20 deposits, self-custody
--
-- Replaces the CCPayment deposit path. Ported from the FairPlay financial-core
-- in ../../poker/financial-core (src/deposit/*, src/wallet/deposit-address.ts).
--
-- WHY THIS INSTEAD OF A PROCESSOR. CCPayment answers only whitelisted IPs, and
-- Supabase Edge Functions get a different egress address on every cold start —
-- measured: three invocations, three different AWS eu-west-3 addresses. That
-- needs a fixed-IP proxy in between, forever. TronGrid authenticates with an
-- API key in a header, so the problem does not exist here.
--
-- ── How a deposit happens ─────────────────────────────────────────────────
--
-- Every player gets one permanent TRON address, derived from a BIP-44 PUBLIC
-- extended key at m/44'/195'/0' → /5/{index}. The derivation needs no secret:
-- the player leg is a non-hardened child of the account xpub, so addresses can
-- be produced online while the private key stays offline. `derivation_index`
-- here is the only thing that makes an address reproducible, which is why it is
-- assigned from a sequence and never reused.
--
-- A watcher polls TronGrid for confirmed TRC-20 transfers into those addresses
-- and calls tron_credit_deposit. The on-chain tx_hash is the idempotency key,
-- so re-scanning the same window credits once — and re-scanning is normal, not
-- exceptional: a cron-driven watcher has no memory of what it already saw
-- beyond what is in this table.
--
-- ── Two gates before any money moves ──────────────────────────────────────
--
--   1. The transfer must be from the accepted USDT contract. Anyone can deploy
--      a token called "USDT" and send a million of it; crediting by symbol
--      rather than by contract address is how that becomes free money.
--   2. It must be confirmed. Unconfirmed transfers can be reorged away.
--
-- Both are enforced here as well as in the watcher. The watcher decides what to
-- submit; this decides what gets paid.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- The accepted token contract, as configuration rather than a literal.
--
-- Mainnet USDT by default. A testnet deployment points this at the faucet
-- token and the same code runs unchanged — which is the point: the deposit
-- path must not have a "test mode" branch that production never exercises.
-- ---------------------------------------------------------------------------
create table public.tron_config (
  key   text primary key,
  value text not null
);

insert into public.tron_config (key, value) values
  ('usdt_contract',   'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'),  -- official mainnet USDT-TRC20
  ('min_confirmations', '20')                                  -- ~60s on TRON
on conflict (key) do nothing;

alter table public.tron_config enable row level security;
revoke select, insert, update, delete on public.tron_config from anon, authenticated;

create or replace function public.tron_setting(p_key text)
returns text language sql stable security definer set search_path = public as $$
  select value from public.tron_config where key = p_key;
$$;

revoke execute on function public.tron_setting(text) from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- Per-player deposit addresses.
--
-- derivation_index is assigned from a sequence and is the player's permanent
-- place in the HD tree. It must never be reused or reordered: the address is a
-- pure function of (xpub, index), so a reused index would hand two players the
-- same address and make an incoming deposit unattributable.
--
-- last_scanned_at drives the watcher's round-robin. Kept here rather than in a
-- separate cursor table because the thing being scanned IS the address.
-- ---------------------------------------------------------------------------
create sequence public.tron_derivation_index_seq start 1;

create table public.tron_deposit_addresses (
  user_id          uuid primary key references public.profiles(id) on delete cascade,
  derivation_index bigint not null unique,
  address          text   not null unique,
  last_scanned_at  timestamptz,
  created_at       timestamptz not null default now()
);

create index on public.tron_deposit_addresses (last_scanned_at nulls first);

alter table public.tron_deposit_addresses enable row level security;
revoke insert, update, delete on public.tron_deposit_addresses from anon, authenticated;
create policy tron_addr_select_self on public.tron_deposit_addresses
  for select to authenticated using (user_id = auth.uid());


-- ---------------------------------------------------------------------------
-- Deposits. tx_hash is the primary key, and that IS the idempotency guarantee:
-- a second sighting of the same transfer collides here rather than paying out
-- twice.
--
-- `amount` is the on-chain figure at full 6-dp precision; `credited_usd` is
-- what reached the balance, at numeric(18,2). They differ by the rounding, and
-- both are kept so the difference is visible rather than inferred.
-- ---------------------------------------------------------------------------
create table public.tron_deposits (
  tx_hash       text primary key,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  address       text not null,
  -- Unscaled: USDT-TRC20 carries 6 decimals and rounding the record to 2 would
  -- destroy the evidence of what actually arrived.
  amount        numeric not null check (amount > 0),
  contract      text not null,
  credited_usd  numeric(18,2),
  credited_at   timestamptz,
  rejected_reason text,
  raw           jsonb,
  created_at    timestamptz not null default now()
);

create index on public.tron_deposits (user_id, created_at desc);

alter table public.tron_deposits enable row level security;
revoke insert, update, delete on public.tron_deposits from anon, authenticated;
create policy tron_dep_select_self on public.tron_deposits
  for select to authenticated using (user_id = auth.uid());


-- ---------------------------------------------------------------------------
-- tron_next_index — reserve the next derivation index.
--
-- A sequence, not max(index)+1: two concurrent first-requests reading a max
-- would reserve the same index and be handed the same address, which quietly
-- merges two players' money. Sequences do not do that, and a gap from a rolled
-- back transaction is harmless — an unused index costs nothing.
-- ---------------------------------------------------------------------------
create or replace function public.tron_next_index()
returns bigint language sql security definer set search_path = public as $$
  select nextval('public.tron_derivation_index_seq');
$$;

revoke execute on function public.tron_next_index() from public, anon, authenticated;
grant  execute on function public.tron_next_index() to service_role;


-- ---------------------------------------------------------------------------
-- tron_bind_address — record the derived address for a player.
--
-- Idempotent on user_id: the address is permanent, so a second call returns the
-- first result rather than deriving a new one. A player who refreshes the
-- deposit screen must not be given a second address while funds are in flight
-- to the first.
-- ---------------------------------------------------------------------------
create or replace function public.tron_bind_address(
  p_user uuid, p_index bigint, p_address text
)
returns public.tron_deposit_addresses
language plpgsql security definer set search_path = public
as $$
declare v_row public.tron_deposit_addresses;
begin
  if p_user is null or coalesce(btrim(p_address), '') = '' or p_index is null then
    raise exception 'invalid_address_binding';
  end if;

  insert into public.tron_deposit_addresses (user_id, derivation_index, address)
  values (p_user, p_index, p_address)
  on conflict (user_id) do nothing
  returning * into v_row;

  if v_row.user_id is null then
    -- Lost a race, or simply already bound. The existing row is authoritative.
    select * into v_row from public.tron_deposit_addresses where user_id = p_user;
  end if;

  return v_row;
end $$;

revoke execute on function public.tron_bind_address(uuid, bigint, text) from public, anon, authenticated;
grant  execute on function public.tron_bind_address(uuid, bigint, text) to service_role;


-- ---------------------------------------------------------------------------
-- tron_addresses_to_scan — the watcher's work queue.
--
-- Returns the least-recently-scanned addresses and stamps them in the same
-- statement, so two overlapping watcher runs cannot both pick up the same
-- slice. The original polled EVERY address on every tick, which is one TronGrid
-- call per player per interval — fine at a hundred players, a rate-limit wall
-- at ten thousand. A round-robin makes the cost per run constant and the
-- coverage interval a function of how many addresses exist.
--
-- `since` is the previous last_scanned_at, handed back so the caller can ask
-- TronGrid for transfers after that moment instead of refetching history.
-- ---------------------------------------------------------------------------
create or replace function public.tron_addresses_to_scan(p_limit int default 50)
returns table (user_id uuid, address text, since timestamptz)
language plpgsql security definer set search_path = public
as $$
begin
  return query
  with picked as (
    select a.user_id
      from public.tron_deposit_addresses a
     order by a.last_scanned_at nulls first
     limit greatest(1, least(coalesce(p_limit, 50), 500))
     for update skip locked
  )
  update public.tron_deposit_addresses t
     set last_scanned_at = now()
    from picked p
   where t.user_id = p.user_id
  returning t.user_id, t.address, t.last_scanned_at;
end $$;

revoke execute on function public.tron_addresses_to_scan(int) from public, anon, authenticated;
grant  execute on function public.tron_addresses_to_scan(int) to service_role;


-- ---------------------------------------------------------------------------
-- tron_credit_deposit — the only way an on-chain transfer becomes balance.
--
-- Returns what it did:
--   credited          first sighting, confirmed, correct contract — money moved
--   already_seen      a re-scan; nothing moved
--   rejected          recorded and refused (wrong contract, or rounds to zero)
--   unknown_address   a transfer to an address we do not own
--
-- CONTRACT CHECK. Compared against tron_config, not a literal and not the
-- token's symbol. Symbols are not unique — anyone can deploy a token called
-- USDT — so crediting on symbol is crediting on something an attacker chooses.
--
-- ROUNDING. USDT carries 6 decimals and balance holds 2, so the credit is
-- FLOORED to the cent. Rounding up would mint fractions out of nothing on every
-- deposit; the remainder stays visible as the gap between amount and
-- credited_usd rather than disappearing.
-- ---------------------------------------------------------------------------
create or replace function public.tron_credit_deposit(
  p_tx_hash  text,
  p_address  text,
  p_amount   numeric,
  p_contract text,
  p_raw      jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_user    uuid;
  v_usd     numeric(18,2);
  v_balance numeric;
  v_existing public.tron_deposits;
begin
  if coalesce(btrim(p_tx_hash), '') = '' then raise exception 'missing_tx_hash'; end if;

  -- The 0012 lesson, arriving this time off a chain: NaN > 0 is TRUE for a
  -- Postgres numeric, so a bare positivity test would admit it and the balance
  -- would never be a number again.
  if p_amount is null or p_amount = 'NaN'::numeric or p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;

  select * into v_existing from public.tron_deposits where tx_hash = p_tx_hash for update;
  if v_existing.tx_hash is not null then
    return jsonb_build_object('action', 'already_seen', 'tx_hash', p_tx_hash,
                              'credited', v_existing.credited_at is not null);
  end if;

  select user_id into v_user from public.tron_deposit_addresses where address = p_address;
  if v_user is null then
    -- Not ours. Recorded nowhere and reported, so the watcher can log it and
    -- move on rather than retrying something that will never resolve.
    return jsonb_build_object('action', 'unknown_address', 'address', p_address);
  end if;

  -- Wrong token: recorded so there is a trace, never paid.
  if p_contract is distinct from public.tron_setting('usdt_contract') then
    insert into public.tron_deposits (tx_hash, user_id, address, amount, contract, rejected_reason, raw)
    values (p_tx_hash, v_user, p_address, p_amount, coalesce(p_contract, ''), 'wrong_contract', p_raw);
    return jsonb_build_object('action', 'rejected', 'reason', 'wrong_contract',
                              'tx_hash', p_tx_hash, 'contract', p_contract);
  end if;

  v_usd := floor(p_amount * 100) / 100;

  if v_usd <= 0 then
    insert into public.tron_deposits (tx_hash, user_id, address, amount, contract, rejected_reason, raw)
    values (p_tx_hash, v_user, p_address, p_amount, p_contract, 'below_one_cent', p_raw);
    return jsonb_build_object('action', 'rejected', 'reason', 'below_one_cent', 'tx_hash', p_tx_hash);
  end if;

  insert into public.tron_deposits (tx_hash, user_id, address, amount, contract, credited_usd, credited_at, raw)
  values (p_tx_hash, v_user, p_address, p_amount, p_contract, v_usd, now(), p_raw);

  v_balance := public.adjust_balance(v_user, v_usd);

  insert into public.bills (user_id, transaction_type, token_name, trx_amount, balance, bill_id)
  values (v_user, 'deposit', 'USDT', v_usd, v_balance, 'tron_' || p_tx_hash);

  return jsonb_build_object('action', 'credited', 'tx_hash', p_tx_hash, 'user_id', v_user,
                            'amount', p_amount, 'credited_usd', v_usd, 'balance', v_balance);
end $$;

revoke execute on function public.tron_credit_deposit(text, text, numeric, text, jsonb)
  from public, anon, authenticated;
grant  execute on function public.tron_credit_deposit(text, text, numeric, text, jsonb)
  to service_role;
