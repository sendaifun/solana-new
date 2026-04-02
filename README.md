# superstack

Everything a Solana developer needs — 24 journey skills, 59 repos, 71 ecosystem skills, 49 MCP servers. Agent-first CLI: `superstack ship`.

## Install in Two Steps

Requirements: [Claude Code](https://claude.ai/code) or [Codex](https://openai.com/codex), Git, and Node.js 20+.

### Step 1: Install on Your Machine

Open Claude Code and paste this command. Claude will handle the rest.

```bash
git clone https://github.com/sendaifun/solana-new-cli.git ~/.claude/skills/superstack && cd ~/.claude/skills/superstack && ./setup
```

### Step 2: Add to Your Repo (Optional)

Share superstack with your team. Real files get committed to your repo — teammates just run setup once.

```bash
./setup --vendor
```

This copies skills into `.claude/skills/superstack/` in your project. Commit it, and teammates get everything when they clone your repo.

**What gets installed:** Skills (Markdown prompts) in `~/.claude/skills/` and `~/.codex/skills/`, decision trees, runbooks, Solana knowledge base, and catalog data. Nothing touches your PATH or runs in the background.

## Quick Start

```bash
superstack ship                          # pick a skill → launches Claude/Codex
superstack init                          # install 24 journey skills
claude "What should I build on Solana?"  # or codex "..."
```

Or bootstrap everything in one command (installs superstack, Claude/Codex CLIs if missing, and initializes skills):

```bash
curl -fsSL https://raw.githubusercontent.com/sendaifun/solana-new-cli/main/install.sh | bash
```

## Commands

```
superstack ship [--yolo] [--codex|--claude]       Learn → Idea → Build → Launch TUI
superstack init                                   Install journey skills to Claude/Codex
superstack search [query]                         Find repos, skills, MCPs
superstack repos [--search <q>]                   Browse or filter repos
superstack skills [--search <q>]                  Browse or filter skills
superstack copilot [text] [--token [pat]]         Onboarding + idea analysis + token settings
superstack doctor                                 Check environment setup
superstack feedback [message]                     Send feedback to the team
superstack completion [bash|zsh]                   Generate shell completions
```

Add `--agent` to any command for machine-readable plaintext output (for Claude Code / Codex).

## Journey Skills (auto-installed via `superstack init`)

24 skills across 4 phases — user just asks naturally, right skill activates. Every skill interviews you first (via AskUserQuestion) and never assumes.

### Phase 0: Learn — Solana Fundamentals
| Skill | Trigger |
|-------|---------|
| `solana-foundation` | "I'm new to Solana — teach me the fundamentals" |
| `learn` | "What have we learned across sessions?" |

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
| `virtual-solana-incubator` | "Deep dive into Solana architecture and Rust" |
| `build-defi-protocol` | "Build a DeFi protocol on Solana" |
| `build-data-pipeline` | "Build a Solana data pipeline" |
| `build-mobile` | "Build a Solana mobile app" |
| `build-blinks` | "Build a Solana Action / Blink" |
| `launch-token` | "Launch an SPL token on Solana" |
| `roast-my-product` | "Roast my product — be brutal" |
| `product-review` | "Review my product's UX and quality" |
| `review-and-iterate` | "Review my Solana program for security" |
| `cso` | "Run a security audit on my project" |
| `debug-program` | "Debug my failing Solana program" |
| `navigate-skills` | "What skills do I have?" |

### Phase 3: Launch — Go to Market
| Skill | Trigger |
|-------|---------|
| `deploy-to-mainnet` | "Deploy to mainnet" |
| `create-pitch-deck` | "Create a pitch deck" |
| `submit-to-hackathon` | "Prepare my hackathon submission" |
| `marketing-video` | "Create a marketing video" |

Skills live in `skills/<phase>/<skill-name>/`. Run `superstack init` to install them to `~/.claude/skills/` and `~/.codex/skills/`.

## Solana Knowledge Base

6 comprehensive reference docs covering everything on solana.com, plus the full Cookbook index. Skills reference these automatically.

| Doc | Covers |
|-----|--------|
| `01-what-and-why-solana.md` | Ecosystem, institutional adoption, network metrics, why Solana |
| `02-what-makes-solana-unique.md` | PoH, SVM, 8 innovations, Rust, vs EVM comparison |
| `03-contract-level.md` | Accounts, programs, PDAs, CPIs, Anchor, fees, compute units |
| `04-protocols-and-sdks.md` | Jupiter, Helius, Orca, Metaplex, wallets, developer tools |
| `05-app-layer-consumer.md` | Client SDKs, React, Actions/Blinks, mobile, Solana Pay |
| `06-opensource-research.md` | Courses, community, grants, hackathons, GitHub repos |
| `cookbook-index.md` | All 25+ Solana Cookbook recipes indexed with URLs |

Located in `skills/data/solana-knowledge/`.

## Context & Learnings

Each phase writes context to `.superstack/` as markdown so the next phase picks up automatically:

```
.superstack/
  idea-context.md       # Chosen idea, scores, validation, competitors
  build-context.md      # Stack, milestones, review findings
  learnings.md          # Patterns, pitfalls, preferences (managed by /learn)
```

Use `/learn` to view, search, prune, or export project learnings across sessions.

## What's Indexed

| Catalog | Count | Description |
|---------|-------|-------------|
| **Repos** | 59 | Solana official, Metaplex, Orca, Raydium, Jupiter, SendAI, community |
| **Skills** | 71 | 15 official from solana.com + 56 community (Jupiter, Drift, Helius, etc.) |
| **MCPs** | 49 | Helius, Jupiter, Phantom, Orca, Chainstack, openSVM, security, DAO |

## Interactive TUI

All browse commands open a full-screen interactive search:

- Type to filter results in real-time
- `↑↓` to navigate, `Enter` to clone/install
- `Shift+D` to toggle descriptions
- `Esc` to quit

## Agent Mode

Add `--agent` for machine-readable output, optimized for Claude Code and Codex:

```bash
superstack ship --agent
superstack repos --search defi --agent
superstack skills --agent
```

## Shell Completions

```bash
# zsh (add to ~/.zshrc)
eval "$(superstack completion zsh)"

# bash (add to ~/.bashrc)
eval "$(superstack completion bash)"
```

## Development

```bash
pnpm install          # install deps
pnpm build            # compile TypeScript → dist/
pnpm dev              # run CLI via tsx (no build needed)
./setup               # one-command install
```

## Project Structure

```
cli/
  branding.ts               Single source of truth for all brand strings
  index.ts                  Command dispatcher, agent output, help
  telemetry.ts              Skill usage tracking (Convex + local JSONL)
  init.ts                   Auto-install skills to ~/.claude/skills/ and ~/.codex/skills/
  interactive-journey.ts    Learn → Idea → Build → Launch TUI with phase auto-detection
  interactive-onboarding.ts Category → recommendation → workspace setup
  interactive-search.ts     Repos, Skills, MCPs TUI
  data/
    clonable-repos.json     59 repos catalog
    solana-skills.json      71 skills catalog
    solana-mcps.json        49 MCP servers catalog
skills/
  SKILL_ROUTER.md           Shared routing table — AI auto-corrects wrong skill
  idea/                     Discovery & planning skills (6 skills)
  build/                    Implementation skills (14 skills)
  launch/                   Go-to-market skills (4 skills)
  data/
    solana-knowledge/       6 knowledge area docs + cookbook index
    decisions/              5 decision tree JSONs (wallet, RPC, DeFi, testing, token)
    runbooks/               3 runbooks (RPC+wallet, deploy, security)
    specs/                  Phase handoff contracts
    ideas/                  114+ curated ideas from YC, a16z, Alliance, Superteam
convex/
  schema.ts                 Feedback + telemetry tables
  feedback.ts               Submit mutation
  telemetry.ts              Skill usage tracking
```
