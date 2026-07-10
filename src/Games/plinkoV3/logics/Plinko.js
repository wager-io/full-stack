import EventEmitter from '../../../logics/EventEmitter';
import Matter from 'matter-js';
import { makeObservable, observable, action } from 'mobx';

/**
 * Calculate probabilities for Plinko game
 * @param {number} startRow - Starting row
 * @param {number} endRow - Ending row
 * @returns {Object} - Probability map
 */
function calculateProbabilities(startRow, endRow) {
  let probabilities = {};
  
  // Generate Pascal's Triangle
  const pascalTriangle = (function (rows) {
    let triangle = [];
    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
      triangle[rowIndex] = [];
      for (let colIndex = 0; colIndex < rowIndex + 1; colIndex++) {
        let value = colIndex === 0 || colIndex === rowIndex
          ? 1
          : triangle[rowIndex - 1][colIndex - 1] + triangle[rowIndex - 1][colIndex];
        triangle[rowIndex][colIndex] = value;
      }
    }
    return triangle;
  })(++endRow);
  
  // Calculate probabilities for each row
  for (let row = startRow; row < endRow; row++) {
    let total = pascalTriangle[row].reduce((sum, num) => sum + num, 0);
    probabilities[row] = [];
    pascalTriangle[row].forEach((num) => probabilities[row].push(num / total));
  }
  
  return probabilities;
}

/**
 * Plinko game class
 * Handles the Matter.js physics engine and game logic
 */
export default class Plinko extends EventEmitter {
  constructor(
    game,
    rows = 8,
    risk = 1,
    payouts,
    isFast = false,
    width = 700,
    height = 400
  ) {
    super(game);
    
    // Game properties
    this.game = game;
    this.width = width;
    this.height = height;
    
    // Validate and set payouts
    this.payout = this.validatePayouts(payouts, rows, risk);
    this.chance = calculateProbabilities(8, 16);
    this.rows = rows;
    this.risk = risk;
    this.isFast = isFast;
    this.running = false;
    this.balls = [];
    this.pins = [];
    this.buckets = [];
    
    // Matter.js modules
    this.Engine = Matter.Engine;
    this.Render = Matter.Render;
    this.Runner = Matter.Runner;
    this.Bodies = Matter.Bodies;
    this.Composite = Matter.Composite;
    this.Events = Matter.Events;
    
    // Create engine
    this.engine = this.Engine.create({
      enableSleeping: true,
      gravity: { x: 0, y: 1 }
    });
    
    // Create renderer
    this.render = this.Render.create({
      element: null, // Will be set later
      engine: this.engine,
      options: {
        width: this.width,
        height: this.height,
        wireframes: false,
        background: 'transparent',
        showSleeping: false,
        showDebug: false,
        showBroadphase: false,
        showBounds: false,
        showVelocity: false,
        showCollisions: false,
        showSeparations: false,
        showAxes: false,
        showPositions: false,
        showAngleIndicator: false,
        showIds: false,
        showShadows: false
      }
    });
    
    // Create runner
    this.runner = this.Runner.create({
      isFixed: true,
      delta: 1000 / 60
    });
    
    // Initialize the game
    this.init();
    
    // Make observable for MobX
    makeObservable(this, {
      isFast: observable,
      enableFast: action,
    });
  }

