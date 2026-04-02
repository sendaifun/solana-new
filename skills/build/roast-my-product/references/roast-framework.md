# Roast Framework — 10-Dimension Product Critique

Use this framework to systematically evaluate every crypto product. Score each dimension 1-10 with specific evidence. No free passes.

## Dimensions

### 1. Value Proposition (Weight: 2x)

Can you explain what this does in one sentence? Would a stranger understand? Is the value obvious or does it need explaining?

- **1-3**: Can't articulate what it does. Homepage is confusing. Needs a 5-minute explainer.
- **4-6**: Somewhat clear but uses jargon or assumes context. "If you already know DeFi, you get it."
- **7-8**: Clear value prop, a stranger could understand with one read.
- **9-10**: Instantly obvious. "Oh, I need that." Rare — justify this score.

**Key questions**: Can you say what it does without using the words "decentralized", "protocol", or "ecosystem"? If not, it's a 4 or below.

### 2. Crypto Necessity

Remove the blockchain. Does the product still work? If yes, why is crypto here?

- **1-3**: Ornamental crypto. A database would work fine. Blockchain adds complexity, not value.
- **4-6**: Crypto adds some value (transparency, composability) but isn't essential.
- **7-8**: Meaningfully better because of crypto (permissionless access, programmable money, trustless settlement).
- **9-10**: Impossible without blockchain. The product IS the crypto primitive.

**Key questions**: What would break if you replaced the blockchain with Postgres? If nothing breaks, score 1-3.

### 3. Target User Clarity

Who exactly uses this? Can you name 5 people? Is the target too broad or too narrow?

- **1-3**: "Everyone" or "crypto users" — no real target. Can't name a single specific user.
- **4-6**: General audience like "DeFi traders" — too broad to build for.
- **7-8**: Specific persona: "Solana yield farmers managing $10k-100k across 3+ protocols."
- **9-10**: Named individuals waiting for this. Evidence of demand from specific people.

**Key questions**: Could you find 10 target users on Twitter right now and DM them? If not, the target is too vague.

### 4. First-Time User Experience

What happens when someone first arrives? Is it obvious what to do? How many clicks to value?

- **1-3**: Confused immediately. No clear entry point. Wall of jargon. Wallet required before seeing anything.
- **4-6**: Can figure it out but takes effort. Some friction, some confusion.
- **7-8**: Clear path to first action. Minimal friction. Good onboarding.
- **9-10**: Delightful first experience. Value delivered in under 60 seconds.

**Key questions**: Could your mom use this? Could a crypto-native user use this without reading docs?

### 5. Core Loop

What do users do repeatedly? Is there a reason to come back? How often?

- **1-3**: No loop. One-time use. No reason to return after first interaction.
- **4-6**: Some reason to return but weak. "Check your portfolio" isn't a loop.
- **7-8**: Clear retention mechanic. Users come back daily/weekly for a specific reason.
- **9-10**: Addictive loop. Users check multiple times per day. Built-in notifications/triggers.

**Key questions**: If push notifications disappeared, would users still come back? What triggers the return?

### 6. Competitive Moat

What stops someone from copying this in a weekend? Network effects? Data? Liquidity?

- **1-3**: Nothing. A competent dev could clone this in days. No defensibility.
- **4-6**: Some switching cost (user data, integrations) but low.
- **7-8**: Real moat — liquidity, network effects, proprietary data, deep integrations.
- **9-10**: Unassailable position. Would take years and millions to replicate.

**Key questions**: If a16z funded a competitor tomorrow with 10x your budget, what would save you?

### 7. Technical Execution

Does it work? Is it fast? Does it handle errors gracefully? Is the code production-grade?

- **1-3**: Broken. Crashes. Slow. Obvious bugs. Unaudited smart contracts handling real money.
- **4-6**: Works but rough. Some bugs, slow in places, error handling is poor.
- **7-8**: Solid. Fast. Handles edge cases. Well-tested.
- **9-10**: Exceptional engineering. Sub-second responses. Graceful degradation. Battle-tested.

**Key questions**: What happens when the RPC goes down? When a transaction fails? When there's a chain reorg?

### 8. Naming & Messaging

Is the name memorable? Does the tagline communicate value? Would you share this URL?

- **1-3**: Forgettable name. Can't spell it. Tagline is meaningless jargon. URL is embarrassing.
- **4-6**: Okay name but doesn't stand out. Messaging is generic.
- **7-8**: Memorable name, clear tagline, good URL. You'd tell a friend about it.
- **9-10**: Perfect name. Instantly memorable. Tagline IS the pitch.

**Key questions**: Say the name out loud. Did it stick? Can you spell it after hearing it once?

### 9. Monetization Path

How does this make money? Is the business model clear? Is it compatible with the value proposition?

- **1-3**: No plan. "We'll figure it out later." Or worse, the token IS the business model.
- **4-6**: Vague plan (fees, premium tier) but not validated or implemented.
- **7-8**: Clear model, implemented or ready to implement, compatible with user value.
- **9-10**: Proven revenue. Users willingly pay. Unit economics work.

**Key questions**: If the token went to zero, would the business survive? Where does revenue come from that isn't token speculation?

### 10. Market Timing

Is this too early? Too late? Is there evidence of demand NOW?

- **1-3**: Too early (infrastructure doesn't exist) or too late (market is saturated).
- **4-6**: Timing is okay but no urgency. "Eventually people will need this."
- **7-8**: Good timing. Market is ready. Evidence of demand (searches, competitors getting traction, regulatory clarity).
- **9-10**: Perfect timing. Wave is building. You're ahead but not too far ahead.

**Key questions**: Why now? What changed in the last 6 months that makes this possible or necessary?

## Scoring Calculation

| Dimension | Weight |
|-----------|--------|
| Value Proposition | 2x |
| All others | 1x |

Total possible: 110 (Value Prop max 20 + 9 dimensions max 10 each = 110).

| Total Score | Verdict |
|-------------|---------|
| 90-110 | Exceptional — ship it and don't look back |
| 70-89 | Strong — fix the weak spots and you're golden |
| 50-69 | Needs significant work — core issues to address |
| 30-49 | Fundamental problems — consider a rethink |
| 0-29 | Start over — the foundation is broken |
