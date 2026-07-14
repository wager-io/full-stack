import { useCallback, useEffect, useRef } from 'react'
import { rpc } from '../../../lib/realtime'

// Supabase-backed replacement for the old socket hook. Same returned interface
// (handleStartGame / handleRevealTile / handleCashout) so MinesContext and the
// UI components are unchanged. The server owns the grid; the browser only ever
// sees revealed tiles + multipliers until the round ends.
//
// mine_positions is null in every active-game payload, so a player cannot read
// the layout — the whole point of the stateful design.
export default function useMinesBackend({ user, balance, setBalance, gameState, setGameState, setGameHistory }) {
  const socketRef = useRef(null) // kept for interface compatibility; unused

  // Map the server's client-safe state onto the UI's gameState shape.
  const applyState = useCallback((cs, prev) => {
    if (!cs) return prev
    const grid = Array(25).fill(null)
    ;(cs.revealed_tiles || []).forEach((p) => { grid[p] = 'gem' })
    if (Array.isArray(cs.mine_positions)) {
      cs.mine_positions.forEach((p) => { grid[p] = 'mine' }) // game over: reveal bombs
    }
    return {
      ...prev,
      gameId: cs.game_id,
      betAmount: Number(cs.bet_amount),
      minesCount: cs.mines_count,
      grid,
      revealedCount: cs.revealed_count,
      potentialPayout: Number(cs.potential_payout),
      nextMultiplier: cs.next_multiplier == null ? 0 : Number(cs.next_multiplier),
      currentMultiplier: Number(cs.current_multiplier),
      gameActive: cs.state === 'active',
      gameOver: cs.state !== 'active',
      won: cs.state === 'won' || cs.state === 'cashed',
      minePositions: Array.isArray(cs.mine_positions) ? cs.mine_positions : [],
    }
  }, [])

  // Restore an in-progress round after a refresh / reconnect.
  useEffect(() => {
    let cancelled = false
    if (!user) return
    ;(async () => {
      const res = await rpc('mines_active_game')
      if (!cancelled && res.code === 0 && res.data) {
        setGameState((prev) => applyState(res.data, prev))
      }
    })()
    return () => { cancelled = true }
  }, [user, applyState, setGameState])

  const handleStartGame = useCallback(async (betAmount, minesCount) => {
    const res = await rpc('mines_start', { p_amount: betAmount, p_mines: minesCount })
    if (res.code === 0) {
      setGameState((prev) => applyState(res.data, prev))
      if (typeof balance === 'number') setBalance(balance - Number(betAmount))
    }
    return res
  }, [applyState, setGameState, balance, setBalance])

  const handleRevealTile = useCallback(async (position) => {
    const res = await rpc('mines_reveal', { p_game_id: gameState.gameId, p_position: position })
    if (res.code === 0) {
      setGameState((prev) => applyState(res.data, prev))
      // On a win/auto-clear the payout is credited server-side; reflect it.
      if (res.data.state === 'won' && typeof balance === 'number') {
        setBalance(balance + Number(res.data.potential_payout))
      }
      if (res.data.state !== 'active') {
        setGameHistory((h) => [{ ...res.data }, ...h].slice(0, 20))
      }
    }
    return res
  }, [gameState.gameId, applyState, setGameState, balance, setBalance, setGameHistory])

  const handleCashout = useCallback(async () => {
    const res = await rpc('mines_cashout', { p_game_id: gameState.gameId })
    if (res.code === 0) {
      setGameState((prev) => applyState(res.data, prev))
      if (typeof balance === 'number') setBalance(balance + Number(res.data.potential_payout))
      setGameHistory((h) => [{ ...res.data }, ...h].slice(0, 20))
    }
    return res
  }, [gameState.gameId, applyState, setGameState, balance, setBalance, setGameHistory])

  return { socketRef, handleStartGame, handleRevealTile, handleCashout }
}
