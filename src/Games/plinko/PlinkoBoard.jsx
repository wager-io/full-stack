import React, { useEffect, useRef } from 'react';
import { usePlinkoGame } from './PlinkoContext';
import PlinkoCanvas from './PlinkoCanvas';

const BOARD_WIDTH = window.innerWidth > 750 ? 560 : 360;
const BOARD_HEIGHT = window.innerWidth > 750 ? 470 : 350;

export default function PlinkoBoard() {
  const { rows, risk, pendingBets, onAnimationComplete } = usePlinkoGame();
  const canvasRef = useRef(null);
  const ballImgRef = useRef(null);
  const canvasInstanceRef = useRef(null);

  // Track which bets have been animated
  const animatedBetsRef = useRef(new Set());

  // Load ball image
  useEffect(() => {
    const ballImg = new window.Image();
    ballImg.src = '/assets/plinko/ball.png';
    ballImg.onload = () => {
      ballImgRef.current = ballImg;
    };
  }, []);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const plinko = new PlinkoCanvas(canvas, {
      rows,
      width: BOARD_WIDTH,
      height: BOARD_HEIGHT,
      risk,
    });

    canvasInstanceRef.current = plinko;
    plinko.drawBoard();

    return () => {
      if (canvasInstanceRef.current && canvasInstanceRef.current.animationFrameId) {
        cancelAnimationFrame(canvasInstanceRef.current.animationFrameId);
      }
    };
  }, [rows, risk]);

  // Animate each new pending bet as it arrives
  useEffect(() => {
    if (!pendingBets || !ballImgRef.current || !canvasInstanceRef.current) return;

    pendingBets.forEach(bet => {
      if (!animatedBetsRef.current.has(bet.betId)) {
        const path = bet.gameValue?.path;
        if (path) {
          animatedBetsRef.current.add(bet.betId);
          canvasInstanceRef.current.animateBallDrop(
            ballImgRef.current,
            path,
            bet.betId,
            () => {
              if (onAnimationComplete) onAnimationComplete(bet.betId);
              animatedBetsRef.current.delete(bet.betId); // Clean up after animation
            }
          );
        }
      }
    });
  }, [pendingBets, rows, risk, onAnimationComplete]);

  return (
    <div className="flex flex-col items-center w-full">
      <canvas
        ref={canvasRef}
        width={BOARD_WIDTH}
        height={BOARD_HEIGHT}
        className="rounded-lg "
      />
    </div>
  );
}
