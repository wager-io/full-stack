/**
 * CCPayment webhook — deposits and withdrawals.
 *
 * Point BOTH console fields at this one function:
 *   Deposit Webhook URL     https://<project>.supabase.co/functions/v1/ccpayment-webhook
 *   Withdrawal Webhook URL  https://<project>.supabase.co/functions/v1/ccpayment-webhook
 *
 * One endpoint, because the payload's `type` already says which event this is
 * and splitting them would mean two copies of the signature check — the part
 * that must not drift.
 *
 * WHAT THIS FILE IS RESPONSIBLE FOR: proving the request came from CCPayment,
 * and finding out what actually happened. It moves no money itself. Deciding
 * whether a deposit has already been paid, and moving the balance, belongs in
 * 0015's RPCs where it happens in one transaction under a row lock — a check
 * here and a write there is a race with money in it.
 *
 * ── The reply matters ──────────────────────────────────────────────────────
 *
 * CCPayment retries until it gets a 200 with the body `Success`. So:
 *
 *   200  we have durably dealt with it, INCLUDING the cases we cannot ever
 *        deal with (a deposit for an address with no owner). Retrying those
 *        forever helps nobody; they are logged for a human.
 *   401  the signature failed. Not ours, or tampered with.
 *   500  we could not finish for a reason that might not recur — CCPayment's
 *        record endpoint was down, the database was unreachable. We WANT the
 *        retry here, and it is safe because every write is idempotent.
 *
 * The one rule underneath all three: never answer 200 for a deposit we failed
 * to credit but could have. That is the reply that loses a player's money
 * silently.
 */

import { createClient } from "jsr:@supabase/supabase-js@2";
import { getDepositRecord, verifyWebhook } from "../_shared/ccpayment.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  // The service role key: these RPCs are granted to service_role and to
  // nothing else, so this is the credential that makes them callable.
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

/** CCPayment wants exactly this: text/plain, the word Success. */
const ok = () =>
  new Response("Success", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });

const fail = (status: number, message: string) =>
  new Response(message, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });

Deno.serve(async (req) => {
  if (req.method !== "POST") return fail(405, "Method Not Allowed");

  // The RAW body, read once, before anything parses it. The signature covers
  // these exact bytes; JSON.parse followed by JSON.stringify would reorder keys
  // and drop whitespace, and every signature would then fail to match.
  const rawBody = await req.text();

  const verdict = await verifyWebhook(
    rawBody,
    req.headers.get("Sign"),
    req.headers.get("Timestamp"),
    req.headers.get("Appid"),
  );

  if (!verdict.ok) {
    // Logged without the body: an unverified payload is an unknown party's
    // data, and it should not be trusted into our logs in full.
    console.warn(`[ccpayment-webhook] rejected: ${verdict.reason}`);
    return fail(401, "Invalid signature");
  }

  let payload: { type?: string; msg?: Record<string, unknown> };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    // Signed by us and still unparseable: retrying will not change that.
    console.error("[ccpayment-webhook] signed body is not JSON");
    return ok();
  }

  const type = payload.type ?? "";
  const msg = payload.msg ?? {};

  try {
    switch (type) {
      case "DirectDeposit":
      case "ApiDeposit":
        return await handleDeposit(msg, payload);

      case "ApiWithdrawal":
        return await handleWithdrawal(msg, payload);

      case "ActivateWebhookURL":
        // CCPayment's handshake when the URL is saved in the console. Nothing
        // to do but answer correctly, which is the whole point of it.
        console.log("[ccpayment-webhook] URL activated");
        return ok();

      default:
        console.log(`[ccpayment-webhook] ignoring unknown type: ${type}`);
        return ok();
    }
  } catch (err) {
    // Deliberately a 500: we want the retry, and every write behind here is
    // idempotent, so a retry cannot double-credit.
    console.error(`[ccpayment-webhook] ${type} failed:`, err instanceof Error ? err.message : err);
    return fail(500, "Internal Error");
  }
});

/**
 * A deposit landed.
 *
 * The DirectDeposit payload carries no amount — it says which record changed,
 * not what it is worth — so the figure comes from the record endpoint. The
 * original Node controller re-fetched for the same reason. If that call fails
 * we return 500 and credit nothing: a deposit credited from a number we
 * guessed is worse than one credited late.
 */
async function handleDeposit(msg: Record<string, unknown>, payload: unknown): Promise<Response> {
  const recordId = String(msg.recordId ?? "");
  if (!recordId) {
    console.error("[ccpayment-webhook] deposit with no recordId");
    return ok();
  }

  const data = await getDepositRecord(recordId);
  const record = data?.record;
  if (!record) throw new Error(`no record returned for ${recordId}`);

  // referenceId is how a deposit finds its owner; prefer the record's, fall
  // back to the webhook's, because both are signed by CCPayment.
  const referenceId = String(record.referenceId ?? msg.referenceId ?? "");
  const amount = Number(record.amount ?? NaN);
  const price = Number(record.coinUSDPrice ?? NaN);

  // The RPC re-checks these; refusing here too keeps a NaN out of the request
  // body entirely rather than relying on one guard.
  if (!Number.isFinite(amount) || !Number.isFinite(price)) {
    throw new Error(`record ${recordId} has an unusable amount/price: ${record.amount}/${record.coinUSDPrice}`);
  }

  const { data: result, error } = await supabase.rpc("ccp_credit_deposit", {
    p_record_id: recordId,
    p_reference_id: referenceId,
    p_coin: String(record.coinSymbol ?? msg.coinSymbol ?? "USDT"),
    p_amount: amount,
    p_coin_usd_price: price,
    p_status: String(record.status ?? msg.status ?? ""),
    p_is_risky: Boolean(record.isFlaggedAsRisky ?? msg.isFlaggedAsRisky ?? false),
    p_raw: { webhook: payload, record },
  });

  if (error) throw new Error(`ccp_credit_deposit: ${error.message}`);

  const action = (result as { action?: string } | null)?.action;
  if (action === "unknown_reference") {
    // Money for an address we cannot attribute. A retry will not find an owner
    // that does not exist, so this stops here and waits for a person.
    console.error(`[ccpayment-webhook] deposit ${recordId}: no owner for reference ${referenceId}`);
  } else {
    console.log(`[ccpayment-webhook] deposit ${recordId}: ${action}`);
  }

  return ok();
}

/**
 * A withdrawal moved on.
 *
 * All the judgement — mapping CCPayment's status onto ours, and refunding a
 * failure exactly once — is in ccp_settle_withdrawal. This only carries the
 * message.
 */
async function handleWithdrawal(msg: Record<string, unknown>, payload: unknown): Promise<Response> {
  const orderId = String(msg.orderId ?? "");
  if (!orderId) {
    console.error("[ccpayment-webhook] withdrawal with no orderId");
    return ok();
  }

  const { data: result, error } = await supabase.rpc("ccp_settle_withdrawal", {
    p_order_id: orderId,
    p_cc_status: String(msg.status ?? ""),
    p_raw: { webhook: payload },
  });

  if (error) throw new Error(`ccp_settle_withdrawal: ${error.message}`);

  const action = (result as { action?: string } | null)?.action;
  if (action === "unknown_order") {
    console.error(`[ccpayment-webhook] withdrawal ${orderId}: no such order`);
  } else {
    console.log(`[ccpayment-webhook] withdrawal ${orderId}: ${action}`);
  }

  return ok();
}
