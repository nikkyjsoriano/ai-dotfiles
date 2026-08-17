# ai-dotfiles

My AI setup, kept in one place: configs, reusable skills, tooling, and notes.

## Layout

| Path | What lives here |
| --- | --- |
| `claude-code/` | Claude Code config — `CLAUDE.md`, `settings.json`, hooks, statusline |
| `skills/` | Reusable skills that are worth carrying between machines and projects |

Keeping this flat for now — more categories (Codex, proxy, notifier, other
tooling, notes) will get added back once there's real content for them.

## Conventions

- **Nothing secret gets committed.** Anything with a token, key, cookie, or
  internal hostname goes in a `*.local.*` file, which `.gitignore` excludes.
  Commit a `.example` version alongside it instead.
- Each top-level directory gets its own `README.md` explaining what's in it and
  how to install it on a fresh machine.
- Notes are dated and append-only. Correct in place, but don't silently rewrite
  history — the wrong turns are usually the useful part.

## Fresh machine

Setup instructions land here once the first configs are in.
