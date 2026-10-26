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

// --- payments: deposits & withdrawals --------------------------------------
//
// The first endpoints migrated off the dead Express backend. Each one keeps the
// exact response SHAPE the old controllers returned — `{ success, data }`, with
// camelCase rows — so the existing call sites in DepositTab, WithdrawTab and
// the two transaction history pages did not have to be rewritten around a new
// contract.
//
// Anything touching money goes through an RPC or an Edge Function. None of
// these tables accept a client write: the browser holds the anon key, and the
// INSERT/UPDATE policies to let it write a deposit or a withdrawal row
// deliberately do not exist.

/** Postgres withdrawal row -> the shape the history page renders. */
function toWithdrawalRow(w) {
  return {
    _id: w.order_id,
    orderId: w.order_id,
    recordId: w.record_id,
    txId: w.tx_hash,
    amount: Number(w.coin_amount ?? w.amount),
    amountUSD: Number(w.amount),
    currency: w.currency,
    chain: w.chain,
    address: w.address,
    // `state` is the real position in the state machine; `status` is the
    // coarse projection the existing UI already knows how to colour.
    state: w.state,
    status: w.status,
    createdAt: w.created_at,
    metadata: w.raw ?? {},
  };
}

/** Postgres deposit row -> the shape the history page renders. */
function toDepositRow(d) {
  return {
    _id: d.record_id,
    orderId: d.record_id,
    recordId: d.record_id,
    amount: Number(d.amount),
    amountUSD: Number(d.amount_usd),
    currency: d.currency,
    chain: d.chain,
    status: d.status,
    flaggedRisky: d.flagged_risky,
    createdAt: d.created_at,
    metadata: d.raw ?? {},
  };
}

/** Unwrap an Edge Function result into the `{ success, ... }` body it returned. */
function unwrap(res, fallbackMessage) {
  if (res.code !== 0) return { success: false, message: res.message ?? fallbackMessage };
  return res.data ?? { success: false, message: fallbackMessage };
}

register('GET', /^\/api\/ccpayment\/currencies$/, async () =>
  unwrap(await invoke('ccpayment-address', { action: 'coins' }), 'Failed to fetch coin list'),
);

register('POST', /^\/api\/ccpayment\/permanent-address$/, async (_params, body) =>
  unwrap(
    await invoke('ccpayment-address', { action: 'address', chain: body?.chain }),
    'Failed to get deposit address',
  ),
);

// Creates a REQUESTED withdrawal. Note what this does NOT do: it does not debit
// the balance and it does not reach the gateway. Both wait for an administrator
// to approve, which is the whole point of the change — a request is a claim,
// not a movement.
//
// `amount` is USD, because the balance being withdrawn from is USD. The number
// of coins that buys is NOT sent and would not be trusted if it were:
// withdrawal-dispatch prices it against the gateway when it actually sends.
register('POST', /^\/api\/ccpayment\/withdraw$/, async (_params, body) => {
  const res = await rpc('request_withdrawal', {
    p_amount: Number(body?.amount),
    p_address: body?.address,
    p_chain: body?.chain,
    p_currency: body?.currency ?? 'USDT',
    p_memo: body?.memo ?? null,
    p_coin_id: body?.coinId ?? null,
    p_coin_amount: null,
  });

  if (res.code !== 0) {
    // Postgres raises bare error codes ('insufficient_balance'); turn the ones
    // a player can actually hit into something worth reading.
    const raw = res.message ?? '';
    const known = {
      insufficient_balance: 'You do not have enough balance for this withdrawal.',
      withdrawal_already_pending: 'You already have a withdrawal in progress.',
      withdrawals_disabled: 'Withdrawals are disabled on your account. Contact support.',
      account_not_active: 'Your account is not active.',
      invalid_amount: 'Enter a valid amount.',
      invalid_amount_precision: 'Amount cannot be smaller than one cent.',
      missing_address: 'Enter a withdrawal address.',
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
    .select('order_id, record_id, tx_hash, amount, coin_amount, currency, chain, address, state, status, created_at, raw')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return { success: false, message: error.message };
  return { success: true, data: (data ?? []).map(toWithdrawalRow) };
});

register('GET', /^\/api\/ccpayment\/deposit\/history$/, async () => {
  const { data, error } = await supabase
    .from('deposits')
    .select('record_id, amount, amount_usd, currency, chain, status, flagged_risky, created_at, raw')
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
