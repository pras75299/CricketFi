# CricketFi — Database Schema

## 🏗️ Architecture Split

```
On-Chain (Solana/Anchor)          Off-Chain (PostgreSQL/Supabase)
─────────────────────────         ──────────────────────────────
ContestAccount                    users
TeamAccount                       matches
ScoreCommitAccount                cricket_players
PlatformConfigAccount             contests (mirror)
                                  user_teams
                                  transactions
                                  player_points
```

---

## ⛓️ ON-CHAIN ACCOUNTS (Anchor/Rust)

### 1. `ContestAccount`
```rust
#[account]
pub struct ContestAccount {
    pub contest_id: [u8; 16],         // UUID as bytes
    pub authority: Pubkey,             // Platform admin pubkey
    pub match_id: [u8; 16],           // Reference to off-chain match
    pub entry_fee_lamports: u64,       // Entry fee in USDC (6 decimals)
    pub prize_pool_lamports: u64,      // Total collected
    pub max_teams: u32,                // Max participants
    pub current_teams: u32,            // Current participant count
    pub platform_fee_bps: u16,         // Fee in basis points (500 = 5%)
    pub status: ContestStatus,         // Pending/Live/Completed/Cancelled
    pub winner_count: u8,              // Top N winners share pool
    pub created_at: i64,               // Unix timestamp
    pub locked_at: i64,               // Match start time (team lock)
    pub settled_at: i64,              // Settlement timestamp
    pub score_commit_hash: [u8; 32],  // SHA256 of final scores
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum ContestStatus {
    Pending,
    Live,
    Completed,
    Cancelled,
}
```
**PDA**: `["contest", contest_id]`

---

### 2. `TeamAccount`
```rust
#[account]
pub struct TeamAccount {
    pub team_id: [u8; 16],
    pub contest: Pubkey,              // ContestAccount pubkey
    pub owner: Pubkey,                // User wallet
    pub player_ids: [u32; 11],        // 11 selected player IDs
    pub captain_id: u32,              // Captain (2x points)
    pub vice_captain_id: u32,         // Vice captain (1.5x)
    pub credits_used: u16,            // Must be <= 10000 (100.00)
    pub total_points: i32,            // Final score (set on settlement)
    pub rank: u32,                    // Final rank (set on settlement)
    pub prize_amount: u64,            // Prize in USDC lamports
    pub prize_claimed: bool,
    pub created_at: i64,
    pub bump: u8,
}
```
**PDA**: `["team", contest_pubkey, owner_pubkey]`

---

### 3. `ScoreCommitAccount`
```rust
#[account]
pub struct ScoreCommitAccount {
    pub contest: Pubkey,
    pub committed_by: Pubkey,          // Oracle/admin pubkey
    pub score_merkle_root: [u8; 32],   // Merkle root of all scores
    pub committed_at: i64,
    pub bump: u8,
}
```
**PDA**: `["score_commit", contest_pubkey]`

---

### 4. `PlatformConfig`
```rust
#[account]
pub struct PlatformConfig {
    pub authority: Pubkey,
    pub treasury: Pubkey,              // Fee collection wallet
    pub oracle: Pubkey,                // Score oracle pubkey
    pub usdc_mint: Pubkey,
    pub default_fee_bps: u16,
    pub bump: u8,
}
```
**PDA**: `["platform_config"]`

---

## 🗃️ OFF-CHAIN SCHEMA (PostgreSQL)

### `users`
```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address  VARCHAR(44) UNIQUE NOT NULL,    -- Solana pubkey
  privy_id        VARCHAR(100) UNIQUE,            -- Privy user ID
  username        VARCHAR(30) UNIQUE,
  email           VARCHAR(255),
  avatar_url      TEXT,
  level           INTEGER DEFAULT 1,
  total_contests  INTEGER DEFAULT 0,
  total_wins      INTEGER DEFAULT 0,
  total_earnings  NUMERIC(18,6) DEFAULT 0,        -- USDC
  kycVerified     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_users_wallet ON users(wallet_address);
```

---

### `matches`
```sql
CREATE TABLE matches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id     VARCHAR(50) UNIQUE NOT NULL,    -- CricAPI match ID
  series_name     VARCHAR(100) NOT NULL,          -- e.g., "IPL 2025"
  team_home       VARCHAR(50) NOT NULL,           -- e.g., "MI"
  team_away       VARCHAR(50) NOT NULL,           -- e.g., "CSK"
  team_home_full  VARCHAR(100),
  team_away_full  VARCHAR(100),
  venue           VARCHAR(200),
  format          VARCHAR(10) NOT NULL,           -- T20 / ODI / Test
  match_start_at  TIMESTAMPTZ NOT NULL,
  status          VARCHAR(20) DEFAULT 'upcoming', -- upcoming/live/completed
  result          TEXT,                           -- "MI won by 5 wickets"
  scorecard       JSONB,                          -- Full scorecard JSON
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_matches_start ON matches(match_start_at);
CREATE INDEX idx_matches_status ON matches(status);
```

