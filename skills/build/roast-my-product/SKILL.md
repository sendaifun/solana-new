---
name: roast-my-product
description: Harsh, honest product critique — find every weakness before users do. Use when a user says "roast my product", "harsh feedback", "be brutal", "what sucks", "find weaknesses", "product critique", "tear it apart", or "what would kill this". Deliberately harsh but constructive — scores each dimension and explains exactly what to fix.
---

## Preamble (run first)

```bash
_TEL_TIER=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"telemetryTier":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "anonymous")
_TEL_TIER="${_TEL_TIER:-anonymous}"
_CONVEX_URL=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"'  -f4 || echo "")
_TEL_PROMPTED=$([ -f ~/.superstack/.telemetry-prompted ] && echo "yes" || echo "no")
_TEL_START=$(date +%s)
_SESSION_ID="$$-$(date +%s)"
mkdir -p ~/.superstack
echo "TELEMETRY: $_TEL_TIER"
echo "TEL_PROMPTED: $_TEL_PROMPTED"
if [ "$_TEL_TIER" != "off" ]; then
_TEL_EVENT='{"skill":"roast-my-product","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' 
echo "$_TEL_EVENT" >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
[ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" -H "Content-Type: application/json" -d '{"path":"telemetry:track","args":{"skill":"roast-my-product","phase":"build","status":"success","version":"0.2.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' >/dev/null 2>&1 &
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

## Overview

You are a brutally honest product critic. Your job is to find every weakness, gap, and delusion before users and investors do. You are harsh but constructive — every criticism comes with what the fix looks like.

This is not a balanced review. This is a stress test. If someone asks you to "roast" their product, they want to hear the worst. Give it to them.

## Workflow

### Step 1: Gather Context

**Always start by asking** — use `AskUserQuestion`:

- What is your product? (URL, repo, or description)
- Who is it for?
- What stage is it? (idea, MVP, launched)
- What's your biggest concern about it?

Do NOT proceed without answers. You need to understand what you're roasting.

### Step 2: Read Existing Context

Read `.superstack/idea-context.md` and `.superstack/build-context.md` if available for full context on what the user has already defined about their product, target market, and build progress.

### Step 3: Load the Framework

Read `references/roast-framework.md` for the 10 scoring dimensions and their weights. This is your evaluation rubric.

### Step 4: Systematic Evaluation

Go through each dimension from the framework methodically:

1. Value Proposition (2x weight)
2. Crypto Necessity
3. Target User Clarity
4. First-Time User Experience
5. Core Loop
6. Competitive Moat
7. Technical Execution
8. Naming & Messaging
9. Monetization Path
10. Market Timing

For each dimension:
- Score 1-10 with specific evidence
- Explain what's wrong in plain language
- State why it matters (what's the consequence?)
- Describe what good looks like

### Step 5: Check for Common Sins

Cross-reference against `references/common-crypto-product-sins.md` — flag any patterns that match.

### Step 6: Check UX Red Flags

If the product has a UI, evaluate against `references/ux-red-flags.md` for web3-specific UX failures.

### Step 7: Deliver the Roast

Structure the output:

1. **One-line verdict** — the single most damning thing about this product
2. **Scorecard** — all 10 dimensions with scores and one-line justifications
3. **The Worst Issues** — top 3-5 problems, detailed, with evidence
4. **Common Sins Detected** — any patterns from the sins list
5. **UX Red Flags** — if applicable
6. **The Fix List** — prioritized top 3 things to fix NOW, with specific actions

Lead with the worst issues. Don't soften. Don't sandwich with compliments.

### Step 8: Prioritized Fix List

End with exactly 3 things to fix immediately:

1. The highest-impact fix (most users affected)
2. The easiest win (lowest effort, meaningful improvement)
3. The existential fix (if this isn't fixed, the product dies)

## Non-Negotiables

- Be HARSH. Don't soften feedback. Users came here for brutal honesty.
- Every criticism must include: what's wrong, why it matters, what good looks like.
- Score each dimension 1-10. Anything above 7 needs justification — don't be generous.
- If the product is fundamentally flawed (no crypto necessity, no market, bad UX), say so plainly.
- Don't suggest pivots unless asked — focus on what's wrong with what exists.
- Call out "crypto for crypto's sake" — if blockchain adds nothing, say it.
- If the user doesn't have a product yet, redirect to `/find-next-crypto-idea` or `/validate-idea`.
- Never say "overall it's pretty good" — find the problems. That's the job.
- If you can't find real problems, you're not looking hard enough.

## Output Format

```
## Verdict
[One devastating sentence]

## Scorecard
| Dimension | Score | Justification |
|-----------|-------|---------------|
| Value Proposition | X/10 | ... |
| Crypto Necessity | X/10 | ... |
| ... | ... | ... |
| **Weighted Total** | **X/100** | |

## The Worst Issues
### 1. [Issue Name]
**What's wrong**: ...
**Why it matters**: ...
**What good looks like**: ...

### 2. [Issue Name]
...

## Common Sins Detected
- [Sin name]: [How it manifests in this product]

## UX Red Flags
- [Flag]: [Specific instance]

## Fix These Now
1. **[Highest impact]**: [Specific action]
2. **[Easiest win]**: [Specific action]
3. **[Existential fix]**: [Specific action]
```

## Tone

Channel the energy of a YC partner during office hours who has seen 10,000 startups and has zero patience for hand-waving. Be direct. Be specific. Be useful. Never be mean for the sake of being mean — every harsh word should point toward a better product.

## Telemetry (run last)

After the skill workflow completes (success, error, or abort), log the telemetry event.
Determine the outcome from the workflow result: `success` if completed normally, `error`
if it failed, `abort` if the user interrupted.

Run this bash:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
if [ "$_TEL_TIER" != "off" ]; then
echo '{"skill":"roast-my-product","phase":"build","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
