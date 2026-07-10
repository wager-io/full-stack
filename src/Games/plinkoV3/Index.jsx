import React from 'react'
import { PlinkoGameProvider, usePlinkoGame } from './context/context';
import "./styles/style1.css"
import GameView from './GameView';

 function PlinkoGame() {
    const { screen } = usePlinkoGame();
  return (

<div id="game-plinko" className={`sc-haTkiu lmWKWf  ${screen > 1200 ? "game-style0" : "game-style1"}  sc-cBIieI ikZPEu`}>
  <div className="game-area">
    <div className={`game-main ${screen > 1200 ? 'mobile-view' : ''}`}>
        <GameView />
   
    </div>
  </div>
</div>
  )
}

// Wrapper component that provides the context
const PlinkoIndex = () => {
  return (
    <PlinkoGameProvider>
      <PlinkoGame />
    </PlinkoGameProvider>
  );
};

export default PlinkoIndex;