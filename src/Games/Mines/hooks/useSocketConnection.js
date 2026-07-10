import { useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { toast } from 'sonner'
import { serverUrl } from '../../../utils/api'

// Create a singleton socket instance that persists across component mounts/unmounts
let globalSocket = null

export default function useSocketConnection({
  user,
  balance,
  setBalance,
  gameState,
  setGameState,
  setGameHistory
}) {
  const socketRef = useRef(null)
  const initialDataProcessedRef = useRef(false)
  
  // Initialize socket connection
  useEffect(() => {
    // Connect to Socket.IO server only if we don't already have a connection
    if (!globalSocket) {
      const socketUrl = serverUrl()
      globalSocket = io(socketUrl)
      
      // Make the socket available globally for other components
      window.socket = globalSocket
      
      // Set up the beforeunload event to disconnect the socket when the page is closed
      window.addEventListener('beforeunload', () => {
        if (globalSocket) {
          globalSocket.disconnect()
          globalSocket = null
          window.socket = null
        }
      })
    }
    
    // Store the global socket in the ref
    socketRef.current = globalSocket
    


    // Join the mines game room - only if we haven't processed initial data yet
    if (socketRef.current && user && !initialDataProcessedRef.current) {
      socketRef.current.emit('mines-join', { userId: user._id }, (response) => {
        if (response.code === 0) {
          const { data } = response
          initialDataProcessedRef.current = true
          
          // Check if user has an active game
          if (data.activeGame) {
            // Convert the grid data from the server format to our client format
            const gridState = Array(25).fill(null)
            
            // If the server provides revealed tiles, update the grid
            if (data.activeGame.revealedTiles && data.activeGame.revealedTiles.length > 0) {
              data.activeGame.revealedTiles.forEach(tile => {
                gridState[tile.position] = tile.isMine ? 'mine' : 'gem'
              })
            }
            
            setGameState({
              gameId: data.activeGame.gameId,
              betAmount: data.activeGame.betAmount,
              minesCount: data.activeGame.minesCount,

              grid: gridState,
              revealedCount: data.activeGame.revealedCount || 0,
              potentialPayout: data.activeGame.potentialPayout || 0,
              nextMultiplier: data.activeGame.nextMultiplier || 0,
              gameActive: data.activeGame.gameState === 'active',
              gameOver: data.activeGame.gameState !== 'active',
              won: data.activeGame.gameState === 'won',

              minePositions: data.activeGame.minePositions || []
            })
            
            // Show a toast notification that we've restored their game
            toast.info('Your previous game has been restored', {
              description: 'You can continue playing or cash out'
            })
          }
          
          // Set game history
          if (data.recentGames) {
            setGameHistory(data.recentGames.map(game => ({

              player: game.username || 'Player',
              betAmount: game.betAmount,
              minesCount: game.minesCount,
              revealedCount: game.revealedCount,
              multiplier: game.payout / game.betAmount,
              profit: game.profit,
              createdAt: game.createdAt
            })))
          }
        }
      })
    }
    
    return () => {
      // When component unmounts, remove event listeners but DON'T disconnect
      if (socketRef.current) {
        // Clean up any event listeners if needed
      }
    }
  }, [user, setGameState, setGameHistory])
  
  // Socket event listeners
  useEffect(() => {
    if (!socketRef.current) return
    
    // Listen for game updates
    socketRef.current.on('mines-new-game', (data) => {
      // Handle new game event (other players)
      console.log('New game started by another player:', data)
    })
    
    socketRef.current.on('mines-tile-revealed', (data) => {
      // Handle tile revealed event (other players)
      console.log('Tile revealed by another player:', data)
    })
    
    socketRef.current.on('mines-game-over', (data) => {
      // Handle game over event (other players)
      console.log('Game over for another player:', data)
    })
    
    socketRef.current.on('mines-cashout', (data) => {
      // Handle cashout event (other players)
      console.log('Another player cashed out:', data)
    })
    
    // Listen for game state updates for the current user
    socketRef.current.on('mines-game-state-update', (data) => {
      if (data.userId === user?._id) {
        // Update the game state based on server data
        setGameState(prev => ({
          ...prev,
          ...data.gameState
        }))
      }
    })
    
    return () => {
      // Clean up event listeners
      if (socketRef.current) {
        socketRef.current.off('mines-new-game')
        socketRef.current.off('mines-tile-revealed')
        socketRef.current.off('mines-game-over')
        socketRef.current.off('mines-cashout')
        socketRef.current.off('mines-game-state-update')
      }
    }

  }, [user, setGameState])
  
  // Start a new game
  const handleStartGame = useCallback((betAmount, minesCount) => {
    if (!socketRef.current || !user) {
      toast.error('Connection error')
      return
    }
    
    socketRef.current.emit('mines-start', {
      userId: user._id,
      betAmount,
      minesCount
    }, (response) => {
      if (response.code === 0) {
        const { data } = response
        
        // Update game state
        setGameState({
          gameId: data.gameId,
          betAmount: data.betAmount,
          minesCount: data.minesCount,
          grid: Array(25).fill(null),
          revealedCount: 0,
          potentialPayout: data.potentialPayout,
          nextMultiplier: data.nextMultiplier,
          gameActive: true,
          gameOver: false,
          won: false,
          minePositions: []
        })
        
        // Update balance
        setBalance(prevBalance => prevBalance - betAmount)
        
        toast.success('Game started')
      } else {
        toast.error(response.message || 'Failed to start game')
      }
    })
  }, [user, setGameState, setBalance])
  
  // Reveal a tile
  const handleRevealTile = useCallback((position) => {
    if (!socketRef.current || !user || !gameState.gameId) {
      toast.error('Connection error')
      return
    }
    
    socketRef.current.emit('mines-reveal', {
      userId: user._id,
      gameId: gameState.gameId,
      position
    }, (response) => {
      if (response.code === 0) {
        const { data } = response
        
        // Update grid
        setGameState(prev => {
          const newGrid = [...prev.grid]
          newGrid[position] = data.hitMine ? 'mine' : 'gem'
          
          return {
            ...prev,
            grid: newGrid,
            revealedCount: data.revealedCount || prev.revealedCount + 1,
            potentialPayout: data.potentialPayout || prev.potentialPayout,
            nextMultiplier: data.nextMultiplier || prev.nextMultiplier,
            gameActive: !data.gameOver,
            gameOver: data.gameOver || false,
            won: data.won || false,
            minePositions: data.minePositions || prev.minePositions
          }
        })
        
        // Handle game over
        if (data.hitMine) {
          toast.error('Game over! You hit a mine')
        }
      } else {
        toast.error(response.message || 'Failed to reveal tile')
      }
    })
  }, [user, gameState.gameId, setGameState])
  
  // Cashout (end game)
  const handleCashout = useCallback(() => {
    if (!socketRef.current || !user || !gameState.gameId) {
      toast.error('Connection error')
      return
    }
    
    socketRef.current.emit('mines-cashout', {

      userId: user._id,
      gameId: gameState.gameId
    }, (response) => {
      if (response.code === 0) {
        const { data } = response
        
        // Update game state
        setGameState(prev => ({
          ...prev,
          gameActive: false,
          gameOver: true,
          won: true,

          minePositions: data.minePositions || []
        }))
        
        // Update balance
        setBalance(prevBalance => prevBalance + data.payout)
        
        // Show success message
        toast.success(`You won ${data.profit.toFixed(2)} USDT!`)
        
        // Update game history
        socketRef.current.emit('mines-history', { userId: user._id }, (historyResponse) => {
          if (historyResponse.code === 0) {
            setGameHistory(historyResponse.data.history.map(game => ({

              player: game.username || 'Player',
              betAmount: game.betAmount,
              minesCount: game.minesCount,
              revealedCount: game.revealedCount,
              multiplier: game.payout / game.betAmount,
              profit: game.profit,
              createdAt: game.createdAt
            })))
          }
        })
      } else {
        toast.error(response.message || 'Failed to cashout')
      }
    })
  }, [user, gameState.gameId, setGameState, setBalance, setGameHistory])
  
  return {
    socketRef,
    handleStartGame,
    handleRevealTile,
    handleCashout
  }
}