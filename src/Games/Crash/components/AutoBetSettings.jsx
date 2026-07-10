import React from 'react';
import { FaRobot, FaCoins } from 'react-icons/fa';

  const AutoBetSettings = ({ 
    stopOnProfit,
    setStopOnProfit,
    stopOnLoss,
    setStopOnLoss,
    onWin,
    setOnWin,
    onLoss,
    setOnLoss,
    winMultiplier,
    setWinMultiplier,
    lossMultiplier,
    setLossMultiplier,
    betAmount = 0,
    autoCashout = 2,
    isDisabled = false
}) => {
  // Calculate potential profit
  const calculateProfit = () => {
    if (!betAmount || !autoCashout) return 0;
    const profit = betAmount * autoCashout - betAmount;
    return profit.toFixed(2);
  };

  return (
    <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700 space-y-4">
      {/* On Win */}
      <div>
        <label className="text-sm text-gray-300 block mb-2">On Win</label>
        <div className="flex space-x-2 bg-gray-700 p-1 rounded-lg">
          <button
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              onWin === 'reset' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
            onClick={() => setOnWin('reset')}
            disabled={isDisabled}
          >
            Reset
          </button>
          <button
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              onWin === 'increase' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
            onClick={() => setOnWin('increase')}
            disabled={isDisabled}
          >
            Increase By
          </button>
        </div>
        
        {onWin === 'increase' && (
          <div className="mt-2 relative">
            <input 
              type="number" 
              value={winMultiplier}
              onChange={(e) => setWinMultiplier(Number(e.target.value))}
              min="1.01"
              step="0.01"
              className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isDisabled}
              placeholder="Multiplier"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              ×
            </div>
          </div>
        )}
      </div>
      
      {/* On Loss */}
      <div>
        <label className="text-sm text-gray-300 block mb-2">On Loss</label>
        <div className="flex space-x-2 bg-gray-700 p-1 rounded-lg">
          <button
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              onLoss === 'reset' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
            onClick={() => setOnLoss('reset')}
            disabled={isDisabled}
          >
            Reset
          </button>
          <button
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              onLoss === 'increase' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
            onClick={() => setOnLoss('increase')}
            disabled={isDisabled}
          >
            Increase By
          </button>
        </div>
        
        {onLoss === 'increase' && (
          <div className="mt-2 relative">
            <input 
              type="number" 
              value={lossMultiplier}
              onChange={(e) => setLossMultiplier(Number(e.target.value))}
              min="1.01"
              step="0.01"
              className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isDisabled}
              placeholder="Multiplier"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              ×
            </div>
          </div>
        )}
      </div>
      
      {/* Stop Profit */}
      <div>
        <label className="text-sm text-gray-300 block mb-2">Stop Profit</label>
        <div className="relative">
          <input 
            type="number" 
            value={stopOnProfit}
            onChange={(e) => setStopOnProfit(Number(e.target.value))}
            min="0"
            step="1"
            className="w-full p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isDisabled}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
            <img 
              src="/assets/token/usdt.png" 
              alt="USDT" 
              className="w-5 h-5" 
            />
          </div>
        </div>
      </div>
      
      {/* Stop Loss */}
      <div>
        <label className="text-sm text-gray-300 block mb-2">Stop Loss</label>
        <div className="relative">
          <input 
            type="number" 
            value={stopOnLoss}
            onChange={(e) => setStopOnLoss(Number(e.target.value))}
            min="0"
            step="1"
            className="w-full p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isDisabled}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
            <img 
              src="/assets/token/usdt.png" 
              alt="USDT" 
              className="w-5 h-5" 
            />
          </div>
        </div>
      </div>
      
      {/* Profit on Win */}
      <div className="bg-gray-700 p-3 rounded-lg">
        <div className="text-gray-400 text-sm mb-1">Profit on Win</div>
        <div className="text-green-400 font-medium text-lg flex items-center">
          +{calculateProfit()} 
          <img 
            src="/assets/token/usdt.png" 
            alt="USDT" 
            className="w-4 h-4 ml-1" 
          />
        </div>
      </div>
    </div>
  );
};

export default AutoBetSettings;