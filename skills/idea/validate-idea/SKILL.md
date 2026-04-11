---
name: validate-idea
description: Run a structured validation sprint on a crypto startup idea. Use when a user says "validate this idea", "is this worth building", "run a validation sprint", "help me test demand", or "should I build this". Reads idea-context.md from a prior idea phase if available.
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
_TEL_EVENT='{"skill":"validate-idea","phase":"idea","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' 
echo "$_TEL_EVENT" >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
_CONVEX_URL=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
[ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" -H "Content-Type: application/json" -d '{"path":"telemetry:track","args":{"skill":"validate-idea","phase":"idea","status":"success","version":"0.2.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' >/dev/null 2>&1 &
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

# Validate Idea

## Overview

Take an idea (from a prior find-next-crypto-idea session or fresh from the user) and stress-test it with a structured validation sprint. Produce a go/no-go recommendation backed by demand signals, risk analysis, and a concrete next-steps plan.

## Workflow

1. Check for `.superstack/idea-context.md` in the workspace. If found, load the chosen idea. If not, ask the user to describe their idea.
2. Read [references/validation-framework.md](references/validation-framework.md) for the sprint structure.
3. Evaluate demand signals using [references/customer-signal-rubric.md](references/customer-signal-rubric.md).
4. Run the crypto necessity gut-check: "What breaks if you remove the blockchain?"
5. Map risks: technical, market, regulatory, team.
6. Apply [references/pivot-or-persist.md](references/pivot-or-persist.md) to reach a go/no-go decision.
7. Write a local HTML artifact with the validation report.

## Non-Negotiables

- Do not rubber-stamp. If the idea is weak, say so with specifics.
- Every "go" recommendation must cite at least 2 concrete demand signals (not vibes).
- Every "no-go" must include a pivot suggestion, not just rejection.
- If the user has no evidence of demand, the answer is "go validate" with a specific sprint plan, not "go build".
- Always check if there is already a live product doing the same thing on Solana.
- Always write a local HTML artifact. Do not leave results only in chat.
- **Integration-first assessment**: As part of validation, identify whether the idea can be built by integrating existing Solana protocols rather than writing a custom program. If integration is viable, note it as an advantage (faster to ship, lower audit costs). If the idea requires novel on-chain logic or the user is building the protocol layer itself, custom development is the right call — don't penalize it. Include the integration-vs-build assessment in next_steps. See `data/solana-knowledge/04-protocols-and-sdks.md` → "Integrate First, Build Second".

## Phase Handoff

This skill is **Phase 1 (Idea)** in the Idea → Build → Launch journey. After completing validation:

1. Write/update `.superstack/idea-context.md` (create if missing) with a `validation` field containing:
   - `demand_signals`: array of evidence items
   - `risks`: array of { category, description, severity }
   - `go_no_go`: "go" | "no-go" | "pivot"
   - `confidence`: 0.0 - 1.0
   - `next_steps`: array of concrete actions
2. Tell the user they can proceed to the **Build** phase if the verdict is "go".
3. See `../../../data/specs/phase-handoff.md` for the full JSON contract.

## Quick Start

```bash
# Just describe your idea and ask for validation:
#   "Validate this idea: a Solana protocol for agent-to-agent payments"
#   "Is this worth building? [describe idea]"
#   "Run a validation sprint on my idea"
```

## Decision Points

- **No idea yet?** Redirect to `find-next-crypto-idea` first.
- **Which RPC for testing demand?** Use Helius free tier for any on-chain research.
- **Go vs. no-go threshold:** Score ≥ 8/15 across founder-fit + MVP-speed + distribution + market-pull + revenue = Go. Below 6 = strong No-go.
- **Hackathon precedents?** If the user wants to check whether similar ideas have been tried in Solana hackathons (and what won/lost), suggest `/colosseum-copilot`. Requires a free PAT — only mention if the user asks or opts in.

## Resources

### references/

- [references/validation-framework.md](references/validation-framework.md)
- [references/customer-signal-rubric.md](references/customer-signal-rubric.md)
- [references/pivot-or-persist.md](references/pivot-or-persist.md)

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
echo '{"skill":"validate-idea","phase":"idea","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
