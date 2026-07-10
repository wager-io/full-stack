import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'sonner';
import Loader from '../common/Loader';
import QRCode from 'react-qr-code';
import { FaClipboard, FaChevronDown, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

// Import sub-components
// import CurrencySelector from './DepositTab/CurrencySelector';
// import NetworkSelector from './DepositTab/NetworkSelector';
// import QRCodeDisplay from './DepositTab/QRCodeDisplay';
// import AddressDisplay from './DepositTab/AddressDisplay';
// import WarningMessage from './DepositTab/WarningMessage';
import NoCoinsMessage from './DepositTab/NoCoinsMessage';

export default function DepositTab() {
  // State for loading and data
  const [loading, setLoading] = useState(true);
  const [addressLoading, setAddressLoading] = useState(false);
  const [availableCoins, setAvailableCoins] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [depositAddress, setDepositAddress] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  // Fetch available coins on component mount
  useEffect(() => {
    fetchAvailableCoins();
  }, []);

  // Fetch deposit address when coin or network changes
  useEffect(() => {
    if (selectedCoin && selectedNetwork) {
      fetchDepositAddress();
    }
  }, [selectedCoin, selectedNetwork]);

  // Fetch available coins from the API
  const fetchAvailableCoins = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/ccpayment/currencies');
      if (response.data.success && response.data.data?.coins) {
        const coins = response.data.data.coins;
        setAvailableCoins(coins);
        
        // Select first coin by default
        if (coins.length > 0) {
          // Prefer USDT if available
          const defaultCoin = coins.find(coin => coin.symbol === 'USDT') || coins[0];
          setSelectedCoin(defaultCoin);
          
          // Select first network for the coin if available
          if (defaultCoin.networks && Object.keys(defaultCoin.networks).length > 0) {
            const firstNetworkKey = Object.keys(defaultCoin.networks)[0];
            setSelectedNetwork({
              key: firstNetworkKey,
              ...defaultCoin.networks[firstNetworkKey]
            });
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

  // Fetch deposit address from the API
  const fetchDepositAddress = async () => {
    if (!selectedCoin || !selectedNetwork) return;
    
    try {
      setAddressLoading(true);
      const response = await api.post('/api/ccpayment/permanent-address', {
        chain: selectedNetwork.chain,
        coinId: selectedCoin.coinId
      });
      
      if (response.data.success && response.data.data?.address) {
        setDepositAddress(response.data.data.address);
      } else {
        toast.error('Failed to generate deposit address');
        setDepositAddress('');
      }
    } catch (error) {
      console.error('Error fetching deposit address:', error);
      toast.error('Failed to generate deposit address');
      setDepositAddress('');
    } finally {
      setAddressLoading(false);
    }
  };

  // Handle coin selection
  const handleCoinSelect = (coin) => {
    setSelectedCoin(coin);
    setSelectedNetwork(null);
    setDepositAddress('');
    
    // Auto-select first network if only one is available
    if (coin.networks && Object.keys(coin.networks).length === 1) {
      const networkKey = Object.keys(coin.networks)[0];
      setSelectedNetwork({
        key: networkKey,
        ...coin.networks[networkKey]
      });
    }
  };

  // Copy address to clipboard
  const handleCopy = () => {
    if (!depositAddress) return;
    
    navigator.clipboard.writeText(depositAddress)
      .then(() => toast.success('Address copied to clipboard'))
      .catch(() => toast.error('Failed to copy address'));
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  // Show message if no coins are available
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
      
      {/* Middle section with QR code and address */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 mb-4">
        {/* QR Code */}
        <div className="md:w-1/2 flex items-center justify-center bg-gray-800 rounded-lg p-4">
          {addressLoading ? (
            <div className='p2 h-[120px] w-full justify-center items-center'>
                <div>Loading....</div>
            </div>
          ) : depositAddress ? (
            <div className="p-2 bg-white rounded-lg">
              <QRCode value={depositAddress} size={120} />
            </div>
          ) : (
            <div className="text-gray-400 text-center text-sm">
              <FaInfoCircle className="mx-auto mb-2 text-blue-400" size={24} />
              Select currency and network to generate a deposit address
            </div>
          )}
        </div>
        
        {/* Address and Info */}
        <div className="md:w-1/2 flex flex-col">
          <div className="space-y-1 mb-2">
            <label className="text-xs text-gray-400">Deposit Address</label>
            <div className="flex">
              <input
                type="text"
                value={depositAddress || ''}
                readOnly
                className="flex-1 p-2.5 bg-gray-800 border border-gray-700 rounded-l-md text-white text-sm focus:outline-none truncate"
                placeholder={addressLoading ? "Generating..." : "Address will appear here"}
              />
              <button
                onClick={handleCopy}
                disabled={!depositAddress}
                className="p-2.5 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaClipboard />
              </button>
            </div>
          </div>
          
          {/* Minimum deposit info */}
          {selectedNetwork && (
            <div className="text-xs text-gray-400 mb-2">
              <span className="font-medium">Min. deposit:</span>{' '}
              {selectedNetwork.minimumDepositAmount || '0'} {selectedCoin?.symbol}
            </div>
          )}
          
          {/* Expandable info section */}
          <div className="mt-auto">
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className="flex items-center text-xs text-blue-400 hover:text-blue-300 mb-1"
            >
              <FaInfoCircle className="mr-1" />
              {showInfo ? 'Hide' : 'Show'} deposit information
            </button>
            
            {showInfo && (
              <div className="text-xs text-gray-400 bg-gray-800 p-2 rounded-md">
                <p>• Deposits are typically credited after {selectedNetwork?.confirmations || 'multiple'} network confirmations</p>
                <p>• Processing time depends on network congestion</p>
                {selectedNetwork?.isSupportMemo && (
                  <p className="text-yellow-400">• This network requires a memo/tag</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Warning banner */}
      {depositAddress && (
        <div className="bg-yellow-900 bg-opacity-20 border border-yellow-800 rounded-md p-3 flex items-start">
          <FaExclamationTriangle className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-yellow-200">
            <strong>Important:</strong> Only send {selectedCoin?.symbol} on the {selectedNetwork?.chainFullName} network to this address. 
            Sending any other assets may result in permanent loss of funds.
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
  
  // Convert networks object to array
  const networkArray = Object.entries(networks).map(([key, value]) => ({
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