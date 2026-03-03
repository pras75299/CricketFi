# CricketFi — UI/UX Design & Flows

## 🎨 Design System

### Color Palette
```css
--primary:      #FF6B00;    /* IPL Orange — energy, urgency */
--primary-dark: #CC5500;
--accent:       #00D4AA;    /* Solana teal — blockchain identity */
--bg-dark:      #0A0F1E;    /* Deep navy — premium dark mode */
--bg-card:      #121929;    /* Elevated card surface */
--bg-elevated:  #1A2438;    /* Input/hover surface */
--text-primary: #F0F4FF;
--text-muted:   #7A8BA8;
--success:      #22C55E;
--danger:       #EF4444;
--gold:         #F59E0B;    /* Prize / rank highlight */
```

### Typography
```
Font: "Inter" (body) + "Sora" (headings)
H1: 32px/700  — Page titles
H2: 24px/600  — Section headers
H3: 18px/600  — Card titles
Body: 14px/400
Caption: 12px/400
```

### Design Tokens
- Border radius: `12px` cards, `8px` inputs, `999px` pills
- Shadows: subtle glow on hover (accent color at 20% opacity)
- Glassmorphism: `backdrop-blur-md` on modals + `bg-white/5`
- Micro-animations: 200ms ease-out for all transitions

---

## 📱 Page Structure

```
/                       ← Home / Match Lobby
/match/:id              ← Match detail + contest list
/match/:id/team/new     ← Team builder
/contest/:id            ← Contest detail + leaderboard
/contest/:id/live       ← Live scoring dashboard
/profile                ← User profile + history
/wallet                 ← Wallet balance + transactions
```

---

## 🖥️ Screens & Flows

### 1. Home Page (`/`)
**Purpose**: Show upcoming matches, drive contest entry.

**Layout**:
```
┌─────────────────────────────────────────┐
│  CRICKETFI           [Wallet] [Profile] │
├─────────────────────────────────────────┤
│  🔴 LIVE  IPL 2025 — Match 12           │
│  ┌─────────────┐  ┌───────────────────┐ │
│  │    MI  vs   │  │ Prize Pool        │ │
│  │    CSK      │  │ $50,000 USDC 🔥   │ │
│  │ 14.2 ov     │  │ [Join Now →]      │ │
│  └─────────────┘  └───────────────────┘ │
├─────────────────────────────────────────┤
│  UPCOMING MATCHES                        │
│  ┌────────────────────┐ ┌─────────────┐ │
│  │ RCB vs SRH         │ │ DC vs PBKS  │ │
│  │ Apr 8, 7:30 PM     │ │ Apr 9, 3 PM │ │
│  │ 24 contests        │ │ 18 contests │ │
│  └────────────────────┘ └─────────────┘ │
├─────────────────────────────────────────┤
│  YOUR ACTIVE TEAMS (3)                  │
│  [Team thumbnails with live rankings]   │
└─────────────────────────────────────────┘
```

**Components**: `MatchCard`, `LiveBanner`, `ContestCountBadge`, `ActiveTeamMini`

---

### 2. Match Detail (`/match/:id`)
**Purpose**: Browse all contests for a match, decide which to join.

