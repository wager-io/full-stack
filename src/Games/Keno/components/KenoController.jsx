import React from 'react';

const KenoController = ({
  betAmount,
  setBetAmount,
  risk,
  setRisk,
  handleAutoPick,
  handleClearTable,
  handleBet,
  handleBetControl,
}) => {
  return (
    <div className="left-panel">
      <div className="input-section">
        <div className="bet-header">
          <label className="input-label">Bet Amount</label>
          <div className="bet-usd-display">$0.00</div>
        </div>

        <div className="bet-input-group">
          <div className="bet-input-wrapper">
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="bet-input"
            />
            <div className="btc-icon">₿</div>
          </div>

          <div className="bet-modifiers">
            <button onClick={() => handleBetControl('half')}>½</button>
            <div className="divider" />
            <button onClick={() => handleBetControl('double')}>2×</button>
          </div>
        </div>
      </div>

      <div className="input-section">
        <label className="input-label">Risk</label>
        <select
          value={risk}
          onChange={(e) => setRisk(e.target.value)}
          className="risk-select"
        >
          <option value="Classic">Classic</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      <button className="action-button" onClick={handleAutoPick}>
        Auto Pick
      </button>

      <button className="action-button" onClick={handleClearTable}>
        Clear Table
      </button>

      <button className="bet-button" onClick={handleBet}>
        Bet
      </button>
    </div>
  );
};

export default KenoController;
