# Skill Router

> **For AI agents**: If the user's request doesn't match this skill, find the right one below and switch.

## Learn Phase — Solana Fundamentals

| Trigger | Skill | When to use |
|---------|-------|-------------|
| "what is Solana", "why Solana", "new to Solana", "Solana basics", "EVM to Solana" | `solana-beginner` | User is new, needs fundamentals |
| "what have we learned", "show learnings", "prune learnings", "export learnings" | `learn` | User wants to review past learnings |

## Idea Phase — Discovery & Planning

| Trigger | Skill | When to use |
|---------|-------|-------------|
| "what should I build", "crypto ideas", "project ideas" | `find-next-crypto-idea` | User has no idea yet, needs discovery |
| "validate this idea", "is this worth building" | `validate-idea` | User has an idea, needs stress-testing |
| "who are my competitors", "competitive analysis" | `competitive-landscape` | User wants to map existing players |
| "DeFi opportunities", "TVL data", "DefiLlama" | `defillama-research` | User wants DeFi market data |
| "colosseum copilot", "hackathon projects", "winner patterns", "gap analysis" | `colosseum-copilot` | User wants Colosseum hackathon data (requires PAT) |

## Build Phase — Solana Implementation

| Trigger | Skill | When to use |
|---------|-------|-------------|
| "scaffold", "set up project", "initialize" | `scaffold-project` | Starting from scratch, need project structure |
| "help me build", "build the MVP", "guide me" | `build-with-claude` | Step-by-step implementation guidance |
| "DeFi protocol", "AMM", "lending", "vault", "DEX" | `build-defi-protocol` | Building DeFi-specific programs |
| "launch token", "SPL token", "memecoin", "pump.fun" | `launch-token` | Token creation and distribution |
| "data pipeline", "indexer", "webhook", "analytics" | `build-data-pipeline` | On-chain data infrastructure |
| "mobile app", "React Native", "mobile wallet" | `build-mobile` | Mobile dApp development |
| "debug", "error", "transaction failed", "stuck" | `debug-program` | Diagnosing program failures |
| "review", "audit", "security", "production ready" | `review-and-iterate` | Code review and security audit |
| "Solana incubator", "teach me Rust", "SVM deep dive", "Solana bootcamp" | `virtual-solana-incubator` | Deep technical Solana learning |
| "roast my product", "harsh feedback", "be brutal", "what sucks" | `roast-my-product` | Harsh product critique |
| "product review", "UX review", "is my product good", "onboarding review" | `product-review` | Product quality evaluation |
| "pick brand colors", "brand design", "theme this project", "brand identity", "choose palette" | `brand-design` | Interactive brand palette + typography + gradients + tone/voice with HTML browser preview |
| "build a frontend", "create a component", "review my UI", "style this", "polish this", "design this page" | `frontend-design-guidelines` | Enforceable web interface rules (interactions, forms, states, animation, craft layer) with shadcn + Tailwind defaults; reads brand.md |
| "security audit infrastructure", "CSO", "threat model", "OWASP" | `cso` | Infrastructure-first security audit |
| "security audit", "signer check", "PDA security" | `solana-security-audit` | Deep Sealevel security analysis |
| "QA", "test my dApp", "test wallet flow" | `solana-qa` | Systematic QA testing |
| "benchmark", "compute units", "CU", "optimize" | `solana-benchmark` | CU optimization and TX analysis |
| "monitor", "canary", "post-deploy", "health check" | `solana-canary` | Post-deploy monitoring |
| "retro", "sprint review", "what did we ship" | `solana-retro` | Sprint retrospective |
| "ship it", "release", "create PR", "merge" | `solana-ship` | Full release workflow |
| "marketing video", "promo video", "Remotion" | `marketing-video` | Code-driven + AI video production |

## Launch Phase — Go to Market

| Trigger | Skill | When to use |
|---------|-------|-------------|
| "deploy to mainnet", "go to production" | `deploy-to-mainnet` | Mainnet deployment checklist |
| "pitch deck", "slides", "investor presentation" | `create-pitch-deck` | Pitch deck creation |
| "hackathon submission", "submit", "demo video" | `submit-to-hackathon` | Hackathon submission prep |
| "marketing video", "deck review", "product video" | `marketing-video` | Video content creation |
| "apply for grant", "grant application", "200 USDG", "agentic engineering grant", "ST earn", "Superteam earn", "Superteam grant", "solana earn grant" | `apply-grant` | Prepare Agentic Engineering Grant application |

## Shared Guides

| Topic | Runbook |
|-------|---------|
| RPC + wallet setup | `data/guides/rpc-wallet-guide.md` |
| Deploy devnet → mainnet | `data/guides/deploy-runbook.md` |
| Security audit checklist | `data/guides/security-checklist.md` |

## How to use this router

1. Read the user's request
2. Match against the trigger phrases above
3. If this skill doesn't match, tell the user: "This looks like a [X] task. Let me use the [skill-name] skill instead."
4. For "which X should I use?" questions, check the shared guides in `data/guides/`
5. Load the correct SKILL.md and follow its instructions
