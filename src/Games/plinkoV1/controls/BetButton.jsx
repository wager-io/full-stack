import React, { useState, useEffect } from 'react';

const BetButton = ({ plinkoGame }) => {
  const [betting, setBetting] = useState(false);
  const [canBet, setCanBet] = useState(false);
  const [plinkoRunning, setPlinkoRunning] = useState(false);
  
  // Initialize component data
  useEffect(() => {
    if (!plinkoGame) return;
    
    // Handle game updates
    const handleGameUpdate = () => {
      setBetting(plinkoGame.isBetting || false);
      setCanBet(plinkoGame.canBet && 
                (plinkoGame.walletManager?.current?.currencyName === 'USDT' || 
                 plinkoGame.walletManager?.current?.currencyName === 'Fun'));
    };
    
    // Set up plinko running listener
    const handlePlinkoRunning = (running) => {
      setPlinkoRunning(running);
    };
    
    // Initial update
    handleGameUpdate();
    
    // Subscribe to updates
    plinkoGame.on('update', handleGameUpdate);
    if (plinkoGame.plinko) {
      plinkoGame.plinko.on('running', handlePlinkoRunning);
    }
    
    // Cleanup function
    return () => {
      plinkoGame.off('update', handleGameUpdate);
      if (plinkoGame.plinko) {
        plinkoGame.plinko.off('running', handlePlinkoRunning);
      }
    };
  }, [plinkoGame]);
  
  // Handle bet
  const handleBet = () => {
    if (canBet && plinkoGame && !betting && !plinkoRunning) {
      plinkoGame.handleBet().catch(err => {
        console.log('Bet error', err);
      });
    }
  };

  return (
    <button
      className={`bet-button ${betting || plinkoRunning ? 'disabled' : ''} ${canBet ? '' : 'inactive'}`}
      disabled={betting || plinkoRunning || !canBet}
      onClick={handleBet}
    >
      {betting ? 'Betting...' : 'Bet'}
    </button>
  );
};

export default BetButton;