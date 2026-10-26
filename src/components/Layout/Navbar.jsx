import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import AuthModal from '../Auth/AuthModal';
import { AuthContext } from '../../context/AuthContext';
import LogginNavbar from './LogginNavbar';

function Navbar({ toggleChat }) {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState('login');

  // Handle register button click
  const handleRegisterClick = () => {
    navigate(`${location.pathname}?tab=register&modal=auth`);
  };

  // Handle login link click
  const handleLoginClick = (e) => {
    e.preventDefault();
    navigate(`${location.pathname}?tab=login&modal=auth`);
  };

  // Check URL parameters for modal and tab
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const modal = searchParams.get('modal');
    const tab = searchParams.get('tab');
    
    if (modal === 'auth') {
      setShowAuthModal(true);
      if (tab === 'register' || tab === 'login') {
        setAuthTab(tab);
      }
    } else {
      setShowAuthModal(false);
    }
  }, [location.search]);

  
  const closeModal = () => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('modal');
    searchParams.delete('tab');
    navigate({ search: searchParams.toString() });
  };

  return (
    <>
      <header className="sticky top-0 z-[999] w-full">
        <div className="site-header__bar bg-[rgb(26,44,56)] h-[60px] text-[13px]">
          <div className="flex items-center justify-between px-4 h-full">
            <div className="flex items-center">
             
              <Link to="/" className="cursor-pointer">
               
                <img src="https://res.cloudinary.com/dxwhz3r81/image/upload/v1714511848/Wager__wshh2r.png" className='w-25 ' alt="" />
              </Link>
            </div>
            {user ? (
              <LogginNavbar toggleChat={toggleChat}/>
            ) :
            <div className="flex items-center space-x-6">
            {/* Login text link */}
            <button 
              className="site-header__action bg-gray-600 hover:bg-gray-500 text-white font-semibold px-6 transition-colors shadow-[0_4px_6px_rgba(0,0,0,0.3)] cursor-pointer"
              onClick={handleLoginClick}>
              Login
            </button>
           
            <button 
              className="site-header__action bg-blue-500 hover:bg-blue-400 text-white font-semibold px-5 transition-colors shadow-[0_4px_6px_rgba(0,0,0,0.3)] cursor-pointer"
              onClick={handleRegisterClick}>
              Register
            </button>
          </div>}
          </div>
        </div>
      </header>

      
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={closeModal} 
          initialTab={authTab} 
        />
      )}
    </>
  );
}

export default Navbar;


