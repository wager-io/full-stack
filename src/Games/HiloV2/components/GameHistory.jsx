import React from 'react';
import GameCard from './GameCard';

const GameHistory = ({ gameHistory, cardAssets, getCardIcon }) => {
  if (!gameHistory || gameHistory.length === 0) return null;
  
  return (
    <div className="game-history mt-6">
      <h3 className="text-gray-300 text-sm mb-2">Game History</h3>
      <div className="history-cards flex gap-1 overflow-x-auto pb-2">
        {gameHistory.map((card, index) => (
          <GameCard 
            key={`history-${index}`}
            card={card}
            cardAssets={cardAssets}
            getCardIcon={getCardIcon}
            isHistory={true}
          />
        ))}
      </div>
    </div>
  );
};

export default GameHistory;