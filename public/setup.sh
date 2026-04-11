#!/usr/bin/env bash
# superstack — one-command install & update
# Install: curl -fsSL https://www.solana.new/setup.sh | bash
# Update:  curl -fsSL https://www.solana.new/setup.sh | bash -s -- --update
set -euo pipefail

# --- Branding ---
PRODUCT_NAME="superstack"
BASE_URL="https://www.solana.new"

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

# --- Parse flags ---
UPDATE_MODE=false
UNINSTALL_MODE=false
for arg in "$@"; do
  case "$arg" in
    --update) UPDATE_MODE=true ;;
    --uninstall) UNINSTALL_MODE=true ;;
  esac
done

# --- Uninstall mode ---
if [ "$UNINSTALL_MODE" = true ]; then
  printf "\n"
  printf "  ${CYAN}${BOLD}Uninstalling ${PRODUCT_NAME}...${RESET}\n\n"

  SKILLS_DIR="$HOME/.claude/skills"
  CODEX_DIR="$HOME/.codex/skills"
  AGENTS_DIR="$HOME/.agents/skills"
  CONFIG_DIR="$HOME/.${PRODUCT_NAME}"

  # Read installed skill names from SKILL.md files
  for dir in "$SKILLS_DIR" "$CODEX_DIR" "$AGENTS_DIR"; do
    [ -d "$dir" ] || continue
    for skill in "$dir"/*/SKILL.md; do
      [ -f "$skill" ] || continue
      skill_dir=$(dirname "$skill")
      rm -rf "$skill_dir"
    done
    rm -rf "$dir/data" "$dir/SKILL_ROUTER.md"
  done

  rm -rf "$CONFIG_DIR"
  ok "Removed skills from ~/.claude/skills/, ~/.codex/skills/, ~/.agents/skills/"
  ok "Removed config from ~/.$PRODUCT_NAME/"
  printf "\n  ${DIM}To reinstall: curl -fsSL ${BASE_URL}/setup.sh | bash${RESET}\n\n"
  exit 0
fi

# --- Banner ---
printf "\n"
printf "  ${CYAN}${BOLD} ___ _   _ ___ ___ ___ ___ _____ _   ___ _  __${RESET}\n"
printf "  ${CYAN}${BOLD}/ __| | | | _ \\ __| _ \\ __|_   _/_\\ / __| |/ /${RESET}\n"
printf "  ${CYAN}${BOLD}\\__ \\ |_| |  _/ _||   /__ \\ | |/ _ \\ (__| ' < ${RESET}\n"
printf "  ${CYAN}${BOLD}|___/\\___/|_| |___|_|_\\___/ |_/_/ \\_\\___|_|\\_\\\\${RESET}\n"
if [ "$UPDATE_MODE" = true ]; then
  printf "  ${DIM}Updating skills...${RESET}\n\n"
else
  printf "  ${DIM}Ship on Solana — Idea to Launch${RESET}\n\n"
  printf "  ${BOLD}i'm your solana buddy by SendAI & Superteam.${RESET}\n\n"
  printf "  ${DIM}i'll help you end-to-end in your solana project development:${RESET}\n"
  printf "  ${DIM}from idea research & generation to building DeFi contracts${RESET}\n"
  printf "  ${DIM}or integrating payments to launching the product pitch!${RESET}\n\n"
fi

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
AGENTS_DIR="$HOME/.agents/skills"
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

mkdir -p "$SKILLS_DIR" "$CODEX_DIR" "$AGENTS_DIR"

# Copy each skill as its own directory
for skill_dir in "$TMP_DIR"/skills/idea/*/  "$TMP_DIR"/skills/build/*/  "$TMP_DIR"/skills/launch/*/; do
  [ -d "$skill_dir" ] || continue
  skill_name=$(basename "$skill_dir")
  cp -Rf "$skill_dir" "$SKILLS_DIR/$skill_name"
  cp -Rf "$skill_dir" "$CODEX_DIR/$skill_name"
  cp -Rf "$skill_dir" "$AGENTS_DIR/$skill_name"
done

# Copy shared data (decision trees, runbooks, knowledge base)
mkdir -p "$SKILLS_DIR/data" "$CODEX_DIR/data" "$AGENTS_DIR/data"
if [ -d "$TMP_DIR/skills/data" ]; then
  cp -Rf "$TMP_DIR/skills/data/"* "$SKILLS_DIR/data/"
  cp -Rf "$TMP_DIR/skills/data/"* "$CODEX_DIR/data/"
  cp -Rf "$TMP_DIR/skills/data/"* "$AGENTS_DIR/data/"
