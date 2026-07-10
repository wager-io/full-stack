import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import socketService from '../../services/socketService';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { format } from 'date-fns';
import { toast } from 'sonner';
import './MyBets.css';

const MyBets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Casino');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const betsPerPage = 10;

  const gameImages = {
    'Crash': '/assets/InhouseGames/crash-game.png',
    'Dice': '/assets/InhouseGames/diceGame.png',
    'Hilo': '/assets/InhouseGames/hiloGAMES.png',
    'Keno': '/assets/InhouseGames/keno.png',
    'Limbo': '/assets/InhouseGames/limboGame.png',
    'Mines': '/assets/InhouseGames/mine.png',
    'Plinko': '/assets/InhouseGames/plinko.png'
  };


  const fetchBets = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get('/api/bets', {
        params: {
          page,
          limit: pagination.limit
        }
      });

      console.log(response.data);
      // Map API response to match table requirements
      const mappedBets = (response.data.bets || []).map(bet => ({
        transaction_id: bet.betId,
        transaction_type: bet.gameType,
        game: bet.gameType,
        gameType: 'casino', // All derived from game history are casino
        country_img: '', // Not used?
        timestamp: bet.createdAt || bet.betTime,
        amount: bet.betAmount,
        multiplier: bet.multiplier,
        trx_amount: bet.payout, // Payout (Total Return)
        profit: bet.profit, // Net Profit
        currency: bet.currency || 'USDT',
        token_img: bet.currencyImage || '/assets/token/usdt.png'
      }));

      setBets(mappedBets);
      setPagination(response.data.pagination || {
        page,
        limit: 10,
        total: 0,
        totalPages: 0
      });
    } catch (error) {
      console.error('Error fetching bets:', error);
      toast.error('Failed to load bets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBets();

    const setupSocket = async () => {
      try {
        // Ensure socket is connected
        let socket = socketService.socket;
        if (!socket || !socketService.isConnected) {
          socket = await socketService.connect();
        }

        if (socket) {
          const handleNewBet = (bet) => {
            console.log('[MyBets] Received global-new-bet:', bet);

            // Only add bets for the current user
            const isMatch = user && (String(bet.user_id) === String(user._id));

            if (isMatch) {
              const newBet = {
                transaction_id: bet.betId || Date.now(),
                transaction_type: bet.game ? bet.game.charAt(0).toUpperCase() + bet.game.slice(1) : 'Game',
                game: bet.game,
                gameType: 'casino',
                timestamp: new Date().toISOString(),
                amount: parseFloat(bet.betAmount) || 0,
                multiplier: parseFloat(bet.multiplier) || 0,
                trx_amount: parseFloat(bet.payout) || 0, // Payout
                profit: parseFloat(bet.profit) || 0, // Profit
                currency: bet.currency || 'USDT',
                token_img: bet.token_img || bet.currencyImage || '/assets/token/usdt.png'
              };

              setBets(prevBets => [newBet, ...prevBets].slice(0, 10));
            }
          };

          socket.on('global-new-bet', handleNewBet);

          // Cleanup listener
          return () => {
            socket.off('global-new-bet', handleNewBet);
          };
        }
      } catch (error) {
        console.error("Socket setup failed in MyBets:", error);
      }
    };

    const cleanupPromise = setupSocket();

    return () => {
      cleanupPromise.then(cleanup => cleanup && cleanup());
    };
  }, [user]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      fetchBets(newPage);
    }
  };

  const filteredBets = bets.filter(bet => {
    // If no gameType is provided, assume it's a casino bet (shim)
    const type = bet.gameType || 'casino';
    return activeTab === 'Casino' ? type === 'casino' : type === 'sports';
  });

  const handlePreviousPage = () => {
    handlePageChange(pagination.page - 1);
  };

  const handleNextPage = () => {
    handlePageChange(pagination.page + 1);
  };

  const formatCurrency = (amount) => {
    return amount.toFixed(8);
  };

  const formatMultiplier = (multiplier) => {
    return `${multiplier.toFixed(2)}x`;
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="my-bets-container">
      <div className="my-bets-header">
        <h1 className="my-bets-title">My Bets</h1>
        <div className="my-bets-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
          </svg>
        </div>
      </div>

      <div className="my-bets-tabs">
        <button
          className={`tab-button ${activeTab === 'Casino' ? 'active' : ''}`}
          onClick={() => setActiveTab('Casino')}
        >
          Casino
        </button>
        <button
          className={`tab-button ${activeTab === 'Sports' ? 'active' : ''}`}
          onClick={() => setActiveTab('Sports')}
        >
          Sports
        </button>
      </div>

      <div className="my-bets-content">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-3 text-sm text-gray-300">Loading bets...</p>
          </div>
        ) : filteredBets.length > 0 ? (
          <div className="bets-table-container">
            <table className="bets-table">
              <thead>
                <tr>
                  <th>Game</th>
                  <th>Bet ID</th>
                  <th>Date</th>
                  <th>Bet Amount</th>
                  <th>Multiplier</th>
                  <th>Payout</th>
                </tr>
              </thead>
              <tbody>
                {filteredBets.map((bet, index) => (
                  <tr key={bet.transaction_id || index} className="bet-row">
                    <td className="game-cell">
                      <div className="game-info">
                        <div className="game-icon" style={{ backgroundColor: 'transparent', border: 'none', width: '30px', height: '30px' }}>
                          <img
                            src={gameImages[bet.game] || gameImages['Crash']}
                            alt={bet.game}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        </div>
                        <span className="game-name">{bet.transaction_type}</span>
                      </div>
                    </td>
                    <td className="bet-id-cell">
                      <span className="bet-id">{bet.transaction_id}</span>
                    </td>
                    <td className="date-cell">
                      <span className="bet-date">{formatDate(bet.timestamp)}</span>
                    </td>
                    <td className="amount-cell">
                      <span className="bet-amount">
                        {parseFloat(bet.amount).toFixed(4)}
                        <span className="currency-icon">{bet.currency}</span>
                      </span>
                    </td>
                    <td className="multiplier-cell">
                      <span className={`multiplier ${parseFloat(bet.multiplier) >= 1 ? 'profit-text' : ''}`}>
                        {bet.multiplier !== undefined ? formatMultiplier(parseFloat(bet.multiplier)) : '-'}
                      </span>
                    </td>
                    <td className="payout-cell">
                      <span className={`payout ${parseFloat(bet.profit) > 0 ? 'profit' : 'loss'}`}>
                        {parseFloat(bet.trx_amount).toFixed(4)}
                        <span className="currency-icon">{bet.currency || bet.token_name}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
            <p className="empty-title">No bets found</p>
            <p className="empty-subtitle">Start playing games to see your bet history here</p>
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="my-bets-pagination">
          <div className="pagination-info">
            <span>Showing {bets.length} of {pagination.total} bets | Page {pagination.page} of {pagination.totalPages}</span>
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={handlePreviousPage}
              disabled={pagination.page === 1}
            >
              Previous
            </button>
            <button
              className="pagination-btn"
              onClick={handleNextPage}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBets;
