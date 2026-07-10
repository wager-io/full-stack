import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import PlinkoGame from './logics/PlinkoGame';

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
        const gameInstance = new PlinkoGame();
        await gameInstance.initialize();
        
        // Set the balance context in the game instance
        gameInstance.setBalanceContext({
          balance,
          setBalance: updateBalance
        });
        
        setPlinkoGame(gameInstance);
        setGameInit(true);
      } catch (error) {
        console.log('Error init game ', error);
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
        plinkoGame.deactivate();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update game's balance context when balance changes
  useEffect(() => {
    if (plinkoGame) {
      plinkoGame.setBalanceContext({
        balance,
        setBalance: updateBalance
      });
    }
  }, [balance, updateBalance, plinkoGame]);

  // Context value
  const value = {
    plinkoGame,
    liveStats,
    error,
    gameInit,
    screen,
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