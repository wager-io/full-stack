import React from 'react';

const WarningMessage = ({ coin, network }) => {
  if (!coin || !network) return null;
  
  return (
    <div className="p-4 bg-blue-900 bg-opacity-20 border border-blue-800 rounded-lg">
      <p className="text-sm text-blue-300">
        <strong>Important:</strong> Only send {coin.symbol} on the {network.network} network to this address. 
        Sending any other assets may result in permanent loss of funds.
      </p>
    </div>
  );
};

export default WarningMessage;