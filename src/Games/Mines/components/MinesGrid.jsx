import React, { useEffect } from 'react'
import { useMinesGame } from '../context/MinesContext'
import { MineIcon, GemIcon } from './Icons'

const MinesGrid = () => {
  const { gameState, revealTile } = useMinesGame()
  
  // This effect will run when the component mounts and will check if there's an active game
  useEffect(() => {
    // The active game state is already loaded in the useSocketConnection hook
    // We don't need to do anything here as the grid will render based on gameState
    
    // Log the current game state for debugging
    if (gameState.gameActive) {
      console.log('Restored active game:', {
        gameId: gameState.gameId,
        betAmount: gameState.betAmount,
        minesCount: gameState.minesCount,
        revealedCount: gameState.revealedCount,
        potentialPayout: gameState.potentialPayout
      })
    }
  }, [gameState.gameId, gameState.gameActive])
  
  const handleTileClick = (index) => {
    // Don't allow clicking if game is over or tile is already revealed
    if (gameState.gameOver || gameState.grid[index] !== null) return
    
    // Only allow clicking if game is active
    if (gameState.gameActive) {
      revealTile(index)
    }
  }
  
  const renderTile = (value, index) => {
    // Determine tile content and style
    let content = null
    let bgClass = 'bg-gray-800 hover:bg-gray-700'
    let cursor = 'cursor-pointer'
    
    if (value === 'gem') {
      content = <GemIcon />
      bgClass = 'bg-green-800'
    } else if (value === 'mine') {
      content = <MineIcon />
      bgClass = 'bg-red-800'
    } else if (!gameState.gameActive) {
      cursor = 'cursor-not-allowed'
    }
    
    // Show all mines when game is over
    if (gameState.gameOver && gameState.minePositions.includes(index) && value !== 'mine') {
      content = <MineIcon opacity={0.5} />
      bgClass = 'bg-gray-800'
    }
    
    return (
      <div 
        key={index}
        className={`${bgClass} ${cursor} rounded-lg flex items-center justify-center transition-colors duration-200 aspect-square`}
        onClick={() => handleTileClick(index)}
      >
        {content}
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-5 gap-2 w-full p-10">
      {gameState.grid.map((value, index) => renderTile(value, index))}
    </div>
  )
}

export default MinesGrid