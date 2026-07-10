import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'sonner';
import Loader from '../common/Loader';
import { FaChevronDown, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import NoCoinsMessage from './DepositTab/NoCoinsMessage';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from "react-router-dom"

export default function WithdrawTab() {
  const { balance } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [availableCoins, setAvailableCoins] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    fetchAvailableCoins();
  }, []);

  const fetchAvailableCoins = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/ccpayment/currencies');
      if (response.data.success && response.data.data?.coins) {
        const coins = response.data.data.coins;
        
        // Filter coins that support withdrawals
        const withdrawableCoins = coins.filter(coin => {
          if (!coin.networks) return false;
          return Object.values(coin.networks).some(network => network.canWithdraw);
        });
        
        setAvailableCoins(withdrawableCoins);
        
        if (withdrawableCoins.length > 0) {
          const defaultCoin = withdrawableCoins.find(coin => coin.symbol === 'USDT') || withdrawableCoins[0];
          setSelectedCoin(defaultCoin);
          
          if (defaultCoin.networks && Object.keys(defaultCoin.networks).length > 0) {
            const withdrawableNetworks = Object.entries(defaultCoin.networks)
              .filter(([key, network]) => network.canWithdraw);
            
            if (withdrawableNetworks.length > 0) {
              const [firstNetworkKey, firstNetwork] = withdrawableNetworks[0];
              setSelectedNetwork({
                key: firstNetworkKey,
                ...firstNetwork
              });
            }
          }
        }
      } else {
        toast.error('Failed to fetch available coins');
      }
    } catch (error) {
      console.error('Error fetching available coins:', error);
      toast.error('Failed to fetch available coins');
    } finally {
      setLoading(false);
    }
  };

  const handleCoinSelect = (coin) => {
    setSelectedCoin(coin);
    setSelectedNetwork(null);
    setAmount('');
    
    if (coin.networks && Object.keys(coin.networks).length === 1) {
      const networkKey = Object.keys(coin.networks)[0];
      const network = coin.networks[networkKey];
      if (network.canWithdraw) {
        setSelectedNetwork({
          key: networkKey,
          ...network
        });
      }
    }
  };

  const handleWithdraw = async () => {
    if (!selectedCoin || !selectedNetwork || !withdrawalAddress || !amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const withdrawAmount = parseFloat(amount);
    const minAmount = parseFloat(selectedNetwork.minimumWithdrawAmount || 0);
    
    if (withdrawAmount < minAmount) {
      toast.error(`Minimum withdrawal amount is ${minAmount} ${selectedCoin.symbol}`);
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post('/api/ccpayment/withdraw', {
        amount: withdrawAmount,
        coinId: selectedCoin.coinId,
        chain: selectedNetwork.chain,
        address: withdrawalAddress,
        memo: selectedNetwork.isSupportMemo ? '' : undefined
      });

      if (response.data.success) {
        toast.success('Withdrawal request submitted successfully');
        setWithdrawalAddress('');
        setAmount('');
        navigate("/transactions/withdraw")
      } else {
        toast.error(response.data.message || 'Failed to create withdrawal request');
      }
    } catch (error) {
      console.error('Error creating withdrawal request:', error);
      toast.error(error.response?.data?.message || 'Failed to create withdrawal request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  if (availableCoins.length === 0) {
    return <NoCoinsMessage onRetry={fetchAvailableCoins} />;
  }

  return (
    <div className="h-full max-h-[calc(100vh-200px)] overflow-hidden flex flex-col">
      {/* Top section with selectors */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Coin Selection */}
        <div className="space-y-1">
          <label className="text-xs text-gray-400">Currency</label>
          <CoinDropdown 
            options={availableCoins}
            selected={selectedCoin}
            onSelect={handleCoinSelect}
            renderOption={(coin) => (
              <div className="flex items-center">
                <img src={coin.logoUrl} alt={coin.symbol} className="w-5 h-5 mr-2" />
                <span>{coin.symbol}</span>
              </div>
            )}
            renderSelected={(coin) => (
              <div className="flex items-center">
                <img src={coin.logoUrl} alt={coin.symbol} className="w-5 h-5 mr-2" />
                <span>{coin.symbol}</span>
              </div>
            )}
          />
        </div>
        
        {/* Network Selection */}
        <div className="space-y-1">
          <label className="text-xs text-gray-400">Network</label>
          {selectedCoin && selectedCoin.networks ? (
            <NetworkDropdown 
              networks={selectedCoin.networks}
              selected={selectedNetwork}
              onSelect={setSelectedNetwork}
            />
          ) : (
            <div className="p-2.5 bg-gray-800 rounded-md text-gray-400 text-sm">
              Select a currency first
            </div>
          )}
        </div>
      </div>
      
      {/* Withdrawal form */}
      <div className="space-y-4 mb-4">
        {/* Address Input */}
        <div className="space-y-1">
          <label className="text-xs text-gray-400">Withdrawal Address</label>
          <input
            type="text"
            value={withdrawalAddress}
            onChange={(e) => setWithdrawalAddress(e.target.value)}
            placeholder={`Enter ${selectedCoin?.symbol || 'crypto'} withdrawal address`}
            className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Amount Input with Balance Display */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs text-gray-400">Amount</label>
            <div className="text-xs text-gray-400">
              <span className="font-medium">Available:</span> ${balance?.toFixed(2) || '0.00'} USDT
            </div>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Enter ${selectedCoin?.symbol || 'crypto'} amount`}
            min={selectedNetwork?.minimumWithdrawAmount || 0}
            step="0.00001"
            className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-between items-center text-xs">
            <div className="text-gray-400">
              {selectedNetwork && (
                <>
                  <span className="font-medium">Min. withdrawal:</span>{' '}
                  {selectedNetwork.minimumWithdrawAmount || '0'} {selectedCoin?.symbol}
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <button 
          onClick={handleWithdraw}
          disabled={!selectedCoin || !selectedNetwork || !withdrawalAddress || !amount || submitting}
          className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {submitting ? 'Processing...' : `Withdraw ${selectedCoin?.symbol || 'Crypto'}`}
        </button>
      </div>
      
      {/* Expandable info section */}
      <div className="mt-auto">
        <button 
          onClick={() => setShowInfo(!showInfo)}
          className="flex items-center text-xs text-blue-400 hover:text-blue-300 mb-1"
        >
          <FaInfoCircle className="mr-1" />
          {showInfo ? 'Hide' : 'Show'} withdrawal information
        </button>
        
        {showInfo && (
          <div className="text-xs text-gray-400 bg-gray-800 p-2 rounded-md">
            <p>• Withdrawals are typically processed within 24 hours</p>
            <p>• Network fees may apply depending on blockchain congestion</p>
            {selectedNetwork?.isSupportMemo && (
              <p className="text-yellow-400">• This network requires a memo/tag for some exchanges</p>
            )}
          </div>
        )}
      </div>
      
      {/* Warning banner */}
      {withdrawalAddress && selectedCoin && selectedNetwork && (
        <div className="bg-yellow-900 bg-opacity-20 border border-yellow-800 rounded-md p-3 flex items-start">
          <FaExclamationTriangle className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-yellow-200">
            <strong>Important:</strong> Make sure the withdrawal address supports {selectedCoin?.symbol} on the {selectedNetwork?.chainFullName} network. 
            Sending to an incorrect address may result in permanent loss of funds.
          </p>
        </div>
      )}
    </div>
  );
}

// Custom dropdown component for better space efficiency
const CoinDropdown = ({ options, selected, onSelect, renderOption, renderSelected }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2.5 bg-gray-800 border border-gray-700 rounded-md text-white"
      >
        {selected ? renderSelected(selected) : <span className="text-gray-400">Select</span>}
        <FaChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.coinId || option.id}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
              className="w-full flex items-center p-2.5 hover:bg-blue-600 text-white text-left"
            >
              {renderOption(option)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Network dropdown component
const NetworkDropdown = ({ networks, selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Convert networks object to array and filter for withdrawal-enabled networks
  const networkArray = Object.entries(networks)
    .filter(([key, network]) => network.canWithdraw)
    .map(([key, value]) => ({
      key,
      ...value
    }));
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2.5 bg-gray-800 border border-gray-700 rounded-md text-white"
      >
        {selected ? (
          <span>{selected.chainFullName}</span>
        ) : (
          <span className="text-gray-400">Select network</span>
        )}
        <FaChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {networkArray.map((network) => (
            <button
              key={network.key}
              onClick={() => {
                onSelect(network);
                setIsOpen(false);
              }}
              className="w-full p-2.5 hover:bg-blue-600 text-white text-left"
            >
              {network.chainFullName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};