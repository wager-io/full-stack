import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { toast } from 'sonner';
import { SoundManager } from '../audio/SoundManager';
import { io } from "socket.io-client";
import { serverUrl } from '../../../utils/api';

// Create context
const HiloContext = createContext();

// Custom hook to use the context
export const useHiloGame = () => useContext(HiloContext);

// Provider component
export const HiloGameProvider = ({ children }) => {
  const { user, balance, setBalance } = useContext(AuthContext);
  
  // Game state
  const [hiloGame, setHiloGame] = useState(null);
  const [processingRequest, setProcessingRequest] = useState(false);
  const [hotkeysEnabled, setHotkeysEnabled] = useState(false);
  const [soundSettings, setSoundSettings] = useState({ music: true, soundFx: true });
  const [soundManager, setSoundManager] = useState(null);
  const [error, setError] = useState(null);
  const [allBets, setAllBets] = useState([]);
  const [myBets, setMyBets] = useState([]);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [betAmount, setBetAmount] = useState(1);
  const [profitHigher, setProfitHigher] = useState(0);
  const [profitLower, setProfitLower] = useState(0);
  const [profitSame, setProfitSame] = useState(0);
  const [cardHistory, setCardHistory] = useState([]);
  const [socket, setSocket] = useState(null);
  const [newGame, setNewGame] = useState(true);
  const [controlStats, setControlStats] = useState({});
  const [cashoutResult, setCashoutResult] = useState(null);
  
  // New state for tracking if there's an active game
  const [hasActiveGame, setHasActiveGame] = useState(false);
  const [gameInitialized, setGameInitialized] = useState(false);
  
  const createFullDeck = () => [
    // Hearts (red)
    { value: 'A', color: 'var(--red-500)', disabled: false, faceDown: true },
    { value: '2', color: 'var(--red-500)', disabled: false, faceDown: true },
    // ... rest of the deck
  ];
  
  const [deck, setDeck] = useState(createFullDeck());
  const [deckCount, setDeckCount] = useState(4);
  const [currentCard, setCurrentCard] = useState({
    value: "Q",
    color: "var(--red-500)",
    disabled: false,
    faceDown: false,
  });

  // --- SOCKET.IO CONNECTION AND EVENTS ---
  useEffect(() => {
    // Connect to backend socket server
    const socketInstance = io(serverUrl(), {
      transports: ['websocket'],
      withCredentials: true,
    });
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Connected to Hilo backend socket");
      // Emit hilo-init when user is available
      if (user?._id) {
        socketInstance.emit("hilo-init", user, (response) => {
          setGameInitialized(true);
          if (response && response.code === 0) {
            console.log(response)
            // Check if there's an active game
            const hasGame = response.data && 
                           response.data.bet_id && 
                           response.data.rounds && 
                           response.data.rounds.length > 0;
            setHasActiveGame(hasGame);
          } 
        });
      }
    });

    // Listen for game state updates from backend
    socketInstance.on("hilo-init", (data) => {
      if(data.user_id === user._id){
        setNewGame(data.new_game);
        setHiloGame(data);
        
        // Check if there's an active game based on the data
        const hasGame = data && 
                       data.bet_id && 
                       data.rounds && 
                       data.rounds.length > 0;
        setHasActiveGame(hasGame);
      }
    });

    socketInstance.on("hilo-game", (data) => {
      if(data.user_id === user._id){ 
        setHiloGame(data);
        // Update active game status
        const hasGame = data && 
                       data.bet_id && 
                       data.rounds && 
                       data.rounds.length > 0 &&
                       !data.has_ended; // Make sure to check if game hasn't ended
        setHasActiveGame(hasGame);
      }
    });

    socketInstance.on("hilo-wallet", (data) => {
      if(data._id === user._id){ 
        setBalance(data.balance);
      }
    });

    socketInstance.on("hilo-update", (data) => {
      // Update game state after a bet/round/cashout
      if (data.currentGame) {
        setHiloGame(data.currentGame);
        
        // Update active game status
        const hasGame = data.currentGame && 
                       data.currentGame.bet_id && 
                       data.currentGame.rounds && 
                       data.currentGame.rounds.length > 0 &&
                       !data.currentGame.has_ended;
        setHasActiveGame(hasGame);
      }
      if (data.currentCard) setCurrentCard(data.currentCard);
      if (data.cardHistory) setCardHistory(data.cardHistory);
      if (data.balance !== undefined) setBalance(data.balance);
      if (data.allBets) setAllBets(data.allBets);
      if (data.myBets) setMyBets(data.myBets);
    });

    socketInstance.on("hilo-error", (err) => {
      console.error("Received hilo-error:", err);
      setError(err?.message || "Unknown error from server");
      setProcessingRequest(false); // Make sure to reset processing state on error
    });

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  // eslint-disable-next-line
  }, [user?._id]);

  // --- SOCKET.IO EMIT HELPERS ---
  // Place bet function with early validation for insufficient funds
  const handleBet = useCallback((data) => {
    if (socket && user?._id && !processingRequest) {
      // Early validation for insufficient funds
      if (data.bet_amount > balance) {
        toast.error("Insufficient funds to place this bet");
        return; // Stop execution early
      }
      
      setProcessingRequest(true);
      socket.emit("hilo-bet", {
        _id: user._id,
        bet_amount: data.bet_amount,
        token: data.token,
        token_img: data.token_img,
      }, (response) => {
        setProcessingRequest(false);
        if (response && response.code === 0) {
          // State will be updated by "hilo-update" event
        } else {
          setError(response?.message || "Failed to place bet");
        }
      });
    }
  }, [socket, user, processingRequest, balance]); // Added balance to dependencies
  // Next round (higher/lower/skip)
  const handleNextRound = useCallback((data) => {
    if (socket && user?._id) {
      if(!hiloGame.bet_id) {
        console.log("Game does not exist")
        return
      }
      console.log(hiloGame.bet_id)
      console.log("Next round clicked")
      setProcessingRequest(true);
      socket.emit("hilo-next-round", {
        user_id: user._id,
        bet_id: hiloGame.bet_id,
        hi: data.hi,
        lo: data.lo,
        skip: data.skip,
        bet_amount: hiloGame?.bet_amount,
        payout: hiloGame?.payout,
        token: "USDT",
        token_img: "/uyiu/.jkhk",
      }, (response) => {
        setProcessingRequest(false);
        if (response && response.code === 0) {
          console.log(response)
          // State will be updated by "hilo-update" event
        } else {
          setError(response?.message || "Failed to proceed to next round");
        }
      });
    }
  }, [socket, user, processingRequest, hiloGame]);

  // Updated handleHiloNextRound to work every time it's clicked
  const handleHiloNextRound = useCallback((choice) => {
    console.log("handleHiloNextRound called with:", choice);
    
    if (!socket) {
      console.error("Socket not initialized");
      return;
    }
    
    if (!user?._id) {
      console.error("User not authenticated");
      return;
    }
    
    if (processingRequest) {
      console.log("Request already in progress, ignoring click");
      return;
    }
    
    if (!hiloGame?.bet_id) {
      console.error("No active game found");
      return;
    }
    
    // Set processing state to prevent multiple clicks
    // setProcessingRequest(true);
    
    // Prepare the data to send to the server
    const requestData = {
      _id: user._id,
      bet_id: hiloGame.bet_id,
      hi: choice.hi || false,
      lo: choice.lo || false,
      skip: choice.skip || false,
      bet_amount: hiloGame?.bet_amount,
      payout: hiloGame?.payout,
    };
    
    console.log("Sending hilo-next-round with data:", requestData);
    
    // Emit the event to the server
    socket.emit("hilo-next-round", requestData, (response) => {
      console.log("Received response from hilo-next-round:", response);
      
      // Always reset processing state when we get a response
      if (response && response.code === 0) {
        console.log("Next round successful");
        // If it was a skip action, make sure we maintain the active game state
        if (choice.skip) {
          console.log("Skip action - maintaining active game state");
          setHasActiveGame(true);
        }
        setProcessingRequest(false);
        // The game state will be updated by the "hilo-update" event
      } else {
        // Handle error
        const errorMessage = response?.message || "Failed to proceed to next round";
        console.error("Next round failed:", errorMessage);
        setError(errorMessage);
      }
    });

  }, [socket, user, processingRequest, hiloGame, setProcessingRequest, setError, setHasActiveGame]);
    // Cash out
    const handleCashOut = useCallback(() => {
      if (socket && user?._id && !processingRequest && hiloGame) {
        setProcessingRequest(true);
        socket.emit("hilo-cashout", {
          user_id: user._id,
          bet_id: hiloGame.bet_id,
        }, (response) => {
          setProcessingRequest(false);
          if (response && response.code === 0) {
            // Store the cashout result for display
            setCashoutResult({
              amount: response.data?.payout || hiloGame.payout,
              profit: (response.data?.payout || hiloGame.payout) - hiloGame.bet_amount,
              multiplier: (response.data?.payout || hiloGame.payout) / hiloGame.bet_amount,
              timestamp: new Date().toISOString()
            });
          
            // Set active game to false when cashed out
            setHasActiveGame(false);
          
            // Clear the cashout result after 5 seconds
            setTimeout(() => {
              setCashoutResult(null);
            }, 5000);
          } else {
            setError(response?.message || "Failed to cash out");
          }
        });
      }
    }, [socket, user, processingRequest, hiloGame]);
  // --- UI/UX & SETTINGS ---
  // Save hotkeys setting to localStorage when changed
  useEffect(() => {
    localStorage.setItem("HILO_HOTKEYS_ENABLED", hotkeysEnabled);
  }, [hotkeysEnabled]);

  // Update auth context when balance changes
  const updateBalance = useCallback((newBalanceOrFn) => {
    if (typeof newBalanceOrFn === 'function') {
      setBalance(prevBalance => {
        const newBalance = newBalanceOrFn(prevBalance);
        return newBalance;
      });
    } else {
      setBalance(newBalanceOrFn);
    }
  }, [setBalance]);
 
  // Calculate profits when betAmount or currentCard changes
  useEffect(() => {
    // Example multipliers: Higher = 2.25x, Lower = 1.1x, Same = 12x (you can adjust as needed)
    const amount = Number(betAmount) || 0;
    setProfitHigher(amount > 0 ? +(amount * 2.25).toFixed(2) : 0);
    setProfitLower(amount > 0 ? +(amount * 1.1).toFixed(2) : 0);
    setProfitSame(amount > 0 ? +(amount * 12).toFixed(2) : 0);
  }, [betAmount, currentCard]);

  // Reset cardHistory when a new game starts
  useEffect(() => {
    if (hiloGame && hiloGame.rounds && hiloGame.rounds.length === 0) {
      setCardHistory([]);
    }
  }, [hiloGame]);

  // Reset game state when game ends
  useEffect(() => {
    if (hiloGame && hiloGame.has_ended) {
      setHasActiveGame(false);
    }
  }, [hiloGame]);

  // Helper function to start a new game
  const startNewGame = useCallback((betData) => {
    if (!socket || !user?._id || processingRequest) return;
    
    handleBet(betData);
  }, [socket, user, processingRequest, handleBet]);

  // Get the current card from the game state
  const getCurrentCard = useCallback(() => {
    if (!hiloGame || !hiloGame.rounds || hiloGame.rounds.length === 0) {
      return null;
    }
    
    const currentRound = hiloGame.rounds[hiloGame.rounds.length - 1];
    return {
      card: currentRound.card,
      rank: currentRound.cardRank,
      suite: currentRound.cardSuite,
      rankValue: currentRound.cardRankNumber
    };
  }, [hiloGame]);

  // Context value
  const value = {
    hiloGame,
    setHiloGame,
    processingRequest,
    setProcessingRequest,
    hotkeysEnabled,
    setHotkeysEnabled,
    soundSettings,
    setSoundSettings,
    soundManager,
    setSoundManager,
    balance,
    setBalance: updateBalance,
    error,
    setError,
    user,
    allBets,
    setAllBets,
    myBets,
    setMyBets,
    screenWidth,
    handleBet,
    handleNextRound,
    handleCashOut,
    createFullDeck, 
    deck, 
    setDeck, 
    currentCard, 
    setCurrentCard,
    betAmount, 
    setBetAmount,
    profitHigher, 
    profitLower, 
    profitSame,
    cardHistory, 
    setCardHistory,
    controlStats, 
    setControlStats,
    socket,
    handleHiloNextRound, 
    deckCount, cashoutResult, setCashoutResult,
    setDeckCount, 
    newGame, 
    setNewGame,
    // New state for active game management
    hasActiveGame,
    setHasActiveGame,
    gameInitialized,
    startNewGame,
    getCurrentCard
  };

  return (
    <HiloContext.Provider value={value}>
      {children}
    </HiloContext.Provider>
  );
};
export default HiloContext;
