# Wager — feature parity audit

**Audited 18 September 2026.** Compares the three original apps
(`stake-cloneBackend`, `stake-cloneFrontend`, `stateCloneAdmin`) against this
unified Supabase app, so nothing from the original is lost in the move.

Owner: **Samuel**. Deployment: **Victor**.

Why we moved: the original needs a Node/Express server and MongoDB running
24/7, which is a Heroku bill every month. Supabase replaces the server, the
database, auth, realtime and the cron, and the frontend becomes a static build
that Netlify hosts free.

---

## 1. The good news

**The entire UI already moved, intact.** Verified by directory comparison:

- `stake-cloneFrontend/src/pages` and `wager-app/src/pages` — identical
- `stateCloneAdmin/src/pages` and `wager-app/src/admin/pages` — identical

No screen, component or asset is missing. What is missing is the **backend
behind them**: 154 Express endpoints and a Socket.IO layer that have to become
Postgres tables, RLS policies, RPCs and Edge Functions.

## 2. `MIGRATION.md` is wrong — read this instead

That file says Phases 1–6 are unstarted. The git history says otherwise. Fixing
it is job one, because it is the map everything else navigates by.

| Phase | `MIGRATION.md` | Reality (from git) |
|---|---|---|
| 0 — Foundation, schema, RLS, admin bootstrap | done | **done** |
| 1 — Wallet ledger, global bet feed | not started | **done** (`0004`) |
| 2 — Dice, Limbo, Plinko, provably fair | not started | **done** (`0005`, `0006`) |
| 3 — Mines, Hilo | not started | **Mines done (`0007`). Hilo not.** |
| 4 — Crash | not started | not started |
| 5 — Payments, chat, admin wiring | not started | not started |
| 6 — Hardening and cutover | not started | not started |

Last commit **14 July 2026**. Nine weeks cold.

## 3. How the original actually works

This is the thing most likely to mislead whoever picks it up.

**The games are Socket.IO, not REST.** The route files under
`routes/api/games/` only serve seeds and history. Real gameplay runs on socket
events: `dice-bet`, `limbo-bet`, `plinko-bet`, `mines-start`/`mines-reveal`/
`mines-cashout`, `hilo-init`/`hilo-bet`/`hilo-choice`/`hilo-cashout`/
`hilo-next-round`, and crash as `throw-bet`/`throw-escape`/`throw-xbet`.

Those route files are also **not mounted** in `routes/route.manager.js`. Don't
port them endpoint-for-endpoint. The Supabase equivalent of a socket game is a
`SECURITY DEFINER` RPC plus a Realtime subscription, which is exactly the shape
Dice, Limbo, Plinko and Mines already use. Copy that pattern.

## 4. Parity table — every domain

Legend: **DONE** · **PART** partial · **GAP** nothing exists yet.

