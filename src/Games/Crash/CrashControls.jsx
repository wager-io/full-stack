import React, { useState } from 'react'
import ManualBetForm from './ManualBetForm'
import AutoBetForm from './AutoBetForm'

const CrashControls = ({ 
  gameState, 
  betAmount, 
  setBetAmount, 
  autoCashout, 
  setAutoCashout, 
  userBet, 
  setUserBet, 
  balance, 
  setBalance,
  history,
  handleCashout,
  handlePlaceBet
}) => {
  const [betMode, setBetMode] = useState('manual') // 'manual' or 'auto'
  
  return (
    <div className="w-full md:w-70  h-full bg-gray-800 bg-opacity-50 p-4 rounded-tr-[18px] md:rounded-tr-[0px]  rounded-br-[18px] md:rounded-br-[0px] rounded-tl-[18px] rounded-bl-[18px] space-y-5">
      {/* Mode Toggle Switch */}
      <div className="flex justify-center mb-4 ">
        {/* <div className="bg-gray-700 rounded-full p-1 flex w-64">
          <button 
            className={`flex-1 py-2 px-4 rounded-full font-medium transition-colors ${
              betMode === 'manual' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
            onClick={() => setBetMode('manual')}
          >
            Manual
          </button>
          <button 
            className={`flex-1 py-2 px-4 rounded-full font-medium transition-colors ${
              betMode === 'auto' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
            onClick={() => setBetMode('auto')}
          >
            Auto
          </button>
        </div> */}
      </div>

      <div className="mb-3 ">
        {betMode === 'manual' ? (
          <ManualBetForm
            gameState={gameState}
            betAmount={betAmount}
            setBetAmount={setBetAmount}
            userBet={userBet}
            setUserBet={setUserBet}
            balance={balance}
            setBalance={setBalance}
            handleCashout={handleCashout}
            handlePlaceBet={handlePlaceBet}
          />
        ) : (
          <AutoBetForm
            gameState={gameState}
            betAmount={betAmount}
            setBetAmount={setBetAmount}
            autoCashout={autoCashout}
            setAutoCashout={setAutoCashout}
            userBet={userBet}
            setUserBet={setUserBet}
            balance={balance}
            setBalance={setBalance}
            handlePlaceBet={handlePlaceBet}
          />
        )}
      </div>
      
    </div>
  );
};

export default CrashControls;