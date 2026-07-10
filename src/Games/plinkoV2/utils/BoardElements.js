import { Bodies, Composite } from 'matter-js';
import TextureLoader from './TextureLoader';

/**
 * Creates pegs for the Plinko board
 * @param {Object} config - Configuration object
 * @returns {Array} Array of peg bodies
 */
export function createPegs(config) {
  const { engine, width, height, rows } = config;
  const pegs = [];
  
  const pegRadius = Math.max(4, width / 100);
  const spacing = width / (rows + 2);
  const verticalSpacing = height / (rows + 4);
  const topMargin = verticalSpacing * 2;
  
  // Create pegs in a triangular pattern
  // Start with 3 pegs in the first row and increase by 1 for each row
  const startingPegs = 3; // Start with 3 pegs in the first row
  
  for (let row = 0; row < rows; row++) {
    const pegCount = startingPegs + row;
    const rowWidth = pegCount * spacing;
    const startX = (width - rowWidth) / 2 + spacing / 2;

    for (let col = 0; col < pegCount; col++) {
      const x = startX + col * spacing;
      const y = topMargin + row * verticalSpacing;

      const pegTexture = TextureLoader.getTexture('pin');
      const peg = Bodies.circle(x, y, pegRadius, {
        isStatic: true,
        restitution: 0.5,
        friction: 0.1,
        render: {
          sprite: {
            texture: '/assets/plinko/pin.07d34b2f.png',
            xScale: (pegRadius * 2.5) / pegTexture.width,
            yScale: (pegRadius * 2.5) / pegTexture.height
          }
        },
        label: 'peg',
        row,
        col
      });

      pegs.push(peg);
    }
  }
  
  return pegs;
}

/**
 * Creates walls for the Plinko board
 * @param {Object} config - Configuration object
 * @returns {Array} Array of wall bodies
 */
export function createWalls(config) {
  const { width, height } = config;
  const walls = [];
  
  const wallThickness = Math.max(10, width / 40);

  // Left wall
  const leftWall = Bodies.rectangle(
    wallThickness / 2,
    height / 2,
    wallThickness,
    height,
    {
      isStatic: true,
      render: { fillStyle: '#1E2024' },
      label: 'wall'
    }
  );

  // Right wall
  const rightWall = Bodies.rectangle(
    width - wallThickness / 2,
    height / 2,
    wallThickness,
    height,
    {
      isStatic: true,
      render: { fillStyle: '#1E2024' },
      label: 'wall'
    }
  );

  // Top wall
  const topWall = Bodies.rectangle(
    width / 2,
    wallThickness / 2,
    width,
    wallThickness,
    {
      isStatic: true,
      render: { fillStyle: '#1E2024' },
      label: 'wall'
    }
  );

  walls.push(leftWall, rightWall, topWall);
      return walls;
    }

    /**
 * Creates buckets for the Plinko board
 * @param {Object} config - Configuration object
 * @returns {Object} Object containing buckets and dividers
 */
    export function createBuckets(config) {
      const { width, height, rows, payouts } = config;
      const buckets = [];
      const dividers = [];
  
      // With 3 pegs in the first row and adding 1 per row,
      // the number of buckets should be startingPegs + rows
      const startingPegs = 3;
      const bucketCount = startingPegs + rows;
  
      const spacing = width / (bucketCount + 1);
      const bucketWidth = spacing;
      const bucketHeight = Math.max(20, height / 20);
      const bucketY = height - bucketHeight / 2;
      const bucketStartX = (width - bucketCount * bucketWidth) / 2 + bucketWidth / 2;

      // Create buckets
      for (let i = 0; i < bucketCount; i++) {
        const x = bucketStartX + i * bucketWidth;
        // Make sure we have a valid multiplier for this bucket
        const multiplier = payouts[i] || payouts[payouts.length - 1] || 1;

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
            sprite: {
              texture: '/assets/plinko/target.f3e8ae2a.png',
              xScale: bucketWidth / 100, // Adjust based on actual image size
              yScale: bucketHeight / 100 // Adjust based on actual image size
            }
          },
          label: 'bucket',
          bucketIndex: i,
          multiplier
        });

        buckets.push(bucket);
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

        dividers.push(divider);
      }
  
      return { buckets, dividers };
    }
/**
 * Creates a ball for the Plinko board
 * @param {Object} config - Configuration object
 * @returns {Object} The ball body
 */
export function createBall(config) {
  const { width, x, y } = config;
  
  const ballRadius = Math.max(6, width / 80);
  const ballTexture = TextureLoader.getTexture('ball');
  
  const ball = Bodies.circle(x || width / 2, y || ballRadius * 3, ballRadius, {
    restitution: 0.5,
    friction: 0.1,
    frictionAir: 0.02,
    density: 0.1,
    render: {
      sprite: {
        texture: '/assets/plinko/ball.3981f8e7.png',
        xScale: (ballRadius * 2) / ballTexture.width,
        yScale: (ballRadius * 2) / ballTexture.height
      }
    },
    label: 'ball'
  });
  
  return ball;
}

/**
 * Adds all elements to the physics world
 * @param {Object} engine - Matter.js engine
 * @param {Array} elements - Array of elements to add
 */
export function addElementsToWorld(engine, elements) {
  Composite.add(engine.world, elements.flat());
}