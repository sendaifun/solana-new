#!/usr/bin/env bash
# superstack — one-command install
# Usage: curl -fsSL https://solana.new/setup.sh | bash
set -euo pipefail

# --- Branding ---
PRODUCT_NAME="superstack"
BASE_URL="https://solana-new-cli.vercel.app"

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

if ! has_cmd curl && ! has_cmd wget; then
  fail "curl or wget is required"
fi

# Check for Claude Code
if has_cmd claude; then
  ok "Claude Code found"
else
  warn "Claude Code not found. Install: npm i -g @anthropic-ai/claude-code"
fi

# --- Download and install skills ---
log "Downloading skills..."

SKILLS_DIR="$HOME/.claude/skills"
CODEX_DIR="$HOME/.codex/skills"
TMP_DIR=$(mktemp -d)

cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT

# Download tarball
if has_cmd curl; then
  curl -fsSL "${BASE_URL}/skills.tar.gz" -o "$TMP_DIR/skills.tar.gz"
elif has_cmd wget; then
  wget -q "${BASE_URL}/skills.tar.gz" -O "$TMP_DIR/skills.tar.gz"
fi

if [ ! -f "$TMP_DIR/skills.tar.gz" ]; then
  fail "Failed to download skills. Check your internet connection."
fi

ok "Downloaded skills bundle"

# Extract to temp
tar -xzf "$TMP_DIR/skills.tar.gz" -C "$TMP_DIR"
ok "Extracted skills"

# --- Install skills to ~/.claude/skills/ ---
log "Installing skills..."

mkdir -p "$SKILLS_DIR" "$CODEX_DIR"

# Copy each skill as its own directory (how Claude expects them)
for skill_dir in "$TMP_DIR"/skills/idea/*/  "$TMP_DIR"/skills/build/*/  "$TMP_DIR"/skills/launch/*/; do
  [ -d "$skill_dir" ] || continue
  skill_name=$(basename "$skill_dir")
  cp -Rf "$skill_dir" "$SKILLS_DIR/$skill_name"
  cp -Rf "$skill_dir" "$CODEX_DIR/$skill_name"
done

# Copy shared data (decision trees, runbooks, knowledge base)
mkdir -p "$SKILLS_DIR/${PRODUCT_NAME}-data" "$CODEX_DIR/${PRODUCT_NAME}-data"
if [ -d "$TMP_DIR/skills/data" ]; then
  cp -Rf "$TMP_DIR/skills/data/"* "$SKILLS_DIR/${PRODUCT_NAME}-data/"
  cp -Rf "$TMP_DIR/skills/data/"* "$CODEX_DIR/${PRODUCT_NAME}-data/"
fi

# Copy skill router
if [ -f "$TMP_DIR/skills/SKILL_ROUTER.md" ]; then
  cp -f "$TMP_DIR/skills/SKILL_ROUTER.md" "$SKILLS_DIR/SKILL_ROUTER.md"
  cp -f "$TMP_DIR/skills/SKILL_ROUTER.md" "$CODEX_DIR/SKILL_ROUTER.md"
fi

# Count installed skills
SKILL_COUNT=$(find "$SKILLS_DIR" -name "SKILL.md" -maxdepth 2 | wc -l | tr -d ' ')
ok "Installed ${SKILL_COUNT} skills to ~/.claude/skills/"
ok "Installed ${SKILL_COUNT} skills to ~/.codex/skills/"

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
if [ -f "$CONFIG_DIR/config.json" ] && has_cmd node; then
  node -e "
    const fs = require('fs');
    const p = '$CONFIG_DIR/config.json';
    const c = JSON.parse(fs.readFileSync(p, 'utf8'));
    c.telemetryTier = '$TELEMETRY_CHOICE';
    fs.writeFileSync(p, JSON.stringify(c, null, 2) + '\n');
  " 2>/dev/null || echo "{\"telemetryTier\":\"$TELEMETRY_CHOICE\"}" > "$CONFIG_DIR/config.json"
else
  echo "{\"telemetryTier\":\"$TELEMETRY_CHOICE\"}" > "$CONFIG_DIR/config.json"
fi
touch "$CONFIG_DIR/.telemetry-prompted"
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

printf "  ${BOLD}Get started${RESET} ${DIM}— open Claude and ask:${RESET}\n\n"
printf "    ${CYAN}claude \"What should I build in crypto?\"${RESET}          ${DIM}→ Idea phase${RESET}\n"
printf "    ${CYAN}claude \"Help me build the MVP\"${RESET}                   ${DIM}→ Build phase${RESET}\n"
printf "    ${CYAN}claude \"Deploy to mainnet\"${RESET}                       ${DIM}→ Launch phase${RESET}\n"
printf "\n"
printf "  ${DIM}Or invoke a skill directly:${RESET}\n\n"
printf "    ${CYAN}claude \"/find-next-crypto-idea I want to build in DeFi\"${RESET}\n"
printf "    ${CYAN}claude \"/scaffold-project Set up my Anchor workspace\"${RESET}\n"
printf "    ${CYAN}claude \"/build-with-claude Help me build the MVP\"${RESET}\n"
printf "    ${CYAN}claude \"/competitive-landscape Who are my competitors?\"${RESET}\n"
printf "    ${CYAN}claude \"/defillama-research Show me DeFi opportunities\"${RESET}\n"
printf "    ${CYAN}claude \"/roast-my-product Be brutal — what sucks?\"${RESET}\n"
printf "    ${CYAN}claude \"/product-review Review my product's UX\"${RESET}\n"
printf "    ${CYAN}claude \"/create-pitch-deck Help me pitch to investors\"${RESET}\n"
printf "    ${CYAN}claude \"/marketing-video Create a promo video\"${RESET}\n"
printf "\n"
printf "  ${DIM}Skills auto-activate based on your prompt. No CLI needed.${RESET}\n"
printf "\n"
