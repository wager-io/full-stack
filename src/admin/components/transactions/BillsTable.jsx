import React, { useState } from 'react';
import { Visibility, Search } from '@mui/icons-material';

export default function BillsTable() {
  const [searchTerm, setSearchTerm] = useState('');

  // Sample bills data
  const [bills] = useState([
    { 
      transactionId: 'TXN-BILL-001', 
      date: '2024-01-15 18:45:30', 
      transactionType: 'Service Fee', 
      amount: 25.00, 
      payout: 0, 
      status: 'Paid' 
    },
    { 
      transactionId: 'TXN-BILL-002', 
      date: '2024-01-15 12:30:15', 
      transactionType: 'Processing Fee', 
      amount: 15.50, 
      payout: 0, 
      status: 'Pending' 
    },
    { 
      transactionId: 'TXN-BILL-003', 
      date: '2024-01-14 16:20:44', 
      transactionType: 'Monthly Subscription', 
      amount: 49.99, 
      payout: 0, 
      status: 'Paid' 
    },
    { 
      transactionId: 'TXN-BILL-004', 
      date: '2024-01-14 09:15:22', 
      transactionType: 'Transaction Fee', 
      amount: 8.75, 
      payout: 0, 
      status: 'Failed' 
    },
    { 
      transactionId: 'TXN-BILL-005', 
      date: '2024-01-13 14:55:10', 
      transactionType: 'Maintenance Fee', 
      amount: 12.00, 
      payout: 0, 
      status: 'Paid' 
    },
    { 
      transactionId: 'TXN-BILL-006', 
      date: '2024-01-13 11:30:33', 
      transactionType: 'Currency Conversion', 
      amount: 5.25, 
      payout: 0, 
      status: 'Disputed' 
    },
  ]);

  const filteredBills = bills.filter(bill =>
    bill.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return { color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e' };
      case 'Pending':
        return { color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b' };
      case 'Failed':
        return { color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444' };
      case 'Disputed':
        return { color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid #8b5cf6' };
      default:
        return { color: 'var(--text-dark)', background: 'rgba(148, 163, 184, 0.1)', border: '1px solid var(--text-dark)' };
    }
  };

  const getTransactionTypeColor = (type) => {
    const colors = {
      'Service Fee': '#3b82f6',
      'Processing Fee': '#f59e0b',
      'Monthly Subscription': '#8b5cf6',
      'Transaction Fee': '#ef4444',
      'Maintenance Fee': '#10b981',
      'Currency Conversion': '#f97316'
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

      {/* Bills Table */}
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
                Transaction Type
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold" style={{ color: 'var(--text-light)' }}>
                Amount
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold" style={{ color: 'var(--text-light)' }}>
                Payout
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
            {filteredBills.length > 0 ? (
              filteredBills.map((bill, index) => (
                <tr 
                  key={bill.transactionId} 
                  className="border-b transition-all duration-200 hover:bg-opacity-50"
                  style={{ 
                    borderColor: 'var(--border-color)',
                    backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                  }}
                >
                  <td className="py-4 px-4 text-sm font-mono" style={{ color: 'var(--accent-purple)' }}>
                    {bill.transactionId}
                  </td>
                  <td className="py-4 px-4 text-sm" style={{ color: 'var(--text-dark)' }}>
                    {bill.date}
                  </td>
                  <td className="py-4 px-4">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        color: getTransactionTypeColor(bill.transactionType),
                        background: `${getTransactionTypeColor(bill.transactionType)}20`,
                        border: `1px solid ${getTransactionTypeColor(bill.transactionType)}`
                      }}
                    >
                      {bill.transactionType}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm font-bold" style={{ color: '#ef4444' }}>
                    -${bill.amount.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-sm" style={{ color: 'var(--text-dark)' }}>
                    ${bill.payout.toFixed(2)}
                  </td>
                  <td className="py-4 px-4">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={getStatusColor(bill.status)}
                    >
                      {bill.status}
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
                  colSpan="7" 
                  className="py-12 text-center"
                  style={{ color: 'var(--text-dark)' }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <Search style={{ fontSize: '48px', opacity: 0.5 }} />
                    <p className="text-lg">No bills found</p>
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
