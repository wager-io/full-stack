/**
 * Animates a countdown from 0.00 to the final result value
 * @param {number} finalResult - The final multiplier result to count up to
 * @param {function} updateCallback - Callback function to update the UI with current value
 * @param {function} completeCallback - Callback function called when animation completes
 * @param {number} duration - Duration of the animation in milliseconds (default: 2000)
 * @param {number} fps - Frames per second for the animation (default: 30)
 */
export const animateResult = (finalResult, updateCallback, completeCallback, duration = 2000, fps = 30) => {
  // Ensure finalResult is a number and at least 1.00
  const result = Math.max(1.00, parseFloat(finalResult));
  
  // Calculate total frames based on duration and fps
  const totalFrames = Math.floor(duration / 1000 * fps);
  
  // Current frame counter
  let currentFrame = 0;
  
  // Starting value
  let currentValue = 1.00;
  
  // Determine if we need to use exponential or linear animation
  const useExponential = result > 10;
  
  // For exponential animation, calculate the base multiplier per frame
  const expBase = useExponential ? Math.pow(result, 1 / totalFrames) : 1;
  
  // For linear animation, calculate the increment per frame
  const linearIncrement = (result - currentValue) / totalFrames;
  
  // Start the animation interval
  const intervalId = setInterval(() => {
    currentFrame++;
    
    if (currentFrame >= totalFrames) {
      // Animation complete, set to final value
      clearInterval(intervalId);
      updateCallback(result.toFixed(2));
      if (completeCallback) completeCallback();
      return;
    }
    
    // Calculate the next value
    if (useExponential) {
      // Exponential growth for larger numbers
      currentValue = Math.pow(expBase, currentFrame);
    } else {
      // Linear growth for smaller numbers
      currentValue += linearIncrement;
    }
    
    // Ensure we don't exceed the final result
    currentValue = Math.min(currentValue, result);
    
    // Update the UI with the current value
    updateCallback(currentValue.toFixed(2));
  }, 1000 / fps);
  
  // Return a function to cancel the animation if needed
  return () => clearInterval(intervalId);
};

/**
 * Creates a more dramatic animation for Limbo results
 * @param {number} finalResult - The final multiplier result to count up to
 * @param {function} updateCallback - Callback function to update the UI with current value
 * @param {function} completeCallback - Callback function called when animation completes
 */
export const animateLimboResult = (finalResult, updateCallback, completeCallback) => {
  // Ensure finalResult is a number and at least 1.00
  const result = Math.max(1.00, parseFloat(finalResult));
  
  // Use a simpler, more performant animation approach
  const duration = result > 50 ? 2000 : result > 10 ? 1500 : 1000;
  const startTime = performance.now();
  let animationFrameId;
  
  const animate = (currentTime) => {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);
    
    // Use a simple easing function for smooth animation
    const easedProgress = progress < 0.5 
      ? 2 * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    
    // Calculate current value based on result size
    let currentValue;
    if (result <= 2) {
      // For small results, simple linear interpolation
      currentValue = 1 + (result - 1) * easedProgress;
    } else if (result <= 10) {
      // For medium results, slightly accelerated at the beginning
      currentValue = 1 + (result - 1) * Math.pow(easedProgress, 0.8);
    } else {
      // For large results, use a more dramatic curve
      // Start slow, accelerate in the middle, then slow down at the end
      if (easedProgress < 0.3) {
        // Slow start
        currentValue = 1 + (2 - 1) * (easedProgress / 0.3);
      } else if (easedProgress < 0.7) {
        // Fast middle
        const midProgress = (easedProgress - 0.3) / 0.4;
        currentValue = 2 + (result * 0.7 - 2) * midProgress;
      } else {
        // Slow end
        const endProgress = (easedProgress - 0.7) / 0.3;
        currentValue = result * 0.7 + (result - result * 0.7) * endProgress;
      }
    }
    
    // Update UI
    updateCallback(currentValue.toFixed(2));
    
    // Continue or complete animation
    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      // Ensure final value is exactly the result
      updateCallback(result.toFixed(2));
      if (completeCallback) completeCallback();
    }
  };
  
  // Start animation
  animationFrameId = requestAnimationFrame(animate);
  
  // Return cancel function
  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  };
};

/**
 * Simple usage example:
 * 
 * // In your component:
 * import { animateLimboResult } from './resultCountDown';
 * 
 * // When you receive game result:
 * const result = 5.23; // The final multiplier from the game
 * 
 * animateLimboResult(
 *   result,
 *   (currentValue) => {
 *     // Update your UI with the current value
 *     setDisplayValue(currentValue);
 *   },
 *   () => {
 *     // Animation complete callback
 *     console.log('Animation complete!');
 *   }
 * );
 */

// Export both functions as named exports only
// Remove the default export that was causing the conflict
