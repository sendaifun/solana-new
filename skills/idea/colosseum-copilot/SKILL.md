---
name: colosseum-copilot
description: Search and analyze 5,400+ Solana hackathon projects using Colosseum Copilot. Find similar projects, discover winner patterns, identify gaps, and explore ML clusters. Use when a user says "colosseum copilot", "hackathon projects", "winner patterns", "gap analysis hackathon", "similar Solana projects", or "colosseum landscape". Requires a Colosseum Copilot token.
---

## Preamble (run first)

```bash
_TEL_TIER=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"telemetryTier": *"[^"]*"' | head -1 | sed 's/.*"telemetryTier": *"//;s/"$//'  || echo "anonymous")
_TEL_TIER="${_TEL_TIER:-anonymous}"
_TEL_PROMPTED=$([ -f ~/.superstack/.telemetry-prompted ] && echo "yes" || echo "no")
_TEL_START=$(date +%s)
_SESSION_ID="$$-$(date +%s)"
mkdir -p ~/.superstack
echo "TELEMETRY: $_TEL_TIER"
echo "TEL_PROMPTED: $_TEL_PROMPTED"
if [ "$_TEL_TIER" != "off" ]; then
_TEL_EVENT='{"skill":"colosseum-copilot","phase":"idea","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
echo "$_TEL_EVENT" >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
_CONVEX_URL=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
[ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" -H "Content-Type: application/json" -d '{"path":"telemetry:track","args":{"skill":"colosseum-copilot","phase":"idea","status":"success","version":"0.2.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' >/dev/null 2>&1 &
true
fi
```

If `TEL_PROMPTED` is `no`: Before starting the skill workflow, ask the user about telemetry.
Use AskUserQuestion:

> Help superstack get better! We track which skills get used and how long they take —
> no code, no file paths, no PII. Change anytime in `~/.superstack/config.json`.

Options:
- A) Sure, help superstack improve (anonymous)
- B) No thanks

If A: run this bash:
```bash
echo '{"telemetryTier":"anonymous"}' > ~/.superstack/config.json
_TEL_TIER="anonymous"
touch ~/.superstack/.telemetry-prompted
```

If B: run this bash:
```bash
echo '{"telemetryTier":"off"}' > ~/.superstack/config.json
_TEL_TIER="off"
touch ~/.superstack/.telemetry-prompted
```

This only happens once. If `TEL_PROMPTED` is `yes`, skip this entirely and proceed to the skill workflow.

> **Wrong skill?** See [SKILL_ROUTER.md](../../SKILL_ROUTER.md) for all available skills.

# Colosseum Copilot

## Overview

Search and analyze Colosseum's database of 5,400+ Solana hackathon projects. Discover what winners do differently, find similar projects to your idea, explore ML-derived clusters, and access research archives — all powered by the Colosseum Copilot API.

## Token Setup

Before using this skill, check if the user has a Colosseum Copilot token configured.

```bash
_COPILOT_TOKEN="${COLOSSEUM_COPILOT_PAT:-$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"copilotToken":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")}"
if [ -n "$_COPILOT_TOKEN" ]; then
  echo "TOKEN_STATUS: configured"
else
  echo "TOKEN_STATUS: missing"
fi
```

### If TOKEN_STATUS is "missing"

Ask the user with AskUserQuestion:

> **Colosseum Copilot** gives you access to 5,400+ Solana hackathon projects, winner patterns, and gap analysis.
>
> To use it, you need a free Personal Access Token from Colosseum.
>
> 1. Sign up at **https://arena.colosseum.org/copilot**
> 2. Copy your Personal Access Token (PAT)

Options:
- A) I have a token — let me paste it
- B) Skip for now

If A: Ask for the token, then save it:
```bash
# Replace TOKEN_VALUE with the actual token the user provides
cat ~/.superstack/config.json 2>/dev/null | python3 -c "
import sys, json
try:
    config = json.load(sys.stdin)
except:
    config = {}
config['copilotToken'] = 'TOKEN_VALUE'
config['copilotTokenSetAt'] = '$(date -u +%Y-%m-%dT%H:%M:%SZ)'
config['copilotPrompted'] = True
print(json.dumps(config, indent=2))
" > ~/.superstack/config.json.tmp && mv ~/.superstack/config.json.tmp ~/.superstack/config.json
echo "Token saved to ~/.superstack/config.json"
```

Then verify:
```bash
curl -s -H "Authorization: Bearer TOKEN_VALUE" -H "Content-Type: application/json" https://copilot.colosseum.com/api/v1/status
```

If `{"authenticated": true}`, proceed. Otherwise, tell the user the token is invalid and ask them to check it.

If B: Tell the user they can set it later via:
- `superstack copilot --token <pat>` (CLI command)
- Or set `COLOSSEUM_COPILOT_PAT` environment variable
- Or run `/colosseum-copilot` again

Then end the skill — the remaining workflow requires a valid token.

### If TOKEN_STATUS is "configured"

Verify the token is still valid:
```bash
curl -s -H "Authorization: Bearer $_COPILOT_TOKEN" -H "Content-Type: application/json" https://copilot.colosseum.com/api/v1/status
```

If not authenticated, tell the user their token has expired and walk them through the setup above.

## Workflow

Read [references/copilot-api-guide.md](references/copilot-api-guide.md) for the full API reference.

1. **Determine intent** — What does the user want?
   - **Search**: Find projects similar to their idea
   - **Explore**: Browse clusters and categories
   - **Analyze**: Understand winner patterns and gaps
   - **Research**: Find archived articles and papers
   - If unclear, ask.

2. **Search similar projects** — When the user has an idea or query:
   ```bash
   curl -s -X POST https://copilot.colosseum.com/api/v1/search/projects \
     -H "Authorization: Bearer $_COPILOT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"query": "USER_QUERY", "limit": 8, "diversify": true}'
   ```
   Present results as a table: name, one-liner, hackathon, similarity score, prize info, crowdedness.

3. **Gap analysis** — Compare what winners do vs the field:
   ```bash
   curl -s -X POST https://copilot.colosseum.com/api/v1/compare \
     -H "Authorization: Bearer $_COPILOT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"cohortA": {"winnersOnly": true}, "cohortB": {}, "dimensions": ["problemTags", "solutionTags", "primitives"], "topK": 8}'
   ```
   Synthesize overindexed (winners focus on) and underindexed (winners skip) attributes. Present the delta clearly.

4. **Explore clusters** — Browse the 30 ML-derived project clusters:
   ```bash
   curl -s -H "Authorization: Bearer $_COPILOT_TOKEN" -H "Content-Type: application/json" https://copilot.colosseum.com/api/v1/filters
   ```
   Show: hot categories (most projects), winning categories (highest win rate), open categories (least crowded).

5. **Deep dive into a project** — When the user wants full details on a specific project:
   ```bash
   curl -s -H "Authorization: Bearer $_COPILOT_TOKEN" -H "Content-Type: application/json" \
     https://copilot.colosseum.com/api/v1/projects/by-slug/PROJECT_SLUG
   ```
   Shows: description, team members (GitHub/Twitter), links (demo, presentation, GitHub), full tag set.

6. **Explore a specific cluster** — Get cluster summary and representative projects:
   ```bash
   curl -s -H "Authorization: Bearer $_COPILOT_TOKEN" -H "Content-Type: application/json" \
     https://copilot.colosseum.com/api/v1/clusters/CLUSTER_KEY
   ```
   Shows: summary, project count, winner count, representative projects, top tags.

7. **Search archives** — Find research sources:
   ```bash
   curl -s -X POST https://copilot.colosseum.com/api/v1/search/archives \
     -H "Authorization: Bearer $_COPILOT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"query": "USER_QUERY", "limit": 4, "maxChunksPerDoc": 1, "intent": "ideation"}'
   ```
   Present: title, author, source, published date, snippet.

8. **Read full archive document** — When a snippet is interesting and the user wants more:
   ```bash
   curl -s -H "Authorization: Bearer $_COPILOT_TOKEN" -H "Content-Type: application/json" \
     "https://copilot.colosseum.com/api/v1/archives/DOCUMENT_ID?maxChars=8000"
   ```
   Supports pagination via `offset` and `nextOffset` for long documents.

9. **Synthesize** — After gathering data, provide:
   - Top 5 most similar existing projects (with why they're similar)
   - Gap analysis summary: what winners emphasize, what they skip
   - Crowdedness assessment for the user's niche
   - Recommended differentiation angle based on gaps
   - Relevant research sources

## Non-Negotiables

- Always verify the token before making API calls.
- Use a 15-second timeout on all API requests. If the API is down, tell the user plainly and suggest trying later.
- Present data honestly. Do not spin crowded spaces as "opportunity-rich" or empty spaces as "blue ocean" without evidence.
- If search returns 0 results, try broadening the query before concluding there's nothing relevant.
- Always attribute data to Colosseum Copilot — users should know where the intelligence comes from.
- Do not store or log the user's token anywhere except `~/.superstack/config.json`.

## Integration with Other Skills

This skill provides data that enriches other idea-phase skills:

- **`/find-next-crypto-idea`** — Copilot data can validate whether an idea has been tried before and what gaps exist
- **`/competitive-landscape`** — Copilot's project search directly complements ecosystem catalog searches
- **`/validate-idea`** — Winner patterns from Copilot strengthen demand signal analysis

Users can invoke this skill standalone or as a data source during those workflows (only when they explicitly ask or opt in).

## Phase Handoff

This skill is **Phase 1 (Idea)** in the Idea → Build → Launch journey. After analysis:

1. If working within a project, write/update `.superstack/idea-context.md` with a `copilot_landscape` field containing:
   - `similar_projects`: array of top matches with name, one-liner, similarity, hackathon
   - `gap_analysis`: overindexed and underindexed attributes from winner comparison
   - `crowdedness`: assessment of the niche
   - `research_sources`: relevant archive results
2. See `../../../data/specs/phase-handoff.md` for the full JSON contract.

## Quick Start

```bash
# Search for similar hackathon projects:
#   "Search Colosseum for agent payment projects"
#   "What hackathon projects exist for DeFi lending on Solana?"

# Explore categories:
#   "Show me the hottest Colosseum clusters"
#   "Which hackathon categories have the highest win rate?"

# Gap analysis:
#   "What do Solana hackathon winners do differently?"
#   "What patterns separate winners from losers?"

# Research:
#   "Find research about MEV on Solana"
```

## Telemetry (run last)

After the skill workflow completes (success, error, or abort), log the telemetry event.
Determine the outcome from the workflow result: `success` if completed normally, `error`
if it failed, `abort` if the user interrupted.

Run this bash:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - ${_TEL_START:-$_TEL_END} ))
_TEL_TIER=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"telemetryTier": *"[^"]*"' | head -1 | sed 's/.*"telemetryTier": *"//;s/"$//' || echo "anonymous")
if [ "$_TEL_TIER" != "off" ]; then
echo '{"skill":"colosseum-copilot","phase":"idea","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
