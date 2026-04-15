# superstack
[![solana.new](https://img.shields.io/badge/solana.new-Install-black?logo=solana&logoColor=white)](https://solana.new)
[![Skills](https://img.shields.io/badge/skills-78-blueviolet)](#ecosystem-catalog)
[![Repos](https://img.shields.io/badge/repos-107-blue)](#ecosystem-catalog)
[![MCPs](https://img.shields.io/badge/MCPs-36-green)](#ecosystem-catalog)
[![License](https://img.shields.io/github/license/sendaifun/solana-new)](LICENSE)

The open-source platform behind [solana.new](https://solana.new) — 26 journey skills that take you from "what should I build?" to a shipped, funded product on Solana. Backed by 107 repos, 78 ecosystem skills, 36 MCP servers, 515+ curated ideas, and a comprehensive Solana knowledge base.

Works with [Claude Code](https://claude.ai/code) and [Codex](https://openai.com/index/codex/).

<img width="5760" height="3240" alt="gh-cover-2" src="https://github.com/user-attachments/assets/dbf27bc1-423d-405b-8c6a-04253f5ba176" />

## Install

```bash
curl -fsSL https://www.solana.new/setup.sh | bash
```

Installs skills (Markdown prompts) to `~/.claude/skills/` and `~/.codex/skills/`, plus the Solana knowledge base, guides, and catalog data. Nothing touches your PATH or runs in the background.

**Requirements:** Git and Node.js 20+.

## Quick Start

```bash
claude "/find-next-crypto-idea What should I build on Solana?"
claude "/scaffold-project Set up my workspace"
claude "/build-with-claude Help me build the MVP"
claude "/deploy-to-mainnet Ship it"
```

Every skill interviews you first — never assumes.

## Journey Skills

25 skills across 4 phases. You ask naturally, the right skill activates.

```
  LEARN                  IDEA                     BUILD                         LAUNCH
  ──────────────────     ──────────────────────   ───────────────────────────   ──────────────────────
  solana-beginner        find-next-crypto-idea    scaffold-project              deploy-to-mainnet
  learn                  validate-idea            build-with-claude             create-pitch-deck
                         competitive-landscape    virtual-solana-incubator      submit-to-hackathon
                         defillama-research       build-defi-protocol           marketing-video
                         colosseum-copilot        build-data-pipeline
                                                  build-mobile
                                                  launch-token
                                                  roast-my-product
                                                  product-review
                                                  review-and-iterate
                                                  cso
                                                  debug-program
                                                  navigate-skills
```

### Learn

| Skill | What it does |
|-------|-------------|
| `solana-beginner` | Teaches Solana fundamentals adapted to your background (EVM dev, beginner, backend) |
| `learn` | Reviews, searches, prunes, and exports project learnings across sessions |

### Idea

| Skill | What it does |
|-------|-------------|
| `find-next-crypto-idea` | Interviews you to discover and rank crypto startup ideas from 515+ curated sources |
| `validate-idea` | Stress-tests an idea with a structured validation sprint |
| `competitive-landscape` | Maps competitors, substitutes, and whitespace across the ecosystem catalog |
| `defillama-research` | Researches DeFi protocols and market opportunities using real-time TVL data |
| `colosseum-copilot` | Searches Colosseum hackathon projects for winner patterns and gaps |

### Build

| Skill | What it does |
|-------|-------------|
| `scaffold-project` | Sets up workspace with the right repo, skills, MCPs, and architecture |
| `build-with-claude` | Guides you through MVP implementation step by step |
| `virtual-solana-incubator` | Deep technical bootcamp — SVM, Rust, PDAs, CPIs, programs |
| `build-defi-protocol` | Guided DeFi build with security-first patterns, CPIs, and token math |
| `build-data-pipeline` | Indexes accounts, tracks transactions, builds real-time data infrastructure |
| `build-mobile` | React Native + Expo + Mobile Wallet Adapter |
| `launch-token` | Token mint, metadata, distribution, and launch strategy |
| `roast-my-product` | Harsh, honest product critique — finds every weakness before users do |
| `product-review` | Balanced UX/quality evaluation with improvement roadmap |
| `review-and-iterate` | Code review for quality, security, and production readiness |
| `cso` | Infrastructure-first security audit: secrets, deps, CI/CD, OWASP |
| `debug-program` | Diagnoses program errors and failed transactions |
| `navigate-skills` | Browses all installed skills, repos, and MCPs |

### Launch

| Skill | What it does |
|-------|-------------|
| `deploy-to-mainnet` | Pre-flight checklist and guided mainnet deployment |
| `create-pitch-deck` | Structured pitch deck for VCs, hackathons, or grants |
| `submit-to-hackathon` | Optimized hackathon submission with demo script |
| `marketing-video` | Code-driven (Remotion) + AI-generated video production |

## How Phases Connect

Each phase writes context to `.superstack/` in your project. The next phase reads it automatically.

```
find-next-crypto-idea  ──writes──>  .superstack/idea-context.md
scaffold-project       ──reads───>  .superstack/idea-context.md
build-with-claude      ──writes──>  .superstack/build-context.md
deploy-to-mainnet      ──reads───>  .superstack/build-context.md
```

Context files are optional, not gates. Skip to any phase — the skill asks you directly if context is missing.

## Ecosystem Catalog

Ships with a curated catalog of the Solana ecosystem that skills search and recommend from.

| Catalog | Count | Examples |
|---------|-------|---------|
| **Repos** | 106 | Anchor, Pinocchio, Quasar, Doppler, Metaplex, Orca, Raydium, Jupiter, Jito, LiteSVM, Mollusk, Codama, Blueshift, ConnectorKit, Solana Agent Kit, MagicBlock |
| **Skills** | 77 | 15 official (Solana Foundation) + 62 community (Jupiter, Helius, Kamino, Privy, DFlow, Meteora, Sanctum, QEDGen, Carbium) |
| **MCPs** | 36 | Helius, Jupiter, Phantom, Orca, Alchemy, Flash Trade, Solscan, DexScreener, Solana Foundation |
| **Knowledge** | 7 docs | Architecture, programs, protocols, SDKs, app layer, open-source research, Cookbook index |
| **Guides** | 3 | RPC + wallet setup, deploy runbook, security checklist |
| **Ideas** | 515+ | Curated from YC, a16z, Alliance, SendAI, and Superteam |

Catalog data lives in `cli/data/`. Skills reference it automatically — you don't need to look anything up.

## Telemetry

Anonymous, opt-in, privacy-first. Tracks which skills get used and how long they take — no code, no file paths, no PII. Default is **off**.

```bash
# Check or change in ~/.superstack/config.json
# Options: "off" (default) | "anonymous" | "community"
```

## Project Structure

```
cli/
  branding.ts               Single source of truth for all brand strings
  index.ts                  Command dispatcher and main entry
  telemetry.ts              Skill usage tracking (Convex + local JSONL)
  init.ts                   Auto-install skills to ~/.claude/ and ~/.codex/
  data/
    clonable-repos.json     106 repos
    solana-skills.json      77 skills (15 official + 62 community)
    solana-mcps.json        36 MCP servers
skills/
  SKILL_ROUTER.md           Routing table — AI auto-corrects wrong skill
  idea/                     Discovery & planning (6 skills)
  build/                    Implementation & review (14 skills)
  launch/                   Go-to-market (4 skills)
  data/
    solana-knowledge/       6 knowledge docs + cookbook index
    guides/                 Shared runbooks (RPC, deploy, security)
    ideas/                  515+ curated ideas (JSON + Markdown)
    specs/                  Phase handoff contracts
convex/
  schema.ts                 Telemetry + feedback tables
  telemetry.ts              Track mutation + queries
  feedback.ts               Submit mutation
```

## Contributing

We welcome contributions — from adding a repo to the catalog (5 min) to creating a new journey skill. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide covering all contribution types, supply-chain security rules, and reviewer checklists.

## Credits

Built by [SendAI](https://sendai.fun) and [Superteam](https://superteam.fun). Powered by the Solana ecosystem:

- [Solana Foundation](https://github.com/solana-foundation) — Official dev skill, MCP, and program examples
- [Helius](https://github.com/helius-labs) — RPC infrastructure, DAS API, MCP server
- [Jupiter](https://github.com/jup-ag) — DEX aggregation, swaps, perps, skills, and CLI
- [Metaplex](https://github.com/metaplex-foundation) — NFT standards and tooling
- [MagicBlock](https://github.com/magicblock-labs) — On-chain gaming, Ephemeral Rollups, BOLT ECS
- [Orca](https://github.com/orca-so), [Raydium](https://github.com/raydium-io), [Kamino](https://github.com/Kamino-Finance), [Meteora](https://meteora.ag) — DeFi protocols
- [Privy](https://privy.io), [Phantom](https://phantom.app), [Squads](https://squads.so) — Wallets and auth
- [Colosseum](https://colosseum.org) — Hackathon data and startup research
- [DFlow](https://dflow.net), [Sanctum](https://sanctum.so), [Light Protocol](https://lightprotocol.com) — Ecosystem protocols
- And [50+ more projects](cli/data/solana-skills.json) building the Solana developer ecosystem

## License

[MIT](LICENSE)
