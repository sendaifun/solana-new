---
name: learn
description: |
  Manage project learnings across sessions. Review, search, prune, and export what
  superstack has learned. Use when asked to "what have we learned", "show learnings",
  "prune stale learnings", "export learnings", or "remember this".
  Proactively suggest when the user asks about past patterns or wonders
  "didn't we fix this before?"
---

## Preamble (run first)

```bash
_TEL_TIER=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"telemetryTier":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "off")
_TEL_TIER="${_TEL_TIER:-off}"
_TEL_START=$(date +%s)
_SESSION_ID="$$-$(date +%s)"
mkdir -p ~/.superstack
if [ "$_TEL_TIER" != "off" ]; then
echo '{"skill":"learn","phase":"idea","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
fi
```

> **Wrong skill?** See [SKILL_ROUTER.md](../../SKILL_ROUTER.md) for all available skills.

> Adapted from [gstack](https://github.com/garrytan/gstack) learn skill.

# Project Learnings

You manage the project's knowledge base. Learnings are stored in a single human-readable markdown file at `.superstack/learnings.md`, grouped by type: Patterns, Pitfalls, Preferences, Architecture, and Tools. Each entry has a key, insight, confidence score, source skill, relevant files, and date.

This skill is read/write for the learnings file ONLY. You never modify project code.

## Commands

| Command | Action |
|---------|--------|
| `/learn` | Show recent learnings (last 20 entries across all types) |
| `/learn search <query>` | Search learnings by keyword |
| `/learn prune` | Check for stale or contradictory entries |
| `/learn export` | Format learnings for CLAUDE.md |
| `/learn stats` | Summary statistics |
| `/learn add` | Manually add a learning |

---

## Learnings File Format

File: `.superstack/learnings.md`

```markdown
# Project Learnings

> Managed by `/learn`. Append-only — latest entry wins on conflicts.

## Patterns

### pda-seed-convention
- **Insight:** Use [program_id, user_pubkey, "vault"] as PDA seeds
- **Confidence:** 8/10
- **Source:** build-with-claude
- **Files:** programs/src/lib.rs
- **Date:** 2026-03-28

## Pitfalls

### cpi-signer-missing
- **Insight:** CPI calls require PDA signer seeds, not just the address
- **Confidence:** 9/10
- **Source:** debug-program
- **Files:** programs/src/instructions/settle.rs
- **Date:** 2026-03-28

## Preferences

(entries here)

## Architecture

(entries here)

## Tools

(entries here)
```

Each entry follows this structure:

```markdown
### kebab-case-key
- **Insight:** One clear sentence describing the learning
- **Confidence:** N/10
- **Source:** skill-name-that-generated-this
- **Files:** relevant/file/path.rs, another/file.ts (optional)
- **Date:** YYYY-MM-DD
```

---

## Command Implementations

### Show Recent (`/learn`)

1. Read `.superstack/learnings.md`
2. If the file does not exist, respond: "No learnings yet. As you use skills, superstack captures patterns and insights automatically. Use `/learn add` to manually record something."
3. Parse all entries across all type sections
4. Display the 20 most recent entries (sorted by Date descending)
5. Show total count at the bottom: "Showing 20 of N total learnings."

### Search (`/learn search <query>`)

1. Read `.superstack/learnings.md`
2. Search across all entry fields (key, insight, source, files) for the query string (case-insensitive)
3. Display all matching entries, grouped by type
4. If no matches: "No learnings match '{query}'. Try a broader search or check `/learn stats` for what's recorded."

### Prune (`/learn prune`)

1. Read all entries from `.superstack/learnings.md`
2. For each entry that has a **Files** field:
   - Use Glob to check if the referenced files still exist
   - If any file is missing, flag the entry as **stale**
3. Check for contradictions:
   - Entries with the same key but different insights
   - Entries where one says "do X" and another says "don't do X" on related topics
4. For each flagged entry, present via AskUserQuestion:
   - **A) Remove** — delete the entry
   - **B) Keep** — mark as still valid (update date to today)
   - **C) Update** — provide a new insight (ask for the updated text)
5. Apply changes and save the file

### Export (`/learn export`)

1. Read all entries from `.superstack/learnings.md`
2. Format as a clean markdown section:

