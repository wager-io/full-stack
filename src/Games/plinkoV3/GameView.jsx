import React, { useEffect, useRef, useState } from 'react';
import { usePlinkoGame } from './context/context';

const GameView = () => {
  const { plinkoGame, screen } = usePlinkoGame();
  const canvasContainerRef = useRef(null);
  const [gameHistory, setGameHistory] = useState([]);

  // Attach the renderer when plinkoGame is available
  useEffect(() => {
    if (plinkoGame && canvasContainerRef.current) {
      // Attach the Matter.js renderer to the container
      plinkoGame.attachRenderer(canvasContainerRef.current);
      
      // Subscribe to win events to update history
      const unsubscribeWin = plinkoGame.subscribe('win', (result) => {
        setGameHistory(prev => {
          const newHistory = [
            {
              payout: result.payout,
              bucketIndex: result.bucketIndex,
              timestamp: new Date().toISOString()
            },
            ...prev
          ].slice(0, 9);
          return newHistory;
        });
      });
      
      // Clean up on unmount
      return () => {
        unsubscribeWin();
        plinkoGame.destroy();
      };
    }
  }, [plinkoGame]);

  // Handle window resize
  useEffect(() => {
    if (plinkoGame && plinkoGame.render) {
      // Update the renderer size when screen changes
      const width = screen < 612 ? 0.8 * screen : Math.min(500, window.innerHeight - 360);
      const height = width;
      
      plinkoGame.width = width;
      plinkoGame.height = height;
      
      if (plinkoGame.render.options) {
        plinkoGame.render.options.width = width;
        plinkoGame.render.options.height = height;
      }
      
      // Force a redraw
      if (plinkoGame.render.canvas) {
        plinkoGame.render.canvas.width = width;
        plinkoGame.render.canvas.height = height;
      }
    }
  }, [screen, plinkoGame]);

  return (
    <div className="game-view">
      <div className="sc-hcupDf dqwCNK game-box sc-jwQYvw eRdxAb">
        <div ref={canvasContainerRef} className="sc-ljMRFG kIRDZR"></div>
        <div className="sc-gLDmcm gnjHQb"><span>House Edge 1%</span></div>
        <svg className="box-bg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 996 46">
          <defs>
            <linearGradient id="gcardBg" x1="50%" x2="50%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#31343C"></stop>
              <stop offset="100%" stopColor="#1E2024" stopOpacity="0"></stop>
            </linearGradient>
          </defs>
          <g opacity=".899">
            <path
              fill="url(#gcardBg)"
              fillRule="evenodd"
              d="M0 0h996L892 46H96z"
              opacity=".598"
              transform="rotate(-180 498 23)"
            ></path>
          </g>
        </svg>
      </div>
      
      {/* Game history display (optional) */}
      {gameHistory.length > 0 && (
        <div className="game-history">
          <h3>Recent Results</h3>
          <div className="history-items">
            {gameHistory.map((item, index) => (
              <div 
                key={index} 
                className={`history-item ${item.payout >= 1 ? 'win' : 'lose'}`}
              >
                {item.payout}x
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameView;