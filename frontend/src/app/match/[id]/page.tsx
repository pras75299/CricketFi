import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Coins } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function MatchDetailsPage({ params }: { params: { id: string } }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let match: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let contests: any[] = [];

  try {
    match = await prisma.match.findUnique({
      where: { id: params.id },
      include: {
        matchSquads: {
          include: { player: true }
        }
      }
    });

    if (match) {
      const dbContests = await prisma.contest.findMany({
        where: { matchId: match.id }
      });
      // Mocking currentTeams count properly if real DB is empty
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      contests = dbContests.map((c: any) => ({
          ...c,
          currentTeams: 0
      }));
    }
  } catch (error) {
    console.error(error);
  }

  // Dev placeholder data if DB empty
  if (!match) {
      match = {
        id: params.id,
        teamHome: 'MI',
        teamAway: 'CSK',
        seriesName: 'IPL 2025',
        matchStartAt: new Date(),
        venue: 'Wankhede Stadium',
        status: 'upcoming'
      };
      
      contests = [
        {
          id: '1',
          name: 'Mega League',
          contestType: 'mega',
          entryFeeUsdc: 5.0,
          prizePoolUsdc: 50000,
          maxTeams: 100000,
          currentTeams: 45231,
        },
        {
          id: '2',
          name: 'Head to Head',
          contestType: 'h2h',
          entryFeeUsdc: 10.0,
          prizePoolUsdc: 19.0,
          maxTeams: 2,
          currentTeams: 1,
        }
      ];
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Match Header */}
      <div className="bg-card rounded-xl border p-4 sm:p-6 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-5">
            <Trophy className="w-32 h-32" />
         </div>
         <Link href="/" className="text-muted-foreground text-sm hover:text-primary mb-4 block">← Back to Matches</Link>
         
         <div className="flex justify-between items-center z-10 relative">
            <div className="flex flex-col items-center gap-2 w-1/3">
               <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center text-xl font-sora font-bold border-2 shadow-inner">
                  {match.teamHome}
               </div>
               <span className="font-semibold">{match.teamHome}</span>
            </div>

            <div className="flex flex-col items-center w-1/3 text-center">
               <Badge variant="secondary" className="mb-2 bg-secondary/20 items-center justify-center text-xs px-2 py-0.5 whitespace-nowrap hidden sm:flex">
                  {match.seriesName}
               </Badge>
               <span className="text-xl font-bold italic text-muted-foreground">VS</span>
               <div className="text-xs text-muted-foreground mt-2 line-clamp-1">{match.venue}</div>
            </div>

            <div className="flex flex-col items-center gap-2 w-1/3">
               <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center text-xl font-sora font-bold border-2 shadow-inner">
                  {match.teamAway}
               </div>
               <span className="font-semibold">{match.teamAway}</span>
            </div>
         </div>
      </div>

      {/* Contests List */}
      <div>
        <h2 className="text-xl font-sora font-semibold mb-4 border-b border-border/50 pb-2">Contests</h2>
        
        <div className="flex flex-col gap-4">
          {contests.length === 0 ? (
            <div className="text-center p-8 border rounded-xl text-muted-foreground bg-card/30 border-dashed">
                Contests opening soon
            </div>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ) : contests.map((contest: any) => (
            <Card key={contest.id} className="hover:border-primary/50 transition-colors shadow-none">
              <CardHeader className="pb-2 pt-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {contest.contestType === 'mega' && <Trophy className="w-4 h-4 text-gold" style={{ color: '#F59E0B' }}/>}
                    {contest.contestType === 'h2h' && <Users className="w-4 h-4 text-secondary" />}
                    {contest.name}
                  </CardTitle>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Entry Fee</div>
                  <Badge variant="outline" className="text-sm font-sora border-primary/30 mt-1">
                    {contest.entryFeeUsdc === 0 ? 'Free' : `$${contest.entryFeeUsdc} USDC`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Prize Pool</div>
                    <div className="text-2xl font-bold text-primary font-sora flex items-center gap-1">
                      <Coins className="w-5 h-5 opacity-80" />
                      ${contest.prizePoolUsdc.toLocaleString()}
                    </div>
                  </div>
                  <Link href={`/match/${match.id}/team/new?contest=${contest.id}`}>
                     <Button className="w-24">Join</Button>
                  </Link>
                </div>

                <div className="w-full bg-secondary/10 rounded-full h-1.5 mb-2 mt-4 overflow-hidden hidden md:block">
                  <div className="bg-secondary h-1.5 rounded-full" style={{ width: `${Math.min((contest.currentTeams / contest.maxTeams) * 100, 100)}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground hidden md:flex">
                  <span>{contest.currentTeams.toLocaleString()} spots filled</span>
                  <span>{contest.maxTeams.toLocaleString()} spots</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
