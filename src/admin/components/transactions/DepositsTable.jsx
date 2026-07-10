import React, { useState } from 'react';
import { Visibility, Search } from '@mui/icons-material';

export default function DepositsTable() {
  const [searchTerm, setSearchTerm] = useState('');

  // Sample deposits data
  const [deposits] = useState([
    { 
      transactionId: 'TXN-DEP-001', 
      transactionHash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12', 
      amount: 5000, 
      balance: 45000, 
      status: 'Completed', 
      date: '2024-01-15 14:30:22' 
    },
    { 
      transactionId: 'TXN-DEP-002', 
      transactionHash: '0x9876543210fedcba0987654321fedcba09876543', 
      amount: 2500, 
      balance: 40000, 
      status: 'Pending', 
      date: '2024-01-15 12:15:10' 
    },
    { 
      transactionId: 'TXN-DEP-003', 
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef12', 
      amount: 8000, 
      balance: 37500, 
      status: 'Completed', 
      date: '2024-01-14 16:45:33' 
    },
    { 
      transactionId: 'TXN-DEP-004', 
      transactionHash: '0x567890abcdef1234567890abcdef1234567890ab', 
      amount: 1500, 
      balance: 29500, 
      status: 'Failed', 
      date: '2024-01-14 10:20:15' 
    },
    { 
      transactionId: 'TXN-DEP-005', 
      transactionHash: '0xfedcba0987654321fedcba0987654321fedcba09', 
      amount: 3200, 
      balance: 28000, 
      status: 'Completed', 
      date: '2024-01-13 18:12:44' 
    },
  ]);

  const filteredDeposits = deposits.filter(deposit =>
    deposit.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
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

      {/* Deposits Table */}
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
            {filteredDeposits.length > 0 ? (
              filteredDeposits.map((deposit, index) => (
                <tr 
                  key={deposit.transactionId} 
                  className="border-b transition-all duration-200 hover:bg-opacity-50"
                  style={{ 
                    borderColor: 'var(--border-color)',
                    backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                  }}
                >
                  <td className="py-4 px-4 text-sm font-mono" style={{ color: 'var(--accent-purple)' }}>
                    {deposit.transactionId}
                  </td>
                  <td className="py-4 px-4 text-sm font-mono" style={{ color: 'var(--text-light)' }}>
                    <span title={deposit.transactionHash}>
                      {truncateHash(deposit.transactionHash)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm font-bold" style={{ color: 'var(--success-green)' }}>
                    +${deposit.amount.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-sm" style={{ color: 'var(--text-light)' }}>
                    ${deposit.balance.toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={getStatusColor(deposit.status)}
                    >
                      {deposit.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm" style={{ color: 'var(--text-dark)' }}>
                    {deposit.date}
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
                    <p className="text-lg">No deposits found</p>
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
