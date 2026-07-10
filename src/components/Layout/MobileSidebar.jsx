import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Favourites from './Favourites';
import Recent from './Recent';

const NAVBAR_HEIGHT = 60;
const BOTTOM_NAV_HEIGHT = 64;

export default function MobileSidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [showFavourites, setShowFavourites] = useState(false);
  const [showRecent, setShowRecent] = useState(false);

  const isCasinoRoute = location.pathname.includes('/casino');
  const [isPromotionsOpen, setIsPromotionsOpen] = useState(false);

  // Data from Sidebar.jsx
  const FavNavItems = [
    { name: 'Favourite', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
    { name: 'Recent', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Challenges', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
    { name: 'My bets', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
  ];

  const gamesItems = [
    { name: 'Crash', icon: 'M2.5 19.5l19-7.5m-19 7.5l7.5-19m-7.5 19l7.5-7.5m11.5 0a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', path: '/casino/game/crash' },
    { name: 'Mines', icon: 'M2 22l20-20m-7 7l7 7m-7-7l-7 7m7-7v14', path: '/casino/game/mines' },
    { name: 'Dice', icon: 'M5 5h14v14H5V5zm3 3h2v2H8V8zm6 0h2v2h-2V8zm-6 6h2v2H8v-2zm6 0h2v2h-2v-2z', path: '/casino/game/dice' },
    { name: 'Hilo', icon: 'M12 4v16m0 0l-4-4m4 4l4-4M12 20V4m0 0l-4 4m4-4l4 4', path: '/casino/game/hilo' },
  ];

  const cardNavItems = [
    { name: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', requiresAuth: true, isDropdown: true, path: '/profile' },
    { name: 'Promotions', icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7', isDropdown: true },
    { name: 'Affiliate', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', path: '/affiliate' },
    { name: 'VIP Club', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', path: '/vip-club' },
    { name: 'Blog', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z', path: '/blog' },
    { name: 'Forum', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z', path: '/forum' },
  ];

  const promotionsSubItems = [
    { name: '75k Weekly Raffle', path: '/promotions/weekly-raffle' },
    { name: '100k Race', path: '/promotions/100k-race' },
    { name: 'Pragmatic Drops', path: '/promotions/pragmatic-drops' },
    { name: 'View More', path: '/promotions/view-more' },
  ];

  const supportNavItems = [
    { name: 'Sponsorship', icon: 'M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z' },
    { name: 'Responsible Gambling', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { name: 'Live Support', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
    { name: 'Language: English', icon: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129' },
  ];

  // Handle logout
  const handleProfileItemClick = (item) => {
    if (item.action === 'logout') {
      logout();
      navigate('/');
      if (toggleSidebar) toggleSidebar();
    } else if (item.path) {
      navigate(item.path);
      if (toggleSidebar) toggleSidebar();
    }
  };

  const handleFavouriteClick = () => {
    setShowFavourites(true);
    setShowRecent(false);
    toggleSidebar(); // Close mobile sidebar
  };

  const handleRecentClick = () => {
    setShowRecent(true);
    setShowFavourites(false);
    toggleSidebar(); // Close mobile sidebar
  };

  const handleCloseFavourites = () => {
    setShowFavourites(false);
  };

  const handleCloseRecent = () => {
    setShowRecent(false);
  };

  return (
    <>
      <div className={`fixed inset-0 z-50 lg:hidden ${isOpen ? 'block' : 'hidden'}`}>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleSidebar}></div>
        
        {/* Sidebar */}
        <div className={`fixed top-0 left-0 h-full w-80 bg-[#0f212e] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* Casino/Sports Buttons - Fixed at the top */}
          <div
            className="flex w-full gap-2 bg-[#1a2c38] border-b border-gray-700"
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}
          >
            {/* Casino Button */}
            <button
              onClick={() => {
                navigate('/casino/home/');
                if (toggleSidebar) toggleSidebar();
              }}
              className="relative flex-1 text-white font-semibold py-2 px-3 rounded-none text-sm transition-all overflow-hidden group cursor-pointer"
              style={{
                height: '36px',
                borderRadius: 0,
              }}
            >
              <div
                className={`absolute rounded-[4px] inset-0 bg-cover bg-center transition-opacity duration-300 ${
                  isCasinoRoute ? 'opacity-0' : 'opacity-100'
                }`}
                style={{
                  backgroundImage: 'url(/assets/sidebar/casino-poker-cards-en.jpg)',
                }}
              ></div>
              <div
                className={`absolute rounded-[4px] inset-0 bg-cover bg-center transition-opacity duration-300 ${
                  isCasinoRoute ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  backgroundImage: 'url(/assets/sidebar/casino-poker-cards-green-en.jpg)',
                }}
              ></div>
              <span className="relative z-10">CASINO</span>
            </button>
            {/* Sports Button */}
            <button
              className="relative flex-1 text-white font-semibold py-2 px-3 rounded-none text-sm transition-all overflow-hidden group cursor-pointer"
              style={{
                height: '36px',
                borderRadius: 0,
              }}
            >
              <div
                className="absolute rounded-[4px] inset-0 bg-cover bg-center transition-opacity duration-300 opacity-100 group-hover:opacity-0"
                style={{
                  backgroundImage: 'url(/assets/sidebar/sports-balls-en.jpg)',
                }}
              ></div>
              <div
                className="absolute rounded-[4px] inset-0 bg-cover bg-center transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                style={{
                  backgroundImage: 'url(/assets/sidebar/sports-balls-orange-en.jpg)',
                }}
              ></div>
              <span className="relative z-10">SPORTS</span>
            </button>
          </div>

          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto">
            {/* Favourites Section */}
            <ul>
              {FavNavItems.map((item) => (
                <li key={item.name}>
                  <button
                    className="flex items-center w-full px-4 py-4 text-base text-gray-200 hover:bg-[#22384a] transition-colors"
                    onClick={() => {
                      if (!user) return;
                      
                      if (item.name === 'Favourite') {
                        handleFavouriteClick();
                      } else if (item.name === 'Recent') {
                        handleRecentClick();
                      }
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
            <hr className="border-gray-700 my-2" />

            {/* Games Section */}
            <ul>
              {gamesItems.map((item) => (
                <li key={item.name}>
                  <button
                    className="flex items-center w-full px-4 py-4 text-base text-gray-200 hover:bg-[#22384a] transition-colors"
                    onClick={() => {
                      navigate(item.path);
                      if (toggleSidebar) toggleSidebar();
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
            <hr className="border-gray-700 my-2" />

            {/* Card Nav Section */}
            <ul>
              {cardNavItems.map((item) => {
                if (item.requiresAuth && !user) return null;
                if (item.name === 'Profile') {
                  return (
                    <li key={item.name}>
                      <button
                        className="flex items-center w-full px-4 py-4 text-base text-gray-200 hover:bg-[#22384a] transition-colors justify-between"
                        onClick={() => {}}
                      >
                        <span className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 mr-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                          </svg>
                          {item.name}
                        </span>
                      </button>
                    </li>
                  );
                }
                if (item.name === 'Promotions') {
                  return (
                    <li key={item.name}>
                      <button
                        className="flex items-center w-full px-4 py-4 text-base text-gray-200 hover:bg-[#22384a] transition-colors justify-between"
                        onClick={() => setIsPromotionsOpen((v) => !v)}
                      >
                        <span className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 mr-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                          </svg>
                          {item.name}
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 ml-2 transition-transform ${isPromotionsOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isPromotionsOpen && (
                        <ul className="pl-8 bg-[#1a2c38] rounded-md mt-2">
                          {promotionsSubItems.map((subItem) => (
                            <li key={subItem.name} className="py-2">
                              <button
                                className="text-gray-300 hover:text-white text-sm transition-colors"
                                onClick={() => {
                                  navigate(subItem.path);
                                  if (toggleSidebar) toggleSidebar();
                                }}
                              >
                                {subItem.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                }
                return (
                  <li key={item.name}>
                    <button
                      className="flex items-center w-full px-4 py-4 text-base text-gray-200 hover:bg-[#22384a] transition-colors"
                      onClick={() => {
                        if (item.path) {
                          navigate(item.path);
                          if (toggleSidebar) toggleSidebar();
                        }
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 mr-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                      {item.name}
                    </button>
                  </li>
                );
              })}
            </ul>
            <hr className="border-gray-700 my-2" />

            {/* Support Section */}
            <ul>
              {supportNavItems.map((item) => (
                <li key={item.name}>
                  <button
                    className="flex items-center w-full px-4 py-4 text-base text-gray-200 hover:bg-[#22384a] transition-colors"
                    onClick={() => {
                      // Add navigation if needed
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Favourites Modal */}
      {showFavourites && (
        <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center">
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] overflow-hidden">
            <button
              onClick={handleCloseFavourites}
              className="absolute top-4 right-4 z-10 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Favourites />
          </div>
        </div>
      )}

      {/* Recent Modal */}
      {showRecent && (
        <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center">
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] overflow-hidden">
            <button
              onClick={handleCloseRecent}
              className="absolute top-4 right-4 z-10 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Recent />
          </div>
        </div>
      )}
    </>
  );
}
