# workflows

Claude Code workflow scripts (run via the `Workflow` tool for deterministic
multi-agent orchestration) worth carrying between machines. These live under
`~/.claude/workflows/<name>.js` on a live machine; this directory mirrors
that layout so they can be symlinked or copied into place.

## What's here

| Workflow | Invocation | What it does |
| --- | --- | --- |
| `implement-review-loop.js` | `Workflow({ name: "implement-review-loop", args: ... })` | Plans/scopes a fix, optionally implements it, then loops Review (invokes the `code-review` skill) <-> Fix until clean. Three input modes: a GitHub issue, an existing plan file, or a free-text `scope` for reviewing already-written code (`skip: ["implement"]`). Per-phase model/effort overrides, a `fixScope` filter (`all` vs `urgent-only`), and a markdown report written to `.claude-workflow/` at the end regardless of outcome. |

Note: the Review phase depends on the `code-review` skill being available, and
issue-driven runs need an authenticated `gh` CLI.

## Install on a fresh machine

Symlink it into Claude Code's user-level workflows directory so edits here
stay in sync:

```bash
mkdir -p ~/.claude/workflows
ln -sf "$(pwd)/workflows/implement-review-loop.js" ~/.claude/workflows/implement-review-loop.js
```

Or copy it if you'd rather decouple from this repo:

```bash
cp workflows/implement-review-loop.js ~/.claude/workflows/
```
