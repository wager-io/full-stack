/**
 * tron-address — the signed-in player's permanent USDT-TRC20 deposit address.
 *
 *   POST /functions/v1/tron-address
 *   ->   { "address": "T...", "network": "TRC20", "contract": "TR7NHq..." }
 *
 * Ported from getDepositAddress in ../../poker/financial-core.
 *
 * The address is permanent and is assigned once. A player who reloads the
 * deposit screen must see the same string every time — a second address handed
 * out while funds are in flight to the first is money arriving somewhere the
 * player is no longer looking.
 *
 * The user id comes from the verified JWT, never the body. The whole security
 * of this is that a player cannot ask for an index that is not theirs.
 *
 * `contract` is returned alongside, because a player sending the wrong token to
 * a correct address is the most common way this goes wrong, and the screen
 * should be able to say which one is accepted.
 */

import { createClient } from "jsr:@supabase/supabase-js@2";
import { tronAddressFromXpub } from "../_shared/tron.ts";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

/**
 * The account-level extended PUBLIC key, m/44'/195'/0'.
 *
 * Public by construction — it can derive addresses and cannot sign. Treat the
 * corresponding xprv as the thing that must never be here.
 */
const XPUB = Deno.env.get("TRON_ACCOUNT_XPUB") ?? "";

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  if (!XPUB) {
    // Deliberately explicit rather than a generic 500: before the chain is
    // provisioned there is no address to give, and "deposits are not open yet"
    // is the honest thing for the screen to say.
    console.error("[tron-address] TRON_ACCOUNT_XPUB is not set");
    return json(503, { error: "deposits_not_provisioned" });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) return json(401, { error: "not_authenticated" });

  const asUser = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authErr } = await asUser.auth.getUser();
  if (authErr || !user) return json(401, { error: "not_authenticated" });

  const contract = await accepted();

  // Already assigned? Return it without touching the sequence.
  {
    const { data } = await admin
      .from("tron_deposit_addresses")
      .select("address")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data?.address) return json(200, { address: data.address, network: "TRC20", contract });
  }

  // Reserve an index. A sequence, so two concurrent first-requests cannot be
  // handed the same one — which would give two players one address.
  const { data: idx, error: idxErr } = await admin.rpc("tron_next_index");
  if (idxErr || idx === null) {
    console.error(`[tron-address] index reservation failed: ${idxErr?.message}`);
    return json(500, { error: "address_assignment_failed" });
  }

  let address: string;
  try {
    address = tronAddressFromXpub(XPUB, Number(idx));
  } catch (err) {
    console.error(`[tron-address] derivation failed at index ${idx}:`, err);
    return json(500, { error: "derivation_failed" });
  }

  // Bind before returning. An address shown to a player but not recorded is an
  // address whose deposits arrive unattributable — the watcher would see the
  // transfer and have no owner to credit.
  const { data: row, error: bindErr } = await admin.rpc("tron_bind_address", {
    p_user: user.id,
    p_index: idx,
    p_address: address,
  });

  if (bindErr) {
    console.error(`[tron-address] bind failed for ${user.id}: ${bindErr.message}`);
    return json(500, { error: "address_assignment_failed" });
  }

  // tron_bind_address returns the winner of any race, which may not be the row
  // we just tried to insert. Trust what came back, not what we derived.
  const finalAddress = (row as { address?: string } | null)?.address ?? address;
  return json(200, { address: finalAddress, network: "TRC20", contract });
});

async function accepted(): Promise<string> {
  const { data } = await admin.from("tron_config").select("value").eq("key", "usdt_contract").maybeSingle();
  return data?.value ?? "";
}
