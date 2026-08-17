# skills

Claude Code skills (`SKILL.md` files) worth carrying between machines and
projects. These live under `~/.claude/skills/<name>/SKILL.md` on a live
machine; this directory mirrors that layout so they can be symlinked or
copied into place.

## What's here

| Skill | Invocation | What it does |
| --- | --- | --- |
| `commit` | `/commit` | Rebases onto the base branch, squashes to one clean commit, pushes, and opens a PR via `gh`. Enforces a strict one-commit-per-PR workflow and commit message format. |
| `gh-context` | `/gh-context` | Pulls GitHub issue/PR context (via GitHub MCP tools) — lists issues, summarizes PR reviews/CI status, and helps decide what to work on next. Read-only unless explicitly confirmed. |
| `work-on` | `/work-on` | Works through one or more GitHub issues end-to-end: branches, implements, detects file conflicts across issues, commits (using the `commit` skill's message format), and produces a review guide. Builds on `gh-context`. |

`work-on` depends on `gh-context` and the `commit` message conventions, so
install all three together.

Note: these skills bake in personal conventions (branch naming
`nikky/...`, commit author `nikkyjsoriano`, no AI attribution in commits) —
adjust those if reusing on a machine/identity other than this one.

## Install on a fresh machine

Symlink each skill into Claude Code's user-level skills directory so edits
here stay in sync:

```bash
mkdir -p ~/.claude/skills
for skill in commit gh-context work-on; do
  ln -sf "$(pwd)/skills/$skill" ~/.claude/skills/$skill
done
```

Or copy them if you'd rather decouple from this repo:

```bash
cp -r skills/{commit,gh-context,work-on} ~/.claude/skills/
```

Requires the `gh` CLI (for `commit`) and the GitHub MCP server configured
(for `gh-context`/`work-on`).
