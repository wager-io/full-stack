import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Update active tab when initialTab prop changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save the current scroll position
      const scrollY = window.scrollY;
      
      // Add styles to body to prevent scrolling
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'scroll';
    }
    
    // Cleanup function to restore scrolling when component unmounts or modal closes
    return () => {
      if (isOpen) {
        // Get the scroll position from body top property
        const scrollY = document.body.style.top;
        
        // Remove the fixed position styles
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflowY = '';
        
        // Restore the scroll position
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    };
  }, [isOpen]);

  // Handle tab change
  const handleTabChange = (tab) => {
    // Update URL with new tab parameter
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', tab);
    searchParams.set('modal', 'auth');
    navigate({ search: searchParams.toString() });
    
    // Update local state
    setActiveTab(tab);
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99454599] flex items-center justify-center bg-[#00000075] bg-opacity-70">
      <div className="bg-[#1a2c38] rounded-lg shadow-xl w-full md:max-w-md mx-4 overflow-hidden relative max-h-[100vh] md:max-h-[90vh] flex flex-col">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white cursor-pointer transition-transform hover:rotate-90 duration-300 z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Modal Header with Tabs */}
        <div className="flex border-b border-gray-700 flex-shrink-0">
          <button
            className={`flex-1 py-4 text-center font-medium ${
              activeTab === 'login'
                ? 'text-white bg-[#213743]'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => handleTabChange('login')}
          >
            Login
          </button>
          <button
            className={`flex-1 py-4 text-center font-medium ${
              activeTab === 'register'
                ? 'text-white bg-[#213743]'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => handleTabChange('register')}
          >
            Register
          </button>
        </div>
        
        {/* Modal Body - Scrollable */}
        <div className="p-6 overflow-y-auto scrollY flex-grow">
          {activeTab === 'login' ? (
            <LoginForm onClose={onClose} />
          ) : (
            <RegisterForm onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
