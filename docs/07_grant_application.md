# CricketFi — Grant Application

## 📋 Superteam India × Solana Foundation Grant

---

## Project Name
**CricketFi** — Trustless On-Chain Fantasy Cricket on Solana

## One-Line Description
An on-chain fantasy cricket platform where prize pools are locked in smart contracts, scoring is transparent, and winners receive USDC payouts within seconds of match completion — no platform trust required.

---

## The Problem

India is the world's largest fantasy sports market. Dream11 has 200M+ users. Yet every platform operates on opaque, centralized infrastructure:

- **Prize pools are a black box** — users cannot verify the math
- **Platform takes 15–30%** of every contest as hidden fees
- **Withdrawals take 2–5 days** to reach bank accounts
- **Excluded users** — millions of cricket fans have no bank account but own smartphones

CricketFi is built on a simple belief: **if you're putting money in, you should be able to verify everything on-chain.**

---

## The Solution

CricketFi moves the entire contest lifecycle — pool creation, entry fee collection, score settlement, and prize distribution — onto Solana smart contracts.

**How it works**:
1. Admin creates a contest on-chain with entry fee + prize pool structure locked in a PDA vault
2. Users pay USDC entry fee, their team is stored as a PDA account
3. After the match, our oracle commits a Merkle root of all player scores on-chain
4. Smart contract distributes prizes automatically via SPL token transfers
5. Winners receive USDC in their wallet within 5 seconds of settlement

**Key differentiators from Dream11/MPL**:
- All prize math is verifiable on-chain (Solscan link for every contest)
- Platform fee fixed at 5% — visible in smart contract, cannot change mid-contest
- USDC payouts — no banking friction, global by default
- Open-source contracts — anyone can fork and build on our rails

---

## Why Solana

- **400ms finality** — essential for live match experience
- **Sub-cent fees** — $0.001 per entry, makes micro-contests economically viable
- **USDC on Solana** — the best stablecoin experience in web3
- **Seeker Phone** — 150,000+ Solana-native phones in India = our distribution channel
- **Jupiter** — instant SOL → USDC in-app for user convenience

---

## Technical Approach

**Smart Contracts (Anchor/Rust)**:
- `ContestAccount` — PDA holding contest state + fee vault
- `TeamAccount` — PDA per user per contest, stores player selection
- `ScoreCommitAccount` — Oracle-signed Merkle root of final scores
- Automatic prize distribution with configurable prize tiers
- Timelock fallback: users can self-withdraw if oracle fails within 72h

**Frontend (Next.js + Privy)**:
- Privy embedded wallets — users log in with Google, wallet auto-created (no seed phrase UX)
- Mobile-first PWA — works on Seeker and all Android devices
- Real-time WebSocket score updates during live matches

**Cricket Data**:
- CricAPI for live scores and squads (contract-ready)
- 30-second polling during live matches → WebSocket push to clients
- Score engine computes fantasy points, backend oracle signs and commits on-chain

**Repository**: `github.com/[username]/cricketfi` (open-source on devnet launch)

---

## Proof of Work

> *(Fill in with YOUR actual proof-of-work below)*

- **Bounties**: [List any Superteam Earn bounties won/submitted]
- **Hackathons**: [List Solana hackathon submissions]
- **Open Source**: [Link to relevant GitHub repos]
- **Community**: [Superteam Discord reputation, events attended]
- **Prior Products**: [Any live products, even small ones]

---

## Traction / User Research

*(Fill this in — this is the most important section for grant approval)*

- Interviewed X cricket fans aged 18–30 about Dream11 trust issues
- [Friend/acquaintance] agreed to pilot the platform during IPL
- Posted in [Solana/Web3 community] — X people expressed interest
- Prototype/MVP already deployed at [devnet link or demo video]

---

## Milestones & Timeline

| Week | Milestone | Deliverable |
|---|---|---|
| 1–2 | Smart contracts deployed on devnet | GitHub + devnet address |
| 3–4 | Core UI (lobby, team builder, live scores) | Deployed frontend URL |
| 5 | Wallet integration + USDC prize flow | End-to-end demo video |
| 6 | Beta testing (50 users, real matches) | Discord beta group |
| 7–8 | IPL 2025 soft launch | 500 beta users, 10 matches |

---

## Budget Breakdown

| Item | Amount (USD) |
|---|---|
| Smart contract development | $3,000 |
| Frontend + backend engineering | $3,500 |
| Cricket API subscription (CricAPI) | $500 |
| Helius RPC + hosting infrastructure | $500 |
| Free contest prize pools (user acquisition) | $2,000 |
| Miscellaneous / legal consult | $500 |
| **Total Requested** | **$10,000** |

---

## Open Source Commitment

The Anchor program will be open-sourced immediately upon devnet deployment. The full frontend and backend will be open-sourced after mainnet launch. We will publish a composable "Contest SDK" for other developers to build on our contest rails.

---

## Team

| Name | Role | Links |
|---|---|---|
| [Your Name] | Founder / Full-stack + Smart Contracts | [GitHub] [Twitter] |
| [Co-founder] | Frontend / Design | [GitHub] [Portfolio] |

---

## Weekly Update Plan

We commit to posting weekly progress updates in the Superteam Discord `#grant-updates` channel every Sunday with:
- Lines of code shipped
- Users onboarded
- Solana transaction count
- Blockers and learnings

---

## 📝 Application Strategy Notes

> *(Remove this section before submitting)*

**What will WIN this application**:

1. **Show a working demo first** — even a devnet transaction showing a contest being created and USDC flowing between accounts is 10× more powerful than any pitch deck

2. **Fill in the Traction section seriously** — interview actual Dream11 users, document their frustrations. Even 10 user interviews with quotes is gold.

3. **Mention IPL 2025 timing** — the grant reviewers will immediately see the urgency and distribution opportunity

4. **Lead with smart contract address on devnet** — paste the actual Solana Explorer link. This signals you've already started building.

5. **Be specific with team proof-of-work** — link EVERY bounty, EVERY GitHub commit, EVERY hackathon submission

6. **Keep it concise** — reviewers scan 50+ applications. Get to the point in the first 3 lines.
