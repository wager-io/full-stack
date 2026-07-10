import React from 'react';
import { Transition, Animation } from 'rsuite';
import CardStack from './CardStack';
import { createFullDeck } from '../utils/cardUtils';

const { Bounce, Slide } = Animation;

const CardDeck = ({
  hiloGame,
  cardAssets,
  getCardIcon,
  animationState,
  onNextCard
}) => {
  const {
    animatingCard,
    previousCard,
    initialCardShown,
    showPreviousCard,
    showCurrentCard,
    flyDirection,
    browsingDeck,
    currentDeckIndex
  } = animationState;

  const fullDeck = createFullDeck();

  return (
    <div className="deck svelte-1ns2yle relative">
      {/* Next button for browsing the deck */}
      <button
        className="absolute -top-2 -right-2 z-40 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors duration-200"
        onClick={() => onNextCard(fullDeck)}
        disabled={animatingCard}
        aria-label="Next card"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
      
      <div className="card-stack-container relative" style={{ height: "7.9em", width: "5em" }}>
        {/* Stacked cards in the background */}
        <CardStack cardAssets={cardAssets} />
        
        {/* Previous card that flies away */}
        <Transition
          in={showPreviousCard}
          exitedClassName="card-exited"
          exitingClassName="card-exiting"
          enteredClassName="card-entered"
          enteringClassName="card-entering"
        >
          {(props, ref) => (
            <Slide
              in={showPreviousCard}
              placement={flyDirection === 'right' ? 'right' : 'left'}
              timeout={500}
            >
              <div 
                ref={ref}
                {...props}
                className="wrap svelte-1cwyebm absolute top-0 left-0 z-20"
                style={{ 
                  transform: `translateY(-100px) rotate(${flyDirection === 'right' ? '20deg' : '-20deg'})`,
                  transition: 'all 0.5s ease-out'
                }}
              >
                <div className="horizontal svelte-1cwyebm" style={{ "--transition-time": "300ms" }}>
                  <div
                    className="content svelte-1cwyebm"
                    style={{ width: "5em", height: "7.9em", "--transition-time": "300ms" }}
                  >
                    <div className="face none svelte-1cwyebm">
                      <div className="face-content svelte-ofo6ka" style={{ 
                        color: previousCard?.isRed ? "var(--red-500)" : "var(--grey-600)" 
                      }}>
                        <span>{previousCard?.value}</span>
                        {previousCard && getCardIcon(previousCard.suit)}
                      </div>
                    </div>
                    <div
                      className="back svelte-1cwyebm"
                      style={{ backgroundImage: cardAssets.cardBackUrl }}
                    ></div>
                  </div>
                </div>
              </div>
            </Slide>
          )}
        </Transition>
        
        {/* Initial card or current browsing card */}
        <Transition
          in={showCurrentCard}
          exitedClassName="card-exited"
          exitingClassName="card-exiting"
          enteredClassName="card-entered"
          enteringClassName="card-entering"
        >
          {(props, ref) => (
            <Bounce in={showCurrentCard} timeout={500}>
              <div 
                ref={ref}
                {...props}
                className="wrap svelte-1cwyebm absolute top-0 left-0 z-30"
              >
                <div className="horizontal svelte-1cwyebm" style={{ "--transition-time": "300ms" }}>
                  <div
                    className="content svelte-1cwyebm"
                    style={{ width: "5em", height: "7.9em", "--transition-time": "300ms" }}
                  >
                    <div className="face none svelte-1cwyebm">
                      <div className="face-content svelte-ofo6ka" style={{ 
                        color: initialCardShown 
                          ? fullDeck[0].isRed ? "var(--red-500)" : "var(--grey-600)" 
                          : fullDeck[currentDeckIndex].isRed ? "var(--red-500)" : "var(--grey-600)" 
                      }}>
                        <span>{initialCardShown ? fullDeck[0].value : fullDeck[currentDeckIndex].value}</span>
                        {getCardIcon(initialCardShown ? fullDeck[0].suit : fullDeck[currentDeckIndex].suit)}
                      </div>
                    </div>
                    <div
                      className="back svelte-1cwyebm"
                      style={{ backgroundImage: cardAssets.cardBackUrl }}
                    ></div>
                  </div>
                </div>
              </div>
            </Bounce>
          )}
        </Transition>
      </div>
      
      {/* Card counter when browsing */}
      {browsingDeck && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 px-2 py-1 rounded text-white text-xs">
          {currentDeckIndex + 1} / {fullDeck.length}
        </div>
      )}
    </div>
  );
};

export default CardDeck;