import React, { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import api from '../../utils/api'
import { toast } from 'sonner'

export default function ReferredUsers() {
  const { user } = useContext(AuthContext)
  const [referrals, setReferrals] = useState([])
  const [referralCount, setReferralCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredReferrals, setFilteredReferrals] = useState([])

  // Fetch referrals data from the backend
  useEffect(() => {
    const fetchReferrals = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await api.get('/api/affiliate/referrals')
        
        setReferrals(response.data.referrals)
        setReferralCount(response.data.referralCount)
        setFilteredReferrals(response.data.referrals)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching referrals:', error)
        setError('Failed to load your referred users. Please try again later.')
        setIsLoading(false)
        toast.error('Failed to load referred users')
      }
    }

    fetchReferrals()
  }, [user])

  // Handle search functionality
  const handleSearch = (e) => {
    e.preventDefault()
    
    if (!searchTerm.trim()) {
      setFilteredReferrals(referrals)
      return
    }
    
    const filtered = referrals.filter(referral => 
      referral.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    setFilteredReferrals(filtered)
  }

  // Format date to a readable string
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="flex-1">
      <div className="w-full bg-[#213743] rounded-[0.5rem] p-6 shadow-lg">
        <h2 className="text-white font-bold text-xl mb-4">Your Referred Users</h2>
        
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-[rgb(177,186,211)] text-sm">
              Track the users you've referred and their activity.
            </p>
            
            <form onSubmit={handleSearch} className="flex items-center">
              <input 
                type="text" 
                placeholder="Search users..." 
                className="bg-[#1a2c38] text-white px-4 py-2 rounded-l focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded-r hover:bg-blue-600"
              >
                Search
              </button>
            </form>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[#1a2c38] rounded-lg">
            <thead>
              <tr>
                <th className="py-3 px-4 text-left text-[rgb(177,186,211)] text-sm font-medium">Username</th>
                <th className="py-3 px-4 text-left text-[rgb(177,186,211)] text-sm font-medium">Email</th>
                <th className="py-3 px-4 text-left text-[rgb(177,186,211)] text-sm font-medium">Joined Date</th>
                <th className="py-3 px-4 text-left text-[rgb(177,186,211)] text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="py-8 px-4 text-center text-[rgb(177,186,211)] text-sm" colSpan="4">
                    <div className="flex justify-center items-center">
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td className="py-8 px-4 text-center text-red-400 text-sm" colSpan="4">
                    {error}
                  </td>
                </tr>
              ) : filteredReferrals.length === 0 ? (
                <tr>
                  <td className="py-8 px-4 text-center text-[rgb(177,186,211)] text-sm" colSpan="4">
                    No referred users found
                  </td>
                </tr>
              ) : (
                filteredReferrals.map((referral) => (
                  <tr key={referral._id} className="border-t border-[#2a3b47] hover:bg-[#1d3241]">
                    <td className="py-4 px-4 text-white">{referral.username}</td>
                    <td className="py-4 px-4 text-[rgb(177,186,211)]">{referral.email}</td>
                    <td className="py-4 px-4 text-[rgb(177,186,211)]">{formatDate(referral.createdAt)}</td>
                    <td className="py-4 px-4">
                      {referral.is_verified ? (
                        <span className="bg-green-900 bg-opacity-30 text-green-400 text-xs px-2 py-1 rounded-full">
                          Verified
                        </span>
                      ) : (
                        <span className="bg-yellow-900 bg-opacity-30 text-yellow-400 text-xs px-2 py-1 rounded-full">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="w-full bg-[#213743] rounded-[0.5rem] p-6 shadow-lg mt-6">
        <h2 className="text-white font-bold text-xl mb-4">Referral Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1a2c38] p-4 rounded-lg">
            <span className="text-[rgb(177,186,211)] text-sm">Total Referred</span>
            <h3 className="text-white font-bold text-2xl mt-1">{referralCount}</h3>
          </div>
          
          <div className="bg-[#1a2c38] p-4 rounded-lg">
            <span className="text-[rgb(177,186,211)] text-sm">Active Users</span>
            <h3 className="text-white font-bold text-2xl mt-1">
              {filteredReferrals.filter(user => user.is_verified).length}
            </h3>
          </div>
          
          <div className="bg-[#1a2c38] p-4 rounded-lg">
            <span className="text-[rgb(177,186,211)] text-sm">Conversion Rate</span>
            <h3 className="text-white font-bold text-2xl mt-1">
              {referralCount > 0 
                ? `${Math.round((filteredReferrals.filter(user => user.is_verified).length / referralCount) * 100)}%` 
                : '0%'}
            </h3>
          </div>
        </div>
      </div>
    </div>
  )
}