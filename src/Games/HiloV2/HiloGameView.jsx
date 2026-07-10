import React, { useState } from "react";
import { useHiloGame } from "./context/HiloContext";
import { useKeyPress } from '../../hooks/useKeyPress';
import useDeck from "./hooks/deck";

const cardBackUrl = "url(/assets/hilo/hilo-card.png)";
const bgHi = "url(/assets/hilo/bg-hi.DH5yjVB6.svg)";
const bgLo = "url(/assets/hilo/bg-lo.DB3Mujl0.svg)";
const bgHiStacked = "url(/assets/hilo/bg-hi-stacked.Cv2Q4gGD.svg)";
const bgLoStacked = "url(/assets/hilo/bg-lo.DB3Mujl0.svg)";


function Card({ value = "A", color = "var(--grey-600)", disabled = true, style = {}, faceDown = true, flyOut = false }) {
  let icon = null;

  if (value === "J" || value === "Q") {
    icon = (
      <svg fill="currentColor" viewBox="0 0 64 64" className="svg-icon">
        <title></title>
        <path fillRule="evenodd" d="m37.036 2.1 24.875 24.865a7.1 7.1 0 0 1 2.09 5.04c0 1.969-.799 3.75-2.09 5.04L37.034 61.91a7.08 7.08 0 0 1-5.018 2.077c-.086 0-.174 0-.25-.004v.004h-.01a7.07 7.07 0 0 1-4.79-2.072L2.089 37.05A7.1 7.1 0 0 1 0 32.009c0-1.97.798-3.75 2.09-5.04L26.965 2.102v.002A7.07 7.07 0 0 1 31.754.02l.002-.004h-.012l.264-.004A7.08 7.08 0 0 1 37.036 2.1" clipRule="evenodd"></path>
      </svg>
    );
  } else if (value === "7") {
    icon = (
      <svg fill="currentColor" viewBox="0 0 64 64" className="svg-icon">
        <title></title>
        <path fillRule="evenodd" d="M30.907 55.396.457 24.946v.002A1.55 1.55 0 0 1 0 23.843c0-.432.174-.82.458-1.104l14.13-14.13a1.55 1.55 0 0 1 1.104-.458c.432 0 .821.175 1.104.458l14.111 14.13c.272.272.645.443 1.058.453l.1-.013h.004a1.55 1.55 0 0 0 1.045-.452l14.09-14.09a1.55 1.55 0 0 1 1.104-.457c.432 0 .82.174 1.104.457l14.13 14.121a1.557 1.557 0 0 1 0 2.209L33.114 55.396v-.002c-.27.268-.637.438-1.046.452v.001h.003l-.04.002h-.029c-.427 0-.815-.173-1.095-.453" clipRule="evenodd"></path>
      </svg>
    );
  } else {
    icon = (
      <svg fill="currentColor" viewBox="0 0 64 64" className="svg-icon">
        <title></title>
        <circle cx="32" cy="32" r="28" />
      </svg>
    );
  }

  return (
    <button
      className={`wrap svelte-1cwyebm ${flyOut ? "card-fly-out" : ""}`}
      disabled={disabled}
      style={style}
    >
      <div className="horizontal svelte-1cwyebm" style={{ "--transition-time": "300ms" }}>
        <div
          className={`content svelte-1cwyebm${faceDown ? " face-down" : ""}`}
          style={{ width: "5em", height: "7.9em", "--transition-time": "300ms" }}
        >
          <div className="face none svelte-1cwyebm">
            <div className="face-content svelte-ofo6ka" style={{ color }}>
              <span>{value}</span>
              {icon}
            </div>
          </div>
          <div
            className="back svelte-1cwyebm face-down"
            style={{ backgroundImage: cardBackUrl }}
          ></div>
        </div>
      </div>
    </button>
  );
}

