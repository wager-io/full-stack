import React, { useEffect, useState } from 'react';
import { useCrashGame } from '../CrashContext';

const RecentWinsTable = () => {
  const { bets, gameState } = useCrashGame();
  const [allBets, setAllBets] = useState([]);

  // Process all bets, not just wins
  useEffect(() => {
    // console.log(bets)
    // Map all bets to display format, including active bets
    const processedBets = bets.map(bet => ({
      userId: bet.userId,
      username: bet.username,
      avatar: bet.avatar || '/assets/avatars/default.png',
      status: bet.status, // 'active' or 'cashed_out'
      payout: bet.status === 'cashed_out' ? `${bet.cashoutMultiplier.toFixed(2)}x` :  'betting...',
      winAmount: bet.status === 'cashed_out' ? bet.amount * bet.cashoutMultiplier - bet.amount : 0,
      betAmount: bet.amount,
      timestamp: new Date().getTime() // We could use a timestamp from the bet if available
    }))
    .sort((a, b) => {
      // Sort by status first (cashed_out first), then by timestamp
      if (a.status === 'cashed_out' && b.status !== 'cashed_out') return -1;
      if (a.status !== 'cashed_out' && b.status === 'cashed_out') return 1;
      return b.timestamp - a.timestamp;
    });

    setAllBets(processedBets);
  }, [bets, gameState]);

  return (
    <div className="mt-4 h-[200px] overflow-y-auto bg-gray-800 bg-opacity-50 rounded">
      <table className="w-full text-sm">
        <thead className="bg-gray-700 bg-opacity-50 sticky top-0">
          <tr>
            <th className="py-2 px-3 text-left font-medium text-gray-300">Player</th>
            <th className="py-2 px-3 text-center font-medium text-gray-300">Payout</th>
            <th className="py-2 px-3 text-right font-medium text-gray-300">Amount</th>
          </tr>
        </thead>
        <tbody>
          {allBets.length === 0 ? (
            <tr>
              <td colSpan="3" className="py-4 text-center text-gray-400">
                No bets in current game yet
              </td>
            </tr>
          ) : (
            allBets.map((bet, index) => (
              <tr 
                key={bet.userId + index} 
                className={`border-b border-gray-700 last:border-0 hover:bg-gray-700 hover:bg-opacity-30 transition-colors ${
                  bet.status === 'active' ? 'text-gray-400' : ''
                }`}
              >
                <td className="py-2 px-3 text-left">
                  <div className="flex items-center">
                    <span className="truncate max-w-[80px]">{bet.username}</span>
                  </div>
                </td>
                <td className={`py-2 px-3 text-center font-medium ${
                  bet.status === 'cashed_out' ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {bet.payout}
                </td>
                <td className="py-2 px-3 text-right">
                  <div className="flex items-center justify-end">
                    <img 
                      src="/assets/token/usdt.png" 
                      alt="USDT" 
                      className="w-4 h-4 mr-1" 
                    />
                    {bet.status === 'cashed_out' ? (
                      <span className="text-green-400">{parseFloat(bet.winAmount).toFixed(4)}</span>
                    ) : (
                      <span>{parseFloat(bet.betAmount).toFixed(4)}</span>
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

export default RecentWinsTable;