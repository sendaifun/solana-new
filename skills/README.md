# Skills — Learn to Launch

24 Codex/Claude skills that take a Solana developer from "what is Solana?" to a shipped, pitched product. Every skill interviews you first — never assumes.

```
  LEARN                   IDEA                    BUILD                        LAUNCH
  ────────────────────    ────────────────────    ────────────────────────     ────────────────────
  solana-foundation       find-next-crypto-idea   scaffold-project             deploy-to-mainnet
  learn                   validate-idea           build-with-claude            create-pitch-deck
                          competitive-landscape   virtual-solana-incubator     submit-to-hackathon
                          defillama-research      build-defi-protocol          marketing-video
                                                  build-data-pipeline
                                                  build-mobile
                                                  build-blinks
                                                  launch-token
                                                  roast-my-product
                                                  product-review
                                                  review-and-iterate
                                                  cso
                                                  debug-program
                                                  navigate-skills
```

## The Journey

### Phase 0: Learn — Solana Fundamentals

Understand Solana before you build. Adaptive teaching based on your background.

| Skill | What It Does | Example Prompt |
|-------|-------------|----------------|
| `solana-foundation` | Teach Solana fundamentals adapted to your background (EVM dev, beginner, backend) | "I'm new to Solana — teach me" |
| `learn` | Review, search, prune, and export project learnings across sessions | "What have we learned?" |

### Phase 1: Idea — Discovery & Planning

Find what to build, validate it's worth building, and research the market.

| Skill | What It Does | Example Prompt |
|-------|-------------|----------------|
| `find-next-crypto-idea` | Interview you to discover and rank crypto startup ideas | "What should I build in crypto?" |
| `validate-idea` | Stress-test an idea with a structured validation sprint | "Is this idea worth building?" |
| `competitive-landscape` | Map competitors, substitutes, and opportunities | "Who are my competitors?" |
| `defillama-research` | Research DeFi protocols and opportunities using real-time TVL data | "Show me DeFi opportunities on Solana" |

**Output**: `.superstack/idea-context.md` with your chosen idea, scores, validation, and landscape.

### Phase 2: Build — Implementation

Set up your workspace, build the MVP, review it, and get it roasted.

| Skill | What It Does | Example Prompt |
|-------|-------------|----------------|
| `scaffold-project` | Set up workspace with the right repo, skills, and MCPs | "Scaffold my project" |
| `build-with-claude` | Guide you through MVP implementation step by step | "Help me build this" |
| `virtual-solana-incubator` | Deep technical bootcamp: SVM, Rust, PDAs, CPIs | "Deep dive into Solana and Rust" |
| `build-defi-protocol` | Guided DeFi build with CPIs, PDAs, and token math | "Build a DeFi protocol" |
| `build-data-pipeline` | Index accounts, track transactions, real-time data | "Build an indexer" |
| `build-mobile` | React Native + mobile wallet adapter | "Build a mobile app" |
| `build-blinks` | Solana Actions and shareable transaction links | "Build a Blink" |
| `launch-token` | Token mint, metadata, distribution | "Launch a token" |
| `roast-my-product` | Brutal product critique — find every weakness | "Roast my product" |
| `product-review` | Balanced UX/quality evaluation with improvement roadmap | "Review my product's UX" |
| `review-and-iterate` | Code review for quality, security, and production readiness | "Review my code" |
| `cso` | Infrastructure-first security audit: secrets, deps, CI/CD, OWASP | "Run a security audit" |
| `debug-program` | Diagnose program errors and failed transactions | "Debug my program" |
| `navigate-skills` | Browse all installed skills, repos, and MCPs | "What skills do I have?" |

**Output**: `.superstack/build-context.md` with your stack, milestones, and review scores.

### Phase 3: Launch — Go to Market

Deploy to production, pitch to investors, and submit to hackathons.

| Skill | What It Does | Example Prompt |
|-------|-------------|----------------|
| `deploy-to-mainnet` | Pre-flight checklist and guided mainnet deployment | "Deploy to mainnet" |
| `create-pitch-deck` | Structured pitch deck for VCs, hackathons, or grants | "Create a pitch deck" |
| `submit-to-hackathon` | Optimized hackathon submission with demo script | "Prepare my submission" |
| `marketing-video` | Code-driven (Remotion) + AI-generated (Renoise) videos | "Create a marketing video" |

