import React, { useState, useEffect, useCallback } from 'react';
import { Search, Refresh, ContentCopy } from '@mui/icons-material';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';

/**
 * Deposits, from the database.
 *
 * This screen listed eight invented rows. That is worse than an empty table:
 * "I deposited and it hasn't arrived" is the most common support request a
 * casino gets, and an operator looking here would have been reading fiction
 * while the real row sat unexamined.
 *
 * Until 0022 an admin could not read `tron_deposits` at all — its RLS policy
 * was `user_id = auth.uid()` with no admin clause, unlike every other money
 * table. So this screen could not have shown the truth even if it had asked.
 *
 * Rejected deposits are shown, not hidden. A deposit refused for the wrong
 * contract or too few confirmations is exactly what somebody is calling about.
 */

const STATUS_STYLE = {
  completed: { color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e' },
  pending:   { color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b' },
  rejected:  { color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444' },
};

const money = (n) =>
  Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const truncate = (s, head = 10, tail = 8) =>
  !s ? '—' : s.length <= head + tail + 3 ? s : `${s.slice(0, head)}...${s.slice(-tail)}`;

export default function DepositsTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tron_deposits')
      .select('tx_hash, user_id, address, amount, credited_usd, credited_at, rejected_reason, created_at, profiles(username,email)')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      toast.error(`Could not load deposits: ${error.message}`);
      setRows([]);
    } else {
      setRows(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const copy = (t) =>
    navigator.clipboard.writeText(t).then(() => toast.success('Copied')).catch(() => toast.error('Could not copy'));

  const statusOf = (d) =>
    d.credited_at ? 'completed' : d.rejected_reason ? 'rejected' : 'pending';

  const term = searchTerm.trim().toLowerCase();
  const filtered = rows.filter((d) =>
    !term ||
    d.tx_hash?.toLowerCase().includes(term) ||
    d.address?.toLowerCase().includes(term) ||
    d.profiles?.username?.toLowerCase().includes(term) ||
    d.profiles?.email?.toLowerCase().includes(term)
  );

  const creditedTotal = rows
    .filter((d) => d.credited_at)
    .reduce((s, d) => s + Number(d.credited_usd ?? 0), 0);

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-6">
        <SummaryCard label="Credited" value={`$${money(creditedTotal)}`} accent="#22c55e"
          hint={`${rows.filter((d) => d.credited_at).length} deposit(s)`} />
        <SummaryCard label="Rejected" value={String(rows.filter((d) => d.rejected_reason).length)} accent="#ef4444"
          hint="wrong contract, unconfirmed, or under a cent" />
      </div>

      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search style={{ color: 'var(--text-dark)', fontSize: '20px' }} />
          </div>
          <input
            type="text"
            placeholder="Search by tx hash, address or player..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{
              background: 'linear-gradient(145deg, #1a1d2e, #15182a)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-light)', fontSize: '14px',
            }}
          />
        </div>
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
              {['Player', 'Transaction', 'Amount', 'Credited (USD)', 'Status', 'Date'].map((h) => (
                <th key={h} className="text-left py-4 px-4 text-sm font-semibold" style={{ color: 'var(--text-light)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
              <EmptyRow colSpan={6} title="Loading deposits..." />
            ) : filtered.length === 0 ? (
              <EmptyRow colSpan={6}
                title={term ? 'No matching deposits' : 'No deposits yet'}
                subtitle={term ? 'Try adjusting your search' : 'They appear here as the watcher credits them'} />
            ) : (
              filtered.map((d, i) => {
                const status = statusOf(d);
                return (
                  <tr key={d.tx_hash} className="border-b" style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                  }}>
                    <td className="py-4 px-4 text-sm" style={{ color: 'var(--text-light)' }}>
                      <div className="font-medium">{d.profiles?.username || '—'}</div>
                      <div className="text-xs" style={{ color: 'var(--text-dark)' }}>{d.profiles?.email}</div>
                    </td>
                    <td className="py-4 px-4 text-sm font-mono" style={{ color: 'var(--text-light)' }}>
                      <div className="flex items-center gap-1">
                        <a href={`https://tronscan.org/#/transaction/${d.tx_hash}`} target="_blank" rel="noreferrer"
                          className="underline" style={{ color: 'var(--accent-purple)' }} title={d.tx_hash}>
                          {truncate(d.tx_hash)}
                        </a>
                        <button onClick={() => copy(d.tx_hash)} className="opacity-60 hover:opacity-100" title="Copy hash">
                          <ContentCopy style={{ fontSize: '14px' }} />
                        </button>
                      </div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-dark)' }} title={d.address}>
                        {truncate(d.address, 8, 6)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm" style={{ color: 'var(--text-light)' }}>
                      {Number(d.amount).toFixed(6)} USDT
                    </td>
                    <td className="py-4 px-4 text-sm font-bold" style={{ color: d.credited_at ? '#22c55e' : 'var(--text-dark)' }}>
                      {d.credited_at ? `+$${money(d.credited_usd)}` : '—'}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap" style={STATUS_STYLE[status]}>
                        {status}
                      </span>
                      {/* The reason is the answer to the support ticket. */}
                      {d.rejected_reason && (
                        <div className="text-xs mt-1" style={{ color: 'var(--text-dark)' }}>{d.rejected_reason}</div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm" style={{ color: 'var(--text-dark)' }}>
                      {new Date(d.created_at).toLocaleString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, hint, accent }) {
  return (
    <div className="rounded-xl px-5 py-4 flex-1 min-w-[220px]"
      style={{ background: 'linear-gradient(145deg, #1a1d2e, #15182a)', border: `1px solid ${accent}40` }}>
      <div className="text-xs mb-1" style={{ color: 'var(--text-dark)' }}>{label}</div>
      <div className="text-2xl font-bold" style={{ color: accent }}>{value}</div>
      <div className="text-xs mt-1" style={{ color: 'var(--text-dark)' }}>{hint}</div>
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
