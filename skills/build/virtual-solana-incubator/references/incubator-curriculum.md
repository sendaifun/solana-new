# Incubator Curriculum

Structured learning paths for the Virtual Solana Incubator. Each track is tailored to the user's background. Every module includes: concept explanation, code walkthrough, exercise, and solution outline.

---

## Track A: Beginner (No Rust, No Solana)

Target: Developer with experience in JavaScript/Python/etc., no Rust or blockchain background.
Duration: 6 weeks at ~5 hours/week.

### Week 1: Rust Fundamentals

**Concepts**: Ownership, borrowing, references, lifetimes (basics), structs, enums, Result, Option, pattern matching, iterators.

**Code Walkthrough**: Build a simple CLI tool in Rust that manages a to-do list with structs and enums.

**Exercise**: Write a Rust program that:
1. Defines a `Wallet` struct with `name: String` and `balance: u64`
2. Implements methods: `new()`, `deposit()`, `withdraw()` (returns Result)
3. Handles insufficient balance with a custom error enum
4. Demonstrates ownership — pass wallet to a function and return it back

**Key Outcome**: Comfortable with Rust ownership model and error handling.

### Week 2: Solana Concepts

**Concepts**: Accounts, programs, transactions, instructions, signers, fees, rent, validators, slots, epochs. The account model vs traditional databases. How data lives on-chain.

**Code Walkthrough**: Walk through a simple transaction on Solana Explorer. Identify the signer, instructions, accounts, and fees.

**Exercise**: Using `@solana/web3.js`:
1. Generate a keypair
2. Request airdrop on devnet
3. Send SOL to another address
4. Read an account's balance and data

**Key Outcome**: Understands the Solana account model and can interact with devnet.

### Week 3: First Anchor Program (Counter)

**Concepts**: Anchor framework, `#[program]` module, `#[derive(Accounts)]`, `#[account]`, account space calculation, `init`, `mut`, `Signer`.

**Code Walkthrough**: Build a counter program step by step — initialize, increment, read.

**Exercise**: Build a counter program with:
1. `initialize` — creates a counter account, sets count to 0, stores authority
2. `increment` — adds 1 to count (only authority can call)
3. `decrement` — subtracts 1 (cannot go below 0)
4. Write TypeScript tests for all three instructions

**Key Outcome**: Can write, deploy, and test a basic Anchor program on devnet.

### Week 4: PDAs (Note-Taking Program)

**Concepts**: Program Derived Addresses, seeds, bumps, `findProgramAddress`, PDA as deterministic storage, canonical bumps.

**Code Walkthrough**: Build a note-taking program where each user has their own PDA-based notes.

**Exercise**: Build a note program with:
1. `create_note` — creates a PDA with seeds `[b"note", user.key(), &note_id.to_le_bytes()]`
2. `update_note` — modifies the note content (only owner can update)
3. `delete_note` — closes the account and reclaims rent
4. Support multiple notes per user (indexed by note_id)

**Key Outcome**: Understands PDA derivation and can use PDAs for user-specific storage.

### Week 5: CPIs (Token Vault)

**Concepts**: Cross-program invocation, `CpiContext`, `invoke_signed`, PDA as signer, SPL Token program, mint, transfer, burn.

**Code Walkthrough**: Build a vault that wraps token deposits and withdrawals using CPIs.

**Exercise**: Build a token vault program with:
1. `create_vault` — initializes a PDA-owned token account
2. `deposit` — transfers tokens from user to vault via CPI
3. `withdraw` — transfers tokens from vault to user with PDA signing
4. Add a timelock: deposits cannot be withdrawn for N slots

**Key Outcome**: Can compose programs using CPIs and use PDAs as signers.

### Week 6: Testing and Deployment

**Concepts**: `anchor test`, bankrun, local validator, devnet deployment, program upgrades, IDL publishing.

**Code Walkthrough**: Full test suite for the vault program. Deploy to devnet. Verify on Solana Explorer.

**Exercise**:
1. Write comprehensive tests for the vault program (happy path + error cases)
2. Deploy to devnet using `anchor deploy`
3. Interact with the deployed program using a TypeScript client
4. Publish the IDL with `anchor idl init`

**Key Outcome**: Can test, deploy, and operate a Solana program on devnet.

---

## Track B: EVM Developer (Knows Solidity, Learning Rust/Solana)

Target: Solidity developer transitioning to Solana.
Duration: 6 days of intensive work.

### Day 1: Account Model Mental Shift

