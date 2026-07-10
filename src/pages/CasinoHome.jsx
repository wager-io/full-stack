import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination, Navigation } from 'swiper/modules'; // Corrected import path
import InhouseGames from './sections/InHouseGames';
import BetsLogSection from './sections/BetsLogSection';
import GameCard from './sections/GameCard';
import RecentWins from './sections/RecentWins';


function CasinoHome() {
  const cards = [
    { id: 1, title: 'Daily Race', details: 'Play in our $100,000 daily race', image: '/assets/home/r1.avif' },
    { id: 2, title: 'Daily Race', details: 'Play in our $100,000 daily race', image: '/assets/home/r2.avif' },
    { id: 3, title: 'Daily Race', details: 'Play in our $100,000 daily race', image: '/assets/home/r1.avif' },
    { id: 4, title: 'Daily Race', details: 'Play in our $100,000 daily race', image: '/assets/home/r1.avif' },
    { id: 5, title: 'Daily Race', details: 'Play in our $100,000 daily race', image: '/assets/home/r1.avif' },
    { id: 6, title: 'Daily Race', details: 'Play in our $100,000 daily race', image: '/assets/home/r1.avif' },
    { id: 7, title: 'Daily Race', details: 'Play in our $100,000 daily race', image: '/assets/home/r1.avif' },
    { id: 8, title: 'Daily Race', details: 'Play in our $100,000 daily race', image: '/assets/home/r1.avif' },
  ];

  return (
    <div className="p-2 md:p-6">
      <GameCard />
      
      {/* Custom Pagination */}
      <div className="custom-pagination flex justify-center mt-4"></div>

      <RecentWins />
      
      {/* Full-width Search Input */}
      <div className="mt-8 w-full">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search games..." 
            className="w-full py-3 px-4 bg-[rgb(33,55,67)] text-white border-[3px] border-[rgb(33,55,67)] rounded-lg focus:outline-none focus:border-[#1e3a4a] transition-colors"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
        {/* Trending Games Section */}
        <InhouseGames />

        <BetsLogSection />

    </div>
  );
}

export default CasinoHome;
