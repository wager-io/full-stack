import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DepositTab from './DepositTab'; // Import DepositTab
import WithdrawTab from './WithdrawTab'; // Import WithdrawTab

export default function WalletModal({ isOpen, onClose }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'deposit';
  const networks = ['Ethereum', 'Binance Smart Chain', 'Polygon'];
  const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);


  const handleTabChange = (tab) => {
    searchParams.set('tab', tab);
    setSearchParams(searchParams);
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#000000ab] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a2c38] p-6 rounded-[15px] py-12 shadow-lg w-[560px]">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg text-white font-bold">Wallet</h2>
          <button
            onClick={onClose}
            className="text-white hover:rotate-90 transition-transform duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-4 bg-[#0f212e] rounded-[30px] p-3">
          <button
            onClick={() => handleTabChange('deposit')}
            className={`px-4 py-3 text-sm font-medium w-full rounded-[30px] transition-all ${
              activeTab === 'deposit'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400'
            }`}
          >
            Deposit
          </button>
          <button
            onClick={() => handleTabChange('withdraw')}
            className={`px-4 py-3 text-sm font-medium rounded-[30px] w-full transition-all ${
              activeTab === 'withdraw'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400'
            }`}
          >
            Withdraw
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'deposit' && (
          <DepositTab  />
        )}
        {activeTab === 'withdraw' && (
          <WithdrawTab
            networks={networks}
            selectedNetwork={selectedNetwork}
            setSelectedNetwork={setSelectedNetwork}
          />
        )}
      </div>
    </div>
  );
}