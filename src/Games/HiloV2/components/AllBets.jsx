import React, { useEffect, useState } from 'react';
import { useHiloGame } from '../context/HiloContext';

const AllBets = () => {
  const { allBets } = useHiloGame();
  const [sortedBets, setSortedBets] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'time', direction: 'desc' });

  // Sort bets when allBets or sortConfig changes
  useEffect(() => {
    let sortableBets = [...allBets];
    
    if (sortConfig.key) {
      sortableBets.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setSortedBets(sortableBets);
  }, [allBets, sortConfig]);

  // Request sort
  const requestSort = (key) => {
    let direction = 'asc';
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  // Get sort direction indicator
  const getSortDirectionIndicator = (key) => {
    if (sortConfig.key !== key) {
      return null;
    }
    
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="all-bets">
      <h3 className="text-lg font-semibold mb-4 text-white">All Bets</h3>
      
      {sortedBets.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-700">
              <tr>
                <th 
                  className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('user_id')}
                >
                  Player {getSortDirectionIndicator('user_id')}
                </th>
                <th 
                  className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('bet_amount')}
                >
                  Bet {getSortDirectionIndicator('bet_amount')}
                </th>
                <th 
                  className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('payout')}
                >
                  Payout {getSortDirectionIndicator('payout')}
                </th>
                <th 
                  className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('profit')}
                >
                  Profit {getSortDirectionIndicator('profit')}
                </th>
                <th 
                  className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('time')}
                >
                  Time {getSortDirectionIndicator('time')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {sortedBets.map((bet) => (
                <tr key={bet.bet_id} className="hover:bg-gray-700">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center text-white">
                        {bet.user_id.substring(0, 2)}
                      </div>
                      <div className="ml-2 text-sm text-gray-300">
                        {bet.user_id.substring(0, 8)}...
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <img src={bet.token_img} alt={bet.token} className="h-4 w-4 mr-1" />
                      <span className="text-sm text-gray-300">{bet.bet_amount}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    {bet.payout}x
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm ${bet.won ? 'text-green-500' : 'text-red-500'}`}>
                    {bet.won ? '+' : '-'}{bet.profit}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(bet.time)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          No bets have been placed yet.
        </div>
      )}
    </div>
  );
};

export default AllBets;