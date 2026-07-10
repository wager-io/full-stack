import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSportContext } from '../sportContext'
import Navigators from './Navigators'
import Loader from '../../components/common/Loader'

export default function SportId() {
  const { sportId } = useParams()
  const { 
    leagues, 
    fetchLeaguesBySport 
  } = useSportContext()
  
  const [activeTab, setActiveTab] = useState('live-upcoming')
  const [openCards, setOpenCards] = useState({})

  useEffect(() => {
    if (sportId) {
      fetchLeaguesBySport(sportId.toLocaleUpperCase())
    }
  }, [sportId, fetchLeaguesBySport])

  console.log(leagues)

  // Toggle card open/closed state
  const toggleCard = (cardId) => {
    setOpenCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }))
  }

  return (
    <div className="min-h-screen bg-[#0f212e] p-4">
      {/* Tabs */}
      <div className="mb-6 border-b border-[#1a2c38]">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('live-upcoming')}
            className={`px-4 py-2 text-sm font-medium rounded-t-md ${
              activeTab === 'live-upcoming'
                ? 'bg-[#1a2c38] text-white'
                : 'text-gray-400 hover:text-white hover:bg-[#1a2c38]/50'
            }`}
          >
            Live & Upcoming
          </button>
          <button
            onClick={() => setActiveTab('outright')}
            className={`px-4 py-2 text-sm font-medium rounded-t-md ${
              activeTab === 'outright'
                ? 'bg-[#1a2c38] text-white'
                : 'text-gray-400 hover:text-white hover:bg-[#1a2c38]/50'
            }`}
          >
            Outright
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium rounded-t-md ${
              activeTab === 'all'
                ? 'bg-[#1a2c38] text-white'
                : 'text-gray-400 hover:text-white hover:bg-[#1a2c38]/50'
            }`}
          >
            All
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mb-6">Leagues</h2>
      
      {/* Leagues List - Using FAQ-style cards */}
      <div className="space-y-3">
        {leagues && leagues.length > 0 ? (
          leagues.map((league) => (
            <div className="w-full mb-3" key={league.leagueID}>
              <div 
                className="bg-[rgb(33,55,67)] rounded-lg p-4 shadow-md cursor-pointer transition-all duration-300 hover:bg-[rgb(38,62,76)]"
                onClick={() => toggleCard(league.leagueID)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-white font-medium">{league.name}</h3>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${openCards[league.leagueID] ? 'rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 9l-7 7-7-7" 
                    />
                  </svg>
                </div>
                
                {/* Expandable content */}
                {openCards[league.leagueID] && (
                  <div className="mt-3 text-gray-300 text-sm leading-relaxed">
                    <p className="mb-3">
                      League ID: {league.leagueID}
                    </p>
                    {league.country && (
                      <p className="mb-3">
                        Country: {league.country}
                      </p>
                    )}
                    {league.season && (
                      <p>
                        Season: {league.season}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[rgb(33,55,67)] rounded-lg p-6 text-center">
            <p className="text-gray-300">No leagues found for this sport.</p>
          </div>
        )}
      </div>
    </div>
  )
}