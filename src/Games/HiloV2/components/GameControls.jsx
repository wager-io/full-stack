import React from 'react';

const GameControls = ({ 
  betAmount, 
  onBetAmountChange, 
  onStartGame, 
  isPlaying,
  maxBet,
  minBet
}) => {
  return (
    <div className="game-controls flex flex-col gap-4 mt-6">
      <div className="bet-amount-control flex items-center gap-2">
        <label htmlFor="bet-amount" className="text-gray-300">Bet Amount:</label>
        <input
          id="bet-amount"
          type="number"
          className="bg-gray-700 text-white px-3 py-2 rounded-lg w-24"
          value={betAmount}
          onChange={(e) => onBetAmountChange(parseFloat(e.target.value))}
          min={minBet}
          max={maxBet}
          step="0.1"
          disabled={isPlaying}
        />
        
        <div className="bet-shortcuts flex gap-1">
          <button 
            className="bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded text-xs"
            onClick={() => onBetAmountChange(betAmount / 2)}
            disabled={isPlaying || betAmount <= minBet}
          >
            ½
          </button>
          <button 
            className="bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded text-xs"
            onClick={() => onBetAmountChange(betAmount * 2)}
            disabled={isPlaying || betAmount * 2 > maxBet}
          >
            2×
          </button>
          <button 
            className="bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded text-xs"
            onClick={() => onBetAmountChange(maxBet)}
            disabled={isPlaying}
          >
            Max
          </button>
        </div>
      </div>
      
      <button
        className="start-game-btn bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg shadow-md transition-colors duration-200 font-bold"
        onClick={onStartGame}
        disabled={isPlaying}
      >
        Start Game
      </button>
    </div>
  );
};

export default GameControls;