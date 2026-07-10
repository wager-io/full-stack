import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const CurrencySelector = ({ availableCoins, selectedCoin, onSelectCoin }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const handleCoinSelect = (coin) => {
    onSelectCoin(coin);
    setDropdownOpen(false);
  };
  
  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-400">Select Currency</label>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full flex items-center justify-between p-3 bg-[#0f212e] border border-gray-700 rounded-lg text-white"
        >
          {selectedCoin ? (
            <div className="flex items-center">
              <img 
                src={selectedCoin.logoUrl} 
                alt={selectedCoin.symbol} 
                className="w-6 h-6 mr-3" 
              />
              <span>{selectedCoin.coinFullName} ({selectedCoin.symbol})</span>
            </div>
          ) : (
            <span className="text-gray-400">Select a currency</span>
          )}
          <FaChevronDown className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {dropdownOpen && (
          <div className="absolute z-10 mt-1 w-full bg-[#1a2c38] border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {availableCoins.map((coin) => (
              <button
                key={coin.coinId}
                onClick={() => handleCoinSelect(coin)}
                className="w-full flex items-center p-3 hover:bg-blue-600 text-white text-left"
              >
                <img 
                  src={coin.logoUrl} 
                  alt={coin.symbol} 
                  className="w-6 h-6 mr-3" 
                />
                <span>{coin.coinFullName} ({coin.symbol})</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencySelector;