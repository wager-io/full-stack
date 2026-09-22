# Title
feat(hilo): Hilo on Supabase, provably fair, following the Mines pattern

# Body
Deliverable 2 of four. **Stacked on `chore/audit-cleanup--samuel` — merge that first.**

Hilo moves off the removed Express server onto `SECURITY DEFINER` RPCs, built
the same way Mines was: the server seed is never exposed while a round is open,
the client seed and nonce are the player's, and rotating a seed reveals the
previous server seed so past rounds can be checked.

Three Hilo implementations existed in the original. Only
`controllers/games/hilo/hilo.controller.js` was live; the header of
`0008_hilo.sql` says so and says how that was established, because the next
person will find the other two.

**Parity.** `supabase/tests/parity_hilo.mjs` runs the original JavaScript
verbatim against the Postgres port and compares byte for byte, including a
fixed seed that deals four Kings in a row to force the tie rule and the 5,000x
cap — the two paths random testing reaches least often.

Two things worth a reviewer's eye:
- Suits are written as `\u2660`-style escapes, not literal `♠♥♣♦`, so the
  migration is pure ASCII and cannot be corrupted by an editor or a client
  encoding.
- `profit` and `payout` are unscaled `numeric`. Fixing the scale truncated the
  multiplier before it reached the player.

Build clean, security-check 80/80, parity green.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
