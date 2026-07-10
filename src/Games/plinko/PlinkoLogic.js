
export const PAYOUTS = {
  1: {
    8: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
    9: [5.6, 2, 1.6, 1, 0.7, 0.7, 1, 1.6, 2, 5.6],
    10: [8.9, 3, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 3, 8.9],
    11: [8.4, 3, 1.9, 1.3, 1, 0.7, 0.7, 1, 1.3, 1.9, 3, 8.4],
    12: [10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10],
    13: [8.1, 4, 3, 1.9, 1.2, 0.9, 0.7, 0.7, 0.9, 1.2, 1.9, 3, 4, 8.1],
    14: [7.1, 4, 1.9, 1.4, 1.3, 1.1, 1, 0.5, 1, 1.1, 1.3, 1.4, 1.9, 4, 7.1],
    15: [15, 8, 3, 2, 1.5, 1.1, 1, 0.7, 0.7, 1, 1.1, 1.5, 2, 3, 8, 15],
    16: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
  },
  2: {
    8: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
    9: [18, 4, 1.7, 0.9, 0.5, 0.5, 0.9, 1.7, 4, 18],
    10: [22, 5, 2, 1.4, 0.6, 0.4, 0.6, 1.4, 2, 5, 22],
    11: [24, 6, 3, 1.8, 0.7, 0.5, 0.5, 0.7, 1.8, 3, 6, 24],
    12: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
    13: [43, 13, 6, 3, 1.3, 0.7, 0.4, 0.4, 0.7, 1.3, 3, 6, 13, 43],
    14: [58, 15, 7, 4, 1.9, 1, 0.5, 0.2, 0.5, 1, 1.9, 4, 7, 15, 58],
    15: [88, 18, 11, 5, 3, 1.3, 0.5, 0.3, 0.3, 0.5, 1.3, 3, 5, 11, 18, 88],
    16: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
  },
  3: {
    8: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
    9: [43, 7, 2, 0.6, 0.2, 0.2, 0.6, 2, 7, 43],
    10: [76, 10, 3, 0.9, 0.3, 0.2, 0.3, 0.9, 3, 10, 76],
    11: [120, 14, 5.2, 1.4, 0.4, 0.2, 0.2, 0.4, 1.4, 5.2, 14, 120],
    12: [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170],
    13: [260, 37, 11, 4, 1, 0.2, 0.2, 0.2, 0.2, 1, 4, 11, 37, 260],
    14: [420, 56, 18, 5, 1.9, 0.3, 0.2, 0.2, 0.2, 0.3, 1.9, 5, 18, 56, 420],
    15: [620, 83, 27, 8, 3, 0.5, 0.2, 0.2, 0.2, 0.2, 0.5, 3, 8, 27, 83, 620],
    16: [1e3, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1e3],
  },
};

// Calculate the binomial coefficient C(n, k)
function binomial(n, k) {
  let coeff = 1;
  for (let i = 1; i <= k; i++) {
    coeff *= (n - (k - i)) / i;
  }
  return coeff;
}

// Calculate the probability for each slot in a Plinko board
export function calculateProbabilities(minRows, maxRows) {
  const result = {};
  for (let rows = minRows; rows <= maxRows; rows++) {
    result[rows] = [];
    // For a board that starts with 3 pegs, we'll have rows + 3 slots
    const slots = rows + 3;
    
    // Calculate probabilities based on binomial distribution
    for (let i = 0; i < slots; i++) {
      // Adjust the probability calculation for a board with 3 initial pegs
      const n = rows;
      const k = Math.min(Math.max(0, i - 1), n); // Adjust for the offset
      result[rows][i] = binomial(n, k) * Math.pow(0.5, n);
    }
  }
  return result;
}

// Simulate a Plinko drop path (returns the slot index)
export function simulatePlinkoDrop({ rows = 8, rng }) {
  // rng: a function that returns a float in [0,1)
  // If not provided, use Math.random (not provably fair)
  
  // Start position (for 3 pegs, we have 4 possible starting positions)
  let position = 1; // Start in the middle (between pegs 1 and 2)
  
  // Simulate the ball's path through each row
  for (let i = 0; i < rows; i++) {
    if ((rng ? rng() : Math.random()) > 0.5) {
      position += 1;
    }
  }
  
  return position;
}

// Get payout for a given risk, rows, and slot index
export function getPayout(risk, rows, slotIndex) {
  const payouts = PAYOUTS[risk]?.[rows];
  if (!payouts) return 0;
  return payouts[slotIndex];
}