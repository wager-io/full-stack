-- =============================================================================
-- 0025_keno_guards.sql — price the three unpriced Keno risks, and close the
-- holes in keno_play that let a bet take the stake and pay nothing.
--
-- 0021 let keno_play accept 'low', 'medium' and 'high' although keno_paytable
-- had no rows for them: keno_multiplier coalesces a missing row to 0, so every
-- such bet debited the stake and lost. This fills the paytable in and makes the
-- function refuse any (risk, picks) that is not priced.
--
-- The multipliers are fixed values, RTP-verified at 98.65-99.07%. Every hit
-- count is listed, zeros included, so a missing row means "not priced" and
-- never "pays nothing".
--
-- Guards added to keno_play, all of which fire before the seed update, so a
-- refused call moves neither money nor nonce:
--   * invalid_risk        - a NULL risk slipped past `not in (...)`, because
--                           NULL is not true, and became an always-lose bet.
--   * invalid_pick_count  - a NULL or multi-dimensional array is refused
--                           outright rather than caught by accident later.
--   * pick_out_of_range   - a NULL element slipped past `x < 1`, and was paid
--                           as an n-pick bet with n-1 real numbers. Checked
--                           before the duplicate check, which would otherwise
--                           see one NULL kept by DISTINCT and misreport it.
--   * risk_not_priced     - the (risk, picks) has no paytable rows, so the bet
--                           could only ever lose.
-- =============================================================================

