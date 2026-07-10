import React from 'react'

export default function GameCard() {
  return (
      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <div 
          className="relative flex-1 h-42 md:h-42 lg:h-42 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
          style={{
            backgroundImage: 'url("/assets/casino/banner_plinko.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.boxShadow = '0 8px 24px var(--shadow-purple)'
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = 'none'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
          <div className="relative z-10 flex flex-col justify-center h-full p-6 md:p-8">
            <div 
              className="text-xs md:text-sm font-medium mb-2 uppercase tracking-wider"
              style={{ color: 'var(--accent-purple)' }}
            >
              Playing Now
            </div>
            
            <h2 
              className="text-lg md:text-xl lg:text-2xl font-bold mb-4 leading-tight"
              style={{ color: 'var(--text-light)' }}
            >
              Crash Game Live
            </h2>
            
            <button 
              className="w-fit px-6 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-400 font-semibold text-white transition-all duration-200 hover:scale-105"
              onMouseEnter={(e) => {
                e.target.style.boxShadow = '0 4px 16px var(--shadow-purple)'
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = 'none'
              }}
            >
              Play Crash
            </button>
          </div>
        </div>

        {/* Plinko Game Card */}
        <div 
          className="relative flex-1 h-42 md:h-42 lg:h-42 rounded-xl hidden md:block overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
          style={{
            backgroundImage: 'url("/assets/casino/banner_plinko.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.boxShadow = '0 8px 24px var(--shadow-purple)'
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = 'none'
          }}
        >
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
          
          {/* Content positioned on the left */}
          <div className="relative z-10 flex flex-col justify-center h-full p-6 md:p-8">
            <div 
              className="text-xs md:text-sm font-medium mb-2 uppercase tracking-wider"
              style={{ color: 'var(--accent-purple)' }}
            >
              Playing Now
            </div>
            
            <h2 
              className="text-lg md:text-xl lg:text-2xl font-bold mb-4 leading-tight"
              style={{ color: 'var(--text-light)' }}
            >
              Plinko Game
            </h2>
            
            <button 
              className="w-fit px-6 py-2.5  bg-blue-500 hover:bg-blue-400 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-105"
              onMouseEnter={(e) => {
                e.target.style.boxShadow = '0 4px 16px var(--shadow-purple)'
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = 'none'
              }}
            >
              Play Plinko
            </button>
          </div>
        </div>


      </div>

  )
}
