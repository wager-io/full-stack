# Title
chore: correct the migration map, delete the four dead game folders

# Body
Deliverable 1 of four.

MIGRATION.md described a state the repo was not in. It is now corrected against
what the migrations actually contain, file by file.

The four dead game folders (Plinko and Hilo duplicates) are deleted. Each was
confirmed unreferenced before removal: nothing imports them, no route reaches
them, and the live implementation for each game is named in MIGRATION.md so the
next person does not have to work out which of three copies is real.

No behaviour changes. Build clean, security-check 80/80.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
