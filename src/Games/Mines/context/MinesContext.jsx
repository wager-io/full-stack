import React, { createContext, useContext, useState, useCallback } from 'react'
import { AuthContext } from '../../../context/AuthContext'
import useSocketConnection from '../hooks/useSocketConnection'

const MinesContext = createContext()

export const MinesProvider = ({ children }) => {
  const { user, balance, setBalance } = useContext(AuthContext)
  const [gameState, setGameState] = useState({
    gameId: null,
    betAmount: 1, // Default bet amount
    minesCount: 3, // Default mines count
    grid: Array(25).fill(null),
    revealedCount: 0,
    potentialPayout: 0,
    nextMultiplier: 0,
    gameActive: false,
    gameOver: false,
    won: false,
    minePositions: []
  })
  
  // Game history
  const [gameHistory, setGameHistory] = useState([])
  
  // Socket connection
  const { 
    socketRef,
    handleStartGame,
    handleRevealTile,
    handleCashout
  } = useSocketConnection({
    user,
    balance,
    setBalance,
    gameState,
    setGameState,
    setGameHistory
  })
  
  // Set bet amount
  const setBetAmount = useCallback((amount) => {
    setGameState(prev => ({
      ...prev,
      betAmount: amount
    }))
  }, [])
  
  // Set mines count
  const setMinesCount = useCallback((count) => {
    setGameState(prev => ({
      ...prev,
      minesCount: count
    }))
  }, [])
  
  // Start game
  const startGame = useCallback(() => {
    if (!user) {
      return
    }
    
    handleStartGame(gameState.betAmount, gameState.minesCount)
  }, [user, gameState.betAmount, gameState.minesCount, handleStartGame])
  
  // Reveal tile
  const revealTile = useCallback((position) => {
    if (!gameState.gameActive) {
      return
    }
    
    handleRevealTile(position)
  }, [gameState.gameActive, handleRevealTile])
  
  // Cashout
  const cashout = useCallback(() => {
    if (!gameState.gameActive) {
      return
    }
    
    handleCashout()
  }, [gameState.gameActive, handleCashout])
  
  // Reset game
  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      grid: Array(25).fill(null),
      revealedCount: 0,
      potentialPayout: 0,
      nextMultiplier: 0,
      gameActive: false,
      gameOver: false,
      won: false,
      minePositions: []
    }))
  }, [])
  
  // Calculate max profit
  const calculateMaxProfit = useCallback(() => {
    // Simple calculation - this should be replaced with a more accurate formula
    const safeSquares = 25 - gameState.minesCount
    const maxMultiplier = Math.pow((25 / safeSquares), safeSquares) * 0.97 // 3% house edge
    return (maxMultiplier * gameState.betAmount).toFixed(2)
  }, [gameState.betAmount, gameState.minesCount])
  
  const value = {
    gameState,
    setGameState,
    gameHistory,
    setBetAmount,
    setMinesCount,
    startGame,
    revealTile,
    cashout,
    resetGame,
    calculateMaxProfit
  }
  
  return (
    <MinesContext.Provider value={value}>
      {children}
    </MinesContext.Provider>
  )
}

export const useMinesGame = () => {
  const context = useContext(MinesContext)
  if (context === undefined) {
    throw new Error('useMinesGame must be used within a MinesProvider')
  }
  return context
}