import React, { useState } from 'react';
import { Visibility, Search } from '@mui/icons-material';

export default function WithdrawalsTable() {
  const [searchTerm, setSearchTerm] = useState('');

  // Sample withdrawals data
  const [withdrawals] = useState([
    { 
      transactionId: 'TXN-WTH-001', 
      transactionHash: '0x8f7e6d5c4b3a2918f7e6d5c4b3a2918f7e6d5c4b', 
      amount: 2500, 
      balance: 42500, 
      status: 'Completed', 
      date: '2024-01-15 16:22:15' 
    },
    { 
      transactionId: 'TXN-WTH-002', 
      transactionHash: '0x2918f7e6d5c4b3a2918f7e6d5c4b3a2918f7e6d5c', 
      amount: 5000, 
      balance: 40000, 
      status: 'Pending', 
      date: '2024-01-15 14:10:33' 
    },
    { 
      transactionId: 'TXN-WTH-003', 
      transactionHash: '0x3a2918f7e6d5c4b3a2918f7e6d5c4b3a2918f7e6d', 
      amount: 1800, 
      balance: 45000, 
      status: 'Processing', 
      date: '2024-01-14 11:45:20' 
    },
    { 
      transactionId: 'TXN-WTH-004', 
      transactionHash: '0x4b3a2918f7e6d5c4b3a2918f7e6d5c4b3a2918f7e', 
      amount: 3200, 
      balance: 46800, 
      status: 'Failed', 
      date: '2024-01-14 09:15:44' 
    },
    { 
      transactionId: 'TXN-WTH-005', 
      transactionHash: '0x5c4b3a2918f7e6d5c4b3a2918f7e6d5c4b3a2918f', 
      amount: 750, 
      balance: 50000, 
      status: 'Completed', 
      date: '2024-01-13 20:30:12' 
    },
  ]);

  const filteredWithdrawals = withdrawals.filter(withdrawal =>
    withdrawal.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const truncateHash = (hash) => {
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return { color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e' };
      case 'Pending':
        return { color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b' };
      case 'Processing':
        return { color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6' };
      case 'Failed':
        return { color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444' };
      default:
        return { color: 'var(--text-dark)', background: 'rgba(148, 163, 184, 0.1)', border: '1px solid var(--text-dark)' };
    }
  };

  return (
    <div>
      {/* Search Input */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search style={{ color: 'var(--text-dark)', fontSize: '20px' }} />
          </div>
          <input
            type="text"
            placeholder="Search by Transaction ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{
              background: 'linear-gradient(145deg, #1a1d2e, #15182a)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-light)',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr 
              className="border-b-2" 
              style={{ borderColor: 'var(--accent-purple)' }}
            >
              <th className="text-left py-4 px-4 text-sm font-semibold" style={{ color: 'var(--text-light)' }}>
                Transaction ID
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold" style={{ color: 'var(--text-light)' }}>
                Transaction Hash
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold" style={{ color: 'var(--text-light)' }}>
                Amount
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold" style={{ color: 'var(--text-light)' }}>
                Balance After
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold" style={{ color: 'var(--text-light)' }}>
                Status
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold" style={{ color: 'var(--text-light)' }}>
                Date
              </th>
              <th className="text-center py-4 px-4 text-sm font-semibold" style={{ color: 'var(--text-light)' }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredWithdrawals.length > 0 ? (
              filteredWithdrawals.map((withdrawal, index) => (
                <tr 
                  key={withdrawal.transactionId} 
                  className="border-b transition-all duration-200 hover:bg-opacity-50"
                  style={{ 
                    borderColor: 'var(--border-color)',
                    backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                  }}
                >
                  <td className="py-4 px-4 text-sm font-mono" style={{ color: 'var(--accent-purple)' }}>
                    {withdrawal.transactionId}
                  </td>
                  <td className="py-4 px-4 text-sm font-mono" style={{ color: 'var(--text-light)' }}>
                    <span title={withdrawal.transactionHash}>
                      {truncateHash(withdrawal.transactionHash)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm font-bold" style={{ color: '#ff6b6b' }}>
                    -${withdrawal.amount.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-sm" style={{ color: 'var(--text-light)' }}>
                    ${withdrawal.balance.toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={getStatusColor(withdrawal.status)}
                    >
                      {withdrawal.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm" style={{ color: 'var(--text-dark)' }}>
                    {withdrawal.date}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button 
                      className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                      style={{ 
                        color: 'var(--accent-purple)',
                        background: 'rgba(106, 13, 173, 0.1)',
                        border: '1px solid var(--accent-purple)'
                      }}
                      title="View Full Details"
                    >
                      <Visibility fontSize="small" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan="7" 
                  className="py-12 text-center"
                  style={{ color: 'var(--text-dark)' }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <Search style={{ fontSize: '48px', opacity: 0.5 }} />
                    <p className="text-lg">No withdrawals found</p>
                    <p className="text-sm">Try adjusting your search criteria</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
