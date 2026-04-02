#!/usr/bin/env bash
# superstack — one-command bootstrap
# Usage: curl -fsSL https://raw.githubusercontent.com/sendaifun/solana-new-cli/main/install.sh | bash
set -euo pipefail

# --- Branding ---
PRODUCT_NAME="superstack"
NPM_PACKAGE="superstack"
GITHUB_REPO="sendaifun/solana-new-cli"
GITHUB_URL="https://github.com/${GITHUB_REPO}.git"

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

log()  { printf "\n  ${GREEN}▸${RESET} %s\n" "$1"; }
warn() { printf "  ${YELLOW}!${RESET} %s\n" "$1"; }
fail() { printf "\n  ${RED}✗${RESET} %s\n\n" "$1" >&2; exit 1; }
ok()   { printf "  ${GREEN}✓${RESET} %s\n" "$1"; }

has_cmd() { command -v "$1" >/dev/null 2>&1; }

# --- Banner ---
printf "\n"
printf "  ${CYAN}${BOLD} ___ _   _ ___ ___ ___ ___ _____ _   ___ _  __${RESET}\n"
printf "  ${CYAN}${BOLD}/ __| | | | _ \\ __| _ \\ __|_   _/_\\ / __| |/ /${RESET}\n"
printf "  ${CYAN}${BOLD}\\__ \\ |_| |  _/ _||   /__ \\ | |/ _ \\ (__| ' < ${RESET}\n"
printf "  ${CYAN}${BOLD}|___/\\___/|_| |___|_|_\\___/ |_/_/ \\_\\___|_|\\_\\\\${RESET}\n"
printf "  ${DIM}Ship on Solana — Idea to Launch${RESET}\n\n"

# --- Prerequisites ---
log "Checking prerequisites..."

if ! has_cmd node || ! has_cmd npm; then
  fail "Node.js and npm are required (>= 20). Install from https://nodejs.org"
fi

NODE_MAJOR=$(node -e "console.log(process.versions.node.split('.')[0])")
if [ "$NODE_MAJOR" -lt 20 ]; then
  fail "Node.js >= 20 required (found v$(node -v)). Update: https://nodejs.org"
fi
ok "Node.js $(node -v)"
ok "npm $(npm -v)"

# --- Install superstack globally ---
if ! has_cmd "$PRODUCT_NAME"; then
  log "Installing ${PRODUCT_NAME} globally..."
  if ! npm install -g "$NPM_PACKAGE"; then
    warn "Global install failed. Will use npx as fallback."
  fi
fi

if has_cmd "$PRODUCT_NAME"; then
  ok "${PRODUCT_NAME} $(${PRODUCT_NAME} --version 2>/dev/null || echo 'installed')"
fi

# --- Install agent CLIs ---
AGENT_CLI=""
if has_cmd claude; then
  AGENT_CLI="claude"
  ok "Claude Code found"
else
  log "Installing Claude Code CLI..."
  if npm install -g @anthropic-ai/claude-code; then
    AGENT_CLI="claude"
    ok "Claude Code installed"
  else
    warn "Could not install Claude Code. Install later: npm i -g @anthropic-ai/claude-code"
  fi
fi

if has_cmd codex; then
  [ -n "$AGENT_CLI" ] && AGENT_CLI="${AGENT_CLI}+codex" || AGENT_CLI="codex"
  ok "Codex found"
else
  log "Installing Codex CLI..."
  if npm install -g @openai/codex; then
    [ -n "$AGENT_CLI" ] && AGENT_CLI="${AGENT_CLI}+codex" || AGENT_CLI="codex"
    ok "Codex installed"
  else
    warn "Could not install Codex. Install later: npm i -g @openai/codex"
  fi
fi

# --- Helper to run superstack ---
run_ss() {
  if has_cmd "$PRODUCT_NAME"; then
    "$PRODUCT_NAME" "$@"
  else
    npx -y "$NPM_PACKAGE" "$@"
  fi
}

# --- Install skills ---
log "Installing journey skills..."
mkdir -p "$HOME/.claude/skills" "$HOME/.codex/skills"
run_ss init

# --- Doctor ---
log "Running setup checks..."
if ! run_ss doctor 2>/dev/null; then
  warn "Doctor reported issues. Run: ${PRODUCT_NAME} doctor"
fi

# --- Telemetry opt-in ---
printf "\n"
printf "  ${BOLD}Telemetry${RESET} ${DIM}(helps us improve ${PRODUCT_NAME})${RESET}\n"
printf "  ${DIM}We track skill usage counts only — no code, no file paths, no PII.${RESET}\n"
printf "  ${DIM}Options: off (default), anonymous, community${RESET}\n\n"

if [ -t 0 ]; then
  printf "  Enable telemetry? [off/anonymous/community]: "
  read -r TELEMETRY_CHOICE </dev/tty || TELEMETRY_CHOICE="off"
  TELEMETRY_CHOICE="${TELEMETRY_CHOICE:-off}"
else
  TELEMETRY_CHOICE="off"
fi

CONFIG_DIR="$HOME/.${PRODUCT_NAME}"
mkdir -p "$CONFIG_DIR"
if [ -f "$CONFIG_DIR/config.json" ]; then
  node -e "
    const fs = require('fs');
    const p = '$CONFIG_DIR/config.json';
    const c = JSON.parse(fs.readFileSync(p, 'utf8'));
    c.telemetryTier = '$TELEMETRY_CHOICE';
    fs.writeFileSync(p, JSON.stringify(c, null, 2) + '\n');
  " 2>/dev/null || true
else
  echo "{\"telemetryTier\":\"$TELEMETRY_CHOICE\"}" > "$CONFIG_DIR/config.json"
fi
ok "Telemetry: $TELEMETRY_CHOICE"

# --- What gets installed ---
printf "\n"
printf "  ${CYAN}┌─────────────────────────────────────────────────────────────────┐${RESET}\n"
printf "  ${CYAN}│${RESET} ${BOLD}What gets installed:${RESET} Skills (Markdown prompts) in               ${CYAN}│${RESET}\n"
printf "  ${CYAN}│${RESET} ~/.claude/skills/ and ~/.codex/skills/. Decision trees,         ${CYAN}│${RESET}\n"
printf "  ${CYAN}│${RESET} runbooks, and catalog data. Nothing touches your PATH.          ${CYAN}│${RESET}\n"
printf "  ${CYAN}└─────────────────────────────────────────────────────────────────┘${RESET}\n"

# --- Done ---
printf "\n"
printf "  ${GREEN}${BOLD}Setup complete!${RESET}\n\n"

printf "  ${BOLD}Step 1: Get started${RESET}\n"
printf "    ${CYAN}${PRODUCT_NAME} ship${RESET}  ${DIM}— pick a skill, opens your agent CLI${RESET}\n"
printf "    ${CYAN}claude \"What should I build on Solana?\"${RESET}\n"
printf "\n"

printf "  ${BOLD}Step 2: Add to Your Repo ${DIM}(Optional)${RESET}\n"
printf "  ${DIM}Share ${PRODUCT_NAME} with your team — teammates just run setup once.${RESET}\n\n"
printf "    ${CYAN}cd your-project && ${PRODUCT_NAME} vendor${RESET}\n"
printf "\n"
printf "  ${DIM}Or manually:${RESET}\n"
printf "    ${CYAN}cp -Rf ~/.claude/skills/${PRODUCT_NAME} .claude/skills/${PRODUCT_NAME}${RESET}\n"
printf "    ${CYAN}rm -rf .claude/skills/${PRODUCT_NAME}/.git${RESET}\n"
printf "\n"
