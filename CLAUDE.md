# CLAUDE.md — superstack

## What This Is

CLI tool to ship on Solana — Idea to Launch. 59 repos, 71 skills, 49 MCP servers. Agent-first, single command: `superstack ship`.

> **Branding**: All brand strings live in `cli/branding.ts`. Change ONE file to rebrand everything.

## Quick Reference

```bash
pnpm install          # install deps
pnpm build            # compile TypeScript → dist/
pnpm dev              # run CLI via tsx (no build needed)
./setup               # gstack-style one-command install
```

## Commands

```bash
superstack                                        # minimal screen — just "run superstack ship"
superstack ship [--yolo] [--codex|--claude]       # Idea → Build → Launch sprint (auto-detects phase)
superstack --help                                 # show all commands
superstack init                                   # install journey skills → open Codex/Claude → go
superstack copilot [text] [--token [pat]]         # onboarding + idea analysis + token settings
superstack search [query]                         # find repos, skills, MCPs
superstack repos [--search <q>]                   # browse or filter repos
superstack skills [--search <q>]                  # browse or filter skills
```

Add `--agent` to any command for machine-readable plaintext output (for Claude Code / Codex).

## Journey Skills (auto-installed via `superstack init`)

18 skills across 3 phases — user just asks naturally, right skill activates.

| Phase | Skill | Trigger Prompt |
|-------|-------|---------------|
| Idea | `find-next-crypto-idea` | "What should I build in crypto?" |
| Idea | `validate-idea` | "Validate this idea" |
| Idea | `competitive-landscape` | "Who are my competitors?" |
| Idea | `defillama-research` | "Show me DeFi opportunities on Solana" |
| Build | `scaffold-project` | "Scaffold my project" |
| Build | `build-with-claude` | "Help me build the MVP" |
| Build | `build-defi-protocol` | "Build a DeFi protocol" |
| Build | `build-data-pipeline` | "Build an indexer" |
| Build | `build-mobile` | "Build a mobile app" |
| Build | `build-blinks` | "Build a Solana Action" |
| Build | `launch-token` | "Launch a token" |
| Build | `debug-program` | "Debug my program" |
| Build | `review-and-iterate` | "Review my code" |
| Launch | `deploy-to-mainnet` | "Deploy to mainnet" |
| Launch | `create-pitch-deck` | "Create a pitch deck" |
| Launch | `submit-to-hackathon` | "Prepare my hackathon submission" |
| Launch | `marketing-video` | "Create a marketing video" |

Skills live in `skills/<phase>/<skill-name>/`. To add a new skill, create a folder with `SKILL.md` + `references/` + `agents/openai.yaml` and run `superstack init`.

**Skill routing**: `skills/SKILL_ROUTER.md` is a shared routing table. Each SKILL.md references it so the AI can auto-correct if the wrong skill is invoked.

**Decision trees** (for "which X should I use?" questions):
- `skills/data/decisions/wallet-selection.json` — Privy vs Unified Adapter vs Phantom vs Keypair
- `skills/data/decisions/rpc-selection.json` — Helius vs QuickNode vs Triton vs public
- `skills/data/decisions/defi-protocol.json` — Jupiter vs Orca vs Raydium vs Drift vs Kamino
- `skills/data/decisions/testing-framework.json` — Surfpool vs LiteSVM vs Mollusk vs Bankrun
- `skills/data/decisions/token-standard.json` — SPL Token vs Token-2022

**Shared runbooks** (step-by-step commands):
- `skills/data/runbooks/rpc-wallet-guide.md` — RPC + wallet setup for dev and production
- `skills/data/runbooks/deploy-runbook.md` — Deploy devnet → mainnet with verification
- `skills/data/runbooks/security-checklist.md` — P0-P3 security audit with exact grep commands

## What's Indexed

| Catalog | Count | File |
|---------|-------|------|
| Repos | 59 | `cli/data/clonable-repos.json` |
| Skills | 71 | `cli/data/solana-skills.json` |
| MCPs | 49 | `cli/data/solana-mcps.json` |

## File Map

```
cli/
  branding.ts               Single source of truth for all brand strings
  index.ts                  Command dispatcher, agent output, help
  telemetry.ts              Skill usage tracking (Convex + local JSONL)
  init.ts                   Auto-install skills to ~/.claude/skills/ and ~/.codex/skills/
  interactive-journey.ts    Idea → Build → Launch TUI with phase auto-detection
  interactive-onboarding.ts Category → recommendation → workspace setup
  workspace-setup.ts        Clone repos, install skills, configure MCPs
  interactive-search.ts     Repos TUI
  interactive-skills.ts     Skills TUI
  interactive-mcps.ts       MCPs TUI
  interactive-universal.ts  Universal search TUI (combines all)
  banner.ts                 ASCII art banner
  data/
    clonable-repos.json     59 repos (Solana official, SendAI, Metaplex, DeFi, etc.)
    solana-skills.json      71 skills (15 official + 56 community)
    solana-mcps.json        49 MCP servers
skills/
  SKILL_ROUTER.md           Shared routing table — AI auto-corrects wrong skill
  idea/                     Discovery & planning skills (4 skills)
  build/                    Implementation skills (10 skills)
  launch/                   Go-to-market skills (4 skills, includes marketing-video)
  data/
    decisions/              5 decision tree JSONs (wallet, RPC, DeFi, testing, token)
    runbooks/               3 runbooks (RPC+wallet, deploy, security)
    specs/                  Phase handoff JSON contracts
    ideas/                  114+ curated ideas from YC, a16z, Alliance, Superteam
    defi/                   DefiLlama OpenAPI spec
convex/
  schema.ts                 Feedback + telemetry tables
  feedback.ts               Feedback submission mutation
  telemetry.ts              Skill usage tracking mutation + queries
setup                       gstack-style one-command install script
```

## Conventions

- **ESM-only**: All imports use `.js` extensions (NodeNext module resolution)
- **Strict TypeScript**: strict mode, no implicit any
- **No runtime deps**: Only devDependencies (tsx, typescript, @types/node) + convex
- **Agent-first**: Designed for agent consumption, TUI is secondary
- **`--agent` for machines**: Compact plaintext output, no ANSI colors
- **`--search` for filtering**: Static output when `--search` flag is passed
- **Single source of truth**: All branding in `cli/branding.ts`

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->
