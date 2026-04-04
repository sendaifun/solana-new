# Catalog Recommendations

Map the user's idea to specific repos, skills, and MCPs from the solana-new catalogs. Every entry below is verified against the actual catalog JSONs.

## DeFi & Trading

**Repos:** `anchor-by-example`, `jupiter-nextjs-example`, `whirlpools`, `raydium-cp-swap`, `marinade-liquid-staking`
**Skills:** `programs-anchor` (official), `security` (official), `testing` (official), `drift-skill`, `meteora-skill`, `solana-kit-skill`
**MCPs:** `helius-mcp`, `dcspark-jupiter`, `demcp-orca-mcp`, `opensvm-dexscreener-mcp`
**Tip:** Jupiter for swaps. Orca/Raydium for AMM. Always add Helius MCP for wallet data.

## AI Agents

**Repos:** `create-solana-agent` (npx), `solana-agent-kit`, `sak-telegram-bot`, `sak-discord-bot`, `sak-langgraph`, `sak-phantom-agent`
**Skills:** `solana-agent-kit-skill`, `phantom-connect-skill`, `helius-build-skill`
**MCPs:** `solana-mcp` (60+ actions), `helius-mcp`, `phantom-mcp-server`
**Tip:** `npx create-solana-agent` is the fastest start. Add Helius MCP for wallet data.

## On-chain Programs

**Repos:** `anchor-by-example`, `program-examples`, `pinocchio`, `seahorse`, `trident`
**Skills:** `programs-anchor` (official), `programs-pinocchio` (official), `testing` (official), `security` (official), `surfpool` (official), `surfpool-cheatcodes` (official), `pinocchio-skill`, `vulnhunter-skill`, `code-recon-skill`
**MCPs:** `solana-fender-mcp`, `anchor-mcp`, `helius-mcp`
**Tip:** Start with Anchor. Use Pinocchio only when you need sub-200 CU. Test with Surfpool, fuzz with Trident.

## Frontend & dApps

**Repos:** `create-solana-dapp` (npx), [official templates](https://solana.com/developers/templates), `builderz-scaffold`
**Skills:** `frontend-framework-kit` (official), `kit` (official), `kit-web3-interop` (official), `solana-kit-skill`, `phantom-connect-skill`
**MCPs:** `helius-mcp`, `phantom-mcp-server`
**Tip:** Browse starter templates at https://solana.com/developers/templates. `npx create-solana-dapp@latest` scaffolds Next.js, React+Vite, or Express. Use Wallet Standard for wallet connection.

## Mobile

**Repos:** `solana-mobile-dapp-scaffold`, `solana-kotlin-compose`, `solana-app-kit`
**Skills:** `phantom-connect-skill`
**Tip:** React Native starter for JS devs. Kotlin+Compose for Android-native.

## NFTs & Digital Assets

**Repos:** `mpl-candy-machine`, `mpl-bubblegum`, `compressed-nfts`, `mosaic`
**Skills:** `metaplex-skill`, `confidential-transfers` (official), `light-protocol-skill`
**MCPs:** `helius-mcp`
**Tip:** Core NFTs for standard collections. Compressed NFTs for scale (>10k items). `mosaic` for Token-2022 extensions.

## DePIN & Oracles

**Repos:** `depin-examples`, `pyth-sdk`, `switchboard-solana`, `light-protocol`
**Skills:** `pyth-skill`, `switchboard-skill`, `helius-build-skill`
**MCPs:** `helius-mcp`
**Tip:** Pyth for price feeds. Switchboard for VRF + custom feeds. Helius webhooks for device state.

## Infrastructure & Data

**Repos:** `helius-core-ai`, `light-protocol`, `wormhole-sdk`
**Skills:** `helius-build-skill`, `common-errors` (official), `compatibility-matrix` (official), `idl-codegen` (official)
**MCPs:** `helius-mcp` (60+ tools), `solscan-mcp`, `opensvm-dexscreener-mcp`, `opensvm-solana-mcp-server`
**Tip:** Helius = RPC + DAS + webhooks in one. Solscan for transaction forensics.

## Gaming

**Repos:** `solana-unity-sdk`, `mpl-candy-machine`
**Skills:** `metaplex-skill`, `solana-game-skill`
**Tip:** Unity SDK for game integration. Metaplex Core for in-game assets.

## Governance & DAOs

**Repos:** `squads-v4`, `spl-governance`
**Skills:** `programs-anchor` (official)
**Tip:** Squads for multisig. SPL Governance for full DAO frameworks.
