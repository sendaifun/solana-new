#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
#  SOLANA·NEW — Founder Pass  ·  Terminal Welcome Screen
#
#  Usage: bash solana-pass.sh [theme]
#  Themes: gold (default), blue, cyber, royal, obsidian, platinum
# ─────────────────────────────────────────────────────────

# ── Argument parsing ─────────────────────────────────────
THEME="gold"
GITHUB_USER_ARG=""

while [ $# -gt 0 ]; do
  case "$1" in
    --github-user)
      GITHUB_USER_ARG="$2"
      shift 2
      ;;
    --github-user=*)
      GITHUB_USER_ARG="${1#*=}"
      shift
      ;;
    -h|--help)
      printf 'Usage: %s [theme] [--github-user USERNAME]\n' "$0"
      printf 'Themes: gold (default), blue, cyber, royal, obsidian, platinum\n'
      exit 0
      ;;
    *)
      THEME="$1"
      shift
      ;;
  esac
done

# ── Auto-detect user data ────────────────────────────────
_get_name() {
  local name
  name=$(git config --global user.name 2>/dev/null) && [ -n "$name" ] && { echo "$name"; return; }
  name=$(id -F 2>/dev/null) && [ -n "$name" ] && { echo "$name"; return; }
  echo "${USER:-Builder}"
}

_format_name() {
  # "Yash Agarwal" → "YASH  AGARWAL"
  echo "$(_get_name)" | tr '[:lower:]' '[:upper:]' | sed 's/ /  /g'
}

_today_issued() {
  local months=("JAN" "FEB" "MAR" "APR" "MAY" "JUN" "JUL" "AUG" "SEP" "OCT" "NOV" "DEC")
  local d m y
  d=$(date +%d)
  m=${months[$(($(date +%-m) - 1))]}
  y=$(date +%Y)
  echo "${d}  ${m}  ${y}"
}

_seal_parts() {
  local months=("JAN" "FEB" "MAR" "APR" "MAY" "JUN" "JUL" "AUG" "SEP" "OCT" "NOV" "DEC")
  SEAL_TOP=${months[$(($(date +%-m) - 1))]}
  SEAL_MID=$(date +%d)
  SEAL_BOT="'$(date +%y)"
}

# ── GitHub identity + stats ──────────────────────────────
GH_LOGIN=""
GH_CONTRIBS=""
GH_REPOS_NUM=""
GH_FOLLOWERS_NUM=""

_gh_can_auth() {
  command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1
}

_resolve_github_login() {
  if [ -n "$GITHUB_USER_ARG" ]; then
    printf '%s\n' "$GITHUB_USER_ARG"
    return 0
  fi
  if [ -n "${GITHUB_USER:-}" ]; then
    printf '%s\n' "$GITHUB_USER"
    return 0
  fi
  local configured
  configured=$(git config --global github.user 2>/dev/null)
  if [ -n "$configured" ]; then
    printf '%s\n' "$configured"
    return 0
  fi
  if _gh_can_auth; then
    gh api user --jq '.login' 2>/dev/null
    return $?
  fi
  return 1
}

_fetch_gh_rest() {
  local login="$1" json type
  [ -z "$login" ] && return 1
  json=$(curl -sf --max-time 3 "https://api.github.com/users/$login" 2>/dev/null) || return 1
  type=$(echo "$json" | grep '"type":' | head -1 | sed 's/.*"type":[[:space:]]*"\([^"]*\)".*/\1/')
  [ "$type" = "User" ] || return 1
  GH_LOGIN="$login"
  GH_REPOS_NUM=$(echo "$json" | grep '"public_repos":' | head -1 | tr -dc '0-9')
  GH_FOLLOWERS_NUM=$(echo "$json" | grep '"followers":' | head -1 | tr -dc '0-9')
  return 0
}

