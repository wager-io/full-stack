// Drop-in replacement for the old axios instance (src/utils/api.js).
//
// Goal: keep every existing call site working — `api.get('/api/...')`,
// `api.post(...)`, `api.fetchData(...)`, etc. — while routing each path to a
// Supabase query or an Edge Function instead of the deleted Express backend.
//
// Endpoints are migrated incrementally (per the phased plan). Register a
// handler for a METHOD + path-pattern here; unregistered paths throw a clear
// error so we can see exactly what still needs porting.
import { supabase } from './supabase';
import { rpc, invoke } from './realtime';

// --- route table -----------------------------------------------------------
// Each entry: [method, RegExp, async (params, body) => data]
// `params` are the capture groups from the path RegExp.
const routes = [];

export function register(method, pattern, handler) {
  routes.push([method.toUpperCase(), pattern, handler]);
}

function match(method, url) {
  const path = url.split('?')[0];
  for (const [m, pattern, handler] of routes) {
    if (m !== method) continue;
    const res = pattern.exec(path);
    if (res) return { handler, params: res.slice(1) };
  }
  return null;
}

async function dispatch(method, url, body) {
  const found = match(method, url);
  if (!found) {
    throw new Error(`[apiCompat] No Supabase mapping yet for ${method} ${url}`);
  }
  return found.handler(found.params, body, url);
}

// Axios-shaped helpers return `{ data }`; the *Data helpers return data directly,
// matching the old api.js contract exactly.
const api = {
  get: async (url) => ({ data: await dispatch('GET', url) }),
  post: async (url, body) => ({ data: await dispatch('POST', url, body) }),
  put: async (url, body) => ({ data: await dispatch('PUT', url, body) }),
  patch: async (url, body) => ({ data: await dispatch('PATCH', url, body) }),
  delete: async (url) => ({ data: await dispatch('DELETE', url) }),
  fetchData: (url) => dispatch('GET', url),
  postData: (url, body) => dispatch('POST', url, body),
  updateData: (url, body) => dispatch('PUT', url, body),
  deleteData: (url) => dispatch('DELETE', url),
};

// --- payments: TRON deposits, manual withdrawals ---------------------------
//
// One asset, one chain: USDT on TRC-20. The currency/network pickers these
// paths used to feed are gone from the UI, because offering a choice of one is
// a decision the player cannot get right or wrong.
//
// The legacy `/api/ccpayment/...` paths are kept as the KEYS only. They are
// what the existing call sites ask for, and renaming them would be a rename
// for its own sake — nothing behind them touches CCPayment any more.
//
// Nothing here moves money. Deposits are credited by the on-chain watcher;
// withdrawals are recorded as a request and wait for an administrator.

/** Postgres withdrawal row -> the shape the history page renders. */
function toWithdrawalRow(w) {
  return {
    _id: w.order_id,
    orderId: w.order_id,
    txId: w.tx_hash,
    amount: Number(w.amount),
    amountUSD: Number(w.amount),
    currency: w.currency ?? 'USDT',
    chain: w.chain ?? 'TRC20',
    address: w.address,
    // `state` is the real position in the state machine; `status` is the
    // coarse projection the existing UI already knows how to colour.
    state: w.state,
    status: w.status,
    createdAt: w.created_at,
    metadata: w.raw ?? {},
  };
}

/** Postgres tron_deposits row -> the shape the history page renders. */
function toDepositRow(d) {
  return {
    _id: d.tx_hash,
    orderId: d.tx_hash,
    txId: d.tx_hash,
    amount: Number(d.amount),
    amountUSD: Number(d.credited_usd ?? 0),
    currency: 'USDT',
    chain: 'TRC20',
    // credited_at is the flag, not a status column: a row without it was seen
    // and refused (wrong contract, too few confirmations, under a cent) and
    // `rejected_reason` says which.
    status: d.credited_at ? 'completed' : (d.rejected_reason ? 'failed' : 'pending'),
    rejectedReason: d.rejected_reason,
    createdAt: d.created_at,
    metadata: d.raw ?? {},
  };
}