| Domain | Original | Supabase now | Status |
|---|---|---|---|
| Auth — login, register, OTP, verify, forgot, change password | 8 endpoints + Google OAuth (passport) | Supabase Auth; `handle_new_user` | **PART** — Google OAuth not configured; OTP/resend flows still on the axios shim |
| Profile — username, privacy, KYC step 1, referral codes, avatar, default wallet, verify/change password, wallet lookup | 20 endpoints | `profiles` + column guard | **PART** — most of these have no RPC. KYC, referral codes and avatar upload are absent |
| Wallet / ledger | balance updates | `adjust_balance`, `guard_balance_change`, `bills` | **DONE** |
| Bets + global feed | 5 endpoints | `bets`, `place_bet`, `settle_bet`, `my_recent_bets` | **DONE** |
| VIP | 3 endpoints | `vip_tiers`, `vip_progress`, seeded | **PART** — no RPC to accrue wager or advance tier |
| Notifications | 9 endpoints + `new_notification` socket | `notifications` table | **PART** — no RPCs for read/read-all/preferences/clear |
| Dice | socket + 4 endpoints | `dice_roll`, `game_seeds`, `rotate_seed` | **DONE** |
| Limbo | socket | `limbo_roll` | **DONE** |
| Plinko | socket + 3 endpoints | `plinko_drop`, `pf_plinko_path`, `plinko_payouts` | **DONE** |
| Mines | socket + 9 endpoints | full `mines_*` set | **DONE** |
| **Hilo** | socket (5 events) + 3 endpoints | — | **GAP** |
| **Crash** | socket + 19 endpoints across two route files, plus engine, hashes, scripts, `crash_endgame_lock` | — | **GAP** — needs deterministic scheduled rounds (`pg_cron`) |
| Keno | **no backend at all** — UI only | — | **DECIDE** — it has a live route at `/casino/game/keno` and never had a server. Finish it or hide it |
| **CCPayment** — webhook, permanent addresses, deposits, withdrawals, currencies, prices, convert | 15 endpoints | `supabase/functions` is **empty** | **GAP** — the whole money-in/money-out layer |
| **Affiliate** — referrals, commission, commission rate, commission withdrawal, campaigns | 8 endpoints, 2 models | — | **GAP** |
| **Sports betting** — sports, leagues, games, odds, live, upcoming | 9 endpoints, third-party odds feed | — | **GAP** — `src/sports` UI exists with nothing behind it |
| **Admin** — dashboard, stats, user CRUD, balance/status/withdrawal toggles, deposits, withdrawals, bills, game reports, crash hash tools, admin accounts | 30 endpoints | `is_admin`, `promote_to_admin` | **GAP** — panel renders, data layer absent |
| **Live support chat** — tickets, agent queue, read receipts, status | ~20 socket events, `live-support.model` | `chat` table | **PART** — table exists, ticket system does not |
| Email — confirm, reset, change address | nodemailer + 3 templates | Supabase Auth email | **PART** — change-email template not covered |
| Avatar upload | Cloudinary + multer | — | **GAP** — move to Supabase Storage |

## 5. Traps

1. **Four Plinkos and two Hilos.** Only `Games/plinko/` and `Games/HiloV2/` are
   routed. `plinkoV1` (30 files), `plinkoV2` (20), `plinkoV3` (7) and `Hilo` (4)
   are dead. Delete them before working, or you will edit the wrong file.
2. **Ten-plus components still run the legacy `utils/api` and `socketService`
   shims** — chat, MyBets, Recent, Deposit, and the whole password-reset/OTP
   flow. They point at nothing. Every one is a live bug until migrated.
3. **`supabase/functions` is empty.** Anything needing a secret — CCPayment,
   the odds feed, outbound email — needs an Edge Function. None exist yet.
4. **Money rules.** Every balance change goes through a `SECURITY DEFINER` RPC
   or a service-role Edge Function. The browser holds only the anon key. Do not
   break that to move faster.

## 6. Deployment

- **Casino** → Netlify, static build from `npm run build`.
- **Admin** → `admin.<domain>`. It is the same SPA mounted at `/admin`, so
  either point the subdomain at the same build and rewrite `/` → `/admin`, or
  add a Netlify redirect on host. Access is gated by `is_admin`, not by URL —
  keep it that way, because a subdomain is not a security boundary.
- **CCPayment** → account must be registered and the webhook URL pointed at the
  Edge Function before deposits can be tested at all.
- **Env** → `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` in Netlify.
  `SUPABASE_SERVICE_ROLE_KEY` never goes near the frontend.

## 7. Suggested order

Each step is shippable on its own.

1. Correct `MIGRATION.md`; delete the dead game folders.
2. **Hilo** — closes Phase 3. Copy the Mines RPC pattern; smallest real win.
3. **Profile, VIP, notification RPCs** — many small gaps, mostly mechanical.
4. **Crash** — hardest. Scheduled rounds, `pg_cron`, hash chain, scripts.
5. **CCPayment Edge Functions** — deposits, withdrawals, webhook.
6. **Admin data layer** — 30 endpoints of reads plus a few writes.
7. Live support, avatar upload to Storage, legacy shim removal.
8. Sports, or a decision to drop it.
9. Keno — finish or hide.
10. Hardening, `npm run security-check`, cutover.
