import React, { useState } from 'react'
import { useDiceGame } from './DiceContext'

const MultiplierView = () => {
  const { multiplier, winChance, mode, handleMultiplierChange, handleWinChanceChange, toggleMode } = useDiceGame()
  // Handle input changes
  const handleMultiplierInput = (e) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value) && value >= 1.0102 && value <= 9900) {
      handleMultiplierChange(value)
    }
  }
  
  const handleWinChanceInput = (e) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value) && value >= 0.01 && value <= 98) {
      handleWinChanceChange(value)
    }
  }
  
  const handleRollOverClick = () => {
    toggleMode()
  }

  return (
    <div className="footer flex  gap-4 mt-1 md:mt-4 p-5 rounded bg-gray-800">
      {/* Multiplier Input */}
      <div className="flex-1">
        <label className="block text-sm text-gray-400 mb-1">Multiplier</label>
        <div className="relative">
          <input
            type="number"
            className="w-full bg-gray-600 border border-gray-700 rounded px-4 py-2 text-white pr-10"
            min="1.0102"
            max="9900"
            value={multiplier}
            onChange={handleMultiplierInput}
            data-test="payout"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg fill="currentColor" viewBox="0 0 64 64" className="h-3 w-3 text-gray-400">
              <path d="M55.92 7.227H43.493L32 23.307 20.507 7.227H8.08L25.787 32 8.08 56.773h12.453L32 40.693l11.467 16.08H55.92L38.213 32z"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Roll Over/Under Button */}
      <div className="flex-1">
        <label className="block text-sm text-gray-400 mb-1">Roll {mode}</label>
        <button
          className="w-full bg-gray-600 border border-gray-700 rounded px-4 py-3 text-white flex justify-between items-center hover:bg-gray-700 transition-colors"
          onClick={handleRollOverClick}
          data-test="reverse-roll"
        >
          <span> {(mode ? 100 - winChance : winChance).toFixed(2)}</span>
          <svg fill="currentColor" viewBox="0 0 64 64" className="h-3 w-3 text-gray-400">
            <path fillRule="evenodd" d="M19.94 21.199a16 16 0 0 0-3.673 7.495h5.066L10.667 43.707 0 28.694h5.467A26.667 26.667 0 0 1 49.653 11.84l-6.986 8a16 16 0 0 0-22.728 1.358m33.394-.905L64 35.307h-5.334A26.667 26.667 0 0 1 14.481 52.16l6.986-8a16 16 0 0 0 26.267-8.853h-5.067z" clipRule="evenodd"></path>
          </svg>
        </button>
      </div>

      {/* Win Chance Input */}
      <div className="flex-1">
        <label className="block text-sm text-gray-400 mb-1">Win Chance</label>
        <div className="relative">
          <input
            type="number"
            className="w-full bg-gray-600 border border-gray-700 rounded px-4 py-2 text-white pr-10"
            min="0.01"
            max="98"
            value={winChance}
            onChange={handleWinChanceInput}
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