function HiloGameView() {
  const [flyOut, setFlyOut] = useState(false);
  const { 
    deck, 
    setDeck, 
    currentCard, 
    setCurrentCard, 
    deckCount, 
    setDeckCount, 
    handleHiloNextRound, 
    handleCashOut,
    newGame,
    hasActiveGame,
    hiloGame,
    cashoutResult
  } = useHiloGame();

  const { getCardRank, getCardSuite } = useDeck();

  // Handle key presses for game actions
  useKeyPress('h', () => {
    if (hasActiveGame) {
      handleHiloNextRound({ hi: true, lo: false, skip: false });
    }
  });
  
  useKeyPress('l', () => {
    if (hasActiveGame) {
      handleHiloNextRound({ hi: false, lo: true, skip: false });
    }
  });
  
  useKeyPress('s', () => {
    if (hasActiveGame) {
      handleHiloNextRound({ hi: false, lo: false, skip: true });
    }
  });
  
  useKeyPress('c', () => {
    if (hasActiveGame) {
      handleCashOut();
    }
  });

  // Get current card details from hiloGame if available
  const getCurrentCardDetails = () => {
    if (!hiloGame || !hiloGame.rounds || hiloGame.rounds.length === 0) {
      return {
        value: "?",
        suite: "?",
        color: "var(--grey-600)",
        faceDown: true
      };
    }
    
    const currentRound = hiloGame.rounds[hiloGame.rounds.length - 1];
    const cardNumber = currentRound.card;
    const rank = getCardRank(cardNumber);
    const suite = getCardSuite(cardNumber);
    const isRed = suite === '♥' || suite === '♦';
    
    return {
      value: rank,
      suite: suite,
      color: isRed ? "var(--red-500)" : "var(--grey-600)",
      faceDown: false
    };
  };

  // Get the current card to display
  const cardToDisplay = hasActiveGame ? getCurrentCardDetails() : { value: "?", suite: "?", color: "var(--grey-600)", faceDown: true };

  return (
    <div
      className="main svelte-124p9tv"
      style={{
        "--bgHi": bgHi,
        "--bgLo": bgLo,
        "--bgHiStacked": bgHiStacked,
        "--bgLoStacked": bgLoStacked,
      }}
    >
      <div className="wrap svelte-1ns2yle">
        <div className="deck svelte-1ns2yle">
          {/* Stacked Deck with current card on top */}
          <div className="relative h-[190px] w-[80px]">
            {/* Skip button as a card at top right */}
            <div className="absolute -top-4 -right-14 z-20">
              <button
                type="button"
                className={`flex flex-col items-center justify-center bg-[#2f4553] p-2 border rounded transition `}
                onClick={() => handleHiloNextRound({ hi: false, lo: false, skip: true })}
                style={{cursor: !hasActiveGame ? "not-allowed" : "pointer"}}
                disabled={!hasActiveGame}
                tabIndex={0}
                data-testid="skip-card"
                data-test="skip-card"
                data-button-root=""
              >
                <svg fill="currentColor" viewBox="0 0 64 64" className="svg-icon skipcard text-white fill-white">
                  <title></title>
                  <path
                    fillRule="evenodd"
                    d="m0 49.74 7.793 7.794L33.328 32 7.793 6.466 0 14.259 17.74 32zm30.672 0 7.793 7.794L64 32 38.465 6.466l-7.793 7.793L48.412 32z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
            </div>
            
            {/* Stacked cards in the background */}
            {[...Array(deckCount)].map((_, idx) => (
              <div
                key={idx}
                className="absolute left-0 w-full"
                style={{
                  top: `${idx * 2}px`, // Reduced spacing between cards
                  zIndex: idx,
                }}
              >
                <Card faceDown={true} />
              </div>
            ))}
            
            {/* Current card on top */}
            <div
              className="absolute left-0 w-full"
              style={{
                top: `0px`,
                zIndex: deckCount + 1, // Ensure it's above all stacked cards
              }}
            >
              <Card 
                value={cardToDisplay.value} 
                color={cardToDisplay.color} 
                faceDown={cardToDisplay.faceDown} 
                flyOut={flyOut} 
              />
            </div>
          </div>
        </div>
      
      </div>
      
    </div>
  );
}

export default HiloGameView;
