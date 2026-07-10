import React, { useEffect, useRef } from 'react'
import { useLimboGame } from './LimboContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function LimboHistory() {
  const { recentBets } = useLimboGame()
  const historyContainerRef = useRef(null)

  // console.log(recentBets)
  
  // Function to determine background color based on crash point
  const getBgColor = (isWon) => {
    return !isWon ? 'bg-gray-700' : 'bg-green-600'
  }

  // Function to determine text color based on crash point
  const getTextColor = (crashPoint) => {
    return crashPoint < 2.00 ? 'text-white' : 'text-white'
  }
  
  // Keep only the most recent history items (limited to last 10)
  const recentHistory = [...recentBets].slice(-11).reverse()
  
  // Scroll to the end whenever history changes
  useEffect(() => {
    if (historyContainerRef.current) {
      historyContainerRef.current.scrollLeft = historyContainerRef.current.scrollWidth
    }
  }, [recentBets])

  return (
    <div className="w-full p-4 rounded-lg">
      <div 
        ref={historyContainerRef}
        className="w-full flex  space-x-2 justify-end"
      >
        {recentHistory.length === 0 ? (
          <div className="text-gray-400 w-full h-6 flex items-center justify-center text-center italic">No game history available yet</div>
        ) : (
          <AnimatePresence initial={false}>
            {recentHistory.map((game, index) => (
              
              <motion.div 
                key={game.id || index}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex-shrink-0 flex items-center justify-center ${getBgColor(game.won)} ${getTextColor(game.roll)} 
                          font-medium py-2 px-3 rounded-[30px] min-w-[70px] transition-all duration-200 hover:opacity-90`}
              >
                {game.roll.toFixed(2)}x
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}