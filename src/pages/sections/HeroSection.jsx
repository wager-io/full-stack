import React, { useContext, useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import VipCard from '../landingPageComponent/VipCard';

function HeroSection() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 750);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 750);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle login link click
  const handleLoginClick = (e) => {
    e.preventDefault();
    navigate(`${location.pathname}?tab=register&modal=auth`);
  };

  return (
    <div className="py-8 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/assets/landingpage/header-bg.DLFzM8kq.png")' }}
    >
      <div className="grid grid-cols-1 p-5 md:grid-cols-2 gap-14">
        {!user ? (
          <div className={`${isMobile ? 'text-center mx-auto' : 'text-left'}`} style={{ maxWidth: isMobile ? "100%" : "408px" }}>
            <h1 className="text-white font-bold mb-8" style={{ fontSize: "2rem" }}>
              {isMobile ? "Play Smarter" : "World's Largest Online Casino and Sportsbook"}
            </h1>
            
            <div className="mb-10 ">
              <a href="#" onClick={handleLoginClick}
                className={`inline-block bg-blue-500 hover:bg-blue-400 text-white font-semibold py-4 px-32 md:px-15 transition-colors shadow-[0_4px_6px_rgba(0,0,0,0.3)] cursor-pointer ${
                  isMobile ? 'w-full rounded-[30px]' : 'rounded-[6px]'
                }`}
              >
                {isMobile ? "Register Now" : "Register"}
              </a>
            </div>
            
            {isMobile ? (
              <div className="text-center">
                {/* <div className="flex items-center justify-center mb-4">
                  <div className="h-[1px] bg-gray-500 flex-grow"></div>
                  <span className="px-4 text-gray-300 text-sm">or</span>
                  <div className="h-[1px] bg-gray-500 flex-grow"></div>
                </div>
                <div className="flex items-center justify-center space-x-4">
     
                  <button className="p-3 bg-[#2f4553] rounded-[6px] hover:bg-[#3a5060] transition-colors shadow-[0_4px_6px_rgba(0,0,0,0.3)] cursor-pointer">
                    <svg className="w-6 h-6" fill="#1877F2" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
           
                  <button className="p-3 bg-[#2f4553] rounded-[6px] hover:bg-[#3a5060] transition-colors shadow-[0_4px_6px_rgba(0,0,0,0.3)] cursor-pointer">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  </button>
                  
     
                  <button className="p-3 bg-[#2f4553] rounded-[6px] hover:bg-[#3a5060] transition-colors shadow-[0_4px_6px_rgba(0,0,0,0.3)] cursor-pointer">
                    <svg className="w-6 h-6" fill="#9146FF" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                    </svg>
                  </button>
                </div> */}
              </div>
            ) : (
              <div>
                {/* <p className="text-gray-300 mb-2 text-sm">Or Sign up with:</p>
                <div className="flex items-center space-x-2">
               
                  <button className="p-3 bg-[#2f4553] rounded-[6px] hover:bg-[#3a5060] transition-colors shadow-[0_4px_6px_rgba(0,0,0,0.3)] cursor-pointer">
                    <svg className="w-6 h-6" fill="#1877F2" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
             
                  <button className="p-3 bg-[#2f4553] rounded-[6px] hover:bg-[#3a5060] transition-colors shadow-[0_4px_6px_rgba(0,0,0,0.3)] cursor-pointer">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  </button>
            
                  <button className="p-3 bg-[#2f4553] rounded-[6px] hover:bg-[#3a5060] transition-colors shadow-[0_4px_6px_rgba(0,0,0,0.3)] cursor-pointer">
                    <svg className="w-6 h-6" fill="#9146FF" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                    </svg>
                  </button>
                  
          
                  <button className="p-3 bg-[#2f4553] rounded-[6px] hover:bg-[#3a5060] transition-colors shadow-[0_4px_6px_rgba(0,0,0,0.3)] cursor-pointer">
                    <svg className="w-6 h-6" fill="#06C755" viewBox="0 0 24 24">
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                    </svg>
                  </button>
                </div> */}
              </div>
            )}
          </div>
        ) : <VipCard />}
        
        {/* Right Column - Cards side by side */}
        <div className="flex flex-row justify-center space-x-3">
          {/* First Card */}

          <NavLink to={"/casino/home"} className="bg-[#1e3a4a] rounded-[6px] h-fit overflow-hidden shadow-lg w-full transform transition-transform duration-300 hover:-translate-y-2 cursor-pointer">
            <div
              className="relative h-46 p-[3px]"
              style={{
                background:
                  "radial-gradient(circle at 100% 100%, var(--grey-500) 0, var(--grey-500) 6px, transparent 6px) 0% 0%/8px 8px no-repeat, radial-gradient(circle at 0 100%, var(--grey-500) 0, var(--grey-500) 6px, transparent 6px) 100% 0%/8px 8px no-repeat, radial-gradient(circle at 100% 0, var(--grey-500) 0, var(--grey-500) 6px, transparent 6px) 0% 100%/8px 8px no-repeat, radial-gradient(circle at 0 0, var(--grey-500) 0, var(--grey-500) 6px, transparent 6px) 100% 100%/8px 8px no-repeat, linear-gradient(var(--grey-500), var(--grey-500)) 50% 50%/calc(100% - 4px) calc(100% - 16px) no-repeat, linear-gradient(var(--grey-500), var(--grey-500)) 50% 50%/calc(100% - 16px) calc(100% - 4px) no-repeat, linear-gradient(var(--degrees), transparent var(--percentage), var(--border-color) 100%)",
              }}>
              <img
                src="/assets/landingpage/casino-section.png"
                alt="Explore Casino"
                className="w-full h-full object-cover rounded"
              />
            </div>
            <div className="p-2">
              <div className="flex mb-3 justify-between items-center">
                <span className="text-white font-semibold text-sm">Casino</span>
                <div className="flex items-center">
                  <span className="bg-green-500 h-2 w-2 rounded-full mr-2"></span>
                  <span className="text-white text-sm">{Math.floor(Math.random() * 5000) + 10000}</span>
                </div>
              </div>
            </div>
          </NavLink>

          {/* Second Card */}

          <NavLink to={"/coming-soon"} className="bg-[#1e3a4a] rounded-[6px] h-fit overflow-hidden shadow-lg w-full transform transition-transform duration-300 hover:-translate-y-2 cursor-pointer">
            <div
              className="relative h-46 p-[3px]"
              style={{
                background:
                  "radial-gradient(circle at 100% 100%, var(--grey-500) 0, var(--grey-500) 6px, transparent 6px) 0% 0%/8px 8px no-repeat, radial-gradient(circle at 0 100%, var(--grey-500) 0, var(--grey-500) 6px, transparent 6px) 100% 0%/8px 8px no-repeat, radial-gradient(circle at 100% 0, var(--grey-500) 0, var(--grey-500) 6px, transparent 6px) 0% 100%/8px 8px no-repeat, radial-gradient(circle at 0 0, var(--grey-500) 0, var(--grey-500) 6px, transparent 6px) 100% 100%/8px 8px no-repeat, linear-gradient(var(--grey-500), var(--grey-500)) 50% 50%/calc(100% - 4px) calc(100% - 16px) no-repeat, linear-gradient(var(--grey-500), var(--grey-500)) 50% 50%/calc(100% - 16px) calc(100% - 4px) no-repeat, linear-gradient(var(--degrees), transparent var(--percentage), var(--border-color) 100%)",
              }}>
              <img
                src="/assets/landingpage/sport-section.png"
                alt="Explore Sports"
                className="w-full h-full object-cover rounded"
              />
            </div>
            <div className="p-2">
              <div className="flex mb-3 justify-between items-center">
                <span className="text-white font-semibold text-sm">Sports</span>
                <div className="flex items-center">
                  <span className="bg-green-500 h-2 w-2 rounded-full mr-2"></span>
                  <span className="text-white text-sm">{Math.floor(Math.random() * 5000) + 10000}</span>
                </div>
              </div>
            </div>
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
