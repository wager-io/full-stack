/**
 * CCPayment v2 — signing, verification, and the one way this codebase talks to
 * the API.
 *
 * Ported from stake-cloneBackend/services/ccpayment.services.js, which is the
 * implementation that ran in production.
 *
 * THE SIGNATURE. Both directions use the same construction, which is the part
 * worth stating plainly because the v1 docs describe a different one (a plain
 * SHA-256 over appId + appSecret + timestamp + body). v2, and the live Node
 * service, use an HMAC:
 *
 *     sign = HMAC_SHA256(key = appSecret, message = appId + timestamp + body)
 *
 * `body` is the JSON string. Outbound that is whatever we serialise; INBOUND it
 * must be the raw bytes exactly as they arrived — parsing and re-serialising a
 * webhook changes key order and whitespace, and the signature stops matching.
 * That is why the verify function below takes a string and never an object.
 */

const APP_ID = Deno.env.get("CCPAYMENT_APP_ID") ?? "";
const APP_SECRET = Deno.env.get("CCPAYMENT_APP_SECRET") ?? "";
const API_BASE = Deno.env.get("CCPAYMENT_API_BASE") ?? "https://ccpayment.com/ccpayment/v2";

/**
 * Optional outbound proxy with a fixed IP.
 *
 * CCPayment only answers requests from whitelisted IPs, and Supabase Edge
 * Functions have no static egress address, so a deployed function cannot be
 * whitelisted on its own. The old Node service solved this with QuotaGuard
 * (QUOTAGUARDSTATIC_URL) and this is the same hole in the same fence.
 *
 * Set CCPAYMENT_PROXY_URL to a proxy whose IP is whitelisted. Left unset, calls
 * go out directly, which works locally with your own IP whitelisted (or with
 * Developer Test Mode ticked in the console) and will fail in production with
 * CCPayment error 224076.
 */
const PROXY_URL = Deno.env.get("CCPAYMENT_PROXY_URL") ?? "";

if (!APP_ID || !APP_SECRET) {
  console.error("[ccpayment] CCPAYMENT_APP_ID / CCPAYMENT_APP_SECRET are not set");
}

const encoder = new TextEncoder();

async function hmacKey(): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "raw",
    encoder.encode(APP_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** HMAC_SHA256(appSecret, appId + timestamp + body) as lowercase hex. */
export async function sign(timestamp: string | number, body: string): Promise<string> {
  const key = await hmacKey();
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(`${APP_ID}${timestamp}${body}`));
  return toHex(mac);
}

/**
 * Compare two hex digests without leaking where they diverge.
 *
 * `a === b` on strings returns as soon as it finds a differing character, so
 * how long it took narrows down the correct prefix. That turns a signature
 * check into something an attacker can solve one byte at a time, given enough
 * attempts — and a webhook endpoint is a URL anyone may call as often as they
 * like. Length is compared first and is not secret.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export interface VerifyResult {
  ok: boolean;
  reason?: string;
}

/**
 * Is this webhook really from CCPayment?
 *
 * @param rawBody the body exactly as received — never JSON.parse'd and re-stringified.
 *
 * Three things must hold, and all three matter:
 *   - the Appid header is ours (a signature from someone else's app is still a
 *     valid signature, just not for us);
 *   - the timestamp is recent, so a body captured once cannot be replayed
 *     forever;
 *   - the HMAC matches.
 */
export async function verifyWebhook(
  rawBody: string,
  signature: string | null,
  timestamp: string | null,
  appIdHeader: string | null,
): Promise<VerifyResult> {
  if (!signature || !timestamp || !appIdHeader) return { ok: false, reason: "missing_headers" };
  if (appIdHeader !== APP_ID) return { ok: false, reason: "app_id_mismatch" };

  const ts = Number.parseInt(timestamp, 10);
  if (!Number.isFinite(ts)) return { ok: false, reason: "bad_timestamp" };

  // 300s, matching the Node service. Wide enough for clock drift and a retry,
  // narrow enough that a captured request is not a permanent key.
  const skew = Math.abs(Math.floor(Date.now() / 1000) - ts);
  if (skew > 300) return { ok: false, reason: `timestamp_skew_${skew}s` };

  const expected = await sign(timestamp, rawBody);
  if (!timingSafeEqual(expected, signature)) return { ok: false, reason: "signature_mismatch" };

  return { ok: true };
}

/** A proxied fetch when a static-IP proxy is configured, otherwise plain fetch. */
function proxyFetch(): typeof fetch {
  if (!PROXY_URL) return fetch;

  // Deno.createHttpClient is not available on every runtime build. If it is
  // missing we say so rather than silently going out on the wrong IP and
  // leaving a 224076 to be diagnosed from the far end.
  const createHttpClient = (Deno as unknown as {
    createHttpClient?: (o: Record<string, unknown>) => unknown;
  }).createHttpClient;

  if (typeof createHttpClient !== "function") {
    console.error(
      "[ccpayment] CCPAYMENT_PROXY_URL is set but Deno.createHttpClient is unavailable; " +
        "requests will go out on the function's own (non-static) IP and CCPayment will reject them",
    );
    return fetch;
  }

  const client = createHttpClient({ proxy: { url: PROXY_URL } });
  return ((input: string | URL | Request, init?: RequestInit) =>
    fetch(input, { ...init, client } as RequestInit)) as typeof fetch;
}

export interface CCResponse<T = Record<string, unknown>> {
  code: number;
  msg: string;
  data?: T;
}

/**
 * One signed POST to CCPayment.
 *
 * Throws on transport failure or a non-zero code, so a caller that gets a value
 * back has a successful response and nothing else. The webhook handler relies
 * on that: if it cannot read the deposit record it must NOT credit anything,
 * and the cleanest way to guarantee that is for the failure to be unignorable.
 */
export async function ccRequest<T = Record<string, unknown>>(
  path: string,
  body: Record<string, unknown> = {},
): Promise<T> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const payload = JSON.stringify(body);
  const signature = await sign(timestamp, payload);

  const res = await proxyFetch()(`${API_BASE}/${path.replace(/^\//, "")}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Appid": APP_ID,
      "Timestamp": timestamp,
      "Sign": signature,
    },
    body: payload,
  });

  if (!res.ok) {
    throw new Error(`ccpayment ${path} HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }

  const json = (await res.json()) as CCResponse<T>;
  if (json.code !== 10000) {
    // 224076 is "Requested IP is not on the whitelist" and is by far the most
    // likely failure in a new deployment, so it is named rather than left as a
    // number to look up.
    const hint = json.code === 224076
      ? " — this function's egress IP is not whitelisted; set CCPAYMENT_PROXY_URL or enable Developer Test Mode"
      : "";
    throw new Error(`ccpayment ${path} code ${json.code}: ${json.msg}${hint}`);
  }

  return json.data as T;
}

/** The deposit record — the only place a deposit's amount and USD price come from. */
export function getDepositRecord(recordId: string) {
  return ccRequest<{
    record?: {
      recordId: string;
      referenceId?: string;
      coinSymbol?: string;
      amount?: string;
      coinUSDPrice?: string;
      status?: string;
      isFlaggedAsRisky?: boolean;
    };
  }>("getAppDepositRecord", { recordId });
}

export const appId = APP_ID;
