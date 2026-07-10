  import React, { createContext, useContext, useState, useEffect } from 'react';
  import { AuthContext } from '../../context/AuthContext';
  import useSocketConnection from './hooks/useSocketConnection';
  import { toast } from 'sonner';
  const CrashGameContext = createContext();

  export const CrashGameProvider = ({ children }) => {
    // Get user and balance from AuthContext
    const { user, balance, setBalance } = useContext(AuthContext);
  
    const [gameState, setGameState] = useState({
      status: 'waiting', // waiting, starting, running, crashed
      multiplier: 1,
      crashPoint: 0,
      timeLeft: 0,
      gameId: 0,
      hash: ''
    });
  
    const [bets, setBets] = useState([]);
    const [history, setHistory] = useState([]);
    const [userBet, setUserBet] = useState(null);
    const [betAmount, setBetAmount] = useState('10'); // Initialize as string
  
    // Auto betting state
    const [isAutoBetting, setIsAutoBetting] = useState(false);
    const [betsPlaced, setBetsPlaced] = useState(0);
    const [remainingBets, setRemainingBets] = useState(0);
    const [maxBets, setMaxBets] = useState(10);
    const [autoCashout, setAutoCashout] = useState(2.00);
    const [stopOnProfit, setStopOnProfit] = useState(100);
    const [stopOnLoss, setStopOnLoss] = useState(50);
    const [onWin, setOnWin] = useState('reset'); // 'reset', 'increase'
    const [onLoss, setOnLoss] = useState('reset'); // 'reset', 'increase'
    const [winMultiplier, setWinMultiplier] = useState(1.5);
    const [lossMultiplier, setLossMultiplier] = useState(2);
    const [totalProfit, setTotalProfit] = useState(0);
    const [originalBetAmount, setOriginalBetAmount] = useState(betAmount);
  
    // Reset bet amount if it's higher than balance when user or balance changes
    useEffect(() => {
      if (user && balance && betAmount > balance) {
        setBetAmount(Math.min(balance, 10)); // Set to balance or default of 10, whichever is lower
      }
    }, [user, balance, betAmount]);
  
    // Connect to socket using the custom hook - now with all the handlers moved there
    const { socketRef, handlePlaceBet, handleCashout } = useSocketConnection({
      user,
      balance,
      setBalance,
      gameState,
      setGameState,
      setBets,
      setHistory,
      userBet,
      setUserBet
    });
  
    // Auto betting methods
    const startAutoBetting = () => {
      if (gameState.status !== 'starting') {
        toast.error('Wait for the next round to start auto betting', {
          description: 'Auto betting can only start before a round begins'
        });
        return;
      }
    
      if (betAmount <= 0) {
        toast.error('Invalid bet amount', {
          description: 'Bet amount must be greater than 0'
        });
        return;
      }
    
      if (betAmount > balance) {
        toast.error('Insufficient balance', {
          description: `Your balance: ${balance.toFixed(2)} USDT`
        });
        return;
      }
    
      if (autoCashout < 1.01) {
        toast.error('Invalid auto cashout', {
          description: 'Auto cashout must be at least 1.01x'
        });
        return;
      }
    
      setIsAutoBetting(true);
      setBetsPlaced(0);
      setTotalProfit(0);
      setOriginalBetAmount(betAmount);
    
      // Set remaining bets - if maxBets is 0, we'll use -1 to indicate infinite bets
      setRemainingBets(maxBets > 0 ? maxBets : -1);
    };
  
    const stopAutoBetting = () => {
      setIsAutoBetting(false);
      setRemainingBets(0);
      toast.info('Auto betting stopped');
    };
  
    const handleBetResult = (won, amount, multiplier) => {
      const profit = won ? amount * multiplier - amount : -amount;
      setTotalProfit(prev => prev + profit);
    
      // Check stop conditions
      if (maxBets === 0) {
        stopAutoBetting();
        toast.info(`Auto betting stopped: Reached maximum number of bets (${maxBets})`);
        return;
      }
    
      if (stopOnProfit > 0 && totalProfit >= stopOnProfit) {
        stopAutoBetting();
        toast.success(`Auto betting stopped: Reached profit target of ${stopOnProfit} USDT`);
        return;
      }
    
      if (stopOnLoss > 0 && totalProfit <= -stopOnLoss) {
        stopAutoBetting();
        toast.error(`Auto betting stopped: Reached loss limit of ${stopOnLoss} USDT`);
        return;
      }
    
      // Adjust bet amount based on result
      if (won) {
        if (onWin === 'reset') {
          setBetAmount(originalBetAmount);
        } else if (onWin === 'increase') {
          setBetAmount(prev => Math.max(1, Math.floor(prev * winMultiplier)));
        }
      } else {
        if (onLoss === 'reset') {
          setBetAmount(originalBetAmount);
        } else if (onLoss === 'increase') {
          setBetAmount(prev => Math.max(1, Math.floor(prev * lossMultiplier)));
        }
      }
    };
  
    return (
      <CrashGameContext.Provider value={{
        gameState,
        setGameState,
        bets,
        setBets,
        history,
        setHistory,
        userBet,
        setUserBet,
        betAmount,
        setBetAmount,
        handlePlaceBet,
        handleCashout,
        socketRef,
        // Auto betting state and methods
        isAutoBetting,
        setIsAutoBetting,
        betsPlaced,
        setBetsPlaced,
        remainingBets,
        setRemainingBets,
        maxBets,
        setMaxBets,
        autoCashout,
        setAutoCashout,
        stopOnProfit,
        setStopOnProfit,
        stopOnLoss,
        setStopOnLoss,
        onWin,
        setOnWin,
        onLoss,
        setOnLoss,
        winMultiplier,
        setWinMultiplier,
        lossMultiplier,
        setLossMultiplier,
        totalProfit,
        setTotalProfit,
        originalBetAmount,
        setOriginalBetAmount,
        startAutoBetting,
        stopAutoBetting,
        handleBetResult
      }}>
        {children}
      </CrashGameContext.Provider>
    );
  };

  export const useCrashGame = () => useContext(CrashGameContext);
