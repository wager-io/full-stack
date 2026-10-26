import React, { useState, useEffect } from 'react';
import api from '../../lib/apiCompat';
import { invoke } from '../../lib/realtime';
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
  // USD, because that is what the balance is denominated in. The coin amount is
  // derived, shown as an estimate, and priced for real on the server at send.
  const [amount, setAmount] = useState('');
  const [coinPrice, setCoinPrice] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    fetchAvailableCoins();
  }, []);

  // Refresh the display price whenever the coin changes. A failure here only
  // costs the estimate — the withdrawal itself is priced server-side.
  useEffect(() => {
    let cancelled = false;
    setCoinPrice(null);
    if (!selectedCoin?.coinId) return undefined;

    (async () => {
      const res = await invoke('ccpayment-address', {
        action: 'price',
        coinId: selectedCoin.coinId,
      });
      if (!cancelled && res.code === 0 && res.data?.success) {
        setCoinPrice(Number(res.data.data.price));
      }
    })();

    return () => { cancelled = true; };
  }, [selectedCoin]);

  const usdAmount = Number.parseFloat(amount);
  const estimatedCoins =
    Number.isFinite(usdAmount) && coinPrice > 0 ? usdAmount / coinPrice : null;
  // The gateway's minimum is quoted in coin units; the input is in dollars.
  // Null — never false — when there is no price yet, so `minimumUsd ?? 0`
  // downstream yields a number rather than a boolean in a `min` attribute.
  const minimumUsd =
    coinPrice > 0 && selectedNetwork?.minimumWithdrawAmount
      ? Number(selectedNetwork.minimumWithdrawAmount) * coinPrice
      : null;

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

    if (!Number.isFinite(withdrawAmount) || withdrawAmount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (withdrawAmount > (balance ?? 0)) {
      toast.error('Amount exceeds your available balance');
      return;
    }
    // Advisory only — the server re-checks everything that matters. This is
    // here so a doomed request fails in the form rather than in the queue.
    if (minimumUsd && withdrawAmount < minimumUsd) {
      toast.error(
        `Minimum withdrawal is ${selectedNetwork.minimumWithdrawAmount} ` +
        `${selectedCoin.symbol} (about $${minimumUsd.toFixed(2)})`
      );
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post('/api/ccpayment/withdraw', {
        amount: withdrawAmount,          // USD
        currency: selectedCoin.symbol,
        coinId: selectedCoin.coinId,
        chain: selectedNetwork.chain,
        address: withdrawalAddress,
        memo: selectedNetwork.isSupportMemo ? '' : undefined
      });

      if (response.data.success) {
        toast.success('Withdrawal requested — it is now awaiting review');
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
        
        {/* Amount Input with Balance Display. Denominated in USD: that is what
            the balance holds, and what gets held while the request is reviewed. */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs text-gray-400">Amount (USD)</label>
            <div className="text-xs text-gray-400">
              <span className="font-medium">Available:</span> ${balance?.toFixed(2) || '0.00'}
            </div>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount in USD"
            min={minimumUsd ?? 0}
            step="0.01"
            className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-between items-center text-xs gap-2">
            <div className="text-gray-400">
              {selectedNetwork && (
                <>
                  <span className="font-medium">Min:</span>{' '}
                  {selectedNetwork.minimumWithdrawAmount || '0'} {selectedCoin?.symbol}
                  {minimumUsd ? ` (≈ $${minimumUsd.toFixed(2)})` : ''}
                </>
              )}
            </div>
            {/* An estimate, and labelled as one. The rate is fixed server-side
                when the withdrawal is actually sent, which may be later. */}
            {estimatedCoins !== null && (
              <div className="text-gray-300 whitespace-nowrap">
                ≈ {estimatedCoins.toFixed(8)} {selectedCoin?.symbol}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleWithdraw}
          disabled={!selectedCoin || !selectedNetwork || !withdrawalAddress || !amount || submitting}
          className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {submitting ? 'Processing...' : `Request ${selectedCoin?.symbol || 'Crypto'} Withdrawal`}
        </button>

        {/* Withdrawals are reviewed before they are sent, and the balance is not
            debited until they are approved. Saying so here avoids the support
            ticket that otherwise follows every single request. */}
        <p className="text-xs text-gray-400 text-center">
          Withdrawals are reviewed before being sent. Your balance is not deducted
          until the request is approved.
        </p>
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