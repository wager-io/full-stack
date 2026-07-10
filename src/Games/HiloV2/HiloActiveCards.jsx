// import React, { useRef, useEffect, useState } from 'react';
// import { useHiloGame } from './context/HiloContext';
// import useDeck from "./hooks/deck";
// import "./HiloGameView.css"; // Import the CSS for styling

// const cardBackUrl = 'url(/assets/hilo/back-none.BGcPpGyo.svg)';

// // Card component styled like HiloGameView
// function Card({ value = "A", color = "var(--grey-600)", faceDown = true, icon = null, animate = false, suite = "♠" }) {
//   return (
//     <button
//       className={`wrap svelte-1cwyebm ${animate ? "card-slide-in-right" : ""}`}
//       disabled
//       style={{ margin: 0, padding: 0, background: "none" }}
//     >
//       <div className="horizontal svelte-1cwyebm" style={{ "--transition-time": "300ms" }}>
//         <div
//           className={`content svelte-1cwyebm small${faceDown ? " face-down" : ""}`}
//           style={{ width: "5em", height: "7.9em", "--transition-time": "300ms" }}
//         >
//           <div className="face none svelte-1cwyebm">
//             <div className="face-content svelte-ofo6ka small" style={{ color }}>
//               <span>{value}</span>
//               <span className="suite">{suite}</span>
//               {icon}
//             </div>
//           </div>
//           <div
//             className="back svelte-1cwyebm"
//             style={{
//               backgroundImage: cardBackUrl,
//             }}
//           ></div>
//         </div>
//       </div>
//     </button>
//   );
// }

// // Helper to get icon for card value
// function getCardIcon(value) {
//   if (value === "J" || value === "Q" || value === "K") {
//     return (
//       <svg fill="currentColor" viewBox="0 0 64 64" className="svg-icon">
//         <title></title>
//         <path fillRule="evenodd" d="m37.036 2.1 24.875 24.865a7.1 7.1 0 0 1 2.09 5.04c0 1.969-.799 3.75-2.09 5.04L37.034 61.91a7.08 7.08 0 0 1-5.018 2.077c-.086 0-.174 0-.25-.004v.004h-.01a7.07 7.07 0 0 1-4.79-2.072L2.089 37.05A7.1 7.1 0 0 1 0 32.009c0-1.97.798-3.75 2.09-5.04L26.965 2.102v.002A7.07 7.07 0 0 1 31.754.02l.002-.004h-.012l.264-.004A7.08 7.08 0 0 1 37.036 2.1" clipRule="evenodd"></path>
//       </svg>
//     );
//   } else if (value === "7") {
//     return (
//       <svg fill="currentColor" viewBox="0 0 64 64" className="svg-icon">
//         <title></title>
//         <path fillRule="evenodd" d="M30.907 55.396.457 24.946v.002A1.55 1.55 0 0 1 0 23.843c0-.432.174-.82.458-1.104l14.13-14.13a1.55 1.55 0 0 1 1.104-.458c.432 0 .821.175 1.104.458l14.111 14.13c.272.272.645.443 1.058.453l.1-.013h.004a1.55 1.55 0 0 0 1.045-.452l14.09-14.09a1.55 1.55 0 0 1 1.104-.457c.432 0 .82.174 1.104.457l14.13 14.121a1.557 1.557 0 0 1 0 2.209L33.114 55.396v-.002c-.27.268-.637.438-1.046.452v.001h.003l-.04.002h-.029c-.427 0-.815-.173-1.095-.453" clipRule="evenodd"></path>
//       </svg>
//     );
//   } else {
//    return (
//       <svg fill="currentColor" viewBox="0 0 64 64" className="svg-icon">
//         <title></title>
//         <circle cx="32" cy="32" r="28" />
//       </svg>
//     );
//   }
// }

import React, { useRef, useEffect, useState } from 'react';
import { useHiloGame } from './context/HiloContext';
import useDeck from "./hooks/deck";
import "./HiloGameView.css"; // Import the CSS for styling

const cardBackUrl = 'url(/assets/hilo/hilo-card.png)';

// Card component styled like HiloGameView
function Card({ value = "A", color = "var(--grey-600)", faceDown = true, icon = null, animate = false, suite = "♠" }) {
  return (
    <button
      className={`wrap svelte-1cwyebm ${animate ? "card-slide-in-right" : ""}`}
      disabled
      style={{ margin: 2, padding: 2, background: "none" }}
    >
      <div className="horizontal svelte-1cwyebm" style={{ "--transition-time": "300ms" }}>
        <div
          className={`content svelte-1cwyebm small${faceDown ? " face-down" : ""}`}
          style={{ width: "5.5em", height: "7.9em", "--transition-time": "300ms" }}
        >
          <div className="face none svelte-1cwyebm">
            <div className="face-content svelte-ofo6ka small" style={{ color, fontSize: "2.5em" }}>
              <span>{value}</span>
              <span className="suite">{suite}</span>
            </div>
          </div>
          <div
            className="back svelte-1cwyebm"
            style={{
              backgroundImage: cardBackUrl,
            }}
          ></div>
        </div>
      </div>
    </button>
  );
}

// Helper to get icon for card value
function getCardIcon(value) {
  if (value === "J" || value === "Q" || value === "K") {
    return (
      <svg fill="currentColor" viewBox="0 0 64 64" className="svg-icon">
        <title></title>
        <path fillRule="evenodd" d="m37.036 2.1 24.875 24.865a7.1 7.1 0 0 1 2.09 5.04c0 1.969-.799 3.75-2.09 5.04L37.034 61.91a7.08 7.08 0 0 1-5.018 2.077c-.086 0-.174 0-.25-.004v.004h-.01a7.07 7.07 0 0 1-4.79-2.072L2.089 37.05A7.1 7.1 0 0 1 0 32.009c0-1.97.798-3.75 2.09-5.04L26.965 2.102v.002A7.07 7.07 0 0 1 31.754.02l.002-.004h-.012l.264-.004A7.08 7.08 0 0 1 37.036 2.1" clipRule="evenodd"></path>
      </svg>
    );
  } else if (value === "7") {
    return (
      <svg fill="currentColor" viewBox="0 0 64 64" className="svg-icon">
        <title></title>
        <path fillRule="evenodd" d="M30.907 55.396.457 24.946v.002A1.55 1.55 0 0 1 0 23.843c0-.432.174-.82.458-1.104l14.13-14.13a1.55 1.55 0 0 1 1.104-.458c.432 0 .821.175 1.104.458l14.111 14.13c.272.272.645.443 1.058.453l.1-.013h.004a1.55 1.55 0 0 0 1.045-.452l14.09-14.09a1.55 1.55 0 0 1 1.104-.457c.432 0 .82.174 1.104.457l14.13 14.121a1.557 1.557 0 0 1 0 2.209L33.114 55.396v-.002c-.27.268-.637.438-1.046.452v.001h.003l-.04.002h-.029c-.427 0-.815-.173-1.095-.453" clipRule="evenodd"></path>
      </svg>
    );
  } else {
   return (
      <svg fill="currentColor" viewBox="0 0 64 64" className="svg-icon">
        <title></title>
        <circle cx="32" cy="32" r="28" />
      </svg>
    );
  }
}

export default function HiloActiveCards() {
  const { hiloGame } = useHiloGame();
  const { getCardRank, getCardSuite } = useDeck();
  const [animateIdx, setAnimateIdx] = useState(-1);
  const lastCardValue = useRef();
  
  // Process rounds from hiloGame to create card objects using the deck hook
  // This needs to be done regardless of whether we'll display cards or not
  const cardsToShow = React.useMemo(() => {
    if (!hiloGame || !hiloGame.rounds || hiloGame.rounds.length === 0) {
      return [];
    }
    
    return hiloGame.rounds.map(round => {
      const cardNumber = round.card; // Get the card number from the round
      const rank = getCardRank(cardNumber); // Get the rank using the deck hook
      const suite = getCardSuite(cardNumber); // Get the suite using the deck hook
      const isRed = suite === '♥' || suite === '♦'; // Determine if the card is red
      
      return {
        value: rank,
        suite: suite,
        color: isRed ? "var(--red-500)" : "var(--grey-600)",
        faceDown: false
      };
    });
  }, [hiloGame, getCardRank, getCardSuite]);

  // Animate the last card if its value changes
  useEffect(() => {
    const last = cardsToShow.length > 0 ? cardsToShow[cardsToShow.length - 1] : null;
    if (last && last.value !== lastCardValue.current) {
      setAnimateIdx(cardsToShow.length - 1);
      lastCardValue.current = last.value;
    } else {
      setAnimateIdx(-1);
    }
  }, [cardsToShow]);

  // If there are no cards to show, don't render anything
  // if (cardsToShow.length === 0) {
  //   return null;
  // }

  return (
    <div className="footer scrollX svelte-1drtpsl">
      <div className="slide-down svelte-1drtpsl" style={{ "--slide-down-duration": "300ms" }}>
        {cardsToShow.length === 0 ? "" :
        cardsToShow.map((card, idx) => {
          // Label logic:
          // - First card: "Start Card"
          // - Last card: "Current Card"
          // - Others: no label
          let label = "";
          if (idx === 0) label = "Start Card";
          else if (idx === cardsToShow.length - 1) label = "Current Card";
          return (
            <div className="slide-in svelte-qwqjm5" key={idx}>
              {hiloGame ? 
              <Card
                value={card.value}
                color={card.color}
                suite={card.suite}
                faceDown={false}
                icon={getCardIcon(card.value)}
                animate={idx === animateIdx}
              /> : ""}
              {label && (
                <div className="payout-multiplier svelte-3yz8ax positive">{label}</div>
              )}
            </div>
          );
        })}  
      </div>
    </div>
  );
}