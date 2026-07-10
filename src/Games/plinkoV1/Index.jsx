import React, { useState } from 'react';
import { PlinkoGameProvider, usePlinkoGame } from './PlinkoContext';
import GameControls from './GameControls';
// import GameActions from './GameActions';
import GameView from './GameView';
// import AllBets from './AllBets';
// import MyBets from './MyBets';
import './plinko.css';
import './plinko1.css';

// Main component that uses the context
const PlinkoGame = () => {
  const [currentTab, setCurrentTab] = useState(1);
  const { screenWidth } = usePlinkoGame();
  
  return (
    <div id="game-plinko" className={`sc-haTkiu lmWKWf ${screenWidth > 1200 ? "game-style0" : "game-style1"} sc-cBIieI ikZPEu`}>
      <div className="game-area">
        <div className={`game-main ${screenWidth > 1200 ? 'mobile-view' : ''}`}>
          <GameView />
          <GameControls />
          {/* <GameActions />  */}
        </div>
      </div>
      
      <div className="sc-cxpSdN kQfmQV tabs game-tabs len-3">
        <div className="tabs-navs">
          <button
            onClick={() => setCurrentTab(1)}
            className={`tabs-nav ${currentTab === 1 ? 'is-active' : ''}`}>
            All Bets
          </button>
          <button
            onClick={() => setCurrentTab(2)}
            className={`tabs-nav ${currentTab === 2 ? 'is-active' : ''}`}>
            My Bets
          </button>
          <div className="bg" style={{ width: '50%', left: `${50 * (currentTab - 1)}%` }}></div>
        </div>
        <div className="tabs-view" style={{ transform: 'none' }}>
          {/* {currentTab === 1 ? <AllBets /> : <MyBets />} */}
        </div>
      </div>
      
      <div className="sc-kTqLtj hsmSjD">
        <div className="intro-title">
          <p>Plinko</p>
          <div className="intro-tags">
            <p>Our Best Games</p>
            <p>Multiplayer</p>
            <p>BC Originals</p>
          </div>
        </div>
        <div className="description">
          Plinko is the peculiar game of chance played with a ball "plinking" down
          the vertical board populated with offset rows of pegs. represented the
          board in the form of a pyramid.
        </div>
        <button className="intro-detail">
          Details
          <svg
            xmlns="http://www.w3.org/1999/xlink"
            className="sc-gsDKAQ hxODWG icon">
            <use xlinkHref="#icon_Arrow"></use>
          </svg>
        </button>
      </div>
    </div>
  );
};

// Wrapper component that provides the context
const PlinkoIndex = () => {
  return (
    <PlinkoGameProvider>
      <PlinkoGame />
    </PlinkoGameProvider>
  );
};

export default PlinkoIndex;