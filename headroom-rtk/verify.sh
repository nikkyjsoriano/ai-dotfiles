#!/usr/bin/env bash
# Verify the Headroom proxy + RTK hook setup for Claude Code and Codex.
#
#   ./verify.sh          config, proxy and hook checks (free)
#   ./verify.sh --live   also runs one real `claude -p` and `codex exec` (costs tokens)
#
# Exits non-zero if any check fails.

set -uo pipefail

PROXY="http://127.0.0.1:8787"
fails=0

pass() { printf '  \033[32m✓\033[0m %s\n' "$1"; }
fail() { printf '  \033[31m✗\033[0m %s\n' "$1"; fails=$((fails + 1)); }
check() { if eval "$2" >/dev/null 2>&1; then pass "$1"; else fail "$1"; fi; }

api_requests() { curl -s "$PROXY/stats" | grep -o '"api_requests":[0-9]*' | cut -d: -f2; }
rtk_commands() { rtk gain 2>/dev/null | awk '/Total commands/ {print $3}'; }

hook_rewrites() {
  # Feed a fake Claude PreToolUse event and expect an rtk rewrite back. Codex's
  # payload shape isn't documented, so its rewrite is only checked by --live.
  echo '{"tool_name":"Bash","tool_input":{"command":"git status"},"hook_event_name":"PreToolUse"}' \
    | rtk hook claude | grep -q '"command":"rtk git status"'
}

echo "Binaries"
check "headroom on PATH" "command -v headroom"
check "rtk on PATH" "command -v rtk"

echo "Headroom"
check "proxy healthy at $PROXY" "curl -sf $PROXY/health"
check "claude routed (ANTHROPIC_BASE_URL in settings.json)" \
  "grep -q '\"ANTHROPIC_BASE_URL\": \"$PROXY\"' ~/.claude/settings.json"
check "codex routed (model_provider = headroom)" \
  "grep -q '^model_provider = \"headroom\"' ~/.codex/config.toml"
check "codex hooks feature enabled" "grep -q '^hooks = true' ~/.codex/config.toml"
check "headroom doctor: no failures" "! headroom doctor 2>&1 | grep -q '✗ fail'"

echo "RTK"
check "claude hook installed" "grep -q 'rtk hook claude' ~/.claude/settings.json"
check "codex hook installed" "grep -q 'rtk hook codex' ~/.codex/hooks.json"
check "claude hook rewrites git status" "hook_rewrites"
check "@RTK.md loaded from ~/.claude/CLAUDE.md" "grep -q '^@RTK.md' ~/.claude/CLAUDE.md"

if [[ "${1:-}" == "--live" ]]; then
  echo "Live (fresh sessions)"
  tmp=$(mktemp -d)
  cd "$tmp" || exit 1

  req0=$(api_requests); rtk0=$(rtk_commands)
  claude -p "Run the bash command: ls -la. Reply with only the word done." \
    --dangerously-skip-permissions >/dev/null 2>&1
  req1=$(api_requests); rtk1=$(rtk_commands)
  check "claude went through proxy (requests $req0 → $req1)" "(( req1 > req0 ))"
  check "claude used rtk (commands $rtk0 → $rtk1)" "(( rtk1 > rtk0 ))"

  out=$(codex exec --skip-git-repo-check \
    "Run the shell command: ls -la. Reply with only the word done." 2>&1)
  req2=$(api_requests); rtk2=$(rtk_commands)
  check "codex went through proxy (requests $req1 → $req2)" "(( req2 > req1 ))"
  check "codex used rtk (commands $rtk1 → $rtk2)" "(( rtk2 > rtk1 ))"
  check "codex log shows rewritten command" "grep -q 'rtk ls' <<<\"\$out\""

  cd - >/dev/null && rm -rf "$tmp"
fi

echo
if (( fails )); then
  echo "$fails check(s) failed. See README.md#testing."
  exit 1
fi
echo "All checks passed."
