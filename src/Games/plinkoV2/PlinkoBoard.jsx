import React, { useEffect, useRef, useState } from 'react';
import { Engine, Render, Runner, Bodies, Composite, Events, Body } from 'matter-js';

const PlinkoBoard = ({ rows = 8, risk = 1, onBallLanded }, ref) => {
  const canvasRef = useRef(null);
  const [engine, setEngine] = useState(null);
  const [render, setRender] = useState(null);
  const [runner, setRunner] = useState(null);
  const [initialized, setInitialized] = useState(false);
  
  // Get payouts based on risk level
  const getPayouts = (risk, rows) => {
    // Default payouts for medium risk
    const bucketCount = rows + 3;
    const payouts = Array(bucketCount).fill(1);
    
    // Set higher multipliers at the edges
    for (let i = 0; i < bucketCount; i++) {
      const position = Math.abs(i - (bucketCount - 1) / 2) / ((bucketCount - 1) / 2);
      
      if (risk === 1) { // Low risk
        payouts[i] = 1 + position * 2; // 1x to 3x
      } else if (risk === 2) { // Medium risk
        payouts[i] = 1 + position * 5; // 1x to 6x
      } else { // High risk
        payouts[i] = 1 + position * 15; // 1x to 16x
      }
      
      payouts[i] = Math.round(payouts[i] * 100) / 100;
    }
    
    return payouts;
  };
  
  // Initialize the board
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const width = 520;
    const height = 480;
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    // Create engine
    const engine = Engine.create({
      enableSleeping: false,
      gravity: { x: 0, y: 0.5 }
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
        showAngleIndicator: false,
        showCollisions: false,
        showVelocity: false
      }
    });
    
    // Create runner
    const runner = Runner.create();
    
    // Create game elements
    createGameElements(engine, width, height, rows, getPayouts(risk, rows));
    
    // Set up collision handling
    setupCollisionHandling(engine, onBallLanded);
    
    // Start the engine and renderer
    Runner.run(runner, engine);
    Render.run(render);
    
    // Store references
    setEngine(engine);
    setRender(render);
    setRunner(runner);
    setInitialized(true);
    
    console.log("Plinko board initialized");
    
    // Cleanup on unmount
    return () => {
      // Stop runner and renderer
      Runner.stop(runner);
      Render.stop(render);
      
      // Clear engine
      Engine.clear(engine);
      
      console.log("Plinko board destroyed");
    };
  }, [rows, risk, onBallLanded]);
  
  // Create game elements
  const createGameElements = (engine, width, height, rows, payouts) => {
    // Clear existing elements
    Composite.clear(engine.world);
    
    // Create pegs
    const pegs = createPegs(width, height, rows);
    
    // Create walls
    const walls = createWalls(width, height);
    
    // Create buckets and dividers
    const { buckets, dividers } = createBuckets(width, height, rows, payouts);
    
    // Add all elements to the world
    Composite.add(engine.world, [...pegs, ...walls, ...buckets, ...dividers]);
    
    // Add after render callback to draw multiplier values
    Events.on(render, 'afterRender', () => {
      drawMultipliers(render, buckets, payouts);
    });
  };
  
  // Create pegs
  const createPegs = (width, height, rows) => {
    const pegs = [];
    const pegRadius = 5;
    const startX = width / 2;
    const startY = 40;
    const spacing = 30;
    
    for (let row = 0; row < rows; row++) {
      const pegsInRow = row + 3; // Start with 3 pegs in first row
      const rowWidth = (pegsInRow - 1) * spacing;
      const rowStartX = startX - rowWidth / 2;
      
      for (let i = 0; i < pegsInRow; i++) {
        const x = rowStartX + i * spacing;
        const y = startY + row * spacing;
        
        const peg = Bodies.circle(x, y, pegRadius, {
          isStatic: true,
          restitution: 0.5,
          friction: 0,
          render: {
            fillStyle: '#888',
            strokeStyle: '#aaa',
            lineWidth: 1
          },
          label: 'peg'
        });
        
        pegs.push(peg);
      }
    }
    
    return pegs;
  };
  
  // Create walls
  const createWalls = (width, height) => {
    const wallThickness = 20;
    
    return [
      // Left wall
      Bodies.rectangle(0, height / 2, wallThickness, height, {
        isStatic: true,
        render: { fillStyle: '#1E2024' },
        label: 'wall'
      }),
      // Right wall
      Bodies.rectangle(width, height / 2, wallThickness, height, {
        isStatic: true,
        render: { fillStyle: '#1E2024' },
        label: 'wall'
      }),
      // Top wall
      Bodies.rectangle(width / 2, 0, width, wallThickness, {
        isStatic: true,
        render: { fillStyle: '#1E2024' },
        label: 'wall'
      })
    ];
  };
  
  // Create buckets
  const createBuckets = (width, height, rows, payouts) => {
    const buckets = [];
    const dividers = [];
    
    const bucketCount = rows + 3;
    const bucketWidth = width / (bucketCount + 1);
    const bucketHeight = 20;
    const bucketY = height - bucketHeight / 2;
    
    // Create buckets
    for (let i = 0; i < bucketCount; i++) {
      const x = (i + 1) * bucketWidth;
      
      const bucket = Bodies.rectangle(x, bucketY, bucketWidth - 2, bucketHeight, {
        isStatic: true,
        isSensor: true,
        render: {
          fillStyle: '#555',
          strokeStyle: '#777',
          lineWidth: 1
        },
        label: 'bucket',
        bucketIndex: i,
        multiplier: payouts[i] || 1
      });
      
      buckets.push(bucket);
    }
    
    // Create bucket dividers
    for (let i = 0; i <= bucketCount; i++) {
      const x = (i + 0.5) * bucketWidth;
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
  };
  
  // Draw multiplier values
  const drawMultipliers = (render, buckets, payouts) => {
    const ctx = render.context;
    if (!ctx) return;
    
    buckets.forEach((bucket, index) => {
      const multiplier = payouts[index] || 1;
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
  };
  
  // Set up collision handling
  const setupCollisionHandling = (engine, callback) => {
    Events.on(engine, 'collisionStart', (event) => {
      const pairs = event.pairs;
      
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        
        if (pair.bodyA.label === 'ball' && pair.bodyB.label === 'bucket') {
          const bucket = pair.bodyB;
          const bucketIndex = bucket.bucketIndex;
          const multiplier = bucket.multiplier;
          
          if (callback) {
            callback(bucketIndex, multiplier);
          }
          
          // Remove the ball after a short delay
          setTimeout(() => {
            Composite.remove(engine.world, pair.bodyA);
          }, 500);
        }
        else if (pair.bodyB.label === 'ball' && pair.bodyA.label === 'bucket') {
          const bucket = pair.bodyA;
          const bucketIndex = bucket.bucketIndex;
          const multiplier = bucket.multiplier;
          
          if (callback) {
            callback(bucketIndex, multiplier);
          }
          
          // Remove the ball after a short delay
          setTimeout(() => {
            Composite.remove(engine.world, pair.bodyB);
          }, 500);
        }
      }
    });
  };
  
  // Drop a ball
  const dropBall = (path) => {
    if (!engine || !initialized) return;
    
    // Create a new ball
    const ballRadius = 8;
    const ball = Bodies.circle(canvasRef.current.width / 2, ballRadius * 3, ballRadius, {
      restitution: 0.5,
      friction: 0.1,
      render: {
        fillStyle: '#fff',
        strokeStyle: '#ddd',
        lineWidth: 1
      },
      label: 'ball'
    });
    
    // Add ball to world
    Composite.add(engine.world, ball);
    
    // Guide the ball according to the path
    if (path && path.length) {
      guideBall(ball, path);
    }
  };
  
  // Guide the ball according to the path
  const guideBall = (ball, path) => {
    // Convert path string to array if needed
    const pathArray = typeof path === 'string' ? path.split('').map(Number) : path;
    
    // Apply small impulses to guide the ball
    let currentStep = 0;
    
    const interval = setInterval(() => {
      if (currentStep >= pathArray.length || !ball.position) {
        clearInterval(interval);
        return;
      }
      
      const direction = pathArray[currentStep];
      const force = direction === 0 ? -0.001 : 0.001;
      
      // Apply force to the ball
      Body.applyForce(ball, ball.position, { x: force, y: 0 });
      
      currentStep++;
    }, 200);
    
    return () => clearInterval(interval);
  };
  
  // Expose dropBall method to parent component
  React.useImperativeHandle(ref, () => ({
    dropBall
  }));
  
  return (
    <div 
      className="plinko-board-container" 
      style={{ 
        width: '520px', 
        height: '480px', 
        border: '2px solid red', 
        margin: '0 auto',
        position: 'relative',
        backgroundColor: '#333',
        zIndex: 10 // Make sure it's above other elements
      }}
    >
      <canvas 
        ref={canvasRef} 
        className="plinko-board"
        style={{ 
          display: 'block',
          width: '100%',
          height: '100%',
          backgroundColor: '#222',
          zIndex: 11 // Make sure it's above the container
        }}
      />
    </div>
  );
};

export default React.forwardRef(PlinkoBoard);