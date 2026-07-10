import React from 'react'

export default function Preloader() {
  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'var(--primary-bg)' }}
    >
      <div className="flex flex-col items-center">
        {/* Logo with pulse animation */}
        <div className="relative mb-6">
          <img 
            src="/assets/logo.png" 
            alt="WagerGames Logo" 
            className="h-16 w-auto animate-pulse"
          />
       

        </div>

        {/* Loading dots */}
        {/* <div className="flex space-x-1 mt-3">
          <div 
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ 
              backgroundColor: 'var(--accent-purple)',
              animationDelay: '0ms'
            }}
          />
          <div 
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ 
              backgroundColor: 'var(--accent-purple)',
              animationDelay: '150ms'
            }}
          />
          <div 
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ 
              backgroundColor: 'var(--accent-purple)',
              animationDelay: '300ms'
            }}
          />
        </div> */}
      </div>
    </div>
  )
}
