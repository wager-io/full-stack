// Withdrawal approval and dispatch — the administrator's side of the state
// machine, plus the one step that talks to the gateway.
//
// Why approval goes through a function instead of a bare RPC call from the
// admin UI: approve_withdrawal moving to APPROVED and the gateway actually
// receiving the request are two things that have to happen together. If the
// browser called the RPC and then submitted separately, a closed tab between
// the two leaves a player's funds held for a withdrawal nobody is sending.
//
// That window is not eliminated here — it cannot be, with a third-party API on
// one side and a database on the other — it is made RECOVERABLE. Anything
// stuck in APPROVED can be driven forward by calling this again with
// { action: 'dispatch' }, and the gateway treats a repeated orderId as the
// same request rather than a second one, so a retry cannot double-send.
//
// Deploy: supabase functions deploy withdrawal-dispatch

import { applyWithdrawToNetwork, coinUnitsForUsd } from '../_shared/ccpayment.ts';
import { asUser, corsHeaders, identify, json, refuse, service } from '../_shared/supabase.ts';

interface WithdrawalRow {
  order_id: string;
  user_id: string;
  amount: number;
  currency: string | null;
  chain: string | null;
  address: string | null;
  memo: string | null;
  coin_id: number | null;
  coin_amount: string | number | null;
  state: string;
}

async function loadWithdrawal(orderId: string): Promise<WithdrawalRow | null> {
  const { data } = await service
    .from('withdrawals')
    .select('order_id, user_id, amount, currency, chain, address, memo, coin_id, coin_amount, state')
    .eq('order_id', orderId)
    .maybeSingle();
  return (data as WithdrawalRow) ?? null;
}

async function rollback(orderId: string, reason: string) {
  const { error } = await service.rpc('rollback_withdrawal', {
    p_order_id: orderId,
    p_reason: reason,
    p_raw: null,
  });
  if (error) {
    // The hold is still on the player's clearing balance and the row is still
    // APPROVED. Loud, because this needs a human: the money is neither sent
    // nor returned.
    console.error(`[withdrawal-dispatch] ROLLBACK FAILED for ${orderId}: ${error.message}`);
  }
}

/**
 * Submit an APPROVED withdrawal to CCPayment and advance it to BROADCASTING.
 * On a definite gateway refusal the hold is released; on an ambiguous failure
 * it is NOT — see the comment at the catch.
 */
