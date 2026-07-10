import React, { useState } from 'react';
import { Visibility, Search } from '@mui/icons-material';

export default function BonusTable() {
  const [searchTerm, setSearchTerm] = useState('');

  // Sample bonus data
  const [bonuses] = useState([
    { 
      transactionId: 'TXN-BON-001', 
      date: '2024-01-15 20:15:45', 
      bonusPayout: 150.00, 
      bonusType: 'Welcome Bonus', 
      status: 'Credited' 
    },
    { 
      transactionId: 'TXN-BON-002', 
      date: '2024-01-15 14:30:22', 
      bonusPayout: 75.50, 
      bonusType: 'Deposit Match', 
      status: 'Pending' 
    },
    { 
      transactionId: 'TXN-BON-003', 
      date: '2024-01-14 18:45:10', 
      bonusPayout: 25.00, 
      bonusType: 'Free Spins', 
      status: 'Credited' 
    },
    { 
      transactionId: 'TXN-BON-004', 
      date: '2024-01-14 12:20:33', 
      bonusPayout: 200.00, 
      bonusType: 'Loyalty Reward', 
      status: 'Expired' 
    },
    { 
      transactionId: 'TXN-BON-005', 
      date: '2024-01-13 16:55:18', 
      bonusPayout: 50.00, 
      bonusType: 'Referral Bonus', 
      status: 'Credited' 
    },
    { 
      transactionId: 'TXN-BON-006', 
      date: '2024-01-13 10:30:55', 
      bonusPayout: 100.00, 
      bonusType: 'Weekly Cashback', 
      status: 'Processing' 
    },
    { 
      transactionId: 'TXN-BON-007', 
      date: '2024-01-12 22:15:40', 
      bonusPayout: 300.00, 
      bonusType: 'VIP Exclusive', 
      status: 'Credited' 
    },
  ]);

  const filteredBonuses = bonuses.filter(bonus =>
    bonus.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Credited':
        return { color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e' };
      case 'Pending':
        return { color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b' };
      case 'Processing':
        return { color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6' };
      case 'Expired':
        return { color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444' };
      case 'Cancelled':
        return { color: '#6b7280', background: 'rgba(107, 114, 128, 0.1)', border: '1px solid #6b7280' };
      default:
        return { color: 'var(--text-dark)', background: 'rgba(148, 163, 184, 0.1)', border: '1px solid var(--text-dark)' };
    }
  };

  const getBonusTypeColor = (type) => {
    const colors = {
      'Welcome Bonus': '#8b5cf6',
      'Deposit Match': '#22c55e',
      'Free Spins': '#f59e0b',
      'Loyalty Reward': '#dc2626',
      'Referral Bonus': '#3b82f6',
      'Weekly Cashback': '#10b981',
      'VIP Exclusive': '#fbbf24'
    };
    return colors[type] || 'var(--text-dark)';
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

      {/* Bonus Table */}
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
                Date
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold" style={{ color: 'var(--text-light)' }}>
                Bonus Payout
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold" style={{ color: 'var(--text-light)' }}>
                Bonus Type
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold" style={{ color: 'var(--text-light)' }}>
                Status
              </th>
              <th className="text-center py-4 px-4 text-sm font-semibold" style={{ color: 'var(--text-light)' }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredBonuses.length > 0 ? (
              filteredBonuses.map((bonus, index) => (
                <tr 
                  key={bonus.transactionId} 
                  className="border-b transition-all duration-200 hover:bg-opacity-50"
                  style={{ 
                    borderColor: 'var(--border-color)',
                    backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                  }}
                >
                  <td className="py-4 px-4 text-sm font-mono" style={{ color: 'var(--accent-purple)' }}>
                    {bonus.transactionId}
                  </td>
                  <td className="py-4 px-4 text-sm" style={{ color: 'var(--text-dark)' }}>
                    {bonus.date}
                  </td>
                  <td className="py-4 px-4 text-sm font-bold" style={{ color: 'var(--success-green)' }}>
                    +${bonus.bonusPayout.toFixed(2)}
                  </td>
                  <td className="py-4 px-4">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        color: getBonusTypeColor(bonus.bonusType),
                        background: `${getBonusTypeColor(bonus.bonusType)}20`,
                        border: `1px solid ${getBonusTypeColor(bonus.bonusType)}`
                      }}
                    >
                      {bonus.bonusType}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={getStatusColor(bonus.status)}
                    >
                      {bonus.status}
                    </span>
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
                  colSpan="6" 
                  className="py-12 text-center"
                  style={{ color: 'var(--text-dark)' }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <Search style={{ fontSize: '48px', opacity: 0.5 }} />
                    <p className="text-lg">No bonuses found</p>
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
