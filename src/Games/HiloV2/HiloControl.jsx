import React, { useState, useEffect } from 'react';
import { useHiloGame } from './context/HiloContext';
import useDeck from "./hooks/deck";
const { getCardRank, ranks } = useDeck();

const HiloControl = () => {
  const { 
    hiloGame, 
    processingRequest, 
    newGame,
    setBetAmount, 
    betAmount,
    handleHiloNextRound, 
    handleBet, 
    handleCashOut,
    controlStats, 
    setControlStats,
    hasActiveGame,
    gameInitialized,
    startNewGame // Use the startNewGame function from context
  } = useHiloGame();

  let currentRound = {};
  useEffect(() => {
    if (hiloGame?.bet_id) {
      setControlStats(hiloGame);
    }
  }, [hiloGame, setControlStats]);

    
  useEffect(()=>{
    if (hiloGame?.bet_id) {
     setBetAmount(hiloGame.bet_amount);

       currentRound = hiloGame.rounds.map((r) => ({
        rank: getCardRank(r.card),
      }))[hiloGame.rounds.length - 1];
      
      const { hi_chance, lo_chance } = hiloGame;
      const _bet_amount = hiloGame.bet_amount + hiloGame.profit;

      const probability_higher = hi_chance / 100;
      const probability_lower = lo_chance / 100;

      // House edge
      const house_edge = 1 / 100;

      // Calculate no-edge multipliers
      const multiplier_higher = 1 / probability_higher;
      const multiplier_lower = 1 / probability_lower;

      // Adjust multipliers for house edge
      const hiMultiplier = multiplier_higher * (1 - house_edge);
      const loMultiplier = multiplier_lower * (1 - house_edge);

      // Calculating profits
      const hiProfit = (_bet_amount * hiMultiplier - _bet_amount).toFixed(5);
      const loProfit = (_bet_amount * loMultiplier - _bet_amount).toFixed(5);

      setControlStats({
        profit: hiloGame.profit.toFixed(6),
        payout: hiloGame.payout.toFixed(4),
        hiProfit,
        loProfit,
        hiMultiplier: hiMultiplier.toFixed(4),
        loMultiplier: loMultiplier.toFixed(4),
        hiChance: hi_chance.toFixed(2),
        loChance: lo_chance.toFixed(2),
        hiGuess:
          currentRound.rank === ranks[0]
            ? 3
            : currentRound.rank === ranks[ranks.length - 1]
              ? 4
              : 5,
        loGuess:
          currentRound.rank === ranks[0]
            ? 4
            : currentRound.rank === ranks[ranks.length - 1]
              ? 2
              : 6,
      });
    }
  }, [hiloGame, setBetAmount, setControlStats])

  const handleBetAmountChange = (e) => {
    setBetAmount(e.target.value);
  };

  const handleHalveBet = () => {
    setBetAmount(prevAmount => Math.max(0.01, parseFloat((prevAmount / 2).toFixed(2))));
  };

  const handleDoubleBet = () => {
    const currentAmount = Number(betAmount);
    const doubledAmount = parseFloat((currentAmount * 2).toFixed(2));
    setBetAmount(doubledAmount);
  };

  const handleSubmit = () => {
    handleBet({
      token: 'usdt',
      token_img: '/assets/tokens/usdt.png',
      bet_amount: parseFloat(betAmount)
    });
  };

  const handleHigher = () => {
    handleHiloNextRound({ hi: true, lo: false, skip: false });
  };

  const handleLower = () => {
    handleHiloNextRound({ hi: false, lo: true, skip: false });
  };

  const handleSkip = () => {
    handleHiloNextRound({ hi: false, lo: false, skip: true });
  };

  // Determine if bet amount controls should be disabled
  const isBetAmountDisabled = hasActiveGame;
  
  // Determine if game action buttons should be disabled
  const areGameActionsDisabled = !hasActiveGame;

  // Determine if bet button should be disabled - only when processing or not initialized
  const isBetButtonDisabled = processingRequest || !gameInitialized;
  
  // Determine if cashout button should be disabled - only when processing
  const isCashoutButtonDisabled = processingRequest;

  // Calculate current profit for cashout button
  const currentProfit = hiloGame?.profit || 0;
  const currentPayout = hiloGame?.payout || 1;
  const cashoutAmount = hiloGame ? (hiloGame.bet_amount * currentPayout).toFixed(2) : 0;

  return (
    <div className="game-sidebar svelte-1dz8jt" style={{ minHeight: "0px" }}>
      <label className="stacked svelte-1ww0eyq">
        <div className="input-wrap svelte-1w7n5sk">
          <div className="input-content svelte-1w7n5sk">
            <div className="after-icon svelte-1w7n5sk">
              <svg fill="none" viewBox="0 0 96 96" className="svg-icon " style={{}}>
                <title></title>
                <path fill="#26A17B" d="M96 48c0 26.51-21.49 48-48 48S0 74.51 0 48 21.49 0 48 0s48 21.49 48 48"></path>
                <path fill="#fff" d="M53.766 52.149v-.006c-.33.024-2.031.126-5.826.126-3.03 0-5.163-.09-5.913-.126v.009c-11.664-.513-20.37-2.544-20.37-4.974 0-2.427 8.706-4.458 20.37-4.98v7.932c.762.054 2.946.183 5.964.183 3.62 0 5.436-.15 5.775-.18v-7.929c11.64.519 20.325 2.55 20.325 4.974 0 2.43-8.685 4.455-20.325 4.971m0-10.77v-7.098h16.242V23.457H25.785v10.824h16.242v7.095c-13.2.606-23.127 3.222-23.127 6.354s9.927 5.745 23.127 6.354V76.83h11.739V54.078c13.179-.606 23.082-3.219 23.082-6.348s-9.903-5.742-23.082-6.351"></path>
              </svg>
            </div>
            <input
              autoComplete="on"
              className="input spacing-expanded svelte-1w7n5sk pl-3"
              type="number"
              data-test="input-game-amount"
              data-bet-amount-active-currency="usdt"
              step="1e-8"
              disabled={isBetAmountDisabled}
              value={betAmount}
              onChange={handleBetAmountChange}
            />
          </div>
          <div className="input-button-wrap svelte-1w7n5sk">
            <button
              type="button"
              tabIndex="0"
              className="inline-flex relative items-center gap-2 justify-center rounded-sm font-semibold whitespace-nowrap ring-offset-background transition disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] bg-grey-400 text-white hover:bg-grey-300 hover:text-white focus-visible:outline-white text-sm leading-none py-[0.8125rem] px-[1rem] shadow-none"
              data-testid="amount-halve"
              data-test="amount-halve"
              data-button-root=""
              onClick={handleHalveBet}
              disabled={isBetAmountDisabled}
            >
              ½
            </button>
            <button
              type="button"
              tabIndex="0"
              className="inline-flex relative items-center gap-2 justify-center rounded-sm font-semibold whitespace-nowrap ring-offset-background transition disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] bg-grey-400 text-white hover:bg-grey-300 hover:text-white focus-visible:outline-white text-sm leading-none py-[0.8125rem] px-[1rem] shadow-none"
              data-test="amount-double"
              data-testid="amount-double"
              data-button-root=""
              onClick={handleDoubleBet}
              disabled={isBetAmountDisabled}
            >
              2×
            </button>
          </div>
        </div>
        <span className="label-content full-width svelte-1dxhb9v">
          <div className="label-left-wrapper svelte-1w7n5sk">
            <span slot="label">Bet Amount</span>
          </div>
        </span>
      </label>
      <button
        type="button"
        tabIndex="0"
        className="inline-flex relativ items-center gap-2 justify-center rounded-sm font-semibold whitespace-nowrap ring-offset-background transition disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] bg-grey-400 text-white hover:bg-grey-300 hover:text-white focus-visible:outline-white text-sm leading-none shadow-md py-[0.8125rem] px-[1rem]"
        data-test-action-enabled="false"
        data-testid="higher-button"
        data-test="higher-button"
        disabled={areGameActionsDisabled}
        data-button-root=""
        onClick={handleHigher}
      >
        <span> {controlStats.hiGuess === 4
                  ? "Same"
                  : currentRound?.rank === ranks[0]
                    ? "Higher"
                    : "Higher or Same"}</span>
        <svg fill="currentColor" viewBox="0 0 64 64" className="svg-icon " style={{ color: "#ffce00" }}>
          <title></title>
          <path d="M32.271 17 9.201 40.071 16.128 47l16.145-16.145L48.418 47l6.93-6.929L32.275 17z"></path>
        </svg>
        <span>
          <span className="weight-semibold line-height-default align-left size-default text-size-default variant-subtle numeric with-icon-space svelte-794yvu" style={{}}>
            {controlStats.hiChance}%
          </span>
        </span>
      </button>
      <button
        type="button"
        tabIndex="0"
        className="inline-flex relative items-center gap-2 justify-center rounded-sm font-semibold whitespace-nowrap ring-offset-background transition disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] bg-grey-400 text-white hover:bg-grey-300 hover:text-white focus-visible:outline-white text-sm leading-none shadow-md py-[0.8125rem] px-[1rem]"
        data-test-action-enabled="false"
        data-testid="lower-button"
        data-test="lower-button"
        disabled={areGameActionsDisabled}
        data-button-root=""
        onClick={handleLower}
      >
        <span>  {controlStats.loGuess === 4
                  ? "Same"
                  : currentRound?.rank === ranks[ranks.length - 1]
                    ? "Lower"
                    : "Lower or Same"}</span>
        <svg fill="currentColor" viewBox="0 0 64 64" className="svg-icon " style={{ color: "#7F47FD" }}>
          <title></title>
          <path d="M0 15.365h64v11.428H0zm0 21.842h64v11.428H0z"></path>
        </svg>
        <span>
          <span className="weight-semibold line-height-default align-left size-default text-size-default variant-subtle numeric with-icon-space svelte-794yvu" style={{}}>
            {controlStats.loChance}%
          </span>
        </span>
      </button>
      <button
        type="button"
        tabIndex="0"
        className="inline-flex relative items-center gap-2 justify-center rounded-sm font-semibold whitespace-nowrap ring-offset-background transition disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] bg-grey-400 text-white hover:bg-grey-300 hover:text-white focus-visible:outline-white text-sm leading-none shadow-md py-[0.9375rem] px-[1.25rem]"
        data-action-enabled="true"
        data-testid="skip-button"
        data-test="skip-button"
        data-button-root=""
        disabled={areGameActionsDisabled}
        onClick={handleSkip}
      >
        <span>Skip Card</span>
        <svg fill="currentColor" viewBox="0 0 64 64" className="svg-icon " style={{}}>
          <title></title>
          <path fillRule="evenodd" d="m0 49.74 7.793 7.794L33.328 32 7.793 6.466 0 14.259 17.74 32zm30.672 0 7.793 7.794L64 32 38.465 6.466l-7.793 7.793L48.412 32z" clipRule="evenodd"></path>
        </svg>
      </button>
      
      {/* Conditional rendering for Bet/Cashout button */}
      {hasActiveGame ? (
        <button
          type="button"
          tabIndex="0"
          className="inline-flex relative items-center gap-2 justify-center rounded-sm font-semibold whitespace-nowrap ring-offset-background transition disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] bg-yellow-500 text-neutral-black hover:bg-yellow-400 hover:text-neutral-black focus-visible:outline-white text-base leading-none shadow-md py-[1.125rem] px-[1.75rem]"
          data-testid="cashout-button"
          data-test="cashout-button"
          data-analytics="cashout-button"
          data-button-root=""
          disabled={isCashoutButtonDisabled || currentProfit <= 0}
          onClick={handleCashOut}
        >
          <div data-loader-content="" className="contents">
            <span>Cash Out {currentProfit > 0 ? cashoutAmount : ''}</span>
            {currentProfit > 0 && (
              <span className="text-green-400 ml-1">
                (+{currentProfit.toFixed(2)})
              </span>
            )}
          </div>
        </button>
      ) : (
        <button
          type="button"
          tabIndex="0"
          className="inline-flex relative items-center gap-2 justify-center rounded-sm font-semibold whitespace-nowrap ring-offset-background transition disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] bg-green-500 text-neutral-black hover:bg-green-400 hover:text-neutral-black focus-visible:outline-white text-base leading-none shadow-md py-[1.125rem] px-[1.75rem]"
          data-testid="bet-button"
          data-test="bet-button"
          data-analytics="bet-button"
          data-test-action-enabled="true"
          data-button-root=""
          disabled={processingRequest}
          onClick={handleSubmit}
        >
          <div data-loader-content="" className="contents">
            {processingRequest ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <span>Bet</span>
            )}
          </div>
        </button>
      )}
    </div>
  );
};
export default HiloControl;