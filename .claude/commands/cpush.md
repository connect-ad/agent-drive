---
description: Context Push — interactively commit, tag, and push the current project state
allowed-tools: AskUserQuestion, Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*), Bash(git tag:*), Bash(git push:*), Bash(date:*)
---

# cpush

**Context Push.** Interactively commits and pushes the current project state.

`cpush` is the final step after `cpack`.

Its purpose is to:

1. Make sure project knowledge has been packed with `cpack`
2. Get explicit user confirmation
3. Commit all intended changes
4. Create a matching git tag
5. Push the commit and tag

`cpush` must never silently commit or push.

> **Preconditions.** This repository is not yet under git and has no remote.
> `cpush` cannot run until `git init`, a first commit, and a configured remote
> exist. Check with `git rev-parse --is-inside-work-tree` and
> `git remote -v` before step 1, and stop with a plain explanation if either
> is missing. Do not run `git init` as part of `cpush`.

---

## Procedure

### 1 · Confirm `cpack`

Start by asking the user (use `AskUserQuestion`):

```text
Have you run cpack for this session?

[yes] — Continue
[no]  — I will run cpack first
[cancel] — Cancel cpush
```

If the user selects **no**:

```text
Please run cpack first. I will not commit or push until cpack has completed.
```

Then stop.

Do not automatically run `cpack` unless the user explicitly asks `cpush`
to do so.

If the user selects **cancel**:

```text
cpush cancelled. Nothing was committed or pushed.
```

Then stop.

If the user selects **yes**, continue.

---

### 2 · Inspect the repository

Before committing, inspect:

```bash
git status
git diff
git diff --staged
```

Confirm what will be committed.

`cpush` commits **all current repository changes**, including:

* modified files
* staged files
* untracked files

Do not silently exclude files.

Never commit files that are ignored by git.

---

### 3 · Show the commit summary

Before creating the commit, show the user a concise summary:

```text
cpush is ready to commit:

Files:
  modified: 3
  added: 2
  deleted: 0

Commit:
  Fri-4-September-2026-11-50PM

Tag:
  Fri-4-September-2026-11-50PM

Push:
  current branch -> configured remote
```

Then ask:

```text
Proceed?

[yes] — Commit, tag, and push
[cancel] — Cancel
```

Do not commit until the user explicitly confirms.

---

### 4 · Generate the commit identifier

Generate the commit message from the current local date and time.

Format:

```text
Day-D-Month-Year-HH-MMAM/PM
```

Example:

```text
Fri-4-September-2026-11-50PM
```

Read the clock rather than inferring the date from conversation context:

```bash
date +"%a-%-d-%B-%Y-%I-%M%p"
```

Use the same exact value for:

* commit message
* git tag

The identifier must be generated once and reused.

Do not generate a different timestamp for the tag.

---

### 5 · Commit everything

Stage all current changes:

```bash
git add -A
```

Then create the commit:

```bash
git commit -m "<commit-message>"
```

If there is nothing to commit:

```text
Nothing to commit. cpush cancelled.
```

Do not create a tag or push when no commit was created.

---

### 6 · Create the tag

After the commit succeeds, create an annotated tag using the exact same
identifier:

```bash
git tag -a "<commit-message>" -m "<commit-message>"
```

The tag name and commit message must match exactly.

Do not create the tag if the commit failed.

If tag creation fails, stop.

Do not push until both the commit and tag exist locally.

---

### 7 · Push

Push the current branch:

```bash
git push
```

Then push the newly created tag:

```bash
git push origin "<commit-message>"
```

Only perform the push after the commit and tag have both succeeded.

---

### 8 · Verify

After pushing, verify:

```bash
git status
git log -1 --oneline
git tag --points-at HEAD
```

Confirm that:

* the commit exists
* the tag points to the new commit
* the working tree is clean, or clearly report remaining changes
* the push completed successfully

---

# Safety Rules

## Explicit confirmation is mandatory

`cpush` must receive explicit user confirmation before:

* committing
* creating the tag
* pushing

Never interpret silence, an ambiguous response, or a previous approval as
permission.

---

## `cpack` comes first

`cpush` is designed to follow `cpack`.

Do not commit or push when the user says they have not run `cpack`.

The user must either:

* run `cpack` and return to `cpush`, or
* explicitly cancel.

---

## Commit everything

`cpush` uses:

```bash
git add -A
```

It does not selectively commit files.

The user is responsible for ensuring that the working tree contains only
changes intended for this commit.

Before staging, show the user the current change summary.

---

## One identifier

The generated timestamp identifier is created once.

For example:

```text
Fri-4-September-2026-11-50PM
```

The exact same string must be used for:

```text
Commit message
Tag name
Tag message
```

---

## No partial push

The intended sequence is:

```text
cpack
  |
inspect
  |
user confirmation
  |
git add -A
  |
commit
  |
tag
  |
push branch
  |
push tag
  |
verify
```

If commit fails:

```text
STOP
```

If tag creation fails:

```text
STOP
```

If the branch push fails:

```text
STOP
```

Do not hide failures or claim success.

---

## Never force push

Never use:

```bash
git push --force
git push -f
```

Never rewrite history.

---

## Never amend automatically

Do not use:

```bash
git commit --amend
```

unless explicitly requested by the user.

---

## Never delete or replace tags automatically

If the generated tag already exists:

```text
Tag already exists: <tag>

cpush cannot safely reuse this tag.

[cancel]
```

Stop.

Never move, delete, or overwrite an existing tag automatically.

---

## Never commit secrets intentionally

If the repository contains obvious sensitive material such as credentials,
private keys, or secret files, stop and warn the user rather than blindly
pushing them.

Do not attempt to bypass repository or security protections.

---

# Final Report

On successful completion:

```text
cpush complete.

Commit: Fri-4-September-2026-11-50PM
Tag:    Fri-4-September-2026-11-50PM
Push:   successful
Status: clean
```

If anything fails, report exactly which operation failed and stop.

Example:

```text
cpush stopped.

Commit: successful
Tag:    successful
Push:   failed

No further git operations were performed.
```

A failed `cpush` must never be reported as successful.