**Layout**:
```
┌─────────────────────────────────────────┐
│  ← Back    MI vs CSK    Apr 6 · 7:30 PM │
│  Wankhede Stadium · T20                  │
├─────────────────────────────────────────┤
│  [All] [Free] [₹10-₹100] [₹100+] [H2H] │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐ │
│  │ 🏆 MEGA LEAGUE                      │ │
│  │ Prize: $50,000 USDC  Entry: $5      │ │
│  │ ████████░░  45,231 / 100,000 spots  │ │
│  │ 1st Prize: $20,000     [Join →]     │ │
│  └─────────────────────────────────────┘ │
│  ┌─────────────────────────────────────┐ │
│  │ ⚡ HEAD TO HEAD                     │ │
│  │ Prize: $19 USDC      Entry: $10     │ │
│  │ 1 spot left          [Join →]       │ │
│  └─────────────────────────────────────┘ │
│  ┌─────────────────────────────────────┐ │
│  │ 🎁 FREE CONTEST                     │ │
│  │ Prize: $100 USDC sponsored          │ │
│  │ Open · 842 joined    [Join Free →]  │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

### 3. Team Builder (`/match/:id/team/new`)
**Purpose**: Select 11 players within 100 credit budget.

**Layout**:
```
┌─────────────────────────────────────────┐
│  BUILD YOUR TEAM       Credits: 37.5/100│
│  Players: 7/11  ●●●●●●●○○○○            │
├─────────────────────────────────────────┤
│  [WK] [BAT] [AR] [BWL]  [MI ●] [CSK ○] │
├─────────────────────────────────────────┤
│  ┌──────────────────────────────────┐   │
│  │ 👑 Rohit Sharma          9.5cr  │ + │
│  │ Batsman · MI · Sel by 78%        │   │
│  │ Avg pts: 89.2                    │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │ MS Dhoni                 9.0cr  │ ✓ │  ← Selected
│  │ WK-Batsman · CSK · Sel 91%       │   │
│  └──────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  PITCH: ██████░░░░  BATTING FRIENDLY    │
│  [Next: Choose C & VC →]               │
└─────────────────────────────────────────┘
```

**Captain/VC Selection Step**:
```
┌─────────────────────────────────────────┐
│  CHOOSE CAPTAIN & VICE CAPTAIN          │
│  Captain gets 2× points · VC gets 1.5× │
├─────────────────────────────────────────┤
│  Rohit Sharma    [C] [VC]   9.5cr       │
│  MS Dhoni        [C] [VC]   9.0cr  ← C │
│  Jasprit Bumrah  [C] [VC]   9.5cr  ← VC│
│  ...                                    │
├─────────────────────────────────────────┤
│  Entry Fee: 5 USDC                      │
│  [Pay & Create Team →]  ← connects     │
│                            Solana tx    │
└─────────────────────────────────────────┘
```

**Components**: `PlayerCard`, `CreditBar`, `PositionFilter`, `TeamFilter`, `CaptainSelector`, `PaymentModal`

---

### 4. Live Scoring (`/contest/:id/live`)
**Purpose**: Watch live match, see your team's score update in real-time.

**Layout**:
```
┌─────────────────────────────────────────┐
│  🔴 LIVE  MI vs CSK · 14.2 ov          │
│  MI: 142/3   CSK: yet to bat            │
├─────────────────────────────────────────┤
│  YOUR RANK: #142 / 50,000               │
│  Points: 487.5 pts  Prize if top: $200  │
│  [────────────────────────] 14.2 ov     │
├─────────────────────────────────────────┤
│  YOUR TEAM                              │
│  ┌──────────────────────────────────┐   │
│  │ 👑 Rohit Sharma (C)    174.0 pts │   │
│  │ Playing · 87 runs · 45 balls     │   │
│  │ Last event: SIX! 🔥  +2 pts      │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │ Jasprit Bumrah         62.5 pts  │   │
│  │ O: 3.2  W: 2  Eco: 4.2  🔥      │   │
│  └──────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  LEADERBOARD (LIVE)                     │
│  1. cricket_king       847 pts  $20,000 │
│  2. ipl_master         812 pts  $10,000 │
│  ...                                    │
│  142. YOU             487 pts   -        │
└─────────────────────────────────────────┘
```

---

### 5. Wallet Page (`/wallet`)
**Purpose**: Manage USDC balance, view history, deposit/withdraw.

**Layout**:
```
┌─────────────────────────────────────────┐
│  MY WALLET                              │
│  ┌────────────────────────────────────┐ │
│  │  💰 $247.50 USDC                   │ │
│  │  [+ Deposit]    [↗ Withdraw]       │ │
│  └────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│  TRANSACTION HISTORY                    │
│  ✅ Prize · +$500 · RCB vs DC · Apr 3   │
│  🔻 Entry · -$5 · MI vs CSK · Apr 6    │
│  ✅ Deposit · +$100 · Apr 1            │
│  [View on Solscan →]                   │
└─────────────────────────────────────────┘
```

---

## 🔄 Critical User Flows

### New User Journey
```
Land on Home
    ↓
See Live Match Banner
    ↓
Click "Join Now"
    ↓
[Not logged in] → Privy modal: "Sign in with Google"
    ↓
Auto-wallet created silently
    ↓
Redirect to Contest Page
    ↓
"Deposit USDC to join" → Jupiter swap modal or on-ramp
    ↓
Team Builder → Select 11 players
    ↓
Choose C & VC
    ↓
Pay Entry Fee (1-click Solana tx, ~0.001 SOL gas)
    ↓
Team created ✅ → Watch live scoring
```

### Prize Collection Flow
```
Match ends
    ↓
Backend commits scores on-chain (~2 min after last ball)
    ↓
Smart contract settles prizes automatically
    ↓
Push notification: "🏆 You won $200 USDC!"
    ↓
USDC arrives in wallet instantly
    ↓
User can withdraw to bank via off-ramp or spend in next contest
```

---

## 📱 Mobile-First Considerations

- **Bottom Navigation**: Home / Live / My Teams / Profile
- **Swipe Gestures**: Swipe between contest tabs
- **PWA**: Add to home screen prompt after 2nd visit
- **Haptic Feedback**: On team selection, wicket events, prize receipt
- **Offline**: Last known team + points visible offline
- **Touch Targets**: Minimum 48px for all buttons (WCAG)
- **Dark Mode**: Default dark (battery-efficient on OLED)

---

## 🎬 Key Micro-Animations

| Event | Animation |
|---|---|
| Wicket falls | Red flash + player card shake |
| Six hit | Gold particle burst on player card |
| Rank change | Smooth number counter animation |
| Prize received | Confetti + USDC balance ticker |
| Player selected | Card flip + credit bar update |
| Match start | Countdown timer with pulse glow |
