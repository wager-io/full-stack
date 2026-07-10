import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router';
import './style/policy.css';
import Tabs from './Tabs';
import { RiShieldKeyholeFill } from 'react-icons/ri';
import { IoCloseSharp } from 'react-icons/io5';import { useNavigate } from 'react-router-dom';


export default function PolicyLayout() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState('Privacy');
 const navigate = useNavigate();
  function toggleForm() {
    navigate('/casino/home');
  }

  const handleResize = () => setIsMobile(window.innerWidth < 900);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const policyOptions = [
    { path: "/policies/deposit-bonus-requirement", label: "Deposit Bonus Requirements" },
    { path: "/policies/anti-money-laundering", label: "Anti-Money Laundering" },
    { path: "/policies/privacy", label: "Privacy" },
    { path: "/policies/coin-mixing", label: "Coin Mixing" },
    { path: "/policies/providers", label: "Providers" },
    { path: "/policies/sportsbook", label: "Sports Book" },
    { path: "/policies/cookies policy", label: "Cookies Policy" },
    { path: "/policies/self-exclusion", label: "Self-Exclusion" },
    { path: "/policies/racing-rles", label: "Racing Rules" },
    { path: "/policies/poker cards", label: "Poker Card Room Rules" },
    { path: "/policies/poker-refund-policy", label: "Poker Refund Policy" },
    { path: "/policies/affilate-terms", label: "Affiliate Terms" },
  ];

  return (
    <div className='relative py-5 px-6'>
      <div className='flex justify-between items-center w-full px-5'>
        <div className="header-content flex items-center gap-3">
          <RiShieldKeyholeFill size={25} />
          <h1 className='policies'>Policies</h1>
        </div>
        <button className="close-btn" onClick={toggleForm}>
          <IoCloseSharp />
         </button>
      </div>

      {/* Dropdown for Mobile */}
      {isMobile && (
        <div className="relative mt-3">
          <button
            onClick={toggleDropdown}
            className="flex items-center justify-between w-full px-4 py-3 bg-[var(--grey-700)] border border-gray-300 text-white text-sm rounded-lg shadow-sm font-medium  transition-colors"
          >
            {selectedPolicy}
            <svg
              className={`w-4 h-4 ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 mt-2 w-full bg-[var(--grey-700)]  rounded-lg shadow-lg z-50">
              {policyOptions.map((option, index) => (
                <NavLink
                  key={index}
                  to={option.path}
                  onClick={() => {
                    setSelectedPolicy(option.label);
                    setIsDropdownOpen(false);
                  }}
                  className={`block px-4 py-2 text-sm text-white  last:border-b-0 ${
                    option.label === selectedPolicy ? 'bg-blue-600 text-blue-600 font-semibold rounded' : ''
                  }`}
                >
                  {option.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content Body */}
      <div className="content-body flex gap-5 w-full relative my-[20px] ">
        {!isMobile && <Tabs />}
        <div className="bg-[var(--grey-700)]  w-fit inline">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

