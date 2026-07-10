import React, { useState } from 'react';
import { usePlinkoGame } from './PlinkoContext';

const GameControls = () => {
  const { 
    betAmount, 
    setBetAmount, 
    risk, 
    changeRisk, 
    rows,
    changeRows,
    placeBet, 
    gameState,
    balance
  } = usePlinkoGame();
  
  const [isManualInput, setIsManualInput] = useState(false);
  
  // Handle bet amount change
  const handleBetAmountChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setBetAmount(value);
    } else if (e.target.value === '') {
      setBetAmount('');
    }
  };
  
  // Handle bet amount buttons
  const adjustBetAmount = (multiplier) => {
    const currentAmount = parseFloat(betAmount) || 0;
    setBetAmount(Math.max(0.1, currentAmount * multiplier).toFixed(2));
  };
  
  // Calculate potential profit
  const calculateProfit = () => {
    // Get the maximum payout based on risk level
    const maxPayouts = {
      'low': 5.6,
      'medium': 13,
      'high': 29
    };
    
    return ((betAmount || 0) * (maxPayouts[risk] || maxPayouts.medium)).toFixed(2);
  };
  
  // Available row options
  const rowOptions = [8, 9, 10, 11, 12, 13, 14, 15, 16];
  
  return (
    <div className="p-6 bg-gray-800 rounded-b-lg">
      <div className="flex flex-col gap-6">
        {/* Bet amount section */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Bet Amount</label>
          <div className="relative">
            <input
              type="text"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
              value={betAmount}
              onChange={handleBetAmountChange}
              onFocus={() => setIsManualInput(true)}
              onBlur={() => setIsManualInput(false)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-400">USD</span>
            </div>
          </div>
          
          {/* Bet amount quick buttons */}
          <div className="grid grid-cols-4 gap-2 mt-2">
            <button 
              onClick={() => adjustBetAmount(0.5)} 
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded py-1 text-sm"
            >
              1/2
            </button>
            <button 
              onClick={() => adjustBetAmount(2)} 
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded py-1 text-sm"
            >
              2x
            </button>
            <button 
              onClick={() => setBetAmount((balance || 0).toFixed(2))} 
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded py-1 text-sm"
            >
              Max
            </button>
            <button 
              onClick={() => setBetAmount(0.1)} 
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded py-1 text-sm"
            >
              Min
            </button>
          </div>
        </div>
        
        {/* Risk and Rows section */}
        <div className="grid grid-cols-2 gap-4">
          {/* Risk selector */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Risk</label>
            <div className="risk-selector">
              <button 
                className={`risk-btn ${risk === 1 ? 'active' : ''}`} 
                onClick={() => changeRisk(1)}
              >
                Low
              </button>
              <button 
                className={`risk-btn ${risk === 2 ? 'active' : ''}`} 
                onClick={() => changeRisk(2)}
              >
                Medium
              </button>
              <button 
                className={`risk-btn ${risk === 3 ? 'active' : ''}`} 
                onClick={() => changeRisk(3)}
              >
                High
              </button>
            </div>
          </div>
          
          {/* Rows dropdown */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Rows</label>
            <select
              value={rows}
              onChange={(e) => changeRows(parseInt(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              {rowOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Risk level visualization */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Risk Level</span>
            <span className={`text-sm font-medium ${
              risk === 'low' ? 'text-green-500' : 
              risk === 'medium' ? 'text-yellow-500' : 
              'text-red-500'
            }`}>
              {risk.charAt(0).toUpperCase() + risk.slice(1)}
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                risk === 'low' ? 'bg-green-500' : 
                risk === 'medium' ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}
              style={{ width: risk === 'low' ? '33%' : risk === 'medium' ? '66%' : '100%' }}
            ></div>
          </div>
        </div>
        
        {/* Potential profit */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Potential profit:</span>
          <span className="text-green-500 font-medium">${calculateProfit()}</span>
        </div>
      </div>
      
      {/* Bet button */}
      <div className="mt-6">
        <button 
          onClick={placeBet}
          disabled={gameState === 'rolling'}
          className={`w-full py-4 rounded-lg font-bold text-lg ${
            gameState === 'rolling'
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {gameState === 'rolling' ? 'Rolling...' : 'Bet'}
        </button>
      </div>
    </div>
  );
};
export default GameControls;