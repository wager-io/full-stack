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

### Make yourself an admin (local)
After signing up once, in Studio SQL editor:
```sql
update public.profiles set is_admin = true, admin_role = 'super_admin' where email = 'you@example.com';
```

## Layout
```
src/lib/            supabase client + realtime/rpc shims + apiCompat (axios drop-in)
src/admin/          merged admin panel (mounted at /admin via src/App.jsx)
src/context/        AuthContext now backed by Supabase Auth (same exported shape)
supabase/migrations core schema + RLS + money-guard
supabase/seed.sql   VIP tiers
supabase/functions/ Edge Functions (added in later phases: payments, etc.)
```

## Migration status (phased — see ../ plan file)
- [x] **Phase 1 — Foundation:** unified app, admin at `/admin`, core schema
  (profiles/bills/vip/notifications/chat) + RLS + balance guard, Supabase Auth
  wired into AuthContext, live balance via profiles subscription. **Builds.**
- [ ] Phase 2 — wallet/profile reads + instant games (dice/limbo/plinko)
- [ ] Phase 3 — stateful games (mines/hilo)
- [ ] Phase 4 — crash (deterministic scheduled rounds + pg_cron)
- [ ] Phase 5 — CCPayment Edge Functions + admin data wiring + affiliate/sports

## Notes
- All money mutations go through SECURITY DEFINER RPCs / service-role Edge
  Functions. The browser only uses the anon key (auth + RLS reads + Realtime).
- Legacy `src/utils/api.js` and `src/services/socketService.js` remain only for
  not-yet-migrated features; they no longer point at any external backend and
  are removed as each feature moves to Supabase.
