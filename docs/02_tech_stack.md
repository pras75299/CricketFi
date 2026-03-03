# CricketFi — Tech Stack

## 🗺️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                   │
│       Wallet Connect → Team Builder → Live Scores       │
└────────────────────┬────────────────────────────────────┘
                     │ REST / WebSocket
┌────────────────────▼────────────────────────────────────┐
│                 BACKEND API (Node.js)                   │
│     Cricket Data → Score Engine → Oracle → Solana RPC   │
└──────┬─────────────────────────────────┬────────────────┘
       │                                  │
┌──────▼──────────┐              ┌────────▼────────────┐
│  PostgreSQL DB  │              │   Solana Blockchain  │
│  (Supabase)     │              │   (Anchor Programs)  │
└─────────────────┘              └─────────────────────┘
```

---

## 🖥️ Frontend

| Layer | Technology | Why |
|---|---|---|
| Framework | **Next.js 14** (App Router) | SSR for SEO, React ecosystem, API routes |
| Styling | **Tailwind CSS + shadcn/ui** | Fast iteration, consistent design system |
| State | **Zustand** | Lightweight, no boilerplate Redux |
| Data Fetching | **TanStack Query (React Query)** | Caching + real-time score updates |
| Animations | **Framer Motion** | Smooth cricket scoring animations |
| Charts | **Recharts** | Player performance graphs |
| Mobile | **Responsive PWA** | Works on Seeker phones + all Android |

---

## ⛓️ Blockchain Layer

| Component | Technology | Why |
|---|---|---|
| Chain | **Solana** | Speed (400ms finality), low fees (~$0.001) |
| Smart Contracts | **Anchor Framework** | Rust-based, battle-tested for Solana |
| Token | **USDC (SPL)** | Stable value, widely held in India |
| Swaps | **Jupiter Aggregator** | SOL → USDC in-app conversions |
| RPC Provider | **Helius** | Best Solana RPC, websocket support |
| NFTs (badges) | **Metaplex Bubblegum (cNFTs)** | Ultra-cheap compressed NFTs for achievements |
| Indexer | **Helius DAS API** | Query on-chain data efficiently |

---

## 🔑 Wallet & Auth

| Component | Technology | Why |
|---|---|---|
| Embedded Wallet | **Privy** | Email/phone login → wallet auto-created |
| Wallet Adapter | **@solana/wallet-adapter** | Support Phantom, Backpack, etc. |
| Social Login | **Google / Twitter via Privy** | Mass user onboarding without seed phrases |
| Session | **JWT + wallet signature** | Dual auth system |

> **Key Insight**: Using Privy means users don't need to know anything about crypto. They log in with Google, and a Solana wallet is auto-created silently. This is critical for mainstream cricket fans.

---

## 🏗️ Backend

| Component | Technology | Why |
|---|---|---|
| Runtime | **Node.js 20** | JS ecosystem, fast I/O |
| Framework | **Fastify** | 2× faster than Express, schema validation |
| Language | **TypeScript** | Type safety across stack |
| Queue | **BullMQ + Redis** | Score processing queue, match event handling |
| Cache | **Redis (Upstash)** | Live scores, leaderboard caching |
| WebSocket | **Socket.io** | Real-time score updates to clients |
| Cron | **node-cron** | Poll cricket API every 30s during matches |
| Oracle | **Custom Trusted Oracle** | Backend signs and commits scores on-chain |

---

## 🗃️ Database

| Component | Technology | Why |
|---|---|---|
| Primary DB | **PostgreSQL (Supabase)** | Relational, hosted, Row-level security |
| ORM | **Prisma** | Type-safe queries, auto-migrations |
| Cache/KV | **Redis (Upstash)** | Leaderboard, sessions, live data |
| File Storage | **Supabase Storage** | Player images, team logos |

---

## 🏏 Cricket Data

| Provider | Usage | Cost |
|---|---|---|
| **CricAPI** (primary) | Live scores, squads, match schedule | $29/mo |
| **SportMonks** (backup) | Detailed player stats, historical data | $49/mo |
| **Cricbuzz Unofficial** (dev) | Free scraping for development only | Free |

> **Data Flow**: CricAPI → Backend (every 30s) → Redis cache → Score Engine → on-chain oracle commit → Frontend via WebSocket

---

## 🚀 DevOps & Infra

| Component | Technology |
|---|---|
| Hosting (Frontend) | **Vercel** |
| Hosting (Backend) | **Railway** |
| Database | **Supabase** (managed PostgreSQL) |
| Redis | **Upstash** (serverless Redis) |
| RPC | **Helius** |
| CI/CD | **GitHub Actions** |
| Monitoring | **Sentry** (errors) + **Axiom** (logs) |
| Domain | Custom domain via Vercel |

---

## 📦 Key NPM Packages

```json
{
  "dependencies": {
    "@solana/web3.js": "^1.95",
    "@coral-xyz/anchor": "^0.30",
    "@solana/wallet-adapter-react": "^0.15",
    "@privy-io/react-auth": "^1.x",
    "@jup-ag/api": "^6.x",
    "zustand": "^4.x",
    "@tanstack/react-query": "^5.x",
    "framer-motion": "^11.x",
    "socket.io-client": "^4.x",
    "prisma": "^5.x",
    "@prisma/client": "^5.x"
  }
}
```

---

## 🔐 Security Considerations

- All prize pool funds held in **program-derived addresses (PDAs)** — no private key controls funds
- Score commits require **backend admin signature** (multi-sig planned for v2)
- Smart contract has **timelock** — if oracle fails, users can withdraw after 72h
- Rate limiting on all APIs via Fastify plugins
- Input sanitization on team selection (validate credits, player count)
