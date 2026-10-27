import React, { useState } from 'react';
import { toast } from 'sonner';
import KenoController from './KenoController';
import KenoNumbers from './KenoNumbers';
import KenoFooter from './KenoFooter';
import { rpc } from '../../../lib/realtime';
import '../Keno.css';

/**
 * Keno.
 *
 * The Bet button used to be `console.log('Bet placed')` — the board worked,
 * the picks worked, and nothing was ever wagered. It now calls keno_play
 * (0021), which validates the picks, debits through place_bet, draws, and
 * settles in one transaction.
 *
 * The draw is NOT made here. A client that decides its own numbers decides its
 * own winnings; the server draws from the seed pair and returns the result
 * plus the nonce and server-seed hash so the round can be verified afterwards.
 */

// Only 'classic' is priced in keno_paytable. The other three risk levels are
// in the schema but have no rows, and a bet against an empty paytable pays
// zero on every outcome — so the selector is limited rather than left to look
// like it works. Adding them is a data change, not a code one.
const SUPPORTED_RISKS = ['Classic'];

const KenoLayout = () => {
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [betAmount, setBetAmount] = useState('0.00');
  const [risk, setRisk] = useState('Classic');
  const [drawn, setDrawn] = useState([]);
  const [hits, setHits] = useState([]);
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const handleNumberClick = (number) => {
    if (busy) return;                       // picks are locked while a round resolves
    // Starting a new selection clears the previous round, so the board never
    // shows last round's draw next to this round's picks.
    if (drawn.length) { setDrawn([]); setHits([]); setLastResult(null); }

    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== number));
    } else if (selectedNumbers.length < 10) {
      setSelectedNumbers([...selectedNumbers, number]);
    }
  };

  const handleAutoPick = () => {
    if (busy) return;
    const numbers = [];
    while (numbers.length < 10) {
      const n = Math.floor(Math.random() * 40) + 1;
      if (!numbers.includes(n)) numbers.push(n);
    }
    setSelectedNumbers(numbers);
    setDrawn([]); setHits([]); setLastResult(null);
  };

  const handleClearTable = () => {
    if (busy) return;
    setSelectedNumbers([]); setDrawn([]); setHits([]); setLastResult(null);
  };

  const handleBetControl = (op) => {
    const n = Number.parseFloat(betAmount) || 0;
    setBetAmount((op === 'half' ? n / 2 : n * 2).toFixed(2));
  };

  const handleBet = async () => {
    const amount = Number.parseFloat(betAmount);

    // Checked here so an obviously-bad bet fails under the button instead of
    // after a round trip. keno_play re-checks every one of these; this is
    // convenience, not control.
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Enter a bet amount');
      return;
    }
    if (selectedNumbers.length < 1 || selectedNumbers.length > 10) {
      toast.error('Pick between 1 and 10 numbers');
      return;
    }

    setBusy(true);
    setDrawn([]); setHits([]); setLastResult(null);
    try {
      const res = await rpc('keno_play', {
        p_amount: Number(amount.toFixed(2)),
        p_picks: selectedNumbers,
        p_risk: risk.toLowerCase(),
        p_currency: 'USDT',
      });

      if (res.code !== 0) {
        const raw = res.message ?? '';
        const known = {
          insufficient_balance: 'Not enough balance for that bet.',
          invalid_amount_precision: 'Bet cannot be smaller than one cent.',
          invalid_amount: 'Enter a valid bet amount.',
          invalid_pick_count: 'Pick between 1 and 10 numbers.',
          duplicate_picks: 'The same number was picked twice.',
          pick_out_of_range: 'Numbers must be between 1 and 40.',
          account_not_active: 'Your account is not active.',
          not_authenticated: 'Please sign in again.',
        };
        const key = Object.keys(known).find((k) => raw.includes(k));
        toast.error(key ? known[key] : raw);
        return;
      }

      // The RPC returns a single row; supabase-js gives it back as an array.
      const r = Array.isArray(res.data) ? res.data[0] : res.data;
      if (!r) { toast.error('No result returned'); return; }

      setDrawn(r.drawn ?? []);
      setHits(r.hits ?? []);
      setLastResult(r);

      const payout = Number(r.payout ?? 0);
      if (payout > 0) {
        toast.success(`${r.hit_count} hit${r.hit_count === 1 ? '' : 's'} — ${r.multiplier}x, $${payout.toFixed(2)}`);
      } else {
        toast(`${r.hit_count} hit${r.hit_count === 1 ? '' : 's'} — no win`);
      }
    } catch (err) {
      console.error('keno_play failed:', err);
      toast.error('Could not place the bet');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="keno-wrapper">
      <div className="keno-container">
        <KenoController
          betAmount={betAmount}
          setBetAmount={setBetAmount}
          risk={risk}
          setRisk={setRisk}
          supportedRisks={SUPPORTED_RISKS}
          handleAutoPick={handleAutoPick}
          handleClearTable={handleClearTable}
          handleBet={handleBet}
          handleBetControl={handleBetControl}
          busy={busy}
          lastResult={lastResult}
        />
        <KenoNumbers
          selectedNumbers={selectedNumbers}
          handleNumberClick={handleNumberClick}
          drawn={drawn}
          hits={hits}
          busy={busy}
        />
      </div>
      <KenoFooter />
    </div>
  );
};

export default KenoLayout;
