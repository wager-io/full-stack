import React from 'react';
import QRCode from 'react-qr-code';
import Loader from '../../common/Loader';

const QRCodeDisplay = ({ isLoading, address }) => {
  return (
    <div className="flex justify-center py-4">
      {isLoading ? (
        <Loader size="md" />
      ) : address ? (
        <div className="p-3 bg-white rounded-lg">
          <QRCode value={address} size={160} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 text-gray-400">
          No address available
        </div>
      )}
    </div>
  );
};

export default QRCodeDisplay;