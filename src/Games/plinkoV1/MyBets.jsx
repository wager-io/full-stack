import React, { useState, useEffect } from 'react';
import { usePlinkoGame } from './PlinkoContext';
import PlinkoInfoDialog from './dialogs/GameInfoDialog';
import useFormatter from '../hooks/formatter';

const MyBets = () => {
  const { plinkoGame } = usePlinkoGame();
  const [myBets, setMyBets] = useState([]);
  const [dialogData, setDialogData] = useState(null);
  const { removeTrailingZeros, getSuffix } = useFormatter();

  // Update myBets when plinkoGame changes
  useEffect(() => {
    if (!plinkoGame) return;
    
    const updateMyBets = () => {
      setMyBets(plinkoGame.myBets || []);
    };
    
    // Initial update
    updateMyBets();
    
    // Subscribe to bet updates
    const unsubscribe = plinkoGame.subscribeToMyBets(updateMyBets);
    
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
      startScreen: "Details",
      betID: betId,
    });
  };

  // Prevent default link behavior
  const handleLinkClick = (e) => {
    e.preventDefault();
  };

  return (
    <>
      {dialogData && (
        <PlinkoInfoDialog
          launchConf={dialogData}
          onClose={handleCloseDialog}
        />
      )}
      
      <div className="sc-eZhRLC iycaRo">
        {myBets.length > 0 ? (
          <table className="sc-gWXbKe iUeetX table is-hover">
            <thead>
              <tr>
                <th className="num">Bet ID</th>
                <th className="time">Time</th>
                <th className="bet">Bet</th>
                <th className="payout">Payout</th>
                <th className="profit">Profit</th>
              </tr>
            </thead>
            <tbody>
              {myBets.map((bet, index) => (
                <tr
                  key={`${index}_${bet.betId}`}
                  onClick={() => handleRowClick(bet.betId)}
                >
                  <td>
                    <a
                      href="/"
                      onClick={handleLinkClick}
                      className="hash ellipsis"
                    >
                      {bet.betId}
                    </a>
                  </td>
                  <td>{new Date(bet.betTime).toLocaleTimeString()}</td>
                  <td className="bet">
                    <div className="sc-Galmp erPQzq coin notranslate monospace">
                      <img alt="" className="coin-icon" src={bet.currencyImage} />
                      <div className="amount">
                        <span className="amount-str">
                          {removeTrailingZeros(bet.betAmount.toFixed(4))}
                          <span style={{ marginLeft: "-3px" }} className="suffix">
                            {getSuffix(bet.betAmount.toFixed(4))}
                          </span>
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="payout">{bet.odds.toFixed(2)}x</td>
                  <td className={`profitline ${bet.won ? 'is-win' : 'is-lose'}`}>
                    <div className="sc-Galmp erPQzq coin notranslate monospace has-sign">
                      <img alt="" className="coin-icon" src={bet.currencyImage} />
                      <div className="amount">
                        <span className="amount-str">
                          {bet.won ? "+" : ""}
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
      </div>
    </>
  );
};

export default MyBets;
