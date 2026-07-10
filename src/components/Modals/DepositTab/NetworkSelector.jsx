import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const NetworkSelector = ({ networks, selectedNetwork, onSelectNetwork }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Convert networks object to array for rendering
  const networkArray = networks ? Object.entries(networks).map(([key, value]) => ({
    key,
    chain: value.chain,
    network: value.chainFullName,
    ...value
  })) : [];
  
  const handleNetworkSelect = (network) => {
    onSelectNetwork(network);
    setDropdownOpen(false);
  };
  
  if (!networks || networkArray.length === 0) return null;
  
  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-400">Select Network</label>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full flex items-center justify-between p-3 bg-[#0f212e] border border-gray-700 rounded-lg text-white"
        >
          {selectedNetwork ? (
            <span>{selectedNetwork.chainFullName}</span>
          ) : (
            <span className="text-gray-400">Select a network</span>
          )}
          <FaChevronDown className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {dropdownOpen && (
          <div className="absolute z-10 mt-1 w-full bg-[#1a2c38] border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {networkArray.map((network) => (
              <button
                key={network.key}
                onClick={() => handleNetworkSelect(network)}
                className="w-full p-3 hover:bg-blue-600 text-white text-left"
              >
                {network.chainFullName}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkSelector;