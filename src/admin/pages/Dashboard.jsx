import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { rpc } from '../../lib/realtime';
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
  // Every figure here used to be a literal. They looked plausible, which is
  // what made them dangerous: an operator reading "732 users" had no way to
  // tell it was decoration.
  //
  // admin_dashboard_stats (0022) computes them together from one snapshot.
  // Five separate client queries would be five points in time, and a
  // dashboard whose halves disagree is worse than one that is merely slow.
  const [stats, setStats] = useState(null);
  const [topUsers, setTopUsers] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [topGameWinners, setTopGameWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [s, activity, players, winners] = await Promise.all([
      rpc('admin_dashboard_stats'),
      rpc('admin_recent_activity', { p_limit: 8 }),
      supabase.from('profiles')
        .select('id, username, country, balance')
        .order('balance', { ascending: false }).limit(15),
      supabase.from('bets')
        .select('bet_id, game, bet_amount, payout, display_name')
        .eq('state', 'won').order('payout', { ascending: false }).limit(8),
    ]);

    if (s.code !== 0) toast.error(`Could not load stats: ${s.message}`);
    else setStats(s.data);

    if (activity.code === 0) {
      setRecentTransactions((activity.data ?? []).map((a) => ({
        userId: a.user_id,
        username: a.username ?? '—',
        type: a.kind === 'deposit' ? 'Deposit' : 'Withdraw',
        amount: Number(a.amount ?? 0),
        date: new Date(a.created_at).toLocaleDateString(),
        status: a.status,
      })));
    }

    if (!players.error) {
      setTopUsers((players.data ?? []).map((u) => ({
        id: u.id,
        username: u.username ?? '—',
        country: u.country ?? '—',
        balance: Number(u.balance ?? 0),
        // No flag emoji. `country` is free text on profiles, so mapping it to
        // a flag would be a guess rendered as a fact.
        flag: '',
      })));
    }

    if (!winners.error) {
      setTopGameWinners((winners.data ?? []).map((b) => ({
        gameId: b.bet_id,
        gameName: b.game,
        // Null when the player opted out of public listings — the privacy rule
        // is enforced at write time, so there is genuinely no name to show.
        playerName: b.display_name ?? 'Hidden',
        betAmount: Number(b.bet_amount ?? 0),
        payout: Number(b.payout ?? 0),
      })));
    }

    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const statsData = {
    totalUsers: stats?.players_total ?? 0,
    monthlyDeposit: Number(stats?.deposits_total ?? 0),
    monthlyWithdraw: Number(stats?.withdrawals_paid ?? 0),
    totalGGR: Number(stats?.gross_gaming_revenue ?? 0),
    totalLoss: Number(stats?.paid_out_total ?? 0),
  };




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
        {/* Said out loud, because every number on this page starts at zero
            while the queries are in flight — and a dashboard briefly showing
            "0 users" reads as a catastrophe rather than as a spinner. */}
        <p className="text-sm" style={{ color: 'var(--text-dark)' }}>
          {loading ? 'Loading live figures…' : 'Live figures from the database'}
        </p>
      </div>

      {/* 3D Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Number of Users"
          value={statsData.totalUsers.toLocaleString()}
          icon={<Users />}
          description={`${stats?.players_active ?? 0} active`}
        />
        <MetricCard
          title="Total Deposit"
          value={`$${statsData.monthlyDeposit.toLocaleString()}`}
          icon={<TrendingUp />}
          description={`${stats?.deposits_count ?? 0} credited deposit(s)`}
        />
        <MetricCard
          title="Total GGR"
          value={`$${statsData.totalGGR.toLocaleString()}`}
          icon={<MonetizationOn />}
          description={`${stats?.bets_total ?? 0} settled bets`}
        />
        <MetricCard
          title="Paid Out"
          value={`$${statsData.totalLoss.toLocaleString()}`}
          icon={<AccountBalance />}
          description={`${stats?.withdrawals_pending ?? 0} withdrawal(s) awaiting action`}
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
