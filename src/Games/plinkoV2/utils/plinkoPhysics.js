import { Engine, Render, World, Bodies, Body, Events, Composite } from 'matter-js';

class PlinkoBoard {
  constructor() {
    this.engine = null;
    this.render = null;
    this.canvas = null;
    this.width = 0;
    this.height = 0;
    this.rows = 0;
    this.payouts = [];
    this.pegs = [];
    this.walls = [];
    this.buckets = [];
    this.ball = null;
    this.activeBucketIndex = null;
    this.onBallLanded = null;
    this.ballTexture = null;
    this.initialized = false;
  }

  async initialize(canvas, config) {
    this.canvas = canvas;
    this.width = config.width;
    this.height = config.height;
    this.rows = config.rows;
    this.payouts = config.payouts;

    // Load textures
    await this.loadTextures();

    // Create engine
    this.engine = Engine.create({
      enableSleeping: true,
      gravity: { x: 0, y: 1 }
    });

    // Create renderer
    this.render = Render.create({
      canvas: this.canvas,
      engine: this.engine,
      options: {
        width: this.width,
        height: this.height,
        wireframes: false,
        background: '#1E2024',
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

    // Start the engine and renderer
    Render.run(this.render);
    Engine.run(this.engine);
    console.log("Matter.js engine and renderer started");

    // Create game elements
    this.createElements();

    // Set up collision event handling
    this.setupCollisionHandling();

    this.initialized = true;
    return this;
  }

  async loadTextures() {
    this.ballTexture = new Image();
    this.ballTexture.src = '/assets/plinko/ball.3981f8e7.png';
    return new Promise((resolve) => {
      this.ballTexture.onload = resolve;
    });
  }

  createElements() {
    // Clear existing elements
    Composite.clear(this.engine.world);
    this.pegs = [];
    this.walls = [];
    this.buckets = [];
    this.ball = null;

    // Calculate dimensions
    const pegRadius = Math.max(4, this.width / 100);
    const spacing = this.width / (this.rows + 2);
    const verticalSpacing = this.height / (this.rows + 4);
    const topMargin = verticalSpacing * 2;

    // Create pegs
    for (let row = 0; row < this.rows; row++) {
      const pegCount = row + 1;
      const rowWidth = pegCount * spacing;
      const startX = (this.width - rowWidth) / 2 + spacing / 2;

      for (let col = 0; col < pegCount; col++) {
        const x = startX + col * spacing;
        const y = topMargin + row * verticalSpacing;

        const peg = Bodies.circle(x, y, pegRadius, {
          isStatic: true,
          restitution: 0.5,
          friction: 0.1,
          render: {
            fillStyle: '#555',
            strokeStyle: '#777',
            lineWidth: 1
          },
          label: 'peg',
          row,
          col
        });

        this.pegs.push(peg);
      }
    }

    // Create walls
    const wallThickness = Math.max(10, this.width / 40);

    // Left wall
    const leftWall = Bodies.rectangle(
      wallThickness / 2,
      this.height / 2,
      wallThickness,
      this.height,
      {
        isStatic: true,
        render: { fillStyle: '#1E2024' },
        label: 'wall'
      }
    );

    // Right wall
    const rightWall = Bodies.rectangle(
      this.width - wallThickness / 2,
      this.height / 2,
      wallThickness,
      this.height,
      {
        isStatic: true,
        render: { fillStyle: '#1E2024' },
        label: 'wall'
      }
    );

    // Top wall
    const topWall = Bodies.rectangle(
      this.width / 2,
      wallThickness / 2,
      this.width,
      wallThickness,
      {
        isStatic: true,
        render: { fillStyle: '#1E2024' },
        label: 'wall'
      }
    );

    this.walls = [leftWall, rightWall, topWall];

    // Create buckets
    const bucketCount = this.rows + 1;
    const bucketWidth = spacing;
    const bucketHeight = Math.max(20, this.height / 20);
    const bucketY = this.height - bucketHeight / 2;
    const bucketStartX = (this.width - bucketCount * bucketWidth) / 2 + bucketWidth / 2;

    for (let i = 0; i < bucketCount; i++) {
      const x = bucketStartX + i * bucketWidth;
      const multiplier = this.payouts[i] || 0;

      // Calculate color based on multiplier
      let color = '#555';
      if (multiplier >= 5) {
        color = '#43B309'; // Green for high multipliers
      } else if (multiplier >= 1) {
        color = '#f39c12'; // Yellow for medium multipliers
      } else {
        color = '#e74c3c'; // Red for low multipliers
      }

      const bucket = Bodies.rectangle(x, bucketY, bucketWidth - 2, bucketHeight, {
        isStatic: true,
        isSensor: true,
        render: {
          fillStyle: color,
          strokeStyle: '#000',
          lineWidth: 1
        },
        label: 'bucket',
        bucketIndex: i,
        multiplier
      });

      this.buckets.push(bucket);
    }

    // Create bucket dividers
    for (let i = 0; i <= bucketCount; i++) {
      const x = bucketStartX - bucketWidth / 2 + i * bucketWidth;
      const dividerHeight = bucketHeight * 1.5;
      const dividerY = bucketY - bucketHeight / 4;

      const divider = Bodies.rectangle(x, dividerY, 2, dividerHeight, {
        isStatic: true,
        render: {
          fillStyle: '#444',
          strokeStyle: '#555',
          lineWidth: 1
        },
        label: 'divider'
      });

      this.walls.push(divider);
    }

    // Add all elements to the world
    Composite.add(this.engine.world, [...this.pegs, ...this.walls, ...this.buckets]);
  }

  setupCollisionHandling() {
    // Handle collisions
    const handleCollision = (event) => {
      const pairs = event.pairs;

      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];

        // Check if a ball hit a bucket
        if (
          (pair.bodyA.label === 'ball' && pair.bodyB.label === 'bucket') ||
          (pair.bodyA.label === 'bucket' && pair.bodyB.label === 'ball')
        ) {
          const bucket = pair.bodyA.label === 'bucket' ? pair.bodyA : pair.bodyB;

          // Set the active bucket
          this.activeBucketIndex = bucket.bucketIndex;

          // Call the callback if provided
          if (this.onBallLanded) {
            this.onBallLanded(bucket.bucketIndex, bucket.multiplier);
          }

          // Remove the ball after a delay
          setTimeout(() => {
            if (this.ball) {
              Composite.remove(this.engine.world, this.ball);
              this.ball = null;
            }

            // Reset active bucket after a delay
            setTimeout(() => {
              this.activeBucketIndex = null;
            }, 1000);
          }, 500);
        }
      }
    };

    // Set up collision event handling
    Events.on(this.engine, 'collisionStart', handleCollision);
  }

  dropBall(path, callback) {
    console.log("dropBall called with path:", path);

    // Ensure path is an array
    const pathArray = Array.isArray(path) ? path : String(path).split('').map(Number);
    console.log("Converted path array:", pathArray);

    // Set callback
    this.onBallLanded = callback;

    // Remove existing ball if any
    if (this.ball) {
      console.log("Removing existing ball");
      Composite.remove(this.engine.world, this.ball);
      this.ball = null;
    }

    // Create a new ball
    const ballRadius = Math.max(6, this.width / 80);
    const ballX = this.width / 2;
    const ballY = ballRadius * 3;

    console.log("Creating new ball at:", ballX, ballY);
    const newBall = Bodies.circle(ballX, ballY, ballRadius, {
      restitution: 0.5,
      friction: 0.1,
      frictionAir: 0.02,
      density: 0.1,
      render: {
        sprite: {
          texture: '/assets/plinko/ball.3981f8e7.png',
          xScale: (ballRadius * 2) / this.ballTexture.width,
          yScale: (ballRadius * 2) / this.ballTexture.height
        }
      },
      label: 'ball'
    });

    this.ball = newBall;
    Composite.add(this.engine.world, this.ball);
    console.log("Ball added to world");

    // Apply initial force - increase this if the ball isn't moving enough
    const forceX = pathArray[0] === 0 ? -0.01 : 0.01;
    const forceY = 0.02; // Add downward force to ensure the ball falls
    Body.applyForce(this.ball, { x: this.ball.position.x, y: this.ball.position.y }, { x: forceX, y: forceY });
    console.log("Initial force applied:", forceX, forceY);

    // Set up a ticker to guide the ball according to the path
    let pathIndex = 1; // Start from the second direction
    let lastAppliedForce = Date.now();

    const guideBall = () => {
      if (!this.ball) return;
      
      // If ball is stuck or moving too slowly, apply additional force
      const now = Date.now();
      if (now - lastAppliedForce > 1000) {
        const velocity = Math.sqrt(
          this.ball.velocity.x * this.ball.velocity.x + 
          this.ball.velocity.y * this.ball.velocity.y
        );
        
        if (velocity < 0.5) {
          console.log("Ball seems stuck, applying additional force");
          Body.applyForce(
            this.ball, 
            { x: this.ball.position.x, y: this.ball.position.y }, 
            { x: 0, y: 0.01 }
          );
          lastAppliedForce = now;
        }
      }

      // Continue guiding if we have more path directions
      if (pathIndex < pathArray.length) {
        // Only apply force if the ball is near a peg
        for (let i = 0; i < this.pegs.length; i++) {
          const peg = this.pegs[i];
          const dx = this.ball.position.x - peg.position.x;
          const dy = this.ball.position.y - peg.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < ballRadius * 3) {
            // Apply force based on the current path direction
            const forceX = pathArray[pathIndex] === 0 ? -0.005 : 0.005;
            Body.applyForce(this.ball, { x: this.ball.position.x, y: this.ball.position.y }, { x: forceX, y: 0.002 });
            pathIndex++;
            break;
          }
        }
        
        requestAnimationFrame(guideBall);
      } else {
        // If we've used all path directions but ball hasn't landed yet,
        // keep checking until it lands or disappears
        requestAnimationFrame(guideBall);
      }
    };

    // Start guiding the ball
    requestAnimationFrame(guideBall);
  }

