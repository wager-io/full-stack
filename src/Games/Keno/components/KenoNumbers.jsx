import React from 'react';

/**
 * The 40-tile board.
 *
 * Four states a tile can be in, and they have to stay distinguishable —
 * "I picked it and it came up" is the whole point of the game, so it cannot
 * look like either of the two things it sits between:
 *
 *   picked            chosen, round not played yet
 *   hit               picked AND drawn  — the win
 *   drawn (not mine)  came up, wasn't picked
 *   idle              everything else
 */
const KenoNumbers = ({ selectedNumbers = [], handleNumberClick, drawn = [], hits = [], busy }) => {
  const renderNumberGrid = () => {
    const grid = [];
    for (let i = 1; i <= 40; i++) {
      const isPicked = selectedNumbers.includes(i);
      const isDrawn = drawn.includes(i);
      const isHit = hits.includes(i);

      const classes = ['number-button'];
      if (isPicked) classes.push('selected');
      if (isHit) classes.push('hit');
      else if (isDrawn) classes.push('drawn');

      grid.push(
        <button
          key={i}
          className={classes.join(' ')}
          onClick={() => handleNumberClick(i)}
          disabled={busy}
        >
          {i}
        </button>
      );
    }
    return grid;
  };

  const picked = selectedNumbers.length;
  const played = drawn.length > 0;

  return (
    <div className="right-panel">
      <div className="number-grid">{renderNumberGrid()}</div>
      <div className="selection-info-box">
        <div className="selection-info">
          {played
            ? `${hits.length} of ${picked} hit`
            : picked === 0
              ? 'Select 1 - 10 numbers to play'
              : `${picked} selected${picked < 10 ? ` — up to ${10 - picked} more` : ''}`}
        </div>
      </div>
    </div>
  );
};

export default KenoNumbers;
