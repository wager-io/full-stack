import React, { useEffect, useRef, useState } from 'react';
import { Engine, Render, World, Bodies, Body, Events, Composite } from 'matter-js';
import { usePlinkoGame } from './context/PlinkoContext';
import PlinkoResource from './logics/PlinkoResource';
import './plinko-matter.css';

const MatterPlinko = ({ rows = 16, risk = 2, onBallLanded }) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const worldRef = useRef(null);
  const renderRef = useRef(null);
  const pegsRef = useRef([]);
  const wallsRef = useRef([]);
  const bucketsRef = useRef([]);
  const ballsRef = useRef([]);
  const [gameReady, setGameReady] = useState(false);
  const [activeBucket, setActiveBucket] = useState(null);
  const { plinkoGame } = usePlinkoGame();
  
  // Get payouts based on risk level
  const payouts = PlinkoResource.PAYOUTS[risk][rows];
  
  // Initialize the physics engine
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Create engine
    const engine = Engine.create({
      enableSleeping: true,
      gravity: { x: 0, y: 1 }
    });
    engineRef.current = engine;
    worldRef.current = engine.world;
    
    // Create renderer
    const render = Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: 800,
        height: 800,
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
    renderRef.current = render;
    
    // Start the engine and renderer
    Render.run(render);
    
    // Create the game elements
    createGameElements();
    
    // Start the engine
    const runner = Engine.run(engine);
    
    // Set up collision event handling
    Events.on(engine, 'collisionStart', handleCollision);
    
    // Mark game as ready
    setGameReady(true);
    
    // Cleanup on unmount
    return () => {
      Events.off(engine, 'collisionStart', handleCollision);
      Render.stop(render);
      Engine.clear(engine);
      World.clear(engine.world);
      render.canvas = null;
      render.context = null;
      render.textures = {};
    };
  }, [rows, risk]);
  
  // Create all game elements (pegs, walls, buckets)
  const createGameElements = () => {
    const world = worldRef.current;
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear existing elements
    Composite.clear(world);
    pegsRef.current = [];
    wallsRef.current = [];
    bucketsRef.current = [];
    
    // Calculate dimensions
    const pegRadius = 6;
    const spacing = width / (rows + 2);
    const verticalSpacing = height / (rows + 4);
    const topMargin = verticalSpacing * 2;
    
    // Create pegs
    for (let row = 0; row < rows; row++) {
      const pegCount = row + 1;
      const rowWidth = pegCount * spacing;
      const startX = (width - rowWidth) / 2 + spacing / 2;
      
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
          label: 'peg'
        });
        
        pegsRef.current.push(peg);
        Composite.add(world, peg);
      }
    }
    
    // Create walls
    const wallThickness = 20;
    
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
    
    wallsRef.current = [leftWall, rightWall, topWall];
    Composite.add(world, wallsRef.current);
    
    // Create buckets
    const bucketCount = rows + 1;
    const bucketWidth = spacing;
    const bucketHeight = 40;
    const bucketY = height - bucketHeight / 2;
    const bucketStartX = (width - bucketCount * bucketWidth) / 2 + bucketWidth / 2;
    
    for (let i = 0; i < bucketCount; i++) {
      const x = bucketStartX + i * bucketWidth;
      const multiplier = payouts[i];
      
      // Calculate color based on multiplier
      const colorPercent = (2 * Math.abs(i - (bucketCount - 1) / 2)) / bucketCount;
      const color = PlinkoResource.interpolateColorToHex(colorPercent);
      
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
      
      bucketsRef.current.push(bucket);
      Composite.add(world, bucket);
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
      
      Composite.add(world, divider);
    }
  };
  
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
        const ball = pair.bodyA.label === 'ball' ? pair.bodyA : pair.bodyB;
        const bucket = pair.bodyA.label === 'bucket' ? pair.bodyA : pair.bodyB;
        
        // Set the active bucket
        setActiveBucket(bucket.bucketIndex);
        
        // Call the callback with the result
        if (onBallLanded) {
          onBallLanded({
            bucketIndex: bucket.bucketIndex,
            multiplier: bucket.multiplier,
            path: ball.path || []
          });
        }
        
        // Remove the ball after a delay
        setTimeout(() => {
          Composite.remove(worldRef.current, ball);
          const ballIndex = ballsRef.current.indexOf(ball);
          if (ballIndex !== -1) {
            ballsRef.current.splice(ballIndex, 1);
          }
        }, 500);
      }
      
      // Track ball path when hitting pegs
      if (
        (pair.bodyA.label === 'ball' && pair.bodyB.label === 'peg') ||
        (pair.bodyA.label === 'peg' && pair.bodyB.label === 'ball')
      ) {
        const ball = pair.bodyA.label === 'ball' ? pair.bodyA : pair.bodyB;
        const peg = pair.bodyA.label === 'peg' ? pair.bodyA : pair.bodyB;
        
        // Calculate direction (left = 0, right = 1)
        const direction = ball.position.x > peg.position.x ? 1 : 0;
        
        // Add to path
        if (!ball.path) ball.path = [];
        ball.path.push(direction);
      }
    }
  };
  
  // Drop a ball
  const dropBall = () => {
    if (!gameReady || !worldRef.current) return;
    
    const canvas = canvasRef.current;
    const width = canvas.width;
    
    // Create a ball
    const ballRadius = 10;
    const ball = Bodies.circle(width / 2, 50, ballRadius, {
      restitution: 0.5,
      friction: 0.1,
      frictionAir: 0.02,
      density: 0.1,
      render: {
        fillStyle: '#43B309',
        strokeStyle: '#2D8800',
        lineWidth: 2
      },
      label: 'ball'
    });
    
    // Add some random initial velocity
    const randomVelocity = Math.random() * 2 - 1;
    Body.setVelocity(ball, { x: randomVelocity, y: 0 });
    
    // Add the ball to the world
    ballsRef.current.push(ball);
    Composite.add(worldRef.current, ball);
    
    return ball;
  };
  
  // Expose the dropBall method to parent components
  useEffect(() => {
    if (plinkoGame && gameReady) {
      plinkoGame.matterDropBall = dropBall;
    }
  }, [plinkoGame, gameReady]);
  
  return (
    <div className="matter-plinko-container">
      <canvas ref={canvasRef} width="800" height="800" />
      
      {/* Multiplier labels */}
      <div className="multiplier-labels">
        {payouts.map((payout, index) => (
          <div 
            key={index} 
            className={`multiplier-label ${activeBucket === index ? 'active' : ''}`}
            style={{
              left: `${(index + 0.5) * (100 / (payouts.length))}%`,
              backgroundColor: activeBucket === index ? PlinkoResource.interpolateColorToHex((2 * Math.abs(index - (payouts.length - 1) / 2)) / payouts.length) : 'transparent'
            }}
          >
            {payout.toFixed(2)}x
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatterPlinko;