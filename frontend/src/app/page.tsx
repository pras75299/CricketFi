import { MatchCard } from "@/components/custom/MatchCard";
import { Trophy } from "lucide-react";
import prisma from "@/lib/prisma";

// Server Component (RSC) to fetch and render initial matches list
export default async function Home() {
  
  // Use Prisma direct query for RSC since we are in Next.js App Router (avoids extra fetch hop)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let initialMatches: any[] = [];
  try {
     const matches = await prisma.match.findMany({
        where: { status: { in: ['upcoming', 'live'] } },
        include: { _count: { select: { contests: true } } },
        orderBy: { matchStartAt: 'asc' },
        take: 10,
     });

     // eslint-disable-next-line @typescript-eslint/no-explicit-any
     initialMatches = matches.map((m: any) => ({
        id: m.id,
        series_name: m.seriesName,
        team_home: m.teamHome,
        team_away: m.teamAway,
        venue: m.venue || '',
        match_start_at: m.matchStartAt.toISOString(),
        status: m.status,
        contests_count: m._count.contests
     }));
  } catch (error) {
     console.error("Home page DB fetch error:", error);
  }

  // Fallback dev data if db is empty and we want to preview layout
  if (initialMatches.length === 0) {
      initialMatches = [
        {
          id: '1',
          series_name: 'IPL 2025',
          team_home: 'MI',
          team_away: 'CSK',
          venue: 'Wankhede',
          match_start_at: new Date(Date.now() + 86400000).toISOString(),
          status: 'upcoming',
          contests_count: 12
        },
        {
          id: '2',
          series_name: 'IPL 2025',
          team_home: 'RCB',
          team_away: 'DC',
          venue: 'Chinnaswamy',
          match_start_at: new Date(Date.now() - 3600000).toISOString(),
          status: 'live',
          contests_count: 5
        }
      ]
  }

  return (
    <div className="flex flex-col gap-8 pb-20"> {/* pb-20 to clear mobile nav */}
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-background to-background border border-border p-6 sm:p-10">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
          <Trophy className="w-64 h-64 text-primary" />
        </div>
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-sora font-bold leading-tight mb-4">
            Transparent. Instant. <br/>
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              On-chain Fantasy Cricket.
            </span>
          </h1>
          <p className="text-muted-foreground mb-6">
            Join contests, win USDC, and receive instant payouts powered by Solana smart contracts. No hidden fees.
          </p>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-sora font-semibold tracking-tight">Upcoming & Live</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {initialMatches.map(match => (
             <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </section>
      
    </div>
  );
}
