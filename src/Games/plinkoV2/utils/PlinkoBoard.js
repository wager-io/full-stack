import { Engine, Render, Runner, Composite, Bodies, Body, Events } from 'matter-js';
// At the top of the file
console.log("Matter.js loaded:", !!Engine, !!Render, !!Runner, !!Composite, !!Bodies);
import PlinkoRenderer from './PlinkoRenderer'; // Make sure this path is correct
import TextureLoader from './TextureLoader';
import { createPegs, createWalls, createBuckets, createBall, addElementsToWorld } from './BoardElements';
import { 
  setupCollisionHandling, 
  guideBall, 
  cleanupPhysicsEngine 
} from './PhysicsEngine';

/**
 * Main class for the Plinko board
 */
class PlinkoBoard {
  constructor() {
    this.engine = null;
    this.render = null;
    this.runner = null;
    this.canvas = null;
    this.width = 0;
    this.height = 0;
    this.rows = 0;
    this.payouts = [];
    this.pegs = [];
    this.walls = [];
    this.buckets = [];
    this.dividers = [];
    this.ball = null;
    this.activeBucketIndex = null;
    this.onBallLanded = null;
    this.cleanupCollisionHandler = null;
    this.cancelBallGuidance = null;
    this.initialized = false;
  }

  /**
   * Initialize the Plinko board
   * @param {HTMLCanvasElement} canvas - Canvas element for rendering
   * @param {Object} config - Configuration object
   * @returns {PlinkoBoard} This board instance
   */
  async initialize(canvas, config) {
    try {
      console.log("PlinkoBoard initialize called with:", { canvas, config });
      this.canvas = canvas;
      this.width = config.width;
      this.height = config.height;
      
      // Create engine
      this.engine = Engine.create({
        enableSleeping: false,
        gravity: { x: 0, y: 0.5 }
      });
      
      console.log("Engine created:", this.engine);

      // Create renderer
      this.render = Render.create({
        canvas: this.canvas,
        engine: this.engine,
        options: {
          width: this.width,
          height: this.height,
          wireframes: true, // Use wireframes for simplicity
          background: '#1E2024'
        }
      });
      
      console.log("Render created:", this.render);

      // Create runner
      this.runner = Runner.create();
      
      // Add a simple box to test
      const box = Bodies.rectangle(this.width / 2, 50, 80, 80, {
        restitution: 0.6,
        render: {
          fillStyle: 'red'
        }
      });
      
      const ground = Bodies.rectangle(this.width / 2, this.height - 10, this.width, 20, {
        isStatic: true,
        render: {
          fillStyle: 'green'
        }
      });
      
      Composite.add(this.engine.world, [box, ground]);
      
      console.log("Bodies added to world");
      
      // Start the engine and renderer
      Runner.run(this.runner, this.engine);
      Render.run(this.render);
      
      console.log("Engine and renderer running");
      
      this.initialized = true;
      return this;
    } catch (error) {
      console.error("Error in PlinkoBoard initialize:", error);
      throw error;
    }
  }

  /**
   * Draw multiplier values above buckets
   */
  drawMultipliers() {
    const ctx = this.render.context;
    if (!ctx) return;

    this.buckets.forEach((bucket, index) => {
      const multiplier = this.payouts[index] || 1;
      const { x, y } = bucket.position;
      const height = bucket.bounds.max.y - bucket.bounds.min.y;
      
      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        multiplier.toFixed(2) + 'x',
        x,
        y - height / 2 - 10
      );
    });
  }

  /**
   * Create all game elements
   */
  createElements() {
    // Clear existing elements
    Composite.clear(this.engine.world);
    
    // Create pegs
    this.pegs = createPegs({
      engine: this.engine,
      width: this.width,
      height: this.height,
      rows: this.rows
    });
    
    // Create walls
    this.walls = createWalls({
      width: this.width,
      height: this.height
    });
    
    // Create buckets and dividers
    const { buckets, dividers } = createBuckets({
      width: this.width,
      height: this.height,
      rows: this.rows,
      payouts: this.payouts
    });
    
    this.buckets = buckets;
    this.dividers = dividers;
    
    // Add all elements to the world
    addElementsToWorld(this.engine, [
      this.pegs,
      this.walls,
      this.buckets,
      this.dividers
    ]);
  }

  /**
   * Drop a ball with a specific path
   * @param {Array|String} path - Array or string of directions (0 = left, 1 = right)
   * @param {Function} callback - Callback when ball lands in a bucket
   */
  dropBall(path, callback) {
    // Ensure path is an array
    const pathArray = Array.isArray(path) 
      ? path 
      : String(path).split('').map(Number);
    
    // Set callback
    this.onBallLanded = callback;

    // Cancel existing ball guidance if any
    if (this.cancelBallGuidance) {
      this.cancelBallGuidance();
      this.cancelBallGuidance = null;
    }

    // Remove existing ball if any
    if (this.ball) {
      Composite.remove(this.engine.world, this.ball);
      this.ball = null;
    }

    // Create a new ball
    const ballRadius = Math.max(6, this.width / 80);
    this.ball = createBall({
      width: this.width,
      x: this.width / 2,
      y: ballRadius * 3
    });
    
    // Add ball to world
    Composite.add(this.engine.world, this.ball);
    
    // Guide the ball according to the path
    this.cancelBallGuidance = guideBall(
      this.ball,
      pathArray,
      this.pegs,
      ballRadius
    );
  }

  /**
   * Resize the board
   * @param {Number} width - New width
   * @param {Number} height - New height
   */
  resize(width, height) {
    this.width = width;
    this.height = height;
    
    // Update render size
    if (this.render) {
      this.render.options.width = width;
      this.render.options.height = height;
      this.render.canvas.width = width;
      this.render.canvas.height = height;
    }
    
    // Recreate elements with new dimensions
    this.createElements();
  }

  /**
   * Update board configuration
   * @param {Object} config - New configuration
   */
  updateConfig(config) {
    if (config.rows) this.rows = config.rows;
    if (config.payouts) this.payouts = config.payouts;
    
    // Recreate elements with new configuration
    this.createElements();
  }

  /**
   * Clean up resources
   */
  destroy() {
    // Cancel ball guidance
    if (this.cancelBallGuidance) {
      this.cancelBallGuidance();
      this.cancelBallGuidance = null;
    }
    
    // Remove collision handler
    if (this.cleanupCollisionHandler) {
      this.cleanupCollisionHandler();
      this.cleanupCollisionHandler = null;
    }
    
    // Stop runner
    if (this.runner) {
      Runner.stop(this.runner);
      this.runner = null;
    }
    
    // Stop renderer
    if (this.render) {
      Render.stop(this.render);
      this.render.canvas = null;
      this.render.context = null;
      this.render.textures = {};
      this.render = null;
    }
    
    // Stop render loop
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Clean up renderer
    if (this.renderer) {
      this.renderer = null;
    }
    
    // Clean up engine
    if (this.engine) {
      Engine.clear(this.engine);
      this.engine.world.bodies = [];
      this.engine.world.composites = [];
      this.engine.world.constraints = [];
      this.engine.world.events = {};
      this.engine = null;
    }
    
    // Clear references
    this.pegs = [];
    this.walls = [];
    this.buckets = [];
    this.dividers = [];
    this.ball = null;
    this.onBallLanded = null;
    
    this.initialized = false;
  }
}

export default PlinkoBoard;
