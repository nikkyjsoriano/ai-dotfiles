---
name: commit
description: This skill should be used when the user invokes "/commit" or explicitly asks to "squash commits", "create clean commit", "commit with message", or needs to follow project commit conventions with proper formatting.
version: 2.0.0
---

# Commit Skill

**Invocation**: `/commit [custom message]`

> **Tool priority**: Use the `gh` CLI for all GitHub operations (PR creation, labels, assignment) as well as all local git operations (branch, rebase, commit, push).

> **Goal**: Every PR must contain exactly one commit, rebased onto the latest base branch. This is achieved by rebasing in Step 2 and squashing in Step 6 — never push multiple commits to a PR branch.

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

Understand what changed. This informs the commit message in the next step.

Do not select or ask about labels unless the user explicitly brings them up. If they do, apply the labels they specify when creating the PR in Step 8.

---

## Step 5 — Commit Message

Format:
```
<Title — imperative mood, max 50 chars>

* <bullet 1>
* <bullet 2>
* <bullet 3>
* <bullet 4>
* <bullet 5>

[Closes #<N>]
```

Rules:
- 3 to 5 bullets
- Bullet text must not contain special characters — no dashes, colons, semicolons, em dashes, or long hyphens
- Include `Closes #N` only when there is a confirmed issue number
- **NEVER** add `Co-Authored-By:`, AI references, or session markers

---

## Step 6 — Squash & Commit

```bash
git reset --soft origin/main
git commit -m "<message>"
```

Verify author matches local git config (`git config user.name` / `git config user.email`). Expected: `nikkyjsoriano <nikkyjsoriano@gmail.com>`.

Confirm exactly one commit ahead of the base branch before proceeding:
```bash
git log origin/main..HEAD --oneline
```
This must show exactly one line. If it shows more than one, the `reset --soft` + `commit` did not run correctly — repeat this step.

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

`--fill` pulls the title and body directly from the commit message, so no separate PR body needs to be composed.

PR parameters:
- **head**: Current branch
- **base**: `main` (or the repo default branch)
- **draft**: false

Do not assign the PR or apply labels unless the user explicitly asks for it. If they do, use:
```bash
gh pr edit <PR> --add-assignee nikkyjsoriano
gh pr edit <PR> --add-label <label>
```
