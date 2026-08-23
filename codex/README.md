# codex

Codex CLI config worth carrying between machines: skills (via `skillshare`) and a
custom review subagent.

## Skills

All 5 skills in `skills/` already sync into Codex through `skillshare` — no
conversion needed, since Codex reads the same `SKILL.md` format Claude Code does.
On a machine where `skillshare` is set up with `codex` as a target, they show up
symlinked into `~/.codex/skills/` automatically.

## Agents

`agents/review.toml` is a custom Codex subagent used only for the review stage of
the `implement-review-loop` skill (plan/implement/fix stay as the main session's
own work — review is the one stage that benefits from a distinct, objective
persona). `implement-review-loop/SKILL.md`'s "Review quality" section spawns it by
name on Codex, and falls back to an independent review if it isn't configured.

Not synced through `skillshare` — its `codex` target currently has no `agents:`
path configured (only `claude`/`copilot`/`cursor`/`opencode` do), and adding one
means editing a machine-level config file (`~/.config/skillshare/config.yaml`) this
repo doesn't track. Install manually instead:

```bash
mkdir -p ~/.codex/agents
ln -sf "$(pwd)/codex/agents/review.toml" ~/.codex/agents/review.toml
```

### Experimental — unverified in headless sessions

An open GitHub issue (`openai/codex#15250`) reports that named custom-subagent
invocation may not work at all from headless/tool-backed/API Codex sessions — only
interactive CLI/app sessions are confirmed. Before relying on this in any
automated run, confirm it works: in a real interactive `codex` session, invoke
`$implement-review-loop` on a small scoped change and check whether the `review`
subagent actually gets spawned during the review step. If it doesn't, the skill
still degrades safely to reviewing the diff directly.

## Hooks

Out of scope for now. Codex hooks are beta and off by default
(`~/.codex/config.toml`). Note: `~/.codex/hooks.json` already exists on some
machines with an inert `Stop` hook pointing at `claude-notify`, left over from an
earlier experiment — it has no effect while the feature flag is unset.
