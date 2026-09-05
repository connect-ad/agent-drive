---
description: Context Pack — review the session and persist only durable project knowledge
allowed-tools: Read, Grep, Glob, Edit, Write, Bash(git status:*), Bash(git diff:*), Bash(git log:*)
---

# cpack

**Context Pack** reviews the current working session and persists only the
project knowledge that is worth carrying forward.

Run `cpack` at the end of a working session, before a break, or after a change
that established something the project should remember.

The goal is **not to document the session**. The goal is to keep project
knowledge **accurate, organized, minimal, and current**.

---

## Procedure

### 1 · Gather

Read the following sources in order:

1. **Current session**

   * What was requested
   * What was decided
   * What was implemented
   * What was rejected
   * What remains unresolved

2. **`git status`**

   * Modified files
   * Staged files
   * Untracked files

3. **`git diff`**

   * Current unstaged implementation changes

4. **`git diff --staged`**

   * Current staged implementation changes

5. **`git log --oneline -10`**

   * Recent implementation history
   * Recent completed work
   * Relevant historical context

The repository is the implementation source of truth.

When the conversation conflicts with the current repository state, prefer the
repository and its diff.

Do not treat conversation statements as implemented merely because they were
discussed.

> **This repository is not yet under git.** Until `git init` is run, sources
> 2-5 are unavailable. Fall back to reading the working tree directly and say
> so in the report rather than reporting a clean diff.

---

### 2 · Extract

Convert the gathered information into small, atomic findings.

For each finding determine:

* **What is the claim?**
* **What evidence supports it?**
* **Is it current?**
* **Is it already documented?**
* **Does existing documentation contradict it?**
* **Is it completed, proposed, rejected, or unresolved?**

Separate:

* **Facts** — what is currently true
* **Decisions** — what was intentionally chosen
* **Constraints** — limits or requirements that must be respected
* **Rationale** — why a decision was made, when explicitly established
* **Open work** — identified but unfinished work
* **Open questions** — unresolved uncertainty

Never convert inference or speculation into a fact.

---

### 3 · Verify

Before persisting a finding, verify it against available evidence.

Use this precedence when sources conflict:

1. Current repository / current diff
2. Explicit decisions established by the project
3. Recent git history
4. Session conversation
5. AI inference

AI inference alone is never sufficient evidence for a persisted fact.

If evidence conflicts:

* Prefer the current implementation for **current implementation facts**
* Preserve an unresolved intended change as **backlog/open work** when appropriate
* Do not silently merge contradictory information
* Do not invent a resolution

If the truth cannot be established, do not write it as a fact.

---

### 4 · Classify

Assign every persistable finding to **exactly one destination**.

When multiple destinations appear possible, choose the most specific one.

| Finding                                                       | Destination                                           |
| ------------------------------------------------------------- | ----------------------------------------------------- |
| How to run, build, test, or deploy                            | `Skill/1 Build.md`                                    |
| Tokens, prices, thresholds, screen facts, approved deviations | `Skill/2 Design.md`                                   |
| A new reusable skill area with no existing document           | New `Skill/<N> <Name>.md` + `CLAUDE.md` catalog row   |
| A rule describing where project knowledge belongs             | `CLAUDE.md` -> Information Route                      |
| Work identified but not completed                             | New `backlog/NNN-<slug>.md` + `CLAUDE.md` catalog row |
| Previously tracked work that is now completed                 | Update the backlog item's status line                 |
| A change to a custom command's behavior                       | `.claude/commands/<name>.md`                          |

Do not create a new destination when an existing destination already applies.

#### Destinations in this repository

This project already has homes for most knowledge. Prefer them over creating a
`Skill/` file, or the same fact ends up in two places:

| Finding                                     | Existing home here                                 |
| ------------------------------------------- | -------------------------------------------------- |
| Product, UX, architecture, security, test   | `docs/design/NN-<slug>.md` — the specification      |
| A spec statement contradicted by the code    | Correct the doc in place (CLAUDE.md -> Precedence)  |
| File-transfer and tooling gotchas            | `.design-sync/NOTES.md`                             |
| Which Claude Design project is pinned        | `.design-sync/config.json`                          |
| Outstanding or completed work                | `backlog/NNN-<slug>.md`                             |
| Where knowledge lives                        | `CLAUDE.md` -> Information Route                    |

