import React, { useState, useEffect, useContext, memo } from 'react';
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { Toaster } from 'sonner';
import { AuthContext } from '../../context/AuthContext';

// Only import essential icons, lazy load others
import { FaSearch, FaDice, FaReceipt, FaComments } from 'react-icons/fa';
import Preloader from '../../loader/Preloader';

// Core components - only load essentials immediately
const Navbar = lazy(() => import('./Navbar'));

// Secondary components - load when needed
const Sidebar = lazy(() => import('./Sidebar'));
const LiveSupport = lazy(() => import('../Modals/live-support/Index'));
const Modals = lazy(() => import('./Modals'));
const Footer = lazy(() => import('./Footer'));

// Heavy components - only load when actually needed
const Chats = lazy(() => import('./Chat'));

// Defer routes loading to avoid blocking initial render
const routesPromise = import('./routes');

// Lightweight loading component
const LoadingSpinner = () => (
   <div className="flex items-center justify-center min-h-screen bg-[#1a2c38]">
    <div className="text-center fixed left-[47%]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-white text-lg">3...</p>
    </div>
  </div>
);

const Layout = memo(() => {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMediumScreen, setIsMediumScreen] = useState(false);
  const [activeTab, setActiveTab] = useState('Casino');
  const [openLiveSupport, setOpenLiveSupport] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [componentsReady, setComponentsReady] = useState(false);
  const [routesData, setRoutesData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Memoize window width checks
  const isMobile = windowWidth < 750;
  const isDesktop = windowWidth >= 750;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const isGameRoute = () => {
    if (!routesData?.gameRoutes) return false;
    return routesData.gameRoutes.some(route => location.pathname.startsWith(route));
  };

  // Single initialization effect to prevent multiple DOM queries
  useEffect(() => {
    const screenWidth = window.innerWidth;
    setWindowWidth(screenWidth);
    setSidebarOpen(screenWidth >= 750);
    setIsMediumScreen(screenWidth > 740 && screenWidth < 1200);
    setIsInitialized(true);
    
    // Load routes and defer heavy components
    routesPromise.then(({ routes, protectedRoutes, gameRoutes }) => {
      setRoutesData({ routes, protectedRoutes, gameRoutes });
      setTimeout(() => setComponentsReady(true), 50);
    });

    const handleResize = () => {
      const newScreenWidth = window.innerWidth;
      setWindowWidth(newScreenWidth);
      setIsMediumScreen(newScreenWidth > 740 && newScreenWidth < 1200);
      if (newScreenWidth > 740 && newScreenWidth < 1200) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Optimize tab setting
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/casino')) setActiveTab('Casino');
    else if (path.includes('/bets')) setActiveTab('Bets');
    else setActiveTab('Browse');
  }, [location.pathname]);

  // Optimize body scroll management
  useEffect(() => {
    if (!isInitialized) return;
    
    if (sidebarOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen, isInitialized, isMobile]);

  // Memoize expensive route rendering
  const renderRoutes = React.useMemo(() => {
    if (!routesData) return [];
    
    const { routes, protectedRoutes } = routesData;
    return routes.map(route => {
      const isProtected = protectedRoutes.includes(route.path) || 
        protectedRoutes.some(path => route.path?.startsWith(path + '/'));

      if (isProtected && !user) {
        return (
          <Route
            key={route.path}
            path={route.path}
            element={<Navigate to="/login" state={{ from: location }} replace />}
          />
        );
      }

      if (route.children) {
        return (
          <Route key={route.path} path={route.path} element={route.element}>
            {route.children.map(childRoute => (
              <Route
                key={childRoute.path}
                path={childRoute.path}
                element={
                  isProtected && !user
                    ? <Navigate to="/login" state={{ from: location }} replace />
                    : childRoute.element
                }
              />
            ))}
          </Route>
        );
      }

      return (
        <Route
          key={route.path}
          path={route.path}
          element={route.element}
        />
      );
    });
  }, [user, location.pathname, routesData]);

  // Don't render until initialized to prevent layout shifts
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1a2c38]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Suspense fallback={<Preloader />}>
        <div className="flex min-h-screen bg-[#1a2c38]">

      <Toaster position="bottom-right" richColors />
      {openLiveSupport && (
          <LiveSupport onClose={() => setOpenLiveSupport(false)} />
      )}
      
      {componentsReady ? (
          <Sidebar 
            isOpen={sidebarOpen} 
            toggleSidebar={toggleSidebar} 
            setOpenLiveSupport={setOpenLiveSupport} 
            openLiveSupport={openLiveSupport}
            isMobile={isMobile}
          /> 
      ) : (
        <div className="w-16 bg-[#1a2c38]"></div>
      )}

        {/* Main content */}
        <div
          className={`flex-1 flex relative flex-col transition-all w-full duration-300 ${
            isDesktop
              ? sidebarOpen
                ? isMediumScreen
                  ? 'pl-[70px]'
                  : 'pl-[240px]'
                : 'pl-[70px]'
              : 'ml-0'
          } ${isChatOpen ? 'pr-[370px]' : ''}`}>
          {/* Fixed navbar */}
          <div className="sticky top-0 z-20">
            <Navbar toggleChat={toggleChat} isGameRoute={isGameRoute()} />
          </div>

          {/* MobileSidebar under Navbar and above nav tabs */}
          {/* {window.innerWidth < 750 && showMobileSidebar && (
            <div className="z-10 relative">
              <MobileSidebar
                isOpen={showMobileSidebar}
                toggleSidebar={() => setShowMobileSidebar(false)}
              />
            </div>
          )} */}

          {/* Main content */}
          <main className="flex-1 overflow-y-auto w-full p-0 md:p-0 relative scrollY bg-[var(--bg-color)]">
            {routesData ? (
                <Routes>
                  {renderRoutes}
                </Routes>
            ) : (
              <LoadingSpinner />
            )}
          </main>

          {/* Footer - hide on game routes */}
          {!isGameRoute() && (
              <Footer />
          )}
        </div>

        {/* Chat Panel */}
        {isChatOpen && (
            <Chats closeChat={toggleChat} />
        )}

        {/* Backdrop for desktop */}
        {sidebarOpen && isDesktop && (
          <div
            className={`fixed inset-0 bg-[var(--bg-color)] bg-opacity-50 z-20 ${
              isMediumScreen || isMobile ? '' : 'hidden'
            }`}
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* Load modals after components are ready */}
        {componentsReady && (
            <Modals />
        )}
            {/* Bottom navigation for mobile devices */}
      {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#0f212e] border-t border-gray-700 flex justify-between items-center h-16 px-2">
            <button
              className={`flex flex-col items-center flex-1 focus:outline-none ${
                activeTab === 'Browse' && sidebarOpen
                  ? 'text-blue-400 font-bold'
                  : 'text-gray-300 hover:text-blue-400'
              }`}
              onClick={() => {
                if (activeTab === 'Browse' && sidebarOpen) {
                  setSidebarOpen(false);
                } else {
                  setActiveTab('Browse');
                  setSidebarOpen(true);
                }
              }}
            >
              <FaSearch className="text-xl mb-1" />
              <span className="text-xs">Browse</span>
            </button>
            <button
              className={`flex flex-col items-center flex-1 focus:outline-none ${
                activeTab === 'Casino' ? 'text-blue-400 font-bold' : 'text-gray-300 hover:text-blue-400'
              }`}
              onClick={() => {
                setActiveTab('Casino');
                setSidebarOpen(false);
                navigate('/casino/home');
              }}
            >
              <FaDice className="text-xl mb-1" />
              <span className="text-xs">Casino</span>
            </button>
            <button
              className={`flex flex-col items-center flex-1 focus:outline-none ${
                activeTab === 'Bets' ? 'text-blue-400 font-bold' : 'text-gray-300 hover:text-blue-400'
              }`}
              onClick={() => {
                setActiveTab('Bets');
                setSidebarOpen(false);
                navigate('/my-bets');
              }}
            >
              <FaReceipt className="text-xl mb-1" />
              <span className="text-xs">Bets</span>
            </button>
            <button
              className={`flex flex-col items-center flex-1 focus:outline-none ${
                isChatOpen ? 'text-blue-400 font-bold' : 'text-gray-300 hover:text-blue-400'
              }`}
              onClick={toggleChat}
            >
              <FaComments className="text-xl mb-1" />
              <span className="text-xs">Chats</span>
            </button>
          </nav>
      )}
    </div>
      </Suspense>

    </>

  );
});

export default Layout;
