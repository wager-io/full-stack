import React from 'react';
import { FaClipboard } from 'react-icons/fa';

const AddressDisplay = ({ isLoading, address, onCopy }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-400">Deposit Address</label>
      <div className="flex">
        <input
          type="text"
          value={address || ''}
          readOnly
          className="flex-1 p-3 bg-[#0f212e] border border-gray-700 rounded-l-lg text-white focus:outline-none"
          placeholder={isLoading ? "Generating address..." : "Deposit address will appear here"}
        />
        <button
          onClick={onCopy}
          disabled={!address}
          className="p-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaClipboard />
        </button>
      </div>
    </div>
  );
};

export default AddressDisplay;