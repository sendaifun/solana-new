---
name: find-next-crypto-idea
description: Interview users sharply to discover, rank, or validate what they should build in crypto. Use when a user asks what to build in crypto, wants startup ideas in a crypto niche such as DeFi or AI x crypto, wants blunt feedback on an existing crypto idea, or wants a concrete artifact comparing the best next ideas. Treat the bundled idea datasets as inspiration, not constraints, and always combine them with fresh market research.
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
_TEL_EVENT='{"skill":"find-next-crypto-idea","phase":"idea","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' 
echo "$_TEL_EVENT" >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
_CONVEX_URL=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
[ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" -H "Content-Type: application/json" -d '{"path":"telemetry:track","args":{"skill":"find-next-crypto-idea","phase":"idea","status":"success","version":"0.2.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' >/dev/null 2>&1 &
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

# Find Next Crypto Idea

## Overview

Interview the user until there is real clarity, not just enthusiasm. Generate three serious idea candidates, force a winner, explain why crypto is necessary, and write a local HTML artifact that the user can review outside the chat.

## Workflow

1. Infer whether the user needs fresh ideas, a narrowed idea search in a known domain, or validation of an existing thesis.
2. **Ask the user to pick a report theme.** Read [references/report-themes.md](references/report-themes.md) and present the 12-theme table. Store their choice as the `theme` field in the JSON payload. If they say "surprise me", pick one that matches their vibe.
3. Read [references/source-map.md](references/source-map.md) first to understand the local datasets available to this skill.
4. Read [references/interview-framework.md](references/interview-framework.md) before asking substantive questions.
5. Gate every candidate through [references/crypto-necessity-test.md](references/crypto-necessity-test.md) before scoring it.
6. Score surviving candidates with [references/scoring-rubric.md](references/scoring-rubric.md).
7. Run fresh research with [references/research-playbook.md](references/research-playbook.md). When you already have candidate ideas, use `scripts/live_research.py` to generate browser-first X queries, GitHub queries, a normalized research pack, and a worksheet HTML.
8. Produce the shortlist artifact first. Let the user pick one. Then deepen the chosen idea and write a second artifact.

## Non-Negotiables

- Stay blunt. Challenge weak assumptions before elaborating them.
- Keep interviewing until you can clearly state:
  - the user's unfair edge
  - the real shipping constraint
  - the first plausible wedge
  - why crypto is required
- Reject ornamental crypto. Redirect to a stronger crypto angle instead of dressing up a weak one.
- Do not praise a bad idea because the user is attached to it.
- Do not produce three near-identical ideas. Force diversity across the shortlist when possible.
- Always do fresh research for competitors, substitutes, and active OSS before committing to the final ranking.
- Always write a local HTML file. Do not leave the result only in chat.

## Interview Rules

- Start with anchor questions, not a giant questionnaire.
- Pull constraints only when they would change the recommendation.
- Prefer questions that reveal:
  - edge
  - urgency
  - customer access
  - shipping ability
  - tolerance for infra, regulation, and sales friction
- If the user already has an idea, stress-test it immediately. Ask what breaks if the blockchain is removed.
- If, after several exchanges, there is still no edge, no constraint, and no credible crypto touchpoint, say so plainly and narrow the search.

## Shortlist Rules

- Produce exactly three serious candidates unless the user explicitly asks for more.
- Include:
  - a recommended winner
  - why the winner wins
  - why the other two lost
  - a bear case for each idea
- Treat the local datasets as archetype libraries. Combine, mutate, or discard them freely if the user's context demands it.

## Artifact Rules

- Read [references/output-spec.md](references/output-spec.md) before writing the report payload.
- If you need a structured research pass before ranking, read [references/research-output-schema.md](references/research-output-schema.md) and run `scripts/live_research.py`.
- Use `scripts/render_report.py` to render the HTML from a JSON payload.
- Write reports into the current working directory unless the user asks for a different path.
- Use file names like:
  - `idea-shortlist-YYYYMMDD-HHMMSS.html`
  - `idea-deep-dive-YYYYMMDD-HHMMSS.html`

## Phase Handoff

This skill is **Phase 1 (Idea)** in the Idea → Build → Launch journey. After the user picks a winner from the shortlist:

1. Write `.superstack/idea-context.md` in the project workspace with:
   - `phase`: `"idea"`
   - `completed_at`: ISO timestamp
   - `chosen_idea`: slug, name, one_liner, why_crypto, scores, competitors, mvp_checklist, gtm
   - `source_reports`: list of generated HTML filenames
2. Tell the user they can proceed to the **Build** phase next:
   - `scaffold-project` — set up workspace with the right stack
   - `build-with-claude` — guided MVP implementation
3. See `../../../data/specs/phase-handoff.md` for the full JSON contract.

## Quick Start

```bash
# Just ask naturally — this skill activates automatically
# Example prompts:
#   "What should I build in crypto?"
#   "I'm interested in DeFi x AI — what are the gaps?"
#   "Give me 3 Solana project ideas for a hackathon"
```

## Decision Points

- **Fresh ideas vs. validate existing?** If user has an idea already, redirect to `validate-idea` skill instead.
- **Which niche?** See `../../data/ideas/` for 114+ curated ideas from YC, a16z, Alliance, Superteam.
- **DeFi-specific?** Redirect to `defillama-research` skill for data-driven DeFi discovery.
- **Hackathon data?** If the user explicitly asks for Colosseum hackathon project data, winner patterns, or gap analysis, suggest `/colosseum-copilot`. It requires a free PAT from https://arena.colosseum.org/copilot — only mention if the user asks or opts in.

## Resources

### references/

- [references/source-map.md](references/source-map.md)
- [references/interview-framework.md](references/interview-framework.md)
- [references/crypto-necessity-test.md](references/crypto-necessity-test.md)
- [references/scoring-rubric.md](references/scoring-rubric.md)
- [references/research-playbook.md](references/research-playbook.md)
- [references/research-output-schema.md](references/research-output-schema.md)
- [references/output-spec.md](references/output-spec.md)
- [references/report-themes.md](references/report-themes.md)

### scripts/

- `scripts/render_report.py` renders the final HTML artifact from structured JSON.
- `scripts/live_research.py` generates browser-first research plans, query URLs, a normalized `research-pack.json`, and an optional worksheet HTML.

### assets/

- `assets/report-template.html` is the HTML template used by the render script.
- `assets/research-worksheet-template.html` is the HTML template for the clickable research worksheet.

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
echo '{"skill":"find-next-crypto-idea","phase":"idea","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
