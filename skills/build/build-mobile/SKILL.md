---
name: build-mobile
description: Guide a developer through building a Solana mobile app. Use when a user says "build a mobile app", "React Native Solana", "Solana mobile", "mobile wallet", "mobile dApp", "Android Solana", or "iOS Solana". Reads build-context.md from a prior scaffold phase if available.
---

## Preamble (run first)

```bash
_TEL_TIER=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"telemetryTier": *"[^"]*"' | head -1 | sed 's/.*"telemetryTier": *"//;s/"$//'  || echo "anonymous")
_TEL_TIER="${_TEL_TIER:-anonymous}"
_TEL_PROMPTED=$([ -f ~/.superstack/.telemetry-prompted ] && echo "yes" || echo "no")
_TEL_START=$(date +%s)
_SESSION_ID="$$-$(date +%s)"
mkdir -p ~/.superstack
echo "TELEMETRY: $_TEL_TIER"
echo "TEL_PROMPTED: $_TEL_PROMPTED"
if [ "$_TEL_TIER" != "off" ]; then
_TEL_EVENT='{"skill":"build-mobile","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' 
echo "$_TEL_EVENT" >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
_CONVEX_URL=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
[ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" -H "Content-Type: application/json" -d '{"path":"telemetry:track","args":{"skill":"build-mobile","phase":"build","status":"success","version":"0.2.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' >/dev/null 2>&1 &
true
fi
```

If `TEL_PROMPTED` is `no`: Before starting the skill workflow, ask the user about telemetry.
Use AskUserQuestion:

> Help superstack get better! We track which skills get used and how long they take —
> no code, no file paths, no PII. Change anytime in `~/.superstack/config.json`.

Options:
- A) Sure, help superstack improve (anonymous)
- B) No thanks

If A: run this bash:
```bash
echo '{"telemetryTier":"anonymous"}' > ~/.superstack/config.json
_TEL_TIER="anonymous"
touch ~/.superstack/.telemetry-prompted
```

If B: run this bash:
```bash
echo '{"telemetryTier":"off"}' > ~/.superstack/config.json
_TEL_TIER="off"
touch ~/.superstack/.telemetry-prompted
```

This only happens once. If `TEL_PROMPTED` is `yes`, skip this entirely and proceed to the skill workflow.

> **Wrong skill?** See [SKILL_ROUTER.md](../../SKILL_ROUTER.md) for all available skills.

# Build Mobile

## Overview

Guide the user through building a Solana mobile application using React Native or native Android (Kotlin). Covers wallet connection via Mobile Wallet Adapter (MWA), transaction signing, deep linking, and the unique UX challenges of mobile crypto apps. Leverages the Solana Mobile stack and Phantom Connect SDK.

## Workflow

1. Check for `.superstack/build-context.md`. If found, use stack decisions. If not, ask: what platform (React Native cross-platform, or native Android)? What wallet connection method (MWA, Phantom deep links, embedded wallet)? Write `.superstack/build-context.md` with the context gathered so future skills can use it.
2. Read [references/mobile-architecture.md](references/mobile-architecture.md) to select the right scaffold and SDK approach.
3. Read [references/mobile-wallet-patterns.md](references/mobile-wallet-patterns.md) for wallet connection and transaction signing patterns.
4. Implement in milestones:
   a. Scaffold the project from the appropriate mobile template
   b. Integrate wallet connection (MWA, Phantom mobile flow, or embedded wallet)
   c. Build the first transaction flow (send SOL, swap, mint — whatever the app does)
   d. Handle mobile-specific edge cases (network drops, backgrounding, timeout)
   e. Test on Android emulator or device during development; use Mock MWA Wallet for development wallet flows
5. Verify the full flow before signoff: install app, connect wallet, sign transaction, confirm on-chain, then repeat on a physical device with a real wallet installed.

## Non-Negotiables

- Do development testing on any Android device or emulator; use Mock MWA Wallet when testing MWA flows during development.
- Always do final end-to-end verification on a physical device with a real wallet installed before calling the mobile flow production-ready.
- Handle network interruptions gracefully — mobile networks drop constantly.
- Never store private keys on device. Use Mobile Wallet Adapter, secure embedded wallet SDKs, or wallet-provider flows designed for mobile apps.
- Add loading states for every transaction — mobile users expect visual feedback.
- Test transaction signing timeout and app-switching behavior — wallets may not respond if the user backgrounds the app or switches apps.
- For React Native, follow the current Solana Mobile installation flow: use a custom Expo development build, import crypto polyfills before Solana libraries, and prefer current Solana Mobile sample patterns over older manual Buffer/url polyfill recipes.

## Phase Handoff

This skill is **Phase 2 (Build)** in the Idea → Build → Launch journey.

**Reads**: `.superstack/build-context.md`
**Writes/Updates**: `.superstack/build-context.md` (creates if missing) with:
- `mobile.platform`: "react-native" | "kotlin" | "swift"
- `mobile.wallet_method`: "mwa" | "phantom-deeplink" | "embedded"
- `mobile.scaffold_repo`: string (repo ID used)
- `mobile.physical_device_tested`: boolean

When updating, **deep-merge** — don't overwrite existing fields.

See `../../data/specs/phase-handoff.md` for the full JSON contract.

## Quick Start

```bash
# Recommended: start from the current Solana Mobile React Native template
npm create solana-dapp@latest

# Choose a Solana Mobile / React Native template, then enter the project
cd MySolanaDapp

# Use the dependency set that matches your chosen template/sample
# Official Solana Mobile React Native docs commonly show:
# npm install @wallet-ui/react-native-web3js react-native-quick-crypto @solana/web3.js expo-dev-client
#
# Newer Kit-based samples (for example skr-staking) use:
# npm install @wallet-ui/react-native-kit react-native-quick-crypto @solana/kit expo-dev-client
#
# Prefer the template/sample's exact dependency set and avoid mixing web3.js and Kit stacks casually.

# If using Expo Router, create the current polyfill entrypoints
# polyfill.js
#   import { install } from 'react-native-quick-crypto';
#   install();
#
# index.js
#   import './polyfill';
#   import 'expo-router/entry';

# Build a custom Android development build (Expo Go is not enough for MWA)
npx expo run:android
```

## Decision Points

- **Which wallet SDK?** For React Native, prefer the current Solana Mobile / wallet-ui React Native integration patterns. For native Android, use Mobile Wallet Adapter directly. Use Phantom-specific mobile SDK or deep-link flows only when they fit the product requirements. For embedded-wallet / social-login mobile UX, use Dynamic's React Native extension (`@dynamic-labs/react-native-extension`) — see `references/mobile-wallet-patterns.md`.
- **React Native vs Native?** React Native for faster development + code sharing with web. Native for best performance + platform features.
- **Which RPC?** Mobile apps should use paid RPC (Helius) for reliability.

## Resources

### references/

- [references/mobile-architecture.md](references/mobile-architecture.md)
- [references/mobile-wallet-patterns.md](references/mobile-wallet-patterns.md)

### current external references

- [Solana Mobile Docs — Create a Project](https://docs.solanamobile.com/get-started/react-native/create-solana-mobile-app)
- [Solana Mobile Docs — Installation](https://docs.solanamobile.com/get-started/react-native/installation)
- [Solana Mobile Docs — Test with any Android device](https://docs.solanamobile.com/recipes/general/test-with-any-android-device)
- [solana-mobile/react-native-samples](https://github.com/solana-mobile/react-native-samples)

## Telemetry (run last)

After the skill workflow completes (success, error, or abort), log the telemetry event.
Determine the outcome from the workflow result: `success` if completed normally, `error`
if it failed, `abort` if the user interrupted.

Run this bash:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - ${_TEL_START:-$_TEL_END} ))
_TEL_TIER=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"telemetryTier": *"[^"]*"' | head -1 | sed 's/.*"telemetryTier": *"//;s/"$//' || echo "anonymous")
if [ "$_TEL_TIER" != "off" ]; then
echo '{"skill":"build-mobile","phase":"build","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
