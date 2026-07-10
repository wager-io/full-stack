import { useState, useEffect } from 'react';

export const useCardAnimation = () => {
  const [animatingCard, setAnimatingCard] = useState(false);
  const [previousCard, setPreviousCard] = useState(null);
  const [initialCardShown, setInitialCardShown] = useState(true);
  const [showPreviousCard, setShowPreviousCard] = useState(false);
  const [showCurrentCard, setShowCurrentCard] = useState(true);
  const [flyDirection, setFlyDirection] = useState('right');
  const [browsingDeck, setBrowsingDeck] = useState(false);
  const [currentDeckIndex, setCurrentDeckIndex] = useState(0);

  // Add custom styles for the animations
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .card-exiting {
        opacity: 0;
        transform: translateY(-100px) rotate(${flyDirection === 'right' ? '20deg' : '-20deg'});
      }
      .card-exited {
        display: none;
      }
      .card-entering {
        opacity: 0;
        transform: translateY(10px) scale(0.95);
      }
      .card-entered {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [flyDirection]);

  const handleNextCard = (fullDeck) => {
    if (animatingCard) return;
    
    setAnimatingCard(true);
    
    // Alternate fly direction for visual interest
    const direction = flyDirection === 'right' ? 'left' : 'right';
    setFlyDirection(direction);
    
    // Show the previous card for animation
    setShowPreviousCard(true);
    
    if (initialCardShown) {
      setPreviousCard(fullDeck[0]);
      setInitialCardShown(false);
      setBrowsingDeck(true);
      setCurrentDeckIndex(1);
    } else {
      setPreviousCard(fullDeck[currentDeckIndex]);
      setCurrentDeckIndex((prev) => (prev + 1) % fullDeck.length);
    }
    
    // Hide current card briefly
    setShowCurrentCard(false);
    
    // Show new card after a short delay
    setTimeout(() => {
      setShowCurrentCard(true);
      setShowPreviousCard(false);
      
      // Animation complete
      setTimeout(() => {
        setAnimatingCard(false);
      }, 300);
    }, 300);
  };

  return {
    animatingCard,
    previousCard,
    initialCardShown,
    showPreviousCard,
    showCurrentCard,
    flyDirection,
    browsingDeck,
    currentDeckIndex,
    handleNextCard,
    setCurrentDeckIndex
  };
};