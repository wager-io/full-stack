import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import Plinko from '../logics/Plinko';

// Create context
const PlinkoContext = createContext();

// Custom hook to use the context
export const usePlinkoGame = () => useContext(PlinkoContext);

// Provider component
export const PlinkoGameProvider = ({ children }) => {
  const { user, balance: authBalance, setBalance: setAuthBalance } = useContext(AuthContext);
  const [plinkoGame, setPlinkoGame] = useState(null);
  const [liveStats, setLiveStats] = useState(null);
  const [error, setError] = useState('');
  const [gameInit, setGameInit] = useState(false);
  const [screen, setScreenWidth] = useState(window.innerWidth);
  const [balance, setBalance] = useState(authBalance || 0);
  const [gameConfig, setGameConfig] = useState({
    rows: 8,
    risk: 1,
    isFast: false
  });

  // Sync balance with auth context
  useEffect(() => {
    if (authBalance !== undefined) {
      setBalance(authBalance);
    }
  }, [authBalance]);

  // Update auth context when balance changes
  const updateBalance = useCallback((newBalanceOrFn) => {
    if (typeof newBalanceOrFn === 'function') {
      setBalance(prevBalance => {
        const newBalance = newBalanceOrFn(prevBalance);
        setAuthBalance(newBalance);
        return newBalance;
      });
    } else {
      setBalance(newBalanceOrFn);
      setAuthBalance(newBalanceOrFn);
    }
  }, [setAuthBalance]);

  // Initialize the game
  useEffect(() => {
    const initGame = async () => {
      try {
        // Define default payouts
        const defaultPayouts = {
          1: {
            8: [5.6, 2.1, 1.5, 1.1, 0.9, 1.1, 1.5, 2.1, 5.6],
            9: [7.1, 3.2, 1.8, 1.3, 1.0, 1.0, 1.3, 1.8, 3.2, 7.1],
            10: [8.9, 4.0, 2.2, 1.5, 1.1, 0.9, 1.1, 1.5, 2.2, 4.0, 8.9],
            11: [10, 5.0, 2.7, 1.7, 1.2, 1.0, 1.0, 1.2, 1.7, 2.7, 5.0, 10],
            12: [13, 6.2, 3.3, 2.0, 1.4, 1.1, 0.9, 1.1, 1.4, 2.0, 3.3, 6.2, 13],
            13: [16, 7.9, 4.2, 2.4, 1.6, 1.2, 1.0, 1.0, 1.2, 1.6, 2.4, 4.2, 7.9, 16],
            14: [21, 9.8, 5.2, 2.9, 1.9, 1.3, 1.1, 0.9, 1.1, 1.3, 1.9, 2.9, 5.2, 9.8, 21],
            15: [26, 12, 6.4, 3.5, 2.2, 1.5, 1.2, 1.0, 1.0, 1.2, 1.5, 2.2, 3.5, 6.4, 12, 26],
            16: [33, 15, 7.9, 4.3, 2.6, 1.8, 1.3, 1.1, 0.9, 1.1, 1.3, 1.8, 2.6, 4.3, 7.9, 15, 33]
          },
          2: {
            8: [13, 3.5, 1.6, 0.7, 0.4, 0.7, 1.6, 3.5, 13],
            9: [19, 5.0, 2.0, 0.9, 0.5, 0.5, 0.9, 2.0, 5.0, 19],
            10: [27, 7.1, 2.5, 1.1, 0.6, 0.3, 0.6, 1.1, 2.5, 7.1, 27],
            11: [40, 10, 3.3, 1.4, 0.7, 0.4, 0.4, 0.7, 1.4, 3.3, 10, 40],
            12: [58, 14, 4.3, 1.7, 0.8, 0.5, 0.2, 0.5, 0.8, 1.7, 4.3, 14, 58],
            13: [88, 21, 5.9, 2.2, 1.0, 0.5, 0.3, 0.3, 0.5, 1.0, 2.2, 5.9, 21, 88],
            14: [130, 31, 8.1, 2.9, 1.2, 0.6, 0.3, 0.2, 0.3, 0.6, 1.2, 2.9, 8.1, 31, 130],
            15: [200, 46, 11, 3.7, 1.5, 0.7, 0.4, 0.2, 0.2, 0.4, 0.7, 1.5, 3.7, 11, 46, 200],
            16: [310, 68, 16, 4.9, 1.9, 0.9, 0.5, 0.3, 0.1, 0.3, 0.5, 0.9, 1.9, 4.9, 16, 68, 310]
          }
        };

        // Create a game object that will be passed to Plinko
        const gameObject = {
          amount: { 
            mul: (val) => {
              // Simple multiplication function that returns a string
              return (parseFloat(val) * balance).toFixed(2);
            }
          },
          currencyName: 'USD',
          sounds: {
            playSound: (sound, options = {}) => {
              // Implement sound playing logic or use a dummy function
              console.log(`Playing sound: ${sound} with volume: ${options.volume || 1}`);
            }
          }
        };

        // Create the Plinko game
        const plinkoInstance = new Plinko(
          gameObject,
          gameConfig.rows,
          gameConfig.risk,
          defaultPayouts,
          gameConfig.isFast,
          window.innerWidth < 768 ? window.innerWidth * 0.9 : 700,
          400
        );

        // Set the game instance
        setPlinkoGame(plinkoInstance);
        setGameInit(true);
      } catch (error) {
        console.error('Error init game ', error);
        setError('Failed to initialize game');
      }
    };
    
    initGame();
    
    // Handle screen resize
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup on unmount
    return () => {
      if (plinkoGame) {
        plinkoGame.destroy();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Context value
  const value = {
    plinkoGame,
    liveStats,
    error,
    gameInit,
    screen,
    gameConfig,
    setError,
    user,
    balance,
    setBalance: updateBalance,
  };

  return (
    <PlinkoContext.Provider value={value}>
      {children}
    </PlinkoContext.Provider>
  );
};

export default PlinkoContext;