  // Add a method to validate payouts and provide defaults if needed
  validatePayouts(payouts, rows, risk) {
    // Default payouts for different risk levels and rows
    const defaultPayouts = {
      1: { // Low risk
        8: [5.6, 2.1, 1.5, 1.1, 0.9, 1.1, 1.5, 2.1, 5.6],
        9: [7.1, 3.2, 1.8, 1.3, 1.0, 1.0, 1.3, 1.8, 3.2, 7.1],
        10: [8.9, 4.0, 2.2, 1.5, 1.1, 0.9, 1.1, 1.5, 2.2, 4.0, 8.9],
        11: [10, 5.0, 2.7, 1.7, 1.2, 1.0, 1.0, 1.2, 1.7, 2.7, 5.0, 10],
        12: [13, 6.2, 3.3, 2.0, 1.4, 1.1, 0.9, 1.1, 1.4, 2.0, 3.3, 6.2, 13],
        13: [16, 7.9, 4.2, 2.4, 1.6, 1.2, 1.0, 1.0, 1.2, 1.6, 2.4, 4.2, 7.9, 16],
        14: [21, 9.8, 5.2, 2.9, 1.9, 1.3, 1.1, 0.9, 1.1, 1.3, 1.9, 2.9, 5.2, 9.8, 21],
        15: [26, 12, 6.4, 3.5, 2.2, 1.5, 1.2, 1.0, 1.0, 1.2, 1.5, 2.2, 3.5, 6.4, 12, 26],
        16: [33, 15, 7.9, 4.3, 2.6, 1.8, 1.3, 1.1, 0.9, 1.1, 1.3, 1.8, 2.6, 4.3, 7.9, 15, 33]
      },
      2: { // Medium risk
        8: [13, 3.5, 1.6, 0.7, 0.4, 0.7, 1.6, 3.5, 13],
        9: [19, 5.0, 2.0, 0.9, 0.5, 0.5, 0.9, 2.0, 5.0, 19],
        10: [27, 7.1, 2.5, 1.1, 0.6, 0.3, 0.6, 1.1, 2.5, 7.1, 27],
        11: [40, 10, 3.3, 1.4, 0.7, 0.4, 0.4, 0.7, 1.4, 3.3, 10, 40],
        12: [58, 14, 4.3, 1.7, 0.8, 0.5, 0.2, 0.5, 0.8, 1.7, 4.3, 14, 58],
        13: [88, 21, 5.9, 2.2, 1.0, 0.5, 0.3, 0.3, 0.5, 1.0, 2.2, 5.9, 21, 88],
        14: [130, 31, 8.1, 2.9, 1.2, 0.6, 0.3, 0.2, 0.3, 0.6, 1.2, 2.9, 8.1, 31, 130],
        15: [200, 46, 11, 3.7, 1.5, 0.7, 0.4, 0.2, 0.2, 0.4, 0.7, 1.5, 3.7, 11, 46, 200],
        16: [310, 68, 16, 4.9, 1.9, 0.9, 0.5, 0.3, 0.1, 0.3, 0.5, 0.9, 1.9, 4.9, 16, 68, 310]
      }
    };

    // If payouts is not provided or invalid, use defaults
    if (!payouts || typeof payouts !== 'object') {
      console.warn('Invalid payouts provided, using defaults');
      return defaultPayouts;
    }

    // Check if the required risk level exists
    if (!payouts[risk]) {
      console.warn(`Risk level ${risk} not found in payouts, using defaults`);
      return defaultPayouts;
    }

    // Check if the required row count exists for the risk level
    if (!payouts[risk][rows] || !Array.isArray(payouts[risk][rows])) {
      console.warn(`Row count ${rows} not found for risk level ${risk}, using defaults`);
      
      // If we have defaults for this configuration, use them
      if (defaultPayouts[risk] && defaultPayouts[risk][rows]) {
        payouts[risk][rows] = defaultPayouts[risk][rows];
      } else {
        // Generate a simple payout array if no defaults exist
        const length = rows + 1;
        payouts[risk][rows] = Array(length).fill(0).map((_, i) => {
          // Higher payouts at the edges, lower in the middle
          const position = Math.abs(i - (length - 1) / 2) / ((length - 1) / 2);
          return Math.max(0.1, position * 10);
        });
      }
    }

    return payouts;
  }

  /**
   * Update the game state
   */
  update() {
    if (this.table && this.table.running) {
      this.app.ticker.update();
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.app) {
      this.app.destroy(true);
    }
  }

  /**
   * Initialize the game
   */
  init() {
    // Create world boundaries
    const wallOptions = {
      isStatic: true,
      render: { visible: false }
    };
    
    // Walls to keep balls in bounds
    const leftWall = this.Bodies.rectangle(0, this.height / 2, 10, this.height, wallOptions);
    const rightWall = this.Bodies.rectangle(this.width, this.height / 2, 10, this.height, wallOptions);
    const ground = this.Bodies.rectangle(this.width / 2, this.height + 5, this.width, 10, wallOptions);
    
    // Add walls to world
    this.Composite.add(this.engine.world, [leftWall, rightWall, ground]);
    
    // Create pins
    this.createPins();
    
    // Create buckets
    this.createBuckets();
    
    // Set up collision detection
    this.setupCollisions();
  }

  /**
   * Create pins in a triangular pattern
   */
  createPins() {
    const pinRadius = 5;
    const pinOptions = {
      isStatic: true,
      restitution: 0.3,
      friction: 0.1,
      render: {
        fillStyle: '#FFFFFF'
      }
    };
    
    // Calculate spacing based on board dimensions and number of rows
    const horizontalSpacing = this.width / (this.rows + 2);
    const verticalSpacing = (this.height * 0.7) / this.rows;
    
    // Create pins
    for (let row = 0; row < this.rows; row++) {
      const pinCount = row + 1;
      const offsetX = (this.width - (pinCount * horizontalSpacing)) / 2 + horizontalSpacing / 2;
      
      for (let col = 0; col < pinCount; col++) {
        const x = offsetX + col * horizontalSpacing;
        const y = verticalSpacing + row * verticalSpacing;
        
        const pin = this.Bodies.circle(x, y, pinRadius, pinOptions);
        pin.label = 'pin';
        pin.row = row;
        pin.col = col;
        
        this.pins.push(pin);
        this.Composite.add(this.engine.world, pin);
      }
    }
  }

