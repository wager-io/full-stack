import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import graphStore from '../store/GraphStore';
import { GameStatus } from '../models/CrashGame';
import { rpc } from '../../../lib/realtime';
import { supabase } from '../../../lib/supabase';

// File name kept for import compatibility: this hook now talks to the Postgres
// crash backend (crash_state / crash_bet / crash_cashout), not socket.io.

const POLL_MS = 1000;
const TICK_MS = 50;

const multiplierAt = (ms) => Math.floor(Math.exp(6e-5 * Math.max(0, ms)) * 100) / 100;

export default function useSocketConnection({
  user,
  setBalance,
  gameState,
  setGameState,
  setBets,
  setHistory,
  userBet,
  setUserBet
}) {
  const socketRef = useRef(null); // kept for interface compatibility; unused

  const offsetRef = useRef(0);               // serverMs - clientMs
  const bestRttRef = useRef(Infinity);
  const inFlightRef = useRef(false);
  const snapRef = useRef(null);              // last crash_state response
  const appliedRef = useRef({ key: null, roundId: null });
  const settledSeenRef = useRef(new Set());  // bet_ids already seen settled (balance synced once)
  const sigRef = useRef({ bets: '', history: '' });
  const errorShownRef = useRef(false);
  const refetchRef = useRef(() => {});

  // Balance is set absolutely by AuthContext's realtime profiles subscription, so
  // never apply deltas here: re-read the server value instead.
  const syncBalance = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
    if (data && data.balance != null) setBalance(Number(data.balance));
  }, [user?.id, setBalance]);
  const syncBalanceRef = useRef(syncBalance);
  syncBalanceRef.current = syncBalance;

  // Derive status/multiplier from the last snapshot and the synced clock, then push to state + graph.
  const applyDerived = useCallback(() => {
    const snap = snapRef.current;
    if (!snap) return;
    const round = snap.round;
    const offset = offsetRef.current;
    const prev = appliedRef.current;

    let status = 'waiting';
    let multiplier = 1;
    let timeLeft = 0;
    let crashPoint = 0;
    let hash = '';
    let startClient = null;

    if (round) {
      const beaMs = Date.parse(round.betting_ends_at);
      const serverNow = Date.now() + offset;
      startClient = beaMs - offset;
      if (round.phase === 'crashed') {
        status = 'crashed';
        crashPoint = Number(round.crash_point);
        multiplier = crashPoint;
        hash = round.hash || '';
      } else if (round.phase === 'running' || serverNow >= beaMs) {
        status = 'running';
        multiplier = multiplierAt(serverNow - beaMs);
      } else {
        status = 'starting';
        timeLeft = Math.round(Math.max(0, beaMs - serverNow) / 100) / 10;
      }
    }

    const roundId = round ? round.id : 0;
    const key = `${roundId}:${status}`;
    const changed = key !== prev.key;
    if (roundId !== prev.roundId) graphStore.resetEscapes();
    appliedRef.current = { key, roundId };

    setGameState((s) => {
      if (
        s.status === status && s.multiplier === multiplier && s.timeLeft === timeLeft &&
        s.gameId === roundId && s.crashPoint === crashPoint && s.hash === hash
      ) return s;
      return { ...s, status, multiplier, timeLeft, crashPoint, gameId: roundId, hash };
    });

    if (startClient != null) graphStore.setStartTime(startClient);
    if (status === 'running') graphStore.updateGameRate(multiplier);

    if (changed) {
      if (status === 'waiting') {
        graphStore.updateGameStatus(GameStatus.CONNECTION);
        graphStore.setGameStateMessage('Crash is starting up');
      } else {
        graphStore.clearMessages();
        if (status === 'starting') graphStore.updateGameStatus(GameStatus.STARTING);
        else if (status === 'running') graphStore.updateGameStatus(GameStatus.PROGRESS);
        else {
          graphStore.updateGameRate(crashPoint);
          graphStore.game.hash = hash;
          graphStore.game.maxRate = crashPoint;
          graphStore.updateGameStatus(GameStatus.ENDED);
        }
      }
    }
  }, [setGameState]);

  const fetchState = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      const tSent = Date.now();
      const res = await rpc('crash_state');
      const tRecv = Date.now();
      if (res.code !== 0 || !res.data) {
        graphStore.setErrorMessage('Connection error', true);
        errorShownRef.current = true;
        return;
      }
      if (errorShownRef.current) {
        errorShownRef.current = false;
        graphStore.clearMessages();
        appliedRef.current = { ...appliedRef.current, key: null }; // re-apply status message
      }
      const data = res.data;

      // Clock sync: keep the offset from the smallest round trip seen
      const rtt = tRecv - tSent;
      if (rtt <= bestRttRef.current) {
        bestRttRef.current = rtt;
        offsetRef.current = Date.parse(data.server_now) - (tSent + tRecv) / 2;
      }

      snapRef.current = data;

      // Bets list
      const bets = (data.players || []).map((p) => ({
        username: p.display_name || 'Hidden',
        name: p.display_name || 'Hidden',
        avatar: p.avatar_url || undefined,
        amount: Number(p.amount),
        cashoutMultiplier: p.cashout_multiplier != null ? Number(p.cashout_multiplier) : undefined,
        status: p.state === 'cashed' ? 'cashed_out' : p.state === 'lost' ? 'lost' : 'active'
      }));
      const betsSig = JSON.stringify(bets);
      if (betsSig !== sigRef.current.bets) {
        sigRef.current.bets = betsSig;
        setBets(bets);
      }

      // History: Crash.history reads oldest-first and reverses; server sends newest-first
      const history = (data.history || []).map((h) => ({ id: h.id, crashPoint: Number(h.crash_point) })).reverse();
      const histSig = history.map((h) => `${h.id}:${h.crashPoint}`).join(',');
      if (histSig !== sigRef.current.history) {
        sigRef.current.history = histSig;
        setHistory(history);
      }

      // My bet; sync balance once when a bet is first seen settled
      const mb = data.my_bet;
      if (mb) {
        if ((mb.state === 'cashed' || mb.state === 'lost') && !settledSeenRef.current.has(mb.bet_id)) {
          settledSeenRef.current.add(mb.bet_id);
          syncBalanceRef.current();
        }
        if (mb.state === 'active') {
          setUserBet({
            betId: mb.bet_id,
            amount: Number(mb.amount),
            autoCashout: mb.auto_cashout != null ? Number(mb.auto_cashout) : null
          });
        } else {
          setUserBet(null);
        }
      } else {
        setUserBet(null);
      }
      applyDerived();
    } finally {
      inFlightRef.current = false;
    }
  }, [applyDerived, setBets, setHistory, setUserBet]);
  refetchRef.current = fetchState;

  // Poll + realtime + local animation tick
  useEffect(() => {
    fetchState();
    const poll = setInterval(fetchState, POLL_MS);
    const tick = setInterval(applyDerived, TICK_MS);
    const channel = supabase
      .channel('crash_rounds_feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'crash_rounds' }, () => fetchState())
      .subscribe();
    return () => {
      clearInterval(poll);
      clearInterval(tick);
      supabase.removeChannel(channel);
    };
  }, [fetchState, applyDerived]);

  // Re-read my_bet when the logged-in user changes
  useEffect(() => {
    settledSeenRef.current = new Set();
    refetchRef.current();
  }, [user?.id]);

  const handlePlaceBet = useCallback(async (amount, autoCashout) => {
    if (!user) {
      toast.error('Please log in to place a bet', {
        description: 'You need to be logged in to play games'
      });
      return;
    }
    if (autoCashout < 1.01) {
      toast.error('Invalid cashout value');
      return;
    }

    const res = await rpc('crash_bet', { p_amount: amount, p_auto_cashout: autoCashout || null });
    if (res.code !== 0) {
      toast.error('Bet placement failed', {
        description: res.message || 'Failed to place bet'
      });
      return;
    }
    syncBalance();
    refetchRef.current();
  }, [user, syncBalance]);

  const handleCashout = useCallback(async () => {
    if (!userBet || gameState.status !== 'running') return;
    if (!user) {
      toast.error('Please log in to cash out', {
        description: 'You need to be logged in to play games'
      });
      return;
    }

    const res = await rpc('crash_cashout');
    if (res.code !== 0) {
      toast.error('Cashout failed', { description: res.message });
      refetchRef.current();
      return;
    }
    if (userBet.betId) settledSeenRef.current.add(userBet.betId);
    syncBalance();
    setUserBet(null);
    refetchRef.current();
  }, [user, userBet, gameState?.status, syncBalance, setUserBet]);

  return {
    socketRef,
    handlePlaceBet,
    handleCashout
  };
}
