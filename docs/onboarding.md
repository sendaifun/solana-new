# Solana Ecosystem Onboarding — AI Agent Navigation Guide

> This skill teaches AI agents how to navigate the Solana skills, repos, and MCP servers catalog. Install it so your AI assistant knows what to recommend and when.

## How This Catalog Works

There are **three types of resources** in solana.new:

| Type | What it is | When to use |
|------|-----------|-------------|
| **Skills** | Knowledge files that teach AI agents about a protocol/tool | When you need to *write code* for a specific protocol |
| **Repos** | Clonable GitHub repositories with working code | When you need a *starting point* or *reference implementation* |
| **MCPs** | Model Context Protocol servers that give AI agents live tools | When you need *real-time data* or *on-chain actions* |

## Decision Tree: "I want to build X"

### DeFi / Trading

| Task | Skill to install | MCP to add | Repo to clone |
|------|-----------------|------------|---------------|
| Swap tokens | `jupiter-skill` | `dcspark-jupiter` or `araa47-jupiter-mcp` | `jupiter-nextjs-example` |
| Limit orders / DCA | `jupiter-skill` | `solana-limit-order-mcp` | — |
| Provide liquidity (concentrated) | `orca-skill` or `raydium-skill` | `demcp-orca-mcp` | `whirlpools` |
| Provide liquidity (constant product) | `raydium-skill` or `meteora-skill` | — | `raydium-cp-swap` |
| Lending / borrowing | `kamino-skill` or `lulo-skill` or `marginfi-skill` | — | — |
| Perps / leverage | `drift-skill` | `flash-trade-mcp` or `perp-cli-mcp` | — |
| Liquid staking | `sanctum-skill` | `marinade-finance-mcp-server` | `marinade-liquid-staking` |
| Prediction markets | `dflow-skill` or `pnp-markets-skill` | `dflow-mcp` | — |
| Token launch (pump.fun) | `pumpfun-skill` or `clawpump-skill` | `pump-mcp` | — |
| Market making | `manifest` | — | `sak-market-making` |
| Cross-chain bridge | `debridge-skill` | — | `sak-wormhole-agent` |
| Portfolio / vault management | `glam` | `dexter-mcp` | — |
| DeFi aggregator (60+ tools) | — | `dexter-mcp` | — |

### NFTs & Tokens

| Task | Skill | MCP | Repo |
|------|-------|-----|------|
| Mint NFTs (Core) | `metaplex-skill` | — | `mpl-candy-machine` |
| Compressed NFTs | `metaplex-community-skill` | — | `mpl-bubblegum`, `compressed-nfts` |
| Token-2022 / RWA / stablecoin | — | — | `mosaic` |
| Fractional ownership | — | — | `fraction` |

### AI Agents

| Task | Skill | MCP | Repo |
|------|-------|-----|------|
| Build a Solana AI agent (TypeScript) | `solana-agent-kit-skill` | `solana-agent-kit-adapter-mcp` | `solana-agent-kit` |
| Build a Solana AI agent (Python) | `solana-agent-kit-skill` | — | `solana-agent-kit-py` |
| Quick agent scaffold | — | — | `create-solana-agent` |
| Telegram bot agent | — | — | `sak-telegram-bot` |
| Discord bot agent | — | — | `sak-discord-bot` |
| Agent with Phantom wallet | `phantom-connect-skill` | `phantom-mcp-server` | `sak-phantom-agent` |
| Agent with Privy auth | — | `privy-mcp-server` | `sak-privy-agent` |
| Multi-agent workflows | — | — | `sak-langgraph` |
| Persistent memory agent | — | — | `sak-persistent-agent` |
| Lightweight / minimal agent | — | — | `sak-lite` |

### Frontend / dApps

| Task | Skill | MCP | Repo |
|------|-------|-----|------|
| Start a new dApp | `frontend-framework-kit` | — | `create-solana-dapp` or `dapp-scaffold` |
| Advanced Next.js scaffold | — | — | `builderz-scaffold` |
| Mobile app (React Native) | — | — | `solana-mobile-dapp-scaffold` |
| Mobile app (Kotlin) | — | — | `solana-kotlin-compose` |
| Wallet connection (Phantom) | `phantom-connect-skill` or `helius-phantom` | `phantom-mcp-server` | — |
| Payments / checkout | `payments` (official) | — | — |
| Blinks / Actions | — | — | `solana-actions`, `solana-action-express` |

### On-chain Programs

| Task | Skill | MCP | Repo |
|------|-------|-----|------|
| Write Anchor programs | `programs-anchor` (official) | `anchor-mcp` | `anchor-by-example`, `program-examples` |
| Write native (Pinocchio) programs | `programs-pinocchio` (official), `pinocchio-skill` | — | `pinocchio` |
| Write programs in Python | — | — | `seahorse` |
| Program examples | — | — | `program-examples` |
| IDL / client codegen | `idl-codegen` (official) | — | — |

