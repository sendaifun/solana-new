---
name: scaffold-project
description: Set up a complete Solana project workspace from a validated idea. Use when a user says "scaffold my project", "set up my workspace", "what stack should I use", "create the project structure", or "initialize my project". Reads idea-context.md from a prior idea phase if available. Leverages solana-new's catalogs of 88 repos, 77 skills, and 52 MCPs.
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
_TEL_EVENT='{"skill":"scaffold-project","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' 
echo "$_TEL_EVENT" >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
_CONVEX_URL=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
[ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" -H "Content-Type: application/json" -d '{"path":"telemetry:track","args":{"skill":"scaffold-project","phase":"build","status":"success","version":"0.2.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' >/dev/null 2>&1 &
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

# Scaffold Project

## Overview

Take a validated idea and turn it into a ready-to-code workspace with the right starter repo, skills, MCPs, and configuration installed. This is the bridge between planning and building.

## Workflow

1. Check for `.superstack/idea-context.md`. If found, extract the chosen idea's requirements. If not, interview the user briefly: what are you building, for whom, and what Solana primitives do you need?
2. **Integrate vs Build decision**: Unless the user explicitly asked for a smart contract or program, check whether the idea can be built by integrating existing protocols (e.g., Jupiter for swaps, Kamino for lending, Orca for liquidity). If so, scaffold a frontend-only project (Next.js + Protocol SDKs, no Anchor). See `data/solana-knowledge/04-protocols-and-sdks.md` → "Integrate First, Build Second" and the Decision Quick Reference.
3. **Protocol selection**: If integrating, identify which protocols to use. Verify each protocol's health (TVL, volume, SDK freshness, hack history) using DefiLlama before committing. See `04-protocols-and-sdks.md` → "Protocol Health Verification".
4. Read [references/stack-decision-tree.md](references/stack-decision-tree.md) to match the idea to a technology stack.
5. Read [references/catalog-recommendations.md](references/catalog-recommendations.md) to pick specific repos, skills, and MCPs from the solana-new catalogs.
6. Read [references/architecture-patterns.md](references/architecture-patterns.md) for the recommended project structure.
7. Present the scaffold plan to the user for confirmation.
8. Execute the setup:
   - Clone the recommended starter repo(s)
   - Install skills via `npx skills add <url>`
   - Configure MCPs in `.claude/settings.json`
   - Generate `CLAUDE.md` with project context
7. Write `.superstack/build-context.md` with stack decisions.

## Prior Context (Optional — never block on this)

If `.superstack/idea-context.md` exists, use it to inform stack decisions. If it doesn't exist, **proceed immediately** — just ask the user what they're building. Do NOT redirect them to run another command first. Do NOT warn about missing context files. Just ask and build.

## Non-Negotiables

- **Never block on missing context files.** Always proceed by asking the user directly.
- Always recommend a specific starter repo from the superstack catalog. Do not suggest building from scratch unless no relevant repo exists.
- Always include at least one skill and one MCP relevant to the idea.
- Present the full plan before executing. The user must confirm.
- Do not install tools the user cannot run (check Node.js version, OS compatibility).

## Phase Handoff

This skill is **Phase 2 (Build)** in the Idea → Build → Launch journey.

**Reads**: `.superstack/idea-context.md` (from Phase 1)
**Writes**: `.superstack/build-context.md` with:
- `stack`: skills installed, MCPs configured, repos cloned
- `architecture`: chosen pattern name and key decisions
- `build_status`: { mvp_complete: false, tests_passing: false, devnet_deployed: false }

When done, tell the user to proceed to **build-with-claude** for guided MVP implementation.

When writing `build-context.md`, **deep-merge** with existing content — don't overwrite fields from prior phases.

See `../../data/specs/phase-handoff.md` for the full JSON contract.

## Quick Start

```bash
# Fastest path for most Solana projects:
npx create-solana-dapp my-project
cd my-project
npm install

# For Anchor-only (no frontend):
anchor init my-program
cd my-program

# Configure RPC
echo 'HELIUS_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY' >> .env

# Fund dev wallet
solana airdrop 5
```

## Decision Points

- **Which starter repo?** See `references/catalog-recommendations.md` — maps idea types to specific repos.
- **Which wallet SDK?** Privy for best UX, Unified Wallet Adapter for flexibility, Phantom for simplest integration.
- **Which RPC?** Helius free tier for development.
- **Which test framework?** Surfpool for mainnet-state testing, LiteSVM for fast unit tests.

## Resources

### references/

- [references/stack-decision-tree.md](references/stack-decision-tree.md)
- [references/architecture-patterns.md](references/architecture-patterns.md)
- [references/catalog-recommendations.md](references/catalog-recommendations.md)

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
echo '{"skill":"scaffold-project","phase":"build","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
