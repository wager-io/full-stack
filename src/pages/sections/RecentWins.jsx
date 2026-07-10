import React, { useState, useEffect } from 'react'
import socketService from '../../services/socketService';
import api from '../../utils/api';

export default function RecentWins() {
  const gameImages = {
    'Crash': '/assets/InhouseGames/crash-game.png',
    'Dice': '/assets/InhouseGames/diceGame.png',
    'Hilo': '/assets/InhouseGames/hiloGAMES.png',
    'Keno': '/assets/InhouseGames/keno.png',
    'Limbo': '/assets/InhouseGames/limboGame.png',
    'Mines': '/assets/InhouseGames/mine.png',
    'Plinko': '/assets/InhouseGames/plinko.png'
  }

  const initialWins = []

  const [wins, setWins] = useState(initialWins)
  const [nextId, setNextId] = useState(6)

  // Placeholder for real-time data logic



  useEffect(() => {
    const handleNewBet = (bet) => {
      console.log('RecentWins received bet:', bet);
      // Only show wins (Payout > 0)
      if (parseFloat(bet.payout) <= 0) return;

      const newWin = {
        id: Date.now(), // Unique ID
        username: bet.hidden ? 'Hidden' : bet.name,
        avatar: bet.avatar || '',
        game: bet.game.charAt(0).toUpperCase() + bet.game.slice(1), // Capitalize
        amount: `${parseFloat(bet.payout).toFixed(2)} ${bet.currency || 'USD'}`,
        multiplier: parseFloat(bet.multiplier).toFixed(2) + 'x',
        isNew: true
      };

      setWins(prevWins => {
        const updatedWins = [newWin, ...prevWins];
        if (updatedWins.length > 10) {
          updatedWins.pop();
        }
        return updatedWins;
      });

      // Remove isNew flag for animation
      setTimeout(() => {
        setWins(prevWins =>
          prevWins.map(win =>
            win.id === newWin.id ? { ...win, isNew: false } : win
          )
        );
      }, 500);
    };

    const setupSocket = async () => {
      try {
        if (!socketService.isSocketConnected()) {
          await socketService.connect();
        }

        if (socketService.socket) {
          socketService.socket.off('global-new-bet', handleNewBet);
          socketService.socket.on('global-new-bet', handleNewBet);

          // Re-bind on reconnect
          socketService.socket.on('reconnect', () => {
            console.log('[RecentWins] Socket reconnected, re-binding listener');
            socketService.socket.off('global-new-bet', handleNewBet);
            socketService.socket.on('global-new-bet', handleNewBet);
          });
        }
      } catch (error) {
        console.error("Socket connection failed in RecentWins:", error);
      }
    };

    const fetchInitialWins = async () => {
      try {
        console.log('[RecentWins] Fetching high rollers...');
        const data = await api.fetchData('/api/global/high-rollers');

        if (Array.isArray(data)) {
          console.log('[RecentWins] Fetched high rollers:', data.length);
          const formattedWins = data.map(win => ({
            ...win,
            isNew: false
          }));
          setWins(formattedWins);
        } else {
          console.error('[RecentWins] Expected array but got:', typeof data);
          setWins([]);
        }
      } catch (error) {
        console.error("[RecentWins] Failed to fetch initial wins:", error);
      }
    };

    fetchInitialWins();
    setupSocket();

    return () => {
      if (socketService.socket) {
        socketService.socket.off('global-new-bet', handleNewBet);
      }
    };
  }, []);

  return (
    <div className="py-2 px-2 md:px-3 lg:px-3">
      <div
        className="text-sm md:text-sm font-bold mb-2 flex items-center gap-2"
        style={{ color: 'var(--text-light)' }}
      >
        <span>High Rollers</span>
        <span className="text-xs bg-[var(--green-500)] text-black px-1.5 py-0.5 rounded font-bold">LIVE</span>
      </div>
      <div className="relative">
        <div
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitScrollbar: { display: 'none' }
          }}
        >
          {wins.map((win) => (
            <div
              key={win.id}
              className={`flex-shrink-0 flex flex-col items-center p-3 rounded-xl transition-all duration-500 hover:scale-105 ${win.isNew ? 'animate-slide-in' : ''
                }`}
              style={{
                backgroundColor: 'var(--grey-700)',
                border: '1px solid var(--border-color)',
                minWidth: '140px',
                transform: win.isNew ? 'translateX(-100px)' : 'translateX(0)',
                opacity: win.isNew ? 0 : 1,
                animation: win.isNew ? 'slideIn 0.5s ease-out forwards' : 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px var(--shadow-purple)'
                e.currentTarget.style.borderColor = 'var(--accent-purple)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = 'var(--border-color)'
              }}
            >
              <div className="relative w-16 h-16 md:w-20 md:h-20 mb-2">
                <img
                  src={gameImages[win.game] || gameImages['Crash']}
                  alt={win.game}
                  className="w-full h-full object-contain drop-shadow-lg"
                />
                {/* Multiplier Badge */}
                <div className="absolute -top-2 -right-2 bg-[var(--grey-800)] border border-[var(--active-Item)] text-[var(--text-light)] text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
                  {win.multiplier || '0.00x'}
                </div>
              </div>

              <div className="text-center w-full">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  {win.avatar && (
                    <img src={win.avatar} alt="User" className="w-4 h-4 rounded-full border border-[var(--accent-purple)]" />
                  )}
                  <div
                    className="text-xs font-semibold truncate max-w-[80px]"
                    style={{ color: 'var( --text-light)' }}
                  >
                    {win.username}
                  </div>
                </div>

                <div
                  className="text-sm font-bold bg-[rgba(34,197,94,0.1)] text-[var(--green-500)] px-2 py-1 rounded-md"
                >
                  {win.amount}
                </div>
              </div>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes slideIn {
            from {
              transform: translateX(-100px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </div>
  )
}
