# Crypto UX Best Practices

Patterns that separate good web3 products from frustrating ones. Use this as a checklist when reviewing any crypto product.

## 1. Progressive Disclosure

Show value before requiring wallet connection. Let users browse, explore, and understand the product before asking for any commitment.

**Good**: Uniswap shows the swap interface and prices before wallet connect. Users see the value.
**Bad**: "Connect Wallet" is the entire landing page. User has no idea what they're connecting to.

## 2. Transaction Preview

Always show what will happen before the user signs. Include: what tokens move, estimated fees, price impact, and expected outcome.

**Good**: "You will swap 100 USDC for ~0.52 SOL. Fee: 0.000005 SOL. Price impact: 0.03%."
**Bad**: Wallet popup with raw instruction data and no context.

## 3. Confirmation States

Three clear states for every transaction: Pending (submitted, waiting), Confirmed (in block), Finalized (irreversible). Each with visual indicator and explorer link.

**Good**: Progress bar showing Submitted → Confirmed → Finalized with timestamps.
**Bad**: "Transaction sent." Then nothing. User refreshes page hoping for an update.

## 4. Error Recovery

When transactions fail, explain why and what to try. Never leave users at a dead end.

**Good**: "Transaction failed: slippage exceeded. The price moved 2% while you were signing. [Retry with 3% slippage]."
**Bad**: "Transaction failed." Full stop. No explanation, no retry, no help.

## 5. Fee Transparency

Show estimated fees in both token and USD BEFORE the user initiates the transaction. Warn if balance is too low.

**Good**: "Estimated network fee: 0.000005 SOL (~$0.001). Priority fee: 0.0001 SOL (~$0.02)."
**Bad**: Fee only visible in the wallet popup, or discovered after a failed transaction.

## 6. Address Handling

Support domain resolution (SNS .sol names), show truncated addresses with full address on hover/click, validate format in real-time, and show recent addresses.

**Good**: Input accepts "alice.sol" or full address, validates in real-time, shows recent recipients.
**Bad**: Raw text input with no validation. User discovers typo after sending funds.

## 7. Mobile-First Design

Over half of crypto users are mobile. Use Mobile Wallet Adapter, ensure responsive design, test with real mobile wallets (Phantom, Solflare, Backpack).

**Good**: Full functionality on mobile with smooth wallet adapter integration.
**Bad**: "Best viewed on desktop" banner, or wallet connection that requires copy-pasting URLs.

## 8. Dual Onboarding Ramp

Support both crypto-native users (fast path, assume knowledge) and newcomers (embedded wallets via Privy/Dynamic, explanatory tooltips, fiat on-ramp).

**Good**: "Connect existing wallet" OR "Create account with email" — both paths to the same product.
**Bad**: Only Phantom wallet supported. New users must figure out wallets on their own.

## 9. Social Proof & Trust Signals

Show evidence that other people use this: TVL, volume, user count, testimonials, audits, backed-by logos. Build trust before asking for money.

**Good**: "Trusted by 12,000 traders. $5M daily volume. Audited by OtterSec."
**Bad**: No social proof anywhere. User has to take a leap of faith with their funds.

## 10. Share-ability & Deep Links

URLs should reflect app state so users can share specific configurations, pools, tokens, or positions. Support deep links for shareable state.

**Good**: `app.com/swap?input=USDC&output=SOL&amount=100` opens exactly that swap.
**Bad**: Every link goes to the homepage. Users can't share what they found.

## 11. Notifications & Alerts

Keep users informed about things that matter: transaction results, position changes, price alerts, liquidation warnings. Email, push, and in-app channels.

**Good**: Push notification when a limit order fills, email when a position approaches liquidation.
**Bad**: User has to manually check the app to see if anything changed.

## 12. Empty States & Zero States

What does the product look like with no data? New user, zero balance, no transactions. These states should guide, not confuse.

**Good**: Empty state shows "Here's how to get started" with clear CTA.
**Bad**: Blank page or "No data" with no guidance on what to do next.

## 13. Transaction History & Activity

Users need to see what they've done: past transactions, positions, PnL. Linked to block explorers for verification.

**Good**: Clean transaction history with human-readable descriptions, timestamps, and explorer links.
**Bad**: No transaction history, or raw transaction hashes with no context.

## Checklist Summary

When reviewing a product, check each pattern:
- [ ] Progressive disclosure (value before wallet)
- [ ] Transaction preview (clear before signing)
- [ ] Confirmation states (pending/confirmed/finalized)
- [ ] Error recovery (why + what to try + retry)
- [ ] Fee transparency (shown before action)
- [ ] Address handling (validation + resolution)
- [ ] Mobile-first (responsive + wallet adapter)
- [ ] Dual onboarding (crypto-native + newcomer)
- [ ] Social proof (trust signals visible)
- [ ] Share-ability (deep links)
- [ ] Notifications (relevant alerts)
- [ ] Empty states (guided, not blank)
- [ ] Transaction history (readable + linked)
