import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

function InhouseGames() {
  const navigate = useNavigate();

  const trendingGames = [
    {
      id: 1,
      title: "Crash",
      provider: "NetEnt",
      image: "/assets/InhouseGames/crash-game.png",
      players: 1243,
      path: "crash"
    },
    {
      id: 2,
      title: "Mines",
      provider: "Play'n GO",
      image: "/assets/InhouseGames/mine.png",
      players: 987,
      path: "mines"
    },
    {
      id: 3,
      title: "Dice",
      provider: "NetEnt",
      image: "/assets/InhouseGames/diceGame.png",
      players: 1567,
      path: "dice"
    },
    {
      id: 4,
      title: "Plinko",
      provider: "NetEnt",
      image: "/assets/InhouseGames/plinko.png",
      players: 876,
      path: "plinko"
    },
    {
      id: 5,
      title: "Limbo",
      provider: "Pragmatic Play",
      image: "/assets/InhouseGames/limboGame.png",
      players: 1432,
      path: "limbo"
    },
    {
      id: 6,
      title: "Hilo",
      provider: "Pragmatic Play",
       image: "/assets/InhouseGames/hiloGAMES.png",
      players: 1432,
      path: "hilo"
    },
    // {
    //   id: 7,
    //   title: "Keno",
    //   provider: "Pragmatic Play",
    //    image: "/assets/InhouseGames/keno.png",
    //   players: 1432,
    //   path: "keno"
    // }
   ]

  const swiperRef = useRef(null);
  
  const handlePrev = () => {
    if (swiperRef.current) {
      const visibleSlides = swiperRef.current.params.slidesPerView;
      swiperRef.current.slideTo(swiperRef.current.activeIndex - visibleSlides);
    }
  };

  const handleNext = () => {
    if (swiperRef.current) {
      const visibleSlides = swiperRef.current.params.slidesPerView;
      swiperRef.current.slideTo(swiperRef.current.activeIndex + visibleSlides);
    }
  };

  const handleGameClick = (gamePath) => {
    navigate(`/casino/game/${gamePath}`);
  }

  return (
    <div className="py-5 bg-[var(--card-bg-10)]">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-0">
          <div className="flex items-center">
          <svg fill="currentColor" viewBox="0 0 96 96" className="svg-icon w-4 h-4 mr-2" > <title></title> <g fillRule="evenodd" clipRule="evenodd"><path d="M86.68 76.32a48.2 48.2 0 0 0 7.96-17.16c-5.64.88-10.88 3-15.4 6.12 2.64 3.56 5.12 7.28 7.44 11.04m-23.56 17.2c6.84-2.28 12.96-6.04 18.04-10.88-2.48-4.16-5.12-8.24-8-12.12-5.72 6.12-9.44 14.12-10 23zm8.72-76.96c0 11.04-3.6 21.24-9.68 29.56 4.28 4.08 8.32 8.36 12.08 12.92 6.24-4.4 13.6-7.24 21.6-8.04.08-1 .16-1.96.16-3 0-18.32-10.28-34.24-25.36-42.32.76 3.52 1.2 7.16 1.2 10.88m-58.32-1.88c15.68 6.36 30.12 15.16 42.72 26.04 4.8-6.84 7.6-15.16 7.6-24.16 0-5.16-.96-10.12-2.68-14.68C56.96.68 52.56 0 48 0 34.44 0 22.24 5.64 13.52 14.68m8 52.24c-6.76 0-13.16-1.36-19.04-3.76C8.84 82.24 26.8 96.04 48 96.04c2.4 0 4.72-.24 7.04-.56.16-12.16 5.12-23.2 13.12-31.28-3.48-4.2-7.2-8.16-11.12-11.92-9.12 9.08-21.64 14.68-35.48 14.68z"></path><path d="M51.08 46.84A145.9 145.9 0 0 0 8.24 21.16C3.04 28.8 0 38.04 0 48c0 1.72.12 3.44.28 5.12 6.24 3.64 13.48 5.76 21.24 5.76 11.48 0 21.92-4.6 29.56-12.08z"></path></g></svg>
            <h2 className="text-[15px] font-bold text-white">In House Games</h2>
          </div> 
          <div className="flex border rounded-[30px] px-2 border-[var(--text-color)] overflow-hidden">
            <button 
              onClick={handlePrev}
              className="flex items-center justify-center cursor-pointer rounded-[30px] p-2 text-[var(--text-color)] transition-colors rounded-r-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-px bg-[var(--text-color)]/30"></div>
            <button 
              onClick={handleNext}
              className="flex items-center justify-center rounded-[30px] cursor-pointer p-2 text-[var(--text-color)] transition-colors rounded-l-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        <div className="w-full h-[240px] mb-6">
          <Swiper
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            spaceBetween={16}
            slidesPerView={5}
            slidesPerGroup={5}
            breakpoints={{
              320: {
                slidesPerView: 2,
                slidesPerGroup: 2,
                spaceBetween: 10,
              },
              640: {
                slidesPerView: 3,
                slidesPerGroup: 3,
                spaceBetween: 12,
              },
              768: {
                slidesPerView: 4,
                slidesPerGroup: 4,
                spaceBetween: 14,
              },
              1024: {
                slidesPerView: 5,
                slidesPerGroup: 5,
                spaceBetween: 16,
              },
            }}
            className="h-full"
          >
            {trendingGames.map(game => (
              <SwiperSlide key={game.id} className="!w-auto">
                <div 
                  className="h-full flex flex-col items-center justify-center transform transition-transform duration-400 hover:-translate-y-2 cursor-pointer"
                  onClick={() => handleGameClick(game.path)}
                >
                  <div>
                    <img 
                      src={game.image} 
                      alt={game.title} 
                      className="w-[150px] h-[200px] object-cover rounded-[12px]"
                    />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}

export default InhouseGames;