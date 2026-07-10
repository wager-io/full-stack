import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FiHeart, FiUser, FiLock, FiPlay, FiStar, FiUsers } from 'react-icons/fi';
import 'swiper/css';
import GameCard from '../../pages/sections/GameCard';
import UsersBetLayout from '../../pages/sections/BetsLogSection';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import socketService from '../../services/socketService';

export default function Recents() {
  const navigate = useNavigate();
  const swiperRef = useRef(null);
  const { user } = useAuth();

  const [recentGames, setRecentGames] = useState([]);
  const [loading, setLoading] = useState(false);

  const gameImages = {
    'crash': '/assets/InhouseGames/crash-game.png',
    'dice': '/assets/InhouseGames/diceGame.png',
    'hilo': '/assets/InhouseGames/hiloGAMES.png',
    'keno': '/assets/InhouseGames/keno.png',
    'limbo': '/assets/InhouseGames/limboGame.png',
    'mines': '/assets/InhouseGames/mine.png',
    'plinko': '/assets/InhouseGames/plinko.png',
    // Fallbacks/TitleCase
    'Crash': '/assets/InhouseGames/crash-game.png',
    'Dice': '/assets/InhouseGames/diceGame.png',
    'Hilo': '/assets/InhouseGames/hiloGAMES.png',
    'Keno': '/assets/InhouseGames/keno.png',
    'Limbo': '/assets/InhouseGames/limboGame.png',
    'Mines': '/assets/InhouseGames/mine.png',
    'Plinko': '/assets/InhouseGames/plinko.png'
  };

  useEffect(() => {
    if (user) {
      fetchRecentGames();
    }
  }, [user]);

  const fetchRecentGames = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/transactions/bills', {
        params: { limit: 20 }
      });

      if (response.data && response.data.bills) {
        // Filter unique games from history
        const uniqueGames = [];
        const seenGames = new Set();

        // Process bills to find unique games played
        response.data.bills.forEach(bill => {
          const gameName = bill.game || bill.transaction_type;
          // specific normalization if needed
          const normalizedName = gameName.toLowerCase();

          if (!seenGames.has(normalizedName) && gameImages[normalizedName]) {
            seenGames.add(normalizedName);
            uniqueGames.push({
              id: bill.transaction_id || Date.now(),
              title: gameName.charAt(0).toUpperCase() + gameName.slice(1), // Title Case
              image: gameImages[normalizedName] || gameImages['Plinko'], // Fallback
              path: normalizedName
            });
          }
        });
        setRecentGames(uniqueGames);
      }
    } catch (error) {
      console.error("Failed to fetch recent games", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const setupSocket = async () => {
      try {
        let socket = socketService.socket;
        if (!socket || !socketService.isConnected) {
          socket = await socketService.connect();
        }

        if (socket) {
          const handleNewBet = (bet) => {
            // Check if bet belongs to specific user or global (Recent usually implies user's recent)
            // The file name is 'Recent.jsx' but the header says "My Recent". So it's USER specific.
            if (user && (bet.user_id === user._id || bet.user_id === String(user._id))) {
              const gameName = bet.game || bet.transaction_type;
              const normalizedName = gameName.replace(/\s+(Bet|Win|Game)/gi, '').trim().toLowerCase();

              if (gameImages[normalizedName]) {
                setRecentGames(prevGames => {
                  // Remove existing if present to move to top, or just check existence
                  const filtered = prevGames.filter(g => g.path !== normalizedName);
                  const newGame = {
                    id: bet.betId || Date.now(),
                    title: gameName.charAt(0).toUpperCase() + gameName.slice(1),
                    image: gameImages[normalizedName],
                    path: normalizedName
                  };
                  return [newGame, ...filtered].slice(0, 20);
                });
              }
            }
          };

          socket.on('global-new-bet', handleNewBet);
          return () => {
            socket.off('global-new-bet', handleNewBet);
          };
        }
      } catch (error) {
        console.error("Socket setup failed in Recents:", error);
      }
    };

    if (user) {
      setupSocket();
    }
  }, [user]);

  const handlePrev = () => {
    if (swiperRef.current) {
      const visibleSlides = swiperRef.current.params.slidesPerView;
      swiperRef.current.slideTo(swiperRef.current.activeIndex - visibleSlides);
    }
  };

  const handleNext = () => {
    if (swiperRef.current) {
      const visibleSlides = swiperRef.current.params.slidesPerView;
      swiperRef.current.slideTo(swiperRef.current.activeIndex + visibleSlides);
    }
  };

  const handleGameClick = (gamePath) => {
    navigate(`/casino/game/${gamePath}`);
  };

  const handleLoginClick = () => {
    navigate('/?modal=auth&tab=login');
  };

  // Favourites content component
  const FavouritesContent = () => (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
              style={{ backgroundColor: 'var(--blue-600)' }}
            >
              <FiHeart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1
                className="text-2xl md:text-3xl font-bold"
                style={{ color: 'var(--grey-200)' }}
              >
                My Recent
              </h1>

              <p
                className="text-sm mt-1"
                style={{ color: 'var(--grey-300)' }}
              >
                {user ? recentGames.length : 0} Recent games
              </p>
            </div>
          </div>

          {recentGames.length > 0 && user && (
            <div className="flex border rounded-[30px] px-2 border-[var(--grey-500)] overflow-hidden">
              <button
                onClick={handlePrev}
                className="flex items-center justify-center cursor-pointer rounded-[30px] p-2 text-[var(--grey-300)] hover:text-[var(--blue-400)] transition-colors"
                disabled={!swiperRef.current}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-px bg-[var(--grey-500)]"></div>
              <button
                onClick={handleNext}
                className="flex items-center justify-center rounded-[30px] cursor-pointer p-2 text-[var(--grey-300)] hover:text-[var(--blue-400)] transition-colors"
                disabled={!swiperRef.current}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {user ? (
          recentGames.length > 0 ? (
            <div className="w-full h-[240px] mb-6">
              <Swiper
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                }}
                spaceBetween={16}
                slidesPerView={5}
                slidesPerGroup={5}
                breakpoints={{
                  320: {
                    slidesPerView: 2,
                    slidesPerGroup: 2,
                    spaceBetween: 10,
                  },
                  640: {
                    slidesPerView: 3,
                    slidesPerGroup: 3,
                    spaceBetween: 12,
                  },
                  768: {
                    slidesPerView: 4,
                    slidesPerGroup: 4,
                    spaceBetween: 14,
                  },
                  1024: {
                    slidesPerView: 5,
                    slidesPerGroup: 5,
                    spaceBetween: 16,
                  },
                }}
                className="h-full"
              >
                {recentGames.map((game, index) => (
                  <SwiperSlide key={index} className="!w-auto">
                    <div
                      className="h-full flex flex-col items-center justify-center transform transition-transform duration-400 hover:-translate-y-2 cursor-pointer"
                      onClick={() => handleGameClick(game.path)}
                    >
                      <div>
                        <div className='rounded-[12px]'
                          style={{
                            backgroundColor: 'var(--grey-600)',
                            border: '1px solid var(--grey-500)',
                          }} >
                          <img
                            src={game.image}
                            alt={game.title}
                            className="w-[150px] h-[200px] object-cover rounded-[12px]"
                          />
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--grey-200)' }}>
                No recent games played yet.
              </h3>
              <p className="text-gray-400 mb-6">Start playing to see your history here!</p>
              <button
                onClick={() => navigate('/casino/home')}
                className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: 'var(--blue-600)' }}
              >
                Explore Games
              </button>
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <h3
              className="text-lg font-bold mb-4"
              style={{ color: 'var(--grey-200)' }}
            >
              Log in to access your Recent Games
            </h3>

            <button
              onClick={handleLoginClick}
              className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: 'var(--blue-600)' }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--blue-500)'
                e.target.style.boxShadow = '0 4px 16px rgba(20, 117, 225, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'var(--blue-600)'
                e.target.style.boxShadow = 'none'
              }}
            >
              <FiUser className="inline w-4 h-4 mr-2" />
              Log In
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      className="min-h-[calc(100vh-4rem)] py-8 px-5"
      style={{ backgroundColor: 'var(--grey-800)' }}
    >
      <GameCard />
      <FavouritesContent />
      <UsersBetLayout />
    </div>
  );
}
