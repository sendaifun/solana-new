# Common Patterns

> Curated examples from [arcium-hq/examples](https://github.com/arcium-hq/examples).
> Not exhaustive - use MCP: "arcium examples" for more patterns.

## Patterns
1. Stateless (Coinflip) -- input, compute, reveal
2. Persistent State (Voting) -- Mxe across computations
3. Multi-Party Input (RPS) -- multiple encrypted inputs
4. Randomness (Blackjack) -- ArcisRNG + Pack
5. Complex Comparison (Auction) -- encrypted bid tracking
6. Efficient Packing -- Pack\<T\> compression
7. Boolean Flag -- simulate early exit
8. Option-Like -- replace Option\<T\>
9. State Machine -- enum as u8 + validation
10. Pubkey Handling -- SerializedSolanaPublicKey
11. Multiple Nonces -- per-party nonce tracking
12. Combining Patterns -- architecture framework
13. Safe Division -- guard against secret zero
14. EncData -- smaller callbacks
15. Filter Alternative -- manual loop replacement

## 1. Stateless Computation (Coinflip)

No persistent state. Input -> Compute -> Reveal.

```rust
#[instruction]
pub fn flip(input: Enc<Shared, UserChoice>) -> bool {
    let input = input.to_arcis();
    let toss = ArcisRNG::bool();
    (input.choice == toss).reveal()
}
```

**Source**: [`coinflip/encrypted-ixs/src/lib.rs`](https://github.com/arcium-hq/examples/blob/main/coinflip/encrypted-ixs/src/lib.rs)

---

## 2. Persistent Encrypted State (Voting)

State encrypted with `Mxe` persists across computations.

```rust
#[derive(Copy, Clone)]
pub struct VoteStats { yes: u64, no: u64 }

#[instruction]
pub fn init_vote_stats() -> Enc<Mxe, VoteStats> {
    let vote_stats = VoteStats { yes: 0, no: 0 };
    Mxe::get().from_arcis(vote_stats)
}

#[instruction]
pub fn vote(
    vote_ctxt: Enc<Shared, UserVote>,
    vote_stats_ctxt: Enc<Mxe, VoteStats>,
) -> Enc<Mxe, VoteStats> {
    let user_vote = vote_ctxt.to_arcis();
    let mut vote_stats = vote_stats_ctxt.to_arcis();
    if user_vote.vote { vote_stats.yes += 1 } else { vote_stats.no += 1 }
    vote_stats_ctxt.owner.from_arcis(vote_stats)
}

#[instruction]
pub fn reveal_result(vote_stats_ctxt: Enc<Mxe, VoteStats>) -> bool {
    let vote_stats = vote_stats_ctxt.to_arcis();
    (vote_stats.yes > vote_stats.no).reveal()
}
```

**Source**: [`voting/encrypted-ixs/src/lib.rs`](https://github.com/arcium-hq/examples/blob/main/voting/encrypted-ixs/src/lib.rs)

---

## 3. Multi-Party Input (Rock Paper Scissors)

Multiple parties submit encrypted inputs.

```rust
#[derive(Copy, Clone)]
pub struct GameMoves { player_a_move: u8, player_b_move: u8 }

#[derive(Copy, Clone)]
pub struct PlayersMove { player: u8, player_move: u8 }

#[instruction]
pub fn player_move(
    players_move_ctxt: Enc<Shared, PlayersMove>,
    game_ctxt: Enc<Mxe, GameMoves>,
) -> Enc<Mxe, GameMoves> {
    let players_move = players_move_ctxt.to_arcis();
    let mut game_moves = game_ctxt.to_arcis();

    if players_move.player == 0 && game_moves.player_a_move == 3 && players_move.player_move < 3 {
        game_moves.player_a_move = players_move.player_move;
    } else if players_move.player == 1 && game_moves.player_b_move == 3 && players_move.player_move < 3 {
        game_moves.player_b_move = players_move.player_move;
    }

    game_ctxt.owner.from_arcis(game_moves)
}
```

**Source**: [`rock_paper_scissors/against-player/encrypted-ixs/src/lib.rs`](https://github.com/arcium-hq/examples/blob/main/rock_paper_scissors/against-player/encrypted-ixs/src/lib.rs)

---

## 4. Randomness (Blackjack)

Cryptographically secure randomness via `ArcisRNG`. Uses `Pack<T>` for efficient array storage.

```rust
type Deck = Pack<[u8; 52]>;
type Hand = Pack<[u8; 11]>;

#[instruction]
pub fn shuffle_and_deal_cards(
    client: Shared, client_again: Shared,
) -> (Enc<Mxe, Deck>, Enc<Mxe, Hand>, Enc<Shared, Hand>, Enc<Shared, u8>) {
    let mut initial_deck: [u8; 52] = INITIAL_DECK;
    ArcisRNG::shuffle(&mut initial_deck);

    let deck_packed: Deck = Pack::new(initial_deck);
    let deck = Mxe::get().from_arcis(deck_packed);

    let mut dealer_cards = [53u8; 11];
    dealer_cards[0] = initial_deck[1];
    dealer_cards[1] = initial_deck[3];
    let dealer_hand = Mxe::get().from_arcis(Pack::new(dealer_cards));

    let mut player_cards = [53u8; 11];
    player_cards[0] = initial_deck[0];
    player_cards[1] = initial_deck[2];
    let player_hand = client.from_arcis(Pack::new(player_cards));

    // Mxe::get() for MXE-encrypted outputs, Shared params for client-encrypted outputs
    (deck, dealer_hand, player_hand, client_again.from_arcis(initial_deck[1]))
}
```

**Source**: [`blackjack/encrypted-ixs/src/lib.rs`](https://github.com/arcium-hq/examples/blob/main/blackjack/encrypted-ixs/src/lib.rs)

---

## 5. Complex Comparison (Sealed-Bid Auction)

Track highest/second-highest with encrypted comparisons. Uses `SerializedSolanaPublicKey` for bidder identity.

```rust
#[derive(Copy, Clone)]
pub struct Bid {
    pub bidder: SerializedSolanaPublicKey,
    pub amount: u64,
}

#[derive(Copy, Clone)]
pub struct AuctionState {
    pub highest_bid: u64,
    pub highest_bidder: SerializedSolanaPublicKey,
    pub second_highest_bid: u64,
    pub bid_count: u16,
}

#[instruction]
pub fn place_bid(
    bid_ctxt: Enc<Shared, Bid>,
    state_ctxt: Enc<Mxe, AuctionState>,
) -> Enc<Mxe, AuctionState> {
    let bid = bid_ctxt.to_arcis();
    let mut state = state_ctxt.to_arcis();

    if bid.amount > state.highest_bid {
        state.second_highest_bid = state.highest_bid;
        state.highest_bid = bid.amount;
        state.highest_bidder = bid.bidder;
    } else if bid.amount > state.second_highest_bid {
        state.second_highest_bid = bid.amount;
    }

    state.bid_count += 1;
    state_ctxt.owner.from_arcis(state)
}
```

**Source**: [`sealed_bid_auction/encrypted-ixs/src/lib.rs`](https://github.com/arcium-hq/examples/blob/main/sealed_bid_auction/encrypted-ixs/src/lib.rs)

---

## 6. Efficient Packing (Pack\<T\>)

`Pack<T>` bit-packs arrays/structs into fewer field elements for onchain storage (~26x compression for byte arrays).

```rust
// Circuit: define a type alias, pack with Pack::new(), unpack with .unpack()
type Deck = Pack<[u8; 52]>;
type Hand = Pack<[u8; 11]>;

let deck_packed: Deck = Pack::new(initial_deck);  // [u8; 52] -> Pack<[u8; 52]>
let deck_array: [u8; 52] = deck_packed.unpack();  // Pack<[u8; 52]> -> [u8; 52]

// Works with Enc as expected
let encrypted_deck: Enc<Mxe, Deck> = Mxe::get().from_arcis(Pack::new(cards));
let cards: [u8; 52] = encrypted_deck.to_arcis().unpack();
```

```typescript
// Client: generated packers via Arcium compiler
import { circuits } from './build/circuits';

const packed = circuits.MyStruct.pack({ board: Array.from(boardData) });
const ciphertext = cipher.encrypt(packed, nonce);
```

**Source**: [`blackjack/encrypted-ixs/src/lib.rs`](https://github.com/arcium-hq/examples/blob/main/blackjack/encrypted-ixs/src/lib.rs)

---

## 7. Boolean Flag Pattern

Simulate early exit without `break`:

```rust
let mut found = false;
for i in 0..MAX_ITEMS {
    if !found && items[i] == target {
        found = true;
        result_index = i;
    }
}
```

---

## 8. Option-Like Pattern

Replace `Option<T>` with explicit flag:

```rust
#[derive(Copy, Clone)]
pub struct MaybeValue {
    pub value: u64,
    pub is_some: bool,
}

// Setting a value
let mut maybe = MaybeValue { value: 0, is_some: false };
if condition {
    maybe.value = computed;
    maybe.is_some = true;
}

// Reading the value (check flag first)
if maybe.is_some {
    let val = maybe.value;  // Safe to use
}
```

---

## 9. State Machine Pattern (Blackjack)

Use enums for game state, validate transitions before processing:

```rust
// In Solana program (not circuit — enums not supported in Arcis)
#[repr(u8)]
pub enum GameState {
    Initial = 0,
    PlayerTurn = 1,
    DealerTurn = 2,
    Resolving = 3,
    Resolved = 4,
}

#[account]
pub struct BlackjackGame {
    pub game_state: GameState,
    pub deck: [[u8; 32]; 2],
    // ...
}

// Always validate state before transition
pub fn player_hit(ctx: Context<PlayerHit>, computation_offset: u64, _game_id: u64) -> Result<()> {
    require!(
        ctx.accounts.blackjack_game.game_state == GameState::PlayerTurn,
        ErrorCode::InvalidGameState
    );
    // ... queue computation
}
```

**Source**: [`blackjack/programs/blackjack/src/lib.rs`](https://github.com/arcium-hq/examples/blob/main/blackjack/programs/blackjack/src/lib.rs)

---

## 10. Pubkey Handling (SerializedSolanaPublicKey)

Use `SerializedSolanaPublicKey` for Solana pubkeys in circuits. Internally stored as `{ lo: u128, hi: u128 }`.

```rust
// Circuit struct
#[derive(Copy, Clone)]
pub struct Bid {
    pub bidder: SerializedSolanaPublicKey,
    pub amount: u64,
}

// Initialize with zero
let empty = SerializedSolanaPublicKey { lo: 0, hi: 0 };

// Assign directly from another SerializedSolanaPublicKey
state.highest_bidder = bid.bidder;

// Convert to SolanaPublicKey for comparison/operations
let pk = SolanaPublicKey::from_serialized(bid.bidder);
```

```typescript
// Client-side: encrypt pubkey as two u128 values (lo, hi)
const pubkeyBytes = bidder.toBytes(); // Uint8Array[32]
const lo = deserializeLE(pubkeyBytes.slice(0, 16));
const hi = deserializeLE(pubkeyBytes.slice(16, 32));
const ciphertext = cipher.encrypt([lo, hi, amount], nonce);
```

**Source**: [`sealed_bid_auction/encrypted-ixs/src/lib.rs`](https://github.com/arcium-hq/examples/blob/main/sealed_bid_auction/encrypted-ixs/src/lib.rs)

---

## 11. Multiple Nonces Pattern (Blackjack)

When tracking different encrypted states for different parties:

```rust
#[account]
pub struct BlackjackGame {
    pub deck_nonce: u128,    // For deck encryption
    pub client_nonce: u128,  // For player hand
    pub dealer_nonce: u128,  // For dealer hand
}
```

Each encryption context needs its own nonce to prevent correlation attacks.

**Source**: [`blackjack/programs/blackjack/src/lib.rs`](https://github.com/arcium-hq/examples/blob/main/blackjack/programs/blackjack/src/lib.rs)

---

## 12. Combining Multiple Patterns

Complex apps combine patterns. Here's a framework for architecting multi-pattern apps.

### Example: Sealed-Bid Auction Architecture

| Pattern | Purpose | Implementation |
|---------|---------|----------------|
| Persistent State (#2) | Store bids | `Enc<Mxe, AuctionState>` |
| Multi-Party Input (#3) | Each bidder submits | Multiple `Enc<Shared, Bid>` inputs |
| Comparisons (#5) | Find highest bid | Compare encrypted bids |
| State Machine (#9) | Auction phases | `status: u8` with validation |

### Architecture Steps

1. **Define state struct** with all encrypted fields:
   ```rust
   #[derive(Copy, Clone)]
   pub struct AuctionState {
       highest_bid: u64,
       highest_bidder: SerializedSolanaPublicKey,
       status: u8,  // 0=open, 1=closed, 2=revealed
   }
   ```

2. **Map out computation phases** (init -> bidding -> resolution):
   - `init_auction`: Create `Enc<Mxe, AuctionState>` with zero values
   - `place_bid`: Accept `Enc<Shared, Bid>`, compare, update state
   - `close_auction`: Validate status, set to closed
   - `reveal_winner`: `.reveal()` winner after close

3. **Choose encryption context per field** (MCP: search "Enc Shared Mxe types"):
   - Bid amounts: `Enc<Mxe, T>` (persists across bids, never revealed to clients)
   - Final winner: `.reveal()` (public after auction ends)

4. **Add state validation** before each transition (Solana program side):
   ```rust
   require!(auction.status == 0, ErrorCode::AuctionClosed);
   ```

5. **Plan account creation** (init) vs updates (callbacks):
   - Init: Creates account + queues first computation
   - Updates: Callback writes back to existing account

### Common Pattern Combinations

| App Type | Patterns Used |
|----------|---------------|
| Game (poker, blackjack) | Persistent State + Randomness + Multi-Party + State Machine |
| DeFi (auctions, AMM) | Persistent State + Comparisons + Multi-Party |
| Voting | Multi-Party + Aggregation + Reveal at end |
| Identity (credit check) | Re-encryption (Sealing) + Comparisons |

---

## 13. Safe Division (Guard Against Secret Zero)

In MPC, division by a secret value that is zero = **undefined behavior** (garbage, no error).
Both branches of if/else always execute, so the division runs regardless of the guard.
Use a safe divisor to ensure the division never actually divides by zero:

```rust
let is_valid = divisor != 0;
let safe_divisor = if is_valid { divisor } else { 1 };
let result = if is_valid { numerator / safe_divisor } else { 0 };
// Both branches execute. safe_divisor ensures division never hits zero.
```

---

## 14. EncData for Smaller Callbacks

Return `EncData<T>` instead of `Enc<Owner, T>` when hitting the 1232-byte callback limit.
`EncData<T>` omits pubkey (32B) + nonce (16B) metadata, saving ~48 bytes per output.

```rust
#[instruction]
pub fn compare_keys(
    pk1: Enc<Shared, SerializedSolanaPublicKey>,
    pk2: Enc<Shared, SerializedSolanaPublicKey>,
    observer: Shared,
) -> EncData<bool> {
    let k1 = SolanaPublicKey::from_serialized(pk1.to_arcis());
    let k2 = SolanaPublicKey::from_serialized(pk2.to_arcis());
    observer.from_arcis(k1 == k2).data  // .data extracts EncData from Enc
}
```

Program side receives `EncDataStruct<N>` where N = number of field elements (e.g., `EncData<bool>` -> `EncDataStruct<1>`).

---

## 15. Filter Alternative

`.filter()` is unsupported (variable-length output). Use manual loop with fixed-size output:

```rust
#[instruction]
fn filter_above(arr: [u8; 32], threshold: u8) -> ([u8; 32], u8) {
    let mut result = [0u8; 32];
    let mut count: u8 = 0;
    for i in 0..32 {
        if arr[i] > threshold {
            result[count as usize] = arr[i];
            count += 1;
        }
    }
    (result, count)  // Fixed-size array + actual count
}
```

Same approach works for `.find()`, `.any()`, `.all()` -- accumulate into fixed-size output.

---

## See Also

- [Troubleshooting](../references/troubleshooting.md) - Common pattern mistakes
- MCP: "arcis types" for type constraints
- MCP: "arcium examples" for more patterns
