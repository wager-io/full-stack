# EOD Log — Wager Supabase Migration

One entry per working day: **what we did**, **what we do next**, **blockers**.
Newest entry at the top.

Plan of record: `../Wager_Supabase_Migration_Workflow.docx`
Phase checklist: `MIGRATION.md`

| Day | Date | Phase |
|-----|------|-------|
| 1 | Fri 10 Jul 2026 | Phase 0 — Foundation |
| 2 | Sat 11 Jul 2026 | Phase 1 — Identity & money |
| 3 | Sun 12 Jul 2026 | Phase 2 — Instant games |
| 4 | Mon 13 Jul 2026 | Phase 2 — Instant games |
| 5 | Tue 14 Jul 2026 | Phase 3 — Stateful games |
| 6 | Wed 15 Jul 2026 | Phase 3 — Stateful games |
| 7 | Thu 16 Jul 2026 | Phase 4 — Crash |
| 8 | Fri 17 Jul 2026 | Phase 4 — Crash |
| 9 | Sat 18 Jul 2026 | Phase 5 — Payments, comms, admin |
| 10 | Sun 19 Jul 2026 | Phase 6 — Hardening & cutover |

---

## EOD — Day 1, Friday 10 July 2026
**Phase 0 — Foundation**

### What we did

**Audited the existing `wager-app` against the Day 1 plan.** The foundation was
already ~85% built: the core schema, RLS on all six tables, the balance-guard
trigger, Supabase Auth in `AuthContext`, the live `profiles` balance
subscription, and the `/admin` shell behind `RequireAdmin` all existed and were
real working code. None of it was rebuilt.

**Put the project under version control.** `wager-app` was not a git repository —
no history, no rollback, on day one of a migration that touches every file.
Initialised, verified no secrets or `node_modules` were staged, and committed a
511-file baseline describing exactly what did and did not work at the start.

**Closed a critical hole in the money guard.** `0001_core_schema.sql` created
`adjust_balance()` as `SECURITY DEFINER` in the `public` schema and never revoked
the default `EXECUTE` grant that Postgres gives to `PUBLIC`. Supabase publishes
every `public` function as a PostgREST RPC, so any logged-in player could have
called:

```js
supabase.rpc('adjust_balance', { p_user: <own id>, p_delta: 1000000 })
```

and minted themselves an arbitrary balance. The `guard_balance_change` trigger
offered no protection, because `adjust_balance` is precisely the function that
disables it. This defeated Decision 4 of the plan ("money is never moved by the
browser") completely.

`0002_harden_foundation.sql` fixes it:
- revokes `EXECUTE` on `adjust_balance` from `public`, `anon`, `authenticated`;
  grants it to `service_role` only
- revokes the three trigger functions from client roles
- sets `alter default privileges ... revoke execute on functions from public`, so
  the schema is now **deny-by-default** and no future migration can reintroduce
  this by omission. Every browser-callable RPC from here on needs an explicit
  `GRANT`, which makes exposure a deliberate act rather than an accident.

**Fixed the admin bootstrap.** `is_admin` defaulted to false and nothing ever set
it, so `/admin` was unreachable on a fresh database. Added `promote_to_admin()`
(granted to `service_role` only — no browser-reachable promotion endpoint) and
`npm run promote-admin -- you@example.com`. Holding the service key is the
authorisation.

**Fixed a signup gap.** `handle_new_user()` created a `profiles` row but no
`vip_progress` row, so the VIP page read an empty set for every new user. Both
rows are now created atomically, and existing users are backfilled.

### Verification

- Both migrations and `seed.sql` parsed with `pglast` (libpg_query — the real
  Postgres parser): 44 + 15 + 1 statements, no errors. **Syntax only; not yet
  executed against a database** (see blocker).
- `npm run build` passes.
- Confirmed no `service_role` string reaches `dist/` — the service key is read
  without a `VITE_` prefix precisely because Vite inlines `VITE_*` vars into the
  browser bundle.

### What we do next — Day 2 (Sat 11 Jul), Phase 1: Identity & money

1. Stand up a real database and **execute** `0001` + `0002`; confirm the revoke
   actually blocks a client `rpc('adjust_balance')` call. This is the first
   acceptance criterion in the plan and is currently asserted, not proven.
2. Sign up a user end-to-end; confirm profile + vip_progress rows appear.
3. `npm run promote-admin`, confirm `/admin` opens.
4. Wallet ledger: `place_bet` / `settle_bet` RPCs writing `bills` atomically.
5. Global bet feed table + realtime subscription (replaces the `global-new-bet`
   socket event).
6. Point transactions / VIP / affiliate read pages at RLS reads, retiring their
   `utils/api.js` axios calls.

### Blockers

- **No database to run against.** Docker is not installed, so `supabase start`
  cannot boot a local stack, and `.env` still holds placeholder keys. Every
  migration written today is therefore unexecuted. Resolve by **either**
  installing Docker Desktop **or** creating a hosted Supabase dev project and
  running `supabase link && supabase db push`. This blocks all of Day 2 and is
  the single most urgent item.

### Known issues logged, not fixed

- The `Navbar` chunk builds to **8.3 MB** (2.3 MB gzipped). Not base64 assets — it
  is a country/flag dataset (~5,000 `country` references) bundled eagerly. A real
  performance problem for a casino front page. Deferred to Day 10 hardening;
  should be lazy-loaded.
- `public.public_profiles` view does not filter `hidden_from_public`, so opted-out
  usernames are readable by `anon`. Nothing consumes the view yet. Fix before the
  bet feed lands on Day 2.
- `socket.io-client`, `axios`, `mobx`, `js-cookie` are still installed and still
  imported by ~25 files (transactions, affiliate, chat, my-bets, auth modals).
  These retire feature by feature as each phase lands, per plan.
