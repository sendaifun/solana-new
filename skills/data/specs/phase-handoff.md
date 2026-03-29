# Phase Handoff Specification

Defines the JSON contracts that skills write to `.solana-new/` in the project workspace. Each phase's output is the next phase's input.

## File Locations

```
<project-root>/
  .solana-new/
    idea-context.json       # Written by Phase 1 (Idea) skills
    build-context.json      # Written by Phase 2 (Build) skills
```

## idea-context.json

Written by: `find-next-crypto-idea`, `validate-idea`, `competitive-landscape`

```json
{
  "phase": "idea",
  "completed_at": "2026-03-28T12:00:00Z",
  "chosen_idea": {
    "slug": "agent-settlement-for-vertical-saas",
    "name": "Agent Settlement for Vertical SaaS",
    "one_liner": "Let domain-specific AI agents pay each other on-chain with sub-second settlement",
    "why_crypto": "On-chain payments and auditability are core to multi-agent trust",
    "scores": {
      "founder_fit": 3,
      "mvp_speed": 2,
      "distribution_clarity": 2,
      "market_pull": 2,
      "revenue_path": 1
    },
    "competitors": [
      { "name": "Example Protocol", "url": "https://example.com", "status": "live", "threat": "medium" }
    ],
    "mvp_checklist": [
      "Build agent-to-agent payment SDK",
      "Integrate Jupiter for token swaps",
      "Create demo with 2 agents settling a task"
    ],
    "gtm": {
      "wedge": "Solana AI agent builders who need payments",
      "first_ten_users": "Solana Agent Kit community",
      "distribution": "npm package + Claude Code skill"
    }
  },
  "validation": {
    "demand_signals": [
      { "type": "github_activity", "description": "3 open issues requesting agent payments in SAK repo" },
      { "type": "twitter_discussion", "description": "Thread with 200+ likes asking for agent-to-agent settlement" }
    ],
    "risks": [
      { "category": "technical", "description": "Cross-program invocation complexity", "severity": "medium" },
      { "category": "market", "description": "Agent adoption still early", "severity": "low" }
    ],
    "go_no_go": "go",
    "confidence": 0.75,
    "next_steps": ["Build SDK prototype", "Talk to 5 agent builders"]
  },
  "landscape": {
    "direct_competitors": [],
    "substitutes": [
      { "name": "Manual SOL transfers", "approach": "Users send SOL manually", "why_users_stay": "Simple, no SDK needed" }
    ],
    "dead_projects": [],
    "crowdedness": "sparse",
    "moat_type": "network_effects",
    "differentiation": "First SDK purpose-built for agent-to-agent settlement on Solana"
  },
  "source_reports": [
    "idea-shortlist-20260328-120000.html",
    "idea-deep-dive-20260328-130000.html",
    "validation-report-20260328-140000.html",
    "landscape-20260328-150000.html"
  ]
}
```

### Field Rules

- `chosen_idea` is required. Must be populated by `find-next-crypto-idea`.
- `validation` is optional. Populated by `validate-idea` if run.
- `landscape` is optional. Populated by `competitive-landscape` if run.
- `source_reports` accumulates as skills are run. Each skill appends its artifact filename.
- Skills that run later should merge into the existing file, not overwrite it.

## build-context.json

Written by: `scaffold-project`, `build-with-claude`, `review-and-iterate`

```json
{
  "phase": "build",
  "completed_at": "2026-03-28T18:00:00Z",
  "idea_context_ref": ".solana-new/idea-context.json",
  "stack": {
    "template": "next-anchor",
    "skills_installed": ["solana-agent-kit", "jupiter", "helius"],
    "mcps_configured": ["helius-mcp", "jupiter-mcp"],
    "repos_cloned": ["create-solana-agent"],
    "architecture_pattern": "Solana Agent Kit"
  },
  "build_status": {
    "mvp_complete": true,
    "tests_passing": true,
    "devnet_deployed": true,
    "mainnet_deployed": false,
    "program_id": "AbC123...",
    "mainnet_program_id": null,
    "deployment_date": null,
    "rpc_provider": null,
    "milestones": [
      { "name": "Agent SDK scaffold", "completed_at": "2026-03-28T14:00:00Z" },
      { "name": "Jupiter swap integration", "completed_at": "2026-03-28T15:30:00Z" },
      { "name": "Agent-to-agent payment flow", "completed_at": "2026-03-28T17:00:00Z" }
    ]
  },
  "review": {
    "security_score": "B",
    "quality_score": "B+",
    "findings": [
      { "severity": "medium", "category": "security", "description": "Missing input validation on payment amount", "fix": "Add bounds check in settle_payment instruction" }
    ],
    "ready_for_mainnet": true
  }
}
```

### Field Rules

- `stack` is required. Must be populated by `scaffold-project`.
- `build_status` starts with all booleans `false`. Updated by `build-with-claude`.
- `review` is optional. Populated by `review-and-iterate` if run.
- `mainnet_deployed`, `mainnet_program_id`, `deployment_date`, `rpc_provider` are populated by `deploy-to-mainnet` (Phase 3).
- Skills that run later should merge into the existing file, not overwrite it.

## Merging Rules

When a skill updates an existing context file:

1. Read the current file first.
2. Deep-merge new fields into the existing object.
3. Array fields (`source_reports`, `milestones`, `findings`) should be appended to, not replaced.
4. Scalar fields (`go_no_go`, `security_score`) should be overwritten with the latest value.
5. Always update `completed_at` with the current timestamp.

## Missing Context

If a skill expects a context file that doesn't exist:

1. Do NOT fail. Instead, interview the user for the minimum required context.
2. Recommend running the prior phase skill, but don't block.
3. Create the context file with whatever information is gathered.
