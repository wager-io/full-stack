import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaBell, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { rpc, subscribeTable } from '../../lib/realtime';
import { useAuth } from '../../context/AuthContext';

/**
 * The notification bell.
 *
 * Every money transition already wrote a row to public.notifications —
 * requested, approved, sent, complete, returned, deposit received — and until
 * now nothing in the app read them. A player learned a withdrawal had moved
 * only by noticing their balance had changed.
 *
 * That gap matters more since withdrawals became manual: a request now waits
 * for a human, so "we have it, it is being reviewed" is exactly the message
 * somebody needs while nothing appears to be happening.
 *
 * Reads are RLS-scoped to the caller (0001) and every write goes through the
 * notification_* RPCs (0010) — this component passes ids, never user ids.
 */

const TYPE_ACCENT = {
  withdrawal: '#3b82f6',
  deposit: '#22c55e',
};

function timeAgo(iso) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const [list, count] = await Promise.all([
      supabase
        .from('notifications')
        .select('id, type, title, message, data, read, created_at')
        .order('created_at', { ascending: false })
        .limit(30),
      rpc('notification_unread_count'),
    ]);
    if (!list.error) setItems(list.data ?? []);
    if (count.code === 0) setUnread(Number(count.data ?? 0));
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  // Live, because the interesting ones arrive while the player is sitting
  // there: an administrator approves a withdrawal and the badge should move
  // without a refresh.
  useEffect(() => {
    if (!user?.id) return undefined;
    return subscribeTable('notifications', {
      event: 'INSERT',
      filter: `user_id=eq.${user.id}`,
      onInsert: (row) => {
        setItems((prev) => [row, ...prev].slice(0, 30));
        setUnread((n) => n + 1);
        toast.success(row.title, { description: row.message });
      },
    });
  }, [user?.id]);

  // Click-away. Without it the panel covers the page on mobile with no way back.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const markRead = async (id) => {
    setItems((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnread((n) => Math.max(0, n - 1));
    const res = await rpc('notification_mark_read', { p_id: id });
    if (res.code !== 0) load();          // put it back the way the server sees it
  };

  const markAllRead = async () => {
    setItems((p) => p.map((n) => ({ ...n, read: true })));
    setUnread(0);
    const res = await rpc('notification_mark_all_read');
    if (res.code !== 0) load();
  };

  const remove = async (id) => {
    setItems((p) => p.filter((n) => n.id !== id));
    const res = await rpc('notification_delete', { p_id: id });
    if (res.code !== 0) load();
  };

  if (!user?.id) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 text-gray-300 hover:text-white transition-colors"
        aria-label={unread > 0 ? `${unread} unread notifications` : 'Notifications'}
      >
        <FaBell size={18} />
        {unread > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ background: '#ef4444' }}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-[330px] max-w-[92vw] rounded-lg shadow-2xl z-50 overflow-hidden"
          style={{ background: '#0d2636', border: '1px solid #1e3a4a' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#1e3a4a' }}>
            <span className="text-sm font-semibold text-gray-200">Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-blue-400 hover:text-blue-300">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto">
            {loading && items.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-gray-500">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-gray-500">Nothing yet</p>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  className="px-4 py-3 border-b last:border-b-0 flex gap-2 group"
                  style={{
                    borderColor: '#1e3a4a',
                    background: n.read ? 'transparent' : 'rgba(59,130,246,0.06)',
                  }}
                >
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: n.read ? 'transparent' : (TYPE_ACCENT[n.type] ?? '#3b82f6') }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-200">{n.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 break-words">{n.message}</p>
                    {/* The hash is the thing a player actually wants: something
                        they can paste into an explorer while they wait. */}
                    {n.data?.tx_hash && (
                      <a
                        href={`https://tronscan.org/#/transaction/${n.data.tx_hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-400 hover:text-blue-300 underline break-all"
                      >
                        View transaction
                      </a>
                    )}
                    <p className="text-[10px] text-gray-600 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.read && (
                      <button onClick={() => markRead(n.id)} title="Mark read"
                        className="text-gray-500 hover:text-green-400">
                        <FaCheck size={11} />
                      </button>
                    )}
                    <button onClick={() => remove(n.id)} title="Remove"
                      className="text-gray-500 hover:text-red-400">
                      <FaTimes size={11} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
