import React, { useState, useEffect, useRef } from 'react';
import { useLimboGame } from './LimboContext';
import './style.css';
import MultiplierView from './MultiplierView';
import LimboHistory from "./LimboHistory";
import { animateLimboResult } from "./resultCountDown";

const LimboCanvas = () => {
  const { gameState, lastRoll, mode, target, handleTargetChange, showResult, onAnimationComplete } = useLimboGame();
  const [displayValue, setDisplayValue] = useState("0.00");
  const [animationComplete, setAnimationComplete] = useState(false);
  const animationRef = useRef(null);
  const lastRollRef = useRef(null);

  // Handle animation when lastRoll changes
  useEffect(() => {
    // Prevent duplicate animations for the same roll
    // console.log('[LimboCanvas] Checking animation trigger:', { lastRoll, currentRef: lastRollRef.current });
    if (lastRoll?.roll && (!lastRollRef.current || lastRollRef.current.betId !== lastRoll.betId)) {
      console.log('[LimboCanvas] Starting animation for roll:', lastRoll.roll);
      // Update the lastRollRef to track this roll
      lastRollRef.current = lastRoll;

      // Cancel any existing animation
      if (animationRef.current) {
        animationRef.current();
        animationRef.current = null;
      }

      // Reset display value to start animation from 1.00
      setDisplayValue("1.00");
      // Reset animation state
      setAnimationComplete(false);

      // Start new animation and store the cancellation function
      const cancelAnimation = animateLimboResult(
        parseFloat(lastRoll.roll),
        (currentValue) => {
          // console.log('[LimboCanvas] Animation update:', currentValue);
          setDisplayValue(currentValue);
        },
        () => {
          console.log('[LimboCanvas] Animation complete');
          // Animation complete callback
          // Set animation as complete to change text color
          setAnimationComplete(true);
          // Add the bet to recent bets after animation completes
          onAnimationComplete();
          // Clear the animation reference
          animationRef.current = null;
        }
      );

      // Store the cancellation function
      animationRef.current = cancelAnimation;
    } else if (!lastRoll) {
      // No roll data, reset to 0.00
      setDisplayValue("0.00");
      setAnimationComplete(false);
      lastRollRef.current = null;
    }

    // Cleanup function to cancel animation when component unmounts or lastRoll changes
    return () => {
      if (animationRef.current) {
        animationRef.current();
        animationRef.current = null;
      }
    };
  }, [lastRoll, onAnimationComplete]);

  // Determine text color based on animation state and game result
  const getTextColorClass = () => {
    if (!lastRoll || !animationComplete) {
      return "text-white"; // White during animation or when no roll
    }
    return lastRoll.won ? "text-green-600" : "text-red-600"; // Green for win, red for loss
  };

  return (
    <div className="flex-grow relative rounded-lg overflow-hidden">
      <div className="w-full mb-4 md:mb-12">
        <LimboHistory />
      </div>
      <div className='relative'>
        <div className="content svelte-1otmwc3 pb-0 md:pb-10">
          <div className='flex justify-center items-center py-2 md:py-8 mb-12'>
            <h1 className={`text-[50px] md:text-[120px] ${getTextColorClass()} font-bold`}>
              {displayValue}x
            </h1>
          </div>
        </div>
        <MultiplierView />
      </div>
    </div>
  );
};
export default LimboCanvas;