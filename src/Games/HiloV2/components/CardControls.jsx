import React from 'react';

const CardControls = ({ 
  onHigher, 
  onLower, 
  onCashout, 
  disabled, 
  higherProbability, 
  lowerProbability 
}) => {
  return (
    <div className="card-controls flex justify-center gap-4 mt-4">
      <button
        className="btn-higher bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex flex-col items-center"
        onClick={onHigher}
        disabled={disabled}
      >
        <span className="text-lg font-bold">Higher</span>
        <span className="text-xs">{higherProbability}%</span>
      </button>
      
      <button
        className="btn-cashout bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
        onClick={onCashout}
        disabled={disabled}
      >
        Cash Out
      </button>
      
      <button
        className="btn-lower bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex flex-col items-center"
        onClick={onLower}
        disabled={disabled}
      >
        <span className="text-lg font-bold">Lower</span>
        <span className="text-xs">{lowerProbability}%</span>
      </button>
    </div>
  );
};

export default CardControls;