import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { AuthContext } from '../../context/AuthContext';
import { serverUrl } from '../../utils/api';

const HiloContext = createContext();

export const useHiloGame = () => useContext(HiloContext);

export const HiloGameProvider = ({ children }) => {
  const { user, balance, setBalance } = useContext(AuthContext);

  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState("idle");
  const [currentGame, setCurrentGame] = useState(null);
  const [error, setError] = useState(null);
  const [recentBets, setRecentBets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Connect to backend socket
  useEffect(() => {
    const socketInstance = io(serverUrl());
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      setConnected(true);
      socketInstance.emit("hilo-init", user, (response) => {
        if (response.code === 0) {
          setRecentBets(response.data.betLogs || []);
        } else {
          setError(response.message);
        }
        setLoading(false);
      });
    });

    socketInstance.on("disconnect", () => {
      setConnected(false);
    });

    // Listen for bet results and game updates
    socketInstance.on("hiloBet", (bet) => {
      setCurrentGame(bet);
      setGameState("playing");
    });

    socketInstance.on("hiloChoice", (game) => {
      setCurrentGame(game);
    });

    socketInstance.on("hiloCashout", (game) => {
      setCurrentGame(game);
      setGameState("finished");
    });

    socketInstance.on("hiloError", (msg) => {
      setError(msg);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  // Place a bet
  const placeBet = useCallback((betData, callback) => {
    if (!socket || !connected) return;
    // Add user info to betData if not present
    const data = {
      ...betData,
      _id: user?._id,
      name: user?.username,
      avatar: user?.profile_image || '',
      hidden: user?.hidden_from_public || false,
      currencyName: 'USD',
      currencyImage: '/assets/token/usdt.png',
    };
    socket.emit("hilo-bet", data, callback);
  }, [socket, connected, user]);

  // Make a choice (hi/lo/same/skip)
  const makeChoice = useCallback((choice, callback) => {
    if (!socket || !connected || !currentGame) return;
    socket.emit("hilo-choice", { betId: currentGame.betId, choice }, callback);
  }, [socket, connected, currentGame]);

  // Cash out
  const cashOut = useCallback((callback) => {
    if (!socket || !connected || !currentGame) return;
    socket.emit("hilo-cashout", { betId: currentGame.betId }, callback);
  }, [socket, connected, currentGame]);

  const value = {
    user,
    balance,
    setBalance,
    gameState,
    setGameState,
    currentGame,
    setCurrentGame,
    error,
    setError,
    recentBets,
    setRecentBets,
    loading,
    placeBet,
    makeChoice,
    cashOut,
  };

  return (
    <HiloContext.Provider value={value}>
      {children}
    </HiloContext.Provider>
  );
};

export default HiloContext;