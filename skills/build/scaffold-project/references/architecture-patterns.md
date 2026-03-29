# Architecture Patterns

Common Solana application architectures. Each links to a real starter repo from the solana-new catalog.

## Pattern 1: Next.js + Anchor dApp

**Repos:** `create-solana-dapp` (npx), `dapp-scaffold`, `builderz-scaffold`

```
my-dapp/
  app/                    # Next.js App Router
    layout.tsx            # Wallet provider (Wallet Standard)
    page.tsx              # Main UI
    api/                  # API routes (optional)
  programs/
    my-program/           # Anchor program
      src/lib.rs          # Program entry
      Cargo.toml
  tests/                  # Anchor tests (LiteSVM or Surfpool)
  package.json
  Anchor.toml
  CLAUDE.md               # Project context for Claude Code
  .claude/settings.json   # MCP configuration
```

Best for: DeFi apps, NFT platforms, any user-facing dApp.
**Skills:** `frontend-framework-kit` (official), `programs-anchor` (official)

## Pattern 2: Solana Agent Kit

**Repos:** `create-solana-agent` (npx), `solana-agent-kit`, `solana-app-kit`

```
my-agent/
  src/
    index.ts              # Agent entry point
    tools/                # Custom agent tools
    config.ts             # Wallet, RPC, API keys
  package.json
  CLAUDE.md
  .claude/settings.json
```

Best for: Trading bots, autonomous agents, AI-powered tools.
**Skills:** `solana-agent-kit-skill`
**MCPs:** `solana-mcp` (60+ actions), `helius-mcp`

## Pattern 3: Telegram/Discord Bot

**Repos:** `sak-telegram-bot`, `sak-discord-bot` (inside solana-agent-kit)

```
my-bot/
  src/
    bot.ts                # Bot framework setup
    commands/             # Slash commands
    handlers/             # Message handlers
    solana/               # Solana interaction layer
  package.json
  CLAUDE.md
  .claude/settings.json
```

Best for: Community tools, notification bots, social trading.
**Skills:** `solana-agent-kit-skill`

## Pattern 4: On-chain Program

**Repos:** `anchor-by-example`, `program-examples`, `pinocchio`

```
my-program/
  programs/
    my-program/
      src/
        lib.rs            # Program entry + declare_id!
        state.rs          # Account structures
        instructions/     # Instruction handlers (one per file)
        error.rs          # Custom errors
      Cargo.toml
  tests/                  # LiteSVM unit tests + Surfpool integration
  migrations/
  Anchor.toml
  CLAUDE.md
  .claude/settings.json
```

Best for: Protocol development, custom on-chain logic, DeFi primitives.
**Skills:** `programs-anchor` (official), `testing` (official), `security` (official)

## Pattern 5: Data Pipeline

**Repos:** `helius-core-ai`, `light-protocol`

```
my-pipeline/
  src/
    indexer.ts            # Transaction/account indexing
    processors/           # Data transformation
    api/                  # Query API
    storage/              # Database layer (Postgres, etc.)
  package.json
  CLAUDE.md
  .claude/settings.json
```

Best for: Analytics, monitoring, research tools, DePIN data.
**Skills:** `helius-build-skill`
**MCPs:** `helius-mcp` (webhooks, DAS API), `solscan-mcp`

## Pattern 6: Blinks / Actions

**Repos:** `solana-actions`, `solana-action-express`

```
my-action/
  src/
    actions/              # Action handlers (one per action)
    utils/                # Solana helpers
    index.ts              # Express/Hono server
  actions.json            # Action metadata
  package.json
  CLAUDE.md
```

Best for: Shareable transactions, social payments, gamified interactions.
**Skills:** `frontend-framework-kit` (official)

## Pattern 7: Mobile App

**Repos:** `solana-mobile-dapp-scaffold`, `solana-kotlin-compose`

```
my-mobile-app/
  src/
    screens/              # Screen components
    hooks/                # Solana hooks
    providers/            # Wallet + RPC providers
  App.tsx
  package.json
```

Best for: Mobile-first wallets, payment apps, consumer dApps.
**Skills:** `phantom-connect-skill`
