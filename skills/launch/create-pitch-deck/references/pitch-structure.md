# Pitch Structure — Sequoia / YC / Kawasaki Hybrid

A battle-tested slide framework combining the best of three proven approaches.

**Sources:** Sequoia Capital pitch deck model, YC Startup Library, Guy Kawasaki 10/20/30 rule.

## Design Rules (apply to every slide)

- **One idea per slide** (YC) — if a slide has two points, split it
- **30pt font minimum** (Kawasaki) — forces you to find the most salient point
- **Max 6 words per bullet, max 6 bullets per slide** — if you need more, you don't understand the point
- **Visuals > text** — comparison tables, before/after, metric callouts, screenshots
- **White space is your friend** — crowded slides signal confused thinking

## Core Slides (10-14 depending on audience)

### Slide 1: Title + Hook
- Project name and one-liner (must pass the "bar test" — explain it to a stranger)
- Your name, role, and one credibility signal
- One striking visual or number that creates curiosity
- **Speaking note:** Your first sentence must hook. Judges see 50+ projects. VCs see 10+ decks/week.
- **Example hook:** "340 agents settled $2.1M on Solana last month. None of them had a bank account."

### Slide 2: Problem
- What specific problem are you solving? (Not a category — a moment of pain)
- Who has this problem? Name the persona, not "everyone"
- What's the current workaround? How painful/expensive is it?
- Use a concrete story, data point, or quote from a real user
- **Sequoia rule:** The problem must be "large, growing, and urgent"
- **Bad:** "DeFi is hard to use" → **Good:** "87% of new Solana users abandon their first swap because gas estimation fails silently"

### Slide 3: Why Now (Sequoia's "most overlooked slide")
- What changed in the last 12 months that makes this possible/necessary?
- Technology shift, regulatory change, behavior change, or market event
- This is where you prove timing — "Why didn't someone build this 2 years ago?"
- **Examples:** Token Extensions launched, AI agents need on-chain wallets, MiCA regulation forces compliance, Firedancer doubles throughput
- **a16z rule:** If you can't answer "why now?", you probably don't have a venture-scale opportunity

### Slide 4: Solution
- What do you do, in one sentence? (The "bar test" answer)
- How does it work? 3 bullet points maximum
- Screenshot or demo GIF showing the core flow
- **YC rule:** Simple terms, no jargon. "We're a decentralized liquidity aggregation protocol" → "We find the best swap price across all Solana DEXes in one click"

### Slide 5: Why Crypto / Why Solana
- What's impossible without a blockchain? (Must be concrete, not philosophical)
- Why Solana specifically? Pick 2-3: speed (<400ms), cost (<$0.01), composability, ecosystem, Firedancer
- **This is the "crypto necessity" slide.** If removing the blockchain makes the product better, you have a problem.
- **Bad:** "We leverage blockchain for transparency" → **Good:** "Cross-border agent settlements need finality in <1 second for <$0.01. Only Solana delivers both."

### Slide 6: Demo / Product
- Live demo link (devnet for hackathons, mainnet for VCs)
- 3-4 screenshots showing the core user flow
- Key metrics inline: transactions processed, time saved, cost reduced
- **Sequoia rule:** Working product > slides. Always.
- **Tip:** If you can do a live demo during the pitch, DO IT. Pre-record a backup video in case of network issues.

