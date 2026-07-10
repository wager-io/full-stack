import React, { useState, useContext } from 'react';
import { toast } from 'sonner';
import { useLimboGame } from './LimboContext';
import { AuthContext } from '../../context/AuthContext';
import { 
  FaCoins, 
  FaDice, 
  FaChevronDown, 
  FaChevronUp, 
  FaUsers, 
  FaMoneyBillWave,
  FaCalculator,
  FaHandHoldingUsd,
  FaArrowRight,
  FaExclamationTriangle,
  FaLock,
  FaExchangeAlt
} from 'react-icons/fa';

const DiceControls = () => {
  const { 
    gameState, 
    betAmount, 
    setBetAmount, 
    target,
    handleTargetChange,
    mode,
    toggleMode,
    winChance,
    multiplier,
    calculateProfit,
    placeBet,
    recentBets,
    balance
  } = useLimboGame();
  
  // Get auth context to check if user is logged in
  const { user } = useContext(AuthContext);
  
  const handlePlaceBetClick = () => {
    if (!user) {
      toast.error('Please log in to place a bet');
      return;
    }
    if (betAmount > balance) {
      toast.error('Insufficient balance');
      return;
    }
    
    // Place the bet
    placeBet();
  };
  
  const handleHalfAmount = () => {
    setBetAmount(prevAmount => Math.max(0.01, parseFloat((prevAmount / 2).toFixed(2))));
  };
  
  const handleDoubleAmount = () => {
    const currentAmount = Number(betAmount);
    const doubledAmount = parseFloat((currentAmount * 2).toFixed(2));
    setBetAmount(doubledAmount);
  };
  
  return (
    <div className="w-full md:w-70 h-full bg-gray-800 bg-opacity-50 p-4 rounded-tr-[18px] md:rounded-tr-[0px]  rounded-br-[18px] md:rounded-br-[0px] rounded-tl-[18px] rounded-bl-[18px] space-y-5">
      <div className='flex justify-center mb-4'></div>
      {/* Bet Amount Section */}
      <div className='mb-3'>
        <div className=" bg-opacity-50 py-4 ">
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
                if (e.target.value === '') {
                  setBetAmount('');
                } else {
                  const value = parseFloat(e.target.value)
                  if (!isNaN(value)) {
                    setBetAmount(value)
                  }
                }
              }}
              placeholder='0.00'
              value={betAmount === '' ? '' : betAmount}
              className="w-full p-3 pl-10 pr-28 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <div className="absolute right-2 flex space-x-2">
              <button 
                onClick={handleHalfAmount}
                className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded text-sm font-medium transition-colors flex items-center"
                title="Half amount"
              >
                <span>½</span>
              </button>
              <button 
                onClick={handleDoubleAmount}
                className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded text-sm font-medium transition-colors flex items-center"
                title="Double amount"
              >
                <span>2×</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile: Bet Button after Bet Amount, Profit after Button */}
        {/* Desktop: Original order (Bet Amount, Profit, Button) */}
        <div className="flex flex-col md:block">
          {/* Mobile: Bet Button */}
          <div className="block md:hidden mt-3">
            <button 
              onClick={handlePlaceBetClick}
              disabled={gameState === 'rolling' || !multiplier}
              className={`
                w-full py-4 rounded-lg font-bold text-sm flex items-center justify-center transition-all
                ${
                  gameState === 'rolling' 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : !user 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                }
              `}
            >
              {gameState === 'rolling' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Betting...
                </>
              ) : !user ? (
                <>
                  <FaLock className="mr-2" />
                  Login to Play
                </>
              ) : (
                <>
                  <FaDice className="mr-2" />
                  Bet
                </>
              )}
            </button>
          </div>
          {/* Mobile: Profit on Win */}
          <div className="block md:hidden">
            <div className="bg-opacity-50 py-4 mt-3">
              <label className="flex items-center text-sm mb-2 text-gray-300">
                Profit on Win
              </label>
              <div className="relative flex items-center">
                <div className="absolute right-3 flex items-center pointer-events-none">
                  <img 
                    src="/assets/token/usdt.png" 
                    alt="USDT" 
                    className="w-5 h-5 mr-1" 
                  />
                </div>
                <div className='w-full p-3 pl-2 pr-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all'>
                  {calculateProfit()} USDT
                </div>
              </div>
            </div>
          </div>
          {/* Desktop: Profit on Win then Bet Button */}
          <div className="hidden md:block">
            <div className="bg-opacity-50 py-4">
              <label className="flex items-center text-sm mb-2 text-gray-300">
                Profit on Win
              </label>
              <div className="relative flex items-center">
                <div className="absolute right-3 flex items-center pointer-events-none">
                  <img 
                    src="/assets/token/usdt.png" 
                    alt="USDT" 
                    className="w-5 h-5 mr-1" 
                  />
                </div>
                <div className='w-full p-3 pl-2 pr-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all'>
                  {calculateProfit()} USDT
                </div>
              </div>
            </div>
            <button 
              onClick={handlePlaceBetClick}
              disabled={gameState === 'rolling' || !multiplier}
              className={`
                w-full py-4 rounded-lg font-bold text-sm flex items-center justify-center transition-all mt-3
                ${
                  gameState === 'rolling' 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : !user 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                }
              `}
            >
              {gameState === 'rolling' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Betting...
                </>
              ) : !user ? (
                <>
                  <FaLock className="mr-2" />
                  Login to Play
                </>
              ) : (
                <>
                  <FaDice className="mr-2" />
                  Bet
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiceControls;