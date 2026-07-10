import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination, Navigation } from 'swiper/modules';
import SportGames from './sections/SportGames';

//  SportHome (){
//   return (
//     <SportProvider>
//       <SportHomeContent />
//     </SportProvider>
//   )
// }

export default function  SportHomeContent() {
    const [activeTab, setActiveTab] = React.useState('lobby');

    const cards = [
      { id: 1, title: 'Daily Race', details: 'Play in our $100,000 daily race', image: 'https://cdn.sanity.io/images/tdrhge4k/production/d6c684c04d71800c5dfef6cee1f016c4f73670b3-1080x1080.jpg?w=440&h=440&fit=min&auto=format' },
      { id: 2, title: 'Daily Race', details: 'Play in our $100,000 daily race', image: 'https://cdn.sanity.io/images/tdrhge4k/production/3dd34f8ee9a83339e6032d6d5c0b84ff0d3c317a-1080x1080.png?w=440&h=440&fit=min&auto=format' },
      { id: 3, title: 'Daily Race', details: 'Play in our $100,000 daily race', image: 'https://cdn.sanity.io/images/tdrhge4k/production/d23c871f7d6dca758b43f93df13837d1482da473-1080x1080.png?w=440&h=440&fit=min&auto=format' },
      { id: 4, title: 'Daily Race', details: 'Play in our $100,000 daily race', image: 'https://cdn.sanity.io/images/tdrhge4k/production/35e2a0917aa17d58a38463bb91f7d8747aa56283-2160x2160.png?w=440&h=440&fit=min&auto=format' },
      { id: 5, title: 'Daily Race', details: 'Play in our $100,000 daily race', image: '/assets/home/r1.avif' },
    ];

  
  // Tab data
  const tabs = [
    {
      id: 'lobby',
      label: 'Lobby',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    },
    {
      id: 'live',
      label: 'Live Now',
      icon: 'M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z'
    },
    {
      id: 'upcoming',
      label: 'Upcoming',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      id: 'my-bets',
      label: 'My Bets',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
    }
  ];

  return (
    <div className="p-2 md:p-6 bg-background">

      <Swiper
        slidesPerView={3}
        spaceBetween={10}
        loop={true}
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
          640: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          1024: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          1240: {
            slidesPerView: 3,
            spaceBetween: 10,
          },
        }}
        modules={[Pagination, Navigation]}
        className="mySwiper"
      >
        {cards.map((card) => (
          <SwiperSlide key={card.id}>
            <div className="relative flex justify-between bg-[rgb(33,55,67)] gap-2 p-3 text-white shadow-lg rounded-lg h-[13rem]">
              <div className="flex flex-col justify-between">
                <div className="flex flex-col gap-2">
                  {/* Promo Badge */}
                  <div className="top-2 left-2 bg-white w-fit text-black text-xs font-bold px-2 py-1 rounded">
                    Promo
                  </div>
                  {/* Card Content */}
                  <div className="p-1">
                    <h2 className="text-xl font-bold">{card.title}</h2>
                    <p className="text-sm mt-2">{card.details}</p>
                  </div>
                </div>
                <div className="relative border p-2 hover:bg-[#1e3a4a] rounded border-white w-fit cursor-pointer">
                  <button className="text-white rounded">Play Now</button>
                </div>
              </div>

              {/* Card Image */}
              <div className="relative p-2 h-full">
                <img src={card.image} alt={card.title} className="h-full w-fit object-cover" />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      
      
      {/* Search Input */}
      <div className="mt-8 w-full">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search games, teams, leagues..." 
            className="w-full py-3 px-4 bg-[rgb(33,55,67)] text-white border-[3px] border-[rgb(33,55,67)] rounded-lg focus:outline-none focus:border-[#1e3a4a] transition-colors"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Tabs Navigation */}
      <div className="mt-8 mb-6 overflow-x-auto hide-scrollbar">
        <div className="bg-[#0f212e] rounded-full p-1 inline-flex min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-5 py-2 rounded-full transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#1e3a4a] text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              <span className="font-medium">{tab.label}</span>
              
              {/* Badge for My Bets */}
              {tab.id === 'my-bets' && (
                <span className="ml-2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  3
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sports Games Section */}
      <SportGames />
      
    </div>
  );
}

