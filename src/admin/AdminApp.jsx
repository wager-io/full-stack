// The whole admin panel, mounted by the main app at /admin/* (see src/App.jsx).
// Converted from the old createBrowserRouter setup to a descendant <Routes>
// so it composes inside the frontend's single BrowserRouter. Route element
// paths are relative to /admin; nav links use absolute /admin/... paths.
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './admin.css';
import Layout from './components/Layout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Users = lazy(() => import('./pages/Users'));
const Reports = lazy(() => import('./pages/Reports'));
const Transactions = lazy(() => import('./pages/Transactions'));
const NotFound = lazy(() => import('./pages/NotFound'));

const DepositsTable = lazy(() => import('./components/transactions/DepositsTable'));
const WithdrawalsTable = lazy(() => import('./components/transactions/WithdrawalsTable'));
const BillsTable = lazy(() => import('./components/transactions/BillsTable'));
const BonusTable = lazy(() => import('./components/transactions/BonusTable'));

const Fallback = () => (
  <div className="min-h-screen flex items-center justify-center text-white" style={{ background: '#1a1a2e' }}>
    Loading admin…
  </div>
);

export default function AdminApp() {
  return (
    <div className="admin-root">
      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route path="/admin" element={<Layout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="reports" element={<Reports />} />
            <Route path="transactions" element={<Transactions />}>
              <Route index element={<DepositsTable />} />
              <Route path="withdrawals" element={<WithdrawalsTable />} />
              <Route path="bills" element={<BillsTable />} />
              <Route path="bonus" element={<BonusTable />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
}
