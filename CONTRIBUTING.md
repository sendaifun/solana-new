# Contributing to superstack

We welcome contributions! Here's how to get started.

## Setup

```bash
git clone https://github.com/sendaifun/solana-new-cli.git
cd solana-new-cli
pnpm install
pnpm dev   # run the CLI without building
```

## Adding a New Skill

1. Create a folder in `skills/<phase>/<skill-name>/` (phase = `idea`, `build`, or `launch`)
2. Add a `SKILL.md` — this is the prompt the AI agent follows
3. Add a `references/` folder with any supporting docs the skill needs
4. Add `agents/openai.yaml` for Codex compatibility
5. Reference the shared routing table in your SKILL.md: `skills/SKILL_ROUTER.md`
6. Re-run setup to install your new skill locally and test it

## Adding a Repo, Skill, or MCP to the Catalog

Edit the relevant JSON file in `cli/data/`:
- `clonable-repos.json` — repos
- `solana-skills.json` — ecosystem skills
- `solana-mcps.json` — MCP servers

Follow the existing object shape. Keep entries alphabetically sorted.

## Code Conventions

- **ESM-only** — all imports use `.js` extensions (NodeNext module resolution)
- **Strict TypeScript** — strict mode, no implicit any
- **No runtime deps** — only devDependencies (tsx, typescript, @types/node) + convex
- **Branding** — all brand strings live in `cli/branding.ts`, change one file to rebrand

## Submitting Changes

1. Fork the repo and create a feature branch
2. Make your changes — keep PRs focused on one thing
3. Run `pnpm build` to verify TypeScript compiles cleanly
4. Open a PR with a clear description of what and why

## Reporting Issues

Open an issue at [github.com/sendaifun/solana-new-cli/issues](https://github.com/sendaifun/solana-new-cli/issues).
