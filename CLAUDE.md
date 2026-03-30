# CLAUDE.md — solana.new

## What This Is

CLI tool to discover the Solana ecosystem — 59 repos, 66 skills, and 49 MCP servers, searchable from the terminal with interactive TUI and agent-friendly output.

## Quick Reference

```bash
pnpm install          # install deps
pnpm build            # compile TypeScript → dist/
pnpm dev              # run CLI via tsx (no build needed)
```

## Commands

```bash
solana-new init                                   # install journey skills → open Codex/Claude → go
solana-new ship                                   # Idea → Build → Launch TUI
solana-new copilot start [text]                   # guided onboarding + free-form idea analysis
solana-new copilot [token]                        # manage Copilot token + settings
solana-new search [query]                         # find repos, skills, MCPs
solana-new repos [--search <q>]                   # browse or filter repos
solana-new skills [--search <q>]                  # browse or filter skills
```

Add `--agent` to any command for machine-readable plaintext output (for Claude Code / Codex).

## Journey Skills (auto-installed via `solana-new init`)

10 skills across 3 phases — user just asks naturally, right skill activates.

| Phase | Skill | Trigger Prompt |
|-------|-------|---------------|
| Idea | `find-next-crypto-idea` | "What should I build in crypto?" |
| Idea | `validate-idea` | "Validate this idea" |
| Idea | `competitive-landscape` | "Who are my competitors?" |
| Idea | `defillama-research` | "Show me DeFi opportunities on Solana" |
| Build | `scaffold-project` | "Scaffold my project" |
| Build | `build-with-claude` | "Help me build the MVP" |
| Build | `review-and-iterate` | "Review my code" |
| Launch | `deploy-to-mainnet` | "Deploy to mainnet" |
| Launch | `create-pitch-deck` | "Create a pitch deck" |
| Launch | `submit-to-hackathon` | "Prepare my hackathon submission" |

Skills live in `skills/<phase>/<skill-name>/`. To add a new skill, create a folder with `SKILL.md` + `references/` + `agents/openai.yaml` and run `solana-new init`.

## What's Indexed

| Catalog | Count | File |
|---------|-------|------|
| Repos | 59 | `cli/data/clonable-repos.json` |
| Skills | 71 | `cli/data/solana-skills.json` |
| MCPs | 49 | `cli/data/solana-mcps.json` |

## File Map

```
cli/
  index.ts                  Command dispatcher, agent output, help
  init.ts                   Auto-install skills to ~/.claude/skills/ and ~/.codex/skills/
  interactive-journey.ts    Idea → Build → Launch TUI (launches Codex/Claude)
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
  idea/                     Discovery & planning skills (4 skills)
  build/                    Implementation skills (10 skills)
  launch/                   Go-to-market skills (3 skills)
  data/                     Datasets, catalogs, phase handoff spec
```

## Conventions

- **ESM-only**: All imports use `.js` extensions (NodeNext module resolution)
- **Strict TypeScript**: strict mode, no implicit any
- **No runtime deps**: Only devDependencies (tsx, typescript, @types/node)
- **Interactive by default**: Commands launch TUI when no flags are passed
- **`--agent` for machines**: Compact plaintext output, no ANSI colors
- **`--search` for filtering**: Static output when `--search` flag is passed

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->
