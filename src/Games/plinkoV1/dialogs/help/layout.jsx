import React from 'react';

const PlinkoHelpLayout = ({ onClick }) => {
    // Handle click on help menu items
    const handleClick = (screen) => {
      if (onClick) {
        onClick(screen);
      }
    };

    return (
      <div className="help-layout scroll-view">
        <div className="help-list">
          <div onClick={() => handleClick("What Game Is This?")}>
            <span>What Game Is This?</span>
            <svg
              xmlns="http://www.w3.org/1999/xlink"
              className="icon"
            >
              <use xlinkHref="#icon_Arrow"></use>
            </svg>
          </div>
          <div onClick={() => handleClick("Fairness")}>
            <span>Fairness</span>
            <svg
              xmlns="http://www.w3.org/1999/xlink"
              className="icon"
            >
              <use xlinkHref="#icon_Arrow"></use>
            </svg>
          </div>
        </div>
      </div>
    );
};

export default PlinkoHelpLayout;