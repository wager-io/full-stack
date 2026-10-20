/**
 * tron-watch — poll TronGrid and credit confirmed USDT-TRC20 deposits.
 *
 * Ported from pollDepositsOnce in ../../poker/financial-core. Driven by cron
 * rather than a forever-loop, because there is no process here to hold one:
 *
 *   select cron.schedule('tron-watch', '* * * * *', $$
 *     select net.http_post(
 *       url := 'https://<ref>.supabase.co/functions/v1/tron-watch',
 *       headers := '{"Authorization":"Bearer <WATCHER_SECRET>"}'::jsonb
 *     ) $$);
 *
 * AUTHENTICATION. verify_jwt is off — cron has no user session — so the
 * function checks a shared secret itself. Without that this is a public URL
 * that anyone can hammer, and while it cannot be made to credit a fake deposit
 * (every figure comes from TronGrid, and tron_credit_deposit decides what is
 * payable), it can burn the TronGrid rate limit and starve the real runs.
 *
 * SAFE TO RUN TWICE. tx_hash is the primary key of tron_deposits, so a transfer
 * seen by two overlapping runs credits once. That matters more than it sounds:
 * cron does not know whether the previous run finished.
 *
 * ROUND-ROBIN, NOT EVERYTHING. The original scanned every address on every
 * tick — one API call per player per interval, which is a rate-limit wall once
 * there are real numbers of players. tron_addresses_to_scan hands out the
 * least-recently-scanned slice and stamps it, so cost per run is constant and
 * full coverage is (addresses / BATCH) runs.
 */

import { createClient } from "jsr:@supabase/supabase-js@2";
import { fetchConfirmedTransfers } from "../_shared/tron.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WATCHER_SECRET = Deno.env.get("TRON_WATCHER_SECRET") ?? "";

/** Addresses per run. 50 × one call each sits inside TronGrid's free limits. */
const BATCH = Number(Deno.env.get("TRON_WATCH_BATCH") ?? 50);

/**
 * Re-examine a window behind the last scan rather than starting exactly where
 * we stopped. Block timestamps and our clock are not the same clock, and a
 * transfer that lands either side of a boundary would otherwise be skipped
 * forever. Overlap is free — tx_hash dedupes it.
 */
const OVERLAP_MS = 10 * 60 * 1000;

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (!WATCHER_SECRET) {
    console.error("[tron-watch] TRON_WATCHER_SECRET is not set; refusing to run");
    return json(503, { error: "watcher_not_configured" });
  }
  const auth = req.headers.get("Authorization") ?? "";
  if (auth !== `Bearer ${WATCHER_SECRET}`) return json(401, { error: "unauthorized" });

  const { data: targets, error: pickErr } = await admin.rpc("tron_addresses_to_scan", {
    p_limit: BATCH,
  });
  if (pickErr) {
    console.error(`[tron-watch] could not pick addresses: ${pickErr.message}`);
    return json(500, { error: "pick_failed" });
  }

  const rows = (targets ?? []) as Array<{ user_id: string; address: string; since: string | null }>;
  let credited = 0, seen = 0, rejected = 0, failed = 0;

  for (const row of rows) {
    // `since` is the moment this address was last stamped. Rewind by the
    // overlap so a transfer near the boundary cannot fall through the gap.
    const sinceMs = row.since ? Date.parse(row.since) - OVERLAP_MS : 0;

    let transfers;
    try {
      transfers = await fetchConfirmedTransfers(row.address, sinceMs > 0 ? sinceMs : undefined);
    } catch (err) {
      // One address failing must not stop the rest. It keeps its new
      // last_scanned_at and comes round again — the overlap window is wider
      // than a poll interval, so nothing is lost by moving on.
      failed++;
      console.error(`[tron-watch] ${row.address}: ${err instanceof Error ? err.message : err}`);
      continue;
    }

    for (const t of transfers) {
      // Never credit an outgoing transfer. only_to=true should make this
      // impossible; checking anyway costs nothing and the failure mode is
      // paying someone for sending money away.
      if (t.to !== row.address) continue;

      const { data: result, error } = await admin.rpc("tron_credit_deposit", {
        p_tx_hash: t.txHash,
        p_address: t.to,
        p_amount: t.amount,
        p_contract: t.contract,
        p_raw: { from: t.from, timestamp: t.timestamp },
      });

      if (error) {
        failed++;
        console.error(`[tron-watch] credit failed for ${t.txHash}: ${error.message}`);
        continue;
      }

      const action = (result as { action?: string } | null)?.action;
      if (action === "credited") {
        credited++;
        console.log(`[tron-watch] credited ${t.amount} USDT to ${row.user_id} (${t.txHash})`);
      } else if (action === "rejected") {
        rejected++;
        const reason = (result as { reason?: string }).reason;
        console.warn(`[tron-watch] refused ${t.txHash}: ${reason}`);
      } else if (action === "unknown_address") {
        // The address came out of our own table, so this means the two
        // disagree — worth shouting about rather than counting quietly.
        console.error(`[tron-watch] ${t.to} is not a known deposit address`);
      } else {
        seen++;
      }
    }
  }

  const summary = { scanned: rows.length, credited, already_seen: seen, rejected, failed };
  console.log(`[tron-watch] ${JSON.stringify(summary)}`);
  return json(200, summary);
});
