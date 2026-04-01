# Skills — Idea to Production

10 Codex/Claude skills that take a new Solana developer from "what should I build?" to a shipped, pitched product.

```
  IDEA                    BUILD                   LAUNCH
  ─────────────────────   ─────────────────────   ─────────────────────
  find-next-crypto-idea   scaffold-project        deploy-to-mainnet
  validate-idea           build-with-claude       create-pitch-deck
  competitive-landscape   review-and-iterate      submit-to-hackathon
  defillama-research
```

## The Journey

### Phase 1: Idea — Discovery & Planning

Find what to build, validate it's worth building, and research the market.

| Skill | What It Does | Example Prompt |
|-------|-------------|----------------|
| `find-next-crypto-idea` | Interview you to discover and rank crypto startup ideas | "What should I build in crypto?" |
| `validate-idea` | Stress-test an idea with a structured validation sprint | "Is this idea worth building?" |
| `competitive-landscape` | Map competitors, substitutes, and opportunities | "Who are my competitors in this space?" |
| `defillama-research` | Research DeFi protocols and opportunities using real-time TVL data | "Show me DeFi opportunities on Solana" |

**Output**: `idea-context.json` with your chosen idea, validation results, competitive landscape, and DeFi market data.

### Phase 2: Build — Implementation

Set up your workspace, build the MVP, and get it reviewed.

| Skill | What It Does | Example Prompt |
|-------|-------------|----------------|
| `scaffold-project` | Set up workspace with the right repo, skills, and MCPs | "Scaffold my project" |
| `build-with-claude` | Guide you through MVP implementation step by step | "Help me build this" |
| `review-and-iterate` | Code review for quality, security, and production readiness | "Review my code" |

**Output**: `build-context.json` with your stack, build status, and review scores.

### Phase 3: Launch — Go to Market

Deploy to production, pitch to investors, and submit to hackathons.

| Skill | What It Does | Example Prompt |
|-------|-------------|----------------|
| `deploy-to-mainnet` | Pre-flight checklist and guided mainnet deployment | "Deploy to mainnet" |
| `create-pitch-deck` | Structured pitch deck for VCs, hackathons, or grants | "Create a pitch deck" |
| `submit-to-hackathon` | Optimized hackathon submission with demo script | "Prepare my hackathon submission" |

## How Phases Connect

Each phase writes structured JSON to `.superstack/` in your project directory. The next phase reads it automatically.

```
idea-context.json ──> scaffold-project reads it to pick the right stack
build-context.json ──> deploy-to-mainnet reads it to verify readiness
```

You can invoke skills directly, but dependency-sensitive skills now gate on missing context and route you to the correct prerequisite order.

Recommended execution order for best results:

1. `superstack copilot "your idea"` (creates idea context)
2. `scaffold-project` (creates build context)
3. `build-with-claude`
4. `review-and-iterate`
5. Launch skills (`deploy-to-mainnet`, `create-pitch-deck`, `submit-to-hackathon`)

## Getting Started

All skills are **auto-installed** when you run:

```bash
solana-new init              # Install all skills to ~/.claude/skills/ and ~/.codex/skills/
superstack ship           # Pick a skill → launches Codex/Claude with prompt
```

Or just:

```bash
codex "What should I build in crypto?"   # or: claude "..."
```

## Adding a New Skill

Skills live in the phase folder where they contribute most:

```
skills/
  idea/       ← discovery, research, validation
  build/      ← scaffolding, implementation, review
  launch/     ← deployment, pitching, submissions
```

To add a new skill:

1. Create `skills/<phase>/<skill-name>/SKILL.md` with frontmatter (`name`, `description`)
2. Add `references/` with 2-4 decision framework markdown files
3. Add `agents/openai.yaml` with display name and default prompt
4. Run `superstack init` to install it to `~/.claude/skills/` and `~/.codex/skills/`

The skill auto-discovers — no registration needed. Just put it in the right phase folder.

## Example: Full Journey

```
You: "What should I build in crypto?"
     → find-next-crypto-idea interviews you, produces ranked shortlist

You: "Show me DeFi opportunities on Solana"
     → defillama-research pulls TVL data, identifies gaps and trends

You: "Validate the agent payments idea"
     → validate-idea stress-tests it, produces go/no-go report

You: "Who are my competitors?"
     → competitive-landscape maps the space, finds gaps

You: "Scaffold my project"
     → scaffold-project sets up workspace with Solana Agent Kit + Jupiter

You: "Help me build the MVP"
     → build-with-claude guides you through 4 milestones

You: "Review my code"
     → review-and-iterate audits for security and quality, suggests fixes

You: "Deploy to mainnet"
     → deploy-to-mainnet runs pre-flight, configures Helius, deploys

You: "Create a pitch deck for Colosseum"
     → create-pitch-deck generates 12-slide content with speaking notes

You: "Prepare my hackathon submission"
     → submit-to-hackathon writes description, demo script, submission
```

## Directory Structure

```
skills/
  README.md
  data/
    ideas/                             # Idea datasets (Superteam, a16z, YC, Alliance)
    defi/                              # DeFi datasets (DefiLlama API spec)
    raw-html/                          # Raw HTML source pages
    specs/
      phase-handoff.md                 # JSON contract between phases
  idea/
    find-next-crypto-idea/             # Interview + rank crypto ideas
    validate-idea/                     # Validation sprint
    competitive-landscape/             # Competitor mapping
    defillama-research/                # DeFi market research via TVL data
  build/
    scaffold-project/                  # Workspace setup
    build-with-claude/                 # Guided MVP implementation
    review-and-iterate/                # Code review + security audit
  launch/
    deploy-to-mainnet/                 # Production deployment
    create-pitch-deck/                 # Pitch deck generator
    submit-to-hackathon/               # Hackathon submission builder
```
