import React, { useState, useEffect } from 'react';
import Loader from '../../../../components/Loader';
import ConfirmDialog from '../../../../components/ConfirmDialog';
import { useFetchData } from '../../../../hooks/useFetchData';
import { useAuthToken } from '../../../../store/routes';
import { useUser } from '../../../../store/profile';
import { useErrorMessage } from '../../store';
import PlinkoResource from '../../logics/PlinkoResource';

const BetDetailLayout = ({ betID, onSetupSeeds }) => {
  const [gameDetails, setGameDetails] = useState(null);
  const [confirmationData, setConfirmationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const authToken = useAuthToken();
  const user = useUser();
  const { setErrorMessage } = useErrorMessage();
  const fetchData = useFetchData();

  // Fetch game details on component mount
  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const { data } = await fetchData(
          `/user/plinko-game/details/${betID}`,
          null,
          "GET",
          authToken
        );
        
        const payouts = PlinkoResource.PAYOUTS[data.betLog.gameValue.risk][data.betLog.gameValue.row];
        const payoutIndex = data.betLog.gameValue.path
          .map((p) => Math.round(p))
          .reduce((t, e) => t + e, 0);
          
        setGameDetails({
          ...data,
          payoutIndex,
          payouts: payouts.map((odds, i) => {
            return {
              odds,
              active: i === payoutIndex,
              fill: PlinkoResource.interpolateColorToHex(
                (2 * Math.abs(i - (payouts.length - 1) / 2)) / payouts.length,
              ),
            };
          }),
        });
      } catch (error) {
        setErrorMessage(error.message);
      }
    };
    
    if (betID) {
      fetchGameDetails();
    }
  }, [betID, authToken, fetchData, setErrorMessage]);

  // Handle verify game
  const handleVerifyGame = async () => {
    if (!gameDetails.seedHistory.serverSeed) {
      if (loading) return;
      setLoading(true);
      setConfirmationData({
        message:
          'Sorry! You need set up a new seed before validating the data (the server seed is encrypted)',
        response: (res) => {
          setConfirmationData(null);
          if (res) {
            onSetupSeeds();
          }
        },
      });
    } else {
      window.open(
        `https://nanogamesio.github.io/verify/plinko.html?s=${gameDetails.seedHistory.serverSeed}&c=${gameDetails.seedHistory.clientSeed}&h=${gameDetails.seedHistory.serverSeedHash}&n=${gameDetails.seedHistory.maxNonce}`
      );
    }
    setLoading(false);
  };

  if (!gameDetails) {
    return (
      <div style={{ height: '500px' }}>
        <Loader />
      </div>
    );
  }

  return (
    <div className="bet-detail-container scroll-view">
      <div className="bet-detail-header">
        <img
          alt=""
          className="win-state"
          src={`/assets/hilo/${gameDetails.betLog.won ? 'win.431b83d6.png' : 'lose.b4ff48b7.png'}`}
        />
        <div className="game-share">
          <svg
            xmlns="http://www.w3.org/1999/xlink"
            className="icon"
          >
            <use xlinkHref="#icon_Share"></use>
          </svg>
        </div>
        <div className="rt_info">
          <img
            alt=""
            className="avatar"
            src={gameDetails.betLog.avatar || '/assets/hilo/avatar.a1ff78fe.png'}
          />
          <div className="name">
            {gameDetails.betLog.hidden ? (
              <span className="hidden-name">
                <svg
                  xmlns="http://www.w3.org/1999/xlink"
                  className="icon"
                >
                  <use xlinkHref="#icon_Hidden"></use>
                </svg>
                Hidden
              </span>
            ) : (
              gameDetails.betLog.name
            )}
          </div>
          <div className="flex">
            <div className="betid">Betting ID: {gameDetails.betLog.betId}</div>
            <div className="verified">Verified</div>
          </div>
        </div>
        <div className="rt_time">
          {new Date(gameDetails.betLog.betTime).toLocaleDateString()}, {new Date(
            gameDetails.betLog.betTime,
          ).toLocaleTimeString()}
        </div>
        <div className="rt_items">
          <div className="item-wrap">
            <div className="label flex-center">
              <svg
                xmlns="http://www.w3.org/1999/xlink"
                className="icon amount"
              >
                <use xlinkHref="#icon_Amount"></use>
              </svg>
              Amount
            </div>
            <div className="number flex-center">
              <img
                alt=""
                className="coin-icon"
                src={gameDetails.betLog.currencyImage}
              />
              {gameDetails.betLog.betAmount.toFixed(2)}
            </div>
          </div>
          <div className="item-wrap">
            <div className="label flex-center">
              <svg
                xmlns="http://www.w3.org/1999/xlink"
                className="icon payout"
              >
                <use xlinkHref="#icon_Payout"></use>
              </svg>
              Payout
            </div>
            <div className="number flex-center">
              {gameDetails.betLog.payout.toFixed(2)}x
            </div>
          </div>
          <div className="item-wrap">
            <div className="label flex-center">
              <svg
                xmlns="http://www.w3.org/1999/xlink"
                className="icon profit"
              >
                <use xlinkHref="#icon_Profit"></use>
              </svg>
              Profit
            </div>
            <div className="number flex-center">
              <img
                alt=""
                className="coin-icon"
                src={gameDetails.betLog.currencyImage}
              />
              {gameDetails.betLog.won ? '' : '-'}
              {gameDetails.betLog.profit.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
      
      <div className="ten_res">
        {gameDetails.payouts.map((payout, index) => (
          <div 
            key={`${index}_${payout.odds}`} 
            className={`res_t ${payout.active ? 'active' : ''}`}
          >
            <svg
              fill={payout.fill}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 54 43"
            >
              <g fillRule="evenodd">
                <rect width="54" height="29" y="14" rx="2"></rect>
                <path
                  d="M2.592 0H8c8.745.873 8 5 19 5 10.066.077 10.255-4.127 19-5h5.408A2.592 2.592 0 0154 2.592v34.816A2.592 2.592 0 0151.408 40H2.592A2.592 2.592 0 010 37.408V2.592A2.592 2.592 0 012.592 0z"
                ></path>
              </g>
            </svg>
            <span>{payout.odds.toFixed(1)}x</span>
          </div>
        ))}
      </div>
      
      <div className="seed-main">
        <div className="input-wrapper">
          <div className="input-label">Server Seed</div>
          <div className="input-control">
            <input
              type="text"
              placeholder="The seed hasn't been revealed yet."
              readOnly
              value={gameDetails.seedHistory.serverSeed}
            />
          </div>
        </div>
        
        <div className="input-wrapper">
          <div className="input-label">
            <div className="seed-col">
              <div>Server Seed (hash)</div>
            </div>
          </div>
          <div className="input-control">
            <input
              type="text"
              readOnly
              value={gameDetails.seedHistory.serverSeedHash}
            />
          </div>
        </div>
        
        <div className="col">
          <div className="input-wrapper">
            <div className="input-label">Client Seed</div>
            <div className="input-control">
              <input
                type="text"
                readOnly
                value={gameDetails.seedHistory.clientSeed}
              />
            </div>
          </div>
          <div className="input-wrapper">
            <div className="input-label">nonce</div>
            <div className="input-control">
              <input type="text" readOnly value={gameDetails.betLog.nonce} />
            </div>
          </div>
        </div>
        
        <div className="game-settings">
          <div className="input-wrapper">
            <div className="input-label">Risk</div>
            <div className="input-control">
              <input
                type="text"
                readOnly
                value={['Low', 'Medium', 'High'][
                  gameDetails.betLog.gameValue.risk - 1
                ]}
              />
            </div>
          </div>
          <div className="input-wrapper">
            <div className="input-label">Row</div>
            <div className="input-control">
              <input
                type="text"
                readOnly
                value={gameDetails.betLog.gameValue.row}
              />
            </div>
          </div>
        </div>
      </div>
      
      {user && user.user_id === gameDetails.betLog.userId && (
        <div className="verify-wrap">
          <button
            disabled={loading}
            onClick={handleVerifyGame}
            className="button button-normal verify-btn"
          >
            <div className="button-inner">
              {loading ? <Loader /> : "Verify"}
            </div>
          </button>
        </div>
      )}
      
      {confirmationData && (
        <ConfirmDialog dialogData={confirmationData} />
      )}
    </div>
  );
};

export default BetDetailLayout;