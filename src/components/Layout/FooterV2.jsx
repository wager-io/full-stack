import { useState } from 'react';

function Footer() {
  const [language, setLanguage] = useState('English');
  const [showLanguages, setShowLanguages] = useState(false);
  
  const languages = [
    'English',
    'Spanish',
    'French',
    'German',
    'Chinese',
    'Japanese',
    'Arabic'
  ];
  
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setShowLanguages(false);
  };

  return (
    <footer className="bg-grey-700 py-10 px-6 md:px-12">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 w-full">
        {/* Left side - Logo and copyright */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          {/* Logo and copyright in same row */}
          
          <div className="flex flex-col items-center md:items-start mb-4">
            {/* Logo SVG */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 396.11 197.92" 
              className="h-10 mb-4 text-white"
            >
               <g id="Layer_5" data-name="Layer 5">
                <path fill="currentColor" d="M25.68,56.89c-.1-26.47,16.84-41.15,47.94-41.26C96,15.55,100,30.19,100,35.51c0,10.19-14.42,21-14.42,21s.8,6.35,13.18,6.3,24.44-8.22,24.37-28.67C123.07,10.65,98.46-.09,74.13,0,53.78.07-.19,2.93,0,56.51c.18,47.59,90,51.79,90.07,82.26.12,33.09-37,42-49.56,42S22.84,171.88,22.82,167c-.09-26.8,26.58-34.26,26.58-34.26,0-2-1.56-10.91-11.89-10.87C10.9,121.92.3,144.8.38,167.14c.07,19,13.5,30.86,33.78,30.78,38.78-.14,82.51-19.06,82.35-61.08C116.37,97.54,25.79,87.28,25.68,56.89Z"></path>
                <path fill="currentColor" d="M395.37,162.18c-.31-.75-1.18-.57-2.33.38-4.4,3.63-14.46,13.91-38,14-42.92.16-50.37-70.58-50.37-70.58s32.71-24.42,37.82-34.27-11.15-12-11.15-12-22.88,27.84-39.1,36C294,83.6,306,56,306.69,40.13s-19.11-12-22.27-10.48c0,6.93-17.49,69.84-23.86,104.42-3.75,6-9.11,12.86-13.91,12.87-2.78,0-3.8-5.15-3.83-12.53,0-10.24,5.64-26.65,5.6-36.62,0-6.9-3.17-7.31-5.9-7.3-.59,0-3.87.09-4.47.09-7,0-4.7-6-11-5.94-19.28.07-43.84,21.12-44.91,52.89-6.51,4.31-15.62,9.74-20.27,9.76-4.88,0-6.09-4.51-6.1-8.41,0-6.85,11.08-47.55,11.08-47.55s14.11-3.62,20.27-4.81c4.66-.91,6-1.25,7.81-3.5s5.35-6.9,8.21-11.08.05-7.41-5.24-7.39c-6.94,0-25.51,4.4-25.51,4.4s8.92-38.46,8.91-39.24-1-1.19-2.51-1.18c-3.38,0-9.41,1.82-13.27,3.2-5.91,2.11-10.72,9.35-11.69,12.72s-7.65,29.76-7.65,29.76-35.77,12.35-40.66,14.2a.74.74,0,0,0-.5.7c0,.32,4.09,16,12.48,15.94,6,0,23.63-7.22,23.63-7.22s-9.06,36-9,48c0,7.7,3.63,16.72,18.67,16.67,14,0,26.25-7.23,33.11-12.26,3.75,9.49,12.61,12.09,18.66,12.07,13.56,0,24-10.82,25.34-12.27,1.76,4.16,5.91,12.15,15.39,12.12,5.36,0,10.91-6,15-11.82a23.38,23.38,0,0,0,.05,3.63c1.64,14.92,23.79,6.15,25,4.07.75-10.79.28-32.85,4.59-46.47,5.72,46.46,27.42,77.71,66.43,77.57,21.81-.08,33-6.35,37.63-11.52A15.9,15.9,0,0,0,395.37,162.18ZM208.2,146.86c-18.73.07,5.73-48.48,21.71-48.54C229.93,104.58,229.58,146.79,208.2,146.86Z"></path>
                <path fill="currentColor" d="M360.26,161.74c16.91-.06,30-11.19,32.4-14.81,3.1-4.71-3.6-11.82-5.73-11.7-5.34,5.11-10.92,11.29-23.45,11.33-14.75.06-11.41-16.17-11.41-16.17s28.39,3.67,39.8-16.74c3.65-6.53,3.8-15.56,2.33-19.45s-9.73-11.09-22.87-10c-16.14,1.36-36.48,18.19-40.95,38.4C326.79,138.86,333.58,161.84,360.26,161.74Zm18-68.1c2.66-.09,2.42,4.29,1.71,8.87-1,6.21-9.53,22-25.81,21.38C355.29,114.7,367.4,94,378.29,93.64Z"></path>
              </g>
            </svg>
            
            {/* Copyright text */}
            <p className="text-grey-300 text-sm">
              © 2025 wagergames.casino | All Rights Reserved.
            </p>
          </div>
        </div>
        
        {/* Right side - Social media icons */}
        <div className="flex items-center space-x-6">
          {/* Forum */}
          <a href="#" className="text-grey-300 hover:text-white transition-all transform hover:scale-110 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </a>
          
          {/* Facebook */}
          <a href="#" className="text-grey-300 hover:text-white transition-all transform hover:scale-110 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
            </svg>
          </a>
          
          {/* Twitter */}
          <a href="#" className="text-grey-300 hover:text-white transition-all transform hover:scale-110 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
            </svg>
          </a>
          
          {/* Instagram */}
          <a href="#" className="text-grey-300 hover:text-white transition-all transform hover:scale-110 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 6.5h11a1 1 0 011 1v11a1 1 0 01-1 1h-11a1 1 0 01-1-1v-11a1 1 0 011-1z" />
            </svg>
          </a>
          
          {/* YouTube */}
          <a href="#" className="text-grey-300 hover:text-white transition-all transform hover:scale-110 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </a>
        </div>
      </div>
      
      {/* Horizontal line */}
      <div className="border-t border-grey-600 my-8"></div>
      
      {/* Footer links section */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-x-8 gap-y-10">
        {/* Casino column */}
        <div className="flex flex-col">
          <h3 className="text-white font-semibold text-base mb-4">Casino</h3>
          <div className="flex flex-col space-y-2">
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Casino Games</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Slots</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Live Casino</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Roulette</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Blackjack</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Poker</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Providers</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Promos & Competitions</a>
          </div>
        </div>
        
        {/* Sports column */}
        <div className="flex flex-col">
          <h3 className="text-white font-semibold text-base mb-4">Sports</h3>
          <div className="flex flex-col space-y-2">
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Sportsbook</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Live Sports</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Soccer</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Basketball</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Tennis</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">eSports</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Bet Bonuses</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Sports Rules</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Racing Rules</a>
          </div>
        </div>

        {/* Support column */}
        <div className="flex flex-col">
          <h3 className="text-white font-semibold text-base mb-4">Support</h3>
          <div className="flex flex-col space-y-2">
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Help Center</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Fairness</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Gambling Helpline</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Live Support</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Self Exclusion</a>
          </div>
        </div>

        {/* About Us column */}
        <div className="flex flex-col">
          <h3 className="text-white font-semibold text-base mb-4">About Us</h3>
          <div className="flex flex-col space-y-2">
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">VIP Club</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Affiliate</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Privacy Policy</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">AML Policy</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Terms of Service</a>
          </div>
        </div>

        {/* Payment Info column */}
        <div className="flex flex-col">
          <h3 className="text-white font-semibold text-base mb-4">Payment Info</h3>
          <div className="flex flex-col space-y-2">
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Deposit & Withdrawals</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Currency Guide</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Crypto Guide</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Supported Crypto</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">How to Use the Vault</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">How Much to Bet With</a>
          </div>
        </div>

        {/* How-to Guides column */}
        <div className="flex flex-col">
          <h3 className="text-white font-semibold text-base mb-4">How-to Guides</h3>
          <div className="flex flex-col space-y-2">
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">How-to Guides</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Online Casino Guide</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">Sports Betting Guide</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">How to Live Stream Sports</a>
            <a href="#" className="text-grey-300 hover:text-white text-sm transition-colors w-fit">House Edge Guide</a>
          </div>
        </div>

        {/* Language column */}
        <div className="flex flex-col col-span-2 sm:col-span-1">
          <h3 className="text-white font-semibold text-base mb-4">Language</h3>
          <div className="relative">
            <button 
              className="flex items-center justify-between w-full max-w-[160px] bg-[#2f4553] hover:bg-[#3a5060] text-white text-sm py-2.5 px-4 rounded transition-colors"
              onClick={() => setShowLanguages(!showLanguages)}
            >
              <span>{language}</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-4 w-4 ml-2 transition-transform ${showLanguages ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showLanguages && (
              <div className="absolute bottom-full mb-1 left-0 bg-[#2f4553] rounded shadow-lg py-1 w-full max-w-[160px] z-50">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    className={`block w-full text-left px-3 py-2 text-sm ${
                      lang === language ? 'text-white bg-[#3a5060]' : 'text-grey-300 hover:bg-[#3a5060] hover:text-white'
                    }`}
                    onClick={() => handleLanguageChange(lang)}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom footer section with policies */}
      <div className="border-t border-grey-600 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <div className="text-grey-300 text-xs sm:text-sm">
          <p className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2">
            <span>Responsible Gaming</span>
            <span className="hidden sm:inline text-grey-500">|</span>
            <span>Terms of Service</span>
            <span className="hidden sm:inline text-grey-500">|</span>
            <span>Privacy Policy</span>
          </p>
        </div>
        <div className="text-grey-300 text-xs sm:text-sm flex items-center gap-4">
          <span className="border border-grey-500 px-2 py-0.5 rounded text-[10px] font-bold">18+</span>
          <p>Play Responsibly</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;




