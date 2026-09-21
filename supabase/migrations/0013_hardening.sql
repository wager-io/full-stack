-- =============================================================================
-- 0013_hardening.sql
--
-- Six findings from the audit of 0009 and 0010. Two of them are older than that
-- work and are the reason this file exists at all: a rule written inside a
-- function is only a rule if the function is the only way in.
--
-- Nothing here changes what an honest client can do. Every change either takes
-- away a route that bypassed a rule, or makes an answer stop depending on
-- something it should not depend on.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. A player could rewrite the notifications we sent them.
--
-- RLS restricted the row (yours only) but not the columns, and `authenticated`
-- held UPDATE on all thirteen. So a player could take a row the system wrote
-- and turn it into "You won a 500 USDT bonus" with an action_url of their
-- choosing. Reassigning it to somebody else was already blocked by the policy's
-- WITH CHECK, so this was never a way to reach another player -- but it does
-- mean a notification was not evidence of anything, which matters the first
-- time a bonus dispute turns on what we told someone.
--
-- Marking a message read is the only thing a player needs to write.
-- ---------------------------------------------------------------------------
revoke update on public.notifications from authenticated;
grant  update (read, read_at) on public.notifications to authenticated;


-- ---------------------------------------------------------------------------
-- 2. The profile RPCs' validation was advisory.
--
-- `authenticated` held UPDATE on fourteen profile columns, so the browser could
-- write them directly and never call profile_set_username at all. Verified, not
-- assumed: a direct write set a one-character username the RPC refuses, and a
-- profile_image of 'javascript:alert(1)'.
--
-- The grants go. Everything a player may legitimately change now goes through a
-- function, which is the pattern the money paths already follow.
--
-- This breaks nothing that currently works. The one direct write in the client
-- (updateUserDetails, AuthContext.jsx) sends camelCase keys -- firstName,
-- dateOfBirth, postalCode -- at snake_case columns, so PostgREST has been
-- rejecting the whole statement every time. The details modal has never saved
-- anything. profile_set_details below is what it should have been calling, and
-- takes the names the form actually sends.
-- ---------------------------------------------------------------------------
revoke update on public.profiles from authenticated;

create or replace function public.profile_set_details(p_details jsonb)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_row  public.profiles;
  v_dob  date;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if p_details is null or jsonb_typeof(p_details) <> 'object' then
    raise exception 'invalid_details';
  end if;

  -- Age. The client checks this too, but a check only the client makes is a
  -- check a player can skip by not being the client.
  if p_details ? 'dateOfBirth' and coalesce(p_details->>'dateOfBirth', '') <> '' then
    begin
      v_dob := (p_details->>'dateOfBirth')::date;
    exception when others then
      raise exception 'invalid_date_of_birth';
    end;
    if v_dob > current_date - interval '18 years' then
      raise exception 'under_18';
    end if;
  end if;

  perform set_config('app.allow_balance_change', 'on', true);

  -- Named one by one on purpose. A loop over the object's keys would write
  -- whatever key it was handed, which is the hole this migration closes.
  update public.profiles set
    first_name       = coalesce(nullif(btrim(p_details->>'firstName'),       ''), first_name),
    last_name        = coalesce(nullif(btrim(p_details->>'lastName'),        ''), last_name),
    country          = coalesce(nullif(btrim(p_details->>'country'),         ''), country),
    place            = coalesce(nullif(btrim(p_details->>'place'),           ''), place),
    city             = coalesce(nullif(btrim(p_details->>'city'),            ''), city),
    resident_address = coalesce(nullif(btrim(p_details->>'residentAddress'), ''), resident_address),
    postal_code      = coalesce(nullif(btrim(p_details->>'postalCode'),      ''), postal_code),
    state            = coalesce(nullif(btrim(p_details->>'state'),           ''), state),
    language         = coalesce(nullif(btrim(p_details->>'language'),        ''), language),
    date_of_birth    = coalesce(v_dob, date_of_birth)
  where id = v_user
  returning * into v_row;

  perform set_config('app.allow_balance_change', 'off', true);
  return v_row;
end $$;

revoke execute on function public.profile_set_details(jsonb) from public, anon;
grant  execute on function public.profile_set_details(jsonb) to  authenticated;


-- A player may still hide themselves from the public feed. That is a genuine
-- one-column preference, so it gets its own function rather than a grant.
create or replace function public.profile_set_visibility(p_hidden boolean)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if p_hidden is null then raise exception 'invalid_visibility'; end if;
  perform set_config('app.allow_balance_change', 'on', true);
  update public.profiles set hidden_from_public = p_hidden where id = v_user;
  perform set_config('app.allow_balance_change', 'off', true);
  return p_hidden;
end $$;

revoke execute on function public.profile_set_visibility(boolean) from public, anon;
grant  execute on function public.profile_set_visibility(boolean) to  authenticated;


