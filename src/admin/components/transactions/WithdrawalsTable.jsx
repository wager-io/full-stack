import React, { useState, useEffect, useCallback } from 'react';
import { Search, Check, Close, Refresh, ContentCopy } from '@mui/icons-material';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { rpc, invoke } from '../../../lib/realtime';

/**
 * The withdrawal review queue.
 *
 * Two sections, because they answer different questions. The QUEUE is work:
 * everything waiting on a human, oldest first. The HISTORY is the record:
 * what already settled, newest first.
 *
 * APPROVED rows stay in the queue even though nobody needs to approve them
 * again. Their funds are held but not yet sent, and dropping them at approval
 * would hide money that is mid-flight from the only screen watching it.
 *
 * Nothing here is the control. The server refuses a single approval on a large
 * withdrawal whatever this component renders, and it decides the threshold —
 * `required` arrives with each row rather than being duplicated as a constant
 * on the client, so the two can never disagree.
 */

const STATE_STYLE = {
  REQUESTED:    { color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b' },
  APPROVED:     { color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6' },
  BROADCASTING: { color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid #8b5cf6' },
  CONFIRMED:    { color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e' },
  ROLLED_BACK:  { color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444' },
};

const STATE_LABEL = {
  REQUESTED: 'Awaiting review',
  APPROVED: 'Approved — sending',
  BROADCASTING: 'Sent — confirming',
  CONFIRMED: 'Complete',
  ROLLED_BACK: 'Returned',
};

const money = (n) =>
  Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const truncate = (s, head = 10, tail = 8) =>
  !s ? '—' : s.length <= head + tail + 3 ? s : `${s.slice(0, head)}...${s.slice(-tail)}`;

const formatDate = (d) => (d ? new Date(d).toLocaleString() : '—');

export default function WithdrawalsTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [queue, setQueue] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  // Per-row, so approving one withdrawal does not grey out the rest.
  const [busy, setBusy] = useState({});

  const load = useCallback(async () => {
    setLoading(true);

    const [queueRes, historyRes] = await Promise.all([
      rpc('withdrawal_queue', { p_limit: 200 }),
      supabase
        .from('withdrawals')
        .select('order_id, user_id, amount, currency, chain, address, tx_hash, state, failure_reason, created_at, settled_at')
        .in('state', ['CONFIRMED', 'ROLLED_BACK'])
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    if (queueRes.code !== 0) {
      toast.error(`Could not load the queue: ${queueRes.message}`);
      setQueue([]);
    } else {
      setQueue(queueRes.data ?? []);
    }

    if (historyRes.error) {
      toast.error(`Could not load history: ${historyRes.error.message}`);
      setHistory([]);
    } else {
      setHistory(historyRes.data ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (orderId, body, successMessage) => {
    setBusy((b) => ({ ...b, [orderId]: true }));
    try {
      const res = await invoke('withdrawal-dispatch', { order_id: orderId, ...body });

      if (res.code !== 0 || res.data?.success === false) {
        toast.error(res.data?.message ?? res.message ?? 'Action failed');
        // Reload anyway: a failed dispatch may still have moved the row — a
        // gateway refusal rolls it back, and the screen should show that.
        await load();
        return;
      }

      toast.success(successMessage(res.data));
      await load();
    } finally {
      setBusy((b) => ({ ...b, [orderId]: false }));
    }
  };

  const approve = (row) => {
    // A courtesy confirm, not a control. The server refuses a single approval
    // above the threshold regardless of what happens in this dialog.
    if (row.required > 1) {
      const signed = row.approved_by ?? 0;
      const ok = window.confirm(
        `$${money(row.amount)} needs ${row.required} separate approvals ` +
        `(${signed} so far).\n\nConfirm your approval?`
      );
      if (!ok) return;
    }

    act(row.order_id, { action: 'approve' }, (data) =>
      data?.dispatched
        ? `Approved and sent — $${money(row.amount)}`
        : `Approval recorded (${data?.approvals ?? 0} of ${data?.required ?? row.required})`
    );
  };

  const reject = (row) => {
    const reason = window.prompt(`Reject the $${money(row.amount)} withdrawal. Reason:`);
    if (reason === null) return;   // cancelled — not the same as an empty reason
    act(row.order_id, { action: 'reject', reason }, () => 'Withdrawal returned to the player');
  };

  // For an APPROVED row whose dispatch did not complete — the gateway was
  // unreachable, or the submission succeeded but the state write did not.
  const retry = (row) =>
    act(row.order_id, { action: 'dispatch' }, () => 'Dispatch retried');

  const copy = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copied'))
      .catch(() => toast.error('Could not copy'));
  };

  const term = searchTerm.trim().toLowerCase();
  const matches = (row) =>
    !term ||
    row.order_id?.toLowerCase().includes(term) ||
    row.username?.toLowerCase().includes(term) ||
    row.email?.toLowerCase().includes(term) ||
    row.address?.toLowerCase().includes(term);

  const filteredQueue = queue.filter(matches);
  const filteredHistory = history.filter(matches);

  const heldTotal = queue
    .filter((r) => r.state === 'APPROVED')
    .reduce((sum, r) => sum + Number(r.amount ?? 0), 0);
  const pendingTotal = queue
    .filter((r) => r.state === 'REQUESTED')
    .reduce((sum, r) => sum + Number(r.amount ?? 0), 0);

  const cellStyle = { color: 'var(--text-light)' };
  const headStyle = { color: 'var(--text-light)' };

  return (
    <div>
      {/* Totals. The two figures mean different things and are deliberately not
          added together: one is money already taken out of spendable balances,
          the other is money still fully the player's. */}
      <div className="flex flex-wrap gap-4 mb-6">
        <SummaryCard label="Awaiting review" value={`$${money(pendingTotal)}`} accent="#f59e0b"
          hint={`${queue.filter((r) => r.state === 'REQUESTED').length} request(s) — balance not yet held`} />
        <SummaryCard label="Held in clearing" value={`$${money(heldTotal)}`} accent="#3b82f6"
          hint={`${queue.filter((r) => r.state === 'APPROVED').length} approved — funds held, awaiting send`} />
      </div>

      {/* Search + refresh */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search style={{ color: 'var(--text-dark)', fontSize: '20px' }} />
          </div>
          <input
            type="text"
            placeholder="Search by order ID, player or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{
              background: 'linear-gradient(145deg, #1a1d2e, #15182a)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-light)',
              fontSize: '14px'
            }}
          />
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="px-4 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105 disabled:opacity-50"
          style={{
            color: 'var(--accent-purple)',
            background: 'rgba(106, 13, 173, 0.1)',
            border: '1px solid var(--accent-purple)',
            fontSize: '14px'
          }}
        >
          <Refresh fontSize="small" />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* ---------------- Review queue ---------------- */}
      <h3 className="text-base font-semibold mb-3" style={headStyle}>
        Review queue
        <span className="ml-2 text-sm font-normal" style={{ color: 'var(--text-dark)' }}>
          oldest first
        </span>
      </h3>

      <div className="overflow-x-auto mb-10">
        <table className="w-full">
          <thead>
            <tr className="border-b-2" style={{ borderColor: 'var(--accent-purple)' }}>
              {['Player', 'Amount', 'Destination', 'Requested', 'Status', 'Approvals', 'Action'].map((h) => (
                <th key={h}
                  className={`py-4 px-4 text-sm font-semibold ${h === 'Action' ? 'text-center' : 'text-left'}`}
                  style={headStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow colSpan={7} title="Loading withdrawals..." />
            ) : filteredQueue.length === 0 ? (
              <EmptyRow
                colSpan={7}
                title={term ? 'No matching withdrawals' : 'Nothing waiting'}
                subtitle={term ? 'Try adjusting your search' : 'Every withdrawal has been dealt with'}
              />
            ) : (
              filteredQueue.map((row, index) => (
                <tr key={row.order_id}
                  className="border-b transition-all duration-200"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                  }}>
                  <td className="py-4 px-4 text-sm" style={cellStyle}>
                    <div className="font-medium">{row.username || '—'}</div>
                    <div className="text-xs" style={{ color: 'var(--text-dark)' }}>{row.email}</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-dark)' }}>
                      VIP {row.vip_level} · wagered ${money(row.total_wager)}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-sm font-bold" style={{ color: '#ff6b6b' }}>
                    ${money(row.amount)}
                    <div className="text-xs font-normal" style={{ color: 'var(--text-dark)' }}>
                      {row.currency} · {row.chain}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-sm font-mono" style={cellStyle}>
                    <div className="flex items-center gap-1">
                      <span title={row.address}>{truncate(row.address)}</span>
                      <button onClick={() => copy(row.address)}
                        className="opacity-60 hover:opacity-100" title="Copy address">
                        <ContentCopy style={{ fontSize: '14px' }} />
                      </button>
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-dark)' }}>
                      {truncate(row.order_id, 8, 6)}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-sm" style={{ color: 'var(--text-dark)' }}>
                    {formatDate(row.created_at)}
                  </td>

                  <td className="py-4 px-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                      style={STATE_STYLE[row.state]}>
                      {STATE_LABEL[row.state] ?? row.state}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-sm" style={cellStyle}>
                    <span style={{
                      color: row.approved_by >= row.required ? '#22c55e' : 'var(--text-light)'
                    }}>
                      {row.approved_by} / {row.required}
                    </span>
                    {row.required > 1 && (
                      <div className="text-xs" style={{ color: '#f59e0b' }}>
                        two-person
                      </div>
                    )}
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      {row.state === 'REQUESTED' ? (
                        <>
                          <ActionButton onClick={() => approve(row)} disabled={busy[row.order_id]}
                            accent="#22c55e" title="Approve" icon={Check} />
                          <ActionButton onClick={() => reject(row)} disabled={busy[row.order_id]}
                            accent="#ef4444" title="Reject and return the funds" icon={Close} />
                        </>
                      ) : (
                        <>
                          {/* APPROVED: funds are held. It either needs sending
                              again, or returning. */}
                          <ActionButton onClick={() => retry(row)} disabled={busy[row.order_id]}
                            accent="#3b82f6" title="Retry sending to the gateway" icon={Refresh} />
                          <ActionButton onClick={() => reject(row)} disabled={busy[row.order_id]}
                            accent="#ef4444" title="Cancel and return the funds" icon={Close} />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ---------------- Settled ---------------- */}
      <h3 className="text-base font-semibold mb-3" style={headStyle}>
        Recently settled
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2" style={{ borderColor: 'var(--accent-purple)' }}>
              {['Order', 'Amount', 'Transaction', 'Status', 'Settled'].map((h) => (
                <th key={h} className="text-left py-4 px-4 text-sm font-semibold" style={headStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length === 0 ? (
              <EmptyRow colSpan={5} title="No settled withdrawals yet" />
            ) : (
              filteredHistory.map((row, index) => (
                <tr key={row.order_id}
                  className="border-b transition-all duration-200"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                  }}>
                  <td className="py-4 px-4 text-sm font-mono" style={{ color: 'var(--accent-purple)' }}>
                    {truncate(row.order_id, 8, 6)}
                  </td>
                  <td className="py-4 px-4 text-sm font-bold" style={{ color: '#ff6b6b' }}>
                    ${money(row.amount)}
                  </td>
                  <td className="py-4 px-4 text-sm font-mono" style={cellStyle}>
                    {row.tx_hash ? (
                      <div className="flex items-center gap-1">
                        <span title={row.tx_hash}>{truncate(row.tx_hash)}</span>
                        <button onClick={() => copy(row.tx_hash)}
                          className="opacity-60 hover:opacity-100" title="Copy hash">
                          <ContentCopy style={{ fontSize: '14px' }} />
                        </button>
                      </div>
                    ) : '—'}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                      style={STATE_STYLE[row.state]}>
                      {STATE_LABEL[row.state] ?? row.state}
                    </span>
                    {/* The internal reason, which is admin-only on purpose — the
                        player is told the outcome and not this text. */}
                    {row.failure_reason && (
                      <div className="text-xs mt-1 max-w-[220px] truncate"
                        style={{ color: 'var(--text-dark)' }} title={row.failure_reason}>
                        {row.failure_reason}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-sm" style={{ color: 'var(--text-dark)' }}>
                    {formatDate(row.settled_at ?? row.created_at)}
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

function SummaryCard({ label, value, hint, accent }) {
  return (
    <div className="rounded-xl px-5 py-4 flex-1 min-w-[220px]"
      style={{
        background: 'linear-gradient(145deg, #1a1d2e, #15182a)',
        border: `1px solid ${accent}40`,
      }}>
      <div className="text-xs mb-1" style={{ color: 'var(--text-dark)' }}>{label}</div>
      <div className="text-2xl font-bold" style={{ color: accent }}>{value}</div>
      <div className="text-xs mt-1" style={{ color: 'var(--text-dark)' }}>{hint}</div>
    </div>
  );
}

function ActionButton({ onClick, disabled, accent, title, icon }) {
  const Icon = icon;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="p-2 rounded-lg transition-all duration-200 hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
      style={{ color: accent, background: `${accent}1a`, border: `1px solid ${accent}` }}
    >
      <Icon fontSize="small" />
    </button>
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
