import React, { useEffect, useRef, useState } from 'react';
import { useHiloGame } from '../context/HiloContext';

const GameView = () => {
  const { hiloGame, soundManager, handleNextRound } = useHiloGame();
  const gameContainerRef = useRef(null);
  const [currentCard, setCurrentCard] = useState(null);
  const [previousCards, setPreviousCards] = useState([]);
  const [animating, setAnimating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  // Update game view when hiloGame changes
  useEffect(() => {
    if (hiloGame) {
      // Extract current card and previous cards from game state
      const current = hiloGame.rounds && hiloGame.rounds.length > 0 
        ? hiloGame.rounds[hiloGame.rounds.length - 1] 
        : null;
      
      // Update current card
      setCurrentCard(current);
      
      // Update previous cards (all except the last one)
      if (hiloGame.rounds && hiloGame.rounds.length > 1) {
        setPreviousCards(hiloGame.rounds.slice(0, -1));
      } else {
        setPreviousCards([]);
      }
      
      // Play appropriate sounds
      if (soundManager) {
        if (hiloGame.has_ended) {
          if (hiloGame.won) {
            soundManager.playGameEvent('win', { payout: hiloGame.payout });
          } else {
            soundManager.playGameEvent('lose');
          }
        } else if (current) {
          soundManager.playGameEvent('card');
        }
      }
    }
  }, [hiloGame, soundManager]);

  // Handle card animation
  const animateCard = (callback) => {
    setAnimating(true);
    
    // Play card sound
    if (soundManager) {
      soundManager.playGameEvent('card');
    }
    
    // Simulate card animation
    setTimeout(() => {
      setAnimating(false);
      if (callback) callback();
    }, 500);
  };

  // Handle result display
  const showResultMessage = (message, isWin) => {
    setResultMessage(message);
    setShowResult(true);
    
    // Hide result after a delay
    setTimeout(() => {
      setShowResult(false);
    }, 2000);
  };

  // Handle higher button click
  const handleHigherClick = () => {
    if (animating || !hiloGame || hiloGame.has_ended) return;
    
    // Play button sound
    if (soundManager) {
      soundManager.playGameEvent('button');
    }
    
    // Animate card and then make the choice
    animateCard(() => {
      handleNextRound({ hi: true, lo: false, skip: false });
    });
  };

  // Handle lower button click
  const handleLowerClick = () => {
    if (animating || !hiloGame || hiloGame.has_ended) return;
    
    // Play button sound
    if (soundManager) {
      soundManager.playGameEvent('button');
    }
    
    // Animate card and then make the choice
    animateCard(() => {
      handleNextRound({ hi: false, lo: true, skip: false });
    });
  };

  // Handle skip button click
  const handleSkipClick = () => {
    if (animating || !hiloGame || hiloGame.has_ended) return;
    
    // Play skip sound
    if (soundManager) {
      soundManager.playGameEvent('skip');
    }
    
    // Animate card and then skip
    animateCard(() => {
      handleNextRound({ hi: false, lo: false, skip: true });
    });
  };

  // Get card color based on suit
  const getCardColor = (suit) => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-gray-900';
  };

  // Get card symbol based on suit
  const getCardSymbol = (suit) => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  };

  // Render a card
  const renderCard = (card, index, isCurrentCard = false) => {
    if (!card) return null;
    
    const cardSymbol = getCardSymbol(card.cardSuite);
    const cardColor = getCardColor(card.cardSuite);
    
    return (
      <div 
        key={index} 
        className={`
          relative w-24 h-36 bg-white rounded-lg shadow-lg overflow-hidden
          ${isCurrentCard ? 'transform scale-125 z-10' : 'mx-1'}
          ${animating ? 'animate-pulse' : ''}
        `}
      >
        <div className="absolute inset-0 flex flex-col justify-between p-2">
          <div className={`text-lg font-bold ${cardColor}`}>
            {card.cardRank}
          </div>
          <div className={`text-4xl font-bold self-center ${cardColor}`}>
            {cardSymbol}
          </div>
          <div className={`text-lg font-bold self-end transform rotate-180 ${cardColor}`}>
            {card.cardRank}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="game-view w-full h-full" ref={gameContainerRef}>
      {/* Game board with cards */}
      <div className="game-board flex flex-col items-center justify-center p-4 bg-green-800 rounded-lg shadow-lg min-h-[400px]">
        {hiloGame ? (
          <>
            {/* Previous cards */}
            <div className="previous-cards flex flex-wrap justify-center mb-8 max-w-full overflow-x-auto">
              {previousCards.map((card, index) => renderCard(card, index))}
            </div>
            
            {/* Current card */}
            <div className="current-card-container relative mb-8">
              {currentCard ? renderCard(currentCard, 'current', true) : (
                <div className="w-24 h-36 bg-gray-300 rounded-lg shadow-lg flex items-center justify-center">
                  <div className="text-gray-500 text-sm">Place a bet</div>
                </div>
              )}
              
              {/* Result message overlay */}
              {showResult && (
                <div className={`
                  absolute inset-0 flex items-center justify-center rounded-lg
                  ${resultMessage.includes('Win') ? 'bg-green-500 bg-opacity-80' : 'bg-red-500 bg-opacity-80'}
                  text-white font-bold text-xl
                `}>
                  {resultMessage}
                </div>
              )}
            </div>
            
            {/* Game controls */}
            <div className="game-choice-buttons flex space-x-4 mb-6">
              <button 
                className={`
                  py-2 px-4 rounded-lg font-medium text-white
                  ${animating || !hiloGame || hiloGame.has_ended 
                    ? 'bg-blue-400 cursor-not-allowed opacity-50' 
                    : 'bg-blue-600 hover:bg-blue-700 transition-colors'}
                `}
                onClick={handleHigherClick}
                disabled={animating || !hiloGame || hiloGame.has_ended}
              >
                <span className="block">Higher</span>
                <span className="text-xs block mt-1">
                  ({hiloGame.hi_chance ? (hiloGame.hi_chance * 100).toFixed(2) : '0'}%)
                </span>
              </button>
              
              <button 
                className={`
                  py-2 px-4 rounded-lg font-medium text-white
                  ${animating || !hiloGame || hiloGame.has_ended 
                    ? 'bg-red-400 cursor-not-allowed opacity-50' 
                    : 'bg-red-600 hover:bg-red-700 transition-colors'}
                `}
                onClick={handleLowerClick}
                disabled={animating || !hiloGame || hiloGame.has_ended}
              >
                <span className="block">Lower</span>
                <span className="text-xs block mt-1">
                  ({hiloGame.lo_chance ? (hiloGame.lo_chance * 100).toFixed(2) : '0'}%)
                </span>
              </button>
              
              <button 
                className={`
                  py-2 px-4 rounded-lg font-medium text-white
                  ${animating || !hiloGame || hiloGame.has_ended 
                    ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                    : 'bg-gray-600 hover:bg-gray-700 transition-colors'}
                `}
                onClick={handleSkipClick}
                disabled={animating || !hiloGame || hiloGame.has_ended}
              >
                Skip
              </button>
            </div>
            
            {/* Game stats */}
            <div className="game-stats grid grid-cols-3 gap-4 w-full max-w-md bg-gray-800 p-4 rounded-lg">
              <div className="stat text-center">
                <span className="block text-gray-400 text-sm">Round</span>
                <span className="block text-white font-bold">{hiloGame.round}</span>
              </div>
              <div className="stat text-center">
                <span className="block text-gray-400 text-sm">Payout</span>
                <span className="block text-white font-bold">{hiloGame.payout}x</span>
              </div>
              <div className="stat text-center">
                <span className="block text-gray-400 text-sm">Potential Win</span>
                <span className="block text-white font-bold">
                  {(hiloGame.bet_amount * hiloGame.payout).toFixed(4)}
                </span>
              </div>
            </div>
            
            {/* Game result (shown when game has ended) */}
            {hiloGame.has_ended && (
              <div className={`
                mt-6 p-4 rounded-lg text-center w-full max-w-md
                ${hiloGame.won ? 'bg-green-600' : 'bg-red-600'} text-white
              `}>
                <h3 className="text-xl font-bold mb-2">
                  {hiloGame.won ? 'You Won!' : 'You Lost'}
                </h3>
                {hiloGame.won && (
                  <div className="win-amount text-2xl font-bold mb-2">
                    +{hiloGame.profit} {hiloGame.token}
                  </div>
                )}
                <div className="result-details grid grid-cols-2 gap-2 text-sm">
                  <div className="text-right">Bet Amount:</div>
                  <div className="text-left font-medium">
                    {hiloGame.bet_amount} {hiloGame.token}
                  </div>
                  <div className="text-right">Final Payout:</div>
                  <div className="text-left font-medium">{hiloGame.payout}x</div>
                  <div className="text-right">Rounds Played:</div>
                  <div className="text-left font-medium">{hiloGame.round}</div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="game-placeholder flex flex-col items-center justify-center h-64">
            <div className="placeholder-card w-24 h-36 bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
              <div className="card-back bg-gray-800 w-20 h-32 rounded-md border border-gray-600"></div>
            </div>
            <p className="text-gray-300 text-center">Place a bet to start playing</p>
          </div>
        )}
      </div>
      
      {/* Card deck visualization */}
      <div className="card-deck flex justify-center mt-4">
        <div className="deck-info flex items-center bg-gray-800 p-3 rounded-lg">
          <div className="deck-count mr-4">
            <span className="text-gray-400 text-sm block">Cards Left:</span>
            <span className="text-white font-bold text-lg">
              {hiloGame ? 52 - (hiloGame.rounds ? hiloGame.rounds.length : 0) : 52}
            </span>
          </div>
          <div className="deck-visual relative h-12 w-16">
            {Array.from({ length: 5 }).map((_, index) => (
              <div 
                key={index} 
                className="deck-card absolute bg-gray-700 border border-gray-600 rounded-md w-12 h-16" 
                style={{ 
                  top: `${index * -2}px`, 
                  left: `${index * 1}px`,
                  zIndex: 5 - index
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Game instructions */}
      {!hiloGame && (
        <div className="game-instructions mt-8 bg-gray-800 p-4 rounded-lg max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-3 text-white">How to Play</h3>
          <ol className="list-decimal pl-5 mb-4 text-gray-300 space-y-2">
            <li>Place a bet to start the game</li>
            <li>Predict if the next card will be higher or lower than the current card</li>
            <li>Win by making correct predictions and increase your multiplier</li>
            <li>Cash out anytime to secure your winnings</li>
            <li>Skip difficult cards (but this won't increase your multiplier)</li>
          </ol>
          <div className="card-values bg-gray-700 p-3 rounded-md text-sm text-gray-300">
            <p className="mb-1">{`Card Values: A (low) < 2 < 3 < ... < 10 < J < Q < K < A (high)`}</p>
            <p>Same value cards: 50% chance for both higher and lower</p>
          </div>
        </div>
      )}
      
      {/* Hotkeys guide */}
      <div className="hotkeys-guide flex justify-center mt-6 space-x-4 text-sm text-gray-400">
        <div className="hotkey flex items-center">
          <span className="key bg-gray-700 text-white px-2 py-1 rounded mr-2 font-mono">H</span>
          <span className="action">Higher</span>
        </div>
        <div className="hotkey flex items-center">
          <span className="key bg-gray-700 text-white px-2 py-1 rounded mr-2 font-mono">L</span>
          <span className="action">Lower</span>
        </div>
        <div className="hotkey flex items-center">
          <span className="key bg-gray-700 text-white px-2 py-1 rounded mr-2 font-mono">S</span>
          <span className="action">Skip</span>
        </div>
        <div className="hotkey flex items-center">
          <span className="key bg-gray-700 text-white px-2 py-1 rounded mr-2 font-mono">C</span>
          <span className="action">Cash Out</span>
        </div>
      </div>
    </div>
  )
}

export default GameView 