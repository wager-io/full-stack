import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../../context/AuthContext';
import { serverUrl } from '../../utils/api';
import PlinkoCanvas from './PlinkoCanvas';

const PlinkoContext = createContext();

export const usePlinkoGame = () => useContext(PlinkoContext);

export const PlinkoGameProvider = ({ children }) => {
  const { user, balance, setBalance } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
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

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(serverUrl());

    socketInstance.on('connect', () => {
      setConnected(true);
      // Initialize game data
      socketInstance.emit('plinko-init', user, (response) => {
        if (response.code === 0) {
          setRecentBets(response.data.betLogs || []);
        } else {
          setError(response.message);
        }
        setLoading(false);
      });
    });

    socketInstance.on('disconnect', () => {
      setConnected(false);
    });

    socketInstance.on('plinkoBet', (bet) => {
      if (!user) return;

      if (bet.userId === user._id) {
        setPendingBets(prev => [...prev, bet]); // <-- This line is correct!
        setGameState('dropping');
      } else {
        setRecentBets(prevBets => [bet, ...prevBets.slice(0, 9)]);
      }
    });

    socketInstance.on('plinko-wallet', ([walletData]) => {
      if (user && walletData._id === user._id) {
        setBalance(walletData.balance);
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user, setBalance]);

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

  // Place a bet (drop ball)
  const placeBet = useCallback(() => {
    if (!socket || !connected) return; // <-- Only block if not connected
    if (!user) {
      setError('Please log in to place a bet');
      return;
    }

    // No setGameState('betting') here, let animation/gameState be managed by plinkoBet event

    const betData = {
      _id: user._id,
      name: user.username,
      hidden: user.hidden_from_public || false,
      avatar: user.profile_image || '',
      betAmount: betAmount,
      currencyName: 'USD',
      currencyImage: '/assets/token/usdt.png',
      betValue: {
        risk,
        rows,
      }
    };

    socket.emit('plinko-bet', betData, (response) => {
      if (response.code !== 0) {
        setError(response.message);
        setGameState('idle');
      }
      // No setGameState here; handled by plinkoBet event
    });
  }, [socket, connected, user, betAmount, risk, rows]);

  // Update seeds (optional, for provably fair)
  const updateSeeds = useCallback(async (clientSeed) => {
    if (!socket || !connected || !user) {
      throw new Error('Not connected or not authenticated');
    }
    return new Promise((resolve, reject) => {
      socket.emit('plinko-update-seeds', { userId: user._id, clientSeed }, (response) => {
        if (response.code === 0) {
          resolve(response.data);
        } else {
          setError(response.message);
          reject(new Error(response.message));
        }
      });
    });
  }, [socket, connected, user]);

  // Get game details (optional)
  const getGameDetails = useCallback((betId) => {
    if (!socket || !connected) {
      throw new Error('Not connected');
    }
    return new Promise((resolve, reject) => {
      socket.emit('plinko-game-details', { betId }, (response) => {
        if (response.code === 0) {
          resolve(response.data);
        } else {
          setError(response.message);
          reject(new Error(response.message));
        }
      });
    }, [socket, connected]);
  });

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