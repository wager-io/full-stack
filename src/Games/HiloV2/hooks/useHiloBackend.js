import { useCallback, useEffect, useState } from 'react'
import { rpc } from '../../../lib/realtime'

/**
 * Supabase-backed replacement for the Hilo socket layer.
 *
 * The old context opened a socket.io connection to `serverUrl()` and traded
 * `hilo-init` / `hilo-bet` / `hilo-next-round` / `hilo-cashout` with the Node
 * backend. That backend is gone; the shim pointed at nothing, so the game could
 * not be played at all. Same four operations, now RPCs:
 *
 *   hilo-init        -> hilo_active_game()   restore a round after a refresh
 *   hilo-bet         -> hilo_start()         deal the first card, debit stake
 *   hilo-next-round  -> hilo_choice()        'hi' | 'lo' | 'skip'
 *   hilo-cashout     -> hilo_cashout()       bank the run
 *
 * Shaped like useMinesBackend: the hook owns the transport and the mapping, and
 * hands back the same handler names the UI already calls, so the components are
 * untouched.
 */

/**
 * The server's client state -> the shape the existing Hilo components read.
 *
 * They were written against Mongo documents (`bet_id`, `rounds[].cardRank`,
 * `has_ended`), and translating here is what keeps every card, button and
 * history row working without being rewritten.
 */
function toLegacyGame(cs, userId) {
  if (!cs) return null
  return {
    // The UI keys its "is a game running" checks off bet_id; game_id is the
    // server's handle for the round and serves the same purpose.
    bet_id: cs.game_id,
    game_id: cs.game_id,
    user_id: userId,
    bet_amount: Number(cs.bet_amount),
    profit: Number(cs.profit),
    payout: Number(cs.payout),
    hi_chance: Number(cs.hi_chance),
    lo_chance: Number(cs.lo_chance),
    state: cs.state,
    has_ended: cs.state !== 'active',
    can_skip: Boolean(cs.can_skip),
    potential_payout: Number(cs.potential_payout),
    rounds: (cs.rounds || []).map((r) => ({
      /*
       * `card` IS THE CARD, as far as the components are concerned.
       *
       * HiloGameView, HiloActiveCards and HiloControl all read `round.card` —
       * the deck POSITION NUMBER — and resolve the rank and suit from it via
       * useDeck().getCardRank/getCardSuite. Without it every face on screen
       * renders blank: getCardRank(undefined) returns ''. The cardRank /
       * cardSuite pair below is the Mongo document shape the old context
       * exposed; some components read those too, so both are provided.
       */
      card: r.number,
      cardRank: r.rank,
      cardSuite: r.suite,
      cardRankNumber: r.rank_value,
      cardNumber: r.number,
      red: Boolean(r.red),
      hi_chance: r.hi_chance,
      lo_chance: r.lo_chance,
      payout: r.payout,
      hi: r.guess === 'hi',
      lo: r.guess === 'lo',
      skipped: r.guess === 'skip',
      won: r.won,
    })),
  }
}

/** The card the player is calling against — the last one dealt. */
function toCurrentCard(cs) {
  const c = cs?.current_card
  if (!c) return null
  return {
    value: c.rank,
    rank: c.rank,
    suite: c.suite,
    rankValue: c.rank_value,
    number: c.number,
    color: c.red ? 'var(--red-500)' : 'var(--gray-900)',
    disabled: false,
    faceDown: false,
  }
}

