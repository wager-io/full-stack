import React, { useState, useEffect, useCallback } from 'react';
import { Search, Refresh } from '@mui/icons-material';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';

/**
 * Bills — every money event, as it happened.
 *
 * `bills` is the activity log the player's own transaction history reads:
 * one row per movement, with the balance it left behind. Deposits, bets,
 * wins, withdrawal refunds.
 *
 * It is single-sided on purpose — it records that a balance moved, not where
 * the money came from. The double-entry account of that is `ledger_entries`
 * (0017), which covers deposits and withdrawals. The two answer different
 * questions and this screen is the first one: what happened to this player.
 */

const money = (n) =>
  Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Credits green, debits red — a bet and a win are the same table and must not
// read the same at a glance.
const amountColor = (n) => (Number(n) >= 0 ? '#22c55e' : '#ff6b6b');

export default function BillsTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bills')
      .select('id, user_id, transaction_type, token_name, trx_amount, balance, bill_id, created_at, profiles(username,email)')
      .order('created_at', { ascending: false })
      .limit(300);

    if (error) {
      toast.error(`Could not load bills: ${error.message}`);
      setRows([]);
    } else {
      setRows(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Built from the data rather than hardcoded: the set of transaction types
  // grows whenever a new money path is added, and a fixed list would quietly
  // stop showing the newest one.
  const types = ['all', ...Array.from(new Set(rows.map((r) => r.transaction_type).filter(Boolean))).sort()];

  const term = searchTerm.trim().toLowerCase();
  const filtered = rows.filter((r) =>
    (typeFilter === 'all' || r.transaction_type === typeFilter) &&
    (!term ||
      r.bill_id?.toLowerCase().includes(term) ||
      r.profiles?.username?.toLowerCase().includes(term) ||
      r.profiles?.email?.toLowerCase().includes(term))
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search style={{ color: 'var(--text-dark)', fontSize: '20px' }} />
          </div>
          <input
            type="text"
            placeholder="Search by reference or player..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{
              background: 'linear-gradient(145deg, #1a1d2e, #15182a)',
              border: '1px solid var(--border-color)', color: 'var(--text-light)', fontSize: '14px',
            }}
          />
        </div>

        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-3 rounded-lg focus:outline-none"
          style={{
            background: 'linear-gradient(145deg, #1a1d2e, #15182a)',
            border: '1px solid var(--border-color)', color: 'var(--text-light)', fontSize: '14px',
          }}>
          {types.map((t) => <option key={t} value={t}>{t === 'all' ? 'All types' : t}</option>)}
        </select>

        <button onClick={load} disabled={loading}
          className="px-4 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105 disabled:opacity-50"
          style={{ color: 'var(--accent-purple)', background: 'rgba(106, 13, 173, 0.1)', border: '1px solid var(--accent-purple)', fontSize: '14px' }}>
          <Refresh fontSize="small" />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2" style={{ borderColor: 'var(--accent-purple)' }}>
              {['Player', 'Type', 'Amount', 'Balance after', 'Reference', 'Date'].map((h) => (
                <th key={h} className="text-left py-4 px-4 text-sm font-semibold" style={{ color: 'var(--text-light)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
              <EmptyRow colSpan={6} title="Loading bills..." />
            ) : filtered.length === 0 ? (
              <EmptyRow colSpan={6}
                title={term || typeFilter !== 'all' ? 'No matching entries' : 'No activity yet'}
                subtitle={term || typeFilter !== 'all' ? 'Try adjusting the filters' : 'Every money movement is logged here'} />
            ) : (
              filtered.map((r, i) => (
                <tr key={r.id} className="border-b" style={{
                  borderColor: 'var(--border-color)',
                  backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                }}>
                  <td className="py-4 px-4 text-sm" style={{ color: 'var(--text-light)' }}>
                    <div className="font-medium">{r.profiles?.username || '—'}</div>
                    <div className="text-xs" style={{ color: 'var(--text-dark)' }}>{r.profiles?.email}</div>
                  </td>
                  <td className="py-4 px-4 text-sm" style={{ color: 'var(--text-light)' }}>{r.transaction_type}</td>
                  <td className="py-4 px-4 text-sm font-bold" style={{ color: amountColor(r.trx_amount) }}>
                    {Number(r.trx_amount) >= 0 ? '+' : '−'}${money(Math.abs(Number(r.trx_amount)))}
                    <span className="text-xs font-normal ml-1" style={{ color: 'var(--text-dark)' }}>{r.token_name}</span>
                  </td>
                  <td className="py-4 px-4 text-sm" style={{ color: 'var(--text-light)' }}>
                    {r.balance == null ? '—' : `$${money(r.balance)}`}
                  </td>
                  <td className="py-4 px-4 text-xs font-mono" style={{ color: 'var(--text-dark)' }}>{r.bill_id || '—'}</td>
                  <td className="py-4 px-4 text-sm" style={{ color: 'var(--text-dark)' }}>
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyRow({ colSpan, title, subtitle }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-12 text-center" style={{ color: 'var(--text-dark)' }}>
        <div className="flex flex-col items-center gap-2">
          <Search style={{ fontSize: '40px', opacity: 0.4 }} />
          <p className="text-lg">{title}</p>
          {subtitle && <p className="text-sm">{subtitle}</p>}
        </div>
      </td>
    </tr>
  );
}
