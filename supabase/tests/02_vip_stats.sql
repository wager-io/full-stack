-- =============================================================================
-- 02_vip_stats.sql — vip_recalc and user_stats, asserted.
--
-- Run against a database with the harness, the migrations and seed.sql loaded:
--   psql -h 127.0.0.1 -p 55433 -U postgres -d wager_local -f supabase/tests/02_vip_stats.sql
--
-- Every check RAISES on failure, so psql exits non-zero and a broken port
-- cannot look like a pass. Self-contained: it creates its own player and
-- removes them at the end, so it can be run repeatedly.
-- =============================================================================
\set ON_ERROR_STOP on

do $$
declare
  v_user uuid := '22222222-2222-2222-2222-222222222222';
  v_tier record;
  v_stats jsonb;
  v_bet   text;
begin
  -- --- a clean player -------------------------------------------------------
  delete from public.bets where user_id = v_user;
  delete from auth.users where id = v_user;          -- cascades to profile + vip_progress
  insert into auth.users (id, email) values (v_user, 'vipstats@test.local');
  update public.profiles set username = 'vipstats_tester' where id = v_user;
  perform public.adjust_balance(v_user, 200000);

  -- The defaults every account starts on.
  select current_tier, next_tier, wager_to_next_tier into v_tier
    from public.vip_progress where user_id = v_user;
  if v_tier.current_tier <> 'None' or v_tier.next_tier <> 'Bronze' then
    raise exception 'FAIL: a new player should start None -> Bronze, got % -> %',
      v_tier.current_tier, v_tier.next_tier;
  end if;

  perform set_config('request.jwt.claim.sub', v_user::text, false);

  -- --- below the first tier -------------------------------------------------
  perform public.place_bet('dice', 5000);
  select current_tier, next_tier, wager_to_next_tier into v_tier
    from public.vip_progress where user_id = v_user;
  if v_tier.current_tier <> 'None' or v_tier.wager_to_next_tier <> 5000 then
    raise exception 'FAIL: 5,000 wagered should stay None with 5,000 to go, got % with %',
      v_tier.current_tier, v_tier.wager_to_next_tier;
  end if;

  -- --- EXACTLY on the threshold ---------------------------------------------
  -- 5,000 + 5,000 = 10,000, Bronze's requirement to the penny. Without this
  -- case, changing vip_recalc's `required_wager <= v_wager` to `<` still
  -- passed every check here: nothing ever landed on a boundary, so the
  -- boundary was never tested.
  perform public.place_bet('dice', 5000);                    -- 10,000 exactly
  select current_tier, next_tier, wager_to_next_tier into v_tier
    from public.vip_progress where user_id = v_user;
  if v_tier.current_tier <> 'Bronze' then
    raise exception 'FAIL: exactly 10,000 should BE Bronze, got %', v_tier.current_tier;
  end if;
  if v_tier.wager_to_next_tier <> 40000 then
    raise exception 'FAIL: at exactly Bronze, 40,000 should remain to Silver, got %',
      v_tier.wager_to_next_tier;
  end if;

  -- --- and onward ------------------------------------------------------------
  perform public.place_bet('dice', 2000);                    -- 12,000 total
  select current_tier, next_tier, wager_to_next_tier into v_tier
    from public.vip_progress where user_id = v_user;
  if v_tier.current_tier <> 'Bronze' or v_tier.next_tier <> 'Silver' then
    raise exception 'FAIL: 12,000 wagered should be Bronze -> Silver, got % -> %',
      v_tier.current_tier, v_tier.next_tier;
  end if;
  -- Silver is 50,000, so 38,000 to go. THIS is the number the old code never
  -- wrote: it stayed at the creation default of 10,000 forever.
  if v_tier.wager_to_next_tier <> 38000 then
    raise exception 'FAIL: expected 38,000 to Silver, got %', v_tier.wager_to_next_tier;
  end if;

  -- --- stats ----------------------------------------------------------------
  select bet_id into v_bet from public.bets where user_id = v_user order by id desc limit 1;
  perform public.settle_bet(v_bet, 2.0, '{}'::jsonb);        -- one win, one still pending

  v_stats := public.user_stats('vipstats_tester');
  if (v_stats->>'vipLevel')::int <> 10 then
    raise exception 'FAIL: Bronze is level 10, user_stats says %', v_stats->>'vipLevel';
  end if;
  if (v_stats->>'vipPoints')::numeric <> 12000 then
    raise exception 'FAIL: vipPoints should be the wager total 12,000, got %', v_stats->>'vipPoints';
  end if;
  -- 12,000 wagered, 10,000 into Bronze, 40,000 span to Silver -> 5%.
  if (v_stats->>'vipProgress')::numeric <> 5 then
    raise exception 'FAIL: expected 5%% to Silver, got %', v_stats->>'vipProgress';
  end if;
  -- Only the SETTLED bet counts. The other is still pending and must not be
  -- reported as a loss, or every in-progress round would look like one.
  if (v_stats->>'totalBets')::int <> 1 or (v_stats->>'totalWins')::int <> 1 then
    raise exception 'FAIL: one settled win expected, got % bets / % wins',
      v_stats->>'totalBets', v_stats->>'totalWins';
  end if;
  if (v_stats->'gameBreakdown'->'dice'->>'totalBets')::int <> 1 then
    raise exception 'FAIL: the dice breakdown is missing the settled bet';
  end if;

  -- --- privacy --------------------------------------------------------------
  update public.profiles set hidden_from_public = true where id = v_user;
  begin
    -- Reading YOUR OWN stats stays allowed even when hidden.
    perform public.user_stats('vipstats_tester');
  exception when others then
    raise exception 'FAIL: a hidden player must still see their own stats (%)', sqlerrm;
  end;

  -- Case-insensitive, because uniqueness is. Before 0013 this raised.
  if public.user_stats('VIPSTATS_TESTER')->>'username' <> 'vipstats_tester' then
    raise exception 'FAIL: the lookup is still case-sensitive';
  end if;

  perform set_config('request.jwt.claim.sub', '33333333-3333-3333-3333-333333333333', false);
  begin
    perform public.user_stats('vipstats_tester');
    raise exception 'FAIL: a hidden player was readable by another user';
  exception
    when sqlstate 'P0001' then
      if sqlerrm like 'FAIL:%' then raise; end if;
      -- 0013: a hidden player and a name nobody holds give the SAME answer.
      -- Two different answers told a stranger which names exist.
      if sqlerrm not like '%user_not_found%' then
        raise exception 'FAIL: expected user_not_found for a hidden player, got %', sqlerrm;
      end if;
  end;

  -- ...and the same answer for a name that was never taken.
  begin
    perform public.user_stats('nobody_by_that_name');
    raise exception 'FAIL: an unknown name returned stats';
  exception when sqlstate 'P0001' then
    if sqlerrm like 'FAIL:%' then raise; end if;
    if sqlerrm not like '%user_not_found%' then raise; end if;
  end;

  -- --- cleanup --------------------------------------------------------------
  perform set_config('request.jwt.claim.sub', '', false);
  delete from public.bets where user_id = v_user;
  delete from auth.users where id = v_user;

  raise notice 'PASS — vip_recalc and user_stats behave as specified';
end $$;
