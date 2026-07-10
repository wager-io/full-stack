import React from 'react';

const CardStack = ({ cardAssets }) => {
  return (
    <div className="stacked-deck">
      {/* Multiple stacked cards for visual effect */}
      {[...Array(5)].map((_, index) => (
        <div 
          key={`stack-${index}`}
          className="wrap svelte-1cwyebm"
          style={{ 
            position: 'absolute',
            top: `${index * 1}px`, // Smaller vertical offset for a tighter stack
            left: 0,
            pointerEvents: 'none',
            zIndex: 5 - index, // Higher cards in the stack have higher z-index
            transform: `rotate(${(index % 2 === 0 ? 0.5 : -0.5) * index}deg)` // Slight alternating rotation for realism
          }}
        >
          <div className="horizontal svelte-1cwyebm" style={{ "--transition-time": "300ms" }}>
            <div
              className="content svelte-1cwyebm face-down"
              style={{ width: "5em", height: "7.9em", "--transition-time": "300ms" }}
            >
              <div className="back svelte-1cwyebm face-down"
                style={{ backgroundImage: cardAssets.cardBackUrl }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardStack;