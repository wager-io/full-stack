import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'sonner';
import { useCrashGame } from './CrashContext';
import { AuthContext } from '../../context/AuthContext';
import RecentWinsTable from './components/RecentWinsTable';
import { 
  FaCoins, 
  FaRocket, 
  FaChevronDown, 
  FaChevronUp, 
  FaUsers, 
  FaMoneyBillWave,
  FaCalculator,
  FaHandHoldingUsd,
  FaArrowRight,
  FaForward,
  FaHourglassHalf,
  FaExclamationTriangle,
  FaLock,
  FaEye
} from 'react-icons/fa';

const ManualBetForm = () => {
  const { 
    gameState, 
    betAmount, 
    setBetAmount, 
    userBet, 
    handlePlaceBet,
    handleCashout,
    bets
  } = useCrashGame();
  
  // Get auth context to check if user is logged in
  const { user, balance } = useContext(AuthContext);
  
  const [cashoutAt, setCashoutAt] = useState(2.00);
  const [nextRoundBet, setNextRoundBet] = useState(false);
  const [spectateMode, setSpectateMode] = useState(false);
  
  const handlePlaceBetClick = () => {
    // Check if user is logged in
    if (!user) {
      toast.error('Please log in to place a bet');
      return;
    }
    if (betAmount > balance) {
      toast.error('Insufficient balance');
      return;
    }
    // Check if cashout value is valid
    if (cashoutAt < 1.01) {
      toast.error('increase cashout value ');
      return;
    }
    // Place the bet (even with zero amount)
    handlePlaceBet(betAmount, cashoutAt);
  };

  const handlePlaceNextRoundBet = () => {
    // Check if user is logged in
    if (!user) {
      toast.error('Please log in to place a bet');
      return;
    }
    if (betAmount > balance) {
      toast.error('Insufficient balance');
      return;
    }
    // Check if cashout value is valid
    if (cashoutAt < 1.01) {
      toast.error('Invalid cashout value');
      return;
    }
    setNextRoundBet(true);
  };
  
  // Effect to place the bet when the game status changes to 'starting'
  useEffect(() => {
    if (nextRoundBet && gameState.status === 'starting' && !userBet) {
      handlePlaceBet(betAmount, cashoutAt);
      setNextRoundBet(false);
    }
  }, [nextRoundBet, gameState.status, userBet, betAmount, cashoutAt, handlePlaceBet]);
  
  const handleHalfAmount = () => {
    setBetAmount(prevAmount => Math.max(0, Math.floor(prevAmount / 2)));
  };
  
  const handleDoubleAmount = () => {
    const currentAmount = Number(betAmount);
    const doubledAmount = currentAmount * 2;
    setBetAmount(doubledAmount);
  };
  
  const handleIncreaseCashout = () => {
    setCashoutAt(prev => Number((prev + 0.1).toFixed(2)));
  };
  
  const handleDecreaseCashout = () => {
    setCashoutAt(prev => Number(Math.max(1.01, (prev - 0.1).toFixed(2))));
  };
  
  // Calculate potential profit
  const calculateProfit = () => {
    if (!betAmount || !cashoutAt) return 0;
    const profit = betAmount * cashoutAt;
    return profit.toFixed(2);
  };
  
  const handleCancelNextRoundBet = () => {
    setNextRoundBet(false);
  };
  
  // Toggle spectate mode
  const toggleSpectateMode = () => {
    if (spectateMode) {
      setSpectateMode(false);
      setBetAmount(1); // Set a default bet amount when exiting spectate mode
    } else {
      setSpectateMode(true);
      setBetAmount(0); // Set bet amount to 0 for spectate mode
    }
  };

  return (
    <div className="space-y-4">
      {/* Bet Amount Section */}
      <div className=" bg-opacity-50 ">
        <label className="flex items-center text-sm mb-2 text-gray-300">
          <FaCoins className="mr-2 text-yellow-500" />
          Bet Amount
        </label>
        <div className="relative flex items-center">
          <div className="absolute left-3 flex items-center pointer-events-none">
            <img 
              src="/assets/token/usdt.png" 
              alt="USDT" 
              className="w-5 h-5 mr-1" 
            />
          </div>
          <input 
            type="text" 
            onChange={(e) => {
              // Handle empty input case
              if (e.target.value === '') {
                setBetAmount(''); // Allow empty string
              } else {
                // Only update if it's a valid number
                const value = parseFloat(e.target.value)
                if (!isNaN(value)) {
                  setBetAmount(value)
                }
              }
            }}
            placeholder='0.00'
            value={betAmount === '' ? '' : betAmount}
            className="w-full p-3 pl-10 pr-28 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <div className="absolute right-2 flex space-x-2">
            <button 
              onClick={handleHalfAmount}
              className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded text-sm font-medium transition-colors flex items-center"
              title="Half amount"
            >
              <span>½</span>
            </button>
            <button 
              onClick={handleDoubleAmount}
              className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded text-sm font-medium transition-colors flex items-center"
              title="Double amount"
            >
              <span>2×</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Cashout Section */}
      <div className=" bg-opacity-50">
        <label className="flex items-center text-sm mb-2 text-gray-300">
          <FaRocket className="mr-2 text-blue-400" />
          Auto Cashout At
        </label>
        <div className="relative flex items-center">
          <div className="absolute left-3 flex items-center pointer-events-none text-gray-400">
            <span>×</span>
          </div>
          <input 
            type="number" 
            value={cashoutAt}
            onChange={(e) => setCashoutAt(Number(e.target.value))}
            min="1.01"
            step="0.1"
            className="w-full p-3 pl-8 pr-28 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <div className="absolute right-2 flex space-x-2">
            <button 
              onClick={handleDecreaseCashout}
              className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded text-sm font-medium transition-colors"
              title="Decrease multiplier"
            >
              <FaChevronDown />
            </button>
            <button 
              onClick={handleIncreaseCashout}
              className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded text-sm font-medium transition-colors"
              title="Increase multiplier"
            >
              <FaChevronUp />
            </button>
          </div>
        </div>
      </div>
      
      {/* Profit Calculation */}
      <div className=" bg-opacity-50">
        <label className="flex items-center text-sm mb-2 text-gray-300">
          <FaCalculator className="mr-2 text-green-400" />
          Profit on Win
        </label>
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg text-white">
          <div className="flex items-center">
            <FaArrowRight className="mr-2 text-green-400" />
            <span className="font-medium">{calculateProfit()}</span>
          </div>
          <div className="flex items-center">
            <img 
              src="/assets/token/usdt.png" 
              alt="USDT" 
              className="w-5 h-5 ml-2" 
            />
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="pt-2 space-y-2">
        {/* Place Bet Button - Only show when game is starting and user has no active bet */}
        {!userBet && gameState.status === 'starting' && (
          <button 
            className={`w-full py-3 bg-blue-600 hover:bg-blue-500  rounded-lg text-sm font-bold transition-colors flex items-center justify-center`}
            onClick={handlePlaceBetClick}
          >
            {!user ? (
              <>
                <FaLock className="mr-2" />
                Login to Bet
              </>
            ) : (
              <>
                 Bet
              </>
            )}
          </button>
        )}
        
        {/* Bet Next Round Button - Show when game is running and user has no active bet */}
        {!userBet && gameState.status === 'running' && !nextRoundBet && (
          <button 
            className={`w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition-colors flex items-center justify-center`}
            onClick={handlePlaceNextRoundBet}
          >
            {!user ? (
              <>
                <FaLock className="mr-2" />
                Login to Bet
              </>
            ) : (
              <>
                Bet Next Round
              </>
            )}
          </button>
        )}

        {!userBet && gameState.status === 'crashed' && !nextRoundBet && (
          <button 
            className={`w-full py-3 bg-blue-600 hover:bg-blue-500  rounded-lg text-sm font-bold transition-colors flex items-center justify-center`}
            onClick={handlePlaceNextRoundBet}
          >
            {!user ? (
              <>
                <FaLock className="mr-2" />
                Login to Bet
              </>
            ) : (
              <>
                Bet Next Round
              </>
            )}
          </button>
        )}
        
        {/* Next Round Bet Indicator - Show when user has queued a bet for next round */}
        {!userBet && nextRoundBet && (
          <button onClick={handleCancelNextRoundBet} className={`w-full py-3 bg-blue-600  rounded-lg text-sm font-medium flex items-center justify-center text-white`}>
            Cancel
          </button>
        )}
        
        {/* Cash Out Button - Show when user has an active bet and game is running */}
        {userBet && gameState.status === 'running' && (
          <button 
            className="w-full py-4 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-bold transition-colors flex items-center justify-center"
            onClick={handleCashout}
          >
            <FaMoneyBillWave className="mr-2" />
            Cash Out ({gameState.multiplier.toFixed(2)}x)
          </button>
        )}

        {/* Cash Out Button - Show when user has an active bet and game is running */}
        {userBet && gameState.status === 'starting' && (
          <button 
            className="w-full py-4 bg-blue-700 rounded-lg text-sm font-bold transition-colors flex items-center justify-center"
          >
          Starting...
          </button>
        )}
        
      </div>
    
      
      {/* Game Stats */}
 
      
      {/* Recent Wins Table */}
      <div className="mt-0">
     <div className="flex justify-between items-center mt-0">
        <div className="flex items-center text-gray-300">
          <FaUsers className="h-4 w-4 mr-2 text-blue-400" />
          <span>{bets.length}</span>
        </div>
        <div className="flex items-center text-gray-300">
          <span> {parseFloat(bets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0)).toFixed(4)}</span>
          <img 
            src="/assets/token/usdt.png" 
            alt="USDT" 
            className="w-4 h-4 ml-2" 
          />
        </div>
      </div>
        <RecentWinsTable />
      </div>
    </div>
  );
};

export default ManualBetForm;