  resize(newWidth, newHeight) {
    // Update renderer dimensions
    this.width = newWidth;
    this.height = newHeight;
    this.render.options.width = newWidth;
    this.render.options.height = newHeight;
    this.render.canvas.width = newWidth;
    this.render.canvas.height = newHeight;

    // Recreate elements with new dimensions
    this.createElements();
  }

  updateConfig(newConfig) {
    // Update config
    if (newConfig.rows) this.rows = newConfig.rows;
    if (newConfig.payouts) this.payouts = newConfig.payouts;

    // Recreate elements with new configuration
    this.createElements();
  }

  destroy() {
    // Remove event listeners
    Events.off(this.engine, 'collisionStart');

    // Stop renderer and engine
    Render.stop(this.render);
    Engine.clear(this.engine);

    // Clear references
    this.render.canvas = null;
    this.render.context = null;
    this.render.textures = {};
    this.initialized = false;
  }

  get activeBucket() {
    return this.activeBucketIndex;
  }
}

// Create a singleton instance
const plinkoBoard = new PlinkoBoard();

// Export the singleton and a factory function
export default {
  getInstance: () => plinkoBoard,
  createPlinkoBoard: async (canvas, config) => {
    if (!plinkoBoard.initialized) {
      await plinkoBoard.initialize(canvas, config);
    } else {
      plinkoBoard.canvas = canvas;
      plinkoBoard.resize(config.width, config.height);
      plinkoBoard.updateConfig(config);
    }
    return plinkoBoard;
  }
};