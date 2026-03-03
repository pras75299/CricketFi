# CricketFi — Project Overview

## 🏏 Tagline
**Transparent. Instant. On-chain. Fantasy Cricket powered by Solana.**

---

## 📌 Problem Statement

India is the world's #1 fantasy sports market. Dream11 alone has **200M+ users** and reported ₹8,000+ Cr in revenue in FY24. Yet the entire industry runs on centralized, opaque infrastructure:

- **No transparency** — users cannot verify if prize pool math is honest
- **High platform cut** — platforms take 15–30% of every contest entry
- **Delayed payouts** — winnings can take 2–5 days to withdraw
- **KYC bottleneck** — bank account required to play, excluding unbanked users
- **Trust deficit** — prize distribution is a black box

> **CricketFi solves all of this by moving the contest logic, prize pool, and payouts entirely on-chain using Solana.**

---

## 💡 Solution

**CricketFi** is an on-chain fantasy cricket platform where:
- Contest prize pools are locked in Solana smart contracts (trustless escrow)
- Entry fees are paid in USDC (or SOL)
- Player scores are computed off-chain (trusted oracle/backend) and committed on-chain
- Prize distributions happen automatically via smart contract within seconds of match completion
- The platform takes a transparent, fixed fee (5–8%) — verifiable on-chain

---

## 🎯 Core Mechanics

### Contest Types
| Type | Entry | Prize Pool | Players |
|---|---|---|---|
| Head-to-Head | 1v1 | 2× entry - fee | 2 |
| Small League | ₹10–₹100 | Dynamic | 5–50 |
| Mega Contest | ₹50–₹500 | Jackpot | 50–10,000 |
| Free Contest | $0 | Sponsored USDC | All |

### Team Creation (Standard 11-player squad)
- Pick from 22 players across both teams
- Stay within 100 credit budget
- Assign 1 Captain (2× points) and 1 Vice-Captain (1.5× points)
- Max 7 players from one team

### Scoring System
| Event | Points |
|---|---|
| Run scored | +1 |
| Boundary (4) | +1 bonus |
| Six | +2 bonus |
| Wicket (bowler) | +25 |
| Maiden over | +8 |
| Catch | +8 |
| Duck (batsman) | −2 |
| Economy < 5 (min 2 overs) | +6 |
| Strike rate > 170 (min 10 balls) | +6 |

---

## 🏆 Unique Value Proposition

1. **Trustless Prize Pools** — funds locked in smart contract, no middleman
2. **Instant USDC Payouts** — winnings sent in <5 seconds after match
3. **Ultra-low Platform Fee** — 5% vs industry 15–30%
4. **Wallet-first Onboarding** — no bank account needed
5. **Open-source & Composable** — any developer can build on top of our contest contracts

---

## 🎯 Target Users

### Primary
- Existing Dream11/MPL players (200M addressable) frustrated with platform opacity
- Crypto-native users who already hold USDC/SOL

### Secondary
- First-time crypto users entering via familiar cricket format
- Seeker Phone users (Solana-native mobile hardware)

---

## 📅 Timeline

| Week | Milestone |
|---|---|
| 1–2 | Smart contracts on devnet, cricket API integration |
| 3–4 | Core frontend: lobby, team creation, live scoring |
| 5 | Wallet integration, USDC entry/prize flow |
| 6 | Internal testing, bug fixes |
| 7–8 | Beta launch (IPL 2025 opening matches) |

---

## 📊 Success Metrics (for grant)

| Metric | Target (8 weeks) |
|---|---|
| Beta users | 500+ |
| Contests created | 100+ |
| Total USDC in prize pools | $5,000+ |
| Matches supported | 10+ IPL matches |
| GitHub stars | 100+ |

---

## 💰 Grant Budget Breakdown

| Item | Amount |
|---|---|
| Smart contract development | $3,000 |
| Frontend + backend | $3,500 |
| Cricket API subscription | $500 |
| Helius RPC + infra | $500 |
| User acquisition (free contests) | $2,000 |
| **Total** | **$9,500** |

---

## 🔓 Open Source Plan

The smart contract (Anchor program) and scoring logic will be open-sourced on GitHub immediately after devnet deployment. The frontend will follow on mainnet launch.
