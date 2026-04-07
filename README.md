# superstack

Everything a Solana developer needs — 24 journey skills, 59 repos, 71 ecosystem skills, 49 MCP servers.

## Install

Requirements: [Claude Code](https://claude.ai/code) or [Codex](https://openai.com/codex), Git, and Node.js 20+.

```bash
curl -fsSL https://www.solana.new/setup.sh | bash
```

**What gets installed:** Skills (Markdown prompts) in `~/.claude/skills/` and `~/.codex/skills/`, Solana knowledge base, guides, and catalog data. Nothing touches your PATH or runs in the background.

## Quick Start

```bash
claude "/find-next-crypto-idea What should I build on Solana?"
claude "/scaffold-project Set up my workspace"
claude "/deploy-to-mainnet Ship it"
```

## Journey Skills

23 skills across 4 phases — user just asks naturally, right skill activates. Every skill interviews you first (via AskUserQuestion) and never assumes.

### Phase 0: Learn — Solana Fundamentals
| Skill | Trigger |
|-------|---------|
| `solana-beginner` | "I'm new to Solana — teach me the fundamentals" |
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

Skills live in `skills/<phase>/<skill-name>/`.

## What's Indexed

Ships with a curated catalog of Solana ecosystem resources and a comprehensive knowledge base.

| Catalog | Count | Description |
|---------|-------|-------------|
| **Repos** | 59 | Solana official, Metaplex, Orca, Raydium, Jupiter, SendAI, community |
| **Skills** | 71 | 15 official from solana.com + 56 community (Jupiter, Helius, etc.) |
| **MCPs** | 49 | Helius, Jupiter, Phantom, Orca, Chainstack, openSVM, security, DAO |
| **Knowledge Docs** | 7 | Covers everything on solana.com — architecture, programs, SDKs, DeFi protocols, app layer, open-source research, plus the full Cookbook index |
| **Guides** | 3+ | RPC + wallet setup, deploy devnet to mainnet, security audit checklist, curated ideas |
| **Curated Ideas** | 114+ | From YC, a16z, Alliance, and Superteam |

Knowledge docs and guides are in `skills/data/` — skills reference them automatically so you don't need to look them up manually.

## Context & Learnings

Each phase writes context to `.superstack/` as markdown so the next phase picks up automatically:

```
.superstack/
  idea-context.md       # Chosen idea, scores, validation, competitors
  build-context.md      # Stack, milestones, review findings
  learnings.md          # Patterns, pitfalls, preferences (managed by /learn)
```

Use `/learn` to view, search, prune, or export project learnings across sessions.

## Telemetry

superstack collects **anonymous, privacy-first** usage telemetry to understand which skills are popular and where things break. No code, no file paths, no PII — ever.

### Three tiers

| Tier | What's collected | Default? |
|------|-----------------|----------|
| `off` | Nothing at all | **Yes** |
| `anonymous` | Skill name, phase, command, success/failure, duration, platform, CLI version | No |
| `community` | Same as anonymous + a random installation UUID (to count unique installs) | No |

### How to change your tier

```bash
# Check current setting
cat ~/.superstack/config.json

# Or set it programmatically in config.json:
# { "telemetryTier": "anonymous" }
```

### How it works

- Events are buffered locally in `~/.superstack/telemetry.jsonl`
- Background sync to Convex (fire-and-forget, 3s timeout)
- All collection fails silently — telemetry never crashes the CLI
- No tracking cookies, no browser fingerprinting, no IP logging

### What an event looks like

```json
{
  "skill": "scaffold-project",
  "phase": "build",
  "command": "ship",
  "status": "success",
  "durationMs": 4200,
  "version": "0.4.0",
  "platform": "darwin-arm64",
  "timestamp": 1712150400000
}
```

## Development

```bash
pnpm install          # install deps
pnpm build            # compile TypeScript → dist/
pnpm dev              # run CLI via tsx (no build needed)
```

## Project Structure

```
cli/
  branding.ts               Single source of truth for all brand strings
  index.ts                  Command dispatcher, agent output, help
  telemetry.ts              Skill usage tracking (Convex + local JSONL)
  init.ts                   Auto-install skills to ~/.claude/skills/ and ~/.codex/skills/
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
    guides/                 Shared guides (RPC+wallet, deploy, security, curated ideas)
    specs/                  Phase handoff contracts
    ideas/                  114+ curated ideas from YC, a16z, Alliance, Superteam
convex/
  schema.ts                 Feedback + telemetry tables
  feedback.ts               Submit mutation
  telemetry.ts              Skill usage tracking
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions, how to add skills/repos/MCPs, code conventions, and submitting PRs.
