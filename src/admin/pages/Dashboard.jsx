import React from 'react';
import {
  People as Users,
  TrendingUp,
  TrendingDown,
  MonetizationOn,
  AccountBalance,
} from '@mui/icons-material';

// Import dashboard components
import MetricCard from '../components/dashboard/MetricCard';
import ChartContainer from '../components/dashboard/ChartContainer';
import UserGrowthChart from '../components/dashboard/UserGrowthChart';
import DepositWithdrawChart from '../components/dashboard/DepositWithdrawChart';
import MonthlyTargetChart from '../components/dashboard/MonthlyTargetChart';
import TopUsersTable from '../components/dashboard/TopUsersTable';
import TransactionNotifications from '../components/dashboard/TransactionNotifications';
import TopGameWinners from '../components/dashboard/TopGameWinners';
import AdditionalMetrics from '../components/dashboard/AdditionalMetrics';

export default function Dashboard() {
  // Sample data - in real app this would come from API
  const statsData = {
    totalUsers: 732,
    monthlyDeposit: 12000,
    monthlyWithdraw: 110000,
    totalGGR: 5700,
    totalLoss: 1800
  };

  const topUsers = [
    { id: 'U001', username: 'CryptoKing', country: 'US', balance: 1200, flag: '🇺🇸' },
    { id: 'U002', username: 'LuckyPlayer', country: 'UK', balance: 654, flag: '🇬🇧' },
    { id: 'U003', username: 'BetMaster', country: 'CA', balance: 500, flag: '🇨🇦' },
    { id: 'U004', username: 'WinnerX', country: 'AU', balance: 28750, flag: '🇦🇺' },
    { id: 'U005', username: 'GamerPro', country: 'DE', balance: 25600, flag: '🇩🇪' },
    { id: 'U006', username: 'SlotMaster', country: 'FR', balance: 23400, flag: '🇫🇷' },
    { id: 'U007', username: 'PokerAce', country: 'JP', balance: 21800, flag: '🇯🇵' },
    { id: 'U008', username: 'RoulettePro', country: 'IT', balance: 19500, flag: '🇮🇹' },
    { id: 'U009', username: 'BlackjackKing', country: 'ES', balance: 18200, flag: '🇪🇸' },
    { id: 'U010', username: 'CasinoLegend', country: 'BR', balance: 16900, flag: '🇧🇷' },
    { id: 'U011', username: 'HighRoller', country: 'NL', balance: 15600, flag: '🇳🇱' },
    { id: 'U012', username: 'VegasViper', country: 'SE', balance: 14300, flag: '🇸🇪' },
    { id: 'U013', username: 'MonacoMagic', country: 'CH', balance: 13000, flag: '🇨🇭' },
    { id: 'U014', username: 'AtlanticAce', country: 'NO', balance: 11700, flag: '🇳🇴' },
    { id: 'U015', username: 'GoldenGambler', country: 'DK', balance: 10400, flag: '🇩🇰' },
  ];

  const recentTransactions = [
    { userId: 'U001', username: 'CryptoKing', type: 'Deposit', amount: 5000, date: '2024-01-15', status: 'Completed' },
    { userId: 'U002', username: 'LuckyPlayer', type: 'Withdraw', amount: 2500, date: '2024-01-15', status: 'Pending' },
    { userId: 'U003', username: 'BetMaster', type: 'Deposit', amount: 8000, date: '2024-01-14', status: 'Completed' },
    { userId: 'U004', username: 'WinnerX', type: 'Withdraw', amount: 3200, date: '2024-01-14', status: 'Completed' },
    { userId: 'U005', username: 'GamerPro', type: 'Deposit', amount: 1500, date: '2024-01-13', status: 'Completed' },
    { userId: 'U006', username: 'SlotMaster', type: 'Withdraw', amount: 4500, date: '2024-01-13', status: 'Processing' },
    { userId: 'U007', username: 'PokerAce', type: 'Deposit', amount: 2800, date: '2024-01-12', status: 'Completed' },
    { userId: 'U008', username: 'RoulettePro', type: 'Withdraw', amount: 1800, date: '2024-01-12', status: 'Completed' },
  ];

  const topGameWinners = [
    { gameId: 'G001', gameName: 'Mega Fortune Slots', playerName: 'CryptoKing', betAmount: 500, payout: 25000 },
    { gameId: 'G002', gameName: 'Blackjack VIP', playerName: 'LuckyPlayer', betAmount: 1000, payout: 15000 },
    { gameId: 'G003', gameName: 'European Roulette', playerName: 'WinnerX', betAmount: 750, payout: 12500 },
    { gameId: 'G004', gameName: 'Lightning Baccarat', playerName: 'BetMaster', betAmount: 300, payout: 8400 },
    { gameId: 'G005', gameName: 'Starburst Slots', playerName: 'GamerPro', betAmount: 200, payout: 7200 },
    { gameId: 'G006', gameName: 'Live Dream Catcher', playerName: 'SlotMaster', betAmount: 400, payout: 6800 },
    { gameId: 'G007', gameName: 'Book of Dead', playerName: 'PokerAce', betAmount: 150, payout: 5500 },
    { gameId: 'G008', gameName: 'Crazy Time', playerName: 'RoulettePro', betAmount: 250, payout: 4750 },
  ];

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--primary-bg)' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 
          className="text-4xl font-bold mb-2"
          style={{ 
            color: 'var(--text-light)',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)'
          }}
        >
          Dashboard
        </h1>
      </div>

      {/* 3D Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Number of Users"
          value={statsData.totalUsers.toLocaleString()}
          icon={<Users />}
          trend="+12.5%"
          trendUp={true}
          description="Total registered users"
        />
        <MetricCard
          title="Total Deposit"
          value={`$${statsData.monthlyDeposit.toLocaleString()}`}
          icon={<TrendingUp />}
          trend="+18.3%"
          trendUp={true}
          description="Monthly deposit volume"
        />
        <MetricCard
          title="Total GGR"
          value={`$${statsData.totalGGR.toLocaleString()}`}
          icon={<MonetizationOn />}
          trend="+22.1%"
          trendUp={true}
          description="Gross Gaming Revenue"
        />
        <MetricCard
          title="Total Loss"
          value={`$${statsData.totalLoss.toLocaleString()}`}
          icon={<AccountBalance />}
          trend="+8.7%"
          trendUp={true}
          description="Player total losses"
        />
      </div>

      {/* Charts Section */}
      <div className="space-y-6 mb-8">
        {/* User Growth Chart - Full Width */}
        <ChartContainer title="User Growth Trend">
          <UserGrowthChart />
        </ChartContainer>
        
        {/* Deposits/Withdrawals and Monthly Target - Flex Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartContainer title="Deposits vs Withdrawals">
              <DepositWithdrawChart />
            </ChartContainer>
          </div>
          <div className="lg:col-span-1">
            <ChartContainer title="Monthly Target Progress">
              <MonthlyTargetChart />
            </ChartContainer>
          </div>
        </div>
      </div>

      {/* Tables Section - Full Width Each */}
      <div className="space-y-6 mb-8">
        <TopUsersTable users={topUsers} />
        <TransactionNotifications transactions={recentTransactions} />
      </div>

      {/* Game Winners Table */}
      <TopGameWinners winners={topGameWinners} />

      {/* Additional Metrics */}
      <AdditionalMetrics />
    </div>
  );
}
