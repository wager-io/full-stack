import React from 'react';
import { EmojiEvents, SportsEsports } from '@mui/icons-material';

export default function TopGameWinners({ winners }) {
  return (
    <div 
      className="rounded-xl p-6 mb-8"
      style={{
        background: 'linear-gradient(145deg, var(--secondary-bg), #1a1d3a)',
        border: '1px solid var(--border-color)',
        boxShadow: `
          0 15px 35px rgba(0, 0, 0, 0.3),
          0 5px 15px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.08)
        `
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <EmojiEvents style={{ color: '#ffd700', fontSize: '28px' }} />
        <h3 
          className="text-xl font-semibold"
          style={{ 
            color: 'var(--text-light)',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
          }}
        >
          Top Game Winners
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr 
              className="border-b-2" 
              style={{ borderColor: 'var(--accent-purple)' }}
            >
              <th 
                className="text-left py-4 px-4 text-sm font-semibold"
                style={{ color: 'var(--text-light)' }}
              >
                Rank
              </th>
              <th 
                className="text-left py-4 px-4 text-sm font-semibold"
                style={{ color: 'var(--text-light)' }}
              >
                Game ID
              </th>
              <th 
                className="text-left py-4 px-4 text-sm font-semibold"
                style={{ color: 'var(--text-light)' }}
              >
                Game Name
              </th>
              <th 
                className="text-left py-4 px-4 text-sm font-semibold"
                style={{ color: 'var(--text-light)' }}
              >
                Player Name
              </th>
              <th 
                className="text-left py-4 px-4 text-sm font-semibold"
                style={{ color: 'var(--text-light)' }}
              >
                Bet Amount
              </th>
              <th 
                className="text-left py-4 px-4 text-sm font-semibold"
                style={{ color: 'var(--text-light)' }}
              >
                Payout
              </th>
              <th 
                className="text-left py-4 px-4 text-sm font-semibold"
                style={{ color: 'var(--text-light)' }}
              >
                Multiplier
              </th>
            </tr>
          </thead>
          <tbody>
            {winners.map((winner, index) => {
              const multiplier = (winner.payout / winner.betAmount).toFixed(2);
              const rankColors = ['#ffd700', '#c0c0c0', '#cd7f32']; // Gold, Silver, Bronze
              
              return (
                <tr 
                  key={index}
                  className="border-b transition-all duration-200 hover:bg-opacity-50"
                  style={{ 
                    borderColor: 'var(--border-color)',
                    backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                  }}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {index < 3 ? (
                        <EmojiEvents style={{ color: rankColors[index], fontSize: '20px' }} />
                      ) : (
                        <span 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ 
                            backgroundColor: 'var(--accent-purple)', 
                            color: 'white' 
                          }}
                        >
                          {index + 1}
                        </span>
                      )}
                    </div>
                  </td>
                  <td 
                    className="py-4 px-4 text-sm font-mono"
                    style={{ color: 'var(--text-dark)' }}
                  >
                    {winner.gameId}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <SportsEsports style={{ color: 'var(--accent-purple)', fontSize: '16px' }} />
                      <span 
                        className="text-sm font-medium"
                        style={{ color: 'var(--text-light)' }}
                      >
                        {winner.gameName}
                      </span>
                    </div>
                  </td>
                  <td 
                    className="py-4 px-4 text-sm font-medium"
                    style={{ color: 'var(--text-light)' }}
                  >
                    {winner.playerName}
                  </td>
                  <td 
                    className="py-4 px-4 text-sm"
                    style={{ color: 'var(--text-light)' }}
                  >
                    ${winner.betAmount.toLocaleString()}
                  </td>
                  <td 
                    className="py-4 px-4 text-sm font-bold"
                    style={{ color: 'var(--success-green)' }}
                  >
                    ${winner.payout.toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{
                        background: multiplier >= 10 
                          ? 'linear-gradient(45deg, #ffd700, #ffed4e)' 
                          : multiplier >= 5 
                          ? 'linear-gradient(45deg, var(--success-green), #4ade80)' 
                          : 'linear-gradient(45deg, var(--accent-purple), #a855f7)',
                        color: 'white',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)'
                      }}
                    >
                      {multiplier}x
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
