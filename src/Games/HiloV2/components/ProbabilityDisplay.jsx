import React from 'react';
import { formatPercentage } from '../utils/cardUtils';

const ProbabilityDisplay = ({ 
  higherProbability, 
  lowerProbability, 
  currentMultiplier, 
  potentialWin 
}) => {
  return (
    <div className="probability-display bg-gray-800 p-4 rounded-lg mt-4">
      <div className="flex justify-between mb-2">
        <div className="text-center">
          <div className="text-gray-400 text-xs">Higher</div>
          <div className="text-white font-bold">{formatPercentage(higherProbability)}</div>
        </div>
        
        <div className="text-center">
          <div className="text-gray-400 text-xs">Current Multiplier</div>
          <div className="text-white font-bold">{currentMultiplier.toFixed(2)}x</div>
        </div>
        
        <div className="text-center">
          <div className="text-gray-400 text-xs">Lower</div>
          <div className="text-white font-bold">{formatPercentage(lowerProbability)}</div>
        </div>
      </div>
      
      <div className="text-center bg-gray-700 py-2 rounded">
        <div className="text-gray-400 text-xs">Potential Win</div>
        <div className="text-green-400 font-bold">${potentialWin.toFixed(2)}</div>
      </div>
    </div>
  );
};

export default ProbabilityDisplay;