import React from 'react';
import { FaRobot } from 'react-icons/fa';

const AutoCashoutInput = ({ 
  autoCashout, 
  setAutoCashout, 
  maxBets,
  setMaxBets,
  betAmount = 0,
  isDisabled = false 
}) => {
  // Calculate potential profit
  const calculateProfit = () => {
    if (!betAmount || !autoCashout) return 0;
    const profit = betAmount * autoCashout 
    return profit.toFixed(2);
  };

  return (
    <div className="bg-gray-800 bg-opacity-50">
      <div className="grid grid-cols-2 gap-3">
        {/* Auto Cashout Input */}
        <div>
          <label className="flex items-center text-sm mb-2 text-gray-300">
            <FaRobot className="mr-2 text-blue-400" />
            Auto Cashout
          </label>
          <div className="relative">
            <div className="absolute left-3 flex items-center pointer-events-none text-gray-400">
              <span>×</span>
            </div>
            <input 
              type="number" 
              value={autoCashout}
              onChange={(e) => setAutoCashout(Number(e.target.value))}
              min="1.01"
              step="0.01"
              className="w-full p-3 pl-8 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              disabled={isDisabled}
            />
          </div>
        </div>
        
        {/* Number of Bets Input */}
        <div>
          <label className="text-sm mb-2 text-gray-300 block">
            Number of Bets
          </label>
          <div className="relative">
            <input 
              type="number" 
              value={maxBets}
              onChange={(e) => setMaxBets(Number(e.target.value))}
              min="0"
              step="1"
              placeholder="0 = ∞"
              className="w-full p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              disabled={isDisabled}
            />
          </div>
        </div>
      </div>
      
      <div className="mt-2 flex justify-between text-sm">
        <span className="text-gray-400">Profit on Win:</span>
        <span className="text-green-400">{calculateProfit()} USDT</span>
      </div>
    </div>
  );
};

export default AutoCashoutInput;