import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router';
import './style/gamble.css'
import Tab from "./Tab"
import { RiShieldKeyholeFill } from "react-icons/ri";
import { IoCloseSharp } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';

export default function GambleLayout() {
   const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedGamble, setSelectedGamble] = useState('Stake Smart');
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

  const gambleOptions = [
    { path: "/gamble/stake-smart", label: "Stake Smart" },
    { path: "/gamble/recognise-the-sign", label: "Recognise the Signs" },
    { path: "/gamble/responsible-gambling", label: "Responsible Gambling FAQ's" },
    { path: "/gamble/self-assessement", label: "Self-Assessment" },
    { path: "/gamble/budget-calculator", label: "Budget Calculator" },
  ];


  return (
    <div className='relative py-5 px-6'>
      <div className='flex justify-between items-center w-full px-5'>
        <div className="header-content flex items-center gap-3">
          <RiShieldKeyholeFill size={25}/>
          <h1 className='ResponsibleGambling'>Responsible Gambling</h1>
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
            className="flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-300 text-gray-800 text-sm rounded-lg shadow-sm font-medium hover:bg-gray-50 transition-colors"
          >
            {selectedGamble}
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
            <div className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {gambleOptions.map((option, index) => (
                <NavLink
                  key={index}
                  to={option.path}
                  onClick={() => {
                    setSelectedGamble(option.label);
                    setIsDropdownOpen(false);
                  }}
                  className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 ${
                    option.label === selectedGamble ? 'bg-blue-50 text-blue-600 font-semibold' : ''
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
      <div className="content-body flex gap-5 w-full relative my-[20px] px-[20px]">
        {!isMobile && <Tab />}
        <div className="bg-[var(--grey-700)] p-3 w-fit inline rounded">
          <Outlet />
        </div>
      </div>
    </div>
  );
}