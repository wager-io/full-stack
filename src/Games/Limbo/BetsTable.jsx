import React from 'react';
import { useLimboGame } from './LimboContext';
import { FaArrowUp, FaArrowDown, FaUser, FaCheck, FaTimes } from 'react-icons/fa';

const BetsTable = () => {
  const { recentBets } = useLimboGame();

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full overflow-x-auto">
      <h3 className="text-xl font-bold mb-4">Recent Bets</h3>
      <table className="min-w-full bg-gray-800 bg-opacity-50 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-700 text-left">
            <th className="py-3 px-4 text-sm font-medium text-gray-300">Player</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-300">Time</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-300">Bet</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-300">Target</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-300">Roll</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-300">Multiplier</th>
            <th className="py-3 px-4 text-sm font-medium text-gray-300">Payout</th>
          </tr>
        </thead>
        <tbody>
          {recentBets.length === 0 ? (
            <tr>
              <td colSpan="7" className="py-4 px-4 text-center text-gray-400">
                No recent bets
              </td>
            </tr>
          ) : (
            recentBets.map((bet) => (
              <tr key={bet.betId} className="border-t border-gray-700 hover:bg-gray-700">
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    {bet.hidden ? (
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center mr-2">
                        <FaUser className="text-gray-400" />
                      </div>
                    ) : (
                      <img 
                        src={bet.avatar || '/assets/default-avatar.png'} 
                        alt="Avatar" 
                        className="w-8 h-8 rounded-full mr-2 object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/assets/default-avatar.png';
                        }}
                      />
                    )}
                    <span className="text-white">{bet.hidden ? 'Hidden' : bet.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-300">
                  {formatTime(bet.betTime)}
                </td>
                <td className="py-3 px-4 text-white font-medium">
                  {bet.betAmount} {bet.currencyName}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <span className={`mr-1 ${bet.mode === 'over' ? 'text-blue-400' : 'text-purple-400'}`}>
                      {bet.mode === 'over' ? <FaArrowUp /> : <FaArrowDown />}
                    </span>
                    <span className="text-white">{bet.target}</span>
                  </div>
                </td>
                <td className="py-3 px-4 font-medium">
                  <span className={bet.won ? 'text-green-400' : 'text-red-400'}>
                    {bet.roll.toFixed(2)}
                  </span>
                </td>
                <td className="py-3 px-4 text-white">
                  {bet.multiplier}x
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    {bet.won ? (
                      <>
                        <FaCheck className="text-green-400 mr-1" />
                        <span className="text-green-400 font-medium">
                          +{bet.winAmount.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <>
                        <FaTimes className="text-red-400 mr-1" />
                        <span className="text-red-400 font-medium">
                          -{bet.betAmount}
                        </span>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BetsTable;