---
name: submit-to-hackathon
description: Prepare and optimize a hackathon submission for a Solana project. Use when a user says "submit to hackathon", "prepare my submission", "hackathon entry", "write project description", "demo video", or "help me win the hackathon". Reads all prior phase context if available.
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
_TEL_EVENT='{"skill":"submit-to-hackathon","phase":"launch","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' 
echo "$_TEL_EVENT" >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
_CONVEX_URL=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
[ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" -H "Content-Type: application/json" -d '{"path":"telemetry:track","args":{"skill":"submit-to-hackathon","phase":"launch","status":"success","version":"0.2.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' >/dev/null 2>&1 &
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

# Submit to Hackathon

## Overview

Prepare a complete, optimized hackathon submission. Write the project description, plan the demo video, and structure the entry to maximize judge appeal. Focused on Solana hackathons (Colosseum, Superteam, ecosystem-specific).

## Workflow

1. Check for `.superstack/idea-context.md` and `.superstack/build-context.md`. Use all available context.
2. If no context, interview: What did you build? What hackathon? Which track/prize?
3. Read [references/hackathon-submission-guide.md](references/hackathon-submission-guide.md) for formatting and requirements.
4. Read [references/judging-criteria.md](references/judging-criteria.md) to optimize for what judges look for.
5. Draft the project description, optimized for the specific hackathon.
6. Create a demo script using [references/demo-video-script.md](references/demo-video-script.md).
7. Write a submission HTML artifact with all content ready to copy-paste.

## Prior Context (Optional — never block on this)

If `.superstack/idea-context.md` or `.superstack/build-context.md` exist, use them to enrich the submission. If they don't exist, **proceed immediately** — interview the user about their project. Do NOT redirect to other commands.

## Non-Negotiables

- The submission must have a working demo link. No exceptions.
- Project description must be scannable — judges read 100+ submissions.
- Lead with what the project DOES, not how it works technically.
- Include clear setup instructions (judges will try to run it).
- Demo video script must be under 3 minutes.
- Do not exaggerate traction or features. Judges verify.
- Always write a local HTML artifact with the complete submission.
- Never fabricate deployment status, traction, or judges-track alignment when context is missing.

## Resources

### references/

- [references/hackathon-submission-guide.md](references/hackathon-submission-guide.md)
- [references/demo-video-script.md](references/demo-video-script.md)
- [references/judging-criteria.md](references/judging-criteria.md)

### Cross-skill data
- [skills/data/colosseum/hackathon-winners.md](../../data/colosseum/hackathon-winners.md) — Complete Colosseum winner dataset: 6 grand champions, 40+ track winners, winning patterns, track distribution. Study winners in your track to position your submission.

## Quick Start

```bash
# This skill creates a submission artifact (HTML) with all content ready to copy-paste.
# Ask:
#   "Prepare my Colosseum hackathon submission"
#   "Help me write a hackathon project description"
#   "Create a 3-minute demo script"

# Make sure before submitting:
# 1. Demo is live (devnet OK)
solana program show <PROGRAM_ID> --url devnet  # Verify deployed

# 2. Code is on GitHub (public repo)
git remote -v  # Should show GitHub URL

# 3. README has setup instructions
head -30 README.md  # Should have Quick Start section
```

## Decision Points

- **Which track?** Pick the least competitive track that fits. DeFi tracks are overcrowded. Infrastructure and tooling have fewer entries.
- **Demo on devnet or mainnet?** Devnet is fine for hackathons. Makes it easier for judges to test without spending real SOL.
- **Video vs live demo?** Record a video (safer — no live bugs). Keep under 3 minutes. Show the actual product, not slides.

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
echo '{"skill":"submit-to-hackathon","phase":"launch","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
