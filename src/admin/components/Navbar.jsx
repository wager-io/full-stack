import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { 
  Menu as MenuIcon,
  Chat as ChatIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';

export default function Navbar() {
  const [admin, setAdmin] = useState('Super Admin');
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-open sidebar on desktop
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const firstLetter = admin.charAt(0).toUpperCase();
  

  return (
    <>
      <div className={`fixed top-0 left-0 w-full h-[60px] z-50 transition-all duration-300 px-5 ${
        scrolled 
          ? 'shadow-lg' 
          : 'backdrop-blur-sm'
      }`}
      style={{
        background: scrolled ? 'var(--secondary-bg)' : 'var(--secondary-bg)95',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: scrolled 
          ? '0 8px 32px rgba(106, 13, 173, 0.25), 0 4px 16px rgba(106, 13, 173, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)' 
          : '0 4px 20px rgba(106, 13, 173, 0.15), 0 2px 8px rgba(106, 13, 173, 0.1), 0 1px 4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
      }}>
        <div className="h-full">
          <div className="container mx-auto h-full flex items-center justify-between">
            {/* Logo */}
            <Link to="/admin" className="flex items-center">
              <img 
                src="/assets/logo.png" 
                alt="WAGER" 
                className="h-8 w-auto transition-transform duration-200 hover:scale-105"
              />
            </Link>
            
            {/* Spacer for center alignment */}
            <div className="flex-1"></div>
            
            {/* Admin Info and Actions */}
            <div className="flex items-center space-x-4">
              <button 
                className="relative p-2 rounded-lg transition-colors cursor-pointer  duration-200 hover:bg-gray-700/20"
                title="Chat"
              >
                <ChatIcon style={{ color: 'var(--text-light)', fontSize: '20px' }} />
                {/* Notification badge */}
                <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1.5 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xs text-white font-bold">3</span>
                </span>
              </button>

              {/* Notification Icon */}
              <button 
                className="relative p-2 rounded-lg transition-colors cursor-pointer duration-200 hover:bg-gray-700/20"
                title="Notifications"
              >
                <NotificationsIcon style={{ color: 'var(--text-light)', fontSize: '20px' }} />
                {/* Notification badge */}
                <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1.5 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xs text-white font-bold">5</span>
                </span>
              </button>

              {/* Admin Avatar */}
              <div className="flex items-center space-x-1 pl-3 px-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center font-medium shadow-md cursor-pointer transition-all duration-200 hover:scale-105"
                  style={{
                    background: 'var(--accent-purple)',
                    color: 'var(--text-light)'
                  }}
                  onClick={isMobile ? toggleSidebar : undefined}
                >
                  {firstLetter}
                </div>
                <span 
                  className="text-sm hidden sm:block font-medium"
                  style={{ color: 'var(--text-light)' }}
                >
                  {admin}
                </span>
              </div>
            </div>
            
            {/* Mobile Menu Button - Only visible on mobile */}
            <button 
              className="md:hidden ml-3 p-2 rounded-lg transition-colors duration-200 hover:bg-gray-700/20"
              onClick={toggleSidebar}
              title="Menu"
            >
              <MenuIcon style={{ color: 'var(--text-light)', fontSize: '24px' }} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Sidebar - Conditionally rendered on mobile, always shown on desktop */}
      {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}
    </>
  );
}
