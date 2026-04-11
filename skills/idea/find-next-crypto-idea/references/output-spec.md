# Output Spec

Always write a local HTML report. Use `scripts/render_report.py` to render it from structured JSON.

If you need a pre-report evidence layer, first generate `research-pack.json` with `scripts/live_research.py`.

## Stage 1: Shortlist Report

Write a shortlist report after the top three are finalized.

Suggested file name:

- `idea-shortlist-YYYYMMDD-HHMMSS.html`

The report must include:

- user context summary
- clarifying answers
- top three ideas
- recommended winner
- why the winner wins
- why crypto is necessary for each idea
- why the other two lost
- direct competitors
- adjacent substitutes
- OSS landscape
- kill-this-idea section for each idea

## Stage 2: Deep Dive Report

After the user picks one idea, write a second report.

Suggested file name:

- `idea-deep-dive-YYYYMMDD-HHMMSS.html`

The report must include everything from the shortlist plus:

- 2-week MVP checklist
- GTM wedge
- first ten users
- outreach angle
- top risks and mitigations
- 7-day validation sprint
- why not Web2

## JSON Payload Shape

Use this shape when invoking the render script:

```json
{
  "report_type": "shortlist",
  "theme": "manuscript",
  "title": "Find Next Crypto Idea",
  "generated_at": "2026-03-23T12:00:00Z",
  "user_context": {
    "prompt": "what should I build?",
    "summary": [
      "solo developer with DeFi familiarity",
      "wants a 2-week MVP",
      "can reach protocol analysts but not enterprises yet"
    ],
    "clarifying_answers": [
      {
        "question": "What is your unfair edge?",
        "answer": "I trade onchain daily and know MEV searchers."
      }
    ]
  },
  "recommended_winner": "agent-settlement-for-vertical-saas",
  "ideas": [
    {
      "slug": "agent-settlement-for-vertical-saas",
      "name": "Agent Settlement for Vertical SaaS",
      "rank": 1,
      "status": "winner",
      "one_liner": "Let domain-specific AI agents pay each other onchain for metered actions.",
      "why_it_wins": "Best match for the user's edge and fastest MVP.",
      "why_crypto_is_necessary": "Onchain payments and auditability are core to multi-agent settlement.",
      "kill_this_idea": "If buyers only want normal billing rails, the crypto layer disappears.",
      "why_not_web2": "Stripe can bill humans well, but not open agent-to-agent settlement across untrusted actors.",
      "scores": {
        "founder_fit": 3,
        "mvp_speed": 2,
        "distribution_clarity": 2,
        "market_pull": 2,
        "revenue_path": 2
      },
      "competitors": [
        {
          "name": "Example Co",
          "type": "direct",
          "signal": "recent launch thread and beta users",
          "why_they_have_not_won": "narrow scope and weak distribution"
        }
      ],
      "oss_landscape": [
        {
          "name": "example/repo",
          "signal": "active commits",
          "notes": "useful primitives but not a full product"
        }
      ],
      "mvp_checklist": [
        "build a narrow payments API",
        "support one chain and one use case"
      ],
      "gtm": {
        "wedge": "sell to AI-heavy vertical SaaS teams first",
        "first_ten_users": "named operators and founders already in the user's network",
        "channels": [
          "X DMs",
          "founder group chats"
        ],
        "message_angle": "cut settlement friction for agent workflows"
      },
      "risks": [
        {
          "risk": "buyers may prefer Web2 billing",
          "mitigation": "start where open, cross-party settlement is unavoidable"
        }
      ],
      "validation_sprint": [
        {
          "day": 1,
          "task": "message five target operators with a concrete wedge"
        }
      ]
    }
  ]
}
```

## Rendering Rules

- Keep the HTML readable offline.
- Prefer compact sections and tables over long prose walls.
- Favor checklists, bullets, and side-by-side comparisons.
