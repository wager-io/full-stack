import React, { useEffect } from 'react';
import { useHiloGame } from './context/HiloContext';
import useDeck from "./hooks/deck";

export default function HiloMultiplier() {
  const { 
    hiloGame, 
    betAmount, 
    controlStats,
    hasActiveGame
  } = useHiloGame();
  
  const { getCardRank, ranks } = useDeck();

  // Calculate real multipliers and profits based on game state
  const hiMultiplier = controlStats.hiMultiplier || "0.00";
  const loMultiplier = controlStats.loMultiplier || "0.00";
  const sameMultiplier = "12.00"; // This is typically fixed
  
  // Calculate profits based on current bet amount and multipliers
  const hiProfit = controlStats.hiProfit || "0.000000";
  const loProfit = controlStats.loProfit || "0.000000";
  const sameProfit = hasActiveGame ? (parseFloat(betAmount) * 12 - parseFloat(betAmount)).toFixed(6) : "0.000000";

  // Get current card details for display
  const getCurrentCardLabel = () => {
    if (!hiloGame?.rounds || hiloGame.rounds.length === 0) {
      return { hiLabel: "Higher", loLabel: "Lower" };
    }
    
    const currentRound = hiloGame.rounds[hiloGame.rounds.length - 1];
    const currentRank = getCardRank(currentRound.card);
    
    let hiLabel = "Higher";
    let loLabel = "Lower";
    
    // Adjust labels based on current card
    if (currentRank === ranks[0]) { // If Ace (lowest)
      hiLabel = "Higher";
      loLabel = "Lower or Same";
    } else if (currentRank === ranks[ranks.length - 1]) { // If King (highest)
      hiLabel = "Higher or Same";
      loLabel = "Lower";
    } else {
      hiLabel = "Higher or Same";
      loLabel = "Lower or Same";
    }
    
    return { hiLabel, loLabel };
  };
  
  const { hiLabel, loLabel } = getCurrentCardLabel();

  return (
    <div className="flex flex-col gap-2 wrap svelte-73syg7">
      {/* Profit Higher */}
      <div className="profit">
        <label className="flex flex-col gap-1">
          <span
            style={{ color: "rgb(177, 186, 211)" }}
            className="text-xs font-bold mb-1"
          >
            Profit {hiLabel} ({hiMultiplier}×)
          </span>
          <div
            className="flex items-center gap-2 rounded px-2 py-1 shadow"
            style={{ backgroundColor: "rgb(47, 69, 83)" }}
          >
            <span className="">
              <svg fill="currentColor" viewBox="0 0 64 64" className="svg-icon" style={{ color: "#ffce00" }}>
                <title></title>
                <path d="M32.271 17 9.201 40.071 16.128 47l16.145-16.145L48.418 47l6.93-6.929L32.275 17z"></path>
              </svg>
            </span>
            <input
              autoComplete="on"
              readOnly
              className="input w-10 bg-transparent flex-1 text-gray-200 text-center outline-none border-0 focus:ring-0"
              type="text"
              data-test="profit-input"
              value={hiProfit}
            />
            <span>
              <svg fill="none" viewBox="0 0 96 96" className="svg-icon" > 
                <title></title> 
                <path fill="#26A17B" d="M96 48c0 26.51-21.49 48-48 48S0 74.51 0 48 21.49 0 48 0s48 21.49 48 48"></path>
                <path fill="#fff" d="M53.766 52.149v-.006c-.33.024-2.031.126-5.826.126-3.03 0-5.163-.09-5.913-.126v.009c-11.664-.513-20.37-2.544-20.37-4.974 0-2.427 8.706-4.458 20.37-4.98v7.932c.762.054 2.946.183 5.964.183 3.62 0 5.436-.15 5.775-.18v-7.929c11.64.519 20.325 2.55 20.325 4.974 0 2.43-8.685 4.455-20.325 4.971m0-10.77v-7.098h16.242V23.457H25.785v10.824h16.242v7.095c-13.2.606-23.127 3.222-23.127 6.354s9.927 5.745 23.127 6.354V76.83h11.739V54.078c13.179-.606 23.082-3.219 23.082-6.348s-9.903-5.742-23.082-6.351"></path>
              </svg>
            </span>
          </div>
        </label>
      </div>
      
      {/* Profit Lower */}
      <div className="profit">
        <label className="flex flex-col gap-1">
          <span
            style={{ color: "rgb(177, 186, 211)" }}
            className="text-xs font-bold mb-1"
          >
            Profit {loLabel} ({loMultiplier}×)
          </span>
          <div
            className="flex items-center gap-2 rounded px-2 py-1 shadow input-wrap svelte-1w7n5sk"
            style={{ backgroundColor: "rgb(47, 69, 83)" }}
          >
            <span>
              <svg fill="currentColor" viewBox="0 0 64 64" className="svg-icon w-5 h-5" style={{ color: "#7F47FD" }}>
                <title></title>
                <path d="M0 15.365h64v11.428H0zm0 21.842h64v11.428H0z"></path>
              </svg>
            </span>
            <input
              autoComplete="on"
              readOnly
              className="input bg-transparent w-10 flex-1 text-gray-200 text-center outline-none border-0 focus:ring-0"
              type="text"
              data-test="profit-input"
              value={loProfit}
            />
            <span>
              <svg fill="none" viewBox="0 0 96 96" className="svg-icon w-5 h-5">
                <title></title>
                <path fill="#26A17B" d="M96 48c0 26.51-21.49 48-48 48S0 74.51 0 48 21.49 0 48 0s48 21.49 48 48"></path>
                <path fill="#fff" d="M53.766 52.149v-.006c-.33.024-2.031.126-5.826.126-3.03 0-5.163-.09-5.913-.126v.009c-11.664-.513-20.37-2.544-20.37-4.974 0-2.427 8.706-4.458 20.37-4.98v7.932c.762.054 2.946.183 5.964.183 3.62 0 5.436-.15 5.775-.18v-7.929c11.64.519 20.325 2.55 20.325 4.974 0 2.43-8.685 4.455-20.325 4.971m0-10.77v-7.098h16.242V23.457H25.785v10.824h16.242v7.095c-13.2.606-23.127 3.222-23.127 6.354s9.927 5.745 23.127 6.354V76.83h11.739V54.078c13.179-.606 23.082-3.219 23.082-6.348s-9.903-5.742-23.082-6.351"></path>
              </svg>
            </span>
          </div>
        </label>
      </div>
      
      {/* Profit Same */}
      <div className="profit">
        <label className="flex flex-col gap-1">
          <span
            style={{ color: "rgb(177, 186, 211)" }}
            className="text-xs font-bold mb-1"
          >
            Profit Same ({sameMultiplier}×)
          </span>
          <div
            className="flex items-center gap-2 rounded px-2 py-1 shadow"
            style={{ backgroundColor: "rgb(47, 69, 83)" }}
          >
            <span className="w-5 h-5 flex items-center justify-center">
              <svg fill="currentColor" viewBox="0 0 64 64" className="svg-icon w-5 h-5" style={{ color: "#4ade80" }}>
                <title></title>
                <path d="M32 0C14.327 0 0 14.327 0 32c0 17.673 14.327 32 32 32s32-14.327 32-32C64 14.327 49.673 0 32 0zm0 51.2C21.376 51.2 12.8 42.624 12.8 32S21.376 12.8 32 12.8 51.2 21.376 51.2 32 42.624 51.2 32 51.2z"></path>
              </svg>
            </span>
            <input
              autoComplete="on"
              readOnly
              className="input bg-transparent w-10 flex-1 text-gray-200 text-center outline-none border-0 focus:ring-0"
              type="text"
              data-test="profit-input"
              value={sameProfit}
            />
            <span>
              <svg fill="none" viewBox="0 0 96 96" className="svg-icon w-5 h-5">
                <title></title>
                <path fill="#26A17B" d="M96 48c0 26.51-21.49 48-48 48S0 74.51 0 48 21.49 0 48 0s48 21.49 48 48"></path>
                <path fill="#fff" d="M53.766 52.149v-.006c-.33.024-2.031.126-5.826.126-3.03 0-5.163-.09-5.913-.126v.009c-11.664-.513-20.37-2.544-20.37-4.974 0-2.427 8.706-4.458 20.37-4.98v7.932c.762.054 2.946.183 5.964.183 3.62 0 5.436-.15 5.775-.18v-7.929c11.64.519 20.325 2.55 20.325 4.974 0 2.43-8.685 4.455-20.325 4.971m0-10.77v-7.098h16.242V23.457H25.785v10.824h16.242v7.095c-13.2.606-23.127 3.222-23.127 6.354s9.927 5.745 23.127 6.354V76.83h11.739V54.078c13.179-.606 23.082-3.219 23.082-6.348s-9.903-5.742-23.082-6.351"></path>
              </svg>
            </span>
          </div>
        </label>
      </div>
    </div>
  );
}