---
name: commit
description: This skill should be used when the user invokes "/commit" or explicitly asks to "squash commits", "create clean commit", "commit with message", or needs to follow project commit conventions with proper formatting.
version: 3.0.0
---

# Commit Skill

**Invocation**: `/commit [custom message]`

> **Tool priority**: Use the `gh` CLI for all GitHub operations (PR creation, labels, assignment, issue lookup) as well as all local git operations (branch, rebase, commit, push).

> **Goal**: Every PR must contain exactly one commit, rebased onto the latest base branch, and the PR title/body must come verbatim from that commit via `gh pr create --fill`. This is achieved by rebasing in Step 2 and squashing in Step 6 — never push multiple commits to a PR branch, and never let `gh pr create` run against a branch with more than one commit ahead of base.

---

## Step 1 — Branch Setup

Determine if there is an issue number associated with this work:
- If the user references an issue (e.g. "issue 47", "#47", or the work is clearly tied to one), the branch MUST be: `nikky/ISS-{N}-{slug}` where `{slug}` is 2–4 words derived from the issue title or the changes being made.
  - Example: `nikky/ISS-47-add-speed-histogram`, `nikky/ISS-12-fix-ble-reconnect`
- If there is no issue reference, use: `nikky/{slug}` (2–3 word slug from the changes)
  - Example: `nikky/lint-baseline`, `nikky/fix-scan-popup`

Check the current branch:
```bash
git branch --show-current
```

If it doesn't match the correct naming pattern for the current task:
- Rename: `git branch -m nikky/{correct-name}`

---

## Step 2 — Fetch & Rebase

```bash
git fetch origin
git rebase origin/main
```

> Use `origin/main` unless the repo's default branch is `master` — check with `git remote show origin | grep HEAD`.

If rebase has conflicts:
1. `git diff --name-only --diff-filter=U` — list conflicted files
2. Read each conflicted file, resolve by keeping the current branch's intent unless main has structural changes that should win
3. `git add <file>` after each resolution
4. `GIT_EDITOR=true git rebase --continue`
5. Repeat until clean

---

## Step 3 — Check Changes

```bash
git status
git log origin/main..HEAD --oneline
```

Abort if there is nothing staged or committed relative to `origin/main`.

---

## Step 4 — Review Changes

```bash
git diff origin/main...HEAD
```

Understand what changed — this informs both the commit message content and how many bullets it takes to explain it (Step 5).

Do not select or ask about labels unless the user explicitly brings them up. If they do, apply the labels they specify when creating the PR in Step 8.

### Issue lookup

If an issue number is already known — the user mentioned it, or it's embedded in the branch name (`nikky/ISS-{N}-...`) — fetch it so the commit is grounded in the real issue, not a guess:

```bash
gh issue view <N> --json title,state
```

Use the real title to phrase the commit accurately. Do not search for or guess an issue number that wasn't given — only enrich a number that's already known.

---

## Step 5 — Commit Message

**Default: concise.** Write this mode unless the user explicitly asks for the verbose/write-up form (see below).

```
<Title — imperative mood, max 50 chars>

* <bullet 1>
* <bullet 2>
* <bullet 3>

[<Closes|Fixes|Resolves> #<N>]
```

Rules:
- **Bullet count scales to the change, not a fixed number.** Count distinct logical changes (concerns touched), not lines or files changed. Minimum 1 bullet. There is no hard ceiling, but if it takes more than 6–7 bullets to explain, that's usually a sign the PR should have been split — write what's true regardless. A one-line fix gets one bullet. Don't pad to hit a count, and don't compress two unrelated changes into one bullet to hit a lower one.
- Bullet text must not contain special characters — no dashes, colons, semicolons, em dashes, or long hyphens.
- When there's a confirmed issue number, close the loop with a **randomly chosen** present-tense closing keyword — pick one of `Closes`, `Fixes`, `Resolves` each time (not always `Closes`). All three are recognized by GitHub for auto-close on merge to the default branch.
- **NEVER** add `Co-Authored-By:`, AI references, or session markers.

**Verbose — only when the user explicitly asks** (e.g. "write this one up", "make this a proper PR", "commit verbose"). Never trigger this automatically based on diff size — default is always concise.

```
<Title — imperative mood, max 50 chars>

## Problem
<1-3 sentences: what was broken, missing, or motivating this, as it was
actually experienced. Prose, not bullets.>

## Solution
<1-3 sentences: the fix/approach taken, in prose. Not a restatement of
the Problem section — say what changed about the situation.>

## Changes
* <bullet 1>
* <bullet 2>
* <bullet 3>

[<Closes|Fixes|Resolves> #<N>]
```

Rules for verbose mode:
- `Problem` and `Solution` are prose paragraphs — normal grammar and punctuation apply, unlike the bullet-formatting restrictions below.
- `Changes` follows the same scaled-bullet and no-special-character rules as concise mode.
- No `Testing`, `Implementation Notes`, or other sections beyond `Problem` / `Solution` / `Changes` — this is the floor and the ceiling. If a change genuinely needs to flag something else (a breaking change, a deliberate follow-up), fold it into `Solution` rather than adding a new section.
- Same `Closes`/`Fixes`/`Resolves` randomization and issue rules as concise mode.

---

## Step 6 — Squash & Commit

```bash
git reset --soft origin/main
git commit -m "<message>"
```

Verify author matches local git config (`git config user.name` / `git config user.email`). Expected: `nikkyjsoriano <nikkyjsoriano@gmail.com>`.

**Hard gate — do not skip:** confirm exactly one commit ahead of the base branch before proceeding to push or PR creation:
```bash
git log origin/main..HEAD --oneline
```
This must show exactly one line. If it shows more than one, `reset --soft` + `commit` did not run correctly — repeat this step. **Never run `gh pr create` while more than one commit is ahead of base** — `--fill` pulls from every commit in range, and a leftover multi-commit history is what produces a PR title/body full of unrelated commit messages and stray issue links. This check is a blocking gate, not an advisory one.

Then, automatically push to remote and create the PR. Only skip these if the user explicitly says not to.

### Push to Remote

```bash
git log -1 --stat
git push --force-with-lease origin <branch>
```

### Create PR via `gh` CLI

```bash
gh pr create --fill --base main
```

`--fill` pulls the title and body **directly and only** from the single commit's subject and body — no separate PR body is ever composed, and the PR title is always identical to the commit's first line. This is why the one-commit gate above is non-negotiable: `--fill` is only correct when exactly one commit is ahead of base.

PR parameters:
- **head**: Current branch
- **base**: `main` (or the repo default branch)
- **draft**: false

Do not assign the PR or apply labels unless the user explicitly asks for it. If they do, use:
```bash
gh pr edit <PR> --add-assignee nikkyjsoriano
gh pr edit <PR> --add-label <label>
```
