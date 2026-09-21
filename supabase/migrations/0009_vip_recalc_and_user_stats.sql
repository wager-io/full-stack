-- =============================================================================
-- 0009_vip_recalc_and_user_stats.sql
--
-- Two gaps found by following what the client actually calls, rather than by
-- counting endpoints in the old backend.
--
-- 1. THE VIP TIER COLUMNS WERE NEVER WRITTEN. `place_bet` adds every stake to
--    vip_progress.current_wager (0004), and 0002 makes sure a row exists for
--    every player — so the wager total is right. But current_tier, next_tier
--    and wager_to_next_tier keep the defaults they were created with, forever:
--    'None', 'Bronze', 10000. Nothing in any migration writes them.
--
--    The VIP screen hides this, because src/services/vipService.js recomputes
--    the tier in the browser from current_wager + vip_tiers and never reads
--    those three columns. Anything else that trusts them — the admin panel in
--    Phase 5, a level-up notification, a rakeback rule — reads a stored value
--    that says every player is unranked. Now they are recomputed wherever the
--    wager moves.
--
-- 2. THE STATISTICS MODAL IS DEAD. It calls GET /api/user/stats/:username
--    through src/utils/api.js, which points at the removed Express server, so
--    the screen can only ever show its error state. `user_stats` replaces it.
--
-- NOT DONE HERE, and deliberately: the profile and notification endpoints the
-- parity audit lists. Nothing in this client calls them — there is no
-- notification UI at all, and no screen writes a profile field. RLS already
-- allows a signed-in player to read and update their own row, so those RPCs
-- would be code with no caller, written from a list rather than from a need.
-- They belong with the screens that will use them (Phase 5's admin wiring, and
-- whatever surfaces notifications).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Recompute a player's tier from their wager total.
--
-- The rule matches the browser's (vipService.js): the current tier is the
-- highest whose required_wager the player has reached; the next tier is the one
-- above it; at the top, next = current and there is nothing left to earn.
-- Ordered by required_wager rather than by `level`, because required_wager is
-- what the comparison uses and a mis-numbered level would otherwise put a
-- player in a tier they have not paid for.
-- ---------------------------------------------------------------------------
create or replace function public.vip_recalc(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wager numeric;
  v_current public.vip_tiers;
  v_next    public.vip_tiers;
begin
  select current_wager into v_wager from public.vip_progress where user_id = p_user;
  if v_wager is null then return; end if;   -- no row: nothing to recompute

  select * into v_current
    from public.vip_tiers
   where required_wager <= v_wager
   order by required_wager desc
   limit 1;

  -- Below the first tier, the player is still 'None' and the next tier is the
  -- cheapest one — which is what the columns default to, and what the browser
  -- shows.
  select * into v_next
    from public.vip_tiers
   where required_wager > coalesce(v_current.required_wager, -1)
   order by required_wager asc
   limit 1;

  update public.vip_progress
     set current_tier       = coalesce(v_current.name, 'None'),
         next_tier          = coalesce(v_next.name, v_current.name, 'None'),
         wager_to_next_tier = case
           when v_next.id is null then 0                     -- max tier: nothing to go
           else greatest(0, v_next.required_wager - v_wager)
         end
   where user_id = p_user;
end $$;

revoke execute on function public.vip_recalc(uuid) from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- place_bet, unchanged except for the recalc call.
--
-- Reproduced in full because Postgres has no "add a line to a function". The
-- body below is 0004's, verbatim, plus `perform public.vip_recalc(v_user)`
-- immediately after the wager total moves — the one place it can go stale.
-- ---------------------------------------------------------------------------
create or replace function public.place_bet(
  p_game     text,
  p_amount   numeric,
  p_currency text default 'USDT'
)
returns public.bets
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user    uuid := auth.uid();
  v_profile public.profiles;
  v_bet     public.bets;
begin
  if v_user is null then
    raise exception 'not_authenticated';
  end if;
  if p_game not in ('dice','limbo','plinko','mines','hilo','crash','keno') then
    raise exception 'unknown_game: %', p_game;
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;

  select * into v_profile from public.profiles where id = v_user;
  if v_profile.status <> 'active' then
    raise exception 'account_not_active';
  end if;

  -- Debit first. adjust_balance raises insufficient_balance if it would go
  -- negative, which aborts the whole transaction — no bet row is left behind.
  perform public.adjust_balance(v_user, -p_amount);

  insert into public.bets (
    user_id, game, bet_amount, currency, state, display_name, avatar_url
  ) values (
    v_user, p_game, p_amount, p_currency, 'pending',
    case when coalesce(v_profile.hidden_from_public, false) then null
         else v_profile.username end,
    case when coalesce(v_profile.hidden_from_public, false) then null
         else v_profile.profile_image end
  )
  returning * into v_bet;

  insert into public.bills (user_id, transaction_type, token_name, trx_amount, balance, bill_id)
  values (v_user, 'bet', p_currency, -p_amount,
          (select balance from public.profiles where id = v_user), v_bet.bet_id);

  -- Wagering counts toward VIP whether or not the bet wins.
  update public.vip_progress
     set current_wager = current_wager + p_amount
   where user_id = v_user;

  -- ...and the tier that total buys. Without this the three tier columns keep
  -- their creation defaults for the life of the account.
  perform public.vip_recalc(v_user);

  return v_bet;
end $$;

revoke execute on function public.place_bet(text, numeric, text) from public, anon;
grant  execute on function public.place_bet(text, numeric, text) to  authenticated;


-- Bring existing rows in line. Every player who has wagered since launch has a
-- correct current_wager and a stale tier; this is the one-off catch-up.
do $$
declare r record;
begin
  for r in select user_id from public.vip_progress loop
    perform public.vip_recalc(r.user_id);
  end loop;
end $$;


-- ---------------------------------------------------------------------------
-- user_stats — the Statistics modal, in one call.
--
-- Replaces GET /api/user/stats/:username. Shapes its result to the keys the
-- modal already reads (vipLevel, vipProgress, gameBreakdown.dice, ...) so the
-- component only changes how it fetches, not how it renders.
--
-- PRIVACY. The old endpoint served any username to any caller. A player who
-- has set hidden_from_public is already stripped from the public bet feed by
-- place_bet, and it would make no sense to hand their whole record to anyone
-- who types their name here, so this refuses them. Pending bets are excluded:
-- a bet that has not settled is not a win or a loss yet, and counting it as a
-- loss would make every in-progress Mines round look like one.
-- ---------------------------------------------------------------------------
create or replace function public.user_stats(p_username text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_p     public.profiles;
  v_vip   public.vip_progress;
  v_tier  public.vip_tiers;
  v_total record;
  v_games jsonb;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;

  select * into v_p from public.profiles where username = p_username;
  if v_p.id is null then raise exception 'user_not_found'; end if;
  if coalesce(v_p.hidden_from_public, false) and v_p.id <> auth.uid() then
    raise exception 'user_is_private';
  end if;

  select * into v_vip from public.vip_progress where user_id = v_p.id;
  select * into v_tier from public.vip_tiers
   where required_wager <= coalesce(v_vip.current_wager, 0)
   order by required_wager desc limit 1;

  select
    count(*)                                          as bets,
    count(*) filter (where state = 'won')             as wins,
    count(*) filter (where state = 'lost')            as losses,
    coalesce(sum(bet_amount), 0)                      as wagered,
    coalesce(sum(profit), 0)                          as profit
    into v_total
    from public.bets
   where user_id = v_p.id and state <> 'pending';

  /*
   * EVERY game, with the keys the modal reads.
   *
   * Two mistakes to avoid here, both of which shipped once:
   *
   *   The component reads data.bets / data.wins / data.losses / data.profitLoss
   *   (GameRow in src/components/Modals/Statistics.jsx), NOT the totalBets /
   *   profit names used at the top level. The old Express endpoint returned
   *   these names, which is why the component reads them.
   *
   *   It renders a row for crash, dice, plinko, mines, hilo and limbo
   *   unconditionally, so a game the player has never touched must still
   *   appear. Aggregating only over games with bets left those undefined and
   *   the page threw on data.bets.toLocaleString().
   *
   * So: start from the fixed list of games and left-join the totals onto it.
   */
  select jsonb_object_agg(g.game, jsonb_build_object(
           'bets',       coalesce(b.bets, 0),
           'wins',       coalesce(b.wins, 0),
           'losses',     coalesce(b.losses, 0),
           'wagered',    coalesce(b.wagered, 0),
           'profitLoss', coalesce(b.profit, 0)
         )) into v_games
    from (values ('crash'), ('dice'), ('plinko'), ('mines'), ('hilo'), ('limbo'), ('keno')) as g(game)
    left join (
      select game,
             count(*)                                as bets,
             count(*) filter (where state = 'won')   as wins,
             count(*) filter (where state = 'lost')  as losses,
             coalesce(sum(bet_amount), 0)            as wagered,
             coalesce(sum(profit), 0)                as profit
        from public.bets
       where user_id = v_p.id and state <> 'pending'
       group by game
    ) b on b.game = g.game;
  return jsonb_build_object(
    'username',    v_p.username,
    'joinedDate',  v_p.created_at,
    'vipLevel',    coalesce(v_tier.level, 0),
    'vipPoints',   coalesce(v_vip.current_wager, 0),
    -- The same percentage the VIP screen draws, computed the same way, so two
    -- screens cannot disagree about how far along a player is.
    'vipProgress', case
      when v_vip.wager_to_next_tier is null or v_vip.wager_to_next_tier <= 0 then 100
      else round(
        greatest(0, least(100,
          (coalesce(v_vip.current_wager, 0) - coalesce(v_tier.required_wager, 0))
          / nullif((coalesce(v_vip.current_wager, 0) + v_vip.wager_to_next_tier)
                   - coalesce(v_tier.required_wager, 0), 0) * 100))
      ) end,
    'totalBets',   v_total.bets,
    'totalWins',   v_total.wins,
    'totalLosses', v_total.losses,
    'wagered',     v_total.wagered,
    'profitLoss',  v_total.profit,
    'winRate',     case when v_total.bets = 0 then 0
                        else round(v_total.wins::numeric * 100 / v_total.bets, 2) end,
    'gameBreakdown', v_games
  );
end $$;

revoke execute on function public.user_stats(text) from public, anon;
grant  execute on function public.user_stats(text) to  authenticated;
