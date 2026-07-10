import React, { useEffect, useState } from 'react';
import { useHiloGame } from '../context/HiloContext';

const MyBets = () => {
  const { myBets, user } = useHiloGame();
  const [sortedBets, setSortedBets] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'time', direction: 'desc' });
  const [selectedBet, setSelectedBet] = useState(null);

  // Sort bets when myBets or sortConfig changes
  useEffect(() => {
    let sortableBets = [...myBets];
    
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
  }, [myBets, sortConfig]);

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

  // View bet details
  const viewBetDetails = (bet) => {
    setSelectedBet(bet);
  };

  // Close bet details modal
  const closeBetDetails = () => {
    setSelectedBet(null);
  };

  // Get card symbol based on suit
  const getCardSymbol = (suit) => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  };

  // Get card color based on suit
  const getCardColor = (suit) => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-gray-900';
  };

  return (
    <div className="my-bets">
      <h3 className="text-lg font-semibold mb-4 text-white">My Bets</h3>
      
      {sortedBets.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-700">
              <tr>
                <th 
                  className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('bet_id')}
                >
                  Bet ID {getSortDirectionIndicator('bet_id')}
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
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {sortedBets.map((bet) => (
                <tr key={bet.bet_id} className="hover:bg-gray-700">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    {bet.bet_id}
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
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <button
                      onClick={() => viewBetDetails(bet)}
                      className="text-blue-500 hover:text-blue-400 transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          You haven't placed any bets yet.
        </div>
      )}
      
      {/* Bet details modal */}
      {selectedBet && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Bet Details</h3>
                <button
                  onClick={closeBetDetails}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-700 p-3 rounded-lg">
                  <span className="block text-gray-400 text-sm">Bet ID</span>
                  <span className="text-white">{selectedBet.bet_id}</span>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <span className="block text-gray-400 text-sm">Time</span>
                  <span className="text-white">{formatDate(selectedBet.time)}</span>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <span className="block text-gray-400 text-sm">Bet Amount</span>
                  <div className="flex items-center">
                    <img src={selectedBet.token_img} alt={selectedBet.token} className="h-4 w-4 mr-1" />
                    <span className="text-white">{selectedBet.bet_amount} {selectedBet.token}</span>
                  </div>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <span className="block text-gray-400 text-sm">Final Payout</span>
                  <span className="text-white">{selectedBet.payout}x</span>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <span className="block text-gray-400 text-sm">Profit</span>
                  <span className={selectedBet.won ? 'text-green-500' : 'text-red-500'}>
                    {selectedBet.won ? '+' : '-'}{selectedBet.profit} {selectedBet.token}
                  </span>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <span className="block text-gray-400 text-sm">Result</span>
                  <span className={`font-bold ${selectedBet.won ? 'text-green-500' : 'text-red-500'}`}>
                    {selectedBet.won ? 'Win' : 'Loss'}
                  </span>
                </div>
              </div>
              
              {/* Game rounds */}
              {selectedBet.rounds && selectedBet.rounds.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-3 text-white">Game Rounds</h4>
                  <div className="space-y-4">
                    {selectedBet.rounds.map((round, index) => (
                      <div key={index} className="bg-gray-700 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-400">Round {index + 1}</span>
                          {round.skipped ? (
                            <span className="text-yellow-500">Skipped</span>
                          ) : round.hi ? (
                            <span className="text-blue-500">Higher</span>
                          ) : round.lo ? (
                            <span className="text-red-500">Lower</span>
                          ) : null}
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          {/* Card visualization */}
                          <div className="w-16 h-24 bg-white rounded-md flex flex-col justify-between p-2">
                            <div className={`text-sm font-bold ${getCardColor(round.cardSuite)}`}>
                              {round.cardRank}
                            </div>
                            <div className={`text-2xl font-bold self-center ${getCardColor(round.cardSuite)}`}>
                              {getCardSymbol(round.cardSuite)}
                            </div>
                            <div className={`text-sm font-bold self-end transform rotate-180 ${getCardColor(round.cardSuite)}`}>
                              {round.cardRank}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-gray-400">Higher Chance:</div>
                              <div className="text-white">{(round.hi_chance * 100).toFixed(2)}%</div>
                              <div className="text-gray-400">Lower Chance:</div>
                              <div className="text-white">{(round.lo_chance * 100).toFixed(2)}%</div>
                              {round.profit !== undefined && (
                                <>
                                  <div className="text-gray-400">Profit:</div>
                                  <div className={round.profit >= 0 ? 'text-green-500' : 'text-red-500'}>
                                    {round.profit >= 0 ? '+' : ''}{round.profit}
                                  </div>
                                </>
                              )}
                              {round.payout !== undefined && (
                                <>
                                  <div className="text-gray-400">Payout:</div>
                                  <div className="text-white">{round.payout}x</div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Seed verification */}
              {selectedBet.seed_id && (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold mb-2 text-white">Seed Verification</h4>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-gray-400">Seed ID:</div>
                      <div className="text-white col-span-3">{selectedBet.seed_id}</div>
                      <div className="text-gray-400">Server Seed:</div>
                      <div className="text-white col-span-3 break-all">
                        {selectedBet.server_seed || "Hidden until revealed"}
                      </div>
                      <div className="text-gray-400">Client Seed:</div>
                      <div className="text-white col-span-3 break-all">
                        {selectedBet.client_seed || "Not available"}
                      </div>
                      <div className="text-gray-400">Nonce:</div>
                      <div className="text-white col-span-3">{selectedBet.nonce || 0}</div>
                    </div>
                    <div className="mt-2">
                      <a 
                        href="#" 
                        className="text-blue-500 hover:text-blue-400 transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          // Open verification tool or show verification instructions
                        }}
                      >
                        Verify Fairness
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBets;