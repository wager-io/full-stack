import React, { useEffect, useState } from 'react'
import { FiChevronUp, FiChevronDown, FiZap, FiEyeOff, FiHexagon, FiTarget } from 'react-icons/fi'
import api from "../../../utils/api"
import { useAuth } from '../../../context/AuthContext'
import { format } from 'date-fns'

export default function MyBets() {
  const { user } = useAuth()
  const [betsData, setBets] = useState([])
  const [loading, setLoading] = useState(false);

  const gameImages = {
    'Crash': '/assets/InhouseGames/crash-game.png',
    'Dice': '/assets/InhouseGames/diceGame.png',
    'Hilo': '/assets/InhouseGames/hiloGAMES.png',
    'Keno': '/assets/InhouseGames/keno.png',
    'Limbo': '/assets/InhouseGames/limboGame.png',
    'Mines': '/assets/InhouseGames/mine.png',
    'Plinko': '/assets/InhouseGames/plinko.png'
  };

  const fetchBets = async () => {
    try {
      setLoading(true);
      // Use the same endpoint as the dedicated page for consistency
      const response = await api.get('/api/bets', {
        params: {
          page: 1,
          limit: 10 // Show last 10 on home page
        }
      });

      console.log('MyBets Tab Data:', response.data);

      const mappedBets = (response.data.bets || []).map(bet => ({
        transaction_id: bet.betId,
        transaction_type: bet.gameType,
        game: bet.gameType, // Logic to match reference
        gameType: 'casino',
        timestamp: bet.createdAt || bet.betTime,
        amount: bet.betAmount,
        multiplier: bet.multiplier,
        trx_amount: bet.payout, // Payout
        profit: bet.profit,
        currency: bet.currency || 'USDT',
        token_img: bet.currencyImage || '/assets/token/usdt.png'
      }));
      setBets(mappedBets)
    }
    catch (err) {
      console.log(err)
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      fetchBets()
    }
  }, [user])

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatMultiplier = (multiplier) => {
    if (!multiplier && multiplier !== 0) return '-';
    return `${parseFloat(multiplier).toFixed(2)}x`;
  };

  return (
    <div className="p-0 sm:p-0">
      {/* Table Container */}
      <div
        className="rounded-xl border overflow-hidden shadow-lg"
        style={{
          backgroundColor: 'var(--grey-700)',
          borderColor: 'var(--grey-600)'
        }}
      >
        {/* Table Header matching Dedicated Page Fields */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 p-3 border-b font-semibold text-xs md:text-sm"
          style={{
            backgroundColor: 'var(--grey-600)',
            borderBottomColor: 'var(--grey-500)',
            color: 'var(--grey-200)'
          }}
        >
          <div className="col-span-1">Game</div>
          <div className="hidden sm:block text-center">Bet ID</div>
          <div className="hidden md:block text-center">Date</div>
          <div className="hidden lg:block text-center">Amount</div>
          <div className="hidden md:block text-center">Multiplier</div>
          <div className="col-span-1 text-right sm:text-end pr-1">Payout</div>
        </div>

        {/* Table Body */}
        <div className="" >
          {loading && (
            <div className="text-center py-4 text-sm" style={{ color: 'var(--grey-400)' }}>Loading...</div>
          )}

          {!loading && betsData.map((bet, index) => {
            const isCardRow = index % 2 === 0

            return (
              <div
                key={index}
                className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 p-3 transition-all duration-200 ${isCardRow ? 'rounded-lg mx-1 my-1 border' : 'mx-1 my-1'
                  }`}
                style={{
                  backgroundColor: isCardRow ? 'var(--grey-600)' : 'transparent',
                  borderColor: isCardRow ? 'var(--grey-500)' : ""
                }}
                onMouseEnter={(e) => {
                  if (isCardRow) {
                    e.currentTarget.style.backgroundColor = 'var(--grey-500)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(20, 117, 225, 0.3)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (isCardRow) {
                    e.currentTarget.style.backgroundColor = 'var(--grey-600)'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              >
                {/* Game Column */}
                <div className="flex items-center gap-2 col-span-1 overflow-hidden">
                  <div style={{ width: '20px', height: '20px', flexShrink: 0 }}>
                    <img
                      src={gameImages[bet.game] || gameImages['Crash']}
                      alt={bet.game}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span
                    className="text-xs md:text-sm font-semibold truncate"
                    style={{ color: 'var(--grey-200)' }}
                  >
                    {bet.transaction_type}
                  </span>
                </div>

                {/* Bet ID Column */}
                <div className="hidden sm:flex items-center justify-center overflow-hidden">
                  <span className="text-xs truncate" style={{ color: 'var(--grey-300)' }}>
                    {bet.transaction_id}
                  </span>
                </div>

                {/* Date Column (New) */}
                <div className="hidden md:flex items-center justify-center">
                  <span className="text-xs" style={{ color: 'var(--grey-300)' }}>
                    {formatDate(bet.timestamp)}
                  </span>
                </div>

                {/* Bet Amount Column */}
                <div className="hidden lg:flex items-center justify-center">
                  <span
                    className="text-xs md:text-sm font-bold"
                    style={{ color: 'var(--grey-300)' }}
                  >
                    {parseFloat(bet.amount).toFixed(4)} <span className="text-[10px]">{bet.currency}</span>
                  </span>
                </div>

                {/* Multiplier Column */}
                <div className="hidden md:flex items-center justify-center text-center">
                  <span
                    className="text-xs md:text-sm font-bold"
                    style={{ color: parseFloat(bet.multiplier) >= 1 ? 'var(--text-light)' : 'var(--grey-400)' }}
                  >
                    {formatMultiplier(bet.multiplier)}
                  </span>
                </div>

                {/* Payout Column */}
                <div className="flex items-center justify-end gap-1 col-span-1">
                  <span
                    className="text-xs md:text-sm font-bold"
                    style={{ color: parseFloat(bet.profit) > 0 ? 'var(--green-500)' : 'var(--grey-300)' }}
                  >
                    {parseFloat(bet.trx_amount).toFixed(4)} <span className="text-[10px]">{bet.currency}</span>
                  </span>

                </div>
              </div>
            )
          })}

          {!loading && betsData.length === 0 && (
            <div className="text-center py-6 text-sm" style={{ color: 'var(--grey-400)' }}>
              No bets found
            </div>
          )}
        </div>

        {/* Mobile Info */}
        <div className="sm:hidden p-2 text-center border-t" style={{ borderTopColor: 'var(--grey-500)' }}>
          <p className="text-[10px]" style={{ color: 'var(--grey-400)' }}>
            Tap for details
          </p>
        </div>
      </div>
    </div>
  )
}
