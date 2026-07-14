import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { rpc } from '../../lib/realtime';

// Create context
const DiceContext = createContext();

// Custom hook to use the context
export const useDiceGame = () => useContext(DiceContext);

// Provider component
//
// Migrated from socket.io to Supabase. The exported context shape is IDENTICAL
// to the socket version — every UI component (DiceCanvas, DiceControls,
// BetsTable, DiceHistory...) keeps working unchanged. Only the transport moved:
//   dice-bet          -> supabase.rpc('dice_roll', ...)
//   dice-update-seeds -> supabase.rpc('rotate_seed', 'dice')
//   dice-game-details -> supabase.rpc('game_seed_info', 'dice')
// The live balance now comes from AuthContext's single profiles subscription,
// so the old per-game `dice-wallet` event is gone.
export const DiceGameProvider = ({ children }) => {
  const { user, balance, setBalance } = useContext(AuthContext);
  const [connected] = useState(true);          // no socket to connect; always "ready"
  const [recentBets, setRecentBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameState, setGameState] = useState('idle'); // idle, rolling, finished
  const [lastRoll, setLastRoll] = useState(null);
  const [showResult, setShowResult] = useState(false);
  // Game configuration
  const [betAmount, setBetAmount] = useState(1);
  const [target, setTarget] = useState(50);
  const [mode, setMode] = useState('under'); // 'over' or 'under'

  // Calculate win chance and multiplier
  const winChance = mode === 'over' ? (100 - target) : target;
  const multiplier = parseFloat((99 / winChance).toFixed(2));

  // Load this user's recent dice bets on mount / login.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      if (user) {
        const res = await rpc('my_recent_bets', { p_game: 'dice', p_limit: 10 });
        if (!cancelled && res.code === 0) setRecentBets(res.data || []);
      } else {
        setRecentBets([]);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Place a bet
  const placeBet = useCallback(async () => {
    if (gameState === 'rolling') return;
    if (!user) {
      setError('Please log in to place a bet');
      return;
    }

    setGameState('rolling');

    const res = await rpc('dice_roll', {
      p_amount: betAmount,
      p_target: target,
      p_mode: mode,
    });

    if (res.code === 0) {
      // dice_roll returns a single row (as a one-element array via RETURNS TABLE).
      const r = Array.isArray(res.data) ? res.data[0] : res.data;
      const result = {
        bet_id: r.bet_id,
        roll: Number(r.roll),
        won: r.won,
        target,
        mode,
        multiplier: Number(r.multiplier),
        payout: Number(r.payout),
        betAmount,
      };
      setLastRoll(result);
      setShowResult(true);
      setRecentBets((prev) => [
        { ...result, user_id: user._id, username: user.username },
        ...prev.slice(0, 9),
      ]);
      // Balance updates arrive via the AuthContext profiles subscription; nudge
      // optimistically so the UI reflects the debit/credit without a round-trip.
      if (typeof balance === 'number') {
        setBalance(balance - betAmount + Number(r.payout));
      }
    } else {
      setError(res.message);
    }

    setGameState('finished');
    setTimeout(() => {
      setGameState('idle');
      setShowResult(false);
    }, 4000);
  }, [gameState, user, betAmount, target, mode, balance, setBalance]);

  // Rotate seeds (reveals the retiring server seed for verification).
  const updateSeeds = useCallback(async (clientSeed) => {
    if (!user) throw new Error('Not authenticated');
    const res = await rpc('rotate_seed', { p_game: 'dice', p_new_client_seed: clientSeed || null });
    if (res.code === 0) return Array.isArray(res.data) ? res.data[0] : res.data;
    setError(res.message);
    throw new Error(res.message);
  }, [user]);

  // Fairness details for the current seed pair (hash, client seed, nonce).
  const getGameDetails = useCallback(async () => {
    const res = await rpc('game_seed_info', { p_game: 'dice' });
    if (res.code === 0) return Array.isArray(res.data) ? res.data[0] : res.data;
    setError(res.message);
    throw new Error(res.message);
  }, []);

  // Handle target change
  const handleTargetChange = (newTarget) => {
    setTarget(newTarget);
  };

  // Toggle mode between 'over' and 'under'
  const toggleMode = () => {
    setMode(prevMode => prevMode === 'over' ? 'under' : 'over');
  };

  // Calculate potential profit
  const calculateProfit = () => {
    return (betAmount * multiplier - betAmount).toFixed(2);
  };

  // Context value — unchanged shape from the socket version.
  const value = {
    connected,
    loading,
    error,
    recentBets,
    balance,
    gameState,
    lastRoll,
    betAmount,
    setBetAmount,
    target,
    handleTargetChange,
    mode,
    toggleMode,
    winChance,
    multiplier,
    showResult,
    calculateProfit,
    placeBet,
    updateSeeds,
    getGameDetails,
    user
  };

  return (
    <DiceContext.Provider value={value}>
      {children}
    </DiceContext.Provider>
  );
};

export default DiceContext;
