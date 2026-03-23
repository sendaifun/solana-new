# solana.new

Discover the Solana ecosystem — 59 repos, 66 skills, and 49 MCP servers, searchable from your terminal.

## Quick Start

```bash
pnpm install && pnpm build
```

```bash
npx solana-new jupiter
npx solana-new search
npx solana-new repos
npx solana-new skills
npx solana-new mcps
```

## Commands

```
solana-new <query>                                Search anything — repos, skills, mcps
solana-new search                                 Interactive universal search
solana-new repos [--search <q>] [--category <c>]  Browse or filter repos
solana-new skills [--search <q>]                  Browse or filter skills
solana-new mcps [--search <q>]                    Browse or filter MCP servers
solana-new clone <repo-id> [--out <dir>]          Clone a repo

All commands support --agent for machine-readable output.
```

## What's Indexed

| Catalog | Count | Description |
|---------|-------|-------------|
| **Repos** | 59 | Solana official, Metaplex, Orca, Raydium, Jupiter, SendAI examples, community scaffolds |
| **Skills** | 66 | 14 official from solana.com + 52 community from sendaifun/skills and others |
| **MCPs** | 49 | Helius, Jupiter, Phantom, Orca, Chainstack, openSVM, security, DAO, multi-chain |

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
solana-new search --agent             # all 178+ items
solana-new repos --search defi --agent
solana-new skills --agent
solana-new mcps --agent
```

## Project Structure

```
cli/
  index.ts                  CLI entry point and command dispatcher
  banner.ts                 ASCII art banner
  interactive-search.ts     Repos TUI
  interactive-skills.ts     Skills TUI
  interactive-mcps.ts       MCPs TUI
  interactive-universal.ts  Universal search TUI
core/
  router/recommend-repo.ts  Repo search and filtering
shared/
  types/index.ts            TypeScript types
  constants/
    clonable-repos.json     59 repos catalog
    solana-skills.json      66 skills catalog
    solana-mcps.json        49 MCP servers catalog
```
