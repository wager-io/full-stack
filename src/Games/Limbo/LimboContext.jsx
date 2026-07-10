import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../../context/AuthContext';
import { serverUrl } from '../../utils/api';

// Create context
const LimboContext = createContext();

// Custom hook to use the context
export const useLimboGame = () => useContext(LimboContext);

// Provider component
export const LimboGameProvider = ({ children }) => {
  const { user, balance, setBalance } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
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

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(serverUrl());

    socketInstance.on('connect', () => {
      console.log('Connected to limbo socket server');
      setConnected(true);

      // Initialize game data
      socketInstance.emit('limbo-init', user, (response) => {
        if (response.code === 0) {
          setRecentBets(!user ? [] : response.data.betLogs.filter(bet => bet.user_id === user._id));
        } else {
          setError(response.message);
        }
        setLoading(false);
      });
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from limbo socket server');
      setConnected(false);
    });

    socketInstance.on('limboBet', (bet) => {
      if (!user) return;
      if (bet.userId !== user._id) return;
      // Instead of immediately adding to recentBets, we'll store it and add after animation
      setPendingBet(bet);
    });

    socketInstance.on('limbo-wallet', ([walletData]) => {
      if (user && walletData._id === user._id) {
        setBalance(walletData.balance);
      }
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  // Function to add the pending bet to recent bets after animation completes
  const onAnimationComplete = useCallback(() => {
    if (pendingBet) {
      setRecentBets(prevBets => [pendingBet, ...prevBets.slice(0, 9)]); // Keep only top 10 bets
      setPendingBet(null); // Clear the pending bet
    }
  }, [pendingBet]);

  // Place a bet
  const placeBet = useCallback(() => {
    if (!socket || !connected || gameState === 'rolling') {
      return;
    }
    if (!user) {
      setError('Please log in to place a bet');
      return;
    }

    setGameState('rolling');

    const betData = {
      _id: user._id,
      name: user.username,
      hidden: user.hidden_from_public || false,
      avatar: user.profile_image || '',
      betAmount: betAmount,
      currencyName: 'USD', // Replace with your currency
      currencyImage: '/assets/token/usdt.png', // Replace with your currency image
      betValue: {
        target: multiplier,
        mode: mode
      }
    };

    socket.emit('limbo-bet', betData, (response) => {
      console.log('[LimboContext] Place bet response:', response);
      if (response.code === 0) {
        console.log('[LimboContext] Setting lastRoll:', response.data);
        setLastRoll(response.data);
        setShowResult(true);
      } else {
        console.error('[LimboContext] Bet error:', response.message);
        setError(response.message);
      }
      setGameState('finished');

      // Reset after a short delay
      setTimeout(() => {
        setGameState('idle');
        setShowResult(false);
      }, 4000);
    });
  }, [socket, connected, gameState, user, betAmount, multiplier, mode]);

  // Update seeds
  const updateSeeds = useCallback(async (clientSeed) => {
    if (!socket || !connected || !user) {
      throw new Error('Not connected or not authenticated');
    }

    return new Promise((resolve, reject) => {
      socket.emit('limbo-update-seeds', { userId: user._id, clientSeed }, (response) => {
        if (response.code === 0) {
          resolve(response.data);
        } else {
          setError(response.message);
          reject(new Error(response.message));
        }
      });
    });
  }, [socket, connected, user]);

  // Get game details
  const getGameDetails = useCallback((betId) => {
    if (!socket || !connected) {
      throw new Error('Not connected');
    }

    return new Promise((resolve, reject) => {
      socket.emit('limbo-game-details', { betId }, (response) => {
        if (response.code === 0) {
          resolve(response.data);
        } else {
          setError(response.message);
          reject(new Error(response.message));
        }
      });
    });
  }, [socket, connected]);

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