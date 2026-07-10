import React, { useState, useEffect } from 'react';
import { FaSearch, FaChevronLeft, FaChevronRight, FaTrophy, FaGift } from 'react-icons/fa';
import { FiCopy } from 'react-icons/fi';
import api from '../../utils/api';
import { format } from 'date-fns';
import { toast } from 'sonner';

const Others = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true);
      // const response = await api.get('/api/transactions/others', {
      //   params: {
      //     page,
      //     limit: pagination.limit,
      //     types: 'bonus,vip_upgrade' // Filter for bonus and VIP upgrade transactions
      //   }
      // });
      
      // setTransactions(response.data.transactions || []);
      // setPagination(response.data.pagination || {
      //   page,
      //   limit: 10,
      //   total: 0,
      //   totalPages: 0
      // });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load bonuses and VIP upgrades');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTransactions();
  }, []);
  
  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      fetchTransactions(newPage);
    }
  };
  
  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(transaction =>
    transaction.transaction_type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Format date function
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Copy transaction ID to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success('Transaction ID copied to clipboard');
      })
      .catch((err) => {
        toast.error('Failed to copy transaction ID');
        console.error('Could not copy text: ', err);
      });
  };

  // Get transaction icon based on type
  const getTransactionIcon = (type) => {
    if (type.toLowerCase().includes('vip')) {
      return <FaTrophy className="text-yellow-400 mr-2" size={14} />;
    } else if (type.toLowerCase().includes('bonus')) {
      return <FaGift className="text-green-400 mr-2" size={14} />;
    }
    return null;
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const { page, totalPages } = pagination;
    
    // If no pages or only one page, don't show pagination
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-center mt-6 space-x-2">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className={`p-2 rounded-md ${
            page === 1 
              ? 'text-gray-500 cursor-not-allowed' 
              : 'text-blue-400 hover:bg-[#0d2636]'
          }`}
          aria-label="Previous page"
        >
          <FaChevronLeft size={14} />
        </button>
        
        {/* First page */}
        {page > 2 && (
          <button
            onClick={() => handlePageChange(1)}
            className="px-3 py-1 rounded-md text-sm hover:bg-[#0d2636] text-gray-300"
          >
            1
          </button>
        )}
        
        {/* Ellipsis if needed */}
        {page > 3 && (
          <span className="text-gray-500">...</span>
        )}
        
        {/* Previous page if not first */}
        {page > 1 && (
          <button
            onClick={() => handlePageChange(page - 1)}
            className="px-3 py-1 rounded-md text-sm hover:bg-[#0d2636] text-gray-300"
          >
            {page - 1}
          </button>
        )}
        
        {/* Current page */}
        <button
          className="px-3 py-1 rounded-md text-sm bg-blue-600 text-white"
        >
          {page}
        </button>
        
        {/* Next page if not last */}
        {page < totalPages && (
          <button
            onClick={() => handlePageChange(page + 1)}
            className="px-3 py-1 rounded-md text-sm hover:bg-[#0d2636] text-gray-300"
          >
            {page + 1}
          </button>
        )}
        
        {/* Ellipsis if needed */}
        {page < totalPages - 2 && (
          <span className="text-gray-500">...</span>
        )}
        
        {/* Last page if not current or next */}
        {page < totalPages - 1 && (
          <button
            onClick={() => handlePageChange(totalPages)}
            className="px-3 py-1 rounded-md text-sm hover:bg-[#0d2636] text-gray-300"
          >
            {totalPages}
          </button>
        )}
        
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className={`p-2 rounded-md ${
            page === totalPages 
              ? 'text-gray-500 cursor-not-allowed' 
              : 'text-blue-400 hover:bg-[#0d2636]'
          }`}
          aria-label="Next page"
        >
          <FaChevronRight size={14} />
        </button>
      </div>
    );
  };

  return (
    <div className="w-full">
      <h1 className="text-base font-bold mb-4 text-gray-200 sm:mb-6">Bonuses & VIP Upgrades</h1>
      
      {/* Search Control */}
      <div className="mb-4">
        <div className="relative w-full sm:w-1/2 lg:w-1/3">
          <input
            type="text"
            placeholder="Search by transaction type..."
            className="w-full p-2 pl-9 text-sm border rounded bg-[#0d2636] border-[#1e3a4a] text-gray-200 placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-300">Loading transactions...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-8 bg-[#071824] rounded-lg border border-[#1e3a4a]">
          <p className="text-sm text-gray-400">No bonuses or VIP upgrades found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full bg-[#071824] border border-[#1e3a4a] rounded-lg text-sm">
              <thead className="bg-[#0d2636]">
                <tr>
                  <th className="py-2 px-3 text-left text-xs text-gray-300 sm:text-sm sm:py-3 sm:px-4">
                    Type / Transaction ID / Time
                  </th>
                  <th className="py-2 px-3 text-right text-xs text-gray-300 sm:text-sm sm:py-3 sm:px-4">
                    Amount
                  </th>
                  <th className="py-2 px-3 text-right text-xs text-gray-300 sm:text-sm sm:py-3 sm:px-4">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e3a4a]">
                {filteredTransactions.map((transaction, index) => (
                  <tr key={transaction.transaction_id || index} className="hover:bg-[#0d2636]">
                    <td className="py-2 px-3 sm:py-3 sm:px-4">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          {getTransactionIcon(transaction.transaction_type)}
                          <span className="font-medium text-gray-200 text-xs sm:text-sm">
                            {transaction.transaction_type}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          <span className="text-blue-400 text-xs truncate max-w-[120px] sm:text-sm sm:max-w-[200px] md:max-w-xs">
                            {transaction.transaction_id}
                          </span>
                          <button
                            onClick={() => copyToClipboard(transaction.transaction_id)}
                            className="ml-2 text-gray-400 hover:text-blue-400 focus:outline-none"
                            title="Copy transaction ID"
                          >
                            <FiCopy size={14} />
                          </button>
                        </div>
                        <span className="text-xs text-gray-400 mt-1">
                          {formatDate(transaction.timestamp)}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right sm:py-3 sm:px-4">
                      <div className="flex items-center justify-end">
                        {transaction.token_img && (
                          <img
                            src={transaction.token_img}
                            alt={transaction.currency}
                            className="w-4 h-4 mr-1.5 rounded-full"
                          />
                        )}
                        <span className="font-medium text-xs sm:text-sm text-green-400">
                          +{parseFloat(transaction.amount).toFixed(4)} {transaction.currency}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right text-gray-200 sm:py-3 sm:px-4">
                      <div className="flex items-center justify-end">
                        {transaction.token_img && (
                          <img
                            src={transaction.token_img}
                            alt={transaction.currency}
                            className="w-4 h-4 mr-1.5 rounded-full"
                          />
                        )}
                        <span className="text-xs sm:text-sm">
                          {parseFloat(transaction.balance).toFixed(4)} {transaction.currency}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {renderPaginationButtons()}
          
          {/* Pagination Info */}
          <div className="text-xs text-gray-400 text-center mt-3">
            Showing {transactions.length} of {pagination.total} transactions | Page {pagination.page} of {pagination.totalPages}
          </div>
        </>
      )}
    </div>
  );
};

export default Others;