_fetch_gh_graphql() {
  local login="$1" row
  [ -z "$login" ] && return 1
  _gh_can_auth || return 1
  row=$(gh api graphql \
    -f query='query($login: String!) { user(login: $login) { login contributionsCollection { contributionCalendar { totalContributions } } repositories(privacy: PUBLIC) { totalCount } followers { totalCount } } }' \
    -F login="$login" \
    --jq '.data.user | [.login, (.contributionsCollection.contributionCalendar.totalContributions|tostring), (.repositories.totalCount|tostring), (.followers.totalCount|tostring)] | @tsv' 2>/dev/null) || return 1
  IFS=$'\t' read -r GH_LOGIN GH_CONTRIBS GH_REPOS_NUM GH_FOLLOWERS_NUM <<EOF
$row
EOF
  [ -n "$GH_LOGIN" ]
}

_load_github_stats() {
  local login
  login=$(_resolve_github_login) || return 1
  [ -n "$login" ] || return 1
  _fetch_gh_graphql "$login" || _fetch_gh_rest "$login" || return 1
  return 0
}

_load_github_stats || true

if [ -n "$GH_CONTRIBS" ]; then
  PASS_GITHUB="${GH_CONTRIBS}  CONTRIBUTIONS"
elif [ -n "$GH_LOGIN" ]; then
  PASS_GITHUB="@${GH_LOGIN}"
else
  PASS_GITHUB="NOT  CONNECTED"
fi

# Right stub: repo count as vertical digits
if [ -n "$GH_REPOS_NUM" ]; then
  _rpad=$(printf "%-4s" "$GH_REPOS_NUM")
else
  _rpad="    "
fi
STUB_R1="${_rpad:0:1}"; [ "$STUB_R1" = " " ] && STUB_R1=""
STUB_R2="${_rpad:1:1}"; [ "$STUB_R2" = " " ] && STUB_R2=""
STUB_R3="${_rpad:2:1}"; [ "$STUB_R3" = " " ] && STUB_R3=""
STUB_R4="${_rpad:3:1}"; [ "$STUB_R4" = " " ] && STUB_R4=""

# ── Configurable Fields ──────────────────────────────────
PASS_NAME="$(_format_name)"
if [ -n "$GH_LOGIN" ]; then
  PASS_NAME="${PASS_NAME} (@${GH_LOGIN})"
fi
PASS_ISSUED="$(_today_issued)"
PASS_CLASS="FOUNDING  BUILDER"
PASS_NO="0142"
STAMP_1="○ IDEA"      # ● IDEA when earned
STAMP_2="○ BUILD"
STAMP_3="○ SHIP"
TAGLINE="you're now a certified agentic engineer on solana"
ORG_L="SUPERTEAM"
ORG_M="solana.new"
ORG_R="SendAI"
_seal_parts

# ── Colors (set by theme) ───────────────────────────────
R=$'\033[0m'

