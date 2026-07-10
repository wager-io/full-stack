import React, { useState, useEffect, useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function AffiliatePage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  // Update active tab based on current route
  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path) {
      setActiveTab(path);
    }
  }, [location.pathname]);

  // Handle tab click
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    navigate(`/affiliate/${tabName}`);
  };

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'campaigns', label: 'Campaigns', isDisabled: !user },
    { id: 'commission', label: 'Commission', isDisabled: !user },
    { id: 'referred-users', label: 'Referred Users', isDisabled: !user },
    { id: 'faqs', label: 'FAQs', isDisabled: !user },
  ];

  return (
    <div className="min-h-screen text-white">
      {/* Header with Title */}
      <div className="w-full py-6 px-8 flex items-center justify-start">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-white mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
          />
        </svg>
        <h1 className="text-2xl font-bold text-white">Affiliate Program</h1>
      </div>

      {/* Tab and Content Layout */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex">
          {/* Left side - Tabs with improved sticky behavior */}
          <div className="w-[200px] mr-6">
            <div className="sticky bg-[rgb(15,33,46)] p-2 rounded-2xl">
              {tabs.map(tab => (
                <button 
                  key={tab.id}
                  className={`w-full rounded-md ${tab.isDisabled && "hidden"} text-left p-3 mb-1 cursor-pointer ${
                    activeTab === tab.id 
                        ? 'border-l-4 border-blue-600 bg-[#071824] text-white pl-3' 
                      : 'text-gray-300 hover:bg-[#0a2435] hover:text-white'
                  }`}
                  onClick={() => handleTabClick(tab.id)}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right side - Content */}
          <div className="flex-1 bg-[#0f212e] rounded-2xl p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AffiliatePage;
