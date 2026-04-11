# Validation Framework

A structured sprint to test whether an idea deserves engineering time.

## Sprint Structure

### Day 1-2: Signal Collection

1. **Competitor Scan** — Find every live product, dead project, and active fork in the space
   - Search Solana ecosystem (use solana-new catalogs: 77 repos, 73 skills, 52 MCPs)
   - Search broader crypto (Ethereum, Base, Arbitrum equivalents)
   - Check Colosseum hackathon submissions for similar projects
2. **Demand Signals** — Look for evidence that people want this
   - Twitter/X threads asking for the solution
   - GitHub issues on related projects requesting the feature
   - Discord/Telegram messages in relevant communities
   - DeFi TVL trends, wallet activity, or on-chain data
3. **Substitute Analysis** — How are people solving this today without your product?

### Day 3-4: User Conversations

1. Identify 5-10 people who would be the first users
2. Ask: "How are you solving [problem] today?" (not "Would you use [product]?")
3. Ask: "What's the most annoying part of your current workflow?"
4. Listen for emotion and specificity — vague interest is not demand

### Day 5-7: Technical Feasibility

1. Can you build a working demo in 2 weeks?
2. What Solana primitives does this need? (programs, tokens, compression, etc.)
3. What existing tools can you reuse? (check solana-new catalogs)
4. What's the hardest unsolved technical problem?

## Output

Produce a validation scorecard:
- Demand evidence (strong / weak / none)
- Competition level (none / sparse / crowded)
- Technical feasibility (straightforward / hard / unsolved)
- Time to MVP (days / weeks / months)
- Go / No-Go / Pivot recommendation