insert into public.keno_paytable (risk, picks, hits, multiplier) values
  ('low',  1,  0, 0.7),
  ('low',  1,  1, 1.85),
  ('low',  2,  0, 0),
  ('low',  2,  1, 2),
  ('low',  2,  2, 3.8),
  ('low',  3,  0, 0),
  ('low',  3,  1, 1.1),
  ('low',  3,  2, 1.38),
  ('low',  3,  3, 26),
  ('low',  4,  0, 0),
  ('low',  4,  1, 0),
  ('low',  4,  2, 2.2),
  ('low',  4,  3, 7.9),
  ('low',  4,  4, 90),
  ('low',  5,  0, 0),
  ('low',  5,  1, 0),
  ('low',  5,  2, 1.5),
  ('low',  5,  3, 4.2),
  ('low',  5,  4, 13),
  ('low',  5,  5, 300),
  ('low',  6,  0, 0),
  ('low',  6,  1, 0),
  ('low',  6,  2, 1.1),
  ('low',  6,  3, 2),
  ('low',  6,  4, 6.2),
  ('low',  6,  5, 100),
  ('low',  6,  6, 700),
  ('low',  7,  0, 0),
  ('low',  7,  1, 0),
  ('low',  7,  2, 1.1),
  ('low',  7,  3, 1.6),
  ('low',  7,  4, 3.5),
  ('low',  7,  5, 15),
  ('low',  7,  6, 225),
  ('low',  7,  7, 700),
  ('low',  8,  0, 0),
  ('low',  8,  1, 0),
  ('low',  8,  2, 1.1),
  ('low',  8,  3, 1.5),
  ('low',  8,  4, 2),
  ('low',  8,  5, 5.5),
  ('low',  8,  6, 39),
  ('low',  8,  7, 100),
  ('low',  8,  8, 800),
  ('low',  9,  0, 0),
  ('low',  9,  1, 0),
  ('low',  9,  2, 1.1),
  ('low',  9,  3, 1.3),
  ('low',  9,  4, 1.7),
  ('low',  9,  5, 2.5),
  ('low',  9,  6, 7.5),
  ('low',  9,  7, 50),
  ('low',  9,  8, 250),
  ('low',  9,  9, 1000),
  ('low', 10,  0, 0),
  ('low', 10,  1, 0),
  ('low', 10,  2, 1.1),
  ('low', 10,  3, 1.2),
  ('low', 10,  4, 1.3),
  ('low', 10,  5, 1.8),
  ('low', 10,  6, 3.5),
  ('low', 10,  7, 13),
  ('low', 10,  8, 50),
  ('low', 10,  9, 250),
  ('low', 10, 10, 1000),
  ('medium',  1,  0, 0.4),
  ('medium',  1,  1, 2.75),
  ('medium',  2,  0, 0),
  ('medium',  2,  1, 1.8),
  ('medium',  2,  2, 5.1),
  ('medium',  3,  0, 0),
  ('medium',  3,  1, 0),
  ('medium',  3,  2, 2.8),
  ('medium',  3,  3, 50),
  ('medium',  4,  0, 0),
  ('medium',  4,  1, 0),
  ('medium',  4,  2, 1.7),
  ('medium',  4,  3, 10),
  ('medium',  4,  4, 100),
  ('medium',  5,  0, 0),
  ('medium',  5,  1, 0),
  ('medium',  5,  2, 1.4),
  ('medium',  5,  3, 4),
  ('medium',  5,  4, 14),
  ('medium',  5,  5, 390),
  ('medium',  6,  0, 0),
  ('medium',  6,  1, 0),
  ('medium',  6,  2, 0),
  ('medium',  6,  3, 3),
  ('medium',  6,  4, 9),
  ('medium',  6,  5, 180),
  ('medium',  6,  6, 710),
  ('medium',  7,  0, 0),
  ('medium',  7,  1, 0),
  ('medium',  7,  2, 0),
  ('medium',  7,  3, 2),
  ('medium',  7,  4, 7),
  ('medium',  7,  5, 30),
  ('medium',  7,  6, 400),
  ('medium',  7,  7, 800),
  ('medium',  8,  0, 0),
  ('medium',  8,  1, 0),
  ('medium',  8,  2, 0),
  ('medium',  8,  3, 2),
  ('medium',  8,  4, 4),
  ('medium',  8,  5, 11),
  ('medium',  8,  6, 67),
  ('medium',  8,  7, 400),
  ('medium',  8,  8, 900),
  ('medium',  9,  0, 0),
  ('medium',  9,  1, 0),
  ('medium',  9,  2, 0),
  ('medium',  9,  3, 2),
  ('medium',  9,  4, 2.5),
  ('medium',  9,  5, 5),
  ('medium',  9,  6, 15),
  ('medium',  9,  7, 100),
  ('medium',  9,  8, 500),
  ('medium',  9,  9, 1000),
  ('medium', 10,  0, 0),
  ('medium', 10,  1, 0),
  ('medium', 10,  2, 0),
  ('medium', 10,  3, 1.6),
  ('medium', 10,  4, 2),
  ('medium', 10,  5, 4),
  ('medium', 10,  6, 7),
  ('medium', 10,  7, 26),
  ('medium', 10,  8, 100),
  ('medium', 10,  9, 500),
  ('medium', 10, 10, 1000),
  ('high',  1,  0, 0),
  ('high',  1,  1, 3.96),
  ('high',  2,  0, 0),
  ('high',  2,  1, 0),
  ('high',  2,  2, 17.1),
  ('high',  3,  0, 0),
  ('high',  3,  1, 0),
  ('high',  3,  2, 0),
  ('high',  3,  3, 81.5),
  ('high',  4,  0, 0),
  ('high',  4,  1, 0),
  ('high',  4,  2, 0),
  ('high',  4,  3, 10),
  ('high',  4,  4, 259),
  ('high',  5,  0, 0),
  ('high',  5,  1, 0),
  ('high',  5,  2, 0),
  ('high',  5,  3, 4.5),
  ('high',  5,  4, 48),
  ('high',  5,  5, 450),
  ('high',  6,  0, 0),
  ('high',  6,  1, 0),
  ('high',  6,  2, 0),
  ('high',  6,  3, 0),
  ('high',  6,  4, 11),
  ('high',  6,  5, 350),
  ('high',  6,  6, 710),
  ('high',  7,  0, 0),
  ('high',  7,  1, 0),
  ('high',  7,  2, 0),
  ('high',  7,  3, 0),
  ('high',  7,  4, 7),
  ('high',  7,  5, 90),
  ('high',  7,  6, 400),
  ('high',  7,  7, 800),
  ('high',  8,  0, 0),
  ('high',  8,  1, 0),
  ('high',  8,  2, 0),
  ('high',  8,  3, 0),
  ('high',  8,  4, 5),
  ('high',  8,  5, 20),
  ('high',  8,  6, 270),
  ('high',  8,  7, 600),
  ('high',  8,  8, 900),
  ('high',  9,  0, 0),
  ('high',  9,  1, 0),
  ('high',  9,  2, 0),
  ('high',  9,  3, 0),
  ('high',  9,  4, 4),
  ('high',  9,  5, 11),
  ('high',  9,  6, 56),
  ('high',  9,  7, 500),
  ('high',  9,  8, 800),
  ('high',  9,  9, 1000),
  ('high', 10,  0, 0),
  ('high', 10,  1, 0),
  ('high', 10,  2, 0),
  ('high', 10,  3, 0),
  ('high', 10,  4, 3.5),
  ('high', 10,  5, 8),
  ('high', 10,  6, 13),
  ('high', 10,  7, 63),
  ('high', 10,  8, 500),
  ('high', 10,  9, 800),
  ('high', 10, 10, 1000)
