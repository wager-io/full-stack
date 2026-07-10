import React from 'react'

export default function RaceLeaderBoard() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-[rgb(26,44,56)] rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-[rgb(15,33,46)] text-gray-300 text-xs">
            <th className="py-3 px-4 text-left">Rank</th>
            <th className="py-3 px-4 text-left">User</th>
            <th className="py-3 px-4 text-left">Wager</th>
            <th className="py-3 px-4 text-left">Prize</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgb(15,33,46)]">
          <tr className="text-gray-200 text-sm">
            <td colSpan="4" className="py-12 px-4 text-center">
              <div className="flex flex-col items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-12 w-12 text-gray-400 mb-3" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
                <p className="text-gray-400 font-medium">No data available yet</p>
                <p className="text-gray-500 text-xs mt-1">Race leaderboard will be updated soon</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
