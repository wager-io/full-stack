import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import Loader from '../common/Loader';
import QRCode from 'react-qr-code';
import { FaClipboard, FaInfoCircle, FaExclamationTriangle, FaRedo } from 'react-icons/fa';

/**
 * Deposit: USDT on TRC-20, and nothing else.
 *
 * The currency and network dropdowns are gone. There is one asset on one
 * chain, and a picker with a single option is a decision the player cannot get
 * right — it only adds a step and a way to misread what is accepted.
 *
 * The address is permanent and derived server-side from the account xpub
 * against the verified user id, so there is nothing to choose here and nothing
 * to pass. The same player gets the same address forever.
 */
export default function DepositTab() {
  const [loading, setLoading] = useState(true);
  const [deposit, setDeposit] = useState(null);   // { address, network, contract }
  const [error, setError] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => { fetchAddress(); }, []);

  const fetchAddress = async () => {
    try {
      setLoading(true);
      setError('');
      const { data, error: invokeError } = await supabase.functions.invoke('tron-address', { body: {} });
      if (invokeError) {
        let message = 'Could not generate a deposit address';
        if (invokeError.context instanceof Response) {
          try {
            const body = await invokeError.context.clone().json();
            if (body?.error === 'deposits_not_provisioned') {
              message = 'Deposits are not configured yet. Please contact support.';
            }
          } catch (parseErr) {
            console.error('Error reading tron-address response:', parseErr);
          }
        }
        console.error('Error fetching deposit address:', invokeError);
        setError(message);
        setDeposit(null);
      } else if (data?.address) {
        setDeposit(data);   // { address, network, contract }
      } else {
        setError(data?.error || 'Could not generate a deposit address');
        setDeposit(null);
      }
    } catch (err) {
      console.error('Error fetching deposit address:', err);
      setError('Could not generate a deposit address');
      setDeposit(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!deposit?.address) return;
    navigator.clipboard.writeText(deposit.address)
      .then(() => toast.success('Address copied'))
      .catch(() => toast.error('Could not copy address'));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  // A failure here is worth showing plainly rather than as an empty box: until
  // the platform's xpub is configured there IS no address, and a player
  // staring at a blank field will simply try again forever.
  if (!deposit) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-6">
        <FaExclamationTriangle className="text-yellow-500 mb-3" size={28} />
        <p className="text-sm text-gray-300 mb-1">Deposits are unavailable right now</p>
        <p className="text-xs text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchAddress}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          <FaRedo size={12} /> Try again
        </button>
      </div>
    );
  }

  return (
    <div className="h-full max-h-[calc(100vh-200px)] overflow-y-auto flex flex-col">
      {/* What this address accepts, stated once and prominently. */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-800 rounded-lg">
        <div>
          <div className="text-xs text-gray-400">Currency</div>
          <div className="text-sm font-medium text-white">USDT</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">Network</div>
          <div className="text-sm font-medium text-white">TRON ({deposit.network || 'TRC20'})</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 mb-4">
        <div className="md:w-1/2 flex items-center justify-center bg-gray-800 rounded-lg p-4">
          <div className="p-2 bg-white rounded-lg">
            <QRCode value={deposit.address} size={132} />
          </div>
        </div>

        <div className="md:w-1/2 flex flex-col">
          <label className="text-xs text-gray-400 mb-1">Your deposit address</label>
          <div className="flex">
            <input
              type="text"
              value={deposit.address}
              readOnly
              className="flex-1 p-2.5 bg-gray-800 border border-gray-700 rounded-l-md text-white text-sm focus:outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className="p-2.5 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
              title="Copy address"
            >
              <FaClipboard />
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            This address is permanently yours. You can reuse it for every deposit.
          </p>

          <div className="mt-auto pt-3">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="flex items-center text-xs text-blue-400 hover:text-blue-300 mb-1"
            >
              <FaInfoCircle className="mr-1" />
              {showInfo ? 'Hide' : 'Show'} deposit information
            </button>
            {showInfo && (
              <div className="text-xs text-gray-400 bg-gray-800 p-2 rounded-md space-y-1">
                <p>• Credited after 20 network confirmations (about a minute)</p>
                <p>• Deposits under $0.01 cannot be credited</p>
                {deposit.contract && (
                  <p className="break-all">• Accepted contract: {deposit.contract}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* The one warning that matters. Sending the wrong token, or the right
          token on the wrong chain, is unrecoverable — there is no key on the
          server that could send it back. */}
      <div className="bg-yellow-900 bg-opacity-20 border border-yellow-800 rounded-md p-3 flex items-start">
        <FaExclamationTriangle className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-yellow-200">
          <strong>Send only USDT on the TRON (TRC-20) network.</strong> Any other
          token, or USDT on another chain, will be lost permanently and cannot be
          recovered or refunded.
        </p>
      </div>
    </div>
  );
}
