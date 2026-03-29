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
solana-new init                                   # install journey skills → open Claude Code → go
solana-new journey                                # Idea → Build → Launch TUI
solana-new start                                  # guided onboarding + landscape + workspace setup
solana-new idea [text]                            # free-form idea — landscape + gap analysis
solana-new search [query]                         # find repos, skills, MCPs
solana-new repos [--search <q>]                   # browse or filter repos
solana-new skills [--search <q>]                  # browse or filter skills
solana-new config [token]                         # manage Copilot token + settings
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
| Repos | 59 | `shared/constants/clonable-repos.json` |
| Skills | 66 | `shared/constants/solana-skills.json` |
| MCPs | 49 | `shared/constants/solana-mcps.json` |

## File Map

```
cli/
  index.ts                  Command dispatcher, agent output, help
  init.ts                   Auto-install skills to ~/.claude/skills/
  interactive-journey.ts    Idea → Build → Launch TUI (launches Claude Code)
  interactive-onboarding.ts Category → recommendation → workspace setup
  workspace-setup.ts        Clone repos, install skills, configure MCPs
  interactive-search.ts     Repos + harnesses TUI
  interactive-skills.ts     Skills TUI
  interactive-mcps.ts       MCPs TUI
  interactive-universal.ts  Universal search TUI (combines all)
  banner.ts                 ASCII art banner
skills/
  idea/                     Discovery & planning skills (4 skills)
  build/                    Implementation skills (3 skills)
  launch/                   Go-to-market skills (3 skills)
  shared/                   Datasets, downloaded sources, phase handoff spec
core/
  router/recommend-repo.ts  Repo search, filter by category/keyword
shared/
  types/index.ts            HarnessDefinition, Surface, Framework types
  constants/
    clonable-repos.json     59 repos (Solana official, SendAI, Metaplex, DeFi, etc.)
    solana-skills.json      66 skills (14 official + 52 community)
    solana-mcps.json        49 MCP servers
```

## Conventions

- **ESM-only**: All imports use `.js` extensions (NodeNext module resolution)
- **Strict TypeScript**: strict mode, no implicit any
- **No runtime deps**: Only devDependencies (tsx, typescript, @types/node)
- **Interactive by default**: Commands launch TUI when no flags are passed
- **`--agent` for machines**: Compact plaintext output, no ANSI colors
- **`--search` for filtering**: Static output when `--search` flag is passed
