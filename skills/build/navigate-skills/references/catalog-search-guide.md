# Catalog Search Guide

## File Locations

After setup, catalog data is at:
```
~/.claude/skills/data/catalogs/clonable-repos.json
~/.claude/skills/data/catalogs/solana-skills.json
~/.claude/skills/data/catalogs/solana-mcps.json
```

## Repo Categories
- **DeFi**: AMMs, lending, vaults, perpetuals, yield
- **Agents**: AI agents, autonomous trading, wallet agents
- **Frontend**: dApp templates, wallet UIs, explorer UIs
- **Programs**: Anchor programs, on-chain logic, PDAs
- **Infrastructure**: RPCs, validators, indexers, oracles
- **Data**: Analytics, dashboards, transaction parsing
- **Gaming**: On-chain games, NFT games, game SDKs
- **Payments**: Payment rails, point-of-sale, invoicing

## Skill Categories
- **Official** (Solana Foundation): Core development patterns
- **Community**: Protocol-specific (Jupiter, Orca, Helius, etc.)

## MCP Categories
- **RPC & Data**: Helius, Triton, QuickNode
- **DeFi**: Jupiter, Raydium, Orca integrations
- **Token**: Token metadata, minting, distribution
- **NFT**: Metaplex, collection management
- **Wallet**: Wallet adapters, transaction building

## Matching Strategy

1. Extract keywords from user's question
2. Search across all three catalogs
3. Prioritize: exact keyword match > category match > description match
4. Return top 3-5 results with actionable next steps
