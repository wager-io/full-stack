# Wager — unified app (Supabase backend)

One Vite SPA containing the casino frontend **and** the admin panel (`/admin`),
backed entirely by **Supabase** (Postgres + Auth + Realtime + Edge Functions).
There is no Node/Express/MongoDB server. The frontend is a static build; deploy
it to any static host.

## Run locally

1. Install the Supabase CLI: https://supabase.com/docs/guides/cli
2. From this folder:
   ```bash
   supabase start          # boots local Postgres/Auth/Realtime/Studio
   supabase db reset        # applies migrations/ + seed.sql
   ```
3. Copy the `API URL` and `anon key` printed by `supabase start` into `.env`:
   ```
   VITE_SUPABASE_URL=http://127.0.0.1:54321
   VITE_SUPABASE_ANON_KEY=<anon key from `supabase start`>
   ```
4. Install + run the SPA:
   ```bash
   npm install
   npm run dev
   ```
   - Casino: http://localhost:5173
   - Admin:  http://localhost:5173/admin  (requires a profile with `is_admin = true`)

### Make yourself an admin
Sign up through the app first (this creates the profile), then:
```bash
npm run promote-admin -- you@example.com          # defaults to super_admin
npm run promote-admin -- mod@example.com moderator
```
Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env`. There is deliberately no
promote-to-admin endpoint reachable from the browser — `promote_to_admin()` is
granted to `service_role` only, so holding the service key *is* the authorisation.

## Layout
```
src/lib/            supabase client + realtime/rpc shims + apiCompat (axios drop-in)
src/admin/          merged admin panel (mounted at /admin via src/App.jsx)
src/context/        AuthContext now backed by Supabase Auth (same exported shape)
supabase/migrations core schema + RLS + money-guard
supabase/seed.sql   VIP tiers
supabase/functions/ Edge Functions (added in later phases: payments, etc.)
```

## Migration status
Schedule and phase definitions: `../Wager_Supabase_Migration_Workflow.docx`.
Daily progress: `EOD_LOG.md`.

- [x] **Phase 0 — Foundation** (Day 1): unified app, admin at `/admin`, core schema
  (profiles/bills/vip/notifications/chat) + RLS + balance guard, Supabase Auth
  wired into AuthContext, live balance via profiles subscription. Function grants
  locked down, admin bootstrap. **Builds.**
- [ ] Phase 1 — Identity & money (Day 2): wallet ledger RPCs, global bet feed
- [ ] Phase 2 — Instant games (Days 3–4): dice, limbo, plinko
- [ ] Phase 3 — Stateful games (Days 5–6): mines, hilo
- [ ] Phase 4 — Crash (Days 7–8): deterministic scheduled rounds + pg_cron
- [ ] Phase 5 — Payments, comms, admin (Day 9): CCPayment Edge Functions, chat,
      admin data wiring
- [ ] Phase 6 — Hardening & cutover (Day 10)

## Notes
- All money mutations go through SECURITY DEFINER RPCs / service-role Edge
  Functions. The browser only uses the anon key (auth + RLS reads + Realtime).
- Legacy `src/utils/api.js` and `src/services/socketService.js` remain only for
  not-yet-migrated features; they no longer point at any external backend and
  are removed as each feature moves to Supabase.
