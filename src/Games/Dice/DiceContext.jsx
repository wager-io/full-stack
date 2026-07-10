import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../../context/AuthContext';
import { serverUrl } from '../../utils/api';

// Create context
const DiceContext = createContext();

// Custom hook to use the context
export const useDiceGame = () => useContext(DiceContext);

// Provider component
export const DiceGameProvider = ({ children }) => {
  const { user, balance, setBalance } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [recentBets, setRecentBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameState, setGameState] = useState('idle'); // idle, rolling, finished
  const [lastRoll, setLastRoll] = useState(null);
  const [showResult, setShowResult] = useState(false)
  // Game configuration
  const [betAmount, setBetAmount] = useState(1);
  const [target, setTarget] = useState(50);
  const [mode, setMode] = useState('under'); // 'over' or 'under'

  // Calculate win chance and multiplier
  const winChance = mode === 'over' ? (100 - target) : target;
  const multiplier = parseFloat((99 / winChance).toFixed(2));

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(serverUrl());

    socketInstance.on('connect', () => {
      console.log('[DiceContext] Connected to Dice socket server');
      setConnected(true);

      // Initialize game data
      console.log('[DiceContext] Initializing game with user:', user?.username || 'Guest');
      socketInstance.emit('dice-init', user, (response) => {
        console.log('[DiceContext] dice-init response:', response);
        if (response.code === 0) {
          setRecentBets(!user ? [] : response.data.betLogs.filter(bet => bet.user_id === user._id));
        } else {
          console.error('[DiceContext] dice-init error:', response.message);
          setError(response.message);
        }
        setLoading(false);
      });
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from Dice socket server');
      setConnected(false);
    });

    socketInstance.on('diceBet', (bet) => {
      if (!user) return
      if (bet.userId !== user._id) return
      setRecentBets(prevBets => [bet, ...prevBets.slice(0, 10)]);
    });

    socketInstance.on('dice-wallet', ([walletData]) => {
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
        target: target,
        mode: mode
      }
    };

    socket.emit('dice-bet', betData, (response) => {
      if (response.code === 0) {
        setLastRoll(response.data);
        setShowResult(true)
      } else {
        setError(response.message);
      }
      setGameState('finished');

      // Reset after a short delay
      setTimeout(() => {
        setGameState('idle');
        setShowResult(false)
      }, 4000);
    });
  }, [socket, connected, gameState, user, betAmount, target, mode]);

  // Update seeds
  const updateSeeds = useCallback(async (clientSeed) => {
    if (!socket || !connected || !user) {
      throw new Error('Not connected or not authenticated');
    }

    return new Promise((resolve, reject) => {
      socket.emit('dice-update-seeds', { userId: user._id, clientSeed }, (response) => {
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
      socket.emit('dice-game-details', { betId }, (response) => {
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
    user
  };

  return (
    <DiceContext.Provider value={value}>
      {children}
    </DiceContext.Provider>
  );
};

export default DiceContext;