export default function useHiloBackend({ user, setBalance }) {
  const [hiloGame, setHiloGame] = useState(null)
  const [currentCard, setCurrentCard] = useState(null)
  const [hasActiveGame, setHasActiveGame] = useState(false)
  const [gameInitialized, setGameInitialized] = useState(false)
  const [processingRequest, setProcessingRequest] = useState(false)
  const [error, setError] = useState(null)
  const [cashoutResult, setCashoutResult] = useState(null)
  /**
   * What each call pays if it wins, from the server. The old context invented
   * these — `amount * 2.25` for higher, `* 1.1` for lower, `* 12` for same,
   * with a comment saying "adjust as needed". They had nothing to do with the
   * odds being played, which on a gambling screen is the worst kind of wrong.
   */
  const [profitHigher, setProfitHigher] = useState(0)
  const [profitLower, setProfitLower] = useState(0)

  const apply = useCallback((cs) => {
    const game = toLegacyGame(cs, user?.id ?? user?._id)
    setHiloGame(game)
    setHasActiveGame(Boolean(game) && !game.has_ended)
    const card = toCurrentCard(cs)
    if (card) setCurrentCard(card)
    setProfitHigher(Number(cs?.next?.hi_profit ?? 0))
    setProfitLower(Number(cs?.next?.lo_profit ?? 0))
    return game
  }, [user])

  // Restore an in-progress round after a refresh. The round lives in the
  // database, so this is the whole of "reconnect".
  useEffect(() => {
    let cancelled = false
    if (!user) return undefined
    ;(async () => {
      const res = await rpc('hilo_active_game')
      if (cancelled) return
      if (res.code === 0 && res.data) apply(res.data)
      setGameInitialized(true)
    })()
    return () => { cancelled = true }
  }, [user, apply])

  const handleBet = useCallback(async (data) => {
    if (!user || processingRequest) return { code: 1, message: 'busy' }
    setProcessingRequest(true)
    setError(null)
    const res = await rpc('hilo_start', {
      p_amount: Number(data?.bet_amount),
      p_currency: data?.token || 'USDT',
    })
    setProcessingRequest(false)
    if (res.code === 0) {
      apply(res.data)
      // The stake is debited server-side; reflect it without a refetch.
      setBalance?.((b) => (typeof b === 'number' ? b - Number(data?.bet_amount) : b))
    } else {
      setError(res.message || 'Failed to place bet')
    }
    return res
  }, [user, processingRequest, apply, setBalance])

  const handleNextRound = useCallback(async (data) => {
    if (!hiloGame?.game_id || processingRequest) return { code: 1, message: 'busy' }
    const choice = data?.skip ? 'skip' : data?.hi ? 'hi' : 'lo'
    setProcessingRequest(true)
    setError(null)
    const res = await rpc('hilo_choice', { p_game_id: hiloGame.game_id, p_choice: choice })
    setProcessingRequest(false)
    if (res.code === 0) apply(res.data)
    else setError(res.message || 'Failed to proceed to next round')
    return res
  }, [hiloGame, processingRequest, apply])

  const handleCashOut = useCallback(async () => {
    if (!hiloGame?.game_id || processingRequest) return { code: 1, message: 'busy' }
    setProcessingRequest(true)
    setError(null)
    const staked = hiloGame.bet_amount
    const res = await rpc('hilo_cashout', { p_game_id: hiloGame.game_id })
    setProcessingRequest(false)
    if (res.code === 0) {
      const game = apply(res.data)
      const returned = Number(res.data?.potential_payout ?? 0)
      setBalance?.((b) => (typeof b === 'number' ? b + returned : b))
      setCashoutResult({
        amount: returned,
        profit: Number(game?.profit ?? 0),
        multiplier: staked ? returned / staked : 0,
        timestamp: new Date().toISOString(),
      })
      // Matches the old behaviour: the banner clears itself.
      setTimeout(() => setCashoutResult(null), 5000)
    } else {
      setError(res.message || 'Failed to cash out')
    }
    return res
  }, [hiloGame, processingRequest, apply, setBalance])

  return {
    hiloGame,
    setHiloGame,
    currentCard,
    setCurrentCard,
    hasActiveGame,
    setHasActiveGame,
    gameInitialized,
    processingRequest,
    setProcessingRequest,
    error,
    setError,
    cashoutResult,
    setCashoutResult,
    profitHigher,
    profitLower,
    handleBet,
    handleNextRound,
    handleCashOut,
  }
}