```markdown
## Learnings

Key patterns, pitfalls, and preferences discovered during development.

### Patterns
- **pda-seed-convention:** Use [program_id, user_pubkey, "vault"] as PDA seeds (8/10)
- **another-pattern:** Description here (7/10)

### Pitfalls
- **cpi-signer-missing:** CPI calls require PDA signer seeds, not just the address (9/10)

### Preferences
...

### Architecture
...

### Tools
...
```

3. Use AskUserQuestion to ask: "Where should I put the exported learnings?"
   - **A) Append to CLAUDE.md** — add the section at the end of the project's CLAUDE.md
   - **B) Save to `.superstack/learnings-export.md`** — standalone file
   - **C) Print only** — display without saving

### Stats (`/learn stats`)

1. Read all entries from `.superstack/learnings.md`
2. Compute and display as a table:

| Metric | Value |
|--------|-------|
| Total entries | N |
| Unique keys | N |
| Patterns | N |
| Pitfalls | N |
| Preferences | N |
| Architecture | N |
| Tools | N |
| Top source | skill-name (N entries) |
| Avg confidence | X.X/10 |
| Oldest entry | YYYY-MM-DD |
| Newest entry | YYYY-MM-DD |

### Manual Add (`/learn add`)

1. Use AskUserQuestion to gather each field one at a time:
   - **Type:** pattern / pitfall / preference / architecture / tool
   - **Key:** kebab-case identifier (suggest one based on context if possible)
   - **Insight:** one clear sentence
   - **Confidence:** 1-10 (suggest a default based on certainty)
   - **Files:** relevant file paths, comma-separated (optional — offer to skip)
2. Set **Source** to `manual`
3. Set **Date** to today
4. Read `.superstack/learnings.md` (create with the template header if missing)
5. Find the correct type section (e.g., `## Patterns`)
6. Check if the key already exists:
   - If yes, append the new entry below the existing one (latest wins)
   - Inform the user: "Updated existing learning '{key}' — latest entry wins."
7. If no, append the entry at the end of the section
8. Write the updated file
9. Confirm: "Added {type} learning '{key}' with {confidence}/10 confidence."

---

## How Other Skills Write Learnings

Other skills (build-with-claude, debug-program, scaffold-project, etc.) should append learnings by following this protocol:

1. **Read** `.superstack/learnings.md` — if it does not exist, create it with this template:

```markdown
# Project Learnings

> Managed by `/learn`. Append-only — latest entry wins on conflicts.

## Patterns

## Pitfalls

## Preferences

## Architecture

## Tools
```

2. **Find the right section** — match the type to the heading (`## Patterns`, `## Pitfalls`, etc.)
3. **Append a new entry** under that section using the standard format:

```markdown
### kebab-case-key
- **Insight:** One clear sentence
- **Confidence:** N/10
- **Source:** skill-name
- **Files:** path/to/file.rs
- **Date:** YYYY-MM-DD
```

4. **De-duplication:** If the same key already exists in the section, append the new entry below it. The latest entry (by date) wins. Do not delete the old entry — it serves as history.

5. **When to write a learning:**
   - A non-obvious pattern was discovered during implementation
   - A pitfall was hit and resolved (especially if it cost > 10 minutes)
   - The user expressed a preference ("I prefer X over Y")
   - An architectural decision was made with trade-offs
   - A tool or library was chosen for specific reasons

6. **When NOT to write a learning:**
   - Trivial or obvious information
   - Temporary workarounds that will be removed
   - Information already in the project's README or CLAUDE.md

---

## Non-Negotiables

- **NEVER modify project code.** This skill manages learnings only.
- **Always use AskUserQuestion** before removing or modifying existing entries.
- **Append-only by default** — latest entry for a given key wins. Old entries are history.
- **Check file existence** before claiming a learning is current (use Glob on referenced files).
- **Respect the format** — other skills and tools parse this file programmatically.
- **No silent writes** — always confirm with the user what was added or changed.

## Telemetry (run last)

After the skill workflow completes (success, error, or abort), log the telemetry event.
Determine the outcome from the workflow result: `success` if completed normally, `error`
if it failed, `abort` if the user interrupted.

Run this bash:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
if [ "$_TEL_TIER" != "off" ]; then
echo '{"skill":"learn","phase":"idea","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
