import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useCrashGame } from './CrashContext';
import BetAmountInput from './components/BetAmountInput';
import AutoCashoutInput from './components/AutoCashoutInput';
import AutoBetSettings from './components/AutoBetSettings';
import ActionButton from './components/ActionButton';

const AutoBetForm = () => {
  // Get all state and methods from CrashContext
  const { 
    gameState, 
    betAmount,
    userBet,
    handlePlaceBet,
    // Auto betting state and methods
    isAutoBetting,
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
    startAutoBetting,
    stopAutoBetting,
    handleBetResult
  } = useCrashGame();
  
  // Place a bet - this function is called from the auto betting loop
  const placeBet = () => {
    // Use the handlePlaceBet function from the context
    handlePlaceBet(betAmount, autoCashout);
    
    // Increment bets placed
    setBetsPlaced(prev => prev + 1);
    
    // Decrement remaining bets if not infinite
    if (remainingBets > 0) {
      setRemainingBets(prev => prev - 1);
    }
  };
  
  // Auto betting loop - this is the core of the auto betting functionality
  useEffect(() => {
    // When auto betting starts, place the first bet
    if (isAutoBetting && gameState.status === 'starting' && remainingBets !== 0) {
      placeBet();
    }
    
    // When game crashes, handle the result and prepare for next round
    if (gameState.status === 'crashed' && isAutoBetting) {
      // Handle result of previous bet
      const won = userBet && gameState.multiplier >= userBet.autoCashout;
      if (userBet) {
        handleBetResult(won, userBet.amount, won ? userBet.autoCashout : 0);
      }
    }
    
  }, [gameState.status, isAutoBetting, userBet, remainingBets]);
  
  return (
    <div className="space-y-4">
      <BetAmountInput isDisabled={isAutoBetting} />
      
      <AutoCashoutInput 
        autoCashout={autoCashout}
        setAutoCashout={setAutoCashout}
        maxBets={maxBets}
        setMaxBets={setMaxBets}
        betAmount={betAmount}
        isDisabled={isAutoBetting}
      />
      
      <AutoBetSettings 
        stopOnProfit={stopOnProfit}
        setStopOnProfit={setStopOnProfit}
        stopOnLoss={stopOnLoss}
        setStopOnLoss={setStopOnLoss}
        onWin={onWin}
        setOnWin={setOnWin}
        onLoss={onLoss}
        setOnLoss={setOnLoss}
        winMultiplier={winMultiplier}
        setWinMultiplier={setWinMultiplier}
        lossMultiplier={lossMultiplier}
        setLossMultiplier={setLossMultiplier}
        betAmount={betAmount}
        autoCashout={autoCashout}
        isDisabled={isAutoBetting}
      />
    
      <ActionButton 
        isAutoBetting={isAutoBetting}
        gameStatus={gameState.status}
        betAmount={betAmount}
        startAutoBetting={startAutoBetting}
        stopAutoBetting={stopAutoBetting}
      />
    </div>
  );
};

export default AutoBetForm;