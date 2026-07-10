import React, { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import api from '../../utils/api'
import { toast } from 'sonner'

export default function Campaigns() {
  const { user } = useContext(AuthContext)
  const [campaigns, setCampaigns] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get the base URL for generating affiliate links
  const baseUrl = window.location.origin

  // Fetch campaigns data from the backend
  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await api.get('/api/affiliate/campaigns')
        setCampaigns(response.data.campaigns)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching campaigns:', error)
        setError('Failed to load your campaigns. Please try again later.')
        setIsLoading(false)
        toast.error('Failed to load campaigns')
      }
    }

    fetchCampaigns()
  }, [user])

  // Handle input change for new campaign form
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewCampaign(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle form submission for creating a new campaign
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!newCampaign.name.trim()) {
      toast.error('Campaign name is required')
      return
    }
    
    try {
      setIsSubmitting(true)
      const response = await api.post('/api/affiliate/campaigns', newCampaign)
      
      // Add the new campaign to the list
      setCampaigns(prev => [response.data.campaign, ...prev])
      
      // Reset form and hide it
      setNewCampaign({ name: '', description: '' })
      setShowCreateForm(false)
      setIsSubmitting(false)
      
      toast.success('Campaign created successfully')
    } catch (error) {
      console.error('Error creating campaign:', error)
      toast.error(error.response?.data?.message || 'Failed to create campaign')
      setIsSubmitting(false)
    }
  }

  // Handle campaign deletion
  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) {
      return
    }
    
    try {
      await api.delete(`/api/affiliate/campaigns/${campaignId}`)
      
      // Remove the deleted campaign from the list
      setCampaigns(prev => prev.filter(campaign => campaign._id !== campaignId))
      
      toast.success('Campaign deleted successfully')
    } catch (error) {
      console.error('Error deleting campaign:', error)
      toast.error('Failed to delete campaign')
    }
  }

  // Copy affiliate link to clipboard
  const copyToClipboard = (code) => {
    const link = `${baseUrl}/?tab=register&modal=auth&ref=${user.username}&campaign=${code}`
    navigator.clipboard.writeText(link)
      .then(() => toast.success('Affiliate link copied to clipboard'))
      .catch(() => toast.error('Failed to copy link'))
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
        <h2 className="text-white font-bold text-xl mb-4">Your Campaigns</h2>
        
        <div className="mb-6">
          <p className="text-[rgb(177,186,211)] text-sm mb-4">
            Create and manage your referral campaigns to track performance across different marketing channels.
          </p>
          
          <button 
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : 'Create New Campaign'}
          </button>
        </div>
        
        {/* Create Campaign Form */}
        {showCreateForm && (
          <div className="bg-[#1a2c38] rounded-lg p-6 mb-6">
            <h3 className="text-white font-bold text-lg mb-4">Create New Campaign</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-[rgb(177,186,211)] text-sm mb-2">
                  Campaign Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newCampaign.name}
                  onChange={handleInputChange}
                  className="w-full bg-[#0f212e] text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Twitter Promotion"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-[rgb(177,186,211)] text-sm mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newCampaign.description}
                  onChange={handleInputChange}
                  className="w-full bg-[#0f212e] text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  placeholder="Describe your campaign..."
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Campaigns List */}
        {isLoading ? (
          <div className="bg-[#1a2c38] rounded-lg p-6 flex justify-center items-center">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : error ? (
          <div className="bg-red-900 bg-opacity-30 border border-red-800 text-red-300 px-4 py-3 rounded">
            {error}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-[#1a2c38] rounded-lg p-4">
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-[rgb(177,186,211)] text-sm">
                You haven't created any campaigns yet. Create your first campaign to start tracking your referrals.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map(campaign => (
              <div key={campaign._id} className="bg-[#1a2c38] rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-white font-bold text-lg">{campaign.name}</h3>
                    <p className="text-[rgb(177,186,211)] text-sm mt-1">
                      {campaign.description || 'No description provided'}
                    </p>
                    <div className="flex flex-wrap items-center mt-2 gap-4">
                      <span className="text-xs text-[rgb(177,186,211)]">
                        Created: {formatDate(campaign.createdAt)}
                      </span>
                      <span className="text-xs text-[rgb(177,186,211)]">
                        Code: <span className="text-blue-400 font-mono">{campaign.code}</span>
                      </span>
                      <span className="text-xs text-[rgb(177,186,211)]">
                        Referrals: <span className="text-white">{campaign.referralCount || 0}</span>
                      </span>
                      <span className="text-xs text-[rgb(177,186,211)]">
                        Earnings: <span className="text-green-400">{formatCurrency(campaign.totalCommission || 0)}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(campaign.code)}
                      className="bg-[#2f4553] text-white py-2 px-3 rounded hover:bg-[#3a5565] transition-colors text-sm flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Link
                    </button>
                    
                    <button
                      onClick={() => handleDeleteCampaign(campaign._id)}
                      className="bg-red-900 bg-opacity-30 text-red-300 py-2 px-3 rounded hover:bg-red-800 hover:bg-opacity-50 transition-colors text-sm flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="w-full bg-[#213743] rounded-[0.5rem] p-6 shadow-lg mt-6">
        <h2 className="text-white font-bold text-xl mb-4">Campaign Tips</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1a2c38] p-4 rounded-lg">
            <h3 className="text-white font-bold text-lg mb-2">Naming Your Campaigns</h3>
            <p className="text-[rgb(177,186,211)] text-sm">
              Use descriptive names that identify the marketing channel or audience. For example: "Twitter Followers", "YouTube Viewers", or "Email Newsletter".
            </p>
          </div>
          
          <div className="bg-[#1a2c38] p-4 rounded-lg">
            <h3 className="text-white font-bold text-lg mb-2">Track Performance</h3>
            <p className="text-[rgb(177,186,211)] text-sm">
              Compare campaign performance to identify which channels bring the most valuable referrals, allowing you to focus your marketing efforts.
            </p>
          </div>
          
          <div className="bg-[#1a2c38] p-4 rounded-lg">
            <h3 className="text-white font-bold text-lg mb-2">Using Your Links</h3>
            <p className="text-[rgb(177,186,211)] text-sm">
              Share your campaign links on social media, in emails, or on your website. Each link contains your username and campaign code to track referrals.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}