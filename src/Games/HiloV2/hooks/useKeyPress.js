import { useState, useEffect } from 'react';

/**
 * A custom hook that detects when a specific key is pressed
 * @param {string} targetKey - The key to detect (e.g., 'a', 'Enter', 'Escape')
 * @returns {boolean} - True if the key is currently pressed, false otherwise
 */
export const useKeyPress = (targetKey) => {
  // State to track whether the key is pressed
  const [keyPressed, setKeyPressed] = useState(false);

  // Event handler for keydown
  const downHandler = ({ key }) => {
    if (key.toLowerCase() === targetKey.toLowerCase()) {
      setKeyPressed(true);
    }
  };

  // Event handler for keyup
  const upHandler = ({ key }) => {
    if (key.toLowerCase() === targetKey.toLowerCase()) {
      setKeyPressed(false);
    }
  };

  // Add event listeners
  useEffect(() => {
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [targetKey]); // Only re-run if targetKey changes

  return keyPressed;
};