case "$THEME" in
  cyber)
    G=$'\033[38;5;49m'         # neon green
    GB=$'\033[1;38;5;50m'      # bright cyan
    GD=$'\033[38;5;23m'        # dark teal (borders)
    GK=$'\033[38;5;22m'        # dark green (labels)
    D=$'\033[38;5;43m'         # dim cyan (letters)
    BG=$'\033[48;5;232m'       # near-black
    ;;
  royal)
    G=$'\033[38;5;208m'        # orange
    GB=$'\033[1;38;5;214m'     # bright amber
    GD=$'\033[38;5;130m'       # burnt orange (borders)
    GK=$'\033[38;5;94m'        # dark bronze (labels)
    D=$'\033[38;5;172m'        # warm orange (letters)
    BG=$'\033[48;5;233m'       # dark bg
    ;;
  obsidian)
    G=$'\033[38;5;252m'        # bright silver
    GB=$'\033[1;38;5;255m'     # white
    GD=$'\033[38;5;240m'       # medium gray (borders)
    GK=$'\033[38;5;238m'       # dark gray (labels)
    D=$'\033[38;5;245m'        # mid gray (letters)
    BG=$'\033[48;5;232m'       # near-black
    ;;
  platinum)
    G=$'\033[38;5;188m'        # warm silver
    GB=$'\033[1;38;5;230m'     # cream white
    GD=$'\033[38;5;102m'       # pewter (borders)
    GK=$'\033[38;5;59m'        # dark pewter (labels)
    D=$'\033[38;5;145m'        # silver (letters)
    BG=$'\033[48;5;233m'       # dark bg
    ;;
  blue)
    G=$'\033[38;5;75m'         # sky blue
    GB=$'\033[1;38;5;117m'     # bright blue
    GD=$'\033[38;5;25m'        # deep blue (borders)
    GK=$'\033[38;5;24m'        # dark blue (labels)
    D=$'\033[38;5;69m'         # mid blue (letters)
    BG=$'\033[48;5;233m'       # dark bg
    ;;
  *) # gold (default)
    G=$'\033[38;5;178m'        # gold
    GB=$'\033[1;38;5;220m'     # gold bright bold
    GD=$'\033[38;5;136m'       # gold dim (borders)
    GK=$'\033[38;5;94m'        # gold dark (labels)
    D=$'\033[38;5;240m'        # dim (letters)
    BG=$'\033[48;5;233m'       # bg
    ;;
esac

# ── Layout constants ─────────────────────────────────────
MW=60   # main body inner width
SW=5    # stub inner width