async function dispatch(orderId: string): Promise<Response> {
  const wd = await loadWithdrawal(orderId);
  if (!wd) return refuse('Unknown withdrawal');

  if (wd.state === 'BROADCASTING' || wd.state === 'CONFIRMED') {
    return json({ success: true, state: wd.state, message: 'Already dispatched' });
  }
  if (wd.state !== 'APPROVED') {
    return refuse(`Cannot dispatch from ${wd.state}`, { state: wd.state });
  }

  if (!wd.coin_id || !wd.chain || !wd.address) {
    // Unsendable as recorded, and no amount of retrying changes that. Give the
    // money back rather than leaving it held forever.
    await rollback(orderId, 'missing coin_id, chain or address — cannot dispatch');
    return refuse('Withdrawal is missing gateway details — funds returned to the player');
  }

  // What the player is owed is `amount`, in USD — that is the figure held on
  // their clearing balance. How many coins that buys is priced HERE, against
  // the gateway, at the moment of sending. It is never carried in from the
  // request that created the withdrawal: a client-supplied coin amount paired
  // with a server-held USD amount is an open exchange rate, and the gap
  // between the two is free money.
  let units: number | null;
  try {
    units = await coinUnitsForUsd(wd.coin_id, Number(wd.amount));
  } catch (e) {
    console.error(`[withdrawal-dispatch] ${orderId} pricing failed (hold retained):`, e);
    return refuse('Could not price the withdrawal — left approved for retry', { retryable: true });
  }

  if (units === null) {
    // No price, so no defensible amount to send. Retryable rather than
    // refunded: a pricing outage is temporary and the player still wants
    // their withdrawal.
    return refuse('No price available for this coin — left approved for retry', { retryable: true });
  }

  // Eight decimals covers every chain CCPayment settles on; more just gets
  // rejected as over-precise.
  const amount = units.toFixed(8);

  // ccRequest throws for every kind of failure, so the ONE thing that matters
  // here has to be recovered from the error itself: did CCPayment answer?
  //
  //   "ccpayment <path> code 224076: ..."  it answered, and refused. The send
  //                                        is definitely not happening, so the
  //                                        hold belongs back in the balance.
  //   anything else                        transport error, HTTP error, a
  //                                        timeout. The request may well have
  //                                        ARRIVED and be executing.
  //
  // Refunding on the second kind is the expensive mistake: the player gets
  // their balance back and can spend it while an on-chain send is in flight,
  // and the platform pays twice. So an ambiguous failure keeps the hold and
  // stays APPROVED for a retry — which is safe, because the gateway treats a
  // repeated orderId as the same request rather than a second one.
  let res: { recordId?: string };
  try {
    res = await applyWithdrawToNetwork({
      orderId: wd.order_id,
      coinId: wd.coin_id,
      chain: wd.chain,
      address: wd.address,
      amount,
      memo: wd.memo ?? undefined,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const answered = / code \d+:/.test(message);

    if (answered) {
      await rollback(orderId, `ccpayment: ${message}`.slice(0, 400));
      console.error(`[withdrawal-dispatch] ${orderId} refused, funds returned: ${message}`);
      return refuse(`Gateway refused: ${message} — funds returned to the player`);
    }

    console.error(`[withdrawal-dispatch] ${orderId} ambiguous failure (hold RETAINED):`, message);
    return refuse('Gateway unreachable — withdrawal left approved for retry', { retryable: true });
  }

  const { data, error } = await service.rpc('broadcast_withdrawal', {
    p_order_id: orderId,
    p_tx_hash: null, // not known yet; the webhook supplies it
    p_record_id: res.recordId ? String(res.recordId) : null,
    p_raw: { dispatch: res },
    p_coin_amount: units,
  });

  if (error) {
    // Submitted but not recorded. Do NOT roll back — the gateway is sending
    // real money. The webhook will arrive and confirm it; this log is how the
    // state gap gets noticed in the meantime.
    console.error(
      `[withdrawal-dispatch] ${orderId} SUBMITTED but broadcast_withdrawal failed: ${error.message}`,
    );
    return json({
      success: true,
      warning: 'Submitted to gateway but state not recorded; webhook will reconcile',
    });
  }

  return json({ success: true, state: data?.state ?? 'BROADCASTING', recordId: res.recordId });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ success: false, message: 'Method not allowed' }, 405);

  const caller = await identify(req);
  if (!caller) return json({ success: false, message: 'Not authenticated' }, 401);
  if (!caller.isAdmin) return json({ success: false, message: 'Not authorised' }, 403);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ success: false, message: 'Body is not valid JSON' }, 400);
  }

  const orderId = String(body.order_id ?? '').trim();
  if (!orderId) return json({ success: false, message: 'order_id is required' }, 400);

  // Approval and rejection run AS THE ADMIN, not as service role: the RPCs read
  // auth.uid() to record who signed, and the dual-approval rule is only a rule
  // if the two signatures are two different people. Service role would make
  // every approval anonymous and identical.
  const authHeader = req.headers.get('Authorization')!;
  const userClient = asUser(authHeader);

  try {
    switch (body.action) {
      case 'approve': {
        const { data, error } = await userClient.rpc('approve_withdrawal', { p_order_id: orderId });
        // Postgres raises bare codes here — 'invalid_transition', 'not_authorised'.
        // The operator needs to see which one.
        if (error) return refuse(error.message);

        // Under-approved: recorded, nothing held, nothing sent. The UI shows
        // "1 of 2" and waits for a second administrator.
        if (!data?.held) {
          return json({
            success: true,
            state: data?.state,
            approvals: data?.approvals,
            required: data?.required,
            dispatched: false,
          });
        }

        const res = await dispatch(orderId);
        const payload = await res.json();
        return json(
          { ...payload, approvals: data.approvals, required: data.required, dispatched: true },
          res.status,
        );
      }

      case 'reject': {
        const { data, error } = await userClient.rpc('reject_withdrawal', {
          p_order_id: orderId,
          p_reason: body.reason ? String(body.reason) : null,
        });
        if (error) return refuse(error.message);
        if (data?.ok === false) return refuse(data.reason, { state: data.state });
        return json({ success: true, state: 'ROLLED_BACK' });
      }

      // Finish an APPROVED withdrawal whose dispatch did not complete. Safe to
      // call repeatedly.
      case 'dispatch':
        return await dispatch(orderId);

      default:
        return json({ success: false, message: `Unknown action: ${body.action}` }, 400);
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('[withdrawal-dispatch]', message);
    return json({ success: false, message: 'Internal error' }, 500);
  }
});
