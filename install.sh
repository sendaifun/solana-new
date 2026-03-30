#!/usr/bin/env bash
set -euo pipefail

has_cmd() {
  command -v "$1" >/dev/null 2>&1
}

log() {
  printf '\n==> %s\n' "$1"
}

warn() {
  printf 'WARN: %s\n' "$1" >&2
}

if ! has_cmd node || ! has_cmd npm; then
  echo "Node.js and npm are required. Install Node.js >= 20 and retry."
  exit 1
fi

mkdir -p "$HOME/.claude/skills" "$HOME/.codex/skills"

if ! has_cmd solana-new; then
  log "Installing solana-new globally"
  if ! npm install -g solana-new; then
    warn "Global install failed. Falling back to npx for this run."
  fi
fi

if ! has_cmd codex; then
  log "Installing Codex CLI (@openai/codex)"
  if ! npm install -g @openai/codex; then
    warn "Could not install Codex CLI. You can install it later with: npm i -g @openai/codex"
  fi
fi

if ! has_cmd claude; then
  log "Installing Claude Code CLI (@anthropic-ai/claude-code)"
  if ! npm install -g @anthropic-ai/claude-code; then
    warn "Could not install Claude Code. You can install it later with: npm i -g @anthropic-ai/claude-code"
  fi
fi

run_solana_new() {
  if has_cmd solana-new; then
    solana-new "$@"
  else
    npx -y solana-new "$@"
  fi
}

log "Initializing solana-new journey skills"
run_solana_new init

log "Running setup checks"
if ! run_solana_new doctor; then
  warn "Doctor reported issues. Resolve warnings above, then rerun: solana-new doctor"
fi

cat <<'EOF'

Setup complete.

Try:
  solana-new ship
  solana-new copilot start "What should I build on Solana for the Colosseum hackathon?"
  codex "What should I build on Solana for the Colosseum hackathon?"
  claude "What should I build on Solana for the Colosseum hackathon?"

EOF
