-- =============================================================================
-- 0011_seed_rotation_guard.sql  —  SECURITY FIX
--
-- rotate_seed let a player read the seed their OPEN game was dealt from, which
-- makes every remaining outcome computable. Demonstrated end to end on Mines:
--
--   select client_seed from game_seed_info('mines');   -- granted to players
--   select mines_start(10, 3);                          -- grid fixed here
--   select revealed_server_seed from rotate_seed('mines');
--   select pf_mines_grid(<revealed>, <client_seed>, <game nonce>, 3);
--     -> predicted 4,11,24   actual 4,11,24
--
-- The same recipe reads every upcoming Hilo card: an audit played it through
-- and won 25 of 25 rounds, cashing out +5,100 on a 100 stake.
--
-- This is provable fairness working exactly as designed — the server seed is
-- revealed so a player can verify past rounds — with one piece missing: the
-- reveal must not happen while a round it governs is still open. The original
-- Node backend had that piece and it was not carried over. Its updateSeeds
-- refused with "Conclude current game first!"
--   (stake-cloneBackend/controllers/games/hilo/hilo.controller.js)
--
-- WHY THIS IS NOT "just don't rotate": rotate_seed is granted to authenticated
-- and is meant to be called by players whenever they like. Nothing else stands
-- between a curious player and a guaranteed win.
--
-- Mines is affected on any deployment that has 0007, which includes the live
-- project. Hilo is affected wherever 0008 is applied.
-- =============================================================================

create or replace function public.rotate_seed(p_game text, p_new_client_seed text default null)
returns table (revealed_server_seed text, revealed_server_seed_hash text, new_server_seed_hash text, client_seed text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user uuid := auth.uid();
  v_old  public.game_seeds;
  v_new_seed text := encode(gen_random_bytes(32), 'hex');
  v_open int;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;

  /*
   * REFUSE WHILE A ROUND IS OPEN.
   *
   * Checked per stateful game, by table, rather than by trusting p_game: a
   * player rotating their 'dice' seed must not be able to leak the seed of
   * their open Mines round. The seed row is per (user, game), so in practice
   * only the matching game can be exposed — but a future game sharing a seed
   * row, or a caller passing a game name that does not match the table it
   * reads, would quietly reopen this. Cheap to check all of them.
   *
   * to_regclass so this migration applies whether or not Hilo (0008) is
   * present: on a database without hilo_games the check is simply skipped,
   * and it starts working the moment that table exists.
   */
  v_open := 0;

  if to_regclass('public.mines_games') is not null then
    execute 'select count(*) from public.mines_games where user_id = $1 and state = ''active'''
      into strict v_open using v_user;
    if v_open > 0 then
      raise exception 'finish_active_game_first'
        using hint = 'Cash out or finish your open Mines round before rotating your seed.';
    end if;
  end if;

  if to_regclass('public.hilo_games') is not null then
    execute 'select count(*) from public.hilo_games where user_id = $1 and state = ''active'''
      into strict v_open using v_user;
    if v_open > 0 then
      raise exception 'finish_active_game_first'
        using hint = 'Cash out or finish your open Hilo round before rotating your seed.';
    end if;
  end if;

  insert into public.game_seeds (user_id, game, server_seed_hash)
  values (v_user, p_game, '') on conflict (user_id, game) do nothing;

  select * into v_old from public.game_seeds where user_id = v_user and game = p_game for update;

  update public.game_seeds
     set previous_server_seed = v_old.server_seed,
         server_seed          = v_new_seed,
         client_seed          = coalesce(nullif(p_new_client_seed, ''), encode(gen_random_bytes(8), 'hex')),
         nonce                = 0
   where user_id = v_user and game = p_game;

  return query
    select v_old.server_seed,
           v_old.server_seed_hash,
           encode(digest(v_new_seed, 'sha256'), 'hex'),
           s.client_seed
      from public.game_seeds s where s.user_id = v_user and s.game = p_game;
end $$;

revoke execute on function public.rotate_seed(text, text) from public, anon;
grant  execute on function public.rotate_seed(text, text) to  authenticated;