**Key Differences**:
- Solidity: contract storage is internal. Solana: all data lives in accounts passed to the program.
- Solidity: `msg.sender`. Solana: `Signer<'info>` in the accounts struct.
- Solidity: deploy and data share an address. Solana: program and data accounts are separate.
- Solidity: sequential execution. Solana: parallel execution via declared accounts.

**Exercise**: Take a simple Solidity contract (e.g., a counter). Map each concept to Solana equivalents on paper. Identify what becomes an account, what becomes an instruction, what becomes a constraint.

### Day 2: Anchor Basics

**Concepts**: Anchor as the "Hardhat" of Solana. Project structure, `#[program]`, `#[derive(Accounts)]`, `#[account]`.

**Exercise**: Rewrite the Solidity counter from Day 1 as an Anchor program. Initialize, increment, read. Deploy to devnet. Compare gas costs vs compute units.

### Day 3: PDAs and Seeds

**Mapping**: PDAs are the Solana equivalent of contract storage slots. Seeds are like mapping keys.

| Solidity | Anchor |
|----------|--------|
| `mapping(address => uint)` | PDA with seeds `[b"balance", user.key()]` |
| `mapping(address => mapping(uint => Order))` | PDA with seeds `[b"order", user.key(), &id.to_le_bytes()]` |
| `address public owner` | `has_one = authority` constraint |

**Exercise**: Build a simple on-chain registry (like ENS) using PDAs. Users register a name that maps to their wallet.

### Day 4: Token Operations

**Mapping**: SPL Token is like ERC-20 but the token program is shared. Mints and token accounts are separate.

| Solidity | Solana |
|----------|--------|
| `ERC20.transfer(to, amount)` | CPI to `token::transfer` |
| `ERC20.approve(spender, amount)` | CPI to `token::approve` |
| `ERC20.mint(to, amount)` | CPI to `token::mint_to` (with mint authority) |

**Exercise**: Build a token faucet program. Create a mint with PDA authority. Users call `claim` to receive tokens (max once per user).

### Day 5: CPIs and Composability

**Mapping**: CPIs are like calling other contracts. But you must pass all accounts explicitly — no hidden state reads.

**Exercise**: Build a program that swaps tokens by calling a mock DEX program via CPI. Practice composing multiple CPIs in a single instruction.

### Day 6: Testing and Deploying

**Exercise**: Full test suite for Day 4's faucet program. Deploy to devnet. Write a frontend that interacts with the program using `@coral-xyz/anchor`.

---

## Track C: Advanced (Knows Rust, Some Solana)

Target: Developer who has written Anchor programs but wants deeper understanding.
Duration: 5 self-paced modules.

### Module 1: SVM Internals

Deep dive into the transaction pipeline, Sealevel parallel execution, compute budgets, memory layout, BPF constraints.

**Exercise**: Write a program that intentionally exceeds the compute budget. Profile it using `solana-program-test` with logging. Optimize it to fit within budget.

### Module 2: Optimization

Zero-copy deserialization, stack vs heap allocation, compute unit reduction techniques, account data packing, minimizing CPI overhead.

**Exercise**: Take a program with 300K CU usage. Optimize it below 100K CU using zero-copy, removal of unnecessary logs, and tight data packing. Measure before and after.

### Module 3: Security Patterns

Signer verification, owner checks, PDA validation, re-initialization attacks, arithmetic overflow, closing accounts safely, type cosplay prevention.

**Exercise**: Audit a deliberately vulnerable program (provided). Find and fix all 6 vulnerabilities. Write tests that exploit each vulnerability before the fix.

### Module 4: Advanced CPIs

Integration with Jupiter (swap), Orca Whirlpool (LP), Marinade (liquid staking), and other protocols. Multi-hop CPIs. Handling slippage and price impact.

**Exercise**: Build a program that performs a Jupiter swap and then deposits the output into an Orca Whirlpool — all in a single transaction.

### Module 5: Custom Serialization

When to skip Anchor. Raw Borsh serialization. Zero-copy with raw pointers. Building programs without Anchor for maximum control and minimum CU.

**Exercise**: Rewrite a simple Anchor program as a native Solana program (no Anchor). Compare CU usage, binary size, and developer experience.

---

## Assessment Rubric

Each exercise is evaluated on:

1. **Correctness** — Does it work? Does it handle edge cases?
2. **Security** — Are all signers checked? Are PDAs validated? Is arithmetic safe?
3. **Style** — Is the code idiomatic Rust? Is it well-organized?
4. **Efficiency** — Reasonable compute unit usage? Minimal wasted space?
5. **Testing** — Are there tests? Do they cover error cases?
