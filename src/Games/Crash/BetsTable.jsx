import React from 'react';
import { useCrashGame } from './CrashContext';

const BetsTable = () => {
  // Get bets from the context instead of props
  const { bets } = useCrashGame();

  return (
    <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Current Bets</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2 px-4 text-left">Player</th>
              <th className="py-2 px-4 text-left">Bet Amount</th>
              <th className="py-2 px-4 text-left">Auto Cashout</th>
              <th className="py-2 px-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {bets.map((bet, index) => (
              <tr key={index} className="border-b border-gray-700">
                <td className="py-2 px-4">{bet.username}</td>
                <td className="py-2 px-4">${bet.amount}</td>
                <td className="py-2 px-4">{bet.autoCashout ? `${bet.autoCashout.toFixed(2)}x` : 'Manual'}</td>
                <td className="py-2 px-4">
                  {bet.status === 'active' ? (
                    <span className="text-blue-400">Active</span>
                  ) : bet.status === 'cashed_out' ? (
                    <span className="text-green-400">Cashed Out ({bet.cashoutMultiplier.toFixed(2)}x)</span>
                  ) : (
                    <span className="text-red-400">Lost</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BetsTable;