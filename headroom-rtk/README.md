# headroom-rtk

The token-saving layer that every Claude Code and Codex session on this machine
runs through. **This is critical setup.** Without it, sessions still work, but
with no context compression and no compact command output.

Two tools, two different jobs:

| Tool | What it does | How it hooks in |
| --- | --- | --- |
| [Headroom](https://github.com/headroomlabs-ai/headroom) | Local **API gateway**. Compresses every request before it reaches Anthropic or OpenAI. | Background proxy on `127.0.0.1:8787`. Claude and Codex point their base URL at it. |
| RTK | **Command-output filter**. Rewrites Bash commands (`git status` becomes `rtk git status`) so their output is compact. | `PreToolUse` hook on the Bash tool, in both Claude and Codex. |

The goal: plain `claude` and plain `codex` get both, automatically. Nothing gets
wrapped by hand, so never use `headroom wrap`.

Versions this was set up and tested with (2026-10-17): Headroom `0.41.0`, RTK
`1.0.1`, macOS (Darwin 25).

## How it fits together

```
claude / codex
  │
  ├─ Bash tool call ──► PreToolUse hook: rtk hook claude|codex
  │                       rewrites `git status` → `rtk git status`
  │
  ├─ Session start ───► SessionStart hook: headroom init hook ensure
  │                       starts the proxy if it isn't running
  │
  └─ API request ─────► ANTHROPIC_BASE_URL / openai_base_url
                          = http://127.0.0.1:8787  (Headroom proxy)
                          ──► api.anthropic.com / api.openai.com
```

The proxy is also exposed as an MCP server (`headroom mcp serve`). Keep it, because
its `headroom_retrieve` tool is how an agent gets back content the proxy compressed
(the `hash=…` markers in tool output). It isn't a background process. Each session
launches it over stdio and it exits when the session ends.

## Install on a fresh machine

### 1. Install the binaries

```bash
# Headroom (Python, installed as a uv tool → ~/.local/bin/headroom)
uv tool install headroom-ai

# RTK: single native binary, needs to be on PATH (here: ~/.local/bin/rtk)
rtk --version   # expect 1.0.1 or newer
```

### 2. RTK for Claude Code and Codex

```bash
rtk init -g --auto-patch   # Claude: hook + ~/.claude/RTK.md + @RTK.md in CLAUDE.md
rtk init -g --codex        # Codex: hook in ~/.codex/hooks.json + AGENTS.md
```

`--codex` can't be combined with `--auto-patch`, so run them separately.

### 3. Headroom for Claude Code and Codex

Back up first. `init` edits both configs in place:

```bash
cp ~/.claude/settings.json ~/.claude/settings.json.pre-headroom
cp ~/.codex/config.toml   ~/.codex/config.toml.pre-headroom

headroom init -g claude
headroom init -g codex
```

### 4. Restart every running session

**This is the step that gets missed.** Claude and Codex load hooks only at session
start. A session that was already open keeps running without RTK or Headroom,
however long it stays up. That's exactly what happened to a long-lived
agent-deck conductor session here: 93 commands, none wrapped, until a restart.

### 5. Verify

```bash
./verify.sh          # config + proxy + hook checks, free
./verify.sh --live   # also runs one real `claude -p` and `codex exec` (costs tokens)
```

See [Testing](#testing) for what each check proves.

## What the config ends up looking like

These are written by `rtk init` / `headroom init`. They're reproduced here so a
broken setup can be spotted and fixed by hand. Don't copy them in instead of
running `init`.

### `~/.claude/settings.json`

```jsonc
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://127.0.0.1:8787",   // route API calls through Headroom
    "ENABLE_TOOL_SEARCH": "true"
  },
  "hooks": {
    "SessionStart": [
      { "matcher": "startup|resume", "hooks": [{ "type": "command", "timeout": 60,
        "command": "~/.local/bin/headroom init hook ensure --profile init-user --marker headroom-init-claude" }] }
    ],
    "PreToolUse": [
      { "matcher": "Bash", "hooks": [{ "type": "command", "command": "rtk hook claude" }] },
      { "matcher": "Bash", "hooks": [{ "type": "command", "timeout": 60,
        "command": "~/.local/bin/headroom init hook ensure --profile init-user --marker headroom-init-claude" }] }
    ]
  },
  "enabledPlugins": { "headroom@headroom-marketplace": true },
  "extraKnownMarketplaces": {
    "headroom-marketplace": { "source": { "source": "github", "repo": "headroomlabs-ai/headroom" } }
  }
}
```

Plus `@RTK.md` at the end of `~/.claude/CLAUDE.md`, which loads `~/.claude/RTK.md`
(the short "output is condensed, treat it as complete" note).

### `~/.codex/config.toml`

```toml
# --- Headroom init provider ---
model_provider = "headroom"
openai_base_url = "http://127.0.0.1:8787/v1"

[model_providers.headroom]
name = "OpenAI"
base_url = "http://127.0.0.1:8787/v1"
supports_websockets = true
requires_openai_auth = true
# --- end Headroom init provider ---

[features]
# --- Headroom init features ---
hooks = true          # Codex hooks are off by default; RTK needs this too
# --- end Headroom init features ---

# --- Headroom MCP server ---
[mcp_servers.headroom]
command = "~/.local/bin/headroom"
args = ["mcp", "serve"]
# --- end Headroom MCP server ---
```

### `~/.codex/hooks.json`

```json
{
  "hooks": {
    "SessionStart": [
      { "matcher": "startup|resume", "hooks": [{ "type": "command", "timeout": 60,
        "command": "~/.local/bin/headroom init hook ensure --profile init-user --marker headroom-init-codex" }] }
    ],
    "PreToolUse": [
      { "matcher": "Bash", "hooks": [{ "type": "command", "command": "rtk hook codex" }] },
      { "matcher": "Bash", "hooks": [{ "type": "command", "timeout": 60,
        "command": "~/.local/bin/headroom init hook ensure --profile init-user --marker headroom-init-codex" }] }
    ]
  }
}
```

The real files use absolute paths (`/Users/<you>/.local/bin/...`). `~` is shown
here for readability.

## Testing

Run these after install, after any `rtk` / `headroom` upgrade, and whenever a
session "doesn't seem to be using RTK". `verify.sh` runs all of them.

### Headroom

| Check | Command | Pass looks like |
| --- | --- | --- |
| Proxy is up | `headroom install status` | `Status: running`, `Healthy: yes` |
| Everything routed | `headroom doctor` | `✓ pass` on proxy, readiness, claude, codex, hooks, shell env |
| Traffic actually flows | `curl -s http://127.0.0.1:8787/stats` before and after a session | `api_requests` goes up |

Live test done on 2026-10-17. `api_requests` went **24 → 28** after one
`claude -p` call and **28 → 32** after one `codex exec`, so both route through
the proxy.

### RTK

| Check | Command | Pass looks like |
| --- | --- | --- |
| Config installed | `rtk init --show` | `[ok]` on Hook, RTK.md, Global CLAUDE.md, settings.json |
| Hook rewrites (Claude) | `echo '{"tool_name":"Bash","tool_input":{"command":"git status"},"hook_event_name":"PreToolUse"}' \| rtk hook claude` | JSON with `"updatedInput":{"command":"rtk git status"}` |
| Hook rewrites (Codex) | `./verify.sh --live`. Feeding `rtk hook codex` the same fake event prints nothing, because Codex's payload shape is different, so only a real session proves it. | `codex exec` log shows `rtk ls …` |
| Commands are counted | `rtk gain` before and after a session | `Total commands` goes up |
| Nothing slipping past | `rtk discover --since 1` | "MISSED SAVINGS" list is empty or near empty |

Live test done on 2026-10-17:

- **Claude**: `claude -p "Run git --version"` raised `rtk gain` by 1.
- **Codex**: `codex exec "Run ls -la /private/tmp | head -5"` showed the rewritten
  command in its own log (`/bin/zsh -lc 'rtk ls -la /private/tmp | head -5'`)
  and raised `rtk gain` by 3. An earlier `git --version` test didn't move the
  counter, because RTK has no rewrite for `git --version`. Test with a command
  RTK definitely handles (`ls`, `git status`).

### Reading the results correctly

- **Claude Code shows the original command, not the rewritten one.** The hook
  swaps the command in the background, so the chat still says `git status` even
  though `rtk git status` ran. Don't judge from the UI. Judge from the output
  format (`rtk git status` prints `* master...origin/master [ahead N]`, not
  `On branch master`) or from `rtk gain`. A hook can't change the display.
  Adding an "always type `rtk`" rule to `CLAUDE.md` was tried and dropped as not
  worth it.
- **Some commands are never wrapped, and that's expected.** RTK has no rewrite for
  `sqlite3`, `open`, `python3`, `git mv`, `git ls-tree`, `shasum`, or for multi-step
  commands that start with a variable assignment like `S=...; cd $S && ...`.
  These show up under "TOP UNHANDLED COMMANDS" in `rtk discover`. That isn't a
  setup bug.
- **A whole session with zero wrapped commands means it started before the hook
  existed.** Restart it (step 4).

## Known gaps

- **Not tested**: whether the proxy comes back on its own after a reboot or crash.
  `headroom install status` reports `Supervisor: none`. It depends on the
  `SessionStart` / `PreToolUse` hooks running `headroom init hook ensure`, not on
  launchd. If the proxy is down and the hook doesn't restart it, Claude and Codex
  calls fail, because their base URL points at a dead port. Fix with
  `headroom install start`.
- **Bypasses the proxy**: Claude Desktop agent sessions (Desktop overwrites
  `ANTHROPIC_BASE_URL`, per `headroom doctor`). The VS Code extension wasn't checked.
- **agent-deck**: sessions inherit `~/.claude/settings.json`, so they get both
  tools. But long-lived ones (conductors) must be restarted after any change
  here: `agent-deck session restart <title>`.

## Undo

```bash
headroom install remove          # stop the proxy and undo the managed config
rtk init -g --uninstall          # remove RTK hook, RTK.md, @RTK.md
# or restore the backups from step 3
```
