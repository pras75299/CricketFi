# CricketFi — Smart Contract Architecture

## 🏗️ Program Overview

**Program Name**: `cricketfi`  
**Framework**: Anchor 0.30  
**Language**: Rust  
**Network**: Solana (devnet → mainnet-beta)

```
cricketfi/
├── programs/
│   └── cricketfi/
│       ├── src/
│       │   ├── lib.rs              # Entry point, instruction routing
│       │   ├── instructions/
│       │   │   ├── initialize.rs   # Platform setup
│       │   │   ├── create_contest.rs
│       │   │   ├── join_contest.rs
│       │   │   ├── commit_scores.rs
│       │   │   ├── settle_contest.rs
│       │   │   ├── claim_prize.rs
│       │   │   └── cancel_contest.rs
│       │   ├── state/
│       │   │   ├── platform_config.rs
│       │   │   ├── contest.rs
│       │   │   └── team.rs
│       │   └── errors.rs
│       └── Cargo.toml
└── tests/
    └── cricketfi.ts               # Anchor TypeScript tests
```

---

## 📋 Instructions

### 1. `initialize_platform`
Set up the platform config PDA. Called once by deployer.
```rust
pub fn initialize_platform(
    ctx: Context<InitializePlatform>,
    default_fee_bps: u16,         // e.500 = 5%
    oracle_pubkey: Pubkey,
) -> Result<()>
```
**Accounts**:
- `platform_config` PDA (init) — `["platform_config"]`
- `authority` (signer, payer)
- `treasury` (writable) — fee collection wallet
- `usdc_mint` — USDC SPL token mint

---

### 2. `create_contest`
Creates a new contest PDA and initializes the prize pool vault.
```rust
pub fn create_contest(
    ctx: Context<CreateContest>,
    contest_id: [u8; 16],
    match_id: [u8; 16],
    entry_fee: u64,            // USDC amount (6 decimals)
    max_teams: u32,
    winner_count: u8,
    prize_distribution: Vec<PrizeTier>,  // [{rank, bps}]
    lock_time: i64,            // Unix timestamp of match start
) -> Result<()>
```
**Accounts**:
- `platform_config` PDA (read)
- `contest` PDA (init) — `["contest", contest_id]`
- `prize_vault` ATA (init) — USDC token account owned by contest PDA
- `authority` (signer) — must match platform_config.authority

---

### 3. `join_contest`
User pays entry fee and creates a team PDA.
```rust
pub fn join_contest(
    ctx: Context<JoinContest>,
    team_id: [u8; 16],
    player_ids: [u32; 11],
    captain_id: u32,
    vice_captain_id: u32,
    credits_used: u16,         // Validated off-chain, stored for reference
) -> Result<()>
```
**Accounts**:
- `contest` PDA (writable)
- `team` PDA (init) — `["team", contest, user_wallet]`
- `prize_vault` (writable) — receives entry fee
- `user_usdc_ata` (writable) — user pays from here
- `user` (signer)
- `token_program`

**Validations**:
- Contest status must be `Pending`
- Current time < `lock_time`
- `current_teams < max_teams`
- Only 1 team per wallet per contest (enforced by PDA uniqueness)

---

### 4. `commit_scores`
Oracle submits the Merkle root of final scores after match.
```rust
pub fn commit_scores(
    ctx: Context<CommitScores>,
    contest_id: [u8; 16],
    score_merkle_root: [u8; 32],
    score_hash: [u8; 32],
) -> Result<()>
```
**Accounts**:
- `platform_config` PDA (read)
- `contest` PDA (writable)
- `score_commit` PDA (init) — `["score_commit", contest]`
- `oracle` (signer) — must match `platform_config.oracle`

**Effect**: Sets `contest.status = Completed`, stores merkle root.

---

