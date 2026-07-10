import PlinkoBoard from './PlinkoBoard';

// Create a singleton instance
const plinkoBoardInstance = new PlinkoBoard();

/**
 * Creates and initializes a Plinko board
 * @param {HTMLCanvasElement} canvas - Canvas element for rendering
 * @param {Object} config - Configuration object
 * @returns {Promise<PlinkoBoard>} Promise that resolves to the board instance
 */
 async function createPlinkoBoard(canvas, config) {
  if (!plinkoBoardInstance.initialized) {
    await plinkoBoardInstance.initialize(canvas, config);
  } else {
    plinkoBoardInstance.canvas = canvas;
    plinkoBoardInstance.resize(config.width, config.height);
    plinkoBoardInstance.updateConfig(config);
  }
  
  return plinkoBoardInstance;
}

/**
 * Get the singleton instance of the Plinko board
 * @returns {PlinkoBoard} The Plinko board instance
 */
 function getInstance() {
  return plinkoBoardInstance;
}

export default {
  getInstance,
  createPlinkoBoard
}