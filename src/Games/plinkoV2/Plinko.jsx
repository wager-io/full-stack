import React from 'react';
import { PlinkoGameProvider } from './PlinkoContext';
import PlinkoBoard from './PlinkoBoard';
import GameControls from './GameControls';
import GameActions from './GameActions';
import AllBets from './AllBets';
import MyBets from './MyBets';


const Plinko = () => {
  const [currentTab, setCurrentTab] = React.useState(1);
  const [screenWidth, setScreenWidth] = React.useState(window.innerWidth);
  
  React.useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <PlinkoGameProvider>
      <div id="game-plinko" className={`min-h-[90vh] max-w-[1368px] mx-auto p-5 ${screenWidth > 1200 ? "game-style0" : "game-style1"}`}>
        <div className="flex flex-wrap game-area">
          <div className={`w-full rounded-lg bg-[#17181B] overflow-hidden flex game-main ${screenWidth > 1200 ? 'mobile-view' : ''}`}>
            <GameControls />
            <PlinkoBoard />
       
            {/* <GameActions /> */}
          </div>
        </div>
        
        {/* Tabs section */}
        <div className="mt-10 game-tabs">
          <div className="inline-flex h-9 bg-[rgba(49,52,60,0.7)] rounded-lg mb-3 ml-2.5 tabs-navs">
            <button
              onClick={() => setCurrentTab(1)}
              className={`px-6 h-full rounded-lg z-10 transition-colors tabs-nav ${
                currentTab === 1 
                  ? 'text-[#F5F6F7] font-bold is-active' 
                  : 'text-gray-400 hover:text-[#F5F6F7]'
              }`}
            >
              All Bets
            </button>
            <button
              onClick={() => setCurrentTab(2)}
              className={`px-6 h-full rounded-lg z-10 transition-colors tabs-nav ${
                currentTab === 2 
                  ? 'text-[#F5F6F7] font-bold is-active' 
                  : 'text-gray-400 hover:text-[#F5F6F7]'
              }`}
            >
              My Bets
            </button>
            <div 
              className="bg absolute h-full w-1/2 bg-gradient-to-l from-[#555966] to-[#58AE14] opacity-40 rounded-lg shadow-md transition-all duration-300"
              style={{ left: `${50 * (currentTab - 1)}%` }}
            ></div>
          </div>
          
          <div className="bg-[#1E2024] rounded-lg p-1 tabs-view">
            {currentTab === 1 ? <AllBets /> : <MyBets />}
          </div>
        </div>
        
        {/* Game info section */}
        <div className="w-full rounded-lg bg-[#1E2024] p-6 mt-8">
          <div className="flex flex-wrap items-center min-h-20 intro-title">
            <p className="text-[#F5F6F7] font-semibold text-base m-0 whitespace-nowrap">Plinko</p>
            <div className="ml-10 flex flex-wrap intro-tags">
              <p className="px-5 py-2 mr-4 mb-1 rounded-lg bg-[#2B2F36]">Our Best Games</p>
              <p className="px-5 py-2 mr-4 mb-1 rounded-lg bg-[#2B2F36]">Multiplayer</p>
              <p className="px-5 py-2 mr-4 mb-1 rounded-lg bg-[#2B2F36]">BC Originals</p>
            </div>
          </div>
          <div className="mt-3 text-gray-400 description">
            Plinko is the peculiar game of chance played with a ball "plinking" down
            the vertical board populated with offset rows of pegs. represented the
            board in the form of a pyramid.
          </div>
          <button className="mt-8 w-[6.75rem] h-10 rounded-lg bg-[rgba(49,52,60,0.6)] flex items-center justify-center intro-detail">
            Details
            <svg 
              className="ml-4 h-2 w-2 text-gray-400" 
              fill="currentColor" 
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/1999/xlink"
            >
              <use xlinkHref="#icon_Arrow"></use>
            </svg>
          </button>
        </div>
      </div>
    </PlinkoGameProvider>
  );
};

export default Plinko