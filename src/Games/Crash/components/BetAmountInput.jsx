import React from 'react';
import { FaCoins } from 'react-icons/fa';
import { useCrashGame } from '../CrashContext';

const BetAmountInput = ({ isDisabled = false }) => {
  // Get betAmount and setBetAmount directly from context
  const { betAmount, setBetAmount } = useCrashGame();

  const handleHalfAmount = () => {
    setBetAmount(prevAmount => Math.max(0, Math.floor(prevAmount / 2)));
  };
  
  const handleDoubleAmount = () => {
    const currentAmount = Number(betAmount);
    const doubledAmount = currentAmount * 2;
    setBetAmount(doubledAmount);
  };

  return (
    <div className="bg-gray-800 bg-opacity-50">
      <label className="flex items-center text-sm mb-2 text-gray-300">
        <FaCoins className="mr-2 text-yellow-500" />
        Bet Amount
      </label>
      <div className="relative flex items-center">
        <div className="absolute left-3 flex items-center pointer-events-none">
          <img 
            src="/assets/token/usdt.png" 
            alt="USDT" 
            className="w-5 h-5 mr-1" 
          />
        </div>
        <input 
          type="text" 
          onChange={(e) => {
            // Handle empty input case
            if (e.target.value === '') {
              setBetAmount(''); // Allow empty string
            } else {
              // Only update if it's a valid number
              const value = parseFloat(e.target.value)
              if (!isNaN(value)) {
                setBetAmount(value)
              }
            }
          }}
          placeholder='0.00'
          value={betAmount === '' ? '' : betAmount}
          className="w-full p-3 pl-10 pr-28 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          disabled={isDisabled}
        />
        <div className="absolute right-2 flex space-x-2">
          <button 
            onClick={handleHalfAmount}
            className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded text-sm font-medium transition-colors flex items-center"
            title="Half amount"
            disabled={isDisabled}
          >
            <span>½</span>
          </button>
          <button 
            onClick={handleDoubleAmount}
            className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded text-sm font-medium transition-colors flex items-center"
            title="Double amount"
            disabled={isDisabled}
          >
            <span>2×</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BetAmountInput;