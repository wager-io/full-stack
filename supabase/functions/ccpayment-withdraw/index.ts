/**
 * ccpayment-withdraw — send a player's balance out to a chain address.
 *
 *   POST /functions/v1/ccpayment-withdraw
 *   { "amount": 25.00, "coinId": 1280, "chain": "ETH", "address": "0x...", "memo": null }
 *   ->  { "order_id": "...", "status": "pending", "record_id": "..." }
 *
 * Ported from createWithdrawalRequest in ccpayment.controllers.js.
 *
 * ── The order things happen in is the whole design ────────────────────────
 *
 * 1. Debit, through ccp_withdrawal_request, as the PLAYER. The balance leaves
 *    first because money already on its way out must not also be spendable —
 *    otherwise the same funds can be withdrawn twice, or gambled while they
 *    are leaving. That RPC refuses an overdraw and leaves no row behind.
 * 2. Ask CCPayment to send it, quoting the order_id the row was created with.
 * 3. If CCPayment refuses, refund — through ccp_fail_withdrawal, which is the
 *    same guarded path a failure webhook uses, so the two cannot both pay it
 *    back.
 *
 * The original did the same three steps but minted its own orderId at step 2,
 * after the money had already moved. If step 2 then failed there was nothing
 * connecting the debit to the payment; here the id comes from the row that the
 * debit created, so the webhook can always find what to settle.
 *
 * ── Why only USDT, for now ────────────────────────────────────────────────
 *
 * profiles.balance is a single numeric(18,2) in USDT. Sending a different coin
 * means converting at a live rate, and every way of doing that badly loses
 * money: quote before the debit and the rate can move; quote after and the
 * player can be charged for a payment that was never made. The original called
 * convertAmount and used `conversion.data.price` with a comment admitting it
 * was guessing at the field name. Rather than inherit that, a non-USDT coinId
 * is refused outright until there is a conversion path worth trusting.
 */

import { createClient } from "jsr:@supabase/supabase-js@2";
import { applyWithdrawToNetwork, getCoinList } from "../_shared/ccpayment.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) return json(401, { error: "not_authenticated" });

  const asUser = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authErr } = await asUser.auth.getUser();
  if (authErr || !user) return json(401, { error: "not_authenticated" });

  let body: { amount?: unknown; coinId?: unknown; chain?: unknown; address?: unknown; memo?: unknown };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const amount = Number(body.amount);
  const coinId = Number(body.coinId);
  const chain = String(body.chain ?? "ETH").toUpperCase();
  const address = String(body.address ?? "").trim();
  const memo = body.memo ? String(body.memo) : undefined;

  // Refused here as well as in the RPC. Number('NaN') is NaN and JSON.stringify
  // turns it into null, so this keeps a non-number out of the request entirely
  // rather than relying on one guard at the far end.
  if (!Number.isFinite(amount) || amount <= 0) return json(400, { error: "invalid_amount" });
  if (Math.round(amount * 100) !== amount * 100) return json(400, { error: "invalid_amount_precision" });
  if (!Number.isFinite(coinId)) return json(400, { error: "invalid_coin" });
  if (!address) return json(400, { error: "invalid_address" });

  // --- the coin must be the one the balance is denominated in --------------
  let symbol: string;
  try {
    const list = await getCoinList();
    const coin = list?.coins?.find((c) => c.coinId === coinId);
    if (!coin) return json(400, { error: "unknown_coin", coinId });
    symbol = coin.symbol;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[ccpayment-withdraw] coin list failed: ${message}`);
    // Nothing has been debited at this point, so refusing is free.
    return json(502, { error: "coin_list_unavailable", detail: message });
  }

  if (symbol !== "USDT") {
    return json(400, {
      error: "unsupported_coin",
      detail: `balance is held in USDT; withdrawing ${symbol} needs a conversion path that does not exist yet`,
    });
  }

  // --- 1. debit, as the player ---------------------------------------------
  const { data: row, error: reqErr } = await asUser.rpc("ccp_withdrawal_request", {
    p_amount: amount,
    p_coin: symbol,
    p_chain: chain,
    p_address: address,
    p_memo: memo ?? null,
  });

  if (reqErr) {
    // insufficient_balance, withdrawals_disabled, account_not_active,
    // invalid_amount_precision — all raised by the RPC, all meaning nothing
    // moved and no row exists.
    const known = ["insufficient_balance", "withdrawals_disabled", "account_not_active",
      "invalid_amount", "invalid_address", "invalid_chain"]
      .find((e) => reqErr.message.includes(e));
    return json(400, { error: known ?? "withdrawal_refused", detail: reqErr.message });
  }

  const orderId = (row as { order_id?: string } | null)?.order_id;
  if (!orderId) {
    console.error(`[ccpayment-withdraw] ${user.id}: RPC returned no order_id`);
    return json(500, { error: "withdrawal_failed" });
  }

  // --- 2. ask CCPayment to send it -----------------------------------------
  try {
    const res = await applyWithdrawToNetwork({
      orderId, coinId, chain, address, amount: amount.toFixed(2), memo,
    });
    console.log(`[ccpayment-withdraw] ${orderId} submitted, recordId=${res?.recordId ?? "-"}`);
    return json(200, { order_id: orderId, status: "pending", record_id: res?.recordId ?? null });
  } catch (err) {
    // --- 3. it refused: give the money back -------------------------------
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[ccpayment-withdraw] ${orderId} rejected: ${message}`);

    const { error: refundErr } = await admin.rpc("ccp_fail_withdrawal", {
      p_order_id: orderId,
      p_reason: message.slice(0, 300),
    });

    if (refundErr) {
      // The debit stands and the refund did not run. Loud, because this is the
      // one outcome that costs a player money and no retry will fix it — the
      // row is left `pending` for an operator to reconcile by order_id.
      console.error(`[ccpayment-withdraw] REFUND FAILED for ${orderId}: ${refundErr.message}`);
      return json(500, { error: "withdrawal_failed_refund_pending", order_id: orderId });
    }

    return json(502, { error: "withdrawal_rejected", detail: message, refunded: true });
  }
});
