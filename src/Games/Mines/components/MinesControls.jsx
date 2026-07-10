import React, { useState, useContext, useEffect } from 'react'
import { useMinesGame } from '../context/MinesContext'
import { AuthContext } from '../../../context/AuthContext'
import { toast } from 'sonner'
import { 
  FaCoins, 
  FaChevronDown, 
  FaBomb,
  FaGem,
  FaMoneyBillWave,
  FaRandom,
  FaArrowUp,
  FaDice
} from 'react-icons/fa'

const MinesControls = () => {
  const { user, balance } = useContext(AuthContext)
  const {  
    gameState, 
    setBetAmount, 
    setMinesCount, 
    startGame, 
    cashout, 
    resetGame,
    revealTile
  } = useMinesGame()
  
  const [customBetAmount, setCustomBetAmount] = useState('1.00')
  const [showMinesDropdown, setShowMinesDropdown] = useState(false)
  
  // Update custom bet amount when gameState.betAmount changes
  useEffect(() => {
    setCustomBetAmount(gameState.betAmount.toString())
  }, [gameState.betAmount])
  
  const handleBetAmountChange = (e) => {
    // Handle empty input case
    if (e.target.value === '') {
      setCustomBetAmount('')
    } else {
      // Only update if it's a valid number
      const value = parseFloat(e.target.value)
      if (!isNaN(value)) {
        setCustomBetAmount(e.target.value)
        setBetAmount(value)
      }
    }
  }
  
  const handleHalfAmount = () => {
    const newAmount = Math.max(0.1, gameState.betAmount / 2)
    setBetAmount(newAmount)
    setCustomBetAmount(newAmount.toString())
  }
  
  const handleDoubleAmount = () => {
    const newAmount = gameState.betAmount * 2
    setBetAmount(newAmount)
    setCustomBetAmount(newAmount.toString())
  }
  
  const handleStartGame = () => {
    // Check if user is logged in
    if (!user) {
      toast.error('Please log in to place a bet')
      return
    }
    
    // Check if bet amount is valid
    if (gameState.betAmount <= 0) {
      toast.error('Please enter a valid bet amount')
      return
    }
    
    // Check if user has sufficient balance
    if (gameState.betAmount > balance) {
      toast.error('Insufficient balance')
      return
    }
    
    startGame()
  }
  
  const handleCashout = () => {
    if (gameState.revealedCount === 0) {
      toast.error('Reveal at least one gem before cashing out')
      return
    }
    
    cashout()
  }
  
  const handleRandomTile = () => {
    if (!gameState.gameActive) return
    
    // Get all unrevealed and non-mine positions
    const unrevealedPositions = []
    for (let i = 0; i < 25; i++) {
      if (gameState.grid[i] === null) {
        unrevealedPositions.push(i)
      }
    }
    
    if (unrevealedPositions.length === 0) {
      toast.error('No more tiles to reveal')
      return
    }
    
    // Pick a random position
    const randomIndex = Math.floor(Math.random() * unrevealedPositions.length)
    const randomPosition = unrevealedPositions[randomIndex]
    
    // Reveal the tile
    revealTile(randomPosition)
  }
  
  // Calculate remaining gems
  const remainingGems = 25 - gameState.minesCount - gameState.revealedCount
  
  // Calculate current profit
  const currentProfit = gameState.potentialPayout - gameState.betAmount
  
  return (
    <div className="md:w-80 w-full h-full bg-gray-800 bg-opacity-50 p-4 rounded-tr-[18px] md:rounded-tr-[0px]  rounded-br-[18px] md:rounded-br-[0px] rounded-tl-[18px] rounded-bl-[18px] space-y-5">
      {/* Bet Amount Section */}
      <div className="bg-gray-800 bg-opacity-50 ">
        <label className="flex items-center text-sm mb-2 text-gray-300">
          <FaCoins className="mr-2 text-yellow-500" />
          Bet Amount
        </label>
        <div className="relative flex items-center">
          <div className="absolute left-3 flex items-center pointer-events-none">
            <img 
              src="/assets/token/usdt.png" 
              alt="USDT" 
              className="w-5 h-5 mr-1" 
            />
          </div>
          <input 
            type="text" 
            onChange={handleBetAmountChange}
            placeholder="0.00"
            value={customBetAmount}
            disabled={gameState.gameActive}
            className={`w-full p-3 pl-10 pr-28 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${gameState.gameActive ? 'opacity-75 cursor-not-allowed' : ''}`}
          />
          <div className="absolute right-2 flex space-x-2">
            <button 
              onClick={handleHalfAmount}
              disabled={gameState.gameActive}
              className={`px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded text-sm font-medium transition-colors flex items-center ${gameState.gameActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Half amount"
            >
              <span>½</span>
            </button>
            <button 
              onClick={handleDoubleAmount}
              disabled={gameState.gameActive}
              className={`px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded text-sm font-medium transition-colors flex items-center ${gameState.gameActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Double amount"
            >
              <span>2×</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mines Selection Dropdown */}
      <div className="bg-gray-800 bg-opacity-50 ">
        <label className="flex items-center text-sm mb-2 text-gray-300">
          <FaBomb className="mr-2 text-red-500" />
          Mines Count
        </label>
        <div className="relative">
          <button
            onClick={() => !gameState.gameActive && setShowMinesDropdown(!showMinesDropdown)}
            disabled={gameState.gameActive}
            className={`w-full p-3 pl-4 pr-10 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all flex items-center justify-between ${gameState.gameActive ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            <span>{gameState.minesCount} {gameState.minesCount === 1 ? 'Mine' : 'Mines'}</span>
            {!gameState.gameActive && (
              <FaChevronDown className={`transition-transform ${showMinesDropdown ? 'rotate-180' : ''}`} />
            )}
          </button>
          
          {showMinesDropdown && !gameState.gameActive && (
            <div className="absolute z-10 mt-1 w-full bg-gray-700 rounded-lg shadow-lg max-h-30 md:max-h-60 overflow-y-auto">
              <div className="flex flex-col">
                {Array.from({ length: 24 }, (_, i) => i + 1).map(count => (
                  <button
                    key={count}
                    onClick={() => {
                      setMinesCount(count)
                      setShowMinesDropdown(false)
                    }}
                    className={`p-3 w-full text-left ${gameState.minesCount === count ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'} text-white text-sm transition-colors border-b border-gray-600 last:border-b-0`}
                  >
                    {count} {count === 1 ? 'Mine' : 'Mines'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Game Stats (Only show when game is active) */}
      {gameState.gameActive && (
        <>
          {/* Remaining Gems */}
          <div className="bg-gray-800 bg-opacity-50 ">
            <label className="flex items-center text-sm mb-2 text-gray-300">
              <FaGem className="mr-2 text-blue-400" />
              Remaining Gems
            </label>
            <div className="p-3 bg-gray-700 rounded-lg text-white font-medium">
              {remainingGems} / {25 - gameState.minesCount}
            </div>
          </div>
          
          {/* Next Tile Profit */}
          <div className="bg-gray-800 bg-opacity-50 ">
            <label className="flex items-center text-sm mb-2 text-gray-300">
              <FaArrowUp className="mr-2 text-purple-400" />
              Profit for Next Tile
            </label>
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg text-white">
              <div className="flex items-center">
                <span className="font-medium">{gameState.nextMultiplier.toFixed(2)}x</span>
              </div>
              <button
                onClick={handleRandomTile}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded text-sm font-medium transition-colors flex items-center"
              >
                <FaDice className="mr-2" />
                Pick Random Tile
              </button>
            </div>
          </div>
          
          {/* Current Profit */}
          <div className="bg-gray-800 bg-opacity-50 ">
            <label className="flex items-center text-sm mb-2 text-gray-300">
              <FaMoneyBillWave className="mr-2 text-green-400" />
              Current Profit
            </label>
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg text-white">
              <div className="flex items-center">
                <span className="font-medium">{currentProfit.toFixed(2)}</span>
              </div>
              <div className="flex items-center">
                <img 
                  src="/assets/token/usdt.png" 
                  alt="USDT" 
                  className="w-5 h-5 ml-2" 
                />
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Action Buttons */}
      <div className="pt-2">
        {/* Start Game Button - Only show when game is not active */}
        {!gameState.gameActive && !gameState.gameOver && (
          <button 
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-lg font-bold transition-colors flex items-center justify-center"
            onClick={handleStartGame}
          >
            {!user ? 'Login to Bet' : 'Start Game'}
          </button>
        )}
        
        {/* Cashout Button - Show when game is active */}
        {gameState.gameActive && (
          <button 
            className={`w-full py-3 ${gameState.revealedCount > 0 ? 'bg-green-600 hover:bg-green-500' : 'bg-green-600 opacity-50 cursor-not-allowed'} rounded-lg text-lg font-bold transition-colors flex items-center justify-center`}
            onClick={handleCashout}
            disabled={gameState.revealedCount === 0}
          >
            <FaMoneyBillWave className="mr-2" />
            Cash Out ({(gameState.potentialPayout / gameState.betAmount).toFixed(2)}x)
          </button>
        )}
        
        {/* New Game Button - Show when game is over */}
        {gameState.gameOver && (
          <button
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-lg font-bold transition-colors flex items-center justify-center"
            onClick={resetGame}
          >
            New Game
          </button>
        )}
      </div>
    </div>
  )
}

export default MinesControls