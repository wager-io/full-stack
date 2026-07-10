import React, { useState, useEffect } from 'react';
import { usePlinkoGame } from './context/PlinkoContext';
import Decimal from 'decimal.js';

const GameControls = () => {
  const { plinkoGame, balance } = usePlinkoGame();
  const [betAmount, setBetAmount] = useState('1.00');
  const [rows, setRows] = useState(16);
  const [risk, setRisk] = useState(2); // 1=low, 2=medium, 3=high
  const [isBetting, setIsBetting] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [autoCount, setAutoCount] = useState(0);
  const [remainingAuto, setRemainingAuto] = useState(0);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  
  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Initialize controls from game settings
  useEffect(() => {
    if (!plinkoGame) return;
    
    const unsubscribe = plinkoGame.settings.subscribe(() => {
      setRows(plinkoGame.rows);
      setRisk(plinkoGame.risk);
    });
    
    return () => unsubscribe();
  }, [plinkoGame]);
  
  // Handle bet amount change
  const handleBetAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setBetAmount(value);
    }
  };
  
  // Handle rows change
  const handleRowsChange = (newRows) => {
    if (!plinkoGame) return;
    setRows(newRows);
    plinkoGame.setRows(newRows);
  };
  
  // Handle risk change
  const handleRiskChange = (newRisk) => {
    if (!plinkoGame) return;
    setRisk(newRisk);
    plinkoGame.setRisk(newRisk);
  };
  
  // Handle bet button click
  const handleBet = async () => {
    if (!plinkoGame || isBetting || !betAmount) return;
    
    try {
      setIsBetting(true);
      
      // Convert bet amount to Decimal
      const amount = new Decimal(betAmount);
      
      // Check if bet amount is valid
      if (amount.lte(0)) {
        alert('Please enter a valid bet amount');
        setIsBetting(false);
        return;
      }
      
      // Check if user has enough balance
      if (amount.gt(balance)) {
        alert('Insufficient balance');
        setIsBetting(false);
        return;
      }
      
      // Place the bet
      await plinkoGame.bet(amount);
      
      // Drop the ball in the Matter.js simulation
      if (plinkoGame.matterDropBall) {
        plinkoGame.matterDropBall();
      }
      
      // Handle auto mode
      if (autoMode && remainingAuto > 0) {
        setRemainingAuto(prev => prev - 1);
      }
      
    } catch (error) {
      console.error('Bet error:', error);
      alert(`Error placing bet: ${error.message}`);
    } finally {
      setIsBetting(false);
    }
  };
  
  // Handle auto mode toggle
  const handleAutoModeToggle = () => {
    if (autoMode) {
      // Stop auto mode
      setAutoMode(false);
      setRemainingAuto(0);
    } else {
      // Start auto mode
      setAutoMode(true);
      setRemainingAuto(autoCount);
    }
  };
  
  // Handle auto count change
  const handleAutoCountChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setAutoCount(value);
      if (autoMode) {
        setRemainingAuto(value);
      }
    }
  };
  
  // Run auto betting
  useEffect(() => {
    if (autoMode && remainingAuto > 0 && !isBetting) {
      const timer = setTimeout(() => {
        handleBet();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [autoMode, remainingAuto, isBetting]);
  
  // Bet amount quick actions
  const halfBetAmount = () => {
    try {
      const amount = new Decimal(betAmount);
      setBetAmount(amount.dividedBy(2).toFixed(2));
    } catch (error) {
      setBetAmount('0.50');
    }
  };
  
  const doubleBetAmount = () => {
    try {
      const amount = new Decimal(betAmount);
      setBetAmount(amount.times(2).toFixed(2));
    } catch (error) {
      setBetAmount('2.00');
    }
  };
  
  return (
    <div 
      id="Plinko-control-0" 
      className={`game-control ${screenWidth < 1200 ? 'mobile-view' : 'style0'}`}
    >
      <div className="game-controls">
        <div className="control-section">
          <div className="control-label">Bet Amount</div>
          <div className="bet-amount-control">
            <button onClick={halfBetAmount} className="bet-action-btn">½</button>
            <input
              type="text"
              value={betAmount}
              onChange={handleBetAmountChange}
              className="bet-amount-input"
            />
            <button onClick={doubleBetAmount} className="bet-action-btn">2×</button>
          </div>
        </div>
        
        <div className="control-section">
          <div className="control-label">Rows</div>
          <div className="rows-control">
            {[8, 12, 16].map(rowOption => (
              <button
                key={rowOption}
                onClick={() => handleRowsChange(rowOption)}
                className={`row-btn ${rows === rowOption ? 'active' : ''}`}
              >
                {rowOption}
              </button>
            ))}
          </div>
        </div>
        
        <div className="control-section">
          <div className="control-label">Risk</div>
          <div className="risk-control">
            {[
              { value: 1, label: 'Low' },
              { value: 2, label: 'Medium' },
              { value: 3, label: 'High' }
            ].map(riskOption => (
              <button
                key={riskOption.value}
                onClick={() => handleRiskChange(riskOption.value)}
                className={`risk-btn ${risk === riskOption.value ? 'active' : ''}`}
              >
                {riskOption.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="control-section">
          <div className="auto-bet-control">
            <div className="auto-toggle">
              <input
                type="checkbox"
                id="auto-toggle"
                checked={autoMode}
                onChange={handleAutoModeToggle}
              />
              <label htmlFor="auto-toggle">Auto</label>
            </div>
            
            {autoMode && (
              <div className="auto-count">
                <input
                  type="number"
                  value={autoCount}
                  onChange={handleAutoCountChange}
                  min="1"
                  className="auto-count-input"
                />
                <div className="remaining-count">
                  Remaining: {remainingAuto}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={handleBet}
          disabled={isBetting}
          className={`bet-button ${isBetting ? 'betting' : ''}`}
        >
          {isBetting ? 'Betting...' : 'Bet'}
        </button>
      </div>
    </div>
  );
};

export default GameControls;
