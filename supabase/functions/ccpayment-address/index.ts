/**
 * ccpayment-address — the permanent deposit address for the signed-in player.
 *
 *   POST /functions/v1/ccpayment-address   { "chain": "ETH" }
 *   ->   { "address": "0x...", "memo": "", "chain": "ETH" }
 *
 * Ported from getPermanentDepositAddress in ccpayment.controllers.js.
 *
 * This is the missing half of the deposit path. Until a player has an address
 * bound, an incoming deposit webhook has no way to work out whose money it is
 * and ccp_credit_deposit answers `unknown_reference`.
 *
 * verify_jwt stays ON here, unlike the webhook. The caller is a logged-in
 * player and their JWT is what says which player — there is no signature to
 * fall back on, and the address returned is tied to whoever asked for it.
 *
 * WHY THE ADDRESS IS NOT TRUSTED FROM THE CLIENT. The chain comes from the
 * request; the user id does not. It is read from the verified JWT, so a player
 * cannot ask for somebody else's referenceId and be handed the address that
 * player's deposits are credited to.
 */

import { createClient } from "jsr:@supabase/supabase-js@2";
import { getOrCreateDepositAddress } from "../_shared/ccpayment.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// ccp_bind_address is granted to service_role and nothing else — writing the
// row that decides who a deposit belongs to is not the browser's to do.
const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/** Chains we will hand out an address for. An unknown chain is a lost deposit. */
const CHAINS = new Set(["ETH", "BSC", "TRX", "POLYGON", "ARBITRUM", "OPTIMISM", "SOL", "BTC"]);

Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) return json(401, { error: "not_authenticated" });

  // Resolve the caller from their own token rather than trusting anything in
  // the body. This is the only thing that decides whose address this is.
  const asUser = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authErr } = await asUser.auth.getUser();
  if (authErr || !user) return json(401, { error: "not_authenticated" });

  let chain = "ETH";
  try {
    const body = await req.json();
    if (body?.chain) chain = String(body.chain).toUpperCase();
  } catch {
    // An empty body is fine and means ETH, as in the original.
  }
  if (!CHAINS.has(chain)) return json(400, { error: "unsupported_chain", chain });

  // Already bound? Return it. CCPayment issues one address per referenceId and
  // never changes it, so asking again would return the same string at the cost
  // of a network round trip.
  {
    const { data } = await admin
      .from("ccp_deposit_addresses")
      .select("address, memo, chain")
      .eq("user_id", user.id)
      .eq("chain", chain)
      .maybeSingle();
    if (data?.address) return json(200, data);
  }

  // The format is the original's and cannot drift: addresses already issued
  // are keyed by it, and the deposit webhook looks up by exactly this string.
  const referenceId = `user_${user.id}_chain_${chain}`;

  let address: string, memo: string;
  try {
    const res = await getOrCreateDepositAddress(referenceId, chain);
    if (!res?.address) throw new Error("CCPayment returned no address");
    address = res.address;
    memo = res.memo ?? "";
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[ccpayment-address] ${user.id} ${chain}: ${message}`);
    // Surfaced rather than swallowed: without this the deposit screen shows a
    // blank box and the player has nowhere to send funds, which looks like the
    // address is loading rather than like a failure.
    return json(502, { error: "address_unavailable", detail: message });
  }

  // Bind BEFORE returning. An address shown to a player but not recorded here
  // is an address whose deposits arrive with no owner — the money lands and
  // ccp_credit_deposit cannot attribute it.
  const { error: bindErr } = await admin.rpc("ccp_bind_address", {
    p_user: user.id,
    p_chain: chain,
    p_address: address,
    p_reference_id: referenceId,
    p_memo: memo || null,
  });

  if (bindErr) {
    console.error(`[ccpayment-address] bind failed for ${user.id}: ${bindErr.message}`);
    return json(500, { error: "bind_failed" });
  }

  return json(200, { address, memo, chain });
});
