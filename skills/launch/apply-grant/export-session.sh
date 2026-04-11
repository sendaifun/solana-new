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
#   ~/.claude/projects/<project-slug>/
# The project slug is the cwd path with slashes replaced by dashes.
claude_home="${CLAUDE_HOME:-$HOME/.claude}"
claude_projects="$claude_home/projects"

if [[ -d "$claude_projects" ]]; then
  # Derive the project slug from the current working directory
  # Claude Code uses: -Users-foo-bar for /Users/foo/bar
  project_slug="$(pwd | sed 's|/|-|g')"
  project_dir="$claude_projects/$project_slug"

  if [[ -d "$project_dir" ]]; then
    # Find the most recently modified .jsonl session file
    latest_claude="$(find "$project_dir" -maxdepth 1 -type f -name "*.jsonl" 2>/dev/null | xargs ls -t 2>/dev/null | head -1 || true)"
  fi

  # Fallback: search all projects for the most recent session
  if [[ -z "${latest_claude:-}" ]]; then
    latest_claude="$(find "$claude_projects" -type f -name "*.jsonl" 2>/dev/null | xargs ls -t 2>/dev/null | head -1 || true)"
  fi

  if [[ -n "${latest_claude:-}" && -f "$latest_claude" ]]; then
    cp "$latest_claude" "$output_dir/claude-session.jsonl"
    exported="claude-session.jsonl"
    echo "Exported Claude Code session: $output_dir/claude-session.jsonl"
    echo "  Source: $latest_claude"
  else
    echo "No Claude Code session found in $claude_projects/"
  fi
else
  echo "No Claude Code projects directory found at $claude_projects/"
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
