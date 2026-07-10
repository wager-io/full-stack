import React from 'react';
import { FaPlay, FaStop } from 'react-icons/fa';

const ActionButton = ({ 
  isAutoBetting, 
  gameStatus, 
  betAmount, 
  startAutoBetting, 
  stopAutoBetting 
}) => {
  return (
    <div className="mt-4">
      {!isAutoBetting ? (
        <button 
          onClick={startAutoBetting}
          disabled={gameStatus !== 'starting' || betAmount <= 0}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white flex items-center justify-center
            ${gameStatus === 'starting' && betAmount > 0
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-600 cursor-not-allowed'
            } transition-colors`}
        >
          <FaPlay className="mr-2" />
          Start Auto Betting
        </button>
      ) : (
        <button 
          onClick={stopAutoBetting}
          className="w-full py-3 px-4 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center"
        >
          <FaStop className="mr-2" />
          Stop Auto Betting
        </button>
      )}
    </div>
  );
};

export default ActionButton;