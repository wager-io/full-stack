import React, { useState, useEffect, useContext } from 'react';
import { format } from 'date-fns';
import api from '../../utils/api';
import { toast } from 'sonner';
import { AuthContext } from '../../context/AuthContext';
import { FiCopy } from 'react-icons/fi';

const Withdraw = () => {
  const { user } = useContext(AuthContext);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchWithdrawHistory();
  }, [filterStatus]);

  const fetchWithdrawHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/ccpayment/withdraw/history');
      if (response.data.success) {
        setWithdrawals(response.data.data || []);
      } else {
        toast.error(response.data.message || 'Failed to load withdraw history');
      }
    } catch (error) {
      console.error('Error fetching withdraw history:', error);
      toast.error('Failed to load withdraw history');
    } finally {
      setLoading(false);
    }
  };

  // Filter withdrawals based on search term and status
  const filteredWithdrawals = withdrawals.filter(withdrawal =>
    (withdrawal.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     withdrawal.currency?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'all' || withdrawal.status === filterStatus)
  );

  // Format date function
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Copy transaction hash to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success('Transaction hash copied to clipboard');
      })
      .catch((err) => {
        toast.error('Failed to copy transaction hash');
        console.error('Could not copy text: ', err);
      });
  };

  return (
    <div className="w-full">
      <h1 className="text-base font-bold mb-4 text-gray-200 sm:mb-6">Withdraw History</h1>
      
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
        <div className="w-full sm:w-1/2 lg:w-1/3">
          <input
            type="text"
            placeholder="Search by ID or currency..."
            className="w-full p-2 text-sm border rounded bg-[#0d2636] border-[#1e3a4a] text-gray-200 placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3">
          <select
            className="w-full p-2 text-sm border rounded bg-[#0d2636] border-[#1e3a4a] text-gray-200"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Withdrawals Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-300">Loading withdraw history...</p>
        </div>
      ) : filteredWithdrawals.length === 0 ? (
        <div className="text-center py-8 bg-[#071824] rounded-lg border border-[#1e3a4a]">
          <p className="text-sm text-gray-400">No withdrawal records found</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full bg-[#071824] border border-[#1e3a4a] rounded-lg text-sm">
            <thead className="bg-[#0d2636]">
              <tr>
                <th className="py-2 px-3 text-left text-xs text-gray-300 sm:text-sm sm:py-3 sm:px-4">Transaction / Date</th>
                <th className="py-2 px-3 text-left text-xs text-gray-300 sm:text-sm sm:py-3 sm:px-4">Amount</th>
                <th className="py-2 px-3 text-left text-xs text-gray-300 sm:text-sm sm:py-3 sm:px-4 hidden sm:table-cell">Fee</th>
                <th className="py-2 px-3 text-left text-xs text-gray-300 sm:text-sm sm:py-3 sm:px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e3a4a]">
              {filteredWithdrawals.map((withdrawal, index) => {
                const txId = withdrawal.metadata?.depositData?.txId || withdrawal.txId || 'N/A';
                return (
                  <tr key={withdrawal._id || index} className="hover:bg-[#0d2636]">
                    <td className="py-2 px-3 sm:py-3 sm:px-4">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <span className="font-medium text-blue-400 text-xs truncate max-w-[120px] sm:text-sm sm:max-w-[200px] md:max-w-xs">
                            {txId}
                          </span>
                          {txId !== 'N/A' && (
                            <button 
                              onClick={() => copyToClipboard(txId)}
                              className="ml-2 text-gray-400 hover:text-blue-400 focus:outline-none"
                              title="Copy transaction hash"
                            >
                              <FiCopy size={14} />
                            </button>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 sm:text-sm">
                          {formatDate(withdrawal.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-gray-200 sm:py-3 sm:px-4">
                      <span className="font-medium text-xs sm:text-sm">
                        {withdrawal.amount} {withdrawal.currency}
                      </span>
                      {withdrawal.amountUSD > 0 && (
                        <span className="block text-xs text-gray-400">
                          (${withdrawal.amountUSD.toFixed(2)} USD)
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-gray-200 sm:py-3 sm:px-4 hidden sm:table-cell">
                      <span className="text-xs sm:text-sm">
                        {withdrawal.metadata?.depositData?.serviceFee || withdrawal.fee || '0'} {withdrawal.currency}
                      </span>
                    </td>
                    <td className="py-2 px-3 sm:py-3 sm:px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        withdrawal.status === 'completed'
                          ? 'bg-green-900 text-green-300'
                          : withdrawal.status === 'pending' || withdrawal.metadata?.depositData?.status === 'Processing'
                          ? 'bg-yellow-900 text-yellow-300'
                          : 'bg-red-900 text-red-300'
                      }`}>
                        {withdrawal.status === 'completed'
                          ? 'Complete'
                          : withdrawal.status === 'pending' || withdrawal.metadata?.depositData?.status === 'Processing'
                          ? 'Pending'
                          : withdrawal.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Withdraw;