### Slide 7: Market
- Target persona (specific: "Solana DeFi traders doing >$10K/month volume", not "crypto users")
- Addressable market — **bottom-up only** (# of target users × willingness to pay)
- Wedge strategy: the small market you'll own first before expanding
- **Kawasaki rule:** Bottom-up TAM. "12,000 Solana DAOs need treasury management. 200 are actively looking. At $500/mo, that's $1.2M ARR in our wedge alone."
- **Bad:** "The DeFi market is $50B" → **Good:** "3,400 protocols on Solana need automated rebalancing. 15% have budget. At $200/mo = $7.3M SAM."

### Slide 8: Traction
- The single most impressive metric, big and bold
- Supporting metrics: users, transactions, TVL, revenue, retention, growth rate
- Growth rate matters more than absolute numbers at early stage
- If pre-launch: waitlist size, LOIs, partnerships, community engagement, pilot results
- **On-chain metrics beat vanity metrics.** Weekly active users > Twitter followers. Retention > signups. Revenue > TVL.
- **Case study:** Phantom showed 40K → 2.1M users in 6 months, 100K new users/week. That growth rate was the pitch.

### Slide 9: Business Model
- How do you make money? (Protocol fees, subscriptions, transaction fees, etc.)
- Unit economics or plan to figure them out
- **Crypto-specific:** Token model (if applicable) — be brutally honest about utility vs. speculation
- **2026 VC expectation:** Unit economics AFTER gas and compute costs. What's your gross margin on-chain?
- If you have a token: utility, distribution schedule, vesting, bear-market resilience

### Slide 10: Competition
- 2x2 matrix positioning you in the desirable quadrant (or landscape table)
- Use output from `competitive-landscape` skill if available
- Your unfair advantage — what's hard to copy? (Network effects, data moat, ecosystem integration, team expertise)
- **Sequoia rule:** Acknowledging competition shows maturity. "We have no competitors" is a red flag.
- **Example matrix axes:** "Specialized ↔ General" vs "Consumer ↔ Institutional"

### Slide 11: Team
- Why is THIS team uniquely suited to build THIS product?
- Relevant experience: crypto, domain expertise, technical depth
- Founder-problem fit story (from interview Round 1)
- Notable advisors and backers
- **a16z rule:** VCs invest in people. Your "why you" story matters most.

### Slide 12: Ask
- What do you need? Be specific: amount, instrument (SAFE, equity, token warrant, grant)
- What will you do with it? Next 6-month roadmap with milestones
- What does success look like at the next raise/milestone?
- **Kawasaki rule:** Specific amount, specific use, specific timeline. "We're raising" is not an ask.
- **Example:** "Raising $500K on a SAFE to hire 2 engineers and reach 5,000 MAU by December. Next milestone: Series A at $5M with 50K MAU."

### Slide 13: Contact + Links (final slide)
- How to reach you (email, Telegram, Twitter DM)
- Website, GitHub, Discord, Twitter links
- Program address / explorer link for on-chain credibility
- QR code to the product for instant access

## Optional Slides (add based on audience)

### Tokenomics Deep Dive (VCs only, if token exists)
- Token utility: what does holding/staking/using the token DO?
- Distribution: team, investors, community, treasury percentages with vesting
- Emission schedule with bear-market stress test
- Value accrual mechanism (fee sharing, buyback, burn)
- **Red flag check:** If the only reason to hold the token is price appreciation, rethink the model

### Regulatory Readiness (VCs, 2026 requirement)
- How does your project handle securities considerations?
- MiCA alignment (for European users)
- Structure: equity + token warrant, pure token, hybrid SAFE
- Legal counsel status

### Integration Architecture (Strategic Partners only)
- How does your product integrate with the partner's stack?
- API/SDK documentation status
- Time to integrate estimate
- Mutual benefit framework

## Slide Order by Audience

| Audience | Recommended Order | Skip |
|----------|------------------|------|
| **Hackathon** | Title → Problem → Solution → Demo → Why Crypto → Traction → Ask | Market sizing, financials, regulatory |
| **VC** | Title → Problem → Why Now → Solution → Demo → Market → Traction → Business Model → Competition → Team → Tokenomics → Ask | Nothing — all 12+ slides |
| **Grant** | Title → Problem → Solution → Why Solana → Demo → Ecosystem Impact → Traction → Ask | Heavy financials, tokenomics |
| **Accelerator** | Title → Problem → Solution → Demo → Traction → Team → Ask | Grand vision — focus on next 3 months |
| **Partner** | Title → Problem → Solution → Demo → Integration Plan → Mutual Benefit → Ask | Your fundraising plans |
