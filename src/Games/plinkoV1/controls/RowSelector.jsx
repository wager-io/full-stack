import React, { useState, useEffect } from 'react';

const RowSelector = ({ plinkoGame }) => {
  const [rowValue, setRowValue] = useState(8);
  const [betting, setBetting] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [rowOptions, setRowOptions] = useState([8, 9, 10, 11, 12, 13, 14, 15, 16]);
  
  // Initialize component data
  useEffect(() => {
    if (!plinkoGame) return;
    
    // Set initial values
    setRowValue(plinkoGame.rows || 8);
    
    // Handle game updates
    const handleGameUpdate = () => {
      setBetting(plinkoGame.isBetting || false);
      setInputDisabled(plinkoGame.walletManager?.current?.currencyName !== 'USDT' && 
                      plinkoGame.walletManager?.current?.currencyName !== 'Fun');
      setRowValue(plinkoGame.rows || 8);
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
  
  // Handle row change
  const handleRowChange = (value) => {
    if (plinkoGame && !betting && !inputDisabled) {
      plinkoGame.setRow(Number(value));
    }
  };

  return (
    <div className="selection-view row-selector">
      <div className="selection-title">Rows</div>
      <div className="selection-options">
        {rowOptions.map((option) => (
          <button
            key={option}
            className={`selection-option ${rowValue === option ? 'active' : ''}`}
            disabled={betting || inputDisabled}
            onClick={() => handleRowChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RowSelector;