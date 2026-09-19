import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { toast } from 'sonner';
import useHiloBackend from '../hooks/useHiloBackend';

/**
 * Hilo's context — the game state every component here reads.
 *
 * THE TRANSPORT CHANGED, THE INTERFACE DID NOT. This used to open a socket.io
 * connection to `serverUrl()` and trade `hilo-init` / `hilo-bet` /
 * `hilo-next-round` / `hilo-cashout` with the Node backend. That backend no
 * longer exists and `utils/api` points at nothing, so the screen was routed,
 * live, and unplayable. Those four operations are now RPCs, behind
 * `useHiloBackend`; every key the components actually read is unchanged, so
 * nothing below this provider had to be edited.
 */

// Create context
const HiloContext = createContext();

// Custom hook to use the context
export const useHiloGame = () => useContext(HiloContext);

// Provider component
export const HiloGameProvider = ({ children }) => {
  const { user, balance, setBalance } = useContext(AuthContext);

  // --- UI state (unchanged) ---
  const [hotkeysEnabled, setHotkeysEnabled] = useState(false);
  const [soundSettings, setSoundSettings] = useState({ music: true, soundFx: true });
  const [soundManager, setSoundManager] = useState(null);
  const [allBets, setAllBets] = useState([]);
  const [myBets, setMyBets] = useState([]);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [betAmount, setBetAmount] = useState(1);
  const [cardHistory, setCardHistory] = useState([]);
  const [controlStats, setControlStats] = useState({});
  const [newGame, setNewGame] = useState(true);
  const [deckCount, setDeckCount] = useState(4);

  const createFullDeck = () => [
    // Hearts (red)
    { value: 'A', color: 'var(--red-500)', disabled: false, faceDown: true },
    { value: '2', color: 'var(--red-500)', disabled: false, faceDown: true },
    // ... rest of the deck
  ];

  const [deck, setDeck] = useState(createFullDeck());

  // --- The game itself, over Supabase RPCs ---
  const {
    hiloGame,
    setHiloGame,
    currentCard,
    setCurrentCard,
    hasActiveGame,
    setHasActiveGame,
    gameInitialized,
    processingRequest,
    setProcessingRequest,
    error,
    setError,
    cashoutResult,
    setCashoutResult,
    profitHigher,
    profitLower,
    handleBet: placeBet,
    handleNextRound: nextRound,
    handleCashOut,
  } = useHiloBackend({ user, setBalance });

  /*
   * The stake check that used to sit inside handleBet. `place_bet` is the
   * authority and refuses an over-stake regardless; this keeps the immediate
   * message instead of a round trip that comes back as a raw error.
   */
  const handleBet = useCallback((data) => {
    if (Number(data?.bet_amount) > Number(balance)) {
      toast.error('Insufficient funds to place this bet');
      return undefined;
    }
    return placeBet(data);
  }, [balance, placeBet]);

  // Both of the old next-round entry points took the same { hi, lo, skip }
  // object and differed only in their logging, so they are one function now.
  const handleNextRound = nextRound;
  const handleHiloNextRound = nextRound;

  // --- UI/UX & SETTINGS ---
  // Save hotkeys setting to localStorage when changed
  useEffect(() => {
    localStorage.setItem('HILO_HOTKEYS_ENABLED', hotkeysEnabled);
  }, [hotkeysEnabled]);

  // Update auth context when balance changes
  const updateBalance = useCallback((newBalanceOrFn) => {
    if (typeof newBalanceOrFn === 'function') {
      setBalance((prevBalance) => newBalanceOrFn(prevBalance));
    } else {
      setBalance(newBalanceOrFn);
    }
  }, [setBalance]);

  /*
   * profitHigher / profitLower come from the SERVER now — hilo_profit, at the
   * real chances for the card showing. They used to be invented here:
   *
   *   setProfitHigher(amount * 2.25)
   *   setProfitLower(amount * 1.1)
   *   setProfitSame(amount * 12)   // "you can adjust as needed"
   *
   * Fixed numbers, unrelated to the odds being offered, on a screen where the
   * number IS the offer.
   *
   * profitSame went with them. This game has no "same" bet: a tie pays whichever
   * side you called (both of them, except off an Ace or a King), so there was
   * never a third button behind that figure. Nothing outside this file read any
   * of the three.
   */

  // Reset cardHistory when a new game starts
  useEffect(() => {
    if (hiloGame && hiloGame.rounds && hiloGame.rounds.length === 0) {
      setCardHistory([]);
    }
  }, [hiloGame]);

  // Helper function to start a new game
  const startNewGame = useCallback((betData) => {
    if (!user || processingRequest) return;
    handleBet(betData);
  }, [user, processingRequest, handleBet]);

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
      rankValue: currentRound.cardRankNumber,
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
    setScreenWidth,
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
    cardHistory,
    setCardHistory,
    controlStats,
    setControlStats,
    handleHiloNextRound,
    deckCount,
    cashoutResult,
    setCashoutResult,
    setDeckCount,
    newGame,
    setNewGame,
    hasActiveGame,
    setHasActiveGame,
    gameInitialized,
    startNewGame,
    getCurrentCard,
  };

  return (
    <HiloContext.Provider value={value}>
      {children}
    </HiloContext.Provider>
  );
};
export default HiloContext;