fi

# Copy skill router
if [ -f "$TMP_DIR/skills/SKILL_ROUTER.md" ]; then
  cp -f "$TMP_DIR/skills/SKILL_ROUTER.md" "$SKILLS_DIR/SKILL_ROUTER.md"
  cp -f "$TMP_DIR/skills/SKILL_ROUTER.md" "$CODEX_DIR/SKILL_ROUTER.md"
  cp -f "$TMP_DIR/skills/SKILL_ROUTER.md" "$AGENTS_DIR/SKILL_ROUTER.md"
fi

# Count installed skills
SKILL_COUNT=$(find "$SKILLS_DIR" -name "SKILL.md" -maxdepth 2 | wc -l | tr -d ' ')
ok "Installed ${SKILL_COUNT} skills to ~/.claude/skills/"
ok "Installed ${SKILL_COUNT} skills to ~/.codex/skills/"
ok "Installed ${SKILL_COUNT} skills to ~/.agents/skills/"

# --- Auto-allow skill bash preambles in Claude Code ---
log "Configuring Claude Code permissions..."

CLAUDE_SETTINGS="$HOME/.claude/settings.json"
if [ -f "$CLAUDE_SETTINGS" ] && has_cmd node; then
  # Add permission rule to auto-allow skill bash preambles
  node -e "
    const fs = require('fs');
    const p = '$CLAUDE_SETTINGS';
    const c = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!c.permissions) c.permissions = {};
    if (!c.permissions.allow) c.permissions.allow = [];
    const rules = ['Bash', 'Read', 'Glob', 'Grep'];
    for (const rule of rules) {
      if (!c.permissions.allow.includes(rule)) {
        c.permissions.allow.push(rule);
      }
    }
    fs.writeFileSync(p, JSON.stringify(c));
  " 2>/dev/null && ok "Auto-allow skill preambles: enabled" || warn "Could not update Claude settings"
elif [ ! -f "$CLAUDE_SETTINGS" ]; then
  mkdir -p "$HOME/.claude"
  echo '{"permissions":{"allow":["Bash","Read","Glob","Grep"]}}' > "$CLAUDE_SETTINGS"
  ok "Auto-allow skill preambles: enabled"
else
  warn "Node.js needed to update Claude settings. Skill preambles may prompt for approval."
fi

# --- Telemetry opt-in (skip if already prompted) ---
CONFIG_DIR="$HOME/.${PRODUCT_NAME}"
mkdir -p "$CONFIG_DIR"

