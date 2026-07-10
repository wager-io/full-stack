import React from 'react';
import { Visibility } from '@mui/icons-material';

export default function TopUsersTable({ users }) {
  return (
    <div 
      className="rounded-xl p-6"
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
      <h3 
        className="text-xl font-semibold mb-6"
        style={{ 
          color: 'var(--text-light)',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
        }}
      >
        Top 15 Users by Balance
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr 
              className="border-b-2" 
              style={{ borderColor: 'var(--accent-purple)' }}
            >
              <th 
                className="text-left py-4 px-3 text-sm font-semibold"
                style={{ color: 'var(--text-light)' }}
              >
                #
              </th>
              <th 
                className="text-left py-4 px-3 text-sm font-semibold"
                style={{ color: 'var(--text-light)' }}
              >
                User ID
              </th>
              <th 
                className="text-left py-4 px-3 text-sm font-semibold"
                style={{ color: 'var(--text-light)' }}
              >
                Username
              </th>
              <th 
                className="text-left py-4 px-3 text-sm font-semibold"
                style={{ color: 'var(--text-light)' }}
              >
                Country
              </th>
              <th 
                className="text-left py-4 px-3 text-sm font-semibold"
                style={{ color: 'var(--text-light)' }}
              >
                Balance
              </th>
              <th 
                className="text-center py-4 px-3 text-sm font-semibold"
                style={{ color: 'var(--text-light)' }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr 
                key={user.id} 
                className="border-b transition-all duration-200 hover:bg-opacity-50"
                style={{ 
                  borderColor: 'var(--border-color)',
                  backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                }}
              >
                <td 
                  className="py-4 px-3 text-sm font-medium"
                  style={{ color: 'var(--accent-purple)' }}
                >
                  {index + 1}
                </td>
                <td 
                  className="py-4 px-3 text-sm font-mono"
                  style={{ color: 'var(--text-dark)' }}
                >
                  {user.id}
                </td>
                <td 
                  className="py-4 px-3 text-sm font-medium"
                  style={{ color: 'var(--text-light)' }}
                >
                  {user.username}
                </td>
                <td 
                  className="py-4 px-3 text-sm"
                  style={{ color: 'var(--text-light)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{user.flag}</span>
                    <span>{user.country}</span>
                  </div>
                </td>
                <td 
                  className="py-4 px-3 text-sm font-bold"
                  style={{ color: 'var(--success-green)' }}
                >
                  ${user.balance.toLocaleString()}
                </td>
                <td className="py-4 px-3 text-center">
                  <button 
                    className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                    style={{ 
                      color: 'var(--accent-purple)',
                      background: 'rgba(106, 13, 173, 0.1)',
                      border: '1px solid var(--accent-purple)'
                    }}
                    title="View User Details"
                  >
                    <Visibility fontSize="small" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
