import React from 'react'

export default function CasinoSpot() {
  // Sample data for casino bets
  const casinoBets = [
    { 
      game: { name: 'Crash', icon: '🚀' }, 
      user: 'CryptoKing', 
      time: '11:30am', 
      betAmount: 12.3456, 
      multiplier: '2.34x', 
      payout: 28.8887 
    },
    { 
      game: { name: 'Dice', icon: '🎲' }, 
      user: 'LuckyPlayer', 
      time: '11:25am', 
      betAmount: 5.4321, 
      multiplier: '1.50x', 
      payout: 8.1482 
    },
    { 
      game: { name: 'Mines', icon: '💣' }, 
      user: 'RiskTaker', 
      time: '11:20am', 
      betAmount: 8.7654, 
      multiplier: '3.20x', 
      payout: 28.0493 
    },
    { 
      game: { name: 'HiLo', icon: '🎯' }, 
      user: 'CardShark', 
      time: '11:15am', 
      betAmount: 10.1234, 
      multiplier: '1.80x', 
      payout: 18.2221 
    },
    { 
      game: { name: 'Crash', icon: '🚀' }, 
      user: 'MoonShot', 
      time: '11:10am', 
      betAmount: 15.7890, 
      multiplier: '6.94x', 
      payout: 109.5757 
    },
    { 
      game: { name: 'Dice', icon: '🎲' }, 
      user: 'RollMaster', 
      time: '11:05am', 
      betAmount: 3.4567, 
      multiplier: '2.10x', 
      payout: 7.2591 
    },
    { 
      game: { name: 'Mines', icon: '💣' }, 
      user: 'BombDefuser', 
      time: '11:00am', 
      betAmount: 7.8901, 
      multiplier: '4.50x', 
      payout: 35.5055 
    }
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-[rgb(26,44,56)] rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-[rgb(15,33,46)] text-gray-300 text-xs">
            <th className="py-3 px-4 text-left">Game</th>
            <th className="py-3 px-4 text-left">User</th>
            <th className="py-3 px-4 text-left">Time</th>
            <th className="py-3 px-4 text-left">Bet Amount</th>
            <th className="py-3 px-4 text-left">Multiplier</th>
            <th className="py-3 px-4 text-left">Payout</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgb(15,33,46)]">
          {casinoBets.map((bet, index) => (
            <tr 
              key={index} 
              className={`text-gray-200 text-sm hover:bg-[rgb(47,69,83)] transition-colors ${
                index % 2 === 1 ? 'bg-[rgb(33,55,67)]' : ''
              }`}
            >
              <td className="py-3 px-4">
                <div className="flex items-center">
                  <span className="mr-2">{bet.game.icon}</span>
                  {bet.game.name}
                </div>
              </td>
              <td className="py-3 px-4">{bet.user}</td>
              <td className="py-3 px-4">{bet.time}</td>
              <td className="py-3 px-4">
                <div className="flex items-center">
                  {/* <img src="/assets/usdt-logo.png" alt="USDT" className="w-4 h-4 mr-1" /> */}
                    <svg fill="none" viewBox="0 0 96 96" className="svg-icon w-4 h-4 mr-1" > <title></title> 
                    <path fill="#26A17B" d="M96 48c0 26.51-21.49 48-48 48S0 74.51 0 48 21.49 0 48 0s48 21.49 48 48"></path>
                    <path fill="#fff" d="M53.766 52.149v-.006c-.33.024-2.031.126-5.826.126-3.03 0-5.163-.09-5.913-.126v.009c-11.664-.513-20.37-2.544-20.37-4.974 0-2.427 8.706-4.458 20.37-4.98v7.932c.762.054 2.946.183 5.964.183 3.62 0 5.436-.15 5.775-.18v-7.929c11.64.519 20.325 2.55 20.325 4.974 0 2.43-8.685 4.455-20.325 4.971m0-10.77v-7.098h16.242V23.457H25.785v10.824h16.242v7.095c-13.2.606-23.127 3.222-23.127 6.354s9.927 5.745 23.127 6.354V76.83h11.739V54.078c13.179-.606 23.082-3.219 23.082-6.348s-9.903-5.742-23.082-6.351"></path>
                    </svg>
                  {bet.betAmount.toFixed(4)}
                </div>
              </td>
              <td className="py-3 px-4 text-yellow-400">{bet.multiplier}</td>
              <td className="py-3 px-4">
                <div className="flex items-center">
                <svg fill="none" viewBox="0 0 96 96" className="svg-icon w-4 h-4 mr-1" > <title></title> 
                    <path fill="#26A17B" d="M96 48c0 26.51-21.49 48-48 48S0 74.51 0 48 21.49 0 48 0s48 21.49 48 48"></path>
                    <path fill="#fff" d="M53.766 52.149v-.006c-.33.024-2.031.126-5.826.126-3.03 0-5.163-.09-5.913-.126v.009c-11.664-.513-20.37-2.544-20.37-4.974 0-2.427 8.706-4.458 20.37-4.98v7.932c.762.054 2.946.183 5.964.183 3.62 0 5.436-.15 5.775-.18v-7.929c11.64.519 20.325 2.55 20.325 4.974 0 2.43-8.685 4.455-20.325 4.971m0-10.77v-7.098h16.242V23.457H25.785v10.824h16.242v7.095c-13.2.606-23.127 3.222-23.127 6.354s9.927 5.745 23.127 6.354V76.83h11.739V54.078c13.179-.606 23.082-3.219 23.082-6.348s-9.903-5.742-23.082-6.351"></path>
                    </svg>
                  {bet.payout.toFixed(4)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
