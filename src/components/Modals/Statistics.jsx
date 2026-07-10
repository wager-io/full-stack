import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { format } from 'date-fns'
import { FaUser, FaCalendarAlt, FaTrophy, FaDice, FaChartLine, FaMoneyBillWave, FaArrowUp, FaArrowDown, FaTimes } from 'react-icons/fa'
import Loader from '../common/Loader'

export default function Statistics({isOpen}) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get username from URL query parameter
        const searchParams = new URLSearchParams(location.search)
        const username = searchParams.get('name')
        
        if (!username) {
          setError('No username provided')
          setLoading(false)
          return
        }
        
        const response = await api.get(`/api/user/stats/${username}`)
        if (response.data.success) {
          setStats(response.data.data)
        } else {
          setError(response.data.message || 'Failed to fetch user statistics')
        }
      } catch (err) {
        console.error('Error fetching user statistics:', err)
        setError(err.response?.data?.message || 'An error occurred while fetching user statistics')
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserStats()
  }, [location.search])

  // Close the modal by navigating back
  const handleClose = () => {
    navigate(-1)
  }

  // Stop propagation to prevent closing when clicking on the content
  const handleContentClick = (e) => {
    e.stopPropagation()
  }

      useEffect(() => {
      if (isOpen) {
        // Save the current scroll position
        const scrollY = window.scrollY;
        
        // Add styles to body to prevent scrolling
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        document.body.style.overflowY = 'scroll';
      }
      
      // Cleanup function to restore scrolling when component unmounts or modal closes
      return () => {
        if (isOpen) {
          // Get the scroll position from body top property
          const scrollY = document.body.style.top;
          
          // Remove the fixed position styles
          document.body.style.position = '';
          document.body.style.top = '';
          document.body.style.width = '';
          document.body.style.overflowY = '';
          
          // Restore the scroll position
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
      };
    }, [isOpen]);

   if (!isOpen) return null;

  return (
    // Backdrop with 50% transparency
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 bg-[#000000ab] bg-opacity-50 p-4"
      onClick={handleClose}
    >
      {/* Modal Content */}
      <div 
        className="relative w-full max-w-1/2 max-h-[90vh] overflow-hidden flex flex-col rounded-xl"
        onClick={handleContentClick}
      >
        {loading ? (
          <div className="flex justify-center items-center h-96 bg-gray-900 rounded-xl">
            <Loader size="lg" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-96 text-center p-6 bg-gray-900 rounded-xl">
            <div className="text-red-500 text-5xl mb-4">
              <FaUser />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">User Not Found</h2>
            <p className="text-gray-400">{error}</p>
          </div>
        ) : stats && (
          <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">
            {/* Fixed Header */}
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-6 relative">
              <div className="flex items-center">
                <div className="bg-gray-800 rounded-full p-3 mr-4">
                  <FaUser className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{stats.username}</h1>
                  <div className="flex items-center text-blue-200 text-sm">
                    <FaCalendarAlt className="mr-1" />
                    <span>Joined {format(new Date(stats.joinedDate), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
              
              {/* Close Button */}
              <button 
                className="absolute top-4 right-4 text-white bg-gray-800 bg-opacity-70 rounded-full p-2 hover:bg-opacity-100 transition-all"
                onClick={handleClose}
              >
                <FaTimes />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {/* VIP Level with Progress */}
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <FaTrophy className="text-yellow-500 mr-2" />
                    <h2 className="text-lg font-semibold text-white">VIP Level</h2>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Current Level</span>
                      <span className="text-white font-bold text-xl">{stats.vipLevel || 0}</span>
                    </div>
                    
                    {/* VIP Progress Bar */}
                    <div className="mb-1">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress to Level {Math.min(10, (stats.vipLevel || 0) + 1)}</span>
                        <span>{stats.vipProgress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-yellow-500 h-2.5 rounded-full" 
                          style={{ width: `${stats.vipProgress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* VIP Points */}
                    <div className="text-xs text-gray-400 mt-2">
                      <span>Total VIP Points: {stats.vipPoints?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Betting Stats */}
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <FaDice className="text-blue-500 mr-2" />
                    <h2 className="text-lg font-semibold text-white">Betting Statistics</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatCard 
                      title="Total Bets" 
                      value={stats.totalBets.toLocaleString()} 
                      icon={<FaDice className="text-blue-500" />} 
                    />
                    <StatCard 
                      title="Total Wins" 
                      value={stats.totalWins.toLocaleString()} 
                      icon={<FaArrowUp className="text-green-500" />} 
                    />
                    <StatCard 
                      title="Total Losses" 
                      value={stats.totalLosses.toLocaleString()} 
                      icon={<FaArrowDown className="text-red-500" />} 
                    />
                    <StatCard 
                      title="Total Wagered" 
                      value={`${stats.wagered.toLocaleString()}`} 
                      icon={<FaMoneyBillWave className="text-yellow-500" />} 
                    />
                  </div>
                  <div className="mt-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">Win Rate</span>
                        <span className="text-white font-bold">{stats.winRate}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-green-500 h-2.5 rounded-full" 
                          style={{ width: `${Math.min(stats.winRate, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Stats */}
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <FaMoneyBillWave className="text-green-500 mr-2" />
                    <h2 className="text-lg font-semibold text-white">Financial Overview</h2>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Profit/Loss</p>
                        <p className={`text-xl font-bold ${stats.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {stats.profitLoss >= 0 ? '+' : '-'}${Math.abs(stats.profitLoss).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-2xl">
                        {stats.profitLoss >= 0 ? <FaArrowUp className="text-green-500" /> : <FaArrowDown className="text-red-500" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Game Breakdown */}
                <div>
                  <div className="flex items-center mb-2">
                    <FaChartLine className="text-purple-500 mr-2" />
                    <h2 className="text-lg font-semibold text-white">Game Breakdown</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                      <thead className="text-xs uppercase bg-gray-800 text-gray-400">
                        <tr>
                          <th scope="col" className="px-6 py-3 rounded-tl-lg">Game</th>
                          <th scope="col" className="px-6 py-3">Bets</th>
                          <th scope="col" className="px-6 py-3">Wins</th>
                          <th scope="col" className="px-6 py-3">Losses</th>
                          <th scope="col" className="px-6 py-3">Wagered</th>
                          <th scope="col" className="px-6 py-3 rounded-tr-lg">Profit/Loss</th>
                        </tr>
                      </thead>
                      <tbody>
                        <GameRow 
                          game="Crash" 
                          data={stats.gameBreakdown.crash} 
                        />
                         <GameRow 
                          game="Dice" 
                          data={stats.gameBreakdown.dice} 
                        />
                        <GameRow 
                          game="Plinko" 
                          data={stats.gameBreakdown.plinko} 
                        />
                         <GameRow 
                          game="Mines" 
                          data={stats.gameBreakdown.mines} 
                        />
                        <GameRow 
                          game="Hilo" 
                          data={stats.gameBreakdown.hilo} 
                        />
                          <GameRow 
                          game="Limbo" 
                          data={stats.gameBreakdown.limbo} 
                        />
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Stat Card Component
const StatCard = ({ title, value, icon, valueClassName = "text-white", prefix = "" }) => (
  <div className="bg-gray-800 rounded-lg p-4">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <p className={`text-xl font-bold ${valueClassName}`}>{prefix}{value}</p>
      </div>
      <div className="text-xl">
        {icon}
      </div>
    </div>
  </div>
)

// Game Row Component
const GameRow = ({ game, data }) => {
  const profitLossColor = data.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'
  
  return (
    <tr className="border-b border-gray-800">
      <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
        {game}
      </th>
      <td className="px-6 py-4">{data.bets.toLocaleString()}</td>
      <td className="px-6 py-4">{data.wins.toLocaleString()}</td>
      <td className="px-6 py-4">{data.losses.toLocaleString()}</td>
      <td className="px-6 py-4">${data.wagered.toLocaleString()}</td>
      <td className={`px-6 py-4 ${profitLossColor}`}>
        {data.profitLoss >= 0 ? '+' : '-'}${Math.abs(data.profitLoss).toLocaleString()}
      </td>
    </tr>
  )
}
