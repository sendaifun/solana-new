# writing tone guide — launch skills

default tone for generated content (pitch decks, social copy, video text, hackathon submissions). these are defaults — always ask the user if they have a preferred writing style before generating final output.

## ask first

before generating any written output, ask:

> "do you have a preferred writing style or tone? some folks prefer lowercase and casual (builder energy), others want polished and corporate. if you have a writing style guide or examples of your past writing, share them and i'll match that."

if the user provides a style guide or examples → use those instead of the defaults below.
if the user says "casual" or "lowercase" → apply these defaults.
if the user says "professional" or "formal" → use standard title case and complete sentences.
if the user has no preference → use these defaults as a starting point, show them a sample, and ask if the tone feels right.

## default tone (when no preference given)

### casing
- lowercase by default for body text, bullets, and social copy
- brand names keep their casing (Solana, Pyth, Hyperliquid, Jupiter)
- headings: lowercase unless the user prefers otherwise
- slide titles in pitch decks: lowercase works for hackathon/builder audiences, title case for vc/institutional

### sentence style
- short sentences. don't chain with "and" or "but" when you can start a new one.
- **avoid em dashes (—) in decks and marketing copy** — they're a telltale sign of AI-generated text. use periods, semicolons, or colons instead. em dashes are fine in long-form writing but not in slides or social copy.
- arrows (→) for progression or causality
- colons to set up a key point: "the core insight: markets need liquidity from block 1"
- contractions always — "it's", "don't", "won't"

### what to avoid
- generic filler that could be from any AI output: "in today's rapidly evolving landscape", "at the forefront of innovation", "cutting-edge technology"
- vague claims without data: "significant adoption", "massive volume", "growing fast", "gaining traction"
- hedging: "perhaps", "it seems like", "one could argue"
- passive voice: "trades are executed" → "the amm executes trades"
- unnecessary transitions: "furthermore", "additionally", "in conclusion"
- describing what something IS instead of what it DOES: "a decentralized liquidity protocol" → "finds the best swap price across all solana dexes"

### what works
- crypto/defi jargon is fine — TVL, OI, AMM, perps, LPs, MEV, CLOB are builder language, not corporate speak. use them freely.
- specific data over adjectives: "15M agent payments on solana ytd" not "significant adoption"
- name real protocols — hyperliquid, drift, jupiter, pyth. never vague "decentralized infrastructure"
- reference what's shipped and live, not what's planned
- numbers > adjectives: "$5B/day" not "massive volume", "2.4bps spread" not "tighter spreads"
- use "X for Y" analogies to anchor positioning fast: "HIP-3 for Solana", "Jupiter for lending", "Hyperliquid for agents", "Uber for compute". one analogy in the title or first sentence saves 3 slides of explanation. pick an anchor the audience already respects.

## format-specific notes

### pitch decks
- slide text should be scannable — max 6 words per bullet
- speaking notes can be more conversational than slide text
- the "ask" slide should be direct: amount, instrument, use, timeline

### social copy (twitter threads, tiktok captions)
- hook in the first line — tension, data point, or contrarian take
- short paragraphs (1-2 sentences)
- end with a clear cta: link, "pls try it", "link in bio"
- hashtags: 3-5 max, no walls

### hackathon submissions
- lead with what the project does, not how it works
- judges read 100+ submissions — scannable > comprehensive
- demo link in the first paragraph

### video text overlays
- max 8 words per text overlay
- metrics as hooks: "$0 to deploy" not "low cost deployment"
- cta frame: url + one action verb