-- ---------------------------------------------------------------------------
-- 3. Referrals accepted pairs and banned accounts.
--
-- A could refer B while B referred A, and a suspended account could still be
-- credited as a referrer. Both are commission paid on a relationship we would
-- not have approved. Reproduced verbatim from 0010 with the two checks added,
-- because Postgres has no "add a line to a function".
-- ---------------------------------------------------------------------------
create or replace function public.profile_register_referral(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user     uuid := auth.uid();
  v_existing uuid;
  v_referrer public.profiles;
  v_rows     int;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;

  select referred_by into v_existing from public.profiles where id = v_user for update;
  if v_existing is not null then raise exception 'already_referred'; end if;

  select * into v_referrer from public.profiles
   where affiliate_code = upper(btrim(p_code));
  if v_referrer.id is null then raise exception 'unknown_code'; end if;
  if v_referrer.id = v_user then raise exception 'cannot_refer_self'; end if;

  -- A referrer who is not in good standing earns nothing. Reading `status`
  -- here rather than a dedicated flag keeps one definition of "may use this
  -- site" instead of two that can disagree.
  if coalesce(v_referrer.status, '') <> 'active' then
    raise exception 'referrer_not_active';
  end if;

  -- Reciprocal pairs. Two accounts pointing at each other is not a referral,
  -- it is two people claiming the bonus for finding each other.
  if v_referrer.referred_by = v_user then
    raise exception 'reciprocal_referral';
  end if;

  perform set_config('app.allow_balance_change', 'on', true);
  update public.profiles set referred_by = v_referrer.id
   where id = v_user and referred_by is null;
  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    perform set_config('app.allow_balance_change', 'off', true);
    raise exception 'already_referred';
  end if;
  update public.profiles set referral_count = coalesce(referral_count, 0) + 1
   where id = v_referrer.id;
  perform set_config('app.allow_balance_change', 'off', true);

  return jsonb_build_object('referred_by', v_referrer.username);
end $$;

revoke execute on function public.profile_register_referral(text) from public, anon;
grant  execute on function public.profile_register_referral(text) to  authenticated;


-- ---------------------------------------------------------------------------
-- 4. Two tiers on the same required_wager resolved arbitrarily.
--
-- `order by required_wager desc limit 1` has no tie-break, so with two tiers on
-- the same requirement the winner was whichever row the plan happened to
-- return -- and it could differ between two calls. Harmless with today's data
-- and a real bug the day somebody adds a tier. `level desc` settles it: of two
-- tiers a player has equally earned, they get the higher.
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
  if v_wager is null then return; end if;

  select * into v_current
    from public.vip_tiers
   where required_wager <= v_wager
   order by required_wager desc, level desc, id desc
   limit 1;

  select * into v_next
    from public.vip_tiers
   where required_wager > coalesce(v_current.required_wager, -1)
   order by required_wager asc, level asc, id asc
   limit 1;

  update public.vip_progress
     set current_tier       = coalesce(v_current.name, 'None'),
         next_tier          = coalesce(v_next.name, v_current.name, 'None'),
         wager_to_next_tier = case
           when v_next.id is null then 0
           else greatest(0, v_next.required_wager - v_wager)
         end
   where user_id = p_user;
end $$;

revoke execute on function public.vip_recalc(uuid) from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- 5 and 6. user_stats: an existence oracle, a case-sensitive lookup, and a
-- percentage that mixed a stored number with a live one.
--
--   * Refusing a hidden player with 'user_is_private' and an unknown name with
--     'user_not_found' confirms which names exist. Someone who has hidden
--     themselves can still be checked for, which is most of what hiding was
--     for. Both now answer 'user_not_found'.
--   * The lookup was case-sensitive while uniqueness (0010) is not, so
--     'Victor' and 'victor' are one account at signup but only one spelling
--     could be looked up.
--   * vipProgress read the STORED wager_to_next_tier alongside a live tier
--     lookup, so the two could disagree for a moment after a bet. It is now
--     computed from the tier table alone.
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
  v_next  public.vip_tiers;
  v_total record;
  v_games jsonb;
  v_wager numeric;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;

  select * into v_p from public.profiles
   where lower(username) = lower(btrim(p_username));

  -- One answer for "no such player" and "not your business". Two different
  -- answers is a yes/no oracle for whether a name is taken.
  if v_p.id is null
     or (coalesce(v_p.hidden_from_public, false) and v_p.id <> auth.uid()) then
    raise exception 'user_not_found';
  end if;

  select * into v_vip from public.vip_progress where user_id = v_p.id;
  v_wager := coalesce(v_vip.current_wager, 0);

  select * into v_tier from public.vip_tiers
   where required_wager <= v_wager
   order by required_wager desc, level desc, id desc limit 1;

  -- The next tier from the same source as the current one, rather than from a
  -- stored column written at some earlier moment.
  select * into v_next from public.vip_tiers
   where required_wager > coalesce(v_tier.required_wager, -1)
   order by required_wager asc, level asc, id asc limit 1;

  select
    count(*)                                          as bets,
    count(*) filter (where state = 'won')             as wins,
    count(*) filter (where state = 'lost')            as losses,
    coalesce(sum(bet_amount), 0)                      as wagered,
    coalesce(sum(profit), 0)                          as profit
    into v_total
    from public.bets
   where user_id = v_p.id and state <> 'pending';

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
    'vipPoints',   v_wager,
    'vipProgress', case
      when v_next.id is null then 100
      else round(greatest(0, least(100,
             (v_wager - coalesce(v_tier.required_wager, 0))
             / nullif(v_next.required_wager - coalesce(v_tier.required_wager, 0), 0) * 100)))
      end,
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