---

### `cricket_players`
```sql
CREATE TABLE cricket_players (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id     VARCHAR(50) UNIQUE NOT NULL,    -- CricAPI player ID
  name            VARCHAR(100) NOT NULL,
  full_name       VARCHAR(150),
  role            VARCHAR(20) NOT NULL,            -- batsman/bowler/allrounder/wk
  batting_style   VARCHAR(30),
  bowling_style   VARCHAR(50),
  nationality     VARCHAR(50),
  ipl_team        VARCHAR(50),
  image_url       TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `match_squads`
```sql
CREATE TABLE match_squads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id        UUID REFERENCES matches(id),
  player_id       UUID REFERENCES cricket_players(id),
  team_side       VARCHAR(10) NOT NULL,           -- home/away
  credit_value    NUMERIC(4,2) NOT NULL,          -- e.g., 9.5 credits
  is_playing_xi   BOOLEAN DEFAULT FALSE,          -- confirmed in XI
  batting_order   INTEGER,
  UNIQUE(match_id, player_id)
);
```

---

### `contests`
```sql
CREATE TABLE contests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  on_chain_address  VARCHAR(44) UNIQUE,           -- Solana PDA address
  match_id          UUID REFERENCES matches(id) NOT NULL,
  name              VARCHAR(100) NOT NULL,
  contest_type      VARCHAR(20) NOT NULL,         -- h2h/small/mega/free
  entry_fee_usdc    NUMERIC(10,6) NOT NULL,
  prize_pool_usdc   NUMERIC(10,6) DEFAULT 0,
  max_teams         INTEGER NOT NULL,
  current_teams     INTEGER DEFAULT 0,
  winner_count      INTEGER NOT NULL,
  prize_distribution  JSONB NOT NULL,             -- [{rank: 1, pct: 60}, ...]
  platform_fee_bps  INTEGER DEFAULT 500,
  status            VARCHAR(20) DEFAULT 'upcoming',
  guaranteed_pool   BOOLEAN DEFAULT FALSE,
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_contests_match ON contests(match_id);
CREATE INDEX idx_contests_status ON contests(status);
```

---

### `user_teams`
```sql
CREATE TABLE user_teams (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  on_chain_address  VARCHAR(44) UNIQUE,
  contest_id        UUID REFERENCES contests(id) NOT NULL,
  user_id           UUID REFERENCES users(id) NOT NULL,
  team_name         VARCHAR(50),
  players           JSONB NOT NULL,              -- [{player_id, is_captain, is_vice_captain, credits}]
  captain_player_id UUID REFERENCES cricket_players(id),
  vc_player_id      UUID REFERENCES cricket_players(id),
  credits_used      NUMERIC(5,2) NOT NULL,
  total_points      NUMERIC(8,2),
  rank              INTEGER,
  prize_won_usdc    NUMERIC(10,6),
  prize_claimed     BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contest_id, user_id)               -- 1 team per contest per user (v1)
);
CREATE INDEX idx_user_teams_contest ON user_teams(contest_id);
CREATE INDEX idx_user_teams_user ON user_teams(user_id);
```

---

### `player_points`
```sql
CREATE TABLE player_points (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id    UUID REFERENCES matches(id),
  player_id   UUID REFERENCES cricket_players(id),
  -- Batting
  runs        INTEGER DEFAULT 0,
  balls_faced INTEGER DEFAULT 0,
  fours       INTEGER DEFAULT 0,
  sixes       INTEGER DEFAULT 0,
  -- Bowling
  overs       NUMERIC(4,1) DEFAULT 0,
  wickets     INTEGER DEFAULT 0,
  runs_given  INTEGER DEFAULT 0,
  maidens     INTEGER DEFAULT 0,
  -- Fielding
  catches     INTEGER DEFAULT 0,
  stumpings   INTEGER DEFAULT 0,
  run_outs    INTEGER DEFAULT 0,
  -- Computed
  fantasy_points  NUMERIC(7,2),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, player_id)
);
```

---

### `transactions`
```sql
CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  type            VARCHAR(20) NOT NULL,         -- entry/prize/refund/fee
  amount_usdc     NUMERIC(10,6) NOT NULL,
  tx_signature    VARCHAR(88),                  -- Solana transaction signature
  contest_id      UUID REFERENCES contests(id),
  status          VARCHAR(20) DEFAULT 'pending', -- pending/confirmed/failed
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at    TIMESTAMPTZ
);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_sig ON transactions(tx_signature);
```

---

## 🔗 Entity Relationship Diagram

```
users ──────────────< user_teams >──────── contests
                                               │
matches ──────────────────────────────────────┘
   │
   ├──< match_squads >── cricket_players
   │
   └──< player_points
```
