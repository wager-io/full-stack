// Card deck definition
export const createFullDeck = () => [
  // Hearts (red)
  { value: 'A', suit: 'h', isRed: true },
  { value: '2', suit: 'h', isRed: true },
  { value: '3', suit: 'h', isRed: true },
  { value: '4', suit: 'h', isRed: true },
  { value: '5', suit: 'h', isRed: true },
  { value: '6', suit: 'h', isRed: true },
  { value: '7', suit: 'h', isRed: true },
  { value: '8', suit: 'h', isRed: true },
  { value: '9', suit: 'h', isRed: true },
  { value: '10', suit: 'h', isRed: true },
  { value: 'J', suit: 'h', isRed: true },
  { value: 'Q', suit: 'h', isRed: true },
  { value: 'K', suit: 'h', isRed: true },
  
  // Diamonds (red)
  { value: 'A', suit: 'd', isRed: true },
  { value: '2', suit: 'd', isRed: true },
  { value: '3', suit: 'd', isRed: true },
  { value: '4', suit: 'd', isRed: true },
  { value: '5', suit: 'd', isRed: true },
  { value: '6', suit: 'd', isRed: true },
  { value: '7', suit: 'd', isRed: true },
  { value: '8', suit: 'd', isRed: true },
  { value: '9', suit: 'd', isRed: true },
  { value: '10', suit: 'd', isRed: true },
  { value: 'J', suit: 'd', isRed: true },
  { value: 'Q', suit: 'd', isRed: true },
  { value: 'K', suit: 'd', isRed: true },
  
  // Clubs (black)
  { value: 'A', suit: 'c', isRed: false },
  { value: '2', suit: 'c', isRed: false },
  { value: '3', suit: 'c', isRed: false },
  { value: '4', suit: 'c', isRed: false },
  { value: '5', suit: 'c', isRed: false },
  { value: '6', suit: 'c', isRed: false },
  { value: '7', suit: 'c', isRed: false },
  { value: '8', suit: 'c', isRed: false },
  { value: '9', suit: 'c', isRed: false },
  { value: '10', suit: 'c', isRed: false },
  { value: 'J', suit: 'c', isRed: false },
  { value: 'Q', suit: 'c', isRed: false },
  { value: 'K', suit: 'c', isRed: false },
  
  // Spades (black)
  { value: 'A', suit: 's', isRed: false },
  { value: '2', suit: 's', isRed: false },
  { value: '3', suit: 's', isRed: false },
  { value: '4', suit: 's', isRed: false },
  { value: '5', suit: 's', isRed: false },
  { value: '6', suit: 's', isRed: false },
  { value: '7', suit: 's', isRed: false },
  { value: '8', suit: 's', isRed: false },
  { value: '9', suit: 's', isRed: false },
  { value: '10', suit: 's', isRed: false },
  { value: 'J', suit: 's', isRed: false },
  { value: 'Q', suit: 's', isRed: false },
  { value: 'K', suit: 's', isRed: false }
];

// Format percentage for display
export const formatPercentage = (value) => {
  return `${(value * 100).toFixed(2)}%`;
};