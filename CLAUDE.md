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
solana-new <query>                                # search anything — shorthand
solana-new search                                 # interactive universal search
solana-new repos [--search <q>] [--category <c>]  # browse or filter repos
solana-new skills [--search <q>]                  # browse or filter skills
solana-new mcps [--search <q>]                    # browse or filter MCPs
solana-new clone <repo-id> [--out <dir>]          # clone a repo
```

Add `--agent` to any command for machine-readable plaintext output (for Claude Code / Codex).

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
  banner.ts                 ASCII art banner
  interactive-search.ts     Repos + harnesses TUI
  interactive-skills.ts     Skills TUI
  interactive-mcps.ts       MCPs TUI
  interactive-universal.ts  Universal search TUI (combines all)
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
