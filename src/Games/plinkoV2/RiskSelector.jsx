// If you have a separate component for risk selection
import React from 'react';
import { usePlinkoGame } from './PlinkoContext';

const RiskSelector = () => {
  const { risk, changeRisk } = usePlinkoGame();
  
  // Map numeric risk values to display names
  const riskLabels = {
    1: 'Low',
    2: 'Medium',
    3: 'High'
  };
  
  return (
    <div className="risk-selector">
      <div className="risk-label">Risk:</div>
      <div className="risk-buttons">
        {Object.entries(riskLabels).map(([value, label]) => (
          <button
            key={value}
            className={`risk-btn ${risk === Number(value) ? 'active' : ''}`}
            onClick={() => changeRisk(Number(value))}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RiskSelector;