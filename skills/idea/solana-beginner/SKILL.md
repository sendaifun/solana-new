---
name: solana-beginner
description: Teach Solana fundamentals to developers new to the ecosystem. Use when a user says "what is Solana", "why Solana", "new to Solana", "explain Solana to me", "Solana basics", "EVM to Solana", "getting started with Solana", or "Solana fundamentals". Adapts to user's background — EVM devs, backend devs, or complete beginners.
---

## Preamble (run first)

```bash
_TEL_TIER=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"telemetryTier":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "off")
_TEL_TIER="${_TEL_TIER:-off}"
_TEL_START=$(date +%s)
_SESSION_ID="$$-$(date +%s)"
mkdir -p ~/.superstack
if [ "$_TEL_TIER" != "off" ]; then
echo '{"skill":"solana-beginner","phase":"idea","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
fi
```

> **Wrong skill?** See [SKILL_ROUTER.md](../../SKILL_ROUTER.md) for all available skills.

# Solana Foundation

Teach Solana fundamentals adaptively. This skill interviews the user about their background first, then teaches at the right level — whether they're an EVM developer, a backend engineer, or completely new to crypto.

## Overview

Not everyone arrives at Solana from the same place. An Ethereum dev needs to unlearn storage patterns and think in accounts. A backend dev needs to understand why blockchains matter before diving into PDAs. A complete beginner needs the "why" before the "how."

This skill adapts. It asks first, then teaches.

## Workflow

### Step 1: Interview the User

**Always start here. Never skip this step.**

Use the `AskUserQuestion` tool to determine the user's background. Ask:

1. **What's your development background?**
   - New to programming entirely
   - Backend/systems developer (Python, Go, Rust, Node.js)
   - Frontend developer (React, Vue, etc.)
   - EVM/Ethereum developer (Solidity, Hardhat, Foundry)
   - Other blockchain developer (Cosmos, Sui, Aptos)

2. **What are you trying to build?** (DeFi app, NFT project, payments, AI agent, just learning, etc.)

3. **How familiar are you with crypto concepts?** (wallets, transactions, smart contracts, tokens)

### Step 2: Read References Based on Background

Based on the user's answers, read the appropriate references:

- **EVM developers** → Start with `references/solana-vs-evm.md`
  - Focus on the account model vs storage model difference
  - Explain why programs are stateless and data lives in accounts
  - Cover PDAs, CPIs, and the instruction model
  - Highlight common gotchas (rent, account size, transaction limits)

- **New to crypto / complete beginners** → Start with `references/why-solana-for-builders.md`
  - Explain what a blockchain is and why it matters (briefly)
  - Focus on Solana's practical advantages: speed, cost, scale
  - Use concrete numbers: 400ms blocks, $0.00025 fees, 65k TPS
  - Make it tangible — compare to web2 experiences they know

- **Backend / systems developers** → Start with `references/why-solana-for-builders.md`, then `references/solana-vs-evm.md`
  - They'll appreciate the systems-level design of Solana
  - Emphasize: Rust-based, parallel execution (Sealevel), no EVM overhead
  - Compare to building APIs — programs are like microservices, accounts are like database rows

- **Other blockchain developers** → Start with `references/solana-vs-evm.md` (the model differences apply broadly)

### Step 3: Walk Through the Ecosystem

For all users, walk through relevant sections of `references/ecosystem-map.md`:

- If they want to build DeFi → highlight Jupiter, Orca, Drift, Kamino
- If they want NFTs → highlight Metaplex, Tensor, Magic Eden
- If they want payments → highlight Solana Pay, USDC, PayPal PYUSD
- If they want AI → highlight Solana Agent Kit, GOAT SDK
- If they're just exploring → give a high-level tour of all categories

### Step 4: Point to Knowledge Base

Direct users to the deeper knowledge base files for continued learning:

- `../../data/solana-knowledge/01-what-and-why-solana.md` — Deep dive on Solana's architecture
- `../../data/solana-knowledge/02-what-makes-solana-unique.md` — Technical differentiators

### Step 5: Direct to Next Skills

When the user is ready to move forward, point them to:

- `/find-next-crypto-idea` — If they need help figuring out what to build
- `/validate-idea` — If they have an idea and want to validate it
- `/scaffold-project` — If they're ready to start building
- `/build-with-claude` — If they want guided implementation help

## Non-Negotiables

1. **ALWAYS ask the user's background before teaching.** Never assume. Never dump a wall of information without knowing who you're talking to.

2. **Use the AskUserQuestion tool to interview.** Don't just ask rhetorically — use the tool so the user can respond and you can adapt.

3. **Adapt depth to the user's level.** Don't explain what a blockchain is to an EVM dev. Don't throw PDAs at someone who doesn't know what a wallet is.

4. **Be concrete.** Use real numbers:
   - 400ms block times (not "fast")
   - ~$0.00025 per transaction (not "cheap")
   - 65,000 TPS theoretical throughput (not "high throughput")
   - ~$1B+ DeFi TVL (not "significant TVL")
   - Sub-second finality (not "quick confirmation")

5. **Don't be a shill.** Acknowledge trade-offs honestly:
   - Solana has had outages (improving with Firedancer)
   - Rust has a steeper learning curve than Solidity
   - The account model is genuinely confusing at first
   - Not everything needs to be on-chain

6. **Direct users to next skills when ready.** This skill is a starting point, not a destination.

## Phase Handoff

This skill is **Phase 0 (Learn)**. It sits before the Idea phase in the journey.

When the user completes this skill, optionally write a knowledge level assessment to `.superstack/idea-context.md`:

```json
{
  "knowledge_level": "beginner" | "intermediate" | "advanced",
  "background": "evm" | "backend" | "frontend" | "beginner" | "other-chain",
  "interests": ["defi", "nfts", "payments", "ai", "gaming", "social"],
  "ready_for": "idea-phase" | "build-phase" | "needs-more-learning"
}
```

This context helps downstream skills (like `/find-next-crypto-idea` or `/scaffold-project`) calibrate their output to the user's level.

## Example Interactions

**EVM dev arrives:**
> "I've been building on Ethereum for 2 years, want to try Solana."
> → Ask what they've built on Ethereum, then focus on account model differences, Anchor vs Hardhat, and common EVM-dev gotchas.

**Complete beginner:**
> "I keep hearing about Solana, what is it?"
> → Start with why blockchains matter, then why Solana specifically, using real-world analogies and concrete numbers.

**Backend dev with a project idea:**
> "I'm a Go developer and I want to build a payments app on Solana."
> → Brief Solana overview emphasizing the systems design, then deep-dive on Solana Pay and USDC, then point to `/scaffold-project`.

## Telemetry (run last)

After the skill workflow completes (success, error, or abort), log the telemetry event.
Determine the outcome from the workflow result: `success` if completed normally, `error`
if it failed, `abort` if the user interrupted.

Run this bash:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
if [ "$_TEL_TIER" != "off" ]; then
echo '{"skill":"solana-beginner","phase":"idea","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