### 5. `settle_contest`
Admin triggers prize distribution. Iterates winners and transfers USDC.
```rust
pub fn settle_contest(
    ctx: Context<SettleContest>,
    winners: Vec<WinnerEntry>,   // [{team_pda, rank, prize_amount}]
) -> Result<()>
```
> **Note**: Due to Solana compute limits, settlement may be split across multiple transactions for mega contests (batch of 10 winners per tx).

**Accounts**:
- `contest` PDA (writable)
- `prize_vault` (writable)
- `platform_treasury` (writable) — receives platform fee
- For each winner: `team` PDA + `user_usdc_ata`
- `authority` (signer)

**Prize Math**:
```
platform_fee = total_pool × fee_bps / 10000
distributable = total_pool - platform_fee
winner_prize = distributable × tier_bps / 10000
```

---

### 6. `claim_prize`  *(alternative to auto-settle)*
User claims prize themselves using merkle proof.
```rust
pub fn claim_prize(
    ctx: Context<ClaimPrize>,
    rank: u32,
    prize_amount: u64,
    merkle_proof: Vec<[u8; 32]>,
) -> Result<()>
```
**Use case**: Fallback for failed auto-settlement. User proves their rank via merkle proof.

---

### 7. `cancel_contest`
Refunds all entry fees if contest cancelled (e.g., match abandoned).
```rust
pub fn cancel_contest(ctx: Context<CancelContest>) -> Result<()>
```
**Accounts**: Contest PDA + all team PDAs (iteratively processed).  
**Fallback**: After 72h past lock_time with no score commit, users can self-withdraw.

---

## 🔐 PDA Summary

| Account | Seeds | Owner |
|---|---|---|
| `PlatformConfig` | `["platform_config"]` | Program |
| `ContestAccount` | `["contest", contest_id_bytes]` | Program |
| `TeamAccount` | `["team", contest_pubkey, user_pubkey]` | Program |
| `ScoreCommit` | `["score_commit", contest_pubkey]` | Program |
| `PrizeVault` (ATA) | Contest PDA as owner | Token Program |

---

## ⚠️ Error Codes

```rust
#[error_code]
pub enum CricketFiError {
    #[msg("Contest is not in pending status")]
    ContestNotPending,
    #[msg("Contest is full")]
    ContestFull,
    #[msg("Match has already started — team lock active")]
    TeamLockActive,
    #[msg("Invalid player selection — check credits or count")]
    InvalidTeamSelection,
    #[msg("Unauthorized oracle")]
    UnauthorizedOracle,
    #[msg("Scores already committed")]
    ScoresAlreadyCommitted,
    #[msg("Invalid merkle proof")]
    InvalidMerkleProof,
    #[msg("Prize already claimed")]
    AlreadyClaimed,
    #[msg("Insufficient USDC balance")]
    InsufficientBalance,
}
```

---

## 🔄 Full Contest Lifecycle

```
[Admin] create_contest ──► ContestAccount {status: Pending}
                                   │
[Users] join_contest × N ──────────► prize_vault += entry_fee × N
                                   │
         ┌── Match Start (lock_time) ──┐
         │   team creation blocked      │
                                   │
[Oracle] commit_scores ──────────► ContestAccount {status: Completed}
                                   │
[Admin]  settle_contest ──────────► USDC → winner wallets
                                   │   → treasury (platform fee)
                                   │
[Optional] Users claim_prize via merkle proof
```

---

## 🧪 Test Coverage Plan

```typescript
// cricketfi.ts
describe("CricketFi", () => {
  it("initializes platform config")
  it("creates a valid contest")
  it("allows users to join contest")
  it("prevents joining after lock time")
  it("prevents double-joining same contest")
  it("rejects invalid team (too many from one side)")
  it("oracle commits scores successfully")
  it("unauthorized oracle is rejected")
  it("settles prizes correctly with fee deduction")
  it("allows prize claim via merkle proof")
  it("cancels contest and refunds all users")
  it("handles 72h auto-refund timeout")
})
```
