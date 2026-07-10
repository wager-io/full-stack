import React, { useState, useContext } from 'react';
import { useHiloGame } from './HiloContext';
import { AuthContext } from '../../context/AuthContext';
import { FaCoins, FaArrowUp, FaArrowDown, FaLock, FaMoneyBillWave, FaStepForward } from 'react-icons/fa';

const HiloControls = () => {
  const { user } = useContext(AuthContext);
  const {
    balance,
    gameState,
    currentGame,
    error,
    placeBet,
    makeChoice,
    cashOut,
  } = useHiloGame();

  const [betAmount, setBetAmount] = useState(1);

  // Dummy chance values for demo; replace with real calculation if available
  const hiChance = currentGame?.hiChance ?? 48.5;
  const sameChance = currentGame?.sameChance ?? 2.0;

  const handlePlaceBetClick = () => {
    if (!user) return;
    placeBet({ betAmount }, () => {});
  };

  const handleHalfAmount = () => {
    setBetAmount(prev => Math.max(1, parseFloat((prev / 2).toFixed(2))));
  };

  const handleDoubleAmount = () => {
    setBetAmount(prev => parseFloat((prev * 2).toFixed(2)));
  };

  // New: handle skip card
  const handleSkipCard = () => {
    if (makeChoice) makeChoice('skip');
  };

  return (
    <div className="w-full md:w-70 h-full bg-gray-800 bg-opacity-50 p-4 rounded-tr-[18px] md:rounded-tr-[0px] rounded-br-[18px] md:rounded-br-[0px] rounded-tl-[18px] rounded-bl-[18px] space-y-5">
      {/* Bet Amount Section */}
      <div className="mb-3">
        <div className="bg-opacity-50 py-4">
          <label className="flex items-center text-sm mb-2 text-gray-300">
            <FaCoins className="mr-2 text-yellow-500" />
            Bet Amount
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              min={1}
              value={betAmount}
              onChange={e => setBetAmount(Number(e.target.value))}
              placeholder="0.00"
              className="w-full p-3 pl-4 pr-28 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              disabled={gameState === 'playing'}
            />
            <div className="absolute right-2 flex space-x-2">
              <button
                onClick={handleHalfAmount}
                className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded text-sm font-medium transition-colors flex items-center"
                title="Half amount"
                disabled={gameState === 'playing'}
              >
                ½
              </button>
              <button
                onClick={handleDoubleAmount}
                className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded text-sm font-medium transition-colors flex items-center"
                title="Double amount"
                disabled={gameState === 'playing'}
              >
                2×
              </button>
            </div>
          </div>
        </div>
        {/* Bet Button */}
        <div className="mt-3">
          <button
            onClick={handlePlaceBetClick}
            disabled={gameState === 'playing' || !user}
            className={`
              w-full py-4 rounded-lg font-bold text-sm flex items-center justify-center transition-all
              ${
                gameState === 'playing'
                  ? 'bg-gray-600 cursor-not-allowed'
                  : !user
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              }
            `}
          >
            {gameState === 'playing' ? (
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
                <FaMoneyBillWave className="mr-2" />
                Bet
              </>
            )}
          </button>
        </div>
        {error && <div className="text-red-400 text-xs mt-2">{error}</div>}
      </div>

      {/* Hi/Lo/Same/Skip Controls */}
      {gameState === 'playing' && currentGame && (
        <div className="bg-gray-800 rounded-lg p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between mb-2">
            <span>Current Card:</span>
            <span className="font-bold">
              {currentGame.currentCard?.rank} {currentGame.currentCard?.suit}
            </span>
          </div>
          <div className="flex gap-2 mb-2">
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold w-1/3 flex items-center justify-center"
              onClick={() => makeChoice('hi')}
            >
              <FaArrowUp className="mr-2" /> High&nbsp;
              <span className="text-xs text-white/70">({hiChance}%)</span>
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-bold w-1/3 flex items-center justify-center"
              onClick={() => makeChoice('same')}
            >
              <span className="mr-2">=</span> Same&nbsp;
              <span className="text-xs text-white/70">({sameChance}%)</span>
            </button>
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold w-1/3 flex items-center justify-center"
              onClick={() => makeChoice('lo')}
            >
              <FaArrowDown className="mr-2" /> Low
            </button>
          </div>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-bold flex items-center justify-center mb-2"
            onClick={handleSkipCard}
          >
            <FaStepForward className="mr-2" /> Skip Card
          </button>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded font-bold"
            onClick={cashOut}
          >
            Cash Out
          </button>
        </div>
      )}
    </div>
  );
};

export default HiloControls;
