import React, { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import api from '../../utils/api'
import { toast } from 'sonner'

export default function Commission() {
  const { user } = useContext(AuthContext)
  const [commissionData, setCommissionData] = useState({
    totalEarned: 0,
    availableToWithdraw: 0,
    commissionRate: 10,
    commissions: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  // Fetch commission data from the backend
  useEffect(() => {
    const fetchCommissionData = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await api.get('/api/affiliate/commission')
        setCommissionData(response.data)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching commission data:', error)
        setError('Failed to load your commission data. Please try again later.')
        setIsLoading(false)
        toast.error('Failed to load commission data')
      }
    }

    fetchCommissionData()
  }, [user])

  // Handle commission withdrawal
  const handleWithdraw = async () => {
    if (commissionData.availableToWithdraw < 10) {
      toast.error('Minimum withdrawal amount is $10.00')
      return
    }

    try {
      setIsWithdrawing(true)
      const response = await api.post('/api/affiliate/withdraw-commission')
      
      // Update local state to reflect the withdrawal
      setCommissionData(prev => ({
        ...prev,
        availableToWithdraw: 0,
        commissions: prev.commissions.map(commission => 
          commission.status === 'pending' 
            ? { ...commission, status: 'paid' } 
            : commission
        )
      }))
      
      toast.success(`Successfully withdrew $${response.data.amount.toFixed(2)}`)
      setIsWithdrawing(false)
    } catch (error) {
      console.error('Error withdrawing commission:', error)
      toast.error(error.response?.data?.message || 'Failed to withdraw commission')
      setIsWithdrawing(false)
    }
  }

  // Format date to a readable string
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Format currency
  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`
  }

  return (
    <div className="flex-1">
      <div className="w-full bg-[#213743] rounded-[0.5rem] p-6 shadow-lg">
        <h2 className="text-white font-bold text-xl mb-4">Commission Overview</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : error ? (
          <div className="bg-red-900 bg-opacity-30 border border-red-800 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#1a2c38] p-4 rounded-lg">
                <span className="text-[rgb(177,186,211)] text-sm">Total Earned</span>
                <h3 className="text-white font-bold text-2xl mt-1">
                  {formatCurrency(commissionData.totalEarned)}
                </h3>
              </div>
              
              <div className="bg-[#1a2c38] p-4 rounded-lg">
                <span className="text-[rgb(177,186,211)] text-sm">Available to Withdraw</span>
                <h3 className="text-white font-bold text-2xl mt-1">
                  {formatCurrency(commissionData.availableToWithdraw)}
                </h3>
              </div>
              
              <div className="bg-[#1a2c38] p-4 rounded-lg">
                <span className="text-[rgb(177,186,211)] text-sm">Commission Rate</span>
                <h3 className="text-white font-bold text-2xl mt-1">
                  {commissionData.commissionRate}%
                </h3>
              </div>
            </div>
            
            <div className="bg-[#1a2c38] p-4 rounded-lg mb-6">
              <h3 className="text-white font-bold text-lg mb-3">Withdraw Commission</h3>
              <p className="text-[rgb(177,186,211)] text-sm mb-4">
                You can withdraw your commission to your wallet at any time.
              </p>
              <button 
                className={`${
                  commissionData.availableToWithdraw >= 10 && !isWithdrawing
                    ? 'bg-blue-600 hover:bg-blue-500 cursor-pointer'
                    : 'bg-[#2f4553] opacity-50 cursor-not-allowed'
                } text-white py-2 px-4 rounded shadow-lg transition-colors`}
                disabled={commissionData.availableToWithdraw < 10 || isWithdrawing}
                onClick={handleWithdraw}
              >
                {isWithdrawing ? 'Processing...' : 'Withdraw Commission'}
              </button>
              <p className="text-[rgb(177,186,211)] text-xs mt-2">
                *Minimum withdrawal amount: $10.00
              </p>
            </div>
          </>
        )}
      </div>
      
      <div className="w-full bg-[#213743] rounded-[0.5rem] p-6 shadow-lg mt-6">
        <h2 className="text-white font-bold text-xl mb-4">Commission History</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[#1a2c38] rounded-lg">
            <thead>
              <tr>
                <th className="py-3 px-4 text-left text-[rgb(177,186,211)] text-sm font-medium">Date</th>
                <th className="py-3 px-4 text-left text-[rgb(177,186,211)] text-sm font-medium">User</th>
                <th className="py-3 px-4 text-left text-[rgb(177,186,211)] text-sm font-medium">Game</th>
                <th className="py-3 px-4 text-left text-[rgb(177,186,211)] text-sm font-medium">Wager</th>
                <th className="py-3 px-4 text-left text-[rgb(177,186,211)] text-sm font-medium">Commission</th>
                <th className="py-3 px-4 text-left text-[rgb(177,186,211)] text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="py-8 px-4 text-center text-[rgb(177,186,211)] text-sm" colSpan="6">
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
                  <td className="py-8 px-4 text-center text-red-400 text-sm" colSpan="6">
                    {error}
                  </td>
                </tr>
              ) : commissionData.commissions.length === 0 ? (
                <tr>
                  <td className="py-8 px-4 text-center text-[rgb(177,186,211)] text-sm" colSpan="6">
                    No commission history found
                  </td>
                </tr>
              ) : (
                commissionData.commissions.map((commission, index) => (
                  <tr key={index}>
                    <td className="py-3 px-4 text-left text-[rgb(177,186,211)] text-sm">
                      {formatDate(commission.date)}
                    </td>
                    <td className="py-3 px-4 text-left text-[rgb(177,186,211)] text-sm">
                      {commission.user}
                    </td>
                    <td className="py-3 px-4 text-left text-[rgb(177,186,211)] text-sm">
                      {commission.game}
                    </td>
                    <td className="py-3 px-4 text-left text-[rgb(177,186,211)] text-sm">
                      {formatCurrency(commission.wager)}
                    </td>
                    <td className="py-3 px-4 text-left text-[rgb(177,186,211)] text-sm">
                      {formatCurrency(commission.commission)}
                    </td>
                    <td className="py-3 px-4 text-left text-[rgb(177,186,211)] text-sm">
                      {commission.status}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}