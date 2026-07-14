import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { rpc } from '../../lib/realtime';
import PlinkoCanvas from './PlinkoCanvas';

const PlinkoContext = createContext();

export const usePlinkoGame = () => useContext(PlinkoContext);

export const PlinkoGameProvider = ({ children }) => {
  const { user, balance, setBalance } = useContext(AuthContext);
  const [connected] = useState(true);          // no socket; always ready
  const [recentBets, setRecentBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameState, setGameState] = useState('idle'); // idle, dropping, finished
  const [lastDrop, setLastDrop] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [pendingBets, setPendingBets] = useState([]);
  const canvasRef = useRef(null);
  const [canvasApi, setCanvasApi] = useState(null);

  // Game configuration
  const [betAmount, setBetAmount] = useState(1);
  const [risk, setRisk] = useState(1); // 1: low, 2: medium, 3: high
  const [rows, setRows] = useState(8);

  // Load this user's recent plinko bets on mount / login.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      if (user) {
        const res = await rpc('my_recent_bets', { p_game: 'plinko', p_limit: 10 });
        if (!cancelled && res.code === 0) setRecentBets(res.data || []);
      } else {
        setRecentBets([]);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Add the pending bet to recent bets after animation completes
  const onAnimationComplete = useCallback((betId) => {
    setPendingBets(prev => prev.filter(b => b.betId !== betId));
    setGameState('finished');
    setShowResult(true);
    setTimeout(() => {
      setGameState('idle');
      setShowResult(false);
    }, 2000);
  }, []);

  // Place a bet (drop ball). The RPC resolves the outcome server-side; we push
  // the resulting path into pendingBets so the canvas animates the drop, exactly
  // as the old `plinkoBet` socket event did.
  const placeBet = useCallback(async () => {
    if (!user) {
      setError('Please log in to place a bet');
      return;
    }

    const res = await rpc('plinko_drop', {
      p_amount: betAmount,
      p_risk: risk,
      p_rows: rows,
    });

    if (res.code === 0) {
      const r = Array.isArray(res.data) ? res.data[0] : res.data;
      const bet = {
        betId: r.bet_id,
        userId: user._id,
        path: r.path,                 // array of 0/1 (left/right) per row
        bucket: r.bucket,
        multiplier: Number(r.multiplier),
        payout: Number(r.payout),
        betAmount,
        risk,
        rows,
      };
      setLastDrop(bet);
      setPendingBets(prev => [...prev, bet]);
      setGameState('dropping');
      if (typeof balance === 'number') {
        setBalance(balance - betAmount + Number(r.payout));
      }
    } else {
      setError(res.message);
      setGameState('idle');
    }
  }, [user, betAmount, risk, rows, balance, setBalance]);

  // Rotate seeds (reveals the retiring server seed for verification).
  const updateSeeds = useCallback(async (clientSeed) => {
    if (!user) throw new Error('Not authenticated');
    const res = await rpc('rotate_seed', { p_game: 'plinko', p_new_client_seed: clientSeed || null });
    if (res.code === 0) return Array.isArray(res.data) ? res.data[0] : res.data;
    setError(res.message);
    throw new Error(res.message);
  }, [user]);

  // Fairness details for the current seed pair.
  const getGameDetails = useCallback(async () => {
    const res = await rpc('game_seed_info', { p_game: 'plinko' });
    if (res.code === 0) return Array.isArray(res.data) ? res.data[0] : res.data;
    setError(res.message);
    throw new Error(res.message);
  }, []);

  // Calculate potential profit (example, adjust as needed)
  const calculateProfit = () => {
    // You may want to fetch the payout multiplier from backend or use a local payout table
    // For now, just return betAmount as a placeholder
    return betAmount;
  };

  // Update PlinkoCanvas instance when risk or rows change
  useEffect(() => {
    if (canvasRef.current) {
      const api = new PlinkoCanvas(canvasRef.current, { rows, risk, betAmount });
      setCanvasApi(api);
      api.drawBoard();
    }
  }, [rows, risk, betAmount]);

  // Ref callback for canvas
  const plinkoCanvasRef = useCallback((canvas) => {
    if (canvas) {
      canvasRef.current = canvas;
      const api = new PlinkoCanvas(canvas, { rows, risk, betAmount });
      setCanvasApi(api);
    }
  }, [rows, risk, betAmount]);

  const value = {
    connected,
    loading,
    error,
    recentBets,
    balance,
    gameState,
    lastDrop,
    betAmount,
    setBetAmount,
    risk,
    setRisk,
    rows,
    setRows,
    showResult,
    calculateProfit,
    placeBet,
    updateSeeds,
    getGameDetails,
    user,
    pendingBets,
    onAnimationComplete,
    plinkoCanvasRef,
    canvasApi,
  };

  return (
    <PlinkoContext.Provider value={value}>
      {children}
    </PlinkoContext.Provider>
  );
};

export default PlinkoContext;