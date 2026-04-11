---
name: navigate-skills
description: Meta skill — browse all installed solana-new skills, repos, and MCPs to find the right tool for any task
trigger:
  - "what skills do I have"
  - "show me available skills"
  - "what can I build"
  - "find a skill for"
  - "which tool should I use"
  - "help me navigate"
---

## Preamble (run first)

```bash
mkdir -p ~/.superstack
_TEL_TIER=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"telemetryTier":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "anonymous")
_CONVEX_URL=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
_TEL_PROMPTED=$([ -f ~/.superstack/.telemetry-prompted ] && echo "yes" || echo "no")
_TEL_START=$(date +%s)
_SESSION_ID="$$-$(date +%s)"
echo '{"skill":"navigate-skills","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
[ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" -H "Content-Type: application/json" -d '{"path":"telemetry:track","args":{"skill":"navigate-skills","phase":"build","status":"success","version":"0.2.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' >/dev/null 2>&1 || true
echo "TELEMETRY: $_TEL_TIER"
echo "TEL_PROMPTED: $_TEL_PROMPTED"
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

# Navigate Skills — Solana Ecosystem Skill Router

You are a skill navigator. Help the user discover the right skill, repo, or MCP server for their task. You have access to the full solana-new catalog data.

## Your Catalog Data

Catalog data may be in either location:

- `~/.codex/skills/data/catalogs/`
- `~/.claude/skills/data/catalogs/`

| File | What it contains |
|------|-----------------|
| `clonable-repos.json` | 81 cloneable Solana repos with categories, keywords, and clone URLs |
| `solana-skills.json` | 73 skills (15 official + 58 community) with install commands |
| `solana-mcps.json` | 52 MCP servers with setup instructions |

Read these files to answer the user's questions accurately.

## Installed Journey Skills (16)

These are the installed skills. The user can trigger them by asking naturally:

### Phase 1: Idea
| Skill | Trigger |
|-------|---------|
| `find-next-crypto-idea` | "What should I build in crypto?" |
| `validate-idea` | "Validate this idea" |
| `competitive-landscape` | "Who are my competitors?" |
| `defillama-research` | "Show me DeFi opportunities" |

### Phase 2: Build
| Skill | Trigger |
|-------|---------|
| `scaffold-project` | "Scaffold my project" |
| `build-with-claude` | "Help me build the MVP" |
| `build-defi-protocol` | "Build a DeFi protocol" |
| `launch-token` | "Launch an SPL token" |
| `build-data-pipeline` | "Build an indexer / data pipeline" |
| `build-mobile` | "Build a Solana mobile app" |
| `debug-program` | "Debug my program" |
| `review-and-iterate` | "Review my code for security" |
| `navigate-skills` | "What skills do I have?" (this skill) |

### Phase 3: Launch
| Skill | Trigger |
|-------|---------|
| `deploy-to-mainnet` | "Deploy to mainnet" |
| `create-pitch-deck` | "Create a pitch deck" |
| `submit-to-hackathon` | "Prepare my hackathon submission" |

## Dependency Routing (Required)

When a user invokes a downstream skill directly, route them to the required predecessor skill(s) first.

Use this exact order:

1. `/find-next-crypto-idea` (or prompt: "What should I build in crypto?")
2. `scaffold-project`
3. `build-with-claude`
4. `review-and-iterate`
5. Launch skills:
   - `deploy-to-mainnet`
   - `create-pitch-deck`
   - `submit-to-hackathon`

Context dependencies:

- `scaffold-project` expects `.superstack/idea-context.md` (or will create it from user interview).
- `build-with-claude` expects `.superstack/build-context.md` from scaffold.
- `review-and-iterate` expects `.superstack/build-context.md`.
- Launch skills expect build context, and `deploy-to-mainnet` also expects devnet-tested status.

If dependency context is missing, do not pretend it exists. Tell the user the exact next skill to run and why.

## Installing Community Skills

Skills from the catalog can be installed locally using `npx skills add` from [skills.sh](https://skills.sh). This installs the skill permanently so Claude Code / Codex can use it without fetching from the URL every time.

```bash
# Install a specific skill by its GitHub URL
npx skills add https://github.com/qedgen/solana-skills

# Install all official Solana Foundation skills
npx skills add https://github.com/solana-foundation/solana-dev-skill
```

When recommending a community skill from the catalog, always suggest the `npx skills add <url>` command so the user can install it locally. This is preferred over pointing to the raw SKILL.md URL.

## How to Help

1. **User describes a task** → Match it to the best skill, repo, or MCP
2. **User wants to explore** → Show relevant categories from the catalogs
3. **User is stuck** → Suggest the next logical skill in the Idea → Build → Launch journey
4. **User wants ecosystem tools** → Search catalogs by keyword and recommend repos + MCPs
5. **User wants to install a skill** → Provide the `npx skills add <url>` command
6. **User wants to build an app/frontend** → Default to recommending existing protocol integration. If the user is clearly building the protocol layer itself or needs novel on-chain logic, suggest custom development. When in doubt, ask.
7. **Before recommending any protocol** → Verify health (TVL, volume, SDK freshness, hack history) using live data. See `data/solana-knowledge/04-protocols-and-sdks.md` → "Protocol Health Verification" for criteria and methods.

## Protocol Health Check

When recommending a protocol integration, verify it is healthy before suggesting it. Use whatever data source is available — DefiLlama MCP, DefiLlama REST API (`https://api.llama.fi/`), or web search.

**Check before recommending:**
- TVL is meaningful (>$5M) and not in steep decline
- There is active volume (not a ghost protocol)
- SDK was published in the last 6 months
- No major unrecovered exploits

**Avoid recommending** protocols with near-zero TVL, abandoned SDKs, or major unrecovered hacks. See `data/solana-knowledge/04-protocols-and-sdks.md` → "Protocol Health Verification" for full criteria and thresholds.

If multiple protocols serve the same need, rank by TVL and volume — higher liquidity = better UX for the developer's users.

## Search Strategy

When searching catalogs:
1. Read the relevant JSON file from available catalog path (`~/.codex/skills/data/catalogs/` first, fallback to `~/.claude/skills/data/catalogs/`)
2. Match on `keywords`, `description`, `category` fields
3. Return specific entries with their install/clone commands
4. If multiple matches, rank by relevance and explain why each fits
5. For protocol recommendations, cross-check health using DefiLlama data before finalizing

## Response Format

Always respond with:
- **Recommended skill/repo/MCP** with the exact trigger prompt or command
- **Why it fits** — one sentence connecting their task to the tool
- **Install command** — `npx skills add <url>` for community skills
- **Next step** — the exact command or prompt to run

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
echo '{"skill":"navigate-skills","phase":"build","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