on conflict (risk, picks, hits) do nothing;


create or replace function public.keno_play(
  p_amount   numeric,
  p_picks    int[],
  p_risk     text default 'classic',
  p_currency text default 'USDT'
)
returns table (
  bet_id text, drawn int[], picks int[], hits int[], hit_count int,
  multiplier numeric, payout numeric, nonce bigint, server_seed_hash text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user  uuid := auth.uid();
  v_seed  public.game_seeds;
  v_nonce bigint;
  v_drawn int[];
  v_hits  int[];
  v_n     int;
  v_mult  numeric;
  v_bet   public.bets;
  v_picks int[];
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if p_risk is null or p_risk not in ('classic','low','medium','high') then raise exception 'invalid_risk'; end if;

  if p_picks is null or array_ndims(p_picks) <> 1 then raise exception 'invalid_pick_count'; end if;
  v_n := coalesce(array_length(p_picks, 1), 0);
  if v_n < 1 or v_n > 10 then raise exception 'invalid_pick_count'; end if;

  -- A NULL element is rejected first: DISTINCT would keep one NULL and the
  -- range test below would never see it (NULL < 1 is NULL, not true).
  if exists (select 1 from unnest(p_picks) x where x is null or x < 1 or x > 40) then
    raise exception 'pick_out_of_range';
  end if;

  -- Sorted and de-duplicated in one step; the count is re-checked against the
  -- original so a duplicate is an ERROR rather than being quietly collapsed
  -- into a smaller bet the player did not place.
  v_picks := (select array(select distinct unnest(p_picks) order by 1));
  if coalesce(array_length(v_picks, 1), 0) <> v_n then raise exception 'duplicate_picks'; end if;

  -- Refuse a bet the paytable cannot pay; absent rows would mean a certain loss.
  if not exists (select 1 from public.keno_paytable t where t.risk = p_risk and t.picks = v_n) then
    raise exception 'risk_not_priced';
  end if;

  -- Advance the nonce and read the active seed under one lock, as the other
  -- games do â€” the nonce is what makes two identical bets different rounds.
  insert into public.game_seeds (user_id, game, server_seed_hash)
  values (v_user, 'keno', '') on conflict (user_id, game) do nothing;
  update public.game_seeds set nonce = game_seeds.nonce + 1
   where user_id = v_user and game = 'keno'
  returning * into v_seed;
  v_nonce := v_seed.nonce;

  v_drawn := public.pf_keno_draw(v_seed.server_seed, v_seed.client_seed, v_nonce);
  v_hits  := (select array(select unnest(v_picks) intersect select unnest(v_drawn) order by 1));
  v_mult  := public.keno_multiplier(p_risk, v_n, coalesce(array_length(v_hits, 1), 0));

  -- Debit and settle through the shared wallet primitives. place_bet raises
  -- insufficient_balance and aborts the whole call, so a round is never
  -- recorded for a bet that could not be paid for.
  v_bet := public.place_bet('keno', p_amount, p_currency);
  perform public.settle_bet(
    v_bet.bet_id, v_mult,
    jsonb_build_object(
      'drawn', v_drawn, 'picks', v_picks, 'hits', v_hits,
      'hit_count', coalesce(array_length(v_hits, 1), 0),
      'risk', p_risk, 'nonce', v_nonce
    )
  );

  return query select v_bet.bet_id, v_drawn, v_picks, v_hits,
                      coalesce(array_length(v_hits, 1), 0), v_mult,
                      round(p_amount * v_mult, 2), v_nonce, v_seed.server_seed_hash;
end $$;

revoke execute on function public.keno_play(numeric, int[], text, text) from public, anon;
grant  execute on function public.keno_play(numeric, int[], text, text) to authenticated;
