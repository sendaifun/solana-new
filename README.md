# solana.new

CLI tool to discover the Solana ecosystem and build products — 59 repos, 71 skills, and 49 MCP servers, searchable from your terminal with interactive TUI and agent-friendly output.

## Quick Start

```bash
npx solana-new init         # install 17 journey skills → ready for Codex/Claude
npx solana-new ship         # pick a prompt → launches your available agent CLI
```

One-shot bootstrap (installs `solana-new`, Codex/Claude CLIs if missing, and initializes skills):

```bash
curl -fsSL https://raw.githubusercontent.com/sendaifun/solana-new/main/install.sh | bash
```

Local equivalent:

```bash
bash ./install.sh
```

## Commands

```
solana-new init                                   Install journey skills to Codex/Claude
solana-new ship                                   Idea → Build → Launch TUI
solana-new copilot start [text]                   Guided onboarding + free-form idea analysis
solana-new copilot [token]                        Manage Copilot token + settings
solana-new search [query]                         Find repos, skills, MCPs
solana-new repos [--search <q>]                   Browse or filter repos
solana-new skills [--search <q>]                  Browse or filter skills
solana-new feedback [message]                     Send feedback to the team
solana-new completion [bash|zsh]                  Generate shell completions
```

Add `--agent` to any command for machine-readable plaintext output (for Claude Code / Codex).

## Journey Skills (auto-installed via `solana-new init`)

17 skills across 3 phases — user just asks naturally, right skill activates.

### Phase 1: Idea — Discovery & Planning
| Skill | Trigger |
|-------|---------|
| `find-next-crypto-idea` | "What should I build on Solana?" |
| `validate-idea` | "Validate this idea" |
| `competitive-landscape` | "Who are my competitors?" |
| `defillama-research` | "Show me DeFi opportunities on Solana" |

### Phase 2: Build — Solana Implementation
| Skill | Trigger |
|-------|---------|
| `scaffold-project` | "Scaffold my Solana project with Anchor" |
| `build-with-claude` | "Help me build the Solana MVP step by step" |
| `build-defi-protocol` | "Build a DeFi protocol on Solana" |
| `build-blinks` | "Build a Solana Action / Blink" |
| `launch-token` | "Launch an SPL token on Solana" |
| `build-data-pipeline` | "Build a Solana data pipeline" |
| `build-mobile` | "Build a Solana mobile app" |
| `debug-program` | "Debug my failing Solana program" |
| `review-and-iterate` | "Review my Solana program for security" |
| `navigate-skills` | "What skills do I have?" |

### Phase 3: Launch — Hackathon Submission
| Skill | Trigger |
|-------|---------|
| `deploy-to-mainnet` | "Deploy to mainnet" |
| `create-pitch-deck` | "Create a pitch deck" |
| `submit-to-hackathon` | "Prepare my hackathon submission" |

Skills live in `skills/<phase>/<skill-name>/`. Run `solana-new init` to install them to `~/.claude/skills/` and `~/.codex/skills/`.

## What's Indexed

| Catalog | Count | Description |
|---------|-------|-------------|
| **Repos** | 59 | Solana official, Metaplex, Orca, Raydium, Jupiter, SendAI examples, community scaffolds |
| **Skills** | 71 | 15 official from solana.com + 56 community (Jupiter, Drift, Orca, Helius, QEDGen, etc.) |
| **MCPs** | 49 | Helius, Jupiter, Phantom, Orca, Chainstack, openSVM, security, DAO, multi-chain |

Catalog data is also installed to `~/.claude/skills/_data/catalogs/` and `~/.codex/skills/_data/catalogs/` so skills can search it at runtime.

## Interactive TUI

All browse commands open a full-screen interactive search:

- Type to filter results in real-time
- `↑↓` to navigate, `Enter` to clone/install
- `Shift+D` to toggle descriptions
- `Esc` to quit
- `Cmd+Backspace` to clear search

## Agent Mode

Add `--agent` to any command for machine-readable plaintext output, optimized for Claude Code and Codex:

```bash
solana-new ship --agent               # all skills with prompts
solana-new repos --search defi --agent
solana-new skills --agent
```

## Shell Completions

```bash
# zsh (add to ~/.zshrc)
eval "$(solana-new completion zsh)"

# bash (add to ~/.bashrc)
eval "$(solana-new completion bash)"
```

## Development

### Setup

```bash
pnpm install
pnpm build
```

### Environment

Copy `.env.example` to `.env` for local development:

```bash
cp .env.example .env
```

| Variable | Purpose |
|----------|---------|
| `CONVEX_URL` | Dev Convex deployment URL |
| `PROD_CONVEX_URL` | Prod Convex deployment URL |

Get your deployment URLs from [dashboard.convex.dev](https://dashboard.convex.dev).

### Convex Backend

`solana-new feedback` defaults to Telegram (`@scriptscrypt`) with prefilled message text.
Convex feedback is still available via `solana-new feedback "message" --convex`.
Schema and mutations remain in `convex/`.

```bash
npx convex dev --once       # push functions to dev
npx convex deploy           # push functions to prod
```

## Project Structure

```
cli/
  index.ts                  Command dispatcher, agent output, help
  init.ts                   Auto-install skills to ~/.claude/skills/ and ~/.codex/skills/
  interactive-journey.ts    Idea → Build → Launch TUI (launches Codex/Claude)
  interactive-onboarding.ts Category → recommendation → workspace setup
  interactive-search.ts     Repos, Skills, MCPs TUI
  interactive-skills.ts     Skills TUI
  interactive-mcps.ts       MCPs TUI
  interactive-universal.ts  Universal search TUI (combines all)
  feedback.ts               Telegram-first feedback + optional Convex fallback
  completion.ts             Shell completion generation
  banner.ts                 ASCII art banner
  data/
    clonable-repos.json     59 repos catalog
    solana-skills.json      71 skills catalog
    solana-mcps.json        49 MCP servers catalog
skills/
  idea/                     Discovery & planning skills (4 skills)
  build/                    Implementation skills (10 skills)
  launch/                   Go-to-market skills (3 skills)
  data/                     Datasets, catalogs, phase handoff spec
convex/
  schema.ts                 Feedback table schema
  feedback.ts               Submit mutation
```
