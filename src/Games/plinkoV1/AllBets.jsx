import React, { useState, useEffect } from 'react';
import { usePlinkoGame } from './PlinkoContext';
import PlinkoInfoDialog from './dialogs/GameInfoDialog';
import useFormatter from '../hooks/formatter';

const AllBets = () => {
  const { plinkoGame } = usePlinkoGame();
  const [recentBets, setRecentBets] = useState([]);
  const [dialogData, setDialogData] = useState(null);
  const { removeTrailingZeros, getSuffix } = useFormatter();

  // Update recentBets when plinkoGame changes
  useEffect(() => {
    if (!plinkoGame) return;
    
    const updateRecentBets = () => {
      setRecentBets(plinkoGame.allBets || []);
    };
    
    // Initial update
    updateRecentBets();
    
    // Subscribe to bet updates
    const unsubscribe = plinkoGame.subscribeToAllBets(updateRecentBets);
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [plinkoGame]);

  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogData(null);
  };

  // Handle row click to show bet details
  const handleRowClick = (betId) => {
    setDialogData({
      startScreen: 'Details',
      betID: betId
    });
  };

  return (
    <>
      {Boolean(recentBets.length) ? (
        <div className="sc-eZhRLC iycaRo">
          <table className="sc-gWXbKe iUeetX table is-hover">
            <thead>
              <tr>
                <th className="num">Bet ID</th>
                <th className="user">Player</th>
                <th className="time">Time</th>
                <th className="bet">Bet</th>
                <th className="payout">Payout</th>
                <th className="profit">Profit</th>
              </tr>
            </thead>
            <tbody>
              {recentBets.map((bet, index) => (
                <tr
                  key={`${bet.betId}_${index}`}
                  onClick={() => handleRowClick(bet.betId)}
                >
                  <td>
                    <a href="/plinko" className="hash ellipsis" onClick={(e) => e.preventDefault()}>
                      {bet.betId}
                    </a>
                  </td>
                  <td>
                    <a
                      className="sc-jUosCB iTDswZ user-info"
                      href={`/user/profile/${bet.userId}`}
                      onClick={(e) => e.preventDefault()}
                    >
                      <div className="name">
                        {bet.hidden ? (
                          <span
                            style={{ display: "inline-flex", gap: "2px", justifyContent: "center" }}
                            className="hidden-name"
                          >
                            <svg
                              xmlns="http://www.w3.org/1999/xlink"
                              className="sc-gsDKAQ hxODWG icon"
                            >
                              <use xlinkHref="#icon_Hidden"></use>
                            </svg>
                            Hidden
                          </span>
                        ) : (
                          bet.name
                        )}
                      </div>
                    </a>
                  </td>
                  <td>{new Date(bet.betTime).toLocaleTimeString()}</td>
                  <td className="bet">
                    <div className="sc-Galmp erPQzq coin notranslate monospace">
                      <img alt="" className="coin-icon" src={bet.currencyImage} />
                      <div className="amount">
                        <span className="amount-str">
                          {removeTrailingZeros(bet.betAmount.toFixed(4))}
                          <span className="suffix">
                            {getSuffix(bet.betAmount.toFixed(4))}
                          </span>
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="payout">{bet.payout.toFixed(2)}×</td>
                  <td className={`profitline ${!bet.won ? 'is-lose' : 'is-win'}`}>
                    <div className="sc-Galmp erPQzq coin notranslate monospace has-sign">
                      <img alt="" className="coin-icon" src={bet.currencyImage} />
                      <div className="amount">
                        <span className="amount-str">
                          {bet.won ? '+' : ''}
                          {removeTrailingZeros(
                            (bet.won
                              ? bet.betAmount * bet.payout - bet.betAmount
                              : bet.betAmount * bet.payout
                            ).toFixed(4)
                          )}
                          <span className="suffix">
                            {getSuffix(
                              (bet.won
                                ? bet.betAmount * bet.payout - bet.betAmount
                                : bet.betAmount * bet.payout
                              ).toFixed(4)
                            )}
                          </span>
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="sc-epFoly etYRmD">
          <div className="sc-eCImPb biQums cuPxwd empty">
            <img
              alt="No data"
              src="https://static.nanogames.io/assets/empty.acd1f5fe.png"
            />
            <div className="msg">Oops! There is no data yet!</div>
          </div>
        </div>
      )}

      {Boolean(dialogData) && (
        <PlinkoInfoDialog
          launchConf={dialogData}
          onClose={handleCloseDialog}
        />
      )}
    </>
  );
};

export default AllBets;