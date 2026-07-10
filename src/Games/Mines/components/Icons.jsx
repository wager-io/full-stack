import React from 'react'

export const MineIcon = ({ opacity = 1 }) => {
  return (
    <div className="w-full h-full p-2" style={{ opacity }}>
      <img 
        src="/assets/games/mines/mines-3.webp" 
        alt="Mine" 
        className="w-full h-full object-contain"
      />
    </div>
  )
}

export const GemIcon = () => {
  return (
    <div className="w-full h-full p-2">
      <img 
        src="/assets/games/mines/gems.webp" 
        alt="Gem" 
        className="w-full h-full object-contain"
      />
    </div>
  )
}