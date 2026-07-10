import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext
import { useSearchParams, useNavigate } from 'react-router-dom'; // Import useSearchParams
import { toast } from 'sonner'; // Import toast from sonner
import { useLocation } from 'react-router-dom'

export default function LogginNavbar({ toggleChat }) {
  const { user, balance, logout, verifyCode, resendVerificationCode, updateUserDetails } = useContext(AuthContext); // Access user, logout, verifyCode, and updateUserDetails from AuthContext
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // State for search input
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null); // Reference for the dropdown
  const [searchParams, setSearchParams] = useSearchParams(); // Manage query parameters
  const navigate = useNavigate();
  const location = useLocation()
  const [showStatistics, setShowStatistics] = useState(false);

// Alternative approach for very small numbers
const formatBalance = (value) => {
  if (!value) return '0.0000';
  
  // Convert scientific notation to a regular number
  const num = Number(value);
  
  // If the number is very small (less than 0.0001)
  if (num < 0.0001 && num > 0) {
    // Show scientific notation but formatted nicely
    return num.toExponential(4);
  }
  
  // Otherwise show regular decimal format
  return num.toFixed(4);
};

const formattedBalance = formatBalance(balance);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const toggleWalletModal = () => {
    const isWalletModalOpen = searchParams.get('modal') === 'wallet';
    if (isWalletModalOpen) {
      searchParams.delete('modal'); // Remove the modal query parameter
      searchParams.delete('tab'); // Remove the tab query parameter
    } else {
      searchParams.set('modal', 'wallet'); // Set modal to wallet
      searchParams.set('tab', 'deposit'); // Default tab to deposit
    }
    setSearchParams(searchParams); // Update the URL
  };

  const toggleStatisticsModal = () => {
    const isStatisticsOpen = searchParams.get('modal') === 'user';
    if (isStatisticsOpen) {
      searchParams.delete('modal'); // Remove the modal query parameter
      searchParams.delete('name'); // Remove the tab query parameter
    } else {
      searchParams.set('modal', 'user'); // Set modal to wallet
      searchParams.set('name', user?.username); // Default tab to deposit
    }
    setSearchParams(searchParams); // Update the URL
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(()=>{
    // Get username from URL query parameter
    const searchParams = new URLSearchParams(location.search)
    const username = searchParams.get('name')
    if(username){
      setShowStatistics(true)
    }
  },[location.search])

  const cryptocurrencies = [
    { name: 'Bitcoin', symbol: 'BTC', balance: '0.0023', icon: '/assets/token/bitcoin-btc-logo.png' },
    { name: 'Ethereum', symbol: 'ETH', balance: '1.2345', icon: '/assets/token/ethereum.png' },
    { name: 'Binance Coin', symbol: 'BNB', balance: '0.5678', icon: '/assets/token/bnb.png' },
    { name: 'Cardano', symbol: 'ADA', balance: '100.45', icon: '/assets/token/ada.png' },
    { name: 'Solana', symbol: 'SOL', balance: '50.12', icon: '/assets/token/sol.png' },
    { name: 'Ripple', symbol: 'XRP', balance: '200.34', icon: '/assets/token/xrp.png' },
    { name: 'Polkadot', symbol: 'DOT', balance: '75.89', icon: '/assets/token/dot.png' },
    { name: 'Dogecoin', symbol: 'DOGE', balance: '5000.67', icon: '/assets/token/doge.png' },
    { name: 'Litecoin', symbol: 'LTC', balance: '2.345', icon: '/assets/token/ltc.png' },
    { name: 'Shiba Inu', symbol: 'SHIB', balance: '1000000', icon: '/assets/token/shib.png' },
    { name: 'Avalanche', symbol: 'AVAX', balance: '12.34', icon: '/assets/token/avax.png' },
    { name: 'Chainlink', symbol: 'LINK', balance: '45.67', icon: '/assets/token/link.png' },
    { name: 'Cosmos', symbol: 'ATOM', balance: '34.56', icon: '/assets/token/atom.png' },
  ];

  const userDropdownItems = [
    { name: 'Wallet', icon: '💼', action: toggleWalletModal },
    { name: 'VIP', icon: '👑', action: ()=> navigate("/vip-club") },
    { name: 'Affiliate', icon: '🤝', action: ()=> navigate("/affiliate") },
    { name: 'Statistics', icon: '📊', action:  toggleStatisticsModal },
    { name: 'Transactions', icon: '💳', action: ()=> navigate("/transactions") },
    // { name: 'My Bets', icon: '🎲', action: ()=> navigate("/my-bets") },

    // { name: 'Settings', icon: '⚙️', action: ()=> navigate("/settings") },
    // { name: 'Live Support', icon: '💬' },
    { name: 'Logout', icon: '🚪', action: logout }, // Add the logout action
  ];

  // Filter cryptocurrencies based on the search term
  const filteredCryptocurrencies = cryptocurrencies.filter((crypto) =>
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <nav className="p-1 md:p-4 flex justify-center items-center space-x-0 relative z-40">
        {/* Wallet Balance Container */}
        <div
          className="wallet-container flex"
          onClick={toggleWalletModal} // Open wallet modal on click
        >
        <div className="bg-[rgb(15,33,46)] cursor-pointer text-white px-4 py-3 rounded-l flex items-center space-x-2 relative">
            <div className="text-sm font-medium">{formattedBalance}</div>
            <img
              src="/assets/token/usdt.png" // Replace with the actual path to your currency icon
              alt="Currency Icon"
              className="w-4 h-4"
            />
          </div>
          <div className="bg-blue-600 text-white px-4 py-3 rounded-r flex items-center">
            <span className="text-sm font-medium hidden md:block">Wallet</span>
            {window.innerWidth <= 768 && (
              <svg fill="currentColor" viewBox="0 0 64 64" className="svg-icon block md:hidden w-4 h-4" >
                <title></title> 
                <path fillRule="evenodd" d="M45.71 13.349v.024c0 4.316-2.076 8.146-5.32 10.57H24.61l-.034-.024a13.19 13.19 0 0 1-5.286-10.57c0-7.296 5.914-13.21 13.21-13.21s13.21 5.914 13.21 13.21m4.806 22.844H62.23v-3.19a5.31 5.31 0 0 0-5.3-5.31H10.14a5.624 5.624 0 0 1-5.24-5.608v-.014a5 5 0 0 1 0-.522v.012a5.546 5.546 0 0 1 5.51-5.11h3.85a17.5 17.5 0 0 1-.26-2.88v-.01H7.06A7.07 7.07 0 0 0 0 20.63v37.1a6.14 6.14 0 0 0 6.13 6.13h50.79a5.31 5.31 0 0 0 5.31-5.31v-3.19H50.5c-.092.004-.2.006-.31.006-5.296 0-9.59-4.294-9.59-9.59s4.294-9.59 9.59-9.59q.163 0 .326.006m4.733-22.63v2.89h-4.516a18.4 18.4 0 0 0 .267-2.89zm-4.516 2.89-.02.11.017-.11zM8.66 21.983c0-.98.792-1.774 1.77-1.78h4.91l.044.122a17.8 17.8 0 0 0 1.956 3.618h-6.91a1.77 1.77 0 0 1-1.77-1.77zM64 39.943v11.67l-13.488-.002a5.84 5.84 0 0 1-6.094-5.834 5.84 5.84 0 0 1 6.082-5.834zm-13.06 8.5a2.67 2.67 0 0 0 2.67-2.66v-.01a2.67 2.67 0 1 0-2.67 2.67m-1.26-28.24a18.2 18.2 0 0 1-1.998 3.74h-.002l-.038.058.04-.058H58v-3.74z" clipRule="evenodd"></path>
              </svg>
            )}
          </div>
        </div>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div className="absolute top-16 left-0 bg-[rgb(15,33,46)] text-white rounded shadow-lg w-64">
            {/* Enhanced Search Input */}
            <div className="p-2">
              <input type="text"
                placeholder="Search currency..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 text-sm text-white border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 ease-in-out"
              />
            </div>
            <ul className="py-2 max-h-55 overflow-y-auto">
              {filteredCryptocurrencies.map((crypto, index) => (
                <li
                  key={index}
                  className="px-4 py-2 flex justify-between items-center hover:bg-blue-600 cursor-pointer"
                >
                  {/* Left: Balance */}
                  <span className="text-sm font-medium">{crypto.balance}</span>
                  {/* Right: Icon and Symbol */}
                  <div className="flex space-x-2">
                    <img src={crypto.icon} alt={`${crypto.name} Icon`} className="w-4 h-4" />
                    <span className="text-sm font-medium">{crypto.symbol}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* User Icon */}
        <div className="relative md:ml-40 p-4  md:block items-center bold text-white" ref={userDropdownRef}>
          <button
            onClick={toggleUserDropdown}
            className="p-2 md:p-4 flex items-center text-white"
          >
            <svg
              fill="currentColor"
              viewBox="0 0 64 64"
              className="svg-icon w-9 h-9 text-white"
            >
              <title></title>
              <path
                fillRule="evenodd"
                d="M48.322 30.536A19.63 19.63 0 0 0 51.63 19.63 19.62 19.62 0 0 0 32 0a19.63 19.63 0 1 0 16.322 30.536M42.197 43.97a26.6 26.6 0 0 0 8.643-5.78A19.84 19.84 0 0 1 64 56.86V64H0v-7.14a19.84 19.84 0 0 1 13.16-18.67 26.63 26.63 0 0 0 29.037 5.78"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>

          {/* User Dropdown */}
          {isUserDropdownOpen && (
            <div className="absolute right-0 mt-2 bg-[rgb(15,33,46)] text-white rounded shadow-lg w-48">
              <ul className="py-2">
                {userDropdownItems.map((item, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 flex items-center space-x-2 hover:bg-blue-600 cursor-pointer"
                    onClick={() => item.action && item.action()} // Trigger the action (logout for the Logout item)
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm font-medium">{item.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Bell Icon */}
        <button className="p-2 md:p-4 flex items-center text-white">
          <svg
            fill="currentColor"
            viewBox="0 0 64 64"
            className="svg-icon w-9 h-9 text-white"
          >
            <title></title>
            <path d="M56 39.64V32c0-10.44-6.68-19.32-16-22.6V8c0-4.4-3.6-8-8-8s-8 3.6-8 8v1.4C14.68 12.68 8 21.56 8 32v7.56H0V48h64v-8.44zm-40 19.6c0 2.64 2.12 4.76 4.76 4.76H43.2c2.64 0 4.76-2.12 4.76-4.76V54H16z"></path>
          </svg>
        </button>

        {/* Chat Icon */}
        <button onClick={toggleChat} className="p-2 md:p-4 hidden items-center text-white md:block">
          <svg
            fill="currentColor"
            viewBox="0 0 64 64"
            className="svg-icon w-9 h-9 text-white"
          >
            <title></title>
            <path d="M63.76 13.92c-.16-.36-.36-.68-.68-.96-.28-.28-.6-.48-1-.64-.36-.16-.76-.24-1.16-.2h-9v26.16c0 2.04-.8 4-2.28 5.48a7.75 7.75 0 0 1-5.48 2.28H26.84c-1.6 0-2.92 1.32-2.92 2.92v15.08h5c.2-1.32.88-2.56 1.88-3.48s2.28-1.44 3.64-1.52c1.36.08 2.64.6 3.64 1.52s1.64 2.12 1.84 3.48h8c.2-1.32.88-2.56 1.88-3.48s2.28-1.44 3.64-1.52c1.36.08 2.64.6 3.68 1.52 1 .92 1.68 2.16 1.88 3.48h5V15.08c0-.4-.08-.8-.24-1.16"></path>
            <path d="M43.04 38.08c.56-.56.88-1.32.88-2.12V3c0-.8-.32-1.56-.88-2.12S41.72 0 40.92 0H3C2.2 0 1.44.32.88.88S0 2.2 0 3v32.96c0 .8.32 1.56.88 2.12s1.32.88 2.12.88h1v13c0 1.44 1.76 2.16 2.76 1.08L20 38.96h20.92c.8 0 1.56-.32 2.12-.88"></path>
          </svg>
        </button>
      </nav>
    </>
  );
}

