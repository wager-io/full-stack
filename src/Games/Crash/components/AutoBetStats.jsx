import React from 'react';
import { FaChartLine, FaHistory, FaCoins } from 'react-icons/fa';

const AutoBetStats = ({ 
  numberOfBets = 0, 
  maxBets = 0, 
  totalProfit = 0,
  betAmount = 0,
  autoCashout = 2
}) => {
  return (
    <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700">
      <h3 className="text-white font-medium mb-3 flex items-center">
        <FaChartLine className="mr-2 text-blue-400" />
        Auto Betting Stats
      </h3>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Bets Placed:</span>
          <span className="text-white font-medium flex items-center">
            <FaHistory className="mr-1 text-blue-400" />
            {numberOfBets} {maxBets > 0 ? `/ ${maxBets}` : ''}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Current Bet:</span>
          <span className="text-white font-medium flex items-center">
            <img 
              src="/assets/token/usdt.png" 
              alt="USDT" 
              className="w-4 h-4 mr-1" 
            />
            {betAmount.toFixed(2)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Auto Cashout:</span>
          <span className="text-white font-medium">
            {autoCashout.toFixed(2)}×
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Total Profit:</span>
          <span className={`font-medium flex items-center ${
            totalProfit > 0 
              ? 'text-green-400' 
              : totalProfit < 0 
                ? 'text-red-400' 
                : 'text-white'
          }`}>
            <FaCoins className="mr-1" />
            {totalProfit > 0 ? '+' : ''}{totalProfit.toFixed(2)} USDT
          </span>
        </div>
      </div>
    </div>
  );
};

export default AutoBetStats;