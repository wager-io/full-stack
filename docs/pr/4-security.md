# Title
fix(security): an open round can no longer be revealed; NaN and sub-cent stakes refused

# Body
**This one is urgent — the first item affects Mines, which is live.**

`rotate_seed` revealed the current server seed while a round was still open. A
player could start a Mines round, rotate, receive the seed that generated it,
compute every mine position, and then play it. I reproduced this against a
local database: the predicted positions and the actual ones matched exactly
(4, 11, 24). Rotation now refuses while any Mines or Hilo round is open,
raising `finish_active_game_first`.

Second: `place_bet` rejects a NaN stake and any stake finer than a cent, and
`adjust_balance` rejects NaN from the credit side. Postgres `numeric` NaN does
not behave like IEEE — `NaN = NaN` is TRUE and `NaN > 0` is TRUE — so the usual
`amount <= 0` check passes a NaN straight through, and one NaN anywhere turns a
balance into NaN permanently. My first attempt at this guard used the IEEE
idiom `p_amount <> p_amount` and never fired; the test caught it.

`vip_recalc` is called through `to_regprocedure` so this can merge before or
after the VIP branch without breaking every bet.

Tests `04_seed_rotation.sql` and `05_money_guards.sql` green, security-check
80/80.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