# ── Helpers ──────────────────────────────────────────────
trunc() { printf "%.${2}s" "$1"; }
fixl()  { printf "%-${2}.${2}s" "$1"; }
fixr()  { printf "%${2}.${2}s" "$1"; }
fixc() {
  local txt="$1" w="$2" len=${#1}
  if ((len >= w)); then printf "%.${w}s" "$txt"
  else
    local lpad=$(( (w - len) / 2 )) rpad=$(( w - len - (w - len) / 2 ))
    printf "%*s%s%*s" "$lpad" "" "$txt" "$rpad" ""
  fi
}
rep() { printf "%0.s$1" $(seq 1 "$2"); }

# ── Auto-padding row helpers ────────────────────────────
vlen() {
  local stripped
  stripped=$(printf '%s' "$1" | perl -pe 's/\e\[\d+(;\d+)*m//g')
  echo ${#stripped}
}
row() {
  local content="$1" pad=$((MW - $(vlen "$1")))
  printf '%s' "$content"
  ((pad > 0)) && printf "${BG}%${pad}s" ""
}
rowlr() {
  local left="$1" right="$2" gap=$((MW - $(vlen "$1") - $(vlen "$2")))
  printf '%s' "$left"
  ((gap > 0)) && printf "${BG}%${gap}s" ""
  printf '%s' "$right"
}

# ── Stub functions ───────────────────────────────────────
# Left stub: ║ + [5 chars] + [sep + space] + ║
# Args: letter sep_char (pat ignored, kept for compat)
_L() {
  local ltr="$1" sep="$2"
  if [[ -n "$ltr" ]]; then
    printf "  ${GD}║${BG}  ${D}${ltr}${R}${BG}  ${GD}${sep} ║${BG}"
  else
    printf "  ${GD}║${BG}$(fixl '' $SW)${GD}${sep} ║${BG}"
  fi
}

# Right stub: ║ + [space + sep_char] + [5 chars] + ║
_R() {
  local ltr="$1" sep="$2"
  if [[ -n "$ltr" ]]; then
    printf "${R}${GD}║ ${sep}${BG}  ${D}${ltr}${R}${BG}  ${GD}║${R}\n"
  else
    printf "${R}${GD}║ ${sep}${BG}$(fixl '' $SW)${GD}║${R}\n"
  fi
}

# ── Derived values ───────────────────────────────────────
PASS_NO_FMT=$(echo "$PASS_NO" | sed 's/./& /g' | sed 's/ $//')

SEAL_TOP_L="╭───────╮"
SEAL_APR_L="│ $(fixc "$SEAL_TOP" 5) │"
SEAL_DAY_L="│ $(fixc "$SEAL_MID" 5) │"
SEAL_YR_L="│ $(fixc "$SEAL_BOT" 5) │"
SEAL_BOT_L="╰───────╯"

SEAL_BOX=9
VAL_W=$((MW - 1 - 13 - 1 - SEAL_BOX - 2))

NAME_DISP=$(fixl "$PASS_NAME" $VAL_W)
ISS_DISP=$(fixl "$PASS_ISSUED" $VAL_W)
CLS_DISP=$(fixl "$PASS_CLASS" $VAL_W)
LVL_DISP=$(fixl "◆  $PASS_GITHUB" $VAL_W)

S1=$(fixl "$STAMP_1" 10)
S2=$(fixl "$STAMP_2" 10)
S3=$(fixl "$STAMP_3" 10)

OL=$(fixl "$ORG_L" 18)
OM=$(fixc "$ORG_M" 16)
OR_STR=$(fixr "$ORG_R" 18)

# ── Logo art (SendAI S-circle) ──────────────────────────
W=$'\033[38;5;234m'  # watermark color (ghost - 1 shade above bg)
LOGO=(
  ""
  "           ${W}▄▄▄▄████▄▄▄▄${R}"
  "        ${W}▄▄███████████████▄${R}"
  "      ${W}▄███▀▄███▀████████▀███${R}"
  "     ${W}▄██▀ ▄██▀  █████████ ▀██▄${R}"
  "    ${W}██▀   ███   ██████████▄ ██▄${R}"
  "   ${W}██▀  ▄███▄██████████████▄ ██▄${R}"
  "   ${W}██▄██████▀▀▀▀██████████▀  ▀██${R}"
  "  ${W}████▀▀ ███    ▀▀▀▀█████▄    ██${R}"
  "  ${W}████▄  ███        ██████  ▄███${R}"
  "  ${W}▀█████████▄▄      ████████████${R}"
  "   ${W}██▄ ▀▀▀████████  █████▀▀▀ ██▀${R}"
  "   ${W}▀██▄            ▄█████   ███${R}"
  "    ${W}▀██▄  ███      █████▀  ██▀${R}"
  "      ${W}███▄ ███▄   █████▀▄▄██▀${R}"
  "        ${W}▀█████████████████▀${R}"
  "          ${W}▀▀▀█████████▀▀${R}"
  ""
  ""
  ""
)

# ── Build rows into array ───────────────────────────────
ROWS=()
_addrow() { ROWS+=("$(cat)"); }

# Collect each row by capturing output
_bL() { _L "$@"; }
_bR() {
  local ltr="$1" sep="$2"
  if [[ -n "$ltr" ]]; then
    printf "${R}${GD}║ ${sep}${BG}  ${D}${ltr}${R}${BG}  ${GD}║${R}"
  else
    printf "${R}${GD}║ ${sep}${BG}$(fixl '' $SW)${GD}║${R}"
  fi
}

collect() {
  local buf
  buf=$("$@" 2>&1)
  printf '%s' "$buf"
}

# ── Print ticket ─────────────────────────────────────────
echo ""

# Scallop top
ROWS+=("$(printf "  ${D}      "; rep "╌ " 34; printf "${R}")")

# Top border
ROWS+=("$(printf "  ${GD}╔"; rep "═" $SW; printf "╕ ╔"; rep "═" $MW; printf "╗ ╕"; rep "═" $SW; printf "╗${R}")")

# Row 0: brand
ROWS+=("$(_L '' '│'; rowlr " ${GB}◆ SOLANA·NEW  |  FOUNDER PASS${R}${BG}" "${GD}N° ${PASS_NO_FMT}${R}${BG} "; _bR '' '│')")

# Row 1: dotted
ROWS+=("$(_L '' '│'; row " ${GK}$(rep '┄' $((MW-2)))${R}${BG} "; _bR '' '│')")

# Row 2: C-notch top
ROWS+=("$(_L '' '╯'; row "$(fixl '' $MW)"; _bR '' '╰')")

# Row 3: NAME
ROWS+=("$(_L 'S' ' '; row " ${GK}NAME  ${GK}····· ${GB}${NAME_DISP}${R}${BG}"; _bR '' ' ')")

# Row 4: ISSUED
ROWS+=("$(_L 'O' ' '; rowlr " ${GK}ISSUED ${GK}···  ${G}${ISS_DISP}${R}${BG}" " ${D}${SEAL_TOP_L}${R}${BG} "; _bR "$STUB_R1" ' ')")

# Row 5: CLASS
ROWS+=("$(_L 'L' ' '; rowlr " ${GK}CLASS  ${GK}···· ${G}${CLS_DISP}${R}${BG}" " ${D}${SEAL_APR_L}${R}${BG} "; _bR "$STUB_R2" ' ')")

# Row 6: GITHUB
ROWS+=("$(_L 'A' ' '; rowlr " ${GK}GITHUB ${GK}···· ${G}${LVL_DISP}${R}${BG}" " ${GB}${SEAL_DAY_L}${R}${BG} "; _bR "$STUB_R3" ' ')")

# Row 7: seal '26
ROWS+=("$(_L 'N' ' '; rowlr "" " ${D}${SEAL_YR_L}${R}${BG} "; _bR "$STUB_R4" ' ')")

# Row 8: seal bottom
ROWS+=("$(_L 'A' ' '; rowlr "" " ${D}${SEAL_BOT_L}${R}${BG} "; _bR '' ' ')")

# Row 9: C-notch bottom
ROWS+=("$(_L '' '╮'; row "$(fixl '' $MW)"; _bR '' '╭')")

# Row 10: STAMPS
ROWS+=("$(_L '' '│'; row " ${GK}STAMPS ${GK}···  ${G}${S1}${R}${BG}  ${G}${S2}${R}${BG}  ${G}${S3}${R}${BG}"; _bR '' '│')")

# Row 11: tagline separator
ROWS+=("$(_L '' '│'; row "     ${GK}$(rep '─' $((MW-10)))${R}${BG}     "; _bR '' '│')")

TAG_TRUNC=$(trunc "$TAGLINE" $((MW - 4)))

# Row 12: tagline
ROWS+=("$(_L '' '│'; row "$(fixc "$TAG_TRUNC" $MW | sed "s/^/${G}/" | sed "s/$/${R}${BG}/")"; _bR '' '│')")

# Row 13: tagline separator bottom
ROWS+=("$(_L '' '│'; row "     ${GK}$(rep '─' $((MW-10)))${R}${BG}     "; _bR '' '│')")

# Row 14: footer divider
ROWS+=("$(printf "  ${GD}║${BG}$(fixl '' $SW)${GD}│ ╠"; rep "═" $MW; printf "╣ │${BG}$(fixl '' $SW)${GD}║${R}")")

# Row 15: footer
ROWS+=("$(_L '' '│'; rowlr " ${D}${OL}${R}${BG}  ${GK}${OM}${R}${BG}" "${D}${ORG_R}${R}${BG} "; _bR '' '│')")

# Bottom border
ROWS+=("$(printf "  ${GD}╚"; rep "═" $SW; printf "╛ ╚"; rep "═" $MW; printf "╝ ╛"; rep "═" $SW; printf "╝${R}")")

# Scallop bottom
ROWS+=("$(printf "  ${D}      "; rep "╌ " 34; printf "${R}")")

# ── Print rows with logo beside ─────────────────────────
for i in "${!ROWS[@]}"; do
  printf '%s%s\n' "${ROWS[$i]}" "${LOGO[$i]:-}"
done

echo ""