### Infrastructure / Tooling

| Task | Skill | MCP | Repo |
|------|-------|-----|------|
| RPC / DAS API / webhooks | `helius-skill` or `quicknode-skill` | `helius-mcp` or `quicknode-mcp` | — |
| Price feeds / oracles | `pyth-skill` or `switchboard-skill` | — | `pyth-sdk` |
| ZK Compression | `light-protocol-skill` | — | `light-protocol` |
| Local testing (fast) | `surfpool-skill`, `testing` (official) | — | — |
| Token analytics / data | `coingecko-skill` | `opensvm-dexscreener-mcp`, `spice-mcp` | — |
| Multisig / governance | `squads-skill` | — | `squads-v4` |

### Security & Auditing

| Task | Skill | MCP | Repo |
|------|-------|-----|------|
| Security review | `security` (official), `vulnhunter-skill` | `solana-fender-mcp` | — |
| Deep code audit | `code-recon-skill` | — | — |
| Rug check / scam detection | — | `rug-check-mcp`, `aethercore-token-rugcheck` | — |
| Fuzzing | — | — | `trident` |

### Research & Data

| Task | Skill | MCP | Repo |
|------|-------|-----|------|
| Crypto Twitter intel | `ct-alpha` | — | `x-research-x402` |
| Smart money tracking | `metengine` | `memecoin-observatory-mcp` | — |
| Wallet analysis | `octav-api-skill` | `amoca-mcp`, `defi-analytics-mcp` | — |
| Transaction forensics | — | `solscan-mcp` | — |
| Reclaim rent / cleanup | — | `unclaimed-sol-mcp` | — |
| Solana forum / governance | — | `solana-forum-summarizer-mcp` | — |
| Prediction market data | — | — | `polymarket-indexer` |

### Gaming

| Task | Skill | MCP | Repo |
|------|-------|-----|------|
| Unity game on Solana | `magicblock-skill` | — | `solana-unity-sdk` |
| Game with ephemeral rollups | `magicblock-dev-skill` | — | — |
| C# / React Native game | `solana-game-skill` | — | — |

## Combining Skills for Common Workflows

### "Build a DeFi trading bot"
1. Install `jupiter-skill` (for swap logic)
2. Install `solana-agent-kit-skill` (for agent framework)
3. Add `helius-mcp` (for real-time data)
4. Clone `sak-market-making` or `create-solana-agent` as starting point

### "Build a token launchpad"
1. Install `pumpfun-skill` or `meteora-skill` (for bonding curves)
2. Install `frontend-framework-kit` (for the UI)
3. Clone `auto-fun` as reference

### "Audit my Solana program"
1. Install `security` (official checklist)
2. Install `vulnhunter-skill` (vulnerability patterns)
3. Install `code-recon-skill` (architectural analysis)
4. Add `solana-fender-mcp` (static analysis)

### "Build a mobile wallet app"
1. Install `phantom-connect-skill` (wallet integration)
2. Clone `solana-mobile-dapp-scaffold` (React Native)
3. Add `phantom-mcp-server` (wallet operations)

### "Build a DAO"
1. Install `squads-skill` (multisig)
2. Add `daocli` MCP (DAO operations)
3. Clone `squads-v4` or `spl-governance`

## Quick Reference: Skill Categories

| Category | Count | Examples |
|----------|-------|---------|
| **DeFi** | 15+ | Jupiter, Orca, Raydium, Drift, Kamino, Meteora, Sanctum |
| **Infrastructure** | 8+ | Helius, QuickNode, Light Protocol, Phantom, SVM |
| **Programs** | 5+ | Anchor, Pinocchio, Solana Kit, Security |
| **Agents** | 3+ | Solana Agent Kit, MagicBlock, Game |
| **Data** | 4+ | CoinGecko, CT Alpha, MetEngine, Octav |
| **Security** | 3+ | VulnHunter, Code Recon, Security Checklist |
| **Tooling** | 4+ | Surfpool, Example Skill, Solana Kit Migration |

## Tips for AI Agents

1. **Start with official skills** — They're maintained by Solana Foundation and always up to date
2. **Check MCP availability first** — If an MCP server exists for a protocol, prefer it over manual SDK code for queries and reads
3. **Combine skills + MCPs** — Skills teach you to write code; MCPs give you live tools. Use both.
4. **Use `--agent` flag** — When querying `solana-new` programmatically, always pass `--agent` for machine-readable output
5. **Clone repos for scaffolding** — Don't write boilerplate from scratch. Clone a template and modify it.
6. **Install multiple skills** — Complex projects need multiple skills. A DeFi app might need Jupiter + Helius + Phantom skills.
7. **When confused, search first** — Run `solana-new search --agent` or `solana-new <query> --agent` to find relevant resources
