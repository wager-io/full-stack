import { NavLink } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-[#0f212e] py-12 px-6 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-12 mb-12">
          
          {/* Logo and Company Info */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <img 
              src="https://res.cloudinary.com/dxwhz3r81/image/upload/v1714511848/Wager__wshh2r.png" 
              className='w-28 mb-6' 
              alt="Wager Logo" 
            />
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
              Your trusted destination for premium gaming experiences. 
              Play responsibly and enjoy world-class entertainment with 
              the most secure and fair platform in the industry.
            </p>
            <p className="text-gray-500 text-xs">
              © 2025 wagergames.casino | All Rights Reserved.
            </p>
          </div>

          {/* Support Links */}
          <div className="flex flex-col col-span-1">
            <h3 className="text-white font-semibold text-base mb-5">Support</h3>
            <div className="flex flex-col space-y-3">
              <NavLink to="/" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 w-fit">Help Center</NavLink>
              <NavLink to="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 w-fit">Fairness</NavLink>
              <NavLink to="/gamble/stake-smart" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 w-fit">Gambling Helpline</NavLink>
              <NavLink to="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 w-fit">Live Support</NavLink>
              <NavLink to="/policies/self-exclusion" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 w-fit">Self Exclusion</NavLink>
            </div>
          </div>

          {/* Legal & Policies */}
          <div className="flex flex-col col-span-1">
            <h3 className="text-white font-semibold text-base mb-5">Legal</h3>
            <div className="flex flex-col space-y-3">
              <NavLink to="/policies/terms" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 w-fit">Terms of Service</NavLink>
              <NavLink to="/policies/privacy" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 w-fit">Privacy Policy</NavLink>
              <NavLink to="/policies/anti-money-laundering" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 w-fit">AML Policy</NavLink>
              <NavLink to="/policies/cookies policy" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 w-fit">Cookies Policy</NavLink>
              <NavLink to="/policies/affilate-terms" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 w-fit">Affiliate Terms</NavLink>
            </div>
          </div>

          {/* Gaming & Sports */}
          <div className="flex flex-col col-span-2 sm:col-span-1 md:col-span-2 lg:col-span-1">
            <h3 className="text-white font-semibold text-base mb-5">Gaming</h3>
            <div className="flex flex-col space-y-3">
              <NavLink to="/casino/game/mines" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 w-fit">Mines</NavLink>
              <NavLink to="/casino/game/plinko" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 w-fit">PLinko</NavLink>
              <NavLink to="/casino/game/crash" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 w-fit">Crash</NavLink>
              <NavLink to="/gamble/responsible-gambling" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 w-fit">Responsible Gaming</NavLink>
              <NavLink to="/casino/game/hilo" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 w-fit">Hilo</NavLink>
            </div>
          </div>
        </div>

        {/* Horizontal Divider */}
        <div className="border-t border-gray-800 my-8"></div>
        
        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-2 text-gray-400 text-xs sm:text-sm">
            <NavLink to="/gamble/stake-smart" className="hover:text-white transition-colors">Responsible Gaming</NavLink>
            <NavLink to="/policies/terms" className="hover:text-white transition-colors">Terms of Service</NavLink>
            <NavLink to="/policies/privacy" className="hover:text-white transition-colors">Privacy Policy</NavLink>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="border border-gray-700 text-gray-400 px-3 py-1 rounded-md text-xs font-bold">
              18+
            </div>
            <p className="text-gray-500 text-xs sm:text-sm">Bet Responsibly.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;




