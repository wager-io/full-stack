import React, { useState, useEffect, useRef } from 'react';
import { usePlinkoGame } from './context/PlinkoContext';
import GameInfoDialog from './dialogs/GameInfoDialog';
import MatterPlinko from './MatterPlinko';

const GameView = () => {
  const { plinkoGame, screen } = usePlinkoGame();
  const [gameHistory, setGameHistory] = useState([]);
  const [dialogData, setDialogData] = useState(null);
  const betsContainerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const [currentRisk, setCurrentRisk] = useState(2); // Default medium risk
  const [currentRows, setCurrentRows] = useState(16); // Default 16 rows
  
  // Update game history when bets change
  useEffect(() => {
    if (!plinkoGame) return;
    
    const unsubscribe = plinkoGame.subscribe('myBets', (myBets) => {
      setGameHistory([...myBets].reverse().slice(-9));
      
      if (betsContainerRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
          if (betsContainerRef.current) {
            const { scrollLeft, scrollWidth } = betsContainerRef.current;
            if (scrollLeft === 0 || scrollLeft > 350) {
              betsContainerRef.current.scrollTo(scrollWidth, 0);
            }
          }
        }, 100);
      }
    });
    
    // Update risk and rows when game settings change
    const settingsUnsubscribe = plinkoGame.settings.subscribe(() => {
      setCurrentRisk(plinkoGame.risk);
      setCurrentRows(plinkoGame.rows);
    });
    
    return () => {
      unsubscribe();
      settingsUnsubscribe();
      clearTimeout(scrollTimeoutRef.current);
    };
  }, [plinkoGame]);
  
  // Handle ball landing in a bucket
  const handleBallLanded = (result) => {
    if (!plinkoGame) return;
    
    // The plinkoGame instance will handle the actual bet processing
    // This is just to update the UI with the result
    console.log('Ball landed:', result);
    
    // The actual bet processing is handled by the game logic in PlinkoGame.js
    // which will update the myBets array and trigger the subscription above
  };
  
  // Handle manual drop for testing
  const handleManualDrop = () => {
    if (plinkoGame && plinkoGame.matterDropBall) {
      plinkoGame.matterDropBall();
    }
  };

  return (
    <div className="game-view">
      {dialogData && (
        <GameInfoDialog
          launchConf={dialogData}
          onClose={() => setDialogData(null)}
        />
      )}
      
      <div className="sc-hoHwyw fIoiVG game-recent">
        <div ref={betsContainerRef} className="recent-list-wrap">
          <div className="recent-list">
            {gameHistory.length > 0 ? (
              gameHistory.map((game, index) => (
                <div
                  key={`${index}_${game.betId}`}
                  onClick={() => {
                    setDialogData({
                      startScreen: 'Details',
                      betID: game.betId,
                    });
                  }}
                  className="recent-item"
                  style={{ width: screen > 800 ? "11.1111%" : "20.1111%" }}
                >
                  <div className={`item-wrap ${game.payout >= 1 ? 'is-win' : 'is-lose'}`}>
                    {game.odds.toFixed(2)}x
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-item">
                <p>Game results will be displayed here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="sc-hcupDf dqwCNK game-box sc-jwQYvw eRdxAb">
        <div className="sc-ljMRFG kIRDZR">
          <MatterPlinko 
            rows={currentRows} 
            risk={currentRisk} 
            onBallLanded={handleBallLanded} 
          />
        </div>
        
        <div className="sc-gLDmcm gnjHQb">
          <span>House Edge 1%</span>
        </div>
        
        <svg className="box-bg" xmlns="http://www.w3.org/1999/svg" viewBox="0 0 996 46">
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
    </div>
  );
};

export default GameView;
