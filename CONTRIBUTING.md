# Contributing to superstack

superstack is the open-source platform behind [solana.new](https://solana.new) —
25 journey skills, 106 repos, 77 ecosystem skills, and 36 MCP servers that take
builders from idea to shipped product on Solana.

There are several ways to contribute, from adding a repo to the catalog (5 min)
to creating a new journey skill (a few hours). This guide covers all of them.

## Table of Contents

- [Quick Reference](#quick-reference)
- [Development Setup](#development-setup)
- [Adding to Ecosystem Catalogs](#adding-to-ecosystem-catalogs)
- [Creating a Journey Skill](#creating-a-journey-skill)
- [Contributing Knowledge and Guides](#contributing-knowledge-and-guides)
- [Contributing to the CLI](#contributing-to-the-cli)
- [Supply-Chain Security](#supply-chain-security)
- [Reviewer Checklist](#reviewer-checklist)
- [Ripple Map](#ripple-map)

## Quick Reference

| I want to... | Where | Time |
|---|---|---|
| Add a repo | `cli/data/clonable-repos.json` | 5 min |
| Add a community skill | `cli/data/solana-skills.json` | 5 min |
| Add an MCP server | `cli/data/solana-mcps.json` | 5 min |
| Create a journey skill | `skills/<phase>/<name>/` | 2-4 hrs |
| Add a shared guide | `skills/data/guides/` | 1-2 hrs |
| Update Solana knowledge | `skills/data/solana-knowledge/` | 30 min |
| Add curated ideas | `skills/data/ideas/` | 30 min |
| Fix a CLI bug | `cli/` | varies |

## Development Setup

```bash
git clone https://github.com/sendaifun/solana-new-cli.git
cd solana-new-cli
pnpm install
pnpm dev          # run the CLI locally without building
pnpm build        # compile TypeScript (verify before PR)
```

**Conventions:**
- ESM-only — all imports use `.js` extensions (NodeNext module resolution)
- Strict TypeScript — strict mode, no implicit any
- No runtime deps — only devDependencies + convex
- All brand strings live in `cli/branding.ts` — never hardcode product names

## Adding to Ecosystem Catalogs

The three catalogs live in `cli/data/`. Each is a JSON file with a strict
schema. Follow the existing object shape exactly.

### Add a Repo

Edit `cli/data/clonable-repos.json`. Append to the `repos` array:

```json
{
  "id": "unique-slug",
  "repo": "owner/repo-name",
  "description": "What it does in one line",
  "category": "defi|scaffold|example|nft|token|framework|infrastructure|...",
  "keywords": ["relevant", "search", "terms"],
  "clone_command": "git clone https://github.com/owner/repo-name.git",
  "is_template": false
}
```

**Rules:**
- `id` must be unique across all repos
- `description` should be under 120 characters
- `clone_command` must be a single runnable command
- `is_template` = true if intended as a starting point (scaffolds, starters)

### Add a Community Skill

Edit `cli/data/solana-skills.json`. Append to the `community_skills` array:

```json
{
  "slug": "unique-slug",
  "title": "Human-Readable Title",
  "description": "What the skill teaches or enables in one line.",
  "url": "https://github.com/owner/repo/tree/v1.0.0/skill",
  "category": {
    "labelKey": "programs|defi|infrastructure|tooling|security|research|gaming|data"
  }
}
```

**Rules:**
- `url` should point to the skill content (SKILL.md or repo root)
- Prefer tagged URLs over branch URLs (see [Supply-Chain Security](#supply-chain-security))
- Hosted skill URLs are accepted (e.g., `https://agents.privy.io/skill.md`)
- Update `counts.community` in the same file

### Add an MCP Server

Edit `cli/data/solana-mcps.json`. Append to the `mcps` array:

```json
{
  "id": "unique-slug",
  "name": "Human-Readable Name",
  "repo": "owner/repo-name",
  "description": "What it does in one line",
  "category": "infrastructure|defi|wallet|data|security|tooling|trading|token-launch|multi-chain|dao",
  "setup_command": "how to install or connect",
  "url": "https://github.com/owner/repo-name",
  "keywords": ["relevant", "search", "terms"]
}
```

**Rules:**
- `setup_command` should be copy-pasteable and work without manual steps
- `keywords` should include the protocol name and what it does
- For HTTP MCPs, prefer `codex mcp add --transport http` format

## Creating a Journey Skill

Journey skills are the core product — 25 guided AI workflows organized into
four phases. Each skill interviews the user, never assumes.

### Phases

```
skills/
  idea/       ← discovery, research, validation, learning
  build/      ← scaffolding, implementation, review, security
  launch/     ← deployment, pitching, submissions, marketing
```

Pick the phase where your skill contributes most.

### File Structure

```
skills/<phase>/<skill-name>/
  SKILL.md                    # Required — the AI prompt
  references/                 # Required — supporting methodology docs
    framework.md
    checklist.md
    ...
  agents/                     # Required — Codex compatibility
    openai.yaml
```

Skills are auto-discovered — just put the folder in the right phase directory.
No registration or config changes needed.

### SKILL.md Format

Every SKILL.md starts with YAML frontmatter:

```yaml
---
name: skill-name
description: When to use this skill. Include trigger phrases so the SKILL_ROUTER can match it.
---
```

Then the skill body follows this structure:

1. **Preamble** — Telemetry bash block (copy from an existing skill)
2. **Telemetry prompt** — One-time opt-in (copy from existing skill)
3. **Description** — What the skill does
4. **Workflow** — Numbered steps the AI follows
5. **Non-negotiables** — Hard rules the AI must follow
6. **Phase handoff** — What context files to read/write

**Key principles:**
- Always interview the user first — never assume what they want
- Use `AskUserQuestion` for decisions
- Read `.superstack/idea-context.md` or `.superstack/build-context.md` if they
  exist, but proceed immediately if they don't
- Write context files so the next phase can pick up where you left off
- Reference shared guides in `skills/data/guides/` instead of duplicating content

### agents/openai.yaml

For Codex compatibility:

```yaml
interface:
  display_name: "Your Skill Name"
  short_description: "One-line description"
  default_prompt: "A natural prompt a user would type to trigger this skill."
```

### Routing

Add your skill's triggers to `skills/SKILL_ROUTER.md`:

```markdown
| "trigger phrase 1", "trigger phrase 2" | `skill-name` | When to use it |
```

### References

Reference docs go in `references/`. These are markdown files that the skill
loads when needed. Good reference docs:
- Define frameworks and scoring rubrics
- Provide checklists and decision trees
- Include code patterns and examples
- Are self-contained (the AI reads them during skill execution)

### Writing Tone

For launch-phase skills that generate output (pitch decks, social copy, video
text), follow `skills/launch/tone-guide.md`:
- Ask the user's preferred style before generating
- Default: lowercase, short sentences, specific data over adjectives
- Avoid AI slop: "cutting-edge", "rapidly evolving", "in today's landscape"

## Contributing Knowledge and Guides

### Solana Knowledge Base

Six docs in `skills/data/solana-knowledge/` covering all of solana.com. Skills
reference these automatically.

| Doc | Covers |
|-----|--------|
| `01-what-and-why-solana.md` | Ecosystem, adoption, metrics |
| `02-what-makes-solana-unique.md` | PoH, SVM, Rust, vs EVM |
| `03-contract-level.md` | Accounts, PDAs, CPIs, Anchor, fees |
| `04-protocols-and-sdks.md` | Protocols, SDKs, health verification |
| `05-app-layer-consumer.md` | Client SDKs, React, mobile |
| `06-opensource-research.md` | Courses, grants, hackathons, repos |

**When to update:** New protocol launches, major SDK changes, ecosystem shifts,
protocol exploits or shutdowns (mark as defunct — see PR #13 for Drift example).

**Protocol health:** Never hardcode protocol recommendations without noting that
they should be verified. Use the "Protocol Health Verification" section in
`04-protocols-and-sdks.md` as the central reference.

### Shared Guides

Actionable runbooks in `skills/data/guides/`:

- `rpc-wallet-guide.md` — RPC + wallet setup for dev and production
- `deploy-runbook.md` — Deploy devnet → mainnet with verification steps
- `security-checklist.md` — P0-P3 security audit with exact grep commands

Multiple skills reference these. If you update a guide, check which skills
use it.

### Curated Ideas

Two formats in `skills/data/ideas/`:

- **JSON** — Structured idea datasets with normalized schemas
  (`superteam-ideas.json`, `web3-ideas-combined.json`)
- **Markdown** — Raw source material from VCs and accelerators
  (`skills/data/guides/a16z-big-ideas-2025.md`, etc.)

Add new idea datasets when major reports drop (YC RFS, a16z annual, Superteam
bounties, hackathon themes). Normalize to the existing JSON schema.

## Contributing to the CLI

The CLI is a TypeScript application in `cli/`.

### Key Files

| File | Purpose | Edit frequency |
|------|---------|----------------|
| `branding.ts` | All brand strings — PRODUCT_NAME, BINARY_NAME, etc. | Rare |
| `index.ts` | Command dispatcher, help text, main entry | When adding commands |
| `init.ts` | Auto-install skills to ~/.claude/skills/ and ~/.codex/skills/ | When changing install |
| `telemetry.ts` | Local JSONL + Convex sync, privacy tiers | When adding events |
| `interactive-*.ts` | TUI flows for browsing catalogs | When improving UX |
| `data/*.json` | The three catalogs | When adding entries |

### Convex Backend

Telemetry and feedback live in `convex/`:

- `schema.ts` — `feedback` and `telemetry` tables
- `telemetry.ts` — `track()` mutation, `recentBySkill()` query
- `feedback.ts` — `submit()` mutation

Read `convex/_generated/ai/guidelines.md` before editing Convex code.

## Supply-Chain Security

Every catalog entry is a link that AI agents may install, execute, or trust
with API keys. Treat submissions as untrusted supply-chain inputs.

### Threat Model

- Submitter points to a mutable URL and swaps content after approval
- A skill asks agents to run remote code or install from moving targets
- A skill asks for seed phrases, private keys, or broad credentials
- A repository is later compromised and content changes silently
- A submission links to phishing, affiliate, or credential-harvesting flows
- A listed protocol becomes defunct or exploited

### URL Rules

**Prefer immutable URLs** for skills:

```
# Good
https://github.com/owner/repo/tree/v1.0.0/skill
https://agents.privy.io/skill.md  (protocol-controlled)

# Acceptable (for repos and MCPs that users install directly)
https://github.com/owner/repo

# Reject
https://github.com/owner/repo/tree/main/...  (mutable)
Any URL using @latest, moving branches, or mutable redirects
```

### Install Safety

- No `curl | sh`, `wget | sh`, or `bash <(curl` without separate review
- No `npx ...@latest` as primary install — pin to a version
- No `postinstall` scripts that fetch remote code
- No installs from GitHub branches — require tagged releases or npm versions

### Secret Handling

- Never request seed phrases or raw private keys
- Prefer wallet adapters, delegated auth, or scoped API keys
- If an API key is required, document what scopes are needed

### Protocol Health

Before approving protocol-specific submissions, verify:

| Signal | Healthy | Avoid |
|--------|---------|-------|
| TVL | >$5M, not declining >50% in 30d | <$5M or crashed |
| Volume | >$1M/24h | Dead |
| SDK | Published <6 months ago | Abandoned |
| Security | Audited, no unrecovered exploits | Unaudited or hacked |

See `skills/data/solana-knowledge/04-protocols-and-sdks.md` → "Protocol Health
Verification" for full criteria.

## Reviewer Checklist

Before merging any PR:

### For Catalog Entries
- [ ] JSON is valid and follows existing schema
- [ ] `id`/`slug` is unique — no duplicates
- [ ] Description is accurate, concise (<120 chars)
- [ ] Repository exists, is maintained, and has normal project signals
- [ ] No dangerous install patterns (see Install Safety)
- [ ] No seed phrase or private key requests
- [ ] Protocol health verified (for protocol-specific entries)
- [ ] Counts updated (see Ripple Map)

### For Journey Skills
- [ ] SKILL.md has valid frontmatter (name, description)
- [ ] Preamble telemetry block included
- [ ] Workflow interviews the user — doesn't assume
- [ ] References are self-contained markdown files
- [ ] `agents/openai.yaml` included with display_name, short_description
- [ ] Triggers added to `skills/SKILL_ROUTER.md`
- [ ] Phase handoff files read/written correctly
- [ ] No hardcoded protocol recommendations without health verification note

### For Knowledge/Guide Updates
- [ ] Changes are factual and sourced
- [ ] Defunct protocols marked clearly (see PR #13 for example)
- [ ] No stale protocol lists — use central reference in `04-protocols-and-sdks.md`
- [ ] Skills that reference the updated file still work correctly

## Ripple Map

When you change X, also update Y. This is the #1 cause of stale docs.

| Changed | Also update |
|---------|-------------|
| Add/remove **repo** | CLAUDE.md (3 count locations), README.md count |
| Add/remove **skill** | CLAUDE.md (3 count locations), README.md count, `solana-skills.json` community count, `competitive-landscape/SKILL.md` count |
| Add/remove **MCP** | CLAUDE.md (3 count locations), README.md count |
| Add/remove **journey skill** | `skills/SKILL_ROUTER.md`, `skills/README.md`, CLAUDE.md journey table |
| Update **protocol status** | All files referencing that protocol (grep first) |
| Update **shared guide** | Check which skills reference it |
| Change **branding** | Only edit `cli/branding.ts` — everything else reads from it |

**Count locations in CLAUDE.md** (all three must match):
1. Opening paragraph: "X repos, Y ecosystem skills, Z MCP servers"
2. "What's Indexed" table
3. File map comment: `solana-skills.json N skills (O official + P community)`

## PR Format

### For Catalog Additions

```
Type: repo | skill | mcp
Name: Human-readable name
Repo: https://github.com/owner/repo
Maintainer: @handle or team name
Category: which catalog category
Secrets required: none | list with scopes
```

### For Journey Skills

```
Phase: idea | build | launch
Name: skill-name
Trigger phrases: "phrase 1", "phrase 2"
Reads: idea-context.md | build-context.md | none
Writes: idea-context.md | build-context.md | none
References: list of reference docs
```

## Submitting Changes

1. Fork the repo and create a feature branch
2. Make your changes — keep PRs focused on one thing
3. Run `pnpm build` to verify TypeScript compiles
4. Follow the ripple map — update all cross-references
5. Open a PR with the metadata above

## Reporting Issues

Open an issue at [github.com/sendaifun/solana-new-cli/issues](https://github.com/sendaifun/solana-new-cli/issues).