if [ -f "$CONFIG_DIR/.telemetry-prompted" ]; then
  CURRENT_TIER=$(cat "$CONFIG_DIR/config.json" 2>/dev/null | grep -o '"telemetryTier":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "off")
  ok "Telemetry: ${CURRENT_TIER} (already configured)"
else
  printf "\n"
  printf "  ${BOLD}Telemetry${RESET} ${DIM}(helps us improve ${PRODUCT_NAME})${RESET}\n"
  printf "  ${DIM}We track skill usage counts only — no code, no file paths, no PII.${RESET}\n"
  printf "  ${DIM}Options: anonymous (default), off, community${RESET}\n\n"

  if [ -t 0 ]; then
    printf "  Enable telemetry? [off/anonymous/community]: "
    read -r TELEMETRY_CHOICE </dev/tty || TELEMETRY_CHOICE="anonymous"
    TELEMETRY_CHOICE="${TELEMETRY_CHOICE:-off}"
  else
    TELEMETRY_CHOICE="anonymous"
  fi

  if [ -f "$CONFIG_DIR/config.json" ] && has_cmd node; then
    node -e "
      const fs = require('fs');
      const p = '$CONFIG_DIR/config.json';
      const c = JSON.parse(fs.readFileSync(p, 'utf8'));
      c.telemetryTier = '$TELEMETRY_CHOICE';
      c.convexUrl = 'https://fastidious-fish-811.convex.cloud';
      fs.writeFileSync(p, JSON.stringify(c));
    " 2>/dev/null || echo "{\"telemetryTier\":\"$TELEMETRY_CHOICE\",\"convexUrl\":\"https://fastidious-fish-811.convex.cloud\"}" > "$CONFIG_DIR/config.json"
  else
    echo "{\"telemetryTier\":\"$TELEMETRY_CHOICE\",\"convexUrl\":\"https://fastidious-fish-811.convex.cloud\"}" > "$CONFIG_DIR/config.json"
  fi
  touch "$CONFIG_DIR/.telemetry-prompted"
  ok "Telemetry: $TELEMETRY_CHOICE"
fi

# Ensure convexUrl is in config
if [ -f "$CONFIG_DIR/config.json" ] && ! grep -q "convexUrl" "$CONFIG_DIR/config.json" 2>/dev/null; then
  if has_cmd node; then
    node -e "
      const fs = require('fs');
      const p = '$CONFIG_DIR/config.json';
      const c = JSON.parse(fs.readFileSync(p, 'utf8'));
      c.convexUrl = 'https://fastidious-fish-811.convex.cloud';
      fs.writeFileSync(p, JSON.stringify(c));
    " 2>/dev/null || true
  fi
fi

# --- Founder Pass ---
# Inline the pass renderer so it works from curl | bash
_render_pass() {
  local R=$'\033[0m' G=$'\033[38;5;178m' GB=$'\033[1;38;5;220m'
  local GD=$'\033[38;5;136m' GK=$'\033[38;5;94m' D=$'\033[38;5;240m' BG=$'\033[48;5;233m'
  local MW=60 SW=5

  # Auto-detect user data
  local raw_name
  raw_name=$(git config --global user.name 2>/dev/null) || raw_name=$(id -F 2>/dev/null) || raw_name="${USER:-Builder}"
  local PASS_NAME=$(echo "$raw_name" | tr '[:lower:]' '[:upper:]' | sed 's/ /  /g')
  local months=("JAN" "FEB" "MAR" "APR" "MAY" "JUN" "JUL" "AUG" "SEP" "OCT" "NOV" "DEC")
  local dd=$(date +%d) mm=${months[$(($(date +%-m) - 1))]} yy=$(date +%Y)
  local PASS_ISSUED="${dd}  ${mm}  ${yy}"
  local SEAL_T="$mm" SEAL_M="$dd" SEAL_B="'$(date +%y)"
  local PASS_NO_FMT=$(echo "0142" | sed 's/./& /g' | sed 's/ $//')

  # Helpers
  local fixl_='printf "%-${2}.${2}s" "$1"'
  _f() { printf "%-${2}.${2}s" "$1"; }
  _fc() { local t="$1" w="$2" l=${#1}; if ((l>=w)); then printf "%.${w}s" "$t"; else local lp=$(((w-l)/2)); printf "%*s%s%*s" "$lp" "" "$t" $((w-l-lp)) ""; fi; }
  _rep() { printf "%0.s$1" $(seq 1 "$2"); }
  _vlen() { local s; s=$(printf '%s' "$1" | perl -pe 's/\e\[\d+(;\d+)*m//g'); echo ${#s}; }
  _row() { local c="$1" p=$((MW-$(_vlen "$1"))); printf '%s' "$c"; ((p>0)) && printf "${BG}%${p}s" ""; }
  _rowlr() { local l="$1" r="$2" g=$((MW-$(_vlen "$1")-$(_vlen "$2"))); printf '%s' "$l"; ((g>0)) && printf "${BG}%${g}s" ""; printf '%s' "$r"; }
  _L() { local ltr="$1" sep="$2"; if [[ -n "$ltr" ]]; then printf "  ${GD}║${BG}  ${D}${ltr}${R}${BG}  ${GD}${sep} ║${BG}"; else printf "  ${GD}║${BG}$(_f '' $SW)${GD}${sep} ║${BG}"; fi; }
  _R() { local ltr="$1" sep="$2"; if [[ -n "$ltr" ]]; then printf "${R}${GD}║ ${sep}${BG}  ${D}${ltr}${R}${BG}  ${GD}║${R}\n"; else printf "${R}${GD}║ ${sep}${BG}$(_f '' $SW)${GD}║${R}\n"; fi; }

  # Precompute
  local SEAL_BOX=9 VAL_W=$((MW-1-13-1-9-2))
  local NAME_D=$(_f "$PASS_NAME" $VAL_W) ISS_D=$(_f "$PASS_ISSUED" $VAL_W)
  local CLS_D=$(_f "FOUNDING  BUILDER" $VAL_W) LVL_D=$(_f "◆  LVL  1" $VAL_W)
  local S1=$(_f "○ IDEA" 10) S2=$(_f "○ BUILD" 10) S3=$(_f "○ SHIP" 10)
  local OL=$(_f "SUPERTEAM" 18) OM=$(_fc "solana.new" 16)
  local ST="╭───────╮" SA="│ $(_fc "$SEAL_T" 5) │" SD="│ $(_fc "$SEAL_M" 5) │"
  local SY="│ $(_fc "$SEAL_B" 5) │" SB="╰───────╯"

  echo ""
  printf "  ${D}      "; _rep "╌ " 34; printf "${R}\n"
  printf "  ${GD}╔"; _rep "═" $SW; printf "╕ ╔"; _rep "═" $MW; printf "╗ ╕"; _rep "═" $SW; printf "╗${R}\n"
  _L '' '│'; _rowlr " ${GB}◆ SOLANA·NEW  |  FOUNDER PASS${R}${BG}" "${GD}N° ${PASS_NO_FMT}${R}${BG} "; _R '' '│'
  _L '' '│'; _row " ${GK}$(_rep '┄' $((MW-2)))${R}${BG} "; _R '' '│'
  _L 'A' '╯'; _row "$(_f '' $MW)"; _R '' '╰'
  _L 'D' ' '; _row " ${GK}NAME  ${GK}····· ${GB}${NAME_D}${R}${BG}"; _R '' ' '
  _L 'M' ' '; _rowlr " ${GK}ISSUED ${GK}···  ${G}${ISS_D}${R}${BG}" " ${D}${ST}${R}${BG} "; _R 'L' ' '
  _L 'I' ' '; _rowlr " ${GK}CLASS  ${GK}···· ${G}${CLS_D}${R}${BG}" " ${D}${SA}${R}${BG} "; _R 'V' ' '
  _L 'T' ' '; _rowlr " ${GK}LEVEL  ${GK}···· ${G}${LVL_D}${R}${BG}" " ${GB}${SD}${R}${BG} "; _R 'L' ' '
  _L 'O' ' '; _rowlr "" " ${D}${SY}${R}${BG} "; _R '1' ' '
  _L 'N' ' '; _rowlr "" " ${D}${SB}${R}${BG} "; _R '' ' '
  _L 'E' '╮'; _row "$(_f '' $MW)"; _R '' '╭'
  _L '' '│'; _row " ${GK}STAMPS ${GK}···  ${G}${S1}${R}${BG}  ${G}${S2}${R}${BG}  ${G}${S3}${R}${BG}"; _R '' '│'
  _L '' '│'; _row " ${GK}$(_rep '─' $((MW-10)))${R}${BG}     "; _R '' '│'
  _L '' '│'; _row "$(_fc "you're now a certified agentic engineer on solana" $MW | sed "s/^/${G}/" | sed "s/$/${R}${BG}/")"; _R '' '│'
  _L '' '│'; _row "     ${GK}$(_rep '─' $((MW-10)))${R}${BG}     "; _R '' '│'
  printf "  ${GD}║${BG}$(_f '' $SW)${GD}│ ╠"; _rep "═" $MW; printf "╣ │${BG}$(_f '' $SW)${GD}║${R}\n"
  _L '' '│'; _rowlr " ${D}${OL}${R}${BG}  ${GK}${OM}${R}${BG}" "${D}SendAI${R}${BG} "; _R '' '│'
  printf "  ${GD}╚"; _rep "═" $SW; printf "╛ ╚"; _rep "═" $MW; printf "╝ ╛"; _rep "═" $SW; printf "╝${R}\n"
  printf "  ${D}      "; _rep "╌ " 34; printf "${R}\n"
  echo ""
}
_render_pass

# --- Done ---
printf "\n"
if [ "$UPDATE_MODE" = true ]; then
  printf "  ${GREEN}${BOLD}Update complete!${RESET} ${DIM}${SKILL_COUNT} skills updated.${RESET}\n\n"
else
  printf "  ${GREEN}${BOLD}Setup complete!${RESET}\n\n"
fi

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
printf "  ${DIM}Or just tell your agent:${RESET}\n"
printf "  ${GREEN}\"i wanna build something cool for solana hackathon, but idk what to build\"${RESET}\n"
printf "\n"

printf "  ${BOLD}Update skills later:${RESET}\n"
printf "    ${CYAN}curl -fsSL ${BASE_URL}/setup.sh | bash -s -- --update${RESET}\n"
printf "\n"
printf "  ${BOLD}Uninstall:${RESET}\n"
printf "    ${CYAN}curl -fsSL ${BASE_URL}/setup.sh | bash -s -- --uninstall${RESET}\n"
printf "\n"
