-- =============================================================================
-- 0014_hilo_cap_and_duplicate_rpc.sql
--
-- Two follow-ups from the review of PR #1. Neither moves money that was wrong;
-- one stops the screen quoting a number the cashout will not honour, the other
-- removes a second door onto a column that already had one.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. The 5000 cap applied to the profit but not to the multiplier beside it.
--
-- hilo_choice banked the capped figure and then derived `payout` from the
-- UNCAPPED one:
--
--     v_profit := least(5000.0, v_game.profit + v_gain);
--     v_payout := 1 + (v_game.profit + v_gain) / v_game.bet_amount;   -- uncapped
--
-- Past the cap the two disagree, and they disagree in the direction that
-- matters: the player is shown a multiplier larger than the one they will be
-- paid. The money itself was never wrong -- hilo_cashout recomputes the
-- multiplier from the stored (capped) profit and settles on that, and
-- potential_payout is likewise built from the capped figure -- so this is a
-- quote the game could not honour rather than a payout it got wrong. On a
-- gambling screen that distinction is not much comfort: the number IS the
-- offer.
--
-- `payout` is now derived from the same figure that will be paid, which also
-- means the column and potential_payout can no longer drift apart.
--
-- Reproduced verbatim from 0008 with that one line changed, because Postgres
-- has no "replace a line in a function".
-- ---------------------------------------------------------------------------
create or replace function public.hilo_choice(p_game_id text, p_choice text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_game public.hilo_games;
  v_prev jsonb;
  v_next jsonb;
  v_prev_rv int;
  v_next_rv int;
  v_won  boolean;
  v_ch   jsonb;
  v_pf   jsonb;
  v_gain numeric;
  v_profit numeric;
  v_payout numeric;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if p_choice not in ('hi', 'lo', 'skip') then raise exception 'invalid_choice'; end if;

  select * into v_game from public.hilo_games
   where game_id = p_game_id and user_id = v_user for update;
  if v_game.id is null then raise exception 'game_not_found'; end if;
  if v_game.state <> 'active' then raise exception 'game_not_active'; end if;
  if p_choice = 'skip' and v_game.round >= 52 then raise exception 'skip_limit_reached'; end if;

  v_prev    := v_game.rounds -> -1;
  v_prev_rv := (v_prev->>'rank_value')::int;
  v_next    := public.pf_hilo_card(v_game.server_seed, v_game.client_seed, v_game.nonce, v_game.round + 1);
  v_next_rv := (v_next->>'rank_value')::int;

  -- Ties go to both sides, except off an Ace (hi is strict) or a King (lo is
  -- strict). Skip always survives.
  v_won := case p_choice
    when 'skip' then true
    when 'hi'   then case when v_prev_rv = 1  then v_next_rv >  v_prev_rv else v_next_rv >= v_prev_rv end
    when 'lo'   then case when v_prev_rv = 13 then v_next_rv <  v_prev_rv else v_next_rv <= v_prev_rv end
  end;

  if not v_won then
    update public.hilo_games
       set state = 'lost', ended_at = now(), profit = 0, payout = 0,
           round = round + 1,
           rounds = rounds || jsonb_build_array(
             v_next || jsonb_build_object('guess', p_choice, 'won', false,
                                          'hi_chance', v_game.hi_chance, 'lo_chance', v_game.lo_chance))
     where id = v_game.id returning * into v_game;

    perform public.settle_bet(v_game.bet_id, 0,
      jsonb_build_object('rounds', v_game.rounds, 'nonce', v_game.nonce, 'lost_on', p_choice));

    return public.hilo_client_state(v_game) || jsonb_build_object('won', false, 'card', v_next);
  end if;

  -- Survived. Skip banks nothing and moves the card on; hi/lo compound.
  if p_choice = 'skip' then
    v_profit := v_game.profit;
    v_payout := v_game.payout;
  else
    v_pf   := public.hilo_profit(v_game.bet_amount + v_game.profit, v_game.hi_chance, v_game.lo_chance);
    v_gain := (v_pf ->> (case when p_choice = 'hi' then 'hi_profit' else 'lo_profit' end))::numeric;
    v_profit := least(5000.0, v_game.profit + v_gain);
    -- THE FIX: from v_profit, the figure that will actually be paid, not from
    -- the uncapped sum above it.
    v_payout := 1 + v_profit / v_game.bet_amount;
  end if;

  v_ch := public.hilo_chances(v_next_rv);

  update public.hilo_games
     set round = round + 1,
         rounds = rounds || jsonb_build_array(
           v_next || jsonb_build_object('guess', p_choice, 'won', true,
                                        'hi_chance', v_game.hi_chance, 'lo_chance', v_game.lo_chance,
                                        'payout', v_payout)),
         hi_chance = (v_ch->>'hi_chance')::float8,
         lo_chance = (v_ch->>'lo_chance')::float8,
         profit = v_profit,
         payout = v_payout
   where id = v_game.id returning * into v_game;

  return public.hilo_client_state(v_game) || jsonb_build_object('won', true, 'card', v_next);
end $$;

revoke execute on function public.hilo_choice(text, text) from public, anon;
grant  execute on function public.hilo_choice(text, text) to  authenticated;


-- ---------------------------------------------------------------------------
-- 2. Two functions setting hidden_from_public.
--
-- 0010 shipped profile_set_privacy; 0013 added profile_set_visibility, which
-- writes the same column. Both are granted to `authenticated`, so the site has
-- two supported ways to do one thing and they do not behave alike: given null,
-- one refuses and the other treats it as false. Nothing in the client calls
-- either (`grep -rn profile_set_privacy\|profile_set_visibility src/` is
-- empty), so dropping one costs nothing today and costs a bug later if left.
--
-- profile_set_privacy stays: it is the older name, it returns jsonb like the
-- rest of the profile RPCs rather than a bare boolean, and it carries the note
-- about why a rename does not rewrite bets already in the public feed.
--
-- It also does NOT open an app.allow_balance_change window, and does not need
-- one -- hidden_from_public is not among the columns 0003's trigger locks
-- (is_admin, admin_role, permissions, commission_rate, withdrawal_disabled,
-- status, is_verified, referred_by, current_level, referral_count). The window
-- profile_set_visibility opened suspended that trigger for its whole update
-- without needing anything from it, which is the kind of unnecessary reach a
-- reader has to stop and rule out.
-- ---------------------------------------------------------------------------
drop function if exists public.profile_set_visibility(boolean);
