import React, { useState } from 'react';
import { usePlinkoGame } from './PlinkoContext';
// import PlinkoInfoDialog from './dialogs/GameInfoDialog';

const AllBets = () => {
  const { allBets = [] } = usePlinkoGame();
  const [dialogData, setDialogData] = useState(null);
  
  // Utility functions for formatting
  const removeTrailingZeros = (numStr) => {
    return numStr.replace(/\.?0+$/, '');
  };
  
  const getSuffix = (numStr) => {
    const parts = numStr.split('.');
    if (parts.length === 1 || parts[1] === '0') return '';
    return '';
  };
  
  return (
    <>
      {/* {Boolean(dialogData) && (
        <PlinkoInfoDialog
          launchConf={dialogData}
          onClose={() => setDialogData(null)}
        />
      )} */}
      
      <div className="min-h-[30rem] p-2 iycaRo">
        {Boolean(allBets.length) ? (
          <table className="w-full border-separate border-spacing-0 iUeetX table is-hover">
            <thead>
              <tr>
                <th className="text-left font-normal text-[rgba(153,164,176,0.6)] p-3.5 num">Bet ID</th>
                <th className="text-center font-normal text-[rgba(153,164,176,0.6)] p-3.5 user">Player</th>
                <th className="text-center font-normal text-[rgba(153,164,176,0.6)] p-3.5 time">Time</th>
                <th className="text-center font-normal text-[rgba(153,164,176,0.6)] p-3.5 bet">Bet</th>
                <th className="text-center font-normal text-[rgba(153,164,176,0.6)] p-3.5 payout">Payout</th>
                <th className="text-right font-normal text-[rgba(153,164,176,0.6)] p-3.5 profit">Profit</th>
              </tr>
            </thead>
            <tbody>
              {allBets.map((bet, index) => (
                <tr
                  key={`${bet.betId}_${index}`}
                  onClick={() => {
                    setDialogData({ startScreen: 'Details', betID: bet.betId });
                  }}
                  className="cursor-pointer hover:bg-[#2D3035]"
                >
                  <td className="text-[#99A4B0] p-3.5 rounded-l-[0.625rem]">
                    <a href="/plinko" className="hash ellipsis text-inherit">
                      {bet.betId}
                    </a>
                  </td>
                  <td className="text-center text-[#99A4B0] p-3.5">
                    <a
                      className="iTDswZ user-info"
                      href={`/user/profile/${bet.userId}`}
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
                  <td className="text-center text-[#99A4B0] p-3.5">
                    {new Date(bet.betTime).toLocaleTimeString()}
                  </td>
                  <td className="text-center text-[#99A4B0] p-3.5 bet">
                    <div className="erPQzq coin notranslate monospace">
                      <img alt="" className="coin-icon" src={bet.currencyImage} />
                      <div className="amount">
                        <span className="amount-str">
                          {removeTrailingZeros(bet.betAmount.toFixed(4))}
                          <span className="suffix">{getSuffix(bet.betAmount.toFixed(4))}</span>
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="text-center text-[#99A4B0] p-3.5 payout">
                    {bet.payout.toFixed(2)}×
                  </td>
                  <td className={`text-right text-[#99A4B0] p-3.5 rounded-r-[0.625rem] profitline ${!bet.won ? 'is-lose' : 'is-win'}`}>
                    <div className="erPQzq coin notranslate monospace has-sign">
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
        ) : (
          <div className="etYRmD">
            <div className="biQums cuPxwd empty">
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

export default AllBets;