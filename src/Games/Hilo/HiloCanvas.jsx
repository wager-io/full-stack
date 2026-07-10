import React from "react";
import { useHiloGame } from "./HiloContext";

const cardBackUrl = "url(/assets/hilo/hilo-card.png)";

function Card({ value = "A", color = "var(--grey-600)", disabled = true, style = {}, faceDown = true, suit = "" }) {
  return (
    <button
      className="wrap svelte-1cwyebm"
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
              <span className="ml-1 text-xs capitalize">{suit}</span>
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

export default function HiloCanvas() {
  const { currentGame, gameState } = useHiloGame();

  // Number of cards left in the deck (for stacking effect)
  const deckCount = currentGame?.deckCount ?? 4;

  // Current card info
  const card = currentGame?.currentCard
    ? {
        value: currentGame.currentCard.rank || "A",
        color: currentGame.currentCard.color || "var(--grey-600)",
        disabled: false,
        faceDown: false,
        suit: currentGame.currentCard.suit || "",
      }
    : {
        value: "?",
        color: "var(--grey-600)",
        disabled: true,
        faceDown: true,
        suit: "",
      };

  return (
    <div className="main svelte-124p9tv flex items-center justify-center h-full w-full">
      <div className="wrap svelte-1ns2yle">
        <div className="deck svelte-1ns2yle">
          <div className="relative h-[190px] w-[80px]">
            {/* Stacked deck cards (face down) */}
            {[...Array(deckCount)].map((_, idx) => (
              <div
                key={idx}
                className="absolute left-0 w-full"
                style={{
                  top: `${(deckCount - idx) * 4}px`,
                  zIndex: idx,
                }}
              >
                <Card />
              </div>
            ))}
            {/* Current card on top */}
            <div
              className="absolute left-0 w-full"
              style={{
                top: `0px`,
                zIndex: deckCount,
              }}
            >
              <Card {...card} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
