import React from 'react'
import MinesGrid from './MinesGrid'
import MinesControls from './MinesControls'
import MinesHistory from './MinesHistory'
import { useMinesGame } from '../context/MinesContext'

const MinesGameContent = () => {
  const { gameState } = useMinesGame()
  
  return (
    <div className="w-full max-w-7xl mx-auto p-2 pb-20 md:pb-10 md:p-5 text-white font-sans"> 
      <div className="bg-gray-900 bg-opacity-80 rounded-[18px] shadow-lg shadow-gray-900/50 p-0 md:p-5 mb-5">
        <div className="flex flex-col-reverse md:flex-row gap-3">
          <MinesControls />
          <div className="flex-1 flex flex-col">
            <div className="relative">
              {/* Win/Loss Overlay */}
              {gameState.gameOver && (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  {gameState.won ? (
                    <div className="bg-green-900 bg-opacity-90 p-6 rounded-lg border-6 border-green-500 shadow-lg transform scale-105 transition-all duration-300">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-green-400 mb-2">You Won!</h3>
                        <p className="text-white text-lg">
                          Profit: <span className="font-bold">{(gameState.potentialPayout - gameState.betAmount).toFixed(2)} USDT</span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-900 bg-opacity-90 p-6 rounded-lg border-6 border-red-500 shadow-lg transform scale-105 transition-all duration-300">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-red-400 mb-2">Game Over!</h3>
                        <p className="text-white text-lg">You hit a mine</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Mines Grid */}
              <MinesGrid />
            </div>
            
            {/* Game info section - moved below the grid */}
            {gameState.gameActive && (
              <div className="mt-4 p-3 bg-blue-900 bg-opacity-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-400">Next:</span>
                    <span className="ml-2 text-white font-bold">{gameState.nextMultiplier.toFixed(2)}x</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Potential Win:</span>
                    <span className="ml-2 text-white font-bold">{gameState.potentialPayout.toFixed(2)} USDT</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <MinesHistory />
    </div>
  )
}

export default MinesGameContent