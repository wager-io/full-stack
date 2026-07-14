-- =============================================================================
-- 0006_plinko.sql  —  Phase 2: Plinko
--
-- Ported from the old Node backend:
--   controllers/games/plinko/plinkoGameUtils.js  (generatePlinkoBallPath)
--   controllers/games/plinko/plinkoLogic.js      (PAYOUTS)
--   controllers/games/plinko/plinkoGameHandlers.js (getPayout)
--
-- Path: hash = HMAC_SHA512(server_seed, client_seed:nonce), read in groups of 4
-- bytes; each group -> num = b0/256 + b1/256^2 + b2/256^3 + b3/256^4, rounded
-- to 0/1. `rows` groups give the path; bucket = sum of rounds; multiplier =
-- PAYOUTS[risk][rows][bucket]. (64-byte HMAC = exactly 16 groups = max rows.)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Payout tables, generated verbatim from plinkoLogic.js PAYOUTS.
-- risk 1=low, 2=medium, 3=high. rows 8..16. Array length is rows+1 (buckets).
-- ---------------------------------------------------------------------------
create table public.plinko_payouts (
  risk     int not null,
  rows     int not null,
  payouts  numeric[] not null,
  primary key (risk, rows)
);

insert into public.plinko_payouts (risk, rows, payouts) values
  (1, 8, array[5.6,2.1,1.1,1,0.5,1,1.1,2.1,5.6]::numeric[]),
  (1, 9, array[5.6,2,1.6,1,0.7,0.7,1,1.6,2,5.6]::numeric[]),
  (1, 10, array[8.9,3,1.4,1.1,1,0.5,1,1.1,1.4,3,8.9]::numeric[]),
  (1, 11, array[8.4,3,1.9,1.3,1,0.7,0.7,1,1.3,1.9,3,8.4]::numeric[]),
  (1, 12, array[10,3,1.6,1.4,1.1,1,0.5,1,1.1,1.4,1.6,3,10]::numeric[]),
  (1, 13, array[8.1,4,3,1.9,1.2,0.9,0.7,0.7,0.9,1.2,1.9,3,4,8.1]::numeric[]),
  (1, 14, array[7.1,4,1.9,1.4,1.3,1.1,1,0.5,1,1.1,1.3,1.4,1.9,4,7.1]::numeric[]),
  (1, 15, array[15,8,3,2,1.5,1.1,1,0.7,0.7,1,1.1,1.5,2,3,8,15]::numeric[]),
  (1, 16, array[16,9,2,1.4,1.4,1.2,1.1,1,0.5,1,1.1,1.2,1.4,1.4,2,9,16]::numeric[]),
  (2, 8, array[13,3,1.3,0.7,0.4,0.7,1.3,3,13]::numeric[]),
  (2, 9, array[18,4,1.7,0.9,0.5,0.5,0.9,1.7,4,18]::numeric[]),
  (2, 10, array[22,5,2,1.4,0.6,0.4,0.6,1.4,2,5,22]::numeric[]),
  (2, 11, array[24,6,3,1.8,0.7,0.5,0.5,0.7,1.8,3,6,24]::numeric[]),
  (2, 12, array[33,11,4,2,1.1,0.6,0.3,0.6,1.1,2,4,11,33]::numeric[]),
  (2, 13, array[43,13,6,3,1.3,0.7,0.4,0.4,0.7,1.3,3,6,13,43]::numeric[]),
  (2, 14, array[58,15,7,4,1.9,1,0.5,0.2,0.5,1,1.9,4,7,15,58]::numeric[]),
  (2, 15, array[88,18,11,5,3,1.3,0.5,0.3,0.3,0.5,1.3,3,5,11,18,88]::numeric[]),
  (2, 16, array[110,41,10,5,3,1.5,1,0.5,0.3,0.5,1,1.5,3,5,10,41,110]::numeric[]),
  (3, 8, array[29,4,1.5,0.3,0.2,0.3,1.5,4,29]::numeric[]),
  (3, 9, array[43,7,2,0.6,0.2,0.2,0.6,2,7,43]::numeric[]),
  (3, 10, array[76,10,3,0.9,0.3,0.2,0.3,0.9,3,10,76]::numeric[]),
  (3, 11, array[120,14,5.2,1.4,0.4,0.2,0.2,0.4,1.4,5.2,14,120]::numeric[]),
  (3, 12, array[170,24,8.1,2,0.7,0.2,0.2,0.2,0.7,2,8.1,24,170]::numeric[]),
  (3, 13, array[260,37,11,4,1,0.2,0.2,0.2,0.2,1,4,11,37,260]::numeric[]),
  (3, 14, array[420,56,18,5,1.9,0.3,0.2,0.2,0.2,0.3,1.9,5,18,56,420]::numeric[]),
  (3, 15, array[620,83,27,8,3,0.5,0.2,0.2,0.2,0.2,0.5,3,8,27,83,620]::numeric[]),
  (3, 16, array[1000,130,26,9,4,2,0.2,0.2,0.2,0.2,0.2,2,4,9,26,130,1000]::numeric[]);

