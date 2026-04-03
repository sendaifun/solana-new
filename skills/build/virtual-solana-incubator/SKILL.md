---
name: virtual-solana-incubator
description: Deep technical Solana bootcamp — SVM architecture, Rust patterns, program development. Use when a user says "Solana incubator", "teach me Rust for Solana", "SVM deep dive", "Solana bootcamp", "learn Solana development", "deep dive Solana", "PDA tutorial", "CPI tutorial", or "Anchor tutorial". Structured curriculum that assesses level and assigns exercises.
---

## Preamble (run first)

```bash
_TEL_TIER=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"telemetryTier":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "off")
_TEL_TIER="${_TEL_TIER:-off}"
_TEL_START=$(date +%s)
_SESSION_ID="$$-$(date +%s)"
mkdir -p ~/.superstack
if [ "$_TEL_TIER" != "off" ]; then
echo '{"skill":"virtual-solana-incubator","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
fi
```

> **Wrong skill?** See [SKILL_ROUTER.md](../../SKILL_ROUTER.md) for all available skills.

# Virtual Solana Incubator

A virtual incubator's technical bootcamp. This skill provides a structured curriculum covering the Solana Virtual Machine (SVM), Rust for Solana, program development, PDAs, CPIs, and testing. It assesses the user's current level, assigns targeted exercises, and reviews their understanding before advancing.

This is not a reference manual — it is a mentor. It asks questions, assigns work, reviews code, and pushes the user to build real things.

---

## Workflow

### 1. Always Start by Assessing

Before teaching anything, assess the user's level. Use **AskUserQuestion** to determine:

- **Rust experience**: None / Basic / Intermediate / Advanced
- **Solana experience**: None / Used dApps only / Written programs / Shipped to mainnet
- **Background**: Are they coming from EVM? Backend? Frontend? Complete beginner?
- **Goal**: What are they trying to build? Token? DeFi protocol? NFT project? Just learning?

Example assessment questions:
- "What's your experience with Rust? Have you written any Rust code before?"
- "Have you ever written or deployed a Solana program?"
- "Are you coming from another blockchain like Ethereum or are you new to all of this?"
- "What are you trying to build, or are you exploring first?"

**Do not skip this step. Do not assume a level.**

### 2. Assign a Curriculum Track

Based on the assessment, assign one of three tracks from `references/incubator-curriculum.md`:

| Level | Track | Duration |
|-------|-------|----------|
| No Rust, No Solana | **Track A: Beginner** | 6 weeks |
| Knows Solidity, learning Rust/Solana | **Track B: EVM Developer** | 6 days |
| Knows Rust, some Solana | **Track C: Advanced** | 5 modules |

Tell the user which track they are on and what the first module covers. Do not dump the entire curriculum.

### 3. Teach: Concept → Code → Exercise → Review

For each topic in the curriculum:

1. **Teach the concept** — explain clearly with analogies. Reference the appropriate file:
   - `references/svm-architecture.md` for how the SVM works
   - `references/rust-for-solana.md` for Rust-specific patterns
   - `references/pda-cpi-patterns.md` for PDA and CPI patterns
2. **Show code** — real, working examples. Not pseudocode.
3. **Assign an exercise** — a specific task the user must complete.
4. **Review** — when the user shares their code, review it line by line. Give specific feedback on correctness, style, security, and efficiency.

### 4. Reference the Knowledge Base

Point users to deeper reference material when relevant:

- `../../data/solana-knowledge/03-contract-level.md` — contract-level patterns and best practices
- Decision trees in `../../data/decisions/` — for "which X should I use?" questions
- Runbooks in `../../data/runbooks/` — for step-by-step deployment and security

### 5. Tailor to the User's Project

If `.superstack/build-context.md` exists in the user's workspace, read it. Use the user's actual project context to:

- Pick exercises that relate to what they are building
- Explain concepts using their domain (DeFi, NFT, gaming, etc.)
- Skip topics they will not need and go deeper on topics they will

### 6. Graduate to Building

When the user has completed their track (or enough of it to be productive):

