# Skill & MCP Usage Guide

Use installed skills and MCPs during development — they accelerate every step.

## How to Check What's Installed

- **Skills**: `~/.claude/skills/` directory, or listed in your project's CLAUDE.md
- **MCPs**: `.claude/settings.json` in your project root
- **Install a skill**: `npx skills add <github-url>`

## Skills by Task

### Writing Programs
| Skill | What it gives you |
|-------|-------------------|
| `programs-anchor` (official) | Anchor constraints, derive macros, account validation |
| `programs-pinocchio` (official) | Zero-copy patterns (88-95% CU savings) |
| `idl-codegen` (official) | Generate typed clients from IDLs via Codama |
| `solana-anchor-claude-skill` | End-to-end Anchor patterns with LiteSVM testing |

### Frontend / SDK
| Skill | What it gives you |
|-------|-------------------|
| `kit` (official) | @solana/kit reference (the modern SDK) |
| `frontend-framework-kit` (official) | @solana/kit for frontend integration |
| `kit-web3-interop` (official) | Migration from web3.js v1 to @solana/kit |
| `phantom-connect-skill` | Wallet connection + embedded wallets |

### Testing
| Skill | What it gives you |
|-------|-------------------|
| `testing` (official) | Testing pyramid: LiteSVM, Mollusk, Surfpool |
| `surfpool` (official) | Drop-in test-validator with mainnet state |
| `surfpool-cheatcodes` (official) | Manipulate time, accounts, programs locally |

### Security & Debugging
| Skill | What it gives you |
|-------|-------------------|
| `security` (official) | Signer checks, PDA validation, arithmetic safety |
| `vulnhunter-skill` | Automated vulnerability scanning |
| `code-recon-skill` | Architecture-level security audits |
| `common-errors` (official) | Diagnose toolchain/build/runtime errors |
| `compatibility-matrix` (official) | Version matching (Anchor, Solana CLI, Rust) |

## MCPs by Task

### Core Development
| MCP | Tools |
|-----|-------|
| `helius-mcp` | 60+ tools: wallet data, transactions, DAS API, webhooks |
| `solana-fender-mcp` | Anchor program static analysis |
| `anchor-mcp` | Anchor security CLI |

### DeFi Integration
| MCP | Tools |
|-----|-------|
| `dcspark-jupiter` | Jupiter swap quotes + execution |
| `demcp-orca-mcp` | Orca Whirlpool operations |

### Data & Analytics
| MCP | Tools |
|-----|-------|
| `opensvm-dexscreener-mcp` | Real-time token/pair data |
| `solscan-mcp` | Transaction forensics |

### Wallet
| MCP | Tools |
|-----|-------|
| `phantom-mcp-server` | Wallet operations (Solana + EVM) |

## Protocol Research — Verify Before Recommending

Before recommending a protocol integration, verify its health using live data. See `data/solana-knowledge/04-protocols-and-sdks.md` → "Protocol Health Verification" for full criteria, thresholds, and methods (DefiLlama MCP, REST API, or web search).

Run this check when recommending integrations, when a user asks "which protocol should I use for X?", or before adding a protocol dependency to any project.

## Tips

- Read each skill's SKILL.md before using — it explains triggers and capabilities
- MCPs provide real-time data — always prefer them over hardcoded values
- Combine skills: `programs-anchor` for writing + `testing` for tests + `security` for audit
- If an MCP returns unexpected results, use `simulateTransaction()` to verify