// The player's permanent TRC-20 deposit address. Derived server-side from the
// account xpub against the VERIFIED user id — there is no parameter here, and
// deliberately so: an address is issued to whoever the JWT says you are.
register('POST', /^\/api\/ccpayment\/permanent-address$/, async () => {
  const res = await invoke('tron-address', {});
  if (res.code !== 0) {
    return { success: false, message: res.message ?? 'Could not get a deposit address' };
  }
  const d = res.data ?? {};
  if (d.error) {
    return {
      success: false,
      message: d.error === 'deposits_not_provisioned'
        ? 'Deposits are not configured yet. Please contact support.'
        : d.error,
    };
  }
  // `contract` comes back so the UI can warn which token is accepted: USDT on
  // TRC-20 and nothing else, because anything else sent here is unrecoverable.
  return { success: true, data: { address: d.address, network: d.network, contract: d.contract } };
});

// Creates a REQUESTED withdrawal. Note what this does NOT do: it does not
// debit the balance and it does not send anything. Both wait for an
// administrator — a request is a claim, not a movement.
//
// `amount` is USD, because the balance is USD and USDT tracks it 1:1. No coin
// amount is sent and none would be trusted: a client-supplied valuation
// alongside a server-held one is an open exchange rate.
register('POST', /^\/api\/ccpayment\/withdraw$/, async (_params, body) => {
  const res = await rpc('request_withdrawal', {
    p_amount: Number(body?.amount),
    p_address: body?.address,
    p_chain: 'TRC20',
    p_currency: 'USDT',
    p_memo: null,
    p_coin_id: null,
    p_coin_amount: null,
  });

  if (res.code !== 0) {
    // Postgres raises bare codes ('insufficient_balance'); turn the ones a
    // player can actually hit into something worth reading.
    const raw = res.message ?? '';
    const known = {
      insufficient_balance: 'You do not have enough balance for this withdrawal.',
      withdrawal_already_pending: 'You already have a withdrawal in progress.',
      withdrawals_disabled: 'Withdrawals are disabled on your account. Contact support.',
      account_not_active: 'Your account is not active.',
      invalid_amount_precision: 'Amount cannot be smaller than one cent.',
      invalid_amount: 'Enter a valid amount.',
      missing_address: 'Enter a withdrawal address.',
      withdrawals_tron_address_shape: 'That does not look like a TRON (TRC-20) address.',
      not_authenticated: 'Please sign in again.',
    };
    const key = Object.keys(known).find((k) => raw.includes(k));
    return { success: false, message: key ? known[key] : raw };
  }

  return {
    success: true,
    orderId: res.data?.order_id,
    withdrawalId: res.data?.order_id,
    status: 'pending',
    state: res.data?.state,
  };
});

register('GET', /^\/api\/ccpayment\/withdraw\/history$/, async () => {
  // RLS scopes this to the caller's own rows; there is no user id to pass and
  // no way to ask for somebody else's.
  const { data, error } = await supabase
    .from('withdrawals')
    .select('order_id, tx_hash, amount, currency, chain, address, state, status, created_at, raw')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return { success: false, message: error.message };
  return { success: true, data: (data ?? []).map(toWithdrawalRow) };
});

register('GET', /^\/api\/ccpayment\/deposit\/history$/, async () => {
  const { data, error } = await supabase
    .from('tron_deposits')
    .select('tx_hash, amount, credited_usd, credited_at, rejected_reason, created_at, raw')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return { success: false, message: error.message };
  return { success: true, data: (data ?? []).map(toDepositRow) };
});

// Re-export so old `import { serverUrl } from '../utils/api'` keeps resolving.
export const serverUrl = () => import.meta.env.VITE_SUPABASE_URL ?? '';

// Expose primitives for handlers that want them.
export { supabase, rpc, invoke };
export default api;
