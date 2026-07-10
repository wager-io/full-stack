import React from 'react';

const KenoNumbers = ({ selectedNumbers, handleNumberClick }) => {
  const renderNumberGrid = () => {
    const grid = [];
    for (let i = 1; i <= 40; i++) {
      grid.push(
        <button
          key={i}
          className={`number-button ${selectedNumbers.includes(i) ? 'selected' : ''}`}
          onClick={() => handleNumberClick(i)}
        >
          {i}
        </button>
      );
    }
    return grid;
  };

  return (
    <div className="right-panel">
      <div className="number-grid">{renderNumberGrid()}</div>
       <div className="selection-info-box">
    <div className="selection-info">Select 1 - 10 numbers to play</div>
  </div>
    </div>
  );
};

export default KenoNumbers;
