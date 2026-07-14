import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { rpc } from '../../lib/realtime';

// Create context
const LimboContext = createContext();

// Custom hook to use the context
export const useLimboGame = () => useContext(LimboContext);

// Provider component
export const LimboGameProvider = ({ children }) => {
  const { user, balance, setBalance } = useContext(AuthContext);
  const [connected] = useState(true);          // no socket; always ready
  const [recentBets, setRecentBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameState, setGameState] = useState('idle'); // idle, rolling, finished
  const [lastRoll, setLastRoll] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [pendingBet, setPendingBet] = useState(null); // Store pending bet until animation completes

  // Game configuration
  const [betAmount, setBetAmount] = useState(1);
  const [target, setTarget] = useState(50);
  const [mode, setMode] = useState('over'); // 'over' or 'under'
  const [multiplier, setMultiplier] = useState(1.98);
  const [winChance, setWinChance] = useState(50);

  // Update multiplier when win chance changes
  const updateMultiplierFromWinChance = useCallback((chance) => {
    if (chance <= 0 || chance >= 100) return;
    const newMultiplier = parseFloat((99 / chance).toFixed(2));
    setMultiplier(newMultiplier);
  }, []);

  // Update win chance when multiplier changes
  const updateWinChanceFromMultiplier = useCallback((mult) => {
    if (mult <= 1) return;
    const newWinChance = parseFloat((99 / mult).toFixed(2));
    setWinChance(newWinChance);
  }, []);

  // Handle multiplier input change
  const handleMultiplierChange = useCallback((value) => {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue) && parsedValue >= 1.01) {
      setMultiplier(parsedValue);
      updateWinChanceFromMultiplier(parsedValue);
    } else if (value === '' || value === '.') {
      // Allow empty input or decimal point for typing
      setMultiplier(value);
    }
  }, [updateWinChanceFromMultiplier]);

  // Handle win chance input change
  const handleWinChanceChange = useCallback((value) => {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue) && parsedValue > 0 && parsedValue < 100) {
      setWinChance(parsedValue);
      updateMultiplierFromWinChance(parsedValue);
    } else if (value === '' || value === '.') {
      // Allow empty input or decimal point for typing
      setWinChance(value);
    }
  }, [updateMultiplierFromWinChance]);

  // Load this user's recent limbo bets on mount / login.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      if (user) {
        const res = await rpc('my_recent_bets', { p_game: 'limbo', p_limit: 10 });
        if (!cancelled && res.code === 0) setRecentBets(res.data || []);
      } else {
        setRecentBets([]);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Function to add the pending bet to recent bets after animation completes
  const onAnimationComplete = useCallback(() => {
    if (pendingBet) {
      setRecentBets(prevBets => [pendingBet, ...prevBets.slice(0, 9)]); // Keep only top 10 bets
      setPendingBet(null); // Clear the pending bet
    }
  }, [pendingBet]);

  // Place a bet. The player's chosen `multiplier` is the target the generated
  // roll must clear (mode 'over'), matching the old socket contract's betValue.
  const placeBet = useCallback(async () => {
    if (gameState === 'rolling') return;
    if (!user) {
      setError('Please log in to place a bet');
      return;
    }

    setGameState('rolling');

    const res = await rpc('limbo_roll', {
      p_amount: betAmount,
      p_target: parseFloat(multiplier),
      p_mode: mode,
    });

    if (res.code === 0) {
      const r = Array.isArray(res.data) ? res.data[0] : res.data;
      const result = {
        bet_id: r.bet_id,
        roll: Number(r.roll),
        won: r.won,
        target: parseFloat(multiplier),
        mode,
        multiplier: Number(r.multiplier),
        payout: Number(r.payout),
        betAmount,
      };
      setLastRoll(result);
      setShowResult(true);
      setPendingBet({ ...result, user_id: user._id, username: user.username });
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
  }, [gameState, user, betAmount, multiplier, mode, balance, setBalance]);

  // Rotate seeds (reveals the retiring server seed for verification).
  const updateSeeds = useCallback(async (clientSeed) => {
    if (!user) throw new Error('Not authenticated');
    const res = await rpc('rotate_seed', { p_game: 'limbo', p_new_client_seed: clientSeed || null });
    if (res.code === 0) return Array.isArray(res.data) ? res.data[0] : res.data;
    setError(res.message);
    throw new Error(res.message);
  }, [user]);

  // Fairness details for the current seed pair.
  const getGameDetails = useCallback(async () => {
    const res = await rpc('game_seed_info', { p_game: 'limbo' });
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

  // Context value
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
    user,
    handleMultiplierChange,
    handleWinChanceChange,
    onAnimationComplete
  };

  return (
    <LimboContext.Provider value={value}>
      {children}
    </LimboContext.Provider>
  );
};

export default LimboContext;