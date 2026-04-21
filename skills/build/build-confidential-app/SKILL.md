---
name: build-confidential-app
description: Guide a developer through building a confidential or privacy-preserving app on Solana. Use when a user says "confidential app", "encrypted computation", "MPC", "private state", "dark pool", "sealed bid auction", "encrypted voting", "hidden game state", "confidential DeFi", "privacy on Solana", "build with Arcium", "Arcium circuit", "Arcis", "multi-party computation", "secret inputs", "encrypted inputs", or "private computation". Reads build-context.md from a prior scaffold phase if available.
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
_TEL_EVENT='{"skill":"build-confidential-app","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
echo "$_TEL_EVENT" >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
_CONVEX_URL=$(cat ~/.superstack/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
[ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" -H "Content-Type: application/json" -d '{"path":"telemetry:track","args":{"skill":"build-confidential-app","phase":"build","status":"success","version":"0.1.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' >/dev/null 2>&1 &
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

# Build Confidential App

## Overview

Guide the user through designing and building a confidential or privacy-preserving application on Solana. Privacy on Solana is not one-size-fits-all — this skill starts by identifying exactly what needs to be private and why, then routes to the most appropriate technical approach.

Arcium MPC is the primary solution for trustless encrypted computation where multiple parties compute on combined data without any party seeing the raw inputs — dark pools, sealed-bid auctions, encrypted voting, hidden game state, confidential DeFi, secure randomness, threshold signing.

## Privacy Approach Decision (Step 0)

Before writing any code, ask: "What specifically needs to be private, and from whom?"

| Privacy Need | Best Approach | When to Use |
|--------------|---------------|-------------|
| Token balances and transfer amounts hidden from chain observers | Token-2022 confidential transfers (official `confidential-transfers` skill) | Sender and receiver see their own amounts; chain observers see nothing. No computation across multiple parties' secrets. |
| Computation on combined secret inputs from multiple parties | **Arcium MPC** | No single party should see the combined inputs — auctions, voting, poker, dark pools |
| State hidden from all parties until reveal | **Arcium MPC** | Hidden game state, sealed bids, score tracking without revealing individual moves |
| ZK proofs (verify a claim without revealing input) | Noir + Sunspot — clone `noir-examples` | Proving membership, range proofs, identity proofs — not multi-party computation |
| General on-chain state privacy with computation | **Arcium MPC** | Any case where on-chain state must remain encrypted but computable |

**Decision rule — Arcium is the right choice if any of the following are true:**
- Two or more parties submit secret inputs that must be combined
- On-chain state must remain encrypted between computations
- You need trustless guarantees (cryptographic, not trust-in-a-TEE)
- The use case is a dark pool, sealed-bid auction, encrypted vote, hidden game state, private scoring/matching, or confidential DeFi position tracking

If the user only needs to hide token transfer amounts from chain observers with no computation across multiple parties' secrets, redirect to the Solana Foundation's official `confidential-transfers` skill (Token-2022).

## Arcium Mental Model

Arcium apps have three coupled surfaces. Most bugs are mismatches across their boundaries:

| Surface | Responsibility | Common Boundary Bugs |
|---------|---------------|----------------------|
| **Circuit** (Arcis/Rust) | Pure fixed-shape MPC logic | Variable loops, dynamic collections, `.reveal()` inside conditionals |
| **Program** (Anchor/Rust) | Orchestration: init + queue + callback | Macro name mismatch, callback accounts not writable, wrong ArgBuilder order |
| **Client** (TypeScript) | Key exchange, encryption, submission, decryption | Nonce reuse, missing `.x25519_pubkey()` for Shared, param order != circuit order |

**MPC constraints** (from how secret sharing works):
- Both branches of `if/else` execute unless the condition is a compile-time constant — cost = sum of both branches, not max
- Loops must have fixed bounds — no `while`, `break`, `continue`
- Comparisons are significantly more expensive than arithmetic — rough performance ordering: addition (cheapest) -> multiplication -> comparison (most expensive)
- `.reveal()` and `.from_arcis()` cannot be called inside conditionals (exception: compile-time constant conditions)
- All data must be fixed-size — no `Vec`, `String`, `HashMap`; use `[T; N]`

## Workflow

1. Check for `.superstack/build-context.md`. If found, use stack decisions already made. If not, ask: What type of confidential app? Who are the parties? What data must stay private, and at what phase (input, computation, output, or all)? Write `.superstack/build-context.md` with context gathered so future skills can use it.

2. Run the **Privacy Approach Decision (Step 0)** above. Confirm Arcium MPC is correct for the use case, or redirect to Token-2022 confidential transfers or ZK proofs if either would serve better.

3. Confirm the Arcium Docs MCP is configured for live doc access (API details, CLI flags, current versions). If not, add it:
   ```bash
   # Claude Code
   claude mcp add --transport http arcium-docs https://docs.arcium.com/mcp

   # Codex
   codex mcp add --transport http arcium-docs https://docs.arcium.com/mcp
   ```
   Use `search_arcium_docs` for discovery, then `query_docs_filesystem_arcium_docs` with `cat <path>.mdx` for full page reads (e.g., `cat /developers/arcis/mental-model.mdx`).

4. Install the Arcium CLI and scaffold the app:
   ```bash
   curl -sSfL https://install.arcium.com/ | bash
   arcium init my-confidential-app
   cd my-confidential-app
   ```

5. Choose a circuit pattern. Read [examples/patterns.md](examples/patterns.md) and match the use case:
   - **Stateless** (coinflip): input -> compute -> reveal
   - **Persistent state** (voting): `Enc<Mxe, T>` across computations
   - **Multi-party input** (RPS, auction): multiple `Enc<Shared, T>` inputs
   - **Randomness** (blackjack): `ArcisRNG` for unpredictable outcomes
   - **Complex comparison** (auction): encrypted bid tracking

   For a first app: read [examples/minimal-circuit.md](examples/minimal-circuit.md) end-to-end before writing any code.

6. Wire the Anchor program with the three required functions per instruction:
   - `init_<name>_comp_def` — initialize once per instruction type
   - `<name>` — build `ArgBuilder` args, call `queue_computation`
   - `<name>_callback` — handle result from Arx nodes, update on-chain state

7. Implement the TypeScript client:
   - x25519 key exchange with MXE public key (retry with backoff if null)
   - `RescueCipher` encryption with a unique nonce per call
   - `awaitComputationFinalization` to wait for result
   - Production key derivation from wallet signature (not ephemeral keys — ephemeral keys lose decryption capability after session ends)

8. Test locally with `arcium test` (auto-starts localnet with Arx nodes). When computations fail or return wrong results, consult [references/troubleshooting.md](references/troubleshooting.md) for the debug triage order.

9. Before deployment: run the **Verification Checklist** below. Deploy to devnet with `arcium deploy`. Only move to mainnet after the full test suite passes on devnet with a reliable RPC.

## Non-Negotiables

- Never reuse a nonce — every `cipher.encrypt()` call needs a fresh `randomBytes(16)`.
- Never combine multiple ciphertexts into one ArgBuilder call — each encrypted scalar is its own `[u8; 32]` call.
- Never omit `.x25519_pubkey()` for `Enc<Shared, T>` parameters — silent failure, most common bug.
- Macro strings must exactly match `#[instruction] fn NAME` across `#[arcium_callback(encrypted_ix)]`, `comp_def_offset()`, and all account macros. One character difference = computation never finalizes.
- ArgBuilder call order must exactly match circuit function parameter order left-to-right.
- Never deploy to mainnet without `arcium test` passing locally and `arcium test -c devnet` passing on devnet first.
- Production clients must derive encryption keys from wallet signatures, not ephemeral random keys.
- All circuit loops must have fixed compile-time bounds. Guard all divisions against secret zero (both branches always execute in MPC — division by secret zero is undefined behavior, no error).

## Phase Handoff

This skill is **Phase 2 (Build)** in the Idea -> Build -> Launch journey.

**Reads**: `.superstack/build-context.md`
**Writes/Updates**: `.superstack/build-context.md` (creates if missing) with:
- `confidential.approach`: "arcium-mpc" | "token2022-confidential" | "zk-proof"
- `confidential.use_case`: string (e.g., "sealed-bid-auction", "encrypted-voting", "dark-pool", "hidden-game-state")
- `confidential.circuit_pattern`: string (e.g., "stateless", "persistent-state", "multi-party", "randomness")
- `confidential.program_id`: string (devnet)
- `confidential.mxe_initialized`: boolean
- `confidential.arcium_cli_version`: string

When updating, **deep-merge** — don't overwrite existing fields.

See `../../data/specs/phase-handoff.md` for the full JSON contract.

## Quick Start

```bash
# Install Arcium CLI (wraps Anchor for init/build/test/deploy — use arcium for those,
# fall back to anchor for other workflows like idl/keys/shell)
curl -sSfL https://install.arcium.com/ | bash

# Scaffold a new confidential app
arcium init my-confidential-app
cd my-confidential-app

# Key dependencies added by arcium init:
# programs/*/Cargo.toml: anchor-lang, arcium-anchor, arcium-client, arcium-macros
# encrypted-ixs/Cargo.toml: arcis (where circuits live)
# package.json: @arcium-hq/client, @coral-xyz/anchor

# Develop
arcium build          # Build circuit + program
arcium test           # Build + start localnet with Arx nodes + run tests
arcium deploy         # Deploy to devnet

# Add Arcium MCP for live docs (API details, CLI flags, current versions)
claude mcp add --transport http arcium-docs https://docs.arcium.com/mcp
```

## Verification Checklist

**Circuit:**
- [ ] `arcium build` compiles without errors
- [ ] No `break`/`continue`/`return`/variable-length loops in circuit
- [ ] `#[instruction]` fn names are consistent across all macros
- [ ] Fixed-size arrays only (no `Vec`, `String`, `HashMap`)
- [ ] All divisions guarded against secret zero

**Program:**
- [ ] `init_*_comp_def` called before first computation (once per instruction type)
- [ ] Every circuit fn has init + invoke + callback instructions
- [ ] `#[arcium_callback(encrypted_ix = "...")]` matches circuit fn name exactly
- [ ] Extra callback accounts: both `CallbackAccount { pubkey, is_writable: true }` in `callback_ix` AND `#[account(mut)]` in callback struct

**Client:**
- [ ] Unique nonce per encryption (no reuse across calls)
- [ ] ArgBuilder call order matches circuit fn parameter order left-to-right
- [ ] `.x25519_pubkey()` included for every `Enc<Shared, T>` parameter
- [ ] Cluster offset matches deployment environment
- [ ] Production key derivation from wallet signature (not `x25519.utils.randomSecretKey()`)

**Deploy:**
- [ ] `arcium test` passes on devnet before any deploy
- [ ] RPC endpoint is reliable (not default public Solana RPC)

## Decision Points

- **Which privacy approach?** See the Privacy Approach Decision table in Step 0 above.
- **`Enc<Shared, T>` vs `Enc<Mxe, T>`?** Use `Enc<Shared, T>` for user inputs and results returned to users (user has the key to decrypt). Use `Enc<Mxe, T>` for internal state that persists across computations and that no single party should access.
- **Stateless vs stateful circuit?** Stateless (coinflip pattern) — simpler, no on-chain encrypted state, result revealed immediately. Stateful (voting, auction patterns) — encrypted state persists via `Enc<Mxe, T>` and accumulates across multiple computation calls.
- **Which comparison approach?** Prefer arithmetic over comparisons in circuits — comparisons are significantly more expensive than addition or multiplication in MPC. Use `Pack<T>` for large arrays (~26x compression for byte arrays). Use narrower types (`u64` not `u128`) where possible.
- **Arcium MPC vs Token-2022 confidential transfers?** Token-2022 confidential transfers hide transfer amounts from on-chain observers and are simple to implement but provide no multi-party computation capability — parties still know their own balances. Arcium MPC provides trustless computation across multiple parties' encrypted inputs where no party (including the protocol) sees the raw values. They serve different needs and can coexist in the same application.
- **Localnet vs devnet?** Use `arcium test` (localnet) for development. Only move to devnet when the full test suite passes. Devnet requires a reliable RPC; don't use the default Solana public RPC.
- **Single deployer vs multisig?** Use Squads multisig for any program handling sensitive encrypted state or custody of value — same rule as DeFi programs.

## Resources

### MCP (primary — use for API details, CLI flags, current versions, deployment)
- `search_arcium_docs` for discovery, then `query_docs_filesystem_arcium_docs` with `cat <path>.mdx` for full pages
- Setup: `claude mcp add --transport http arcium-docs https://docs.arcium.com/mcp`

### examples/
- [examples/minimal-circuit.md](examples/minimal-circuit.md) — Complete minimal app: circuit + program + test (start here for a first Arcium app)
- [examples/patterns.md](examples/patterns.md) — 15 curated circuit patterns (coinflip, voting, auction, blackjack, safe division, packing, etc.)

### references/
- [references/troubleshooting.md](references/troubleshooting.md) — Debug triage, common error table, ArgBuilder errors, nonce errors, localnet issues, testing patterns

### External
- [docs.arcium.com/developers](https://docs.arcium.com/developers/) — Official docs
- [github.com/arcium-hq/examples](https://github.com/arcium-hq/examples) — Full example apps (coinflip, voting, auction, blackjack, RPS, shared medical records, ed25519)
- [github.com/arcium-hq/ideas-list](https://github.com/arcium-hq/ideas-list) — Confidential app idea starters
- [ts.arcium.com](https://ts.arcium.com/) — TypeScript SDK reference
- Alternative: official Solana skill `confidential-transfers` for Token-2022 balance privacy
- Alternative: `noir-examples` repo for ZK proofs on Solana

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
echo '{"skill":"build-confidential-app","phase":"build","event":"completed","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","platform":"'$(uname -s)-$(uname -m)'"}' >> ~/.superstack/telemetry.jsonl 2>/dev/null || true
true
fi
```

Replace `OUTCOME` with success/error/abort based on the workflow result.
