import React from 'react'
import { useMinesGame } from '../context/MinesContext'
import { formatDistanceToNow } from 'date-fns'

const MinesHistory = () => {
  const { gameHistory } = useMinesGame()
  
  if (gameHistory.length === 0) {
    return null
  }
  
  return (
    <div className="bg-gray-900 bg-opacity-80 rounded-[18px] shadow-lg shadow-gray-900/50 p-5">
      <h3 className="text-lg font-bold mb-4">Recent Games</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-800">
              <th className="text-left py-2 px-3">Player</th>
              <th className="text-left py-2 px-3">Bet</th>
              <th className="text-left py-2 px-3">Mines</th>
              <th className="text-left py-2 px-3">Revealed</th>
              <th className="text-left py-2 px-3">Multiplier</th>
              <th className="text-left py-2 px-3">Profit</th>
              <th className="text-left py-2 px-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {gameHistory.map((game, index) => (
              <tr key={index} className="border-b border-gray-800 hover:bg-gray-800">
                <td className="py-2 px-3">{game.player}</td>
                <td className="py-2 px-3">{game.betAmount.toFixed(2)} USDT</td>
                <td className="py-2 px-3">{game.minesCount}</td>
                <td className="py-2 px-3">{game.revealedCount}</td>
                <td className="py-2 px-3">{game.multiplier.toFixed(2)}x</td>
                <td className={`py-2 px-3 ${game.profit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {game.profit > 0 ? '+' : ''}{game.profit.toFixed(2)} USDT
                </td>
                <td className="py-2 px-3">
                  {game.createdAt ? formatDistanceToNow(new Date(game.createdAt), { addSuffix: true }) : 'Just now'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MinesHistory