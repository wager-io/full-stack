import React from 'react';

import { 
  FaFutbol, 
  FaBasketballBall, 
  FaBaseballBall, 
  FaHockeyPuck, 
  FaGolfBall,
  FaTwitter,
  FaFacebook,
  FaInstagram
} from 'react-icons/fa';

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-red-800 to-yellow-500 flex flex-col items-center justify-center p-4 text-white">
      {/* Top Sports Icons */}
      <div className="flex justify-center w-full mb-8">
        <FaFutbol className="text-4xl mx-3 animate-bounce" />
        <FaBasketballBall className="text-4xl mx-3 animate-spin" />
        <FaBaseballBall className="text-4xl mx-3 animate-pulse" />
        <FaHockeyPuck className="text-4xl mx-3" />
        <FaGolfBall className="text-4xl mx-3 animate-bounce" />
      </div>
      
      {/* Main Content */}
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl md:text-7xl font-bold mb-2 tracking-wider drop-shadow-lg">
          SPORTS BETTING
        </h1>
        <h2 className="text-3xl md:text-5xl font-bold mb-8 tracking-wide drop-shadow-lg">
          COMING SOON
        </h2>
        
        <p className="text-xl mb-8 max-w-lg mx-auto">
          We're working hard to bring you the ultimate sports betting experience.
          Stay tuned for our launch!
        </p>
        
        {/* Email Subscription */}
        <div className="flex flex-col sm:flex-row w-full max-w-md mx-auto mb-8">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="flex-grow px-4 py-3 placeholder:text-gray-50 rounded-t-lg sm:rounded-l-lg sm:rounded-r-none bg-gray-600 text-white focus:outline-none"
          />
          <button className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold px-6 py-3 rounded-b-lg sm:rounded-r-lg sm:rounded-l-none transition duration-300">
            Notify Me
          </button>
        </div>
        
      </div>
      
      {/* Bottom Sports Icons */}
      <div className="flex justify-center w-full mt-12">
        <FaFutbol className="text-4xl mx-3 animate-pulse" />
        <FaBasketballBall className="text-4xl mx-3 animate-bounce" />
        <FaBaseballBall className="text-4xl mx-3 animate-spin" />
        <FaHockeyPuck className="text-4xl mx-3 animate-pulse" />
        <FaGolfBall className="text-4xl mx-3" />
      </div>
    </div>
  );
}
