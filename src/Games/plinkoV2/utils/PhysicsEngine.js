import { Engine, Render, Events, Body, Composite } from 'matter-js';

/**
 * Creates and configures the Matter.js physics engine
 * @param {HTMLCanvasElement} canvas - Canvas element for rendering
 * @param {Object} config - Configuration object
 * @returns {Object} The configured engine and renderer
 */
export function createPhysicsEngine(canvas, config) {
  const { width, height } = config;
  
  // Create engine
  const engine = Engine.create({
    enableSleeping: true,
    gravity: { x: 0, y: 1 }
  });

  // Create renderer
  const render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
      width: width,
      height: height,
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
  Render.run(render);
  Engine.run(engine);
  
  return { engine, render };
}

/**
 * Sets up collision handling for the Plinko board
 * @param {Object} engine - Matter.js engine
 * @param {Function} onBallLanded - Callback when ball lands in a bucket
 * @param {Object} refs - References to game objects
 * @returns {Function} Function to remove event listeners
 */
export function setupCollisionHandling(engine, onBallLanded, refs) {
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
        const ball = pair.bodyA.label === 'ball' ? pair.bodyA : pair.bodyB;

        // Call the callback if provided
        if (onBallLanded) {
          onBallLanded(bucket.bucketIndex, bucket.multiplier);
        }

        // Set reference to active bucket
        refs.activeBucketIndex = bucket.bucketIndex;

        // Remove the ball after a delay
        setTimeout(() => {
          if (refs.ball === ball) {
            Composite.remove(engine.world, ball);
            refs.ball = null;
          }

          // Reset active bucket after a delay
          setTimeout(() => {
            refs.activeBucketIndex = null;
          }, 1000);
        }, 500);
      }
    }
  };

  // Set up collision event handling
  Events.on(engine, 'collisionStart', handleCollision);
  
  // Return function to remove event listeners
  return () => {
    Events.off(engine, 'collisionStart', handleCollision);
  };
}

/**
 * Applies force to guide the ball according to a path
 * @param {Object} ball - The ball body
 * @param {Array} path - Array of directions (0 = left, 1 = right)
 * @param {Array} pegs - Array of pegs
 * @param {Number} ballRadius - Radius of the ball
 * @returns {Function} Function to cancel the guidance
 */
export function guideBall(ball, path, pegs, ballRadius) {
  let pathIndex = 0; // Start from the first direction
  let lastAppliedForce = Date.now();
  let animationFrameId = null;
  
  // Initial force - slightly random to make it look natural
  const randomOffset = (Math.random() - 0.5) * 0.005;
  Body.applyForce(ball, { x: ball.position.x, y: ball.position.y }, { x: randomOffset, y: 0.02 });
  
  const guide = () => {
    if (!ball) return;
    
    // If ball is stuck or moving too slowly, apply additional force
    const now = Date.now();
    if (now - lastAppliedForce > 1000) {
      const velocity = Math.sqrt(
        ball.velocity.x * ball.velocity.x + 
        ball.velocity.y * ball.velocity.y
      );
      
      if (velocity < 0.5) {
        Body.applyForce(
          ball, 
          { x: ball.position.x, y: ball.position.y }, 
          { x: 0, y: 0.01 }
        );
        lastAppliedForce = now;
      }
    }

    // Continue guiding if we have more path directions
    if (pathIndex < path.length) {
      // Only apply force if the ball is near a peg
      for (let i = 0; i < pegs.length; i++) {
        const peg = pegs[i];
        const dx = ball.position.x - peg.position.x;
        const dy = ball.position.y - peg.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < ballRadius * 3) {
          // Apply force based on the current path direction
          const forceX = path[pathIndex] === 0 ? -0.005 : 0.005;
          Body.applyForce(ball, { x: ball.position.x, y: ball.position.y }, { x: forceX, y: 0.002 });
          pathIndex++;
          break;
        }
      }
      
      animationFrameId = requestAnimationFrame(guide);
    } else {
      // If we've used all path directions but ball hasn't landed yet,
      // keep checking until it lands or disappears
      animationFrameId = requestAnimationFrame(guide);
    }
  };

  // Start guiding the ball
  animationFrameId = requestAnimationFrame(guide);
  
  // Return function to cancel guidance
  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  };
}
/**
 * Resizes the physics engine and renderer
 * @param {Object} render - Matter.js renderer
 * @param {Number} width - New width
 * @param {Number} height - New height
 */
export function resizePhysicsEngine(render, width, height) {
  render.options.width = width;
  render.options.height = height;
  render.canvas.width = width;
  render.canvas.height = height;
}

/**
 * Cleans up the physics engine and renderer
 * @param {Object} engine - Matter.js engine
 * @param {Object} render - Matter.js renderer
 */
export function cleanupPhysicsEngine(engine, render) {
  Render.stop(render);
  Engine.clear(engine);
  
  if (render.canvas) {
    render.canvas.width = 0;
    render.canvas.height = 0;
  }
  
  render.canvas = null;
  render.context = null;
  render.textures = {};
}