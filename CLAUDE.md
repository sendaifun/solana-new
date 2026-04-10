# CLAUDE.md — superstack

## What This Is

Skills and knowledge base to ship on Solana — Idea to Launch. 25 journey skills, 59 repos, 73 ecosystem skills, 49 MCP servers.

## Install

```bash
curl -fsSL https://www.solana.new/setup.sh | bash
```

## Usage

Users invoke skills directly via Claude Code:

```bash
claude "/find-next-crypto-idea What should I build?"
claude "/scaffold-project Set up my workspace"
claude "/deploy-to-mainnet Ship it"
```

## Journey Skills

24 skills across 4 phases — user just asks naturally, right skill activates.

| Phase | Skill | Trigger Prompt |
|-------|-------|---------------|
| Learn | `solana-beginner` | "I'm new to Solana — teach me" |
| Learn | `learn` | "What have we learned?" |
| Idea | `find-next-crypto-idea` | "What should I build in crypto?" |
| Idea | `validate-idea` | "Validate this idea" |
| Idea | `competitive-landscape` | "Who are my competitors?" |
| Idea | `defillama-research` | "Show me DeFi opportunities on Solana" |
| Idea | `colosseum-copilot` | "Search Colosseum hackathon projects" |
| Build | `scaffold-project` | "Scaffold my project" |
| Build | `build-with-claude` | "Help me build the MVP" |
| Build | `virtual-solana-incubator` | "Deep dive into Solana and Rust" |
| Build | `build-defi-protocol` | "Build a DeFi protocol" |
| Build | `build-data-pipeline` | "Build an indexer" |
| Build | `build-mobile` | "Build a mobile app" |
| Build | `launch-token` | "Launch a token" |
| Build | `roast-my-product` | "Roast my product — be brutal" |
| Build | `product-review` | "Review my product's UX" |
| Build | `review-and-iterate` | "Review my code" |
| Build | `cso` | "Run a security audit" |
| Build | `debug-program` | "Debug my program" |
| Launch | `deploy-to-mainnet` | "Deploy to mainnet" |
| Launch | `create-pitch-deck` | "Create a pitch deck" |
| Launch | `submit-to-hackathon` | "Prepare my hackathon submission" |
| Launch | `marketing-video` | "Create a marketing video" |

Skills live in `skills/<phase>/<skill-name>/`. To add a new skill, create a folder with `SKILL.md` + `references/` + `agents/openai.yaml`.

**Skill routing**: `skills/SKILL_ROUTER.md` is a shared routing table. Each SKILL.md references it so the AI can auto-correct if the wrong skill is invoked.

**Shared guides** (step-by-step commands):
- `skills/data/guides/rpc-wallet-guide.md` — RPC + wallet setup for dev and production
- `skills/data/guides/deploy-runbook.md` — Deploy devnet → mainnet with verification
- `skills/data/guides/security-checklist.md` — P0-P3 security audit with exact grep commands

## What's Indexed

| Catalog | Count | File |
|---------|-------|------|
| Repos | 81 | `cli/data/clonable-repos.json` |
| Skills | 73 | `cli/data/solana-skills.json` |
| MCPs | 53 | `cli/data/solana-mcps.json` |

## File Map

```
cli/
  branding.ts               Single source of truth for all brand strings
  index.ts                  Command dispatcher, agent output, help
  telemetry.ts              Skill usage tracking (Convex + local JSONL)
  init.ts                   Auto-install skills to ~/.claude/skills/ and ~/.codex/skills/
  data/
    clonable-repos.json     59 repos (Solana official, SendAI, Metaplex, DeFi, etc.)
    solana-skills.json      73 skills (15 official + 58 community)
    solana-mcps.json        49 MCP servers
skills/
  SKILL_ROUTER.md           Shared routing table — AI auto-corrects wrong skill
  idea/                     Discovery & planning skills (6 skills, includes solana-beginner, learn)
  build/                    Implementation skills (14 skills, includes virtual-solana-incubator, roast-my-product, product-review, cso)
  launch/                   Go-to-market skills (4 skills, includes marketing-video)
  data/
    guides/                 Shared guides (RPC+wallet, deploy, security, curated ideas)
    solana-knowledge/       6 knowledge area docs + cookbook index (covers all of solana.com)
    specs/                  Phase handoff JSON contracts
    ideas/                  114+ curated ideas from YC, a16z, Alliance, Superteam
    defi/                   DefiLlama OpenAPI spec
convex/
  schema.ts                 Feedback + telemetry tables
  feedback.ts               Feedback submission mutation
  telemetry.ts              Skill usage tracking mutation + queries
setup                       One-command install script
```

## Conventions

- **ESM-only**: All imports use `.js` extensions (NodeNext module resolution)
- **Strict TypeScript**: strict mode, no implicit any
- **No runtime deps**: Only devDependencies (tsx, typescript, @types/node) + convex
- **Agent-first**: Designed for agent consumption
- **Single source of truth**: All branding in `cli/branding.ts`

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->