`Skill/1 Build.md` and `Skill/2 Design.md` do **not** exist yet. Create one only
when a finding genuinely has no home above — build and deploy commands are the
likely first case, once there is a backend to build. Add the catalog row to
`CLAUDE.md` in the same pass.

`design-system/` is a byte-verified mirror. Never write to it.

---

### 5 · Reconcile

Before writing, search the target documentation.

For every finding:

#### Already documented and correct

Do nothing.

#### Already documented but stale or incorrect

Correct the existing statement in place.

#### Missing

Add the smallest statement that preserves the meaning.

#### Contradictory

Do not blindly append another statement.

Determine whether:

* the existing documentation is stale and should be replaced,
* the new information is an unresolved proposal and belongs in `backlog/`,
* or the conflict cannot be resolved and must remain an open question.

Documentation should describe **one current truth**, not accumulate competing versions.

---

### 6 · Write

Make the smallest possible changes.

Rules:

* Preserve the existing voice.
* Preserve the existing structure.
* Do not reformat untouched sections.
* Do not reorder content unnecessarily.
* Do not rewrite for style alone.
* Do not add explanatory prose that carries no new knowledge.
* Do not duplicate knowledge across files.
* Do not create files unless the finding requires one.
* Update the `CLAUDE.md` catalog whenever a skill or backlog file is added,
  removed, or changes status.

`CLAUDE.md` is only the **route and catalog**.

Project knowledge belongs in the appropriate skill or backlog document, not
inside `CLAUDE.md`.

---

### 7 · Report

Report only what changed.

Use one line per written file.

For example:

```text
Skill/1 Build.md - updated Node version.
Skill/2 Design.md - corrected API timeout.
backlog/014-cache-migration.md - added unresolved migration work.
CLAUDE.md - updated catalog.
```

If nothing is worth persisting:

```text
Nothing was worth persisting.
```

This is a successful and valid result.

---

# Rules

## Never invent

Persist only information established by:

* the current repository,
* the current diff,
* project history,
* explicit project decisions,
* or the session when the session establishes something as a valid project
  decision or open item.

Do not turn:

* guesses,
* suggestions,
* speculation,
* temporary debugging observations,
* or unimplemented intentions

into project facts.

When uncertain, prefer an open question or backlog item over an invented fact.

---

## Repository beats conversation

The conversation describes what people intended, attempted, or discussed.

The repository shows what actually exists.

When they disagree:

> **Current repository state wins for current implementation facts.**

A conversation can still establish an intentional decision or unfinished work
when that distinction is explicit.

---

## Preserve rationale only when established

Persist not only **what** was decided but also **why**, when the rationale was
actually established during the session or in project evidence.

Never invent a rationale.

---

## Detect stale knowledge

`cpack` must look for existing knowledge that has become incorrect.

Do not append a new version beside an obsolete statement.

Replace stale knowledge with the current truth.

Example:

```text
Existing:
Node 20 is required.

Repository:
Node 22 is required.

Action:
Update the existing statement.
Do not add a second Node-version statement.
```

---

## One fact, one home

Every piece of project knowledge should have one authoritative destination.

Do not duplicate the same fact across:

* `CLAUDE.md`
* multiple skill documents
* backlog files
* custom-command documentation

`CLAUDE.md` may reference where knowledge belongs, but should not duplicate it.

---

## Idempotency

Running `cpack` repeatedly without new relevant changes must produce no
additional changes.

Conceptually:

```text
cpack(cpack(repository)) = cpack(repository)
```

A second run should normally result in:

```text
Nothing was worth persisting.
```

---

## Do not commit

`cpack` may write documentation and backlog files.

It must never create a git commit.

Committing is a separate action and requires explicit user instruction.

---

## Protect `README.md`

Never write to `README.md`.

`README.md` is a symlink to `CLAUDE.md`.

All routing and catalog changes must be made through `CLAUDE.md`.

---

## Minimality

The objective is not to maximize documentation.

The objective is to maximize **useful persistent knowledge while minimizing
noise, duplication, and churn**.

When in doubt between writing something and writing nothing:

> **Prefer writing nothing unless the information will materially help a
> future coding session.**
