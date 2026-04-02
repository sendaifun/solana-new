# Common Crypto Product Sins

Patterns that kill crypto products. If you spot these, call them out immediately.

## 1. Ornamental Blockchain

**What it is**: Adding crypto to a product that works perfectly fine without it. The blockchain is decorative, not functional.

**How to detect it**: Ask "what breaks if we replace the chain with a database?" If nothing breaks, it's ornamental.

**What good looks like**: The product is impossible or meaningfully worse without blockchain — permissionless access, trustless settlement, programmable money, composability with other protocols.

## 2. Token-First Thinking

**What it is**: Designing the tokenomics before the product. The token exists to raise money, not to serve users.

**How to detect it**: Whitepaper has 10 pages on token distribution, 1 paragraph on user value. Token launched before MVP.

**What good looks like**: Product works without a token. Token is added later to align incentives, not to fundraise.

## 3. Wallet Gate

**What it is**: Requiring wallet connection before showing any value. User can't even see what the product does without signing in.

**How to detect it**: Visit the app. Is the first thing you see a "Connect Wallet" button with nothing behind it?

**What good looks like**: Progressive disclosure — show value first, require wallet only when the user wants to transact.

## 4. Jargon Overload

**What it is**: Homepage reads like a whitepaper. APY, TVL, LP, MEV, IL all on the landing page. Assumes everyone speaks DeFi.

**How to detect it**: Show the landing page to a non-crypto friend. Count how many terms they don't understand.

**What good looks like**: Plain language on the landing page. Technical terms introduced progressively with explanations. "Earn 8% on your USDC" not "Provide liquidity to the USDC-SOL concentrated AMM pool."

## 5. No Retention Loop

**What it is**: Users do one transaction and never return. There's no reason to come back.

**How to detect it**: What triggers a user to open the app on day 2? Day 7? Day 30? If there's no answer, there's no loop.

**What good looks like**: Built-in reasons to return — active positions to manage, notifications about opportunities, social features, streaks, or evolving state that requires attention.

## 6. Copy-Paste Protocol

**What it is**: Fork of Uniswap/Aave/Compound with a new name, new token, zero differentiation. "It's like [X] but on Solana."

**How to detect it**: Can you describe the product without referencing what it's forked from? Is there a single feature the original doesn't have?

**What good looks like**: A fork with genuine innovation — new mechanism design, different target user, novel feature that justifies existence.

## 7. Phantom Users

**What it is**: "10,000 wallets connected" but 50 real humans. Metrics inflated by airdrops, bots, or sybil farming.

**How to detect it**: Compare unique wallets to daily active transactors. Look at transaction diversity — are the same few wallets doing everything? Check if activity drops 90% after airdrop.

**What good looks like**: Honest metrics. "500 daily active users who each make 3+ transactions" is better than "50k wallets."

## 8. Bridge to Nowhere

**What it is**: Impressive technical achievement with no market or distribution plan. "We built the fastest ZK prover" — great, who's buying?

**How to detect it**: Ask "who pays for this and why?" If the answer involves grants or "eventually developers will build on it," it's a bridge to nowhere.

**What good looks like**: Tech built for a specific user with a clear path to adoption. Distribution strategy exists.

## 9. Governance Theater

**What it is**: DAO with one real decision-maker. Governance tokens distributed but all proposals come from the team. Votes are rubber stamps.

**How to detect it**: Check governance history. How many proposals from non-team members? What was the closest vote? Has a proposal ever failed?

**What good looks like**: Genuine community governance with diverse proposers, contested votes, and decisions that actually changed the protocol's direction.

## 10. Grant-Dependent

**What it is**: Product only exists because of ecosystem grants. No path to sustainability. Will die when grants stop.

**How to detect it**: Remove grant funding. Does the team still work on this? Is there any revenue? Any plan for revenue?

**What good looks like**: Grants used for bootstrapping, with a clear timeline to self-sustainability through fees, subscriptions, or other revenue.

## 11. MEV Bait

**What it is**: Protocol design that rewards extractors more than users. Sandwich attacks, frontrunning, and backrunning are profitable and unmitigated.

**How to detect it**: Look at transaction ordering sensitivity. Are users getting worse prices than they should? Is there MEV protection (Jito bundles, private mempools)?

**What good looks like**: MEV-aware design — private transactions, batch auctions, MEV redistribution to users, or MEV-resistant mechanism design.

## 12. Complexity Worship

**What it is**: Making things complex to seem sophisticated. "Our novel tri-layer recursive liquidity aggregation engine" — just say what it does.

**How to detect it**: Can a smart person understand the product in 5 minutes? If it takes a PhD to grok the mechanism, it's too complex (or poorly explained).

**What good looks like**: Simple user-facing experience powered by complex tech underneath. Complexity is hidden, not celebrated.