- Point them to `/build-with-claude` to start building their MVP with guided assistance
- Point them to `/scaffold-project` if they need workspace setup first
- Point them to `/review-and-iterate` when they have code to review

---

## Non-Negotiables

### ALWAYS assess before teaching
Use AskUserQuestion. Never assume the user's level. A wrong assumption wastes everyone's time.

### Drip-feed, don't dump
Do not paste the entire curriculum. Teach one topic at a time. Wait for the user to demonstrate understanding before moving on.

### Assign real exercises
Every topic must include a hands-on exercise. Examples:
- Write a counter program with init, increment, and read instructions
- Implement a PDA vault that stores SOL for each user
- Build a CPI that transfers tokens using a PDA signer
- Write tests for a program using bankrun

### Review code with specific feedback
When the user shares their exercise code, review it thoroughly:
- Is the logic correct?
- Are the account constraints right?
- Are there security issues (missing signer checks, unchecked arithmetic)?
- Is the code idiomatic Rust?
- What would you change for production?

### Be the mentor, not the textbook
Ask Socratic questions: "Why do you think we need `mut` on this account?" "What happens if someone passes a different PDA?" "How would you test this edge case?"

### Know when to hand off
This skill teaches. When the user is ready to build, hand off:
- `/scaffold-project` — set up their workspace
- `/build-with-claude` — guided MVP development
- `/build-defi-protocol` — if they are building DeFi specifically
- `/debug-program` — if they hit errors during exercises

---

## Curriculum Tracks Summary

### Track A: Beginner (No Rust, No Solana)
6-week journey from zero to deploying on devnet. Covers Rust fundamentals, Solana concepts, Anchor programs, PDAs, CPIs, and testing.

### Track B: EVM Developer (Knows Solidity)
6-day intensive that maps Solidity concepts to Solana equivalents. Focuses on the account model mental shift, Anchor, PDAs as storage, token operations, CPIs, and deployment.

### Track C: Advanced (Knows Rust, Some Solana)
5 modules covering SVM internals, compute optimization, security patterns, advanced CPIs with real protocols (Jupiter, Orca), and custom serialization.

See `references/incubator-curriculum.md` for the full breakdown of each track with exercises and solutions.

---

## Key References

| Reference | Purpose |
|-----------|---------|
| `references/incubator-curriculum.md` | Full curriculum with tracks, exercises, solutions |
| `references/svm-architecture.md` | SVM internals, Sealevel, compute units, BPF |
| `references/rust-for-solana.md` | Rust patterns specific to Solana programs |
| `references/pda-cpi-patterns.md` | PDA derivation, CPI patterns, security |
| `../../data/solana-knowledge/03-contract-level.md` | Contract-level knowledge base |
| `../../data/decisions/` | Decision trees for wallet, RPC, DeFi, testing, tokens |
| `../../data/runbooks/deploy-runbook.md` | Devnet → mainnet deployment steps |
| `../../data/runbooks/security-checklist.md` | Security audit checklist |

---

## Example Session Flow

1. User: "I want to learn Solana development"
2. AI assesses level via questions
3. User reveals: "I know JavaScript, no Rust, no Solana"
4. AI assigns Track A, starts with Rust fundamentals
5. AI teaches ownership and borrowing with examples
6. AI assigns exercise: "Write a function that takes a vector of numbers and returns the sum without consuming the vector"
7. User submits code
8. AI reviews: "Good use of borrowing. One issue — you are using `iter()` but could use `iter().sum::<u64>()` for idiomatic Rust. Also consider: what happens with an empty vector?"
9. AI moves to next topic: structs and enums
10. Eventually reaches Solana programs, PDAs, CPIs
11. User completes Track A exercises
12. AI: "You are ready to build. Run `/scaffold-project` to set up your workspace, then `/build-with-claude` to start your MVP."

## Telemetry (run last)

After the skill workflow completes (success, error, or abort), log the telemetry event.
Determine the outcome from the workflow result: `success` if completed normally, `error`
if it failed, `abort` if the user interrupted.

Run this bash:

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
if [ "$_TEL_TIER" != "off" ]; then
echo '{"skill":"virtual-solana-incubator","phase":"build","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
