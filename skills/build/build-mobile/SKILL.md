---
name: build-mobile
description: Guide a developer through building a Solana mobile app. Use when a user says "build a mobile app", "React Native Solana", "Solana mobile", "mobile wallet", "mobile dApp", "Android Solana", or "iOS Solana". Reads build-context.json from a prior scaffold phase if available.
---

> **Wrong skill?** See [SKILL_ROUTER.md](../../SKILL_ROUTER.md) for all available skills.

# Build Mobile

## Overview

Guide the user through building a Solana mobile application using React Native or native Android (Kotlin). Covers wallet connection via Mobile Wallet Adapter (MWA), transaction signing, deep linking, and the unique UX challenges of mobile crypto apps. Leverages the Solana Mobile stack and Phantom Connect SDK.

## Workflow

1. Check for `.superstack/build-context.json`. If found, use stack decisions. If not, ask: what platform (React Native cross-platform, or native Android)? What wallet connection method (MWA, Phantom deep links, embedded wallet)?
2. Read [references/mobile-architecture.md](references/mobile-architecture.md) to select the right scaffold and SDK approach.
3. Read [references/mobile-wallet-patterns.md](references/mobile-wallet-patterns.md) for wallet connection and transaction signing patterns.
4. Implement in milestones:
   a. Scaffold the project from the appropriate mobile template
   b. Integrate wallet connection (MWA or Phantom Connect)
   c. Build the first transaction flow (send SOL, swap, mint — whatever the app does)
   d. Handle mobile-specific edge cases (network drops, backgrounding, timeout)
   e. Test on physical device — emulators miss real wallet interaction
5. Verify the full flow: install app, connect wallet, sign transaction, confirm on-chain.

## Non-Negotiables

- Always test on a physical device with a real wallet installed — emulators cannot test MWA or deep links.
- Handle network interruptions gracefully — mobile networks drop constantly.
- Never store private keys on device. Use Mobile Wallet Adapter or embedded wallet SDKs.
- Add loading states for every transaction — mobile users expect visual feedback.
- Test transaction signing timeout — wallets may not respond if the user switches apps.
- For React Native, pin `@solana/web3.js` and polyfill crypto modules (Buffer, crypto, etc.).

## Phase Handoff

This skill is **Phase 2 (Build)** in the Idea → Build → Launch journey.

**Reads**: `.superstack/build-context.json`
**Updates**: `.superstack/build-context.json` with:
- `mobile.platform`: "react-native" | "kotlin" | "swift"
- `mobile.wallet_method`: "mwa" | "phantom-deeplink" | "embedded"
- `mobile.scaffold_repo`: string (repo ID used)
- `mobile.physical_device_tested`: boolean

When updating, **deep-merge** — don't overwrite existing fields.

See `../../data/specs/phase-handoff.md` for the full JSON contract.

## Quick Start

```bash
# React Native (recommended):
npx react-native init MySolanaDapp
cd MySolanaDapp
npm install @solana-mobile/mobile-wallet-adapter-protocol @solana/web3.js

# Or clone the mobile scaffold:
git clone https://github.com/nickytonline/solana-mobile-dapp-scaffold.git
cd solana-mobile-dapp-scaffold && npm install
```

## Decision Points

- **Which wallet SDK?** See `../../data/decisions/wallet-selection.json` — Mobile Wallet Adapter for React Native, Kotlin SDK for native Android.
- **React Native vs Native?** React Native for faster development + code sharing with web. Native for best performance + platform features.
- **Which RPC?** See `../../data/decisions/rpc-selection.json` — mobile apps should use paid RPC (Helius) for reliability.

## Resources

### references/

- [references/mobile-architecture.md](references/mobile-architecture.md)
- [references/mobile-wallet-patterns.md](references/mobile-wallet-patterns.md)
