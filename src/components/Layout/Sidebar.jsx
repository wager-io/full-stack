import { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation for route checking
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext
import {
  Person as PersonIcon,
  Group as GroupIcon,
  Star as StarIcon,
  AccountBalanceWallet as WalletIcon,
  Diamond as DiamondIcon,
  BarChart as BarChartIcon,
  Logout as LogoutIcon,
  SupportAgent as SupportAgentIcon,
  Favorite as FavoriteIcon,
  History as HistoryIcon,
  EmojiEvents as ChallengesIcon,
  Receipt as MyBetsIcon,
  RocketLaunch as CrashIcon,
  Dangerous as MinesIcon,
  Casino as DiceIcon,
  TrendingUp as HiloIcon,
  ScatterPlot as PlinkoIcon,
  Timeline as LimboIcon,
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { NavLink } from 'react-router-dom';


function Sidebar({ isOpen, toggleSidebar, setOpenLiveSupport, openLiveSupport, isMobile = false }) {
  const navigate = useNavigate(); 
  const location = useLocation(); 
  const { user, logout } = useContext(AuthContext); 
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  // Helper to determine if sidebar should show expanded content
  const showExpandedContent = isOpen || isMobile;
  
  // Helper function to handle navigation on mobile (closes sidebar)
  const handleMobileNavigation = (path) => {
    if (isMobile) {
      toggleSidebar();
    }
    if (path) {
      navigate(path);
    }
  };

  const isCasinoRoute = !location.pathname.includes('/sport'); 
  const isSportRoute = location.pathname.includes('/sport'); 

  const cardNavItems = [
    { 
      name: 'Profile', 
      icon: PersonIcon, 
      requiresAuth: true, 
      isDropdown: true 
    },
    // { name: 'Promotions', icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7', path: '/promotions', isDropdown: true },
    { name: 'Affiliate', icon: GroupIcon, path: '/affiliate' },
    { name: 'VIP Club', icon: StarIcon, path: '/vip-club' },
    // { name: 'Blog', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z', path: '/blog' },
    // { name: 'Forum', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z', path: '/forum' },
  ];

  const profileDropdown = [
    { name: 'Wallet', path: '?modal=wallet&tab=deposit', icon: WalletIcon },
    { name: 'VIP', path: '/vip-club', icon: DiamondIcon },
    { name: 'Statistics', path: '?modal=user&name='+user?.username, icon: BarChartIcon },
    { name: 'Logout', action: "logout", icon: LogoutIcon },
  ];

  const supportNavItems = [
    // { name: 'Sponsorship', icon: 'M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z' },
    // { name: 'Responsible Gambling', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
     { name: 'Live Support', icon: SupportAgentIcon },
    // { name: 'Language: English', icon: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129' },
  ];

  const FavNavItems = [
    { 
      name: 'Favourite', 
      icon: FavoriteIcon
    },
    { 
      name: 'Recent', 
      icon: HistoryIcon
    },
    { 
      name: 'Challenges', 
      icon: ChallengesIcon
    },
    { 
      name: 'My bets', 
      icon: MyBetsIcon
    },
  ];

  // New Games list
  const gamesItems = [
    { 
      name: 'Crash', 
      icon: CrashIcon, 
      path: '/casino/game/crash'
    },
    { 
      name: 'Mines', 
      icon: MinesIcon, 
      path: '/casino/game/mines'
    },
    { 
      name: 'Dice', 
      icon: DiceIcon, 
      path: '/casino/game/dice'
    },
    { 
      name: 'Hilo', 
      icon: HiloIcon, 
      path: '/casino/game/hilo'
    },
    { 
      name: 'Plinko', 
      icon: PlinkoIcon, 
      path: '/casino/game/plinko'
    },
    { 
      name: 'Limbo', 
      icon: LimboIcon, 
      path: '/casino/game/limbo'
    },
  ];

  const promotionsSubItems = [
    { name: '75k Weekly Raffle', path: '/promotions/weekly-raffle' },
    { name: '100k Race', path: '/promotions/100k-race' },
    { name: 'Pragmatic Drops', path: '/promotions/pragmatic-drops' },
    { name: 'View More', path: '/promotions/view-more' },
  ];

  // Handle profile item click
  const handleProfileItemClick = (item) => {
    if (isMobile) {
      toggleSidebar();
    }
    if (item.action === 'logout') {
      logout()
    } else if (item.path) {
      navigate(item.path);
    }
  };

  // Helper to determine if a sidebar item is active
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <aside
        className={`bg-[#0f212e] sidebar pb-12 shadow-lg transition-all h-screen duration-300 ease-in-out fixed left-0 pt-0 ${
          isMobile 
            ? (isOpen 
                ? 'w-full z-50' 
                : 'w-0 overflow-hidden z-50') 
            : (isOpen 
                ? 'w-[240px] z-[12]' 
                : 'w-[70px] z-[12]')
        }`}
      >
        {/* Top menu bar with hamburger and buttons */}
        <div className="flex items-center px-4 h-[60px] shadow-md relative z-[-1]">
          <button
            className="text-grey-200 hover:text-white mr-4 cursor-pointer"
            onClick={toggleSidebar}
          >
            {isMobile ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
          {(isOpen || isMobile) && (
            <div className={`flex ${isMobile ? 'flex-1 space-x-1' : 'space-x-2'}`}>
              {/* Casino Button */}
              <button
                onClick={() => handleMobileNavigation('/casino/home/')}
                className={`relative text-white font-semibold py-2 px-3 rounded-[6px] text-sm transition-all overflow-hidden group cursor-pointer ${isMobile ? 'flex-1' : ''}`}
                style={isMobile ? { height: '36px' } : { width: '80px', height: '36px' }}
              >
                <div
                  className={`absolute rounded-[4px] inset-0 bg-cover bg-center transition-opacity duration-300 group-hover:opacity-0 ${isCasinoRoute ? 'opacity-0' : 'opacity-100'}`}
                  style={{ backgroundImage: 'url(/assets/sidebar/casino-poker-cards-en.jpg)' }}
                ></div>
                <div
                  className={`absolute rounded-[4px] inset-0 bg-cover bg-center transition-opacity duration-300 group-hover:opacity-100 ${isCasinoRoute ? 'opacity-100' : 'opacity-0'}`}
                  style={{ backgroundImage: 'url(/assets/sidebar/casino-poker-cards-green-en.jpg)' }}
                ></div>
                <span className="relative z-10">CASINO</span>
              </button>
              {/* Sports Button */}
              <button
                onClick={() => handleMobileNavigation('/sport/home/')}
                className={`relative text-white font-semibold py-2 px-3 rounded-md text-sm transition-all overflow-hidden group cursor-pointer ${isMobile ? 'flex-1' : ''}`}
                style={isMobile ? { height: '36px' } : { width: '80px', height: '36px' }}
              >
                <div
                  className="absolute rounded-[4px] inset-0 bg-cover bg-center transition-opacity duration-300 opacity-100 group-hover:opacity-0"
                  style={{ backgroundImage: 'url(/assets/sidebar/sports-balls-en.jpg)' }}
                ></div>
                <div
                  className={`absolute rounded-[4px] inset-0 bg-cover bg-center transition-opacity duration-300 group-hover:opacity-100 ${isSportRoute ? 'opacity-100' : 'opacity-0'}`}
                  style={{ backgroundImage: 'url(/assets/sidebar/sports-balls-orange-en.jpg)' }}
                ></div>
                <span className="relative z-10">SPORTS</span>
              </button>
            </div>
          )}
        </div>
        <div className="h-full overflow-y-auto">
          <nav className="px-4 py-6">

            <div className="mt-6 mb-5 rounded-[4px] overflow-visible bg-[var(--card-bg-10)]">
              <ul>
                {[
                  { name: 'Favourites', icon: FavNavItems[0].icon, path: '/favourites' },
                  { name: 'Recent', icon: FavNavItems[1].icon, path: '/recent' },
                  // { name: 'Challenges', icon: FavNavItems[2].icon, path: '/challenges' },
                  { name: 'My Bets', icon: FavNavItems[3].icon, path: '/my-bets' },
                ].map((item, index) => (
                  <li key={index} className="relative group">
                    <a
                      href="#"
                      className={`flex items-center font-semibold p-3 text-[13px] transition-colors rounded ${isActive(item.path) ? 'bg-[#22384a] text-white' : 'text-grey-200 hover:bg-[#2f4553] hover:text-white'} ${!showExpandedContent && 'justify-center'}`}
                      onClick={e => {
                        e.preventDefault();
                        handleMobileNavigation(item.path);
                      }}
                    >
                      <item.icon
                        className={`${showExpandedContent ? 'h-5 w-5 mr-3' : 'h-6 w-6 transition-transform group-hover:scale-110'}`}
                      />
                      {showExpandedContent && <span>{item.name}</span>}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Card Navigation Items - shown only if user exists */}
            {user && (
              <div className="mt-6 mb-5 rounded-[4px] overflow-visible bg-[var(--card-bg-10)]">
                <ul>
                  {cardNavItems.map((item, index) => (
                    <li key={index} className="relative group">
                      {item.name === 'Profile' && item.isDropdown ? (
                        <>
                          <button
                            className={`w-full flex items-center font-semibold p-3 text-[13px] transition-colors rounded ${showProfileDropdown ? 'bg-[#22384a] text-white' : 'text-grey-200 hover:bg-[#2f4553] hover:text-white'} ${!showExpandedContent && 'justify-center'}`}
                            onClick={() => {
                              setShowProfileDropdown(!showProfileDropdown);
                              if (isMobile && !showProfileDropdown) {
                                // Don't close sidebar when opening dropdown on mobile
                              }
                            }}
                          >
                            <item.icon
                              className={`${showExpandedContent ? 'h-5 w-5 mr-3' : 'h-6 w-6 transition-transform group-hover:scale-110'}`}
                            />
                            {showExpandedContent && <span>{item.name}</span>}
                            {showExpandedContent && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-4 w-4 ml-auto transform transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </button>
                          {showProfileDropdown && showExpandedContent && (
                            <ul className="pl-8 bg-[#1a3547]">
                              {profileDropdown.map((subItem, subIndex) => (
                                <li key={subIndex}>
                                  <button
                                    className="w-full flex items-center font-semibold p-2 text-[12px] transition-colors text-grey-200 hover:bg-[#2f4553] hover:text-white"
                                    onClick={() => handleProfileItemClick(subItem)}
                                  >
                                    <subItem.icon className="h-4 w-4 mr-2" />
                                    <span>{subItem.name}</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      ) : (
                        <a
                          href="#"
                          className={`flex items-center font-semibold p-3 text-[13px] transition-colors rounded ${isActive(item.path) ? 'bg-[#22384a] text-white' : 'text-grey-200 hover:bg-[#2f4553] hover:text-white'} ${!showExpandedContent && 'justify-center'}`}
                          onClick={e => {
                            e.preventDefault();
                            if (item.path) {
                              handleMobileNavigation(item.path);
                            }
                          }}
                        >
                          <item.icon
                            className={`${showExpandedContent ? 'h-5 w-5 mr-3' : 'h-6 w-6 transition-transform group-hover:scale-110'}`}
                          />
                          {showExpandedContent && <span>{item.name}</span>}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Games section always visible */}
            <div className="mt-6 rounded-[4px] mb-5 overflow-visible bg-[var(--card-bg-10)]">
              {showExpandedContent && (
                <div className="px-4 py-2 border-b border-[#1a3547]">
                  <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Games</h3>
                </div>
              )}
              <div className={showExpandedContent ? 'pt-1' : ''}>
                <ul>
                  {gamesItems.map((item, index) => (
                    <li key={index} className="relative group">
                      <NavLink
                        to={item.path}
                        className={`flex items-center font-semibold p-3 text-[13px] transition-colors rounded ${isActive(item.path) ? 'bg-[#22384a] text-white' : 'text-grey-200 hover:bg-[#2f4553] hover:text-white'} ${!showExpandedContent && 'justify-center'}`}
                        onClick={() => {
                          if (isMobile) {
                            toggleSidebar();
                          }
                        }}
                      >
                        <item.icon
                          className={`${showExpandedContent ? 'h-5 w-5 mr-3' : 'h-6 w-6 transition-transform group-hover:scale-110'}`}
                        />
                        {showExpandedContent && <span>{item.name}</span>}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Support section */}
            <div className="mt-6 rounded-[4px] mb-5 overflow-visible bg-[var(--card-bg-10)]">
              {showExpandedContent && (
                <div className="px-4 py-2 border-b border-[#1a3547]">
                  <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Support</h3>
                </div>
              )}
              <div className={showExpandedContent ? 'pt-1' : ''}>
                <ul>
                  {supportNavItems.map((item, index) => (
                    <li key={index} className="relative group">
                      <button
                        className={`w-full flex items-center font-semibold p-3 text-[13px] transition-colors rounded ${openLiveSupport ? 'bg-[#22384a] text-white' : 'text-grey-200 hover:bg-[#2f4553] hover:text-white'} ${!showExpandedContent && 'justify-center'}`}
                        onClick={() => {
                          setOpenLiveSupport(!openLiveSupport);
                          if (isMobile) {
                            toggleSidebar();
                          }
                        }}
                      >
                        <item.icon
                          className={`${showExpandedContent ? 'h-5 w-5 mr-3' : 'h-6 w-6 transition-transform group-hover:scale-110'}`}
                        />
                        {showExpandedContent && <span>{item.name}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </nav>
        </div>
      </aside>
      
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}

export default Sidebar;
