/**
 * TRON (TRC-20) address derivation and the TronGrid read API.
 *
 * Ported from ../../poker/financial-core: src/wallet/tron-address.ts and
 * src/deposit/deposit-watcher.ts. Versions are pinned to the ones that project
 * runs — @noble/curves moved `ProjectivePoint` between minors, and a derivation
 * that changes is a player's deposit address changing underneath them.
 *
 * NO SECRET LIVES HERE. Addresses come from the account-level PUBLIC extended
 * key (TRON_ACCOUNT_XPUB) at m/44'/195'/0'. The player leg …/5/{index} is a
 * non-hardened child, so a public key is enough to produce an address while the
 * private key stays offline. That property is the reason this can run in an
 * Edge Function at all.
 */

import { HDKey } from "npm:@scure/bip32@1.7.0";
import { keccak_256 } from "npm:@noble/hashes@1.8.0/sha3";
import { sha256 } from "npm:@noble/hashes@1.8.0/sha256";
import { base58 } from "npm:@scure/base@1.2.6";
import { secp256k1 } from "npm:@noble/curves@1.9.7/secp256k1";

/** TRON address version byte — mainnet and both testnets use 0x41. */
const TRON_PREFIX = 0x41;

/** The player branch of the BIP-44 tree: m/44'/195'/0'/5/{index}. */
const PLAYER_BRANCH = 5;

/** base58check: payload ‖ first 4 bytes of sha256(sha256(payload)). */
function base58check(payload: Uint8Array): string {
  const checksum = sha256(sha256(payload)).slice(0, 4);
  const out = new Uint8Array(payload.length + 4);
  out.set(payload, 0);
  out.set(checksum, payload.length);
  return base58.encode(out);
}

/**
 * The deposit address for one player index.
 *
 * xpub → /5/{index} → secp256k1 public key → keccak256 of the uncompressed
 * point with its 0x04 prefix dropped → last 20 bytes → 0x41 ‖ … → base58check.
 *
 * Deterministic: the same xpub and index always give the same address, which is
 * what lets an address be permanent without being stored as a secret.
 */
export function tronAddressFromXpub(accountXpub: string, playerIndex: number): string {
  if (!Number.isInteger(playerIndex) || playerIndex < 0) {
    throw new RangeError("playerIndex must be a non-negative integer");
  }
  const account = HDKey.fromExtendedKey(accountXpub);
  const child = account.deriveChild(PLAYER_BRANCH).deriveChild(playerIndex);
  if (!child.publicKey) throw new Error("xpub produced no public key");

  const uncompressed = secp256k1.ProjectivePoint.fromHex(child.publicKey).toRawBytes(false);
  const hash = keccak_256(uncompressed.slice(1));

  const address = new Uint8Array(21);
  address[0] = TRON_PREFIX;
  address.set(hash.slice(-20), 1);
  return base58check(address);
}

/** Is this a well-formed TRON address? Checks the version byte and checksum only. */
export function isValidTronAddress(address: string): boolean {
  let decoded: Uint8Array;
  try {
    decoded = base58.decode(address);
  } catch {
    return false;
  }
  if (decoded.length !== 25 || decoded[0] !== TRON_PREFIX) return false;
  const payload = decoded.slice(0, 21);
  const checksum = decoded.slice(21);
  const expected = sha256(sha256(payload)).slice(0, 4);
  return checksum.every((b, i) => b === expected[i]);
}

// ---------------------------------------------------------------------------
// TronGrid
// ---------------------------------------------------------------------------

export function tronApiUrl(): string {
  return (Deno.env.get("TRON_API_URL") ?? "https://api.trongrid.io").replace(/\/+$/, "");
}

/**
 * Optional, and the reason this whole approach works: TronGrid identifies a
 * caller by this header, not by source IP. There is nothing to whitelist, so
 * the dynamic egress of an Edge Function stops mattering. Without a key the
 * endpoint still answers, just at a lower rate limit.
 */
function tronApiKey(): string {
  return Deno.env.get("TRON_API_KEY") ?? "";
}

export interface IncomingTransfer {
  txHash: string;
  to: string;
  from: string;
  contract: string;
  /** Decimal string in token units, e.g. "500.000000". */
  amount: string;
  timestamp: number;
}

interface TronGridTrc20Tx {
  transaction_id: string;
  to: string;
  from: string;
  type: string;
  value: string;
  block_timestamp: number;
  token_info: { address: string; decimals: number };
}

/**
 * Raw base-unit integer string → decimal string.
 *
 * Done as string surgery, never with Number: USDT has 6 decimals and amounts
 * are unbounded, so parsing through a float silently loses precision on large
 * deposits — exactly where it costs most.
 */
export function rawToDecimal(raw: string, decimals: number): string {
  const neg = raw.startsWith("-");
  const digits = (neg ? raw.slice(1) : raw).padStart(decimals + 1, "0");
  const cut = digits.length - decimals;
  const whole = digits.slice(0, cut);
  const frac = decimals > 0 ? "." + digits.slice(cut) : "";
  return `${neg ? "-" : ""}${whole}${frac}`;
}

/**
 * Confirmed TRC-20 transfers INTO one address.
 *
 * `only_confirmed=true` is load-bearing: an unconfirmed transfer can still be
 * reorged away, and crediting one is crediting money that may never have
 * existed. `minTimestamp` narrows a re-scan to what is new.
 *
 * The contract is NOT filtered here. Fetching every token and refusing the
 * wrong ones in the database means a wrong-token deposit leaves a record we can
 * point at when a player asks where their money went — a server-side filter
 * would make it vanish silently.
 */
export async function fetchConfirmedTransfers(
  address: string,
  minTimestamp?: number,
): Promise<IncomingTransfer[]> {
  const params = new URLSearchParams({
    only_confirmed: "true",
    only_to: "true",
    limit: "50",
  });
  if (minTimestamp && minTimestamp > 0) params.set("min_timestamp", String(minTimestamp));

  const url = `${tronApiUrl()}/v1/accounts/${address}/transactions/trc20?${params}`;
  const headers: Record<string, string> = { accept: "application/json" };
  const key = tronApiKey();
  if (key) headers["TRON-PRO-API-KEY"] = key;

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`TronGrid ${res.status} for ${address}`);
  const body = (await res.json()) as { data?: TronGridTrc20Tx[] };

  return (body.data ?? [])
    .filter((t) => t.type === "Transfer" && t.to === address)
    .map((t) => ({
      txHash: t.transaction_id,
      to: t.to,
      from: t.from,
      contract: t.token_info.address,
      amount: rawToDecimal(t.value, t.token_info.decimals),
      timestamp: t.block_timestamp,
    }));
}
