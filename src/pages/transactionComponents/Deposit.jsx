import React, { useState, useEffect, useContext } from 'react';
import { format } from 'date-fns';
import api from '../../utils/api';
import { toast } from 'sonner';
import { AuthContext } from '../../context/AuthContext';
import { FiCopy } from 'react-icons/fi';

const Deposit = () => {
  const { user } = useContext(AuthContext);
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchDepositHistory();
  }, [filterStatus]);

  const fetchDepositHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/ccpayment/deposit/history');
      if (response.data.success) {
        setDeposits(response.data.data || []);
      } else {
        toast.error(response.data.message || 'Failed to load deposit history');
      }
    } catch (error) {
      console.error('Error fetching deposit history:', error);
      toast.error('Failed to load deposit history');
    } finally {
      setLoading(false);
    }
  };

  // Filter deposits based on search term and status
  const filteredDeposits = deposits.filter(deposit =>
    (deposit.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     deposit.currency?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'all' || deposit.status === filterStatus)
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
      <h1 className="text-base font-bold mb-4 text-gray-200 sm:mb-6">Deposit History</h1>
      
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

      {/* Deposits Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-300">Loading deposit history...</p>
        </div>
      ) : filteredDeposits.length === 0 ? (
        <div className="text-center py-8 bg-[#071824] rounded-lg border border-[#1e3a4a]">
          <p className="text-sm text-gray-400">No deposit records found</p>
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
              {filteredDeposits.map((deposit, index) => {
                const txId = deposit.metadata?.depositData?.txId || 'N/A';
                return (
                  <tr key={deposit._id || index} className="hover:bg-[#0d2636]">
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
                          {formatDate(deposit.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-gray-200 sm:py-3 sm:px-4">
                      <span className="font-medium text-xs sm:text-sm">
                        {deposit.amount} {deposit.currency}
                      </span>
                      {deposit.amountUSD > 0 && (
                        <span className="block text-xs text-gray-400">
                          (${deposit.amountUSD.toFixed(2)} USD)
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-gray-200 sm:py-3 sm:px-4 hidden sm:table-cell">
                      <span className="text-xs sm:text-sm">
                        {deposit.metadata?.depositData?.serviceFee || '0'} {deposit.currency}
                      </span>
                    </td>
                    <td className="py-2 px-3 sm:py-3 sm:px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        deposit.status === 'completed'
                          ? 'bg-green-900 text-green-300'
                          : deposit.status === 'pending' || deposit.metadata?.depositData?.status === 'Processing'
                          ? 'bg-yellow-900 text-yellow-300'
                          : 'bg-red-900 text-red-300'
                      }`}>
                        {deposit.status === 'completed'
                          ? 'Complete'
                          : deposit.metadata?.depositData?.status === 'Processing'
                          ? 'Pending'
                          : deposit.status}
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

export default Deposit;
