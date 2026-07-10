import React, {useEffect, useState} from 'react';
import { useCrashGame } from './CrashContext';
import { observer } from 'mobx-react-lite';
import CrashHistory from './components/Crash.history';
import GameCanvas from './components/GameCanvas';
import useSocketConnection from './hooks/useSocketConnection';
import graphStore from './store/GraphStore';
import { keyframes, css } from '@emotion/react';

const CrashCanvas = observer(() => {
  const { 
    gameState, 
    setGameState, // Make sure this is a function from your context
    userBet, 
    setUserBet, 
    setBets, 
    setHistory,
    handleCashout
  } = useCrashGame();
  
  // Make sure all these props are functions where expected
  const socketRef = useSocketConnection({
    setGameState,
    setBets,
    setHistory,
    userBet,
    setUserBet,
    handleCashout
  });


  const BlinkingIndicator = () => (
    <>
      <span class="relative flex size-2">
        <span class={`absolute inline-flex h-full w-full animate-ping rounded-full  bg-green-400 opacity-5`}></span>
        <span class="relative inline-flex size-2 mt-0.5 rounded-full bg-green-600"></span>
      </span>
    </>
  );

  return (
    <div className="flex-grow relative rounded-lg overflow-hidden">
      <div className="w-full mb-3 md:mb-12">
        <CrashHistory />
      </div>
      <div className="relative">
        {/* Add null checks before accessing properties */}
        {graphStore?.game?.errorMessage && (
          <div className="absolute top-2 left-0 right-0 text-center text-red-500 bg-black bg-opacity-70 py-1 z-10">
            {graphStore.game.errorMessage}
            {graphStore.game.reconnecting && " Attempting to reconnect..."}
          </div>
        )}

        {/* {graphStore?.game?.gameStateMessage && (
          <div className="absolute top-2 left-0 right-0 text-center text-white bg-black bg-opacity-70 py-1 z-10">
            {graphStore.game.gameStateMessage}
          </div>
        )} */}
        
        {/* Game canvas */}
        <GameCanvas />
          <div className=" top-2 left-0 right-0 flex justify-between text-right bg-opacity-70 py-1 z-10">
            <div></div>
            <div className='flex justify-center gap-1 items-center'>
              <div className='text-[12px]'>Network Status</div>
               <BlinkingIndicator />
            </div>
            {/* {graphStore.game.statusMessage} */}
          </div>
      </div>
    </div>
  );
});

export default CrashCanvas;
