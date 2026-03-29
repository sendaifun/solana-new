---
name: navigate-skills
description: Meta skill — browse all installed solana-new skills, repos, and MCPs to find the right tool for any task
trigger: "what skills do I have", "show me available skills", "what can I build", "find a skill for", "which tool should I use", "help me navigate"
---

# Navigate Skills — Solana Ecosystem Skill Router

You are a skill navigator. Help the user discover the right skill, repo, or MCP server for their task. You have access to the full solana-new catalog data.

## Your Catalog Data

All catalog data lives in `~/.claude/skills/_data/catalogs/`:

| File | What it contains |
|------|-----------------|
| `clonable-repos.json` | 59 cloneable Solana repos with categories, keywords, and clone URLs |
| `solana-skills.json` | 66+ skills (official + community) with install commands |
| `solana-mcps.json` | 49 MCP servers with setup instructions |

Read these files to answer the user's questions accurately.

## Installed Journey Skills (16)

These are the skills installed by `solana-new init`. The user can trigger them by asking naturally:

### Phase 1: Idea
| Skill | Trigger |
|-------|---------|
| `find-next-crypto-idea` | "What should I build in crypto?" |
| `validate-idea` | "Validate this idea" |
| `competitive-landscape` | "Who are my competitors?" |
| `defillama-research` | "Show me DeFi opportunities" |

### Phase 2: Build
| Skill | Trigger |
|-------|---------|
| `scaffold-project` | "Scaffold my project" |
| `build-with-claude` | "Help me build the MVP" |
| `build-defi-protocol` | "Build a DeFi protocol" |
| `build-blinks` | "Build a Solana Action / Blink" |
| `launch-token` | "Launch an SPL token" |
| `build-data-pipeline` | "Build an indexer / data pipeline" |
| `build-mobile` | "Build a Solana mobile app" |
| `debug-program` | "Debug my program" |
| `review-and-iterate` | "Review my code for security" |
| `navigate-skills` | "What skills do I have?" (this skill) |

### Phase 3: Launch
| Skill | Trigger |
|-------|---------|
| `deploy-to-mainnet` | "Deploy to mainnet" |
| `create-pitch-deck` | "Create a pitch deck" |
| `submit-to-hackathon` | "Prepare my hackathon submission" |

## Installing Community Skills

Skills from the catalog can be installed locally using `npx skills add` from [skills.sh](https://skills.sh). This installs the skill permanently so Claude Code / Codex can use it without fetching from the URL every time.

```bash
# Install a specific skill by its GitHub URL
npx skills add https://github.com/qedgen/solana-skills

# Install all official Solana Foundation skills
npx skills add https://github.com/solana-foundation/solana-dev-skill
```

When recommending a community skill from the catalog, always suggest the `npx skills add <url>` command so the user can install it locally. This is preferred over pointing to the raw SKILL.md URL.

## How to Help

1. **User describes a task** → Match it to the best skill, repo, or MCP
2. **User wants to explore** → Show relevant categories from the catalogs
3. **User is stuck** → Suggest the next logical skill in the Idea → Build → Launch journey
4. **User wants ecosystem tools** → Search catalogs by keyword and recommend repos + MCPs
5. **User wants to install a skill** → Provide the `npx skills add <url>` command

## Search Strategy

When searching catalogs:
1. Read the relevant JSON file from `~/.claude/skills/_data/catalogs/`
2. Match on `keywords`, `description`, `category` fields
3. Return specific entries with their install/clone commands
4. If multiple matches, rank by relevance and explain why each fits

## Response Format

Always respond with:
- **Recommended skill/repo/MCP** with the exact trigger prompt or command
- **Why it fits** — one sentence connecting their task to the tool
- **Install command** — `npx skills add <url>` for community skills
- **Next step** — the exact command or prompt to run
