# Title
feat: VIP recalculation, user stats, profile and notification RPCs

# Body
Deliverable 3 of four: the profile, VIP and notification RPCs.

**The VIP tier columns were never written.** `place_bet` adds every stake to
`current_wager`, so the wager total was right, but `current_tier`, `next_tier`
and `wager_to_next_tier` kept their creation defaults forever — every player
stored as unranked. The VIP screen hid this because the browser recomputes the
tier and never reads those columns; anything else that trusts them was reading
a lie. `vip_recalc` now runs wherever the wager moves, and there is a one-off
catch-up for existing rows.

**The Statistics modal was dead**, calling a removed Express endpoint.
`user_stats` replaces it, and refuses players who have set
`hidden_from_public` — the old endpoint served anyone's record to anyone.

**Profile and notification RPCs**: username (case-insensitively unique),
referral registration, and notification read/preferences with a defaulted
preferences table.

The last commit fixes four defects an audit found in the three commits before
it — a broken signup path, a still-crashing Statistics modal, a racy referral
guard and a first-save failure. Each fix was mutation-tested: reverted, and the
new check confirmed to go red. The commit message has the detail.

**Deployment note:** 0010 adds a case-insensitive unique index on
`profiles.username`. Check the hosted project for existing usernames that
differ only in case before it is applied.

Tests `02_vip_stats.sql` and `03_profile_notifications.sql` green, build clean,
security-check 80/80.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
