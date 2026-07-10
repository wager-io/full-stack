import React, { useContext, useEffect } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getUserVipProgress } from '../../services/vipService';

export default function VipCard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [vipData, setVipData] = React.useState({
    currentTier: 'None',
    nextTier: 'Bronze',
    progress: 0, // Initialize with 0 instead of undefined
    currentTierColor: '#2F4553',
    nextTierColor: '#C69C6D',
    totalWager: 0,
    nextTierRequirement: 10000
  });
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    // Fetch VIP progress when component mounts if user is logged in
    if (user) {
      fetchVipProgress();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchVipProgress = async () => {
    try {
      setIsLoading(true);
      const data = await getUserVipProgress();
      
      setVipData({
        currentTier: data.currentTier || 'None',
        nextTier: data.nextTier || 'Bronze',
        progress: typeof data.progress === 'number' ? data.progress : 0, // Ensure progress is a number
        currentTierColor: data.currentTierDetails?.color || '#2F4553',
        nextTierColor: data.nextTierDetails?.color || '#C69C6D',
        totalWager: data.totalWager || 0,
        nextTierRequirement: data.nextTierRequirement || 10000
      });
    } catch (error) {
      console.error('Error fetching VIP progress:', error);
      // Keep default values in state if there's an error
    } finally {
      setIsLoading(false);
    }
  };
  
  // Navigate to VIP Club page when clicking on progress
  const handleVipProgressClick = () => {
    navigate('/vip-club');
  };

  // Calculate remaining wager needed for next tier
  const remainingWager = vipData.nextTierRequirement - vipData.totalWager;
  
  // Safely format the progress percentage
  const formattedProgress = typeof vipData.progress === 'number' 
    ? vipData.progress.toFixed(2) 
    : '0.00';

  return (
    <div className="border-4 border-[#213743] rounded-[10px] shadow-lg p-4 h-[200px] max-w-[500px] md:min-w-[400px] flex flex-col justify-between bg-[#0f212e]">
      {/* Card Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">{user?.username || 'Guest'}</h3>
        <svg fill="none" viewBox="0 0 96 96" className="svg-icon" style={{width: "1.25rem", height: "1.25rem"}}> 
          <path fill={vipData.currentTierColor} d="m48 14.595 8.49 15.75a13.68 13.68 0 0 0 9.66 7.08L84 40.635l-12.39 12.9a13.9 13.9 0 0 0-3.9 9.63q-.069.96 0 1.92l2.46 17.76-15.66-7.56a15 15 0 0 0-6.51-1.53 15 15 0 0 0-6.6 1.5l-15.57 7.53 2.46-17.76q.051-.93 0-1.86a13.9 13.9 0 0 0-3.9-9.63L12 40.635l17.64-3.21a13.62 13.62 0 0 0 9.84-7.02zm0-12.54a5.22 5.22 0 0 0-4.59 2.73l-11.4 21.45a5.4 5.4 0 0 1-3.66 2.67l-24 4.32A5.25 5.25 0 0 0 0 38.385a5.13 5.13 0 0 0 1.44 3.6l16.83 17.55a5.16 5.16 0 0 1 1.47 3.6q.024.435 0 .87l-3.27 24a3 3 0 0 0 0 .72 5.19 5.19 0 0 0 5.19 5.22h.18a5.1 5.1 0 0 0 2.16-.6l21.39-10.32a6.4 6.4 0 0 1 2.76-.63 6.2 6.2 0 0 1 2.79.66l21 10.32c.69.377 1.464.573 2.25.57h.21a5.22 5.22 0 0 0 5.19-5.19q.024-.375 0-.75l-3.27-24q-.025-.375 0-.75a5 5 0 0 1 1.47-3.57l16.77-17.7a5.19 5.19 0 0 0-2.82-8.7l-24-4.32a5.22 5.22 0 0 1-3.69-2.76l-11.4-21.45a5.22 5.22 0 0 0-4.65-2.7"></path>
        </svg>
      </div>

      <div className='flex flex-col'>
        {/* VIP Progress */}
        <div className="flex justify-between items-center mt-4">
          <div 
            className="flex items-center cursor-pointer hover:px-2 transition-all duration-300 space-x-2"
            onClick={handleVipProgressClick}
          >
            <span className="text-[14px] text-white">Your VIP Progress</span>
            <FaArrowRight className="text-gray-500 fill-white" size={14} />
          </div>
          <span className="text-[14px] font-bold text-white">
            {isLoading ? 'Loading...' : `${formattedProgress}%`}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-[10px] bg-gray-600 rounded-[30px] mt-3 overflow-hidden">
          <div 
            className="h-full rounded-[30px] transition-all duration-500 ease-out"
            style={{ 
              width: `${isLoading ? 0 : vipData.progress}%`, 
              background: `linear-gradient(to right, ${vipData.currentTierColor}, ${vipData.nextTierColor})` 
            }}
          ></div>
        </div>

        {/* VIP Levels */}
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center space-x-2">
            <svg fill="none" viewBox="0 0 96 96" className="svg-icon" style={{width: "1.25rem", height: "1.25rem"}}> 
              <path fill={vipData.currentTierColor} d="m48 14.595 8.49 15.75a13.68 13.68 0 0 0 9.66 7.08L84 40.635l-12.39 12.9a13.9 13.9 0 0 0-3.9 9.63q-.069.96 0 1.92l2.46 17.76-15.66-7.56a15 15 0 0 0-6.51-1.53 15 15 0 0 0-6.6 1.5l-15.57 7.53 2.46-17.76q.051-.93 0-1.86a13.9 13.9 0 0 0-3.9-9.63L12 40.635l17.64-3.21a13.62 13.62 0 0 0 9.84-7.02zm0-12.54a5.22 5.22 0 0 0-4.59 2.73l-11.4 21.45a5.4 5.4 0 0 1-3.66 2.67l-24 4.32A5.25 5.25 0 0 0 0 38.385a5.13 5.13 0 0 0 1.44 3.6l16.83 17.55a5.16 5.16 0 0 1 1.47 3.6q.024.435 0 .87l-3.27 24a3 3 0 0 0 0 .72 5.19 5.19 0 0 0 5.19 5.22h.18a5.1 5.1 0 0 0 2.16-.6l21.39-10.32a6.4 6.4 0 0 1 2.76-.63a6.2 6.2 0 0 1 2.79.66l21 10.32c.69.377 1.464.573 2.25.57h.21a5.22 5.22 0 0 0 5.19-5.19q.024-.375 0-.75l-3.27-24q-.025-.375 0-.75a5 5 0 0 1 1.47-3.57l16.77-17.7a5.19 5.19 0 0 0-2.82-8.7l-24-4.32a5.22 5.22 0 0 1-3.69-2.76l-11.4-21.45a5.22 5.22 0 0 0-4.65-2.7"></path>
            </svg>
            <span className="text-sm text-gray-400">{vipData.currentTier}</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg fill="none" viewBox="0 0 96 96" className="svg-icon" style={{width: "1.25rem", height: "1.25rem"}}> 
              <path fill={vipData.nextTierColor} d="m48 14.595 8.49 15.75a13.68 13.68 0 0 0 9.66 7.08L84 40.635l-12.39 12.9a13.9 13.9 0 0 0-3.9 9.63q-.069.96 0 1.92l2.46 17.76-15.66-7.56a15 15 0 0 0-6.51-1.53a15 15 0 0 0-6.6 1.5l-15.57 7.53 2.46-17.76q.051-.93 0-1.86a13.9 13.9 0 0 0-3.9-9.63L12 40.635l17.64-3.21a13.62 13.62 0 0 0 9.84-7.02zm0-12.54a5.22 5.22 0 0 0-4.59 2.73l-11.4 21.45a5.4 5.4 0 0 1-3.66 2.67l-24 4.32A5.25 5.25 0 0 0 0 38.385a5.13 5.13 0 0 0 1.44 3.6l16.83 17.55a5.16 5.16 0 0 1 1.47 3.6q.024.435 0 .87l-3.27 24a3 3 0 0 0 0 .72 5.19 5.19 0 0 0 5.19 5.22h.18a5.1 5.1 0 0 0 2.16-.6l21.39-10.32a6.4 6.4 0 0 1 2.76-.63a6.2 6.2 0 0 1 2.79.66l21 10.32c.69.377 1.464.573 2.25.57h.21a5.22 5.22 0 0 0 5.19-5.19q.024-.375 0-.75l-3.27-24q-.025-.375 0-.75a5 5 0 0 1 1.47-3.57l16.77-17.7a5.19 5.19 0 0 0-2.82-8.7l-24-4.32a5.22 5.22 0 0 1-3.69-2.76l-11.4-21.45a5.22 5.22 0 0 0-4.65-2.7"></path>
            </svg>
            <span className="text-sm text-gray-400">{vipData.nextTier}</span>
          </div>
        </div>
        
        {/* Wager Information */}
        {user && (
          <div className="text-xs text-gray-400 mt-2 text-center">
            {isLoading ? 'Loading wager info...' : (
              remainingWager > 0 
                ? `$${remainingWager.toLocaleString()} more wagered to reach ${vipData.nextTier}`
                : `You've reached ${vipData.currentTier}! Keep playing to maintain your status.`
            )}
          </div>
        )}
      </div>
    </div>
  );
}
