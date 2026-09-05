# 012 · Put the project under git

**Status:** Open — blocks `cpush`

The working tree is not a git repository. `git rev-parse --is-inside-work-tree`
fails, there is no `.git/`, and there is no remote.

Everything built so far — 11 spec documents, the 96-file design-system mirror,
the whole `apps/web` source tree — exists only as untracked files on one
machine. There is no history, so no diff to review and nothing to roll back to.

This also disables two of the project's own commands:

- [`cpush`](../.claude/commands/cpush.md) cannot run at all. It commits, tags
  and pushes.
- [`cpack`](../.claude/commands/cpack.md) runs, but degraded: steps 2-5 of its
  Gather phase (`git status`, `git diff`, `git diff --staged`, `git log`) have
  no output, so it loses the evidence it prefers over conversation.

To close this:

1. `git init`, then add a `.gitignore` covering at least `node_modules/` and
   `apps/web/dist/`.
2. Commit the current tree as a baseline.
3. Add a remote, and push.

Decide before the first commit whether `design-system/` is tracked. It is a
byte-verified mirror of Claude Design project `d311bfd0`, so tracking it gives a
diff that would catch accidental edits to files that are supposed to be
read-only — the argument for committing it rather than ignoring it.