  /**
   * Create buckets at the bottom of the board
   */
  createBuckets() {
    const bucketCount = this.rows + 1;
    const bucketWidth = this.width / bucketCount;
    const bucketHeight = this.height * 0.15;
    const bucketY = this.height - bucketHeight / 2;
    
    // Get payouts for current configuration
    const payouts = this.payout[this.risk][this.rows];
    
    // Create buckets
    for (let i = 0; i < bucketCount; i++) {
      const x = (i * bucketWidth) + (bucketWidth / 2);
      
      // Create bucket body
      const bucket = this.Bodies.rectangle(x, bucketY, bucketWidth * 0.9, bucketHeight, {
        isStatic: true,
        isSensor: true,
        render: {
          fillStyle: this.getBucketColor(i, bucketCount),
          strokeStyle: '#333333',
          lineWidth: 1
        }
      });
      
      // Add metadata to bucket
      bucket.label = 'bucket';
      bucket.index = i;
      bucket.payout = payouts[i];
      
      this.buckets.push(bucket);
      this.Composite.add(this.engine.world, bucket);
      
      // Add dividers between buckets (except at edges)
      if (i > 0) {
        const dividerX = i * bucketWidth;
        const divider = this.Bodies.rectangle(dividerX, bucketY - bucketHeight * 0.3, 2, bucketHeight * 0.4, {
          isStatic: true,
          render: {
            fillStyle: '#555555'
          }
        });
        this.Composite.add(this.engine.world, divider);
      }
    }
  }

  /**
   * Get color for bucket based on payout value
   */
  getBucketColor(index, total) {
    // Calculate a color based on position (green for high payouts, red for low)
    const position = Math.abs(index - (total - 1) / 2) / ((total - 1) / 2);
    const hue = (1 - position) * 120; // 120 is green, 0 is red
    return `hsl(${hue}, 80%, 50%)`;
  }

  /**
   * Set up collision detection
   */
  setupCollisions() {
    this.Events.on(this.engine, 'collisionStart', (event) => {
      const pairs = event.pairs;
      
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        
        // Check if a ball has entered a bucket
        if ((pair.bodyA.label === 'ball' && pair.bodyB.label === 'bucket') ||
            (pair.bodyA.label === 'bucket' && pair.bodyB.label === 'ball')) {
          
          const ball = pair.bodyA.label === 'ball' ? pair.bodyA : pair.bodyB;
          const bucket = pair.bodyA.label === 'bucket' ? pair.bodyA : pair.bodyB;
          
          // Trigger win event
          this.handleBallInBucket(ball, bucket);
        }
        
        // Play sound when ball hits pin
        if ((pair.bodyA.label === 'ball' && pair.bodyB.label === 'pin') ||
            (pair.bodyA.label === 'pin' && pair.bodyB.label === 'ball')) {
          
          const pin = pair.bodyA.label === 'pin' ? pair.bodyA : pair.bodyB;
          
          // Highlight pin briefly
          this.highlightPin(pin);
          
          // Play sound
          this.playSound('pin');
        }
      }
    });
  }

  /**
   * Highlight a pin when hit by a ball
   */
  highlightPin(pin) {
    // Store original color
    const originalColor = pin.render.fillStyle;
    
    // Change to highlight color
    pin.render.fillStyle = '#FFFF00';
    
    // Reset after a short delay
    setTimeout(() => {
      pin.render.fillStyle = originalColor;
    }, 100);
  }

  /**
   * Handle ball entering a bucket
   */
  handleBallInBucket(ball, bucket) {
    // Remove ball from tracking array
    const index = this.balls.findIndex(b => b.id === ball.id);
    if (index !== -1) {
      this.balls.splice(index, 1);
    }
    
    // Remove ball from world after a short delay
    setTimeout(() => {
      this.Composite.remove(this.engine.world, ball);
    }, 500);
    
    // Play appropriate sound
    if (bucket.payout >= 1) {
      this.playSound('win');
    } else {
      this.playSound('lose');
    }
    
    // Emit win event
    this.emit('win', {
      payout: bucket.payout,
      bucketIndex: bucket.index
    });
    
    // Check if game is still running
    this.checkRunning();
  }

  /**
   * Play a sound
   */
  playSound(type, volume = 1) {
    if (!this.game || !this.game.sounds) return;
    
    let soundId;
    switch (type) {
      case 'pin':
        soundId = 'sound_pin_mp3';
        break;
      case 'win':
        soundId = 'sound_win_mp3';
        break;
      case 'lose':
        soundId = 'sound_lose_mp3';
        break;
      case 'start':
        soundId = 'sound_start_mp3';
        break;
      default:
        return;
    }
    
    this.game.sounds.playSound(soundId, { volume });
  }

  /**
   * Check if the game is still running
   */
  checkRunning() {
    const wasRunning = this.running;
    this.running = this.balls.length > 0;
    
    if (wasRunning !== this.running) {
      this.emit('running', this.running);
    }
  }

}