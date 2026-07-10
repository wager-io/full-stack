import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { serverUrl } from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';

// Create context
const PlinkoContext = createContext();

// Custom hook to use the context
export const usePlinkoGame = () => useContext(PlinkoContext);

// Provider component
export const PlinkoGameProvider = ({ children }) => {
   const { user, setBalance, balance } = useContext(AuthContext);
  
  // Socket connection
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  
  // Game state
  const [gameState, setGameState] = useState('idle'); // idle, rolling, finished
  const [currentBall, setCurrentBall] = useState(null);
  const [recentBets, setRecentBets] = useState([]);
  const [myBets, setMyBets] = useState([]);
  const [allBets, setAllBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Game configuration
  const [rows, setRows] = useState(8);
  const [risk, setRisk] = useState('medium'); // low, medium, high
  const [betAmount, setBetAmount] = useState(1);
  const [payouts, setPayouts] = useState([]);

  
  // Initialize payouts based on risk level
  useEffect(() => {
    switch (risk) {
      case 'low':
        setPayouts([1.5, 1.2, 1, 0.8, 0.7, 0.5, 0.7, 0.8, 1, 1.2, 1.5, 2, 3, 5, 9, 17, 30]);
        break;
      case 'medium':
        setPayouts([3, 1.5, 1.2, 0.5, 0.3, 0.2, 0.5, 1.2, 1.5, 3, 5, 9, 15, 30, 50]);
        break;
      case 'high':
        setPayouts([5, 2, 1, 0.2, 0.1, 0, 0.1, 0.2, 1, 2, 5, 10, 20, 40, 100, 170]);
        break;
      default:
        setPayouts([3, 1.5, 1.2, 0.5, 0.3, 0.2, 0.5, 1.2, 1.5, 3, 5, 9, 15, 30, 50]);
    }
  }, [risk, rows]);
  
  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(serverUrl());
    
    socketInstance.on('connect', () => {
      console.log('Connected to plinko socket server');
      setConnected(true);
      
      // Initialize game data
      socketInstance.emit('plinko-init', user, (response) => {
        if (response.code === 0) {
          if (user) {
            setMyBets(response.data.betLogs || []);
          }
          setAllBets(response.data.betLogs || []);
          setRecentBets(response.data.betLogs || []);
        } else {
          setError(response.message);
        }
        setLoading(false);
      });
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from plinko socket server');
      setConnected(false);
    });

    socketInstance.on('plinkoBet', (bet) => {
        console.log('On bet => ', bet);
      // Add to all bets
    //   setAllBets(prevBets => [bet, ...prevBets.slice(0, 49)]);
      
      // Add to my bets if it's the current user's bet
    //   if (user && bet.userId === user._id) {
    //     setMyBets(prevBets => [bet, ...prevBets.slice(0, 49)]);
    //     setRecentBets(prevBets => [bet, ...prevBets.slice(0, 8)]);
    //   }
    });

    socketInstance.on('plinko-wallet', ([walletData]) => {
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

    setGameState('rolling'); // Set state to rolling immediately
    
    const betData = {
      _id: user._id,
      name: user.username,
      hidden: user.hidden_from_public || false,
      avatar: user.profile_image || '',
      betAmount: betAmount,
      currencyName: 'USD',
      currencyImage: '/assets/token/usdt.png',
        betValue: {
            risk: risk === 'low' ? 1 : risk === 'medium' ? 2 : 3, // Ensure consistent casing
            rows: rows
        },
      rows: rows
    };

    socket.emit('plinko-bet', betData, (response) => {
      if (response.code === 0) {
        console.log("Bet successful, response:", response.data);
        
        // Make sure the path is properly formatted
        const pathArray = typeof response.data.gameValue.path === 'string' 
          ? response.data.gameValue.path.split('').map(Number) 
          : response.data.gameValue.path;
        
        setCurrentBall({
          path: pathArray,
          multiplier: response.data.odds,
          won: response.data.winAmount > 0
        });
        
        // Don't reset game state yet - wait for animation to complete
        
        // Add to recent bets after animation completes
        setTimeout(() => {
          setRecentBets(prev => [response.data, ...prev].slice(0, 10));
          setGameState('idle'); // Reset state after animation
        }, 5000); // Adjust timing based on your animation duration
      } else {
        setError(response.message);
        setGameState('idle'); // Reset state on error
      }
    });
  }, [socket, connected, gameState, user, betAmount, risk, rows]);
  
  // Update seeds
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
  
  // Get game details
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
    });
  }, [socket, connected]);
  
  // Change risk level
  const changeRisk = (newRisk) => {
    setRisk(newRisk.toLowerCase()); 
  };

  const changeRows = useCallback((newRows) => {
    if (newRows >= 8 && newRows <= 16) { // Ensure rows are within valid range
        setRows(newRows);
    }
    }, []);
  
  // Context value
  const value = {
    connected,
    loading,
    error,
    recentBets,
    myBets,
    allBets,
    balance,
    gameState,
    currentBall,
    rows,
    risk,
    betAmount,
    setBetAmount,
    payouts,
    changeRisk,
    placeBet,
    updateSeeds,
    getGameDetails,
    user,
    changeRows,
  };

  return (
    <PlinkoContext.Provider value={value}>
      {children}
    </PlinkoContext.Provider>
  );
};

export default PlinkoContext;
