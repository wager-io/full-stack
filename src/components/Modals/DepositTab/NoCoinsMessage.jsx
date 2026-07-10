import React from 'react';

const NoCoinsMessage = ({ onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <p className="text-gray-400 mb-4">No deposit options are currently available.</p>
      <button 
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Retry
      </button>
    </div>
  );
};

export default NoCoinsMessage;