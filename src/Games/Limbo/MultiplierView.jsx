import React, { useState } from 'react'
import { useLimboGame } from './LimboContext'

const MultiplierView = () => {
  const { 
    multiplier, 
    winChance, 
    mode, 
    handleMultiplierChange, 
    handleWinChanceChange 
  } = useLimboGame()
  
  const [multiplierError, setMultiplierError] = useState(false)
  
  // Handle multiplier input change
  const onMultiplierChange = (e) => {
    const value = e.target.value
    
    // Check for error state
    if (value !== '' && parseFloat(value) < 1.01) {
      setMultiplierError(true)
    } else {
      setMultiplierError(false)
    }
    
    // Update the value
    handleMultiplierChange(value)
  }
  
  // Handle win chance input change
  const onWinChanceChange = (e) => {
    const value = e.target.value
    handleWinChanceChange(value)
  }
  
  return (
    <div className="footer flex  gap-4 mt-4 p-5 rounded bg-gray-800">
      {/* Multiplier Input */}
      <div className="flex-1">
        <label className="block text-sm text-gray-400 mb-1">Target Multiplier</label>
        {multiplierError && (
          <div className="text-red-500 text-xs mb-1">Minimum of 1.01x</div>
        )}
        <div className="relative">
          <input
            type="text"
            className={`w-full bg-gray-600 border ${multiplierError ? 'border-red-500' : 'border-gray-700'} rounded px-4 py-2 text-white pr-10`}
            value={multiplier}
            onChange={onMultiplierChange}
            data-test="payout"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg fill="currentColor" viewBox="0 0 64 64" className="h-3 w-3 text-gray-400">
              <path d="M55.92 7.227H43.493L32 23.307 20.507 7.227H8.08L25.787 32 8.08 56.773h12.453L32 40.693l11.467 16.08H55.92L38.213 32z"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Win Chance Input */}
      <div className="flex-1">
        <label className="block text-sm text-gray-400 mb-1">Win Chance</label>
        <div className="relative">
          <input
            type="text" 
            className="w-full bg-gray-600 border border-gray-700 rounded px-4 py-2 text-white pr-10"
            value={winChance}
            onChange={onWinChanceChange}
            data-test="chance"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg fill="currentColor" viewBox="0 0 64 64" className="h-3 w-3 text-gray-400">
              <path d="M18.38 29.904c6.364 0 11.524-5.16 11.524-11.524S24.744 6.856 18.38 6.856 6.855 12.016 6.855 18.38s5.16 11.524 11.525 11.524m0-14.666a3.142 3.142 0 1 1-.001 6.285 3.142 3.142 0 0 1 0-6.285M45.62 34.096c-6.364 0-11.524 5.16-11.524 11.524s5.16 11.524 11.524 11.524 11.524-5.16 11.524-11.524-5.16-11.524-11.524-11.524m0 14.666a3.142 3.142 0 1 1 0-6.285 3.142 3.142 0 0 1 0 6.285m.585-41.904L6.857 57.144h10.644L56.85 6.858z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MultiplierView