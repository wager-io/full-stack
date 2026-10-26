import React, { useState } from 'react';
import api from '../../lib/apiCompat';
import { toast } from 'sonner';
import { FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Withdraw: USDT on TRC-20, reviewed before it is sent.
 *
 * Denominated in USD because that is what the balance holds and what gets held
 * in clearing while the request is reviewed. USDT tracks it 1:1, so there is
 * no rate to quote and nothing for the client to compute — a client-supplied
 * valuation next to a server-held one is an open exchange rate.
 *
 * The currency and network pickers are gone with the single-asset move. What
 * is left is the only thing a player actually decides: how much, and where to.
 */

// Same shape the database enforces (0020). Checked here too so a mistyped
// address fails under the field rather than after a round trip — the server
// remains the authority.
const TRON_ADDRESS = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;

export default function WithdrawTab() {
  const { balance } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const available = Number(balance ?? 0);
  const usd = Number.parseFloat(amount);
  const trimmed = address.trim();

  const addressLooksWrong = trimmed.length > 0 && !TRON_ADDRESS.test(trimmed);
  const amountTooBig = Number.isFinite(usd) && usd > available;

  const canSubmit =
    Number.isFinite(usd) && usd > 0 && !amountTooBig &&
    TRON_ADDRESS.test(trimmed) && !submitting;

  const handleWithdraw = async () => {
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      const res = await api.post('/api/ccpayment/withdraw', {
        amount: usd,          // USD; USDT 1:1
        address: trimmed,
      });

      if (res.data.success) {
        toast.success('Withdrawal requested — it is now awaiting review');
        setAddress('');
        setAmount('');
        navigate('/transactions/withdraw');
      } else {
        toast.error(res.data.message || 'Could not create the withdrawal request');
      }
    } catch (err) {
      console.error('Error creating withdrawal request:', err);
      toast.error(err.response?.data?.message || 'Could not create the withdrawal request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full max-h-[calc(100vh-200px)] overflow-y-auto flex flex-col">
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-800 rounded-lg">
        <div>
          <div className="text-xs text-gray-400">Currency</div>
          <div className="text-sm font-medium text-white">USDT</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">Network</div>
          <div className="text-sm font-medium text-white">TRON (TRC20)</div>
        </div>
      </div>

      <div className="space-y-4 mb-4">
        <div className="space-y-1">
          <label className="text-xs text-gray-400">TRON (TRC-20) address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="T..."
            spellCheck="false"
            className={`w-full p-2.5 bg-gray-800 border rounded-md text-white text-sm focus:outline-none focus:ring-2 ${
              addressLooksWrong
                ? 'border-red-600 focus:ring-red-500'
                : 'border-gray-700 focus:ring-blue-500'
            }`}
          />
          {addressLooksWrong && (
            <p className="text-xs text-red-400">
              A TRON address starts with T and is 34 characters long.
            </p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs text-gray-400">Amount (USD)</label>
            <button
              type="button"
              onClick={() => setAmount(available.toFixed(2))}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Available: ${available.toFixed(2)}
            </button>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            className={`w-full p-2.5 bg-gray-800 border rounded-md text-white text-sm focus:outline-none focus:ring-2 ${
              amountTooBig
                ? 'border-red-600 focus:ring-red-500'
                : 'border-gray-700 focus:ring-blue-500'
            }`}
          />
          {amountTooBig && (
            <p className="text-xs text-red-400">That is more than your available balance.</p>
          )}
          {Number.isFinite(usd) && usd > 0 && !amountTooBig && (
            <p className="text-xs text-gray-400">You will receive {usd.toFixed(2)} USDT.</p>
          )}
        </div>

        <button
          onClick={handleWithdraw}
          disabled={!canSubmit}
          className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {submitting ? 'Processing...' : 'Request withdrawal'}
        </button>

        {/* Said plainly, because it is the thing that generates support
            tickets otherwise: the balance does not change yet, and a human
            looks at this before any money moves. */}
        <p className="text-xs text-gray-400 text-center">
          Withdrawals are reviewed and sent manually. Your balance is not
          deducted until the request is approved.
        </p>
      </div>

      <div className="mt-auto">
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="flex items-center text-xs text-blue-400 hover:text-blue-300 mb-1"
        >
          <FaInfoCircle className="mr-1" />
          {showInfo ? 'Hide' : 'Show'} withdrawal information
        </button>
        {showInfo && (
          <div className="text-xs text-gray-400 bg-gray-800 p-2 rounded-md space-y-1">
            <p>• Reviewed by an administrator before being sent</p>
            <p>• Once approved, the amount is held and no longer spendable</p>
            <p>• You will be notified when it is sent and again when it lands</p>
            <p>• Only one withdrawal can be open at a time</p>
          </div>
        )}
      </div>

      {TRON_ADDRESS.test(trimmed) && (
        <div className="bg-yellow-900 bg-opacity-20 border border-yellow-800 rounded-md p-3 flex items-start mt-3">
          <FaExclamationTriangle className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-yellow-200">
            <strong>Check the address carefully.</strong> It must accept USDT on
            the TRON (TRC-20) network. Funds sent to a wrong address cannot be
            recovered.
          </p>
        </div>
      )}
    </div>
  );
}
