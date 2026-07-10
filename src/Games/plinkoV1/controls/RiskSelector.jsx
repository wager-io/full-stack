import React, { useState, useEffect } from 'react';

const RiskSelector = ({ plinkoGame }) => {
  const [riskValue, setRiskValue] = useState('Low');
  const [betting, setBetting] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [riskOptions, setRiskOptions] = useState(['Low', 'Medium', 'High']);
  
  // Initialize component data
  useEffect(() => {
    if (!plinkoGame) return;
    
    // Set initial values
    setRiskValue(
      plinkoGame.riskOptions?.find(v => v.value === plinkoGame.risk)?.label || 'Low'
    );
    
    // Handle game updates
    const handleGameUpdate = () => {
      setBetting(plinkoGame.isBetting || false);
      setInputDisabled(plinkoGame.walletManager?.current?.currencyName !== 'USDT' && 
                      plinkoGame.walletManager?.current?.currencyName !== 'Fun');
      setRiskValue(
        plinkoGame.riskOptions?.find(v => v.value === plinkoGame.risk)?.label || 'Low'
      );
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
  
  // Handle risk change
  const handleRiskChange = (value) => {
    if (plinkoGame && !betting && !inputDisabled) {
      plinkoGame.setRisk(
        plinkoGame.riskOptions.find(r => r.label === value)?.value || 1
      );
    }
  };

  return (
    <div className="selection-view risk-selector">
      <div className="selection-title">Risk</div>
      <div className="selection-options">
        {riskOptions.map((option) => (
          <button
            key={option}
            className={`selection-option ${riskValue === option ? 'active' : ''}`}
            disabled={betting || inputDisabled}
            onClick={() => handleRiskChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RiskSelector;