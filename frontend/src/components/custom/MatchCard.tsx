import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, Trophy } from "lucide-react";

export interface MatchProps {
  id: string;
  series_name: string;
  team_home: string;
  team_away: string;
  venue: string;
  match_start_at: string;
  status: string;
  contests_count: number;
}

export function MatchCard({ match }: { match: MatchProps }) {
  const isLive = match.status === 'live';
  const startDate = new Date(match.match_start_at);
  const timeStr = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(startDate);
  const dateStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(startDate);

  return (
    <Card className="hover:border-primary/50 transition-colors bg-card/60 backdrop-blur">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            {match.series_name}
          </div>
          {isLive ? (
            <Badge variant="destructive" className="animate-pulse">Live</Badge>
          ) : (
            <Badge variant="secondary" className="bg-secondary/20 text-secondary border-none">
              Upcoming
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between my-6">
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-sora font-bold text-lg border-2 border-border shadow-inner">
              {match.team_home.substring(0, 3)}
            </div>
            <span className="font-semibold text-sm">{match.team_home}</span>
          </div>

          <div className="flex flex-col items-center">
             <div className="text-xs text-muted-foreground font-medium mb-1">VS</div>
             {!isLive && (
                <div className="flex items-center gap-1 text-sm bg-background border px-2 py-1 rounded-md">
                    <Clock className="w-3 h-3 text-primary" />
                    <span className="font-mono">{dateStr}, {timeStr}</span>
                </div>
             )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-sora font-bold text-lg border-2 border-border shadow-inner">
              {match.team_away.substring(0, 3)}
            </div>
            <span className="font-semibold text-sm">{match.team_away}</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="w-4 h-4 text-gold" style={{ color: '#F59E0B' }}/>
            <span>{match.contests_count} Contests</span>
          </div>
          <Link href={`/match/${match.id}`}>
            <Button size="sm" variant={isLive ? "default" : "outline"} className={isLive ? "shadow-[0_0_15px_rgba(255,107,0,0.4)]" : ""}>
               {isLive ? 'Join Live' : 'View Contests'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
