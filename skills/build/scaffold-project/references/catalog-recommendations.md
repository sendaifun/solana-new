# Catalog Recommendations

Map the user's idea to specific repos, skills, and MCPs from the solana-new catalogs. Every entry below is verified against the actual catalog JSONs.

> **Protocol selection**: Before picking repos and skills, identify which protocol(s) to integrate with using `data/solana-knowledge/04-protocols-and-sdks.md` → Decision Quick Reference. Verify each protocol's health before committing — see "Protocol Health Verification" in the same file.

## DeFi & Trading

**Repos:** `anchor-by-example`, `jupiter-nextjs-example`, `whirlpools`, `raydium-cp-swap`, `marinade-liquid-staking`
**Skills:** `programs-anchor` (official), `security` (official), `testing` (official), `meteora-skill`, `solana-kit-skill`
**MCPs:** `helius-mcp`, `dcspark-jupiter`, `demcp-orca-mcp`, `opensvm-dexscreener-mcp`
**Tip:** Jupiter for swaps. Orca/Raydium for AMM. Always add Helius MCP for wallet data. For protocol-specific skills, verify the protocol is still active before installing.

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
**Tip:** Browse starter templates at https://solana.com/developers/templates. `npm create solana-dapp@latest` scaffolds the current official templates, including Next.js, React + Vite, and Solana Mobile Expo/React Native templates via `--template`. Express is not a current official default option. Use Wallet Standard for wallet connection on web.

## Mobile

**Repos/Templates:** `create-solana-dapp` mobile templates (`gh:solana-foundation/templates/mobile/kit-expo-minimal`, `gh:solana-foundation/templates/mobile/kit-expo-uniwind`, `gh:solana-foundation/templates/mobile/web3js-expo`, `gh:solana-foundation/templates/mobile/web3js-expo-minimal`, `gh:solana-foundation/templates/mobile/web3js-expo-paper`), `react-native-samples`, `solana-app-kit`
**Skills:** `phantom-connect-skill`
**Tip:** For React Native, prefer the current official Solana Mobile path: generate an Expo/React Native app with `create-solana-dapp` and choose an official mobile template. Use `react-native-samples` for current patterns. For native Android, follow the current Solana Mobile Kotlin installation/setup/quickstart docs rather than older standalone scaffold repos.

## NFTs & Digital Assets

**Repos:** `mpl-candy-machine`, `mpl-bubblegum`, `compressed-nfts`, `mosaic`
**Skills:** `metaplex-skill`, `confidential-transfers` (official), `light-protocol-skill`
**MCPs:** `helius-mcp`
**Tip:** Use Umi-based Metaplex clients. For new standard assets/collections, use `@metaplex-foundation/umi` + `@metaplex-foundation/mpl-core`. For Token Metadata or pNFT-compatible flows, use `@metaplex-foundation/umi` + `@metaplex-foundation/mpl-token-metadata`. For compressed NFTs at scale, use `@metaplex-foundation/umi` + `@metaplex-foundation/mpl-bubblegum`. Use Candy Machine for collection mint/drop flows, not as the default asset SDK. `mosaic` remains relevant for Token-2022 extensions.

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
**Tip:** Use Unity SDK for game integration. For in-game assets, prefer `@metaplex-foundation/umi` + `@metaplex-foundation/mpl-core`; use Candy Machine only if you need a public mint/drop flow.

## Sources

- create-solana-dapp README: https://github.com/solana-foundation/create-solana-dapp
- Official template inventory: https://github.com/solana-foundation/templates/blob/main/TEMPLATES.md
- Solana developer templates: https://solana.com/developers/templates
- Solana Mobile React Native project creation docs: https://docs.solanamobile.com/get-started/react-native/create-solana-mobile-app
- Solana Mobile React Native samples: https://github.com/solana-mobile/react-native-samples
- Metaplex JS deprecated/archived: https://github.com/metaplex-foundation/js and https://www.npmjs.com/package/@metaplex-foundation/js
- Metaplex Core JS docs: https://www.metaplex.com/docs/smart-contracts/core/sdk/javascript
- Metaplex Bubblegum JS docs: https://developers.metaplex.com/bubblegum/sdk/javascript
- Umi repo: https://github.com/metaplex-foundation/umi

## Governance & DAOs

**Repos:** `squads-v4`, `spl-governance`
**Skills:** `programs-anchor` (official)
**Tip:** Squads for multisig. SPL Governance for full DAO frameworks.
