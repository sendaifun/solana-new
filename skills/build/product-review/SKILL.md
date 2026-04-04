---
name: product-review
description: Product quality review — UX flows, onboarding, feature completeness, and user value. Use when a user says "product review", "review my product", "UX review", "is my product good", "product quality", "user experience review", "onboarding review", or "feature audit". Different from code review (review-and-iterate) and product roast (roast-my-product) — this is structured, balanced evaluation.
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
_TEL_EVENT='{"skill":"product-review","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' 
echo "$_TEL_EVENT" >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
[ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" -H "Content-Type: application/json" -d '{"path":"telemetry:track","args":{"skill":"product-review","phase":"build","status":"success","version":"0.2.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' >/dev/null 2>&1 &
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

Structured product quality evaluation. Walk through the product as a new user, evaluate every touchpoint, and produce an actionable improvement roadmap. Balanced — highlight strengths AND weaknesses.

This is NOT a code review (use `/review-and-iterate` for that) and NOT a harsh roast (use `/roast-my-product` for that). This is a structured, balanced evaluation that helps you understand where your product stands and what to improve next.

## Workflow

### Step 1: Gather Context

**Always start by asking** — use `AskUserQuestion`:

- What is the product? (URL, description, or demo)
- Who is the target user?
- What's the core use case — the ONE thing users should be able to do?
- What stage? (prototype, MVP, beta, launched)

Do NOT proceed without answers. You need to understand what you're reviewing and through whose eyes.

### Step 2: Read Existing Context

Read `.superstack/idea-context.md` and `.superstack/build-context.md` if available. These contain prior decisions about target market, tech stack, competitive landscape, and build progress.

### Step 3: Load the Evaluation Framework

Read `references/product-quality-rubric.md` for the 8 quality dimensions. This is your scoring framework.

### Step 4: Walk Through as a First-Time User

Put yourself in the shoes of the target user described in Step 1. Use `references/onboarding-checklist.md` to systematically evaluate the first-time experience:

- What do you see first?
- How quickly do you understand what this product does?
- How many steps to the first meaningful action?
- Where do you get confused?
- Where do you get delighted?

Document every friction point and every moment of clarity.

### Step 5: Evaluate Each Quality Dimension

Go through each dimension from `references/product-quality-rubric.md`:

1. Onboarding Flow
2. Core Experience
3. Error Handling
4. Information Architecture
5. Visual Design & Polish
6. Performance
7. Accessibility
8. Feature Completeness

For each dimension:
- Score 1-10 with specific evidence
- Note what's working well
- Note what needs improvement
- Suggest a specific fix for the biggest issue in this dimension

### Step 6: Reference Web3 Best Practices

Cross-reference the product against `references/crypto-ux-patterns.md` for web3-specific best practices. Note which patterns are implemented well and which are missing.

### Step 7: Synthesize Findings

Compile your evaluation into a structured report:

1. **Executive Summary** — 2-3 sentences on the product's overall quality
2. **Scorecard** — all 8 dimensions with scores
3. **Top 3 Strengths** — what's working well (be specific)
4. **Top 3 Improvements** — highest-impact changes to make
5. **Detailed Dimension Reviews** — full analysis of each dimension
6. **Improvement Roadmap** — prioritized list of fixes by impact and effort

### Step 8: Prioritized Improvement Roadmap

Categorize improvements into:

- **Quick wins** (< 1 day, meaningful impact)
- **Medium effort** (1-3 days, significant improvement)
- **Major investment** (1+ week, transformative change)

Order by impact within each category.

### Step 9: Save Context (Optional)

If the user wants to continue iterating, write the product review summary to `.superstack/build-context.md` so other skills can reference it.

## Non-Negotiables

- ALWAYS ask about the product before reviewing. Use `AskUserQuestion`. Never assume.
- Be balanced — acknowledge what's working well, not just what's broken.
- Walk through as a REAL first-time user — document every friction point.
- Score with evidence — "onboarding: 6/10 because step 3 requires wallet but doesn't explain why."
- Prioritize fixes by impact: what fixes will retain the most users?
- Distinguish between "nice to have" and "users are bouncing here."
- If no product exists yet, redirect to `/scaffold-project` or `/build-with-claude`.
- Don't confuse "I don't like the design" with "users can't complete the task." Focus on usability over aesthetics.

## Distinction from Other Review Skills

| Skill | Focus | Tone |
|-------|-------|------|
| `/review-and-iterate` | Code quality, security, production readiness | Technical, engineering-focused |
| `/roast-my-product` | Find every weakness, deliberately harsh | Brutal, provocative |
| `/product-review` | Balanced product quality evaluation | Structured, constructive |

If the user wants harsh feedback, suggest `/roast-my-product`. If they want code review, suggest `/review-and-iterate`. This skill is for structured, actionable product evaluation.

## Output Format

```
## Executive Summary
[2-3 sentences on overall product quality]

## Scorecard
| Dimension | Score | Summary |
|-----------|-------|---------|
| Onboarding Flow | X/10 | ... |
| Core Experience | X/10 | ... |
| Error Handling | X/10 | ... |
| Information Architecture | X/10 | ... |
| Visual Design & Polish | X/10 | ... |
| Performance | X/10 | ... |
| Accessibility | X/10 | ... |
| Feature Completeness | X/10 | ... |
| **Overall** | **X/10** | |

## Top 3 Strengths
1. **[Strength]**: [Specific evidence]
2. **[Strength]**: [Specific evidence]
3. **[Strength]**: [Specific evidence]

## Top 3 Improvements
1. **[Improvement]**: [What to change and expected impact]
2. **[Improvement]**: [What to change and expected impact]
3. **[Improvement]**: [What to change and expected impact]

## Detailed Reviews
### Onboarding Flow (X/10)
**Working well**: ...
**Needs improvement**: ...
**Suggested fix**: ...

[Repeat for each dimension]

## Improvement Roadmap

### Quick Wins (< 1 day)
- [ ] [Fix]: [Expected impact]

### Medium Effort (1-3 days)
- [ ] [Fix]: [Expected impact]

### Major Investment (1+ week)
- [ ] [Fix]: [Expected impact]
```

## Tone

Think of yourself as a thoughtful product manager doing a quarterly product review. You're not trying to tear things down — you're trying to make the product better. Be honest about problems, generous about strengths, and always constructive about solutions.

## Telemetry (run last)

After the skill workflow completes (success, error, or abort), log the telemetry event.
Determine the outcome from the workflow result: `success` if completed normally, `error`
if it failed, `abort` if the user interrupted.

Run this bash:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
if [ "$_TEL_TIER" != "off" ]; then
echo '{"skill":"product-review","phase":"build","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
