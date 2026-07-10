import React from 'react';

const GameCard = ({ card, cardAssets, getCardIcon, isActive = false, isHistory = false }) => {
  if (!card) return null;
  
  const cardSize = isHistory ? { width: "3em", height: "4.5em" } : { width: "5em", height: "7.9em" };
  
  return (
    <div 
      className={`wrap svelte-1cwyebm ${isActive ? 'active-card' : ''}`}
      style={{ 
        position: 'relative',
        transform: isActive ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform 0.3s ease'
      }}
    >
      <div className="horizontal svelte-1cwyebm" style={{ "--transition-time": "300ms" }}>
        <div
          className="content svelte-1cwyebm"
          style={{ ...cardSize, "--transition-time": "300ms" }}
        >
          <div className="face none svelte-1cwyebm">
            <div className="face-content svelte-ofo6ka" style={{ color: card.isRed ? "var(--red-500)" : "var(--grey-600)" }}>
              <span>{card.value}</span>
              {getCardIcon(card.suit)}
            </div>
          </div>
          <div
            className="back svelte-1cwyebm"
            style={{ backgroundImage: cardAssets.cardBackUrl }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;