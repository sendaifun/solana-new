#!/usr/bin/env bash
# Export the current AI session transcript to the project root.
# Supports: Claude Code (~/.claude) and Codex (~/.codex).
# Usage: export-session.sh [output-dir]

set -euo pipefail

output_dir="${1:-.}"
mkdir -p "$output_dir"

exported=""

# --- Claude Code ---
# Claude Code stores session transcripts as UUID.jsonl files in:
#   <config-dir>/projects/<project-slug>/
#
# The config dir is ~/.claude by default, but CLAUDE_CONFIG_DIR relocates it --
# that is the variable Claude Code actually reads, and anyone running more than
# one account sets it. Check every candidate root rather than one, so a second
# account is found instead of silently skipped.
claude_roots=()
[[ -n "${CLAUDE_CONFIG_DIR:-}" ]] && claude_roots+=("$CLAUDE_CONFIG_DIR")
[[ -n "${CLAUDE_HOME:-}" ]] && claude_roots+=("$CLAUDE_HOME")
claude_roots+=("$HOME/.claude")

# The slug is the cwd with every non-alphanumeric character replaced by a dash,
# applied to the *native* path. /Users/foo/bar -> -Users-foo-bar, and on Windows
# C:\Users\foo\my project -> C--Users-foo-my-project (the drive colon and the
# separator collapse into two dashes, and spaces become dashes too).
#
# Replacing only "/" is why this never matched on Windows: git-bash reports
# /c/Users/... so the slug came out -c-Users-..., and every Windows user fell
# through to the "newest session anywhere" branch below without being told.
slugify() { printf '%s' "$1" | sed 's/[^a-zA-Z0-9]/-/g'; }

project_slugs=()
cwd_posix="$(pwd)"
# Both forms: the original separator-only transform stays first so nothing that
# matched before can stop matching, and the fuller one is tried after it.
project_slugs+=("$(printf '%s' "$cwd_posix" | sed 's|/|-|g')")
project_slugs+=("$(slugify "$cwd_posix")")
# MSYS/git-bash: `pwd -W` gives the native C:\... form when available.
if cwd_native="$(pwd -W 2>/dev/null)" && [[ -n "$cwd_native" ]]; then
  project_slugs+=("$(slugify "$cwd_native")")
elif [[ "$cwd_posix" =~ ^/([a-zA-Z])/(.*)$ ]]; then
  drive="$(printf '%s' "${BASH_REMATCH[1]}" | tr '[:lower:]' '[:upper:]')"
  project_slugs+=("$(slugify "${drive}:/${BASH_REMATCH[2]}")")
fi

searched=""
for claude_projects in "${claude_roots[@]/%//projects}"; do
  [[ -d "$claude_projects" ]] || continue
  searched="${searched:+$searched, }$claude_projects"
  for project_slug in "${project_slugs[@]}"; do
    project_dir="$claude_projects/$project_slug"
    [[ -d "$project_dir" ]] || continue
    latest_claude="$(find "$project_dir" -maxdepth 1 -type f -name "*.jsonl" 2>/dev/null | xargs ls -t 2>/dev/null | head -1 || true)"
    [[ -n "${latest_claude:-}" ]] && break 2
  done
done

# Fallback: newest session across every root. This is a guess -- it can return a
# transcript from an unrelated project -- so say so instead of reporting success.
matched_project=true
if [[ -z "${latest_claude:-}" ]]; then
  matched_project=false
  for claude_projects in "${claude_roots[@]/%//projects}"; do
    [[ -d "$claude_projects" ]] || continue
    candidate="$(find "$claude_projects" -type f -name "*.jsonl" 2>/dev/null | xargs ls -t 2>/dev/null | head -1 || true)"
    if [[ -n "$candidate" ]]; then
      if [[ -z "${latest_claude:-}" || "$candidate" -nt "$latest_claude" ]]; then
        latest_claude="$candidate"
      fi
    fi
  done
fi

if [[ -n "${latest_claude:-}" && -f "$latest_claude" ]]; then
  cp "$latest_claude" "$output_dir/claude-session.jsonl"
  exported="claude-session.jsonl"
  echo "Exported Claude Code session: $output_dir/claude-session.jsonl"
  echo "  Source: $latest_claude"
  if [[ "$matched_project" != true ]]; then
    echo "  WARNING: no transcript matched this directory, so this is the newest"
    echo "  session found anywhere -- it may belong to a different project."
    echo "  Check the source path above before attaching it to an application."
  fi
elif [[ -n "$searched" ]]; then
  echo "No Claude Code session found in: $searched"
else
  echo "No Claude Code projects directory found (looked in: ${claude_roots[*]})"
fi

# --- Codex ---
codex_home="${CODEX_HOME:-$HOME/.codex}"
history_file="$codex_home/history.jsonl"
sessions_dir="$codex_home/sessions"

if [[ -f "$history_file" && -d "$sessions_dir" ]]; then
  session_id="$(tail -1 "$history_file" | sed -n 's/.*"session_id":"\([^"]*\)".*/\1/p' || true)"

  if [[ -n "$session_id" ]]; then
    session_file="$(find "$sessions_dir" -type f -name "*${session_id}.jsonl" 2>/dev/null | sort | tail -1 || true)"

    if [[ -n "$session_file" && -f "$session_file" ]]; then
      cp "$session_file" "$output_dir/codex-session.jsonl"
      exported="${exported:+$exported, }codex-session.jsonl"
      echo "Exported Codex session: $output_dir/codex-session.jsonl"
      echo "  Source: $session_file"
      echo "  Session ID: $session_id"
    fi
  fi
fi

# --- Result ---
if [[ -n "$exported" ]]; then
  echo ""
  echo "Session file(s) ready: $exported"
  echo "Location: $output_dir/"
  echo "Attach these to your grant application as proof of AI-assisted development."
else
  echo "No active AI session found."
  echo ""
  echo "To export manually:"
  echo "  Claude Code: Use /export in your Claude session, then copy the file here"
  echo "  Codex: Session logs are in ~/.codex/sessions/"
  echo ""
  echo "Save the exported file to: $output_dir/"
fi
