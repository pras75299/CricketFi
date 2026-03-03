# CricketFi — API Specification

**Base URL**: `https://api.cricketfi.xyz/v1`  
**Auth**: Bearer JWT token (obtained via wallet signature or Privy)  
**Format**: JSON

---

## 🔑 Authentication

### `POST /auth/wallet`
Sign in with Solana wallet signature.
```json
// Request
{
  "wallet": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "message": "Sign in to CricketFi: <nonce>",
  "signature": "base58_signature_string"
}

// Response
{
  "token": "eyJhbG...",
  "user": { "id": "...", "wallet": "...", "username": null }
}
```

### `POST /auth/privy`
Exchange Privy token for CricketFi JWT.
```json
{ "privy_token": "privy_token_string" }
```

---

## 🏏 Matches

### `GET /matches`
List upcoming/live matches.
```
Query: ?status=upcoming|live|completed&format=T20&limit=20&offset=0
```
```json
{
  "data": [{
    "id": "uuid",
    "series_name": "IPL 2025",
    "team_home": "MI", "team_away": "CSK",
    "venue": "Wankhede Stadium, Mumbai",
    "match_start_at": "2025-04-06T14:00:00Z",
    "status": "upcoming",
    "contests_count": 12
  }],
  "total": 45
}
```

### `GET /matches/:id`
Get full match details with squad.
```json
{
  "id": "uuid",
  "series_name": "IPL 2025",
  "team_home": "MI", "team_away": "CSK",
  "squad": {
    "home": [{ "id": "...", "name": "Rohit Sharma", "role": "batsman", "credits": 9.5, "is_playing_xi": true }],
    "away": [...]
  },
  "scorecard": null
}
```

### `GET /matches/:id/live-scores`
Get real-time scoring data.
```json
{
  "match_id": "uuid",
  "status": "live",
  "current_innings": 1,
  "score": "142/3 (15.2 ov)",
  "player_points": [
    { "player_id": "...", "name": "Rohit Sharma", "points": 67.5 }
  ],
  "updated_at": "2025-04-06T15:45:00Z"
}
```

---

## 🏆 Contests

### `GET /contests`
List contests for a match.
```
Query: ?match_id=uuid&type=h2h|small|mega|free&status=upcoming
```
```json
{
  "data": [{
    "id": "uuid",
    "name": "Mega League",
    "entry_fee_usdc": "50.00",
    "prize_pool_usdc": "500000.00",
    "max_teams": 100000,
    "current_teams": 45231,
    "winner_count": 500,
    "top_prize_usdc": "100000.00",
    "status": "upcoming",
    "guaranteed_pool": true
  }]
}
```

### `GET /contests/:id`
Get contest details + prize breakdown.
```json
{
  "id": "uuid",
  "prize_distribution": [
    { "rank": 1, "percentage": 40, "amount_usdc": "200000" },
    { "rank_start": 2, "rank_end": 10, "percentage": 30, "amount_usdc": "..." }
  ],
  "on_chain_address": "SolanaPublicKey..."
}
```

### `GET /contests/:id/leaderboard`
```
Query: ?limit=50&offset=0
```
```json
{
  "data": [{
    "rank": 1,
    "username": "cricket_king",
    "team_name": "RohitXI",
    "total_points": 847.5,
    "prize_usdc": "200000"
  }],
  "my_rank": { "rank": 1432, "points": 512.0 }
}
```

---

## 👥 Teams

### `POST /teams` 🔐
Create a team for a contest. **Auth required.**
```json
// Request
{
  "contest_id": "uuid",
  "team_name": "My MI Team",
  "players": [
    { "player_id": "uuid", "is_captain": true, "is_vice_captain": false },
    { "player_id": "uuid", "is_captain": false, "is_vice_captain": true },
    ...9 more
  ]
}

// Response
{
  "team_id": "uuid",
  "on_chain_tx": "solana_tx_signature",
  "entry_fee_tx": "solana_tx_for_usdc_payment",
  "credits_used": 99.5,
  "valid": true
}
```

### `GET /teams/:id`
Get team details and points breakdown.
```json
{
  "id": "uuid",
  "players": [{
    "player_id": "...",
    "name": "Rohit Sharma",
    "role": "batsman",
    "is_captain": true,
    "base_points": 87.5,
    "multiplier": 2.0,
    "final_points": 175.0
  }],
  "total_points": 742.5,
  "rank": 142,
  "prize_won_usdc": "0"
}
```

### `GET /users/me/teams` 🔐
Get all teams created by logged-in user.
```
Query: ?contest_id=uuid&match_id=uuid
```

---

## 👤 Users

### `GET /users/me` 🔐
```json
{
  "id": "uuid",
  "wallet": "...",
  "username": "cricket_king",
  "level": 3,
  "stats": {
    "total_contests": 47,
    "total_wins": 12,
    "total_earnings_usdc": "2450.50",
    "win_rate": 25.5
  }
}
```

### `PATCH /users/me` 🔐
Update profile (username, avatar).

### `GET /users/me/transactions` 🔐
```json
{
  "data": [{
    "type": "prize",
    "amount_usdc": "500.00",
    "tx_signature": "5xK...",
    "contest_id": "uuid",
    "created_at": "..."
  }]
}
```

---

## 🎯 Scoring

### `GET /scoring/rules`
Get the complete scoring matrix.
```json
{
  "batting": {
    "run": 1, "four_bonus": 1, "six_bonus": 2,
    "half_century_bonus": 8, "century_bonus": 16,
    "duck": -2, "sr_bonus_170": 6
  },
  "bowling": {
    "wicket": 25, "maiden": 8,
    "three_wicket_bonus": 4, "five_wicket_bonus": 8,
    "economy_below_5": 6
  },
  "fielding": {
    "catch": 8, "stumping": 12, "run_out_direct": 12
  },
  "multipliers": { "captain": 2.0, "vice_captain": 1.5 }
}
```

---

## 🔔 WebSocket Events

**Endpoint**: `wss://api.cricketfi.xyz/ws`

### Subscribe to live match
```json
{ "event": "subscribe", "match_id": "uuid" }
```

### Events Received
```json
// Score update (every 30s during match)
{ "event": "score_update", "data": { "player_id": "...", "points": 87.5, "runs": 45, ... }}

// Wicket alert
{ "event": "wicket", "data": { "batsman": "Rohit Sharma", "bowler": "Bumrah", "points_change": 25 }}

// Leaderboard shift
{ "event": "rank_update", "data": { "your_rank": 142, "total_teams": 50000 }}

// Match complete
{ "event": "match_complete", "data": { "settlement_status": "processing" }}

// Prizes sent
{ "event": "prizes_distributed", "data": { "tx_signatures": [...] }}
```

---

## ⚙️ Admin / Oracle (Internal)

### `POST /oracle/commit-scores` 🔐🔐
Signed by oracle wallet — commits final scores on-chain.
```json
{
  "contest_id": "uuid",
  "scores": [{ "team_id": "uuid", "total_points": 847.5 }],
  "merkle_root": "hex_string"
}
```

### `POST /admin/settle-contest` 🔐🔐
Triggers prize distribution on-chain.
```json
{ "contest_id": "uuid" }
```

---

## 📊 Rate Limits

| Endpoint Group | Rate Limit |
|---|---|
| Public (matches, contests) | 100 req/min |
| Authenticated | 300 req/min |
| Team creation | 10 req/min |
| Oracle/Admin | 20 req/min |