## How Phases Connect

Each phase writes markdown context to `.superstack/` in your project directory. The next phase reads it automatically.

```
idea-context.md ──> scaffold-project reads it to pick the right stack
build-context.md ──> deploy-to-mainnet reads it to verify readiness
learnings.md ──> all skills read/write learnings (/learn to manage)
```

Context files are **optional, not gates**. Every skill proceeds immediately if context is missing — it just asks you directly instead.

## Solana Knowledge Base

6 reference docs in `data/solana-knowledge/` covering all of solana.com:

| Doc | Covers |
|-----|--------|
| `01-what-and-why-solana.md` | Ecosystem, institutional adoption, network metrics |
| `02-what-makes-solana-unique.md` | PoH, SVM, 8 innovations, Rust, vs EVM |
| `03-contract-level.md` | Accounts, programs, PDAs, CPIs, Anchor, fees |
| `04-protocols-and-sdks.md` | Jupiter, Helius, Orca, Metaplex, wallets, tools |
| `05-app-layer-consumer.md` | Client SDKs, React, Actions/Blinks, mobile, Solana Pay |
| `06-opensource-research.md` | Courses, community, grants, hackathons, repos |
| `cookbook-index.md` | All 25+ Solana Cookbook recipes with URLs |

Skills reference these automatically based on what you're learning or building.

## Getting Started

All skills are **auto-installed** when you run:

```bash
superstack init           # Install all skills to ~/.claude/skills/ and ~/.codex/skills/
superstack ship           # Pick a skill → launches Codex/Claude with prompt
```

Or just ask directly:

```bash
claude "What should I build in crypto?"
codex "Help me build a DeFi protocol on Solana"
```

## Adding a New Skill

Skills live in the phase folder where they contribute most:

```
skills/
  idea/       ← discovery, research, validation, learning
  build/      ← scaffolding, implementation, review, security
  launch/     ← deployment, pitching, submissions, marketing
```

To add a new skill:

1. Create `skills/<phase>/<skill-name>/SKILL.md` with frontmatter (`name`, `description`)
2. Add `references/` with methodology and framework markdown files
3. Add `agents/openai.yaml` with display name and default prompt
4. Run `superstack init` to install it

The skill auto-discovers — no registration needed. Just put it in the right phase folder.

## Directory Structure

```
skills/
  SKILL_ROUTER.md                        # Routing table — AI auto-corrects wrong skill
  data/
    solana-knowledge/                    # 6 knowledge area docs + cookbook index
    ideas/                               # 114+ curated ideas (YC, a16z, Alliance, Superteam)
    defi/                                # DefiLlama API spec
    decisions/                           # 5 decision tree JSONs
    runbooks/                            # 3 shared runbooks
    specs/
      phase-handoff.md                   # Context contract between phases
  idea/
    solana-foundation/                   # Solana fundamentals (adaptive)
    learn/                               # Project learnings manager
    find-next-crypto-idea/               # Interview + rank crypto ideas
    validate-idea/                       # Validation sprint
    competitive-landscape/               # Competitor mapping
    defillama-research/                  # DeFi market research
  build/
    scaffold-project/                    # Workspace setup
    build-with-claude/                   # Guided MVP implementation
    virtual-solana-incubator/            # Deep technical bootcamp
    build-defi-protocol/                 # DeFi protocol builder
    build-data-pipeline/                 # Indexer / webhook / analytics
    build-mobile/                        # React Native mobile app
    build-blinks/                        # Solana Actions & Blinks
    launch-token/                        # Token launch
    roast-my-product/                    # Brutal product critique
    product-review/                      # UX/quality evaluation
    review-and-iterate/                  # Code review + security
    cso/                                 # Infrastructure security audit
    debug-program/                       # Program error diagnosis
    navigate-skills/                     # Meta skill browser
  launch/
    deploy-to-mainnet/                   # Production deployment
    create-pitch-deck/                   # Pitch deck generator
    submit-to-hackathon/                 # Hackathon submission
    marketing-video/                     # Video production
```
