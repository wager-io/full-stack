import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import graphStore from '../store/GraphStore';
import { GameStatus } from '../models/CrashGame';
import { serverUrl } from "../../../utils/api";

// Map status number to string
export const mapStatusToString = (status) => {
  switch (status) {
    case 0: return 'waiting';
    case 1: return 'starting';
    case 2: return 'running';
    case 3: return 'crashed';
    default: return 'waiting';
  }
};

// Create a singleton socket instance that persists across component mounts/unmounts
let globalSocket = null;

export default function useSocketConnection({
  user,
  balance,
  setBalance,
  gameState,
  setGameState,
  setBets,
  setHistory,
  userBet,
  setUserBet
}) {
  const socketRef = useRef(null);
  // Use a ref to track if we've already processed initial data
  const initialDataProcessedRef = useRef(false);

  // Callback for placing a bet
  const handlePlaceBet = useCallback((amount, autoCashout) => {
    // Check if user is logged in
    if (!user) {
      toast.error('Please log in to place a bet', {
        description: 'You need to be logged in to play games'
      });
      return;
    }

    // // For non-zero bets, check if user has sufficient balance
    // if (amount > 0 && amount > balance) {
    //   toast.error('Insufficient balance', {
    //     description: `Your balance: ${balance.toFixed(2)} USDT`
    //   });
    //   return;
    // }

    // Check if cashout value is valid
    if (autoCashout < 1.01) {
      toast.error('Invalid cashout value');
      return;
    }

    // Check if socket is connected
    if (!socketRef.current || !socketRef.current.connected) {
      toast.error('Connection error');
      return;
    }

    // Emit bet event to server
    socketRef.current.emit('throw-bet', {
      userId: user._id,
      gameId: gameState.gameId,
      bet: amount,
      autoEscapeRate: autoCashout,
      currencyName: 'USDT',
      currencyImage: '/assets/token/usdt.png',
      name: user.username || 'Player',
      avatar: user.avatar || '/assets/avatars/default.png',
      hidden: user.hiddenFromPublic || false
    }, (response) => {
      if (response.code !== 0) {
        toast.error('Bet placement failed', {
          description: response.message || 'Failed to place bet'
        });
      } else {
        setUserBet({
          amount,
          autoCashout
        });

        // Update balance for non-zero bets
        if (amount >= 0) {
          setBalance(prevBalance => prevBalance - amount);
        }
      }
    });
  }, [user, balance, gameState?.gameId, setBalance, setUserBet]);

  // Callback for cashing out
  const handleCashout = useCallback(() => {
    if (!userBet || gameState.status !== 'running') return;

    // Check if user is logged in
    if (!user) {
      toast.error('Please log in to cash out', {
        description: 'You need to be logged in to play games'
      });
      return;
    }

    // Check if socket is connected
    if (!socketRef.current || !socketRef.current.connected) {
      toast.error('Connection error');
      return;
    }

    // Emit cashout event to server
    socketRef.current.emit('throw-escape', {
      userId: user._id,
      gameId: gameState?.gameId
    }, (response) => {
      if (response.code !== 0) {
        toast.error('Cashout failed')
      } else {
        // Only show toast for non-zero bets
        if (userBet?.amount >= 0) {
          const winAmount = userBet?.amount * gameState?.multiplier;
          const profit = winAmount - userBet?.amount;

          // Update balance
          setBalance(prevBalance => prevBalance + winAmount);
          setUserBet(null);
        }
      }
    });
  }, [user, userBet, gameState?.status, gameState?.gameId, gameState?.multiplier, setBalance]);

  // Auto cashout effect
  useEffect(() => {
    if (userBet && userBet.autoCashout &&
      gameState?.status === 'running' &&
      gameState?.multiplier >= userBet?.autoCashout) {
      handleCashout();
    }
  }, [userBet, gameState?.status, gameState?.multiplier, handleCashout]);

  useEffect(() => {
    const apiBaseUrl = serverUrl();
    fetch(`${apiBaseUrl}/api/crash/history`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.recent) {
          setHistory(data.recent.map(game => ({
            id: game.gameId,
            crashPoint: game.crashedAt
          })));
        }
      })
      .catch(err => {
        console.error("Failed to fetch crash history:", err);
        graphStore.setErrorMessage("Failed to load game history");
      });
  }, [])

  useEffect(() => {
    // Connect to Socket.IO server only if we don't already have a connection
    if (!globalSocket) {
      const socketUrl = serverUrl();
      globalSocket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 20000,
        withCredentials: true
      });

      // Make the socket available globally for other components
      window.socket = globalSocket;

      // Set up the beforeunload event to disconnect the socket when the page is closed
      window.addEventListener('beforeunload', () => {
        if (globalSocket) {
          globalSocket.disconnect();
          globalSocket = null;
          window.socket = null;
        }
      });
    }

    // Store the global socket in the ref
    socketRef.current = globalSocket;

    // Set up connection event handler
    const handleConnect = () => {
      graphStore.setStatusMessage("Connected to game server");

      // Join the crash game room - only if we haven't processed initial data yet
      if (!initialDataProcessedRef.current) {
        socketRef.current.emit('join', {}, (response) => {
          if (response.code === 0) {
            const { data } = response;

            // Update game state based on initial data
            setGameState({
              status: mapStatusToString(data.status),
              multiplier: data.status === GameStatus.PROGRESS ? 1 : (data.maxRate / 100),
              crashPoint: data.maxRate / 100,
              timeLeft: data.prepareTime / 1000,
              gameId: data?.gameId
            });

            // Update graph store
            graphStore.setGameData(data);

            // Update bets
            setBets(data.players.map(player => ({
              userId: player.userId,
              username: player.name,
              amount: player.bet,
              autoCashout: player.autoEscapeRate,
              status: player.rate > 0 ? 'cashed_out' : 'active',
              cashoutMultiplier: player.rate
            })));

            // Check if user has an active bet
            if (user) {
              const userActiveBet = data.players.find(p => p.userId === user.id);
              if (userActiveBet) {
                setUserBet({
                  amount: userActiveBet.bet,
                  autoCashout: userActiveBet.autoEscapeRate
                });
              }
            }

            // Mark that we've processed initial data
            initialDataProcessedRef.current = true;
          } else {
            graphStore.setErrorMessage("Failed to join game");
          }
        });
      }
    };

    // If socket is already connected, call the handler directly
    if (socketRef.current.connected) {
      handleConnect();
    } else {
      // Otherwise set up the connect event listener
      socketRef.current.on('connect', handleConnect);
    }

    // Authenticate socket when user is available and socket matches
    if (user && socketRef.current) {
      socketRef.current.emit('auth', user._id || user.id);
    }

    // Set up all the event listeners
    socketRef.current.on('pr', (data) => {
      // Make sure we're setting the correct startTime
      // The startTime should be the absolute timestamp when the game will start
      const startTime = data.startTime;
      setGameState(prev => ({
        ...prev,
        gameId: data.gameId,
        status: 'starting',
        timeLeft: data.prepareTime / 1000,
        multiplier: 1,
        startTime: startTime
      }));

      // Make sure we're updating the graph store with the correct startTime
      graphStore.updateGameStatus(GameStatus.STARTING);
      graphStore.setStartTime(startTime);
      graphStore.setGameStateMessage(`Starting in ${Math.ceil(data.prepareTime / 1000)}s`);
      graphStore.resetEscapes();

      // Reset bets for new game
      setBets([]);
      setUserBet(null);
    });

    socketRef.current.on('bg', (data) => {
      setGameState(prev => ({
        ...prev,
        status: 'running',
        multiplier: 1,
        timeLeft: 0
      }));

      graphStore.updateGameStatus(GameStatus.PROGRESS);
      graphStore.setStartTime(Date.now());
      graphStore.clearMessages();
    });

    socketRef.current.on('pg', (data) => {
      const multiplier = Math.exp(0.00006 * data.elapsed);
      setGameState(prev => ({
        ...prev,
        status: 'running',
        multiplier
      }));

      graphStore.updateGameRate(multiplier);
    });

    socketRef.current.on('ed', (data) => {
      const crashPoint = data.maxRate / 100;

      setGameState(prev => ({
        ...prev,
        status: 'crashed',
        multiplier: crashPoint,
        crashPoint,
        hash: data.hash
      }));

      graphStore.updateGameStatus(GameStatus.ENDED);
      graphStore.updateGameRate(crashPoint);
      graphStore.game.hash = data.hash;
      graphStore.game.maxRate = crashPoint;
      graphStore.setGameStateMessage(`CRASHED AT ${crashPoint.toFixed(2)}x`);

      // Fetch crash history - using a separate function to avoid setState in useEffect issue
      fetchCrashHistory(setHistory);
    });

    socketRef.current.on('b', (bet) => {
      setBets(prev => {
        // Check if this bet already exists
        const betExists = prev.some(existingBet =>
          existingBet.userId === bet.userId &&
          existingBet.amount === bet.bet
        );

        // Only add if it doesn't exist
        if (!betExists) {
          return [
            ...prev,
            {
              userId: bet.userId,
              username: bet.name,
              amount: bet.bet,
              autoCashout: bet.autoEscapeRate,
              status: 'active'
            }
          ];
        }

        return prev;
      });
    });

    socketRef.current.on('xb', (bet) => {
      console.log("New x-bet:", bet);
      // X-bets are handled differently, but we could add them to a separate state if needed
    });

    socketRef.current.on('e', (escape) => {
      // Update bets list
      setBets(prev => prev.map(bet =>
        bet.userId === escape.userId
          ? { ...bet, status: 'cashed_out', cashoutMultiplier: escape.rate }
          : bet
      ));

      // Add escape to graph
      const escapeData = {
        userId: escape.userId,
        name: escape.userId, // Will be updated with actual name if found
        rate: escape.rate,
        usd: 0 // Will be updated if bet is found
      };

      // Find the bet to get more details - using a separate function to avoid setState in useEffect issue
      fetchPlayerDetails(socketRef.current, escape.userId, escapeData);

      // Check if this is the current user
      if (user && escape.userId === user.id) {
        setUserBet(null);
      }
    });

    socketRef.current.on('st', (data) => {
      // console.log("Game stats:", data);
      // This event provides a summary of the game, including all escapes
    });

    socketRef.current.on('mybet', (data) => {
      // console.log("My bet results:", data);
      // This event provides results for the user's bets
    });

    socketRef.current.on('connect_error', (error) => {
      graphStore.setErrorMessage("Connection error", true);
    });

    socketRef.current.on('disconnect', () => {
      setGameState(prev => ({ ...prev, status: 'waiting' })); // Or explicitly map to status 0 if needed
      graphStore.updateGameStatus(0); // 0 is CONNECTION
      graphStore.setErrorMessage("Disconnected from server", true);
    });

    return () => {
      // When component unmounts, remove event listeners but DON'T disconnect
      if (socketRef.current) {
        socketRef.current.off('connect', handleConnect);
        socketRef.current.off('pr');
        socketRef.current.off('bg');
        socketRef.current.off('pg');
        socketRef.current.off('ed');
        socketRef.current.off('b');
        socketRef.current.off('xb');
        socketRef.current.off('e');
        socketRef.current.off('st');
        socketRef.current.off('mybet');
        socketRef.current.off('connect_error');
        socketRef.current.off('disconnect');
      }
    };
  }, [user, setGameState, setBets, setHistory, setUserBet]);

  return {
    socketRef,
    handlePlaceBet,
    handleCashout
  };
}

// Separate function to fetch crash history to avoid setState in useEffect issue
function fetchCrashHistory(setHistory) {
  const apiBaseUrl = serverUrl();
  fetch(`${apiBaseUrl}/api/crash/history`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      if (data.recent) {
        setHistory(data.recent.map(game => ({
          id: game.gameId,
          crashPoint: game.crashedAt
        })));
      }
    })
    .catch(err => {
      console.error("Failed to fetch crash history:", err);
      graphStore.setErrorMessage("Failed to load game history");
    });
}

// Separate function to fetch player details to avoid setState in useEffect issue
function fetchPlayerDetails(socket, userId, escapeData) {
  socket.emit('join', {}, (response) => {
    if (response.code === 0) {
      const player = response.data.players.find(p => p.userId === userId);
      if (player) {
        escapeData.name = player.name;
        escapeData.usd = player.bet;
        graphStore.addEscape(escapeData);
      }
    }
  });
}