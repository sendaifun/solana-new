---
name: verify-humanity-poh
description: Integrate Proof of Human (POH) API to distinguish real users from bots in any Solana app. Use when a user says "filter bots", "verify humans", "sybil protection", "airdrop eligibility", "bot detection", "proof of human", "POH", "verify wallet is human", "gate my airdrop", "DAO sybil resistance", "check if wallet is real", "human verification", or "anti-bot". Works for airdrops, DAO voting, NFT allowlists, and API gating.
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
_TEL_EVENT='{"skill":"verify-humanity-poh","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' 
echo "$_TEL_EVENT" >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
_CONVEX_URL=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
[ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" -H "Content-Type: application/json" -d '{"path":"telemetry:track","args":{"skill":"verify-humanity-poh","phase":"build","status":"success","version":"0.2.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' >/dev/null 2>&1 &
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

# Verify Wallet Humanity with POH

## Overview

Integrate [Proof of Human](https://proofofhuman.ge) (POH) — a decentralised, AI-powered API that verifies whether a Solana or EVM wallet is controlled by a real person or an automated bot.

POH runs 120+ detection methods in parallel (on-chain balances, staking, RWA holdings, social graphs, identity APIs, Galxe, Farcaster, ENS, web3.bio) and returns an AI verdict with confidence score. No KYC. No captcha. No central authority.

**Devnet endpoint:** `https://proofofhuman.ge/devnet/checker`  
**Free tier:** 100 scans per wallet, no API key required (use `walletAddress` field instead)

## Use Case Decision (Step 0)

Ask the user what they're building before writing any code:

- **Airdrop / token distribution** → scan recipient list, filter out `AI` verdicts, optionally set confidence threshold
- **DAO / governance gate** → on-submit check before recording vote
- **NFT allowlist / mint guard** → pre-mint eligibility check
- **API / protocol rate limiting** → per-request human gate using API key
- **General sybil resistance** → batch scan existing wallet list

If the use case is unclear, ask: "Are you filtering a list of wallets, gating live interactions, or checking individual wallets on demand?"

## Workflow

1. Check `.superstack/build-context.md` for stack and language context. If missing, ask: TypeScript or Rust? Frontend-only or program-level gating?

2. Read [references/poh-api-reference.md](references/poh-api-reference.md) — covers all endpoints, request/response schemas, error codes, and verdict interpretation.

3. Read [references/integration-patterns.md](references/integration-patterns.md) — pick the pattern that matches the use case: single-wallet check, bulk CSV scan, async polling, or server-side middleware.

4. **Get API access:**
   - For testing: use `walletAddress` field (free tier, 100 scans)
   - For production: connect wallet at `https://proofofhuman.ge/` → Profile → copy API key
   - For devnet/testing: connect wallet at `https://proofofhuman.ge/devnet/` → Profile → copy API key
   - Devnet faucet: `POST https://proofofhuman.ge/devnet/profile/faucet` (10 000 POH test tokens)

5. **Implement the integration** following the chosen pattern. Key decision points:
   - Single address → synchronous response, use `result` directly
   - Multiple addresses → async job, poll `GET /checker/job/:jobId` until `status: "done"`
   - What to do with `UNCERTAIN` verdict — prompt user to add more signals, or apply a confidence threshold (e.g. require `confidence > 0.7` for `HUMAN` to pass)

6. **Test on devnet** using the scanner at `https://proofofhuman.ge/devnet/`:
   - Paste a known-bot address and verify it returns `AI` or `UNCERTAIN`
   - Paste your own wallet and verify it returns `HUMAN`
   - Try a fresh wallet with no history — expect `UNCERTAIN` with low confidence

7. Write `.superstack/build-context.md` with the integration details.

## Non-Negotiables

- **Never block users on `UNCERTAIN`.** It means insufficient signal, not "is a bot". Offer a path: try again later, add more on-chain history, or apply a lower confidence threshold with manual review.
- **Never store raw verdict responses** beyond what your use case requires — treat them like any user data.
- **Always handle network errors gracefully.** POH is an external API. If it times out or returns 5xx, fail open (allow the user) or queue for retry — never hard-block on infrastructure failure.
- **Respect the free tier.** 100 scans per connected wallet. For bulk use (>100 addresses), get an API key or use `txHash` with a POH token burn.
- **Cache verdicts client-side** for at least 5 minutes per address. Don't re-scan the same wallet on every page load.
- **Check the `confidence` field**, not just `verdict`. A `HUMAN` at 0.51 confidence is very different from `HUMAN` at 0.93.

## Decision Points

- **Threshold:** What confidence level do you require? Recommended: `>= 0.7` for `HUMAN` to pass, `<= 0.4` for definitive rejection.
- **`UNCERTAIN` policy:** Pass with warning? Manual review queue? Retry after delay?
- **Bulk vs live:** Airdrops are usually bulk (CSV). Live gating needs single-address synchronous calls.
- **Chain:** POH supports EVM (32 chains) + Solana. Specify `chainIds` to filter EVM methods.
- **AI verdict timing:** The `brainKey` from `/checker` lets you poll for the async AI verdict separately. For time-sensitive flows, use the synchronous signal results and poll the AI verdict in the background.

## Quick Start

```bash
# Single wallet check — no API key needed for testing
curl -X POST https://proofofhuman.ge/devnet/checker \
  -H "Content-Type: application/json" \
  -d '{"input": "YourSolanaWalletBase58Here", "walletAddress": "YourSolanaWalletBase58Here"}'

# Response:
# {
#   "result": [...],               // per-method pass/fail
#   "count": 4,                    // signals passed
#   "brainKey": "abc123",          // poll for AI verdict
#   "freeScansLeft": 99
# }

# Poll AI verdict
curl https://proofofhuman.ge/devnet/checker/brain/abc123
# → { "status": "done", "verdict": "HUMAN", "confidence": 0.87, "reasoning": "..." }
```

```typescript
// TypeScript — single wallet gate
async function isHuman(walletAddress: string): Promise<boolean> {
  const res = await fetch('https://proofofhuman.ge/devnet/checker', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: walletAddress, walletAddress }),
  });
  const { brainKey } = await res.json();

  // Poll for AI verdict (usually ready in 2-5s)
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const verdict = await fetch(
      `https://proofofhuman.ge/devnet/checker/brain/${brainKey}`
    ).then(r => r.json());
    if (verdict.status === 'done') {
      return verdict.verdict === 'HUMAN' && verdict.confidence >= 0.7;
    }
  }
  return true; // timeout — fail open (never block on infrastructure failure)
}
```

## Resources

### references/

- [references/poh-api-reference.md](references/poh-api-reference.md) — full endpoint docs, schemas, error codes
- [references/integration-patterns.md](references/integration-patterns.md) — airdrop filter, DAO gate, middleware, bulk scan patterns

## Phase Handoff

This skill is **Phase 2 (Build)** in the Idea → Build → Launch journey.

**Reads**: `.superstack/build-context.md`
**Writes/Updates**: `.superstack/build-context.md` with:
- `poh.integration_type`: "single-check" | "bulk-scan" | "middleware" | "program-level"
- `poh.use_case`: "airdrop" | "dao-gate" | "nft-allowlist" | "api-gate" | "general"
- `poh.confidence_threshold`: number (e.g. 0.7)
- `poh.uncertain_policy`: "fail-open" | "manual-review" | "retry"
- `poh.api_key_configured`: boolean

When updating, **deep-merge** — don't overwrite existing fields.

See `../../data/specs/phase-handoff.md` for the full JSON contract.

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
echo '{"skill":"verify-humanity-poh","phase":"build","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
