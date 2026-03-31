---
name: solana-benchmark
description: Compute unit optimization and transaction analysis for Solana programs. Use when a user says "optimize CU", "compute units", "benchmark my program", "transaction size", "optimize transaction", "CU usage", "performance optimization", or "reduce compute".
---

# Solana Benchmark

## Overview

Measure and optimize compute unit consumption, transaction size, and serialization overhead for Solana programs. Profile individual instructions, identify CU hotspots, and recommend specific optimizations with expected savings.

## Workflow

1. Check for `.solana-new/build-context.json` to understand the stack, framework, and program ID.
2. Detect framework (Anchor vs native) and identify all instruction handlers.
3. Profile CU usage per instruction using [references/cu-profiling.md](references/cu-profiling.md).
4. Analyze transaction size and serialization overhead using [references/tx-size-analysis.md](references/tx-size-analysis.md).
5. Compare against baselines if prior benchmarks exist in `build-context.json`.
6. For each optimization opportunity, estimate CU savings and implementation effort.
7. Produce a local HTML artifact with the benchmark report and optimization roadmap.

## Dependency Gate (Required)

This skill requires a deployed program to benchmark.

1. If `.solana-new/build-context.json` is missing:
   - Tell the user to run `scaffold-project` then `build-with-claude` first.
   - Provide exact order: `solana-new copilot "your idea"` → `scaffold-project` → `build-with-claude` → `solana-benchmark`.
2. If build context exists but `build_status.devnet_deployed` is not `true`:
   - Redirect to `deploy-to-mainnet` (devnet step) or tell the user to deploy to devnet first.
3. A program ID is required — CU profiling needs a deployed program to simulate against.

## Non-Negotiables

- Measure actual CU via `simulateTransaction`, not estimates or documentation values.
- Report per-instruction CU breakdown — aggregate numbers hide hotspots.
- Transaction size in bytes with field-level breakdown (instruction data, accounts, signatures).
- Every optimization recommendation must include expected CU savings and implementation complexity.
- Track CU trends if prior benchmarks exist — show improvement or regression.
- Never recommend optimizations that sacrifice security (e.g., removing signer checks to save CU).
- Always write a local HTML artifact with the benchmark report.
- Compare against Solana's default CU limit (200,000) and max (1,400,000) to contextualize results.

## Phase Handoff

This skill is **Phase 2 (Build)** in the Idea → Build → Launch journey.

**Reads**: `.solana-new/build-context.json`
**Updates**: `.solana-new/build-context.json` with:
- `benchmark.cu_per_instruction`: object mapping instruction name to CU consumed
- `benchmark.total_cu`: number (sum across all instructions)
- `benchmark.tx_size_bytes`: number (largest transaction size)
- `benchmark.optimizations_identified`: array of `{ description, estimated_cu_savings, effort }`
- `benchmark.last_benchmark`: ISO timestamp

When updating `build-context.json`, **deep-merge** with existing content — don't overwrite fields from prior phases.

See `../../data/specs/phase-handoff.md` for the full JSON contract.

## Resources

### references/

- [references/cu-profiling.md](references/cu-profiling.md)
- [references/tx-size-analysis.md](references/tx-size-analysis.md)
