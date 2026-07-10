import React, { useState, useEffect, useRef } from 'react';
import BetAmountInput from './BetAmountInput';
import RiskSelector from './RiskSelector';
import RowSelector from './RowSelector';

const AutoBetPanel = ({ plinkoGame }) => {
  const [autoBetting, setAutoBetting] = useState(false);
  const [autoBetInfo, setAutoBetInfo] = useState({ numberOfBets: 0 });
  const [canBet, setCanBet] = useState(false);
  
  const autoBetRef = useRef(null);
  
  // Initialize component data
  useEffect(() => {
    if (!plinkoGame) return;
    
    if (plinkoGame.autoBet) {
      autoBetRef.current = plinkoGame.autoBet;
      setAutoBetInfo({ numberOfBets: plinkoGame.autoBet.times || 0 });
    }
    
    // Handle game updates
    const handleGameUpdate = () => {
      setAutoBetting(plinkoGame.autoBet?.isRunning || false);
      setCanBet(plinkoGame.canBet && 
                (plinkoGame.walletManager?.current?.currencyName === 'USDT' || 
                 plinkoGame.walletManager?.current?.currencyName === 'Fun'));
    };
    
    // Initial update
    handleGameUpdate();
    
    // Subscribe to updates
    plinkoGame.on('update', handleGameUpdate);
    
    // Cleanup function
    return () => {
      plinkoGame.off('update', handleGameUpdate);
    };
  }, [plinkoGame]);
  
  // Handle auto bet
  const handleAutoBet = () => {
    if (plinkoGame) {
      plinkoGame.toggleAutoBet();
    }
  };
  
  // Update auto bet info
  const updateAutoBetInfo = (field, value) => {
    setAutoBetInfo(prev => ({ ...prev, [field]: value }));
    
    if (plinkoGame && plinkoGame.autoBet) {
      plinkoGame.autoBet[field] = value;
    }
  };

  return (
    <div className="bet-control-auto">
      <BetAmountInput plinkoGame={plinkoGame} />
      <RiskSelector plinkoGame={plinkoGame} />
      <RowSelector plinkoGame={plinkoGame} />
      
      <div className="auto-bet-settings">
        <div className="auto-bet-input">
          <label>Number of Bets</label>
          <input
            type="number"
            min="1"
            max="1000"
            value={autoBetInfo.numberOfBets}
            onChange={(e) => updateAutoBetInfo('numberOfBets', parseInt(e.target.value) || 0)}
            disabled={autoBetting}
          />
        </div>
      </div>
      
      <button
        className={`auto-bet-button ${autoBetting ? 'active' : ''} ${canBet ? '' : 'inactive'}`}
        disabled={!canBet}
        onClick={handleAutoBet}
      >
        {autoBetting ? 'Stop Auto Bet' : 'Start Auto Bet'}
      </button>
    </div>
  );
};

export default AutoBetPanel;