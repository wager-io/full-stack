import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import VipCard from './landingPageComponent/VipCard';
import { getAllVipTiers } from '../services/vipService';
import { FaGift, FaHeadset, FaCalendarCheck } from 'react-icons/fa';
import { GiReceiveMoney } from 'react-icons/gi';


function VipClubPage() {
  const { user, userVipTier } = useContext(AuthContext);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLanguage, setSelectedLanguage] = useState({name:'English'}); // Default language
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Dropdown visibility
  const [vipTiers, setVipTiers] = useState([]);
  const [vipBenefits, setVipBenefits] = useState([]);
  const [supportedLanguages, setSupportedLanguages] = useState([
    { name: 'English' },
    { name: 'Spanish' },
    { name: 'French' },
    { name: 'German' },
    { name: 'Chinese' },
    { name: 'Japanese' }
  ]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch VIP tiers and benefits when component mounts
  useEffect(() => {
    const fetchVipData = async () => {
      try {
        setIsLoading(true);
        const tiersData = await getAllVipTiers();
        setVipTiers(tiersData || []);
        

// Set default VIP benefits if not available from API
        setVipBenefits([
          {
            icon: <FaGift />,
            title: 'Exclusive Bonuses',
            description: 'Receive weekly, monthly, and level-up bonuses based on your VIP tier.'
          },
          {
            icon: <FaHeadset />,
            title: 'Dedicated Support',
            description: 'Get priority access to our support team with faster response times.'
          },
          {
            icon: <GiReceiveMoney />,
            title: 'Rakeback',
            description: 'Earn a percentage of your wagers back as cashback, increasing with your VIP level.'
          },
          {
            icon: <FaCalendarCheck />,
            title: 'VIP Events',
            description: 'Invitations to exclusive events, both online and in-person for higher tiers.'
          }
        ]);
      } catch (error) {
        console.error('Error fetching VIP data:', error);
        // Set default VIP tiers if API call fails
        setVipTiers([
          {
            name: 'Bronze',
            color: '#C69C6D',
            wagerAmount: '$10,000',
            icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
            features: ['Level Up bonuses', 'Rakeback', 'Weekly bonuses']
          },
          {
            name: 'Silver',
            color: '#B2CCCC',
            wagerAmount: '$50,000',
            icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
            features: ['All Bronze benefits', 'Monthly bonuses', 'Priority withdrawals']
          },
          {
            name: 'Gold',
            color: '#FFD700',
            wagerAmount: '$250,000',
            icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
            features: ['All Silver benefits', 'Dedicated host', 'Custom promotions']
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVipData();
  }, []);

  // Render a feature item with checkmark
  const renderFeatureItem = (feature, color) => (
    <li className="flex items-center text-gray-300">
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center mr-2"
        style={{ backgroundColor: color }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-3 w-3 ${['#FED100', '#6FDDE7', '#4ABED1'].includes(color) ? 'text-black' : 'text-white'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      {feature}
    </li>
  );

  // Render a VIP tier card
  const renderVipTierCard = (tier, index) => {
    const isUserTier = user && userVipTier && userVipTier.name === tier.name;
    
    return (
      <div key={index} className={`card-wraps-center w-full mr-3 ${isUserTier ? 'relative' : ''}`}>
        {/* Current Tier Indicator */}
        {isUserTier && (
          <div className="absolute -top-3 left-0 right-0 flex justify-center">
            <div className="bg-blue-600 text-white text-xs font-bold py-1 px-3 rounded-full">
              Your Current Tier
            </div>
          </div>
        )}
        
        {/* Star Icon with Round Background */}
        <div className="flex items-center">
          <div className={`flex items-center justify-center bg-[#213743] rounded-full h-10 w-10 ${isUserTier ? 'ring-2 ring-blue-500' : ''}`}>
            {typeof tier.icon === 'string' ? (
              <svg 
                xmlns="http://www.w3.org/2000/svg"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke={tier.color} 
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d={tier.icon}
                />
              </svg>
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg"
                fill="none" 
                viewBox={tier.icon.viewBox || "0 0 24 24"} 
                stroke={tier.color} 
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d={tier.icon.path || tier.icon}
                />
              </svg>
            )}
          </div>

          {/* Extended Horizontal Line */}
          <div className="flex-1 h-[4px] bg-gray-600 ml-4"></div>
        </div>
      
        <div className="flex flex-col bg-[#213743] h-100 rounded-[9px] shadow-lg p-6 mt-3">
          {/* Card Content */}
          <div>
            {/* Button */}
            <button 
              className="py-2 px-6 rounded mb-4"
              style={{ 
                backgroundColor: tier.color,
                color: ['#FED100', '#6FDDE7', '#4ABED1'].includes(tier.color) ? 'black' : 'white'
              }}
            >
              {tier.name}
            </button>

            {/* Price Title */}
            <h3 className="text-2xl font-bold text-white mb-1">{tier.wagerAmount}</h3>
            <p className="text-gray-400 text-sm mb-4">Wager Amount</p>

            {/* Features */}
            <ul className="space-y-2">
              {tier.features && tier.features.map((feature, idx) => (
                <React.Fragment key={idx}>
                  {renderFeatureItem(feature, tier.color)}
                </React.Fragment>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // Render a VIP benefit card
  const renderBenefitCard = (benefit, index) => (
    <div key={index} className="flex items-center bg-[#213743] rounded shadow-lg p-3">
      <div className="h-16 w-16 rounded-full mr-4 flex items-center justify-center text-4xl text-white">
        {benefit.icon}
      </div>
      <div>
        <h3 className="text-xl text-start font-bold text-white">{benefit.title}</h3>
        <p className="text-gray-300 text-start text-sm">
          {benefit.description}
        </p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="bg-[#1a2c38] min-h-screen text-white flex items-center justify-center">
        <div className="text-xl">Loading VIP information...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a2c38] min-h-screen text-white">
      {/* Hero Section with Background Image */}
      <div className="relative w-full h-[300px]">
        {/* Full-Width Image */}
        <img
          src="/assets/affiliate-icons/vip-header.webp"
          alt="VIP Header"
          className="w-full h-full object-cover"
        />
        
        {/* Overlay Text */}
        <div className="absolute inset-0 flex items-center justify-start px-8 bg-gradient-to-r from-black/70 to-transparent">
          {user ? (
            <VipCard />
          ) : (
            <div className="max-w-lg">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                The unrivalled VIP experience
              </h1>
              <p className="text-base md:text-lg text-gray-300 mb-6 leading-relaxed">
                Unlock exclusive benefits and receive instantly withdrawable bonuses without any strings attached.
              </p>
              <button className="bg-blue-600 text-white py-2 px-6 rounded shadow-lg hover:bg-blue-500 transition-colors">
                Sign Up Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* VIP Ranking System Section */}
      <div className="container mx-auto px-4">
        <div className="w-full mt-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            WAGER VIP ranking system
          </h2>
        </div>
        
        {/* VIP Tiers Grid */}
        <div className="w-full relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-2 relative h-full">
            {Array.isArray(vipTiers) && vipTiers.length > 0 ? (
              vipTiers.map((tier, index) => renderVipTierCard(tier, index))
            ) : (
              <div className="col-span-3 text-center text-gray-400">
                No VIP tiers available at the moment.
              </div>
            )}
          </div>
        </div>

        {/* VIP Benefits Section */}
        <div className="w-full my-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            WAGER VIP Club benefits
          </h2>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {Array.isArray(vipBenefits) && vipBenefits.length > 0 ? (
              vipBenefits.map((benefit, index) => renderBenefitCard(benefit, index))
            ) : (
              <div className="col-span-2 text-center text-gray-400">
                No VIP benefits available at the moment.
              </div>
            )}
          </div>
        </div>

        {/* Customer Support Section */}
        <div className="w-full bg-[#213743] rounded-lg shadow-lg p-6 mb-20 flex flex-col sm:flex-row items-start sm:items-center justify-between">
          {/* Title and Details */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">
              Live, 24-hour customer support
            </h2>
            <p className="text-gray-300 text-sm">
              Real support from real people. We're available through instant live chat and email to help you.
            </p>
          </div>


        </div>
      </div>
    </div>
  );
}

export default VipClubPage;
