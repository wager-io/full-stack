-- =============================================================================
-- 04_seed_rotation.sql — the seed-rotation guard (0011).
--
--   psql -h 127.0.0.1 -p 55433 -U postgres -d wager_local -f supabase/tests/04_seed_rotation.sql
--
-- Two things have to hold at once, and the second is the one a careless fix
-- breaks: a player must NOT be able to reveal the seed of an open round, and
-- must still be able to rotate freely when no round is open. Provable fairness
-- depends on the reveal being available.
--
-- Skips the Hilo half automatically when 0008 is not applied.
-- =============================================================================
\set ON_ERROR_STOP on

do $$
declare
  v_user       uuid := '88888888-8888-8888-8888-888888888888';
  v_pre_client text;
  v_leaked     text;
  v_game       text;
  v_grid       int[];
  v_actual     int[];
  v_rotated    boolean;
begin
  delete from auth.users where id = v_user;
  insert into auth.users (id, email) values (v_user, 'rotation@test.local');
  perform public.adjust_balance(v_user, 10000);
  perform set_config('request.jwt.claim.sub', v_user::text, false);

  -- --- rotation with nothing open is allowed -------------------------------
  perform public.rotate_seed('mines');

  -- --- the attack: rotate while a Mines round is open -----------------------
  select client_seed into v_pre_client from public.game_seed_info('mines');
  v_game := public.mines_start(10, 3) ->> 'game_id';

  v_rotated := true;
  begin
    -- Capture what this call hands back: if the guard is missing, THIS is the
    -- seed the open round was dealt from. Rotating a second time to fetch it
    -- would return the seed the first rotation minted, and prove nothing.
    select revealed_server_seed into v_leaked from public.rotate_seed('mines');
  exception when others then
    if sqlerrm not like '%finish_active_game_first%' then raise; end if;
    v_rotated := false;
  end;

  if v_rotated then
    -- It went through. Show that this is not a formality: the revealed seed
    -- reproduces the hidden grid exactly.
    select mine_positions into v_actual from public.mines_games where game_id = v_game;
    v_grid := public.pf_mines_grid(v_leaked, v_pre_client,
                (select nonce from public.mines_games where game_id = v_game), 3);
    raise exception 'FAIL: rotate_seed revealed an open Mines round. predicted % / actual %',
      array_to_string(v_grid, ','), array_to_string(v_actual, ',');
  end if;

  -- --- and is allowed again once the round is over --------------------------
  perform public.mines_reveal(v_game,
    (select min(i) from generate_series(0, 24) i
      where not (select mine_positions from public.mines_games where game_id = v_game) @> array[i]));
  perform public.mines_cashout(v_game);
  perform public.rotate_seed('mines');      -- raises if the guard is too broad

  -- --- the same for Hilo, when 0008 is present ------------------------------
  if to_regclass('public.hilo_games') is not null then
    v_game := public.hilo_start(10) ->> 'game_id';

    v_rotated := true;
    begin
      perform public.rotate_seed('hilo');
    exception when others then
      if sqlerrm not like '%finish_active_game_first%' then raise; end if;
      v_rotated := false;
    end;
    if v_rotated then
      raise exception 'FAIL: rotate_seed revealed an open Hilo round';
    end if;

    -- A player with an open Hilo round must not be able to leak it by
    -- rotating a DIFFERENT game's seed either.
    v_rotated := true;
    begin
      perform public.rotate_seed('dice');
    exception when others then
      if sqlerrm not like '%finish_active_game_first%' then raise; end if;
      v_rotated := false;
    end;
    if v_rotated then
      raise exception 'FAIL: an open Hilo round was leakable by rotating another game''s seed';
    end if;

    -- End it, and rotation works again.
    loop
      exit when (select state from public.hilo_games where game_id = v_game) <> 'active';
      perform public.hilo_choice(v_game, 'lo');   -- ends in a loss soon enough
    end loop;
    perform public.rotate_seed('hilo');
  end if;

  perform set_config('request.jwt.claim.sub', '', false);
  delete from auth.users where id = v_user;

  raise notice 'PASS — an open round cannot be revealed; rotation still works when none is';
end $$;