alter table public.plinko_payouts enable row level security;
-- World-readable reference data (the UI draws the bucket labels from it).
create policy plinko_payouts_select_all on public.plinko_payouts for select using (true);
grant select on public.plinko_payouts to anon, authenticated;


-- ---------------------------------------------------------------------------
-- pf_plinko_path — the rounded 0/1 path for `rows` pegs. Isolated so the
-- parity test has one target and plinko_drop stays readable.
--
-- get_byte on the raw HMAC bytea mirrors the old code's per-byte parsing.
-- num is computed in float8 to match JS double arithmetic exactly.
-- ---------------------------------------------------------------------------
create or replace function public.pf_plinko_path(p_server_seed text, p_client_seed text, p_nonce bigint, p_rows int)
returns int[]
language plpgsql immutable
set search_path = public, extensions
as $$
declare
  v_h   bytea := hmac(p_client_seed || ':' || p_nonce::text, p_server_seed, 'sha512');
  v_path int[] := '{}';
  v_num float8;
  i int;
begin
  for i in 0 .. p_rows - 1 loop
    v_num := get_byte(v_h, i*4)     / 256.0
           + get_byte(v_h, i*4 + 1) / 65536.0
           + get_byte(v_h, i*4 + 2) / 16777216.0
           + get_byte(v_h, i*4 + 3) / 4294967296.0;
    v_path := v_path || round(v_num)::int;   -- 0 = left, 1 = right
  end loop;
  return v_path;
end $$;

revoke execute on function public.pf_plinko_path(text, text, bigint, int) from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- plinko_drop — play one ball. risk 1..3, rows 8..16.
-- ---------------------------------------------------------------------------
create or replace function public.plinko_drop(
  p_amount numeric,
  p_risk   int,
  p_rows   int,
  p_currency text default 'USDT'
)
returns table (bet_id text, bucket int, path int[], multiplier numeric, payout numeric, nonce bigint, server_seed_hash text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user  uuid := auth.uid();
  v_seed  public.game_seeds;
  v_nonce bigint;
  v_path  int[];
  v_bucket int;
  v_payouts numeric[];
  v_mult  numeric;
  v_bet   public.bets;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if p_risk not in (1,2,3) then raise exception 'invalid_risk'; end if;
  if p_rows < 8 or p_rows > 16 then raise exception 'invalid_rows'; end if;

  select pp.payouts into v_payouts from public.plinko_payouts pp where pp.risk = p_risk and pp.rows = p_rows;
  if v_payouts is null then raise exception 'no_payout_table'; end if;

  insert into public.game_seeds (user_id, game, server_seed_hash)
  values (v_user, 'plinko', '') on conflict (user_id, game) do nothing;
  update public.game_seeds set nonce = game_seeds.nonce + 1
   where user_id = v_user and game = 'plinko'
  returning * into v_seed;
  v_nonce := v_seed.nonce;

  v_path   := public.pf_plinko_path(v_seed.server_seed, v_seed.client_seed, v_nonce, p_rows);
  v_bucket := (select coalesce(sum(x), 0) from unnest(v_path) x);
  v_mult   := v_payouts[v_bucket + 1];   -- Postgres arrays are 1-based

  v_bet := public.place_bet('plinko', p_amount, p_currency);
  perform public.settle_bet(
    v_bet.bet_id, v_mult,
    jsonb_build_object('bucket', v_bucket, 'path', v_path, 'risk', p_risk, 'rows', p_rows, 'nonce', v_nonce)
  );

  return query select v_bet.bet_id, v_bucket, v_path, v_mult,
                      round(p_amount * v_mult, 2), v_nonce, v_seed.server_seed_hash;
end $$;

revoke execute on function public.plinko_drop(numeric, int, int, text) from public, anon;
grant  execute on function public.plinko_drop(numeric, int, int, text) to  authenticated;
