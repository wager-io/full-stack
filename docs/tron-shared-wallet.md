# WAGER and the poker platform share one TRON account

**Decided 2026-10-27. Accepted risk, not a defect.**

Both platforms derive player deposit addresses from the same BIP-44 account
xpub at the same path:

```
m/44'/195'/0'/5/{playerIndex}
```

WAGER's `_shared/tron.ts` was ported from the poker platform's
`financial-core`, path included. Same xpub + same path + same index produces
the same address, so:

| index | address | issued to |
|---|---|---|
| `/5/0` | `TA46NuFC2Eo2afQYZ4eBFBfPUUCNC2h1Xj` | poker player 0 **and** WAGER player 0 |
| `/5/1` | `TLKcdkShQd1ELkuNZFtVRU4JrfhXiFxnZx` | poker player 1 **and** WAGER player 1 |
| `/5/2` | `TNKyH1ussDQGeZQ7BUsDegufnzgKwPi1Eu` | poker player 2 **and** WAGER player 2 |

## What this means in practice

A deposit address is not unique to a platform, only to an index. If a poker
player sends USDT to the address poker gave them, and WAGER's watcher is
scanning that same address on mainnet, **WAGER credits its own player of the
same index**. The money is real and the attribution is wrong.

The exposure is narrower than it sounds today, and the reasons are worth
knowing because each of them could change:

- poker's `TRON_API_URL` points at `nile.trongrid.io` — the **testnet**. Its
  watcher is not looking at mainnet, so it does not credit mainnet deposits.
- poker has no `TRON_ACCOUNT_XPRV` configured, so it cannot sweep or spend.

Both of those are one config change away from being untrue. If poker is ever
pointed at mainnet, the two platforms are watching one set of addresses.

## What to watch

- A deposit crediting a player who did not make it.
- Two users, one on each platform, reporting the same deposit address.
- Anyone pointing the poker platform at `api.trongrid.io`.

## The fix, if this is ever revisited

Export WAGER's xpub from a **different account** of the same wallet —
`m/44'/195'/1'` against poker's `0'`. Same seed, same backup, same recovery
phrase; a completely separate address space, and still public-key-only, so
nothing that can spend goes near the server.

That is a single wallet export. `scripts/tron-setup.ts` takes
`KNOWN_OTHER_ADDRESSES` and refuses to run if the xpub it is given derives any
of them, which is how you would confirm you exported the right account.

## Why it is written down

Two platforms handing out identical deposit addresses looks exactly like a
derivation bug. Without this note, the next person to notice will spend a day
proving it is one, and may "fix" it — changing the derivation would orphan
every address already issued, and deposits to them would stop being credited
to anybody.
