"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Activity, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

export default function ContestDashboard() {
  const [liveScore, setLiveScore] = useState({ home: "0/0", away: "0/0", over: 0.0 });
  
  // Dummy leaderboard data representing other players in the contest
  const [leaderboard, setLeaderboard] = useState([
      { rank: 1, user: "Alice.sol", points: 452.5, change: 'up' },
      { rank: 2, user: "Bob.sol", points: 430.0, change: 'same' },
      { rank: 3, user: "Charlie.sol", points: 410.5, change: 'down' },
      { rank: 4, user: "My Team (You)", points: 395.0, change: 'up' }, // Your team
      { rank: 5, user: "Dave.sol", points: 380.0, change: 'down' },
  ]);

  useEffect(() => {
    let newSocket: Socket;
    // Connect to Next.js API Route WebSocket server
    fetch("/api/socket/io").finally(() => {
      newSocket = io({
        path: "/api/socket/io",
        addTrailingSlash: false,
      });

      newSocket.on("connect", () => {
        console.log("Connected to match feed", newSocket.id!);
        // We'd subscribe to the specific match tied to this contest
        newSocket.emit("subscribe", { match_id: "match-123" });
      });

      // Simulated score updates receiver
      newSocket.on("score_update", (data) => {
         setLiveScore(data);
      });
    });

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  // Simulate incoming points during testing since CricAPI is mocked here
  useEffect(() => {
     const interval = setInterval(() => {
         setLeaderboard(prev => {
             const updated = [...prev];
             // Randomly give "My Team" 1-10 points to simulate live tracking
             updated[3].points += Math.random() * 10;
             // Randomly give Alice points
             updated[0].points += Math.random() * 5;
             
             // Sort by points desc
             updated.sort((a,b) => b.points - a.points);
             
             // Reassign ranks
             return updated.map((entry, index) => {
                 const newRank = index + 1;
                 let change = 'same';
                 if (newRank < entry.rank) change = 'up';
                 if (newRank > entry.rank) change = 'down';
                 return { ...entry, rank: newRank, change };
             });
         });
         
         setLiveScore(prev => ({
             ...prev,
             over: prev.over + 0.1 > parseInt(prev.over.toString()) + 0.5 ? Math.ceil(prev.over) : prev.over + 0.1
         }));
     }, 3000); // Update every 3s
     return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-6 pb-20">
      
      {/* Live Match Strip */}
      <Card className="border-primary/30 shadow-[0_0_20px_rgba(255,107,0,0.15)] bg-gradient-to-r from-card to-background">
          <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                 <Activity className="w-5 h-5 text-destructive animate-pulse" />
                 <span className="font-sora tracking-widest text-destructive text-sm font-bold uppercase">Live</span>
              </div>
              
              <div className="flex items-center justify-center gap-6 text-xl sm:text-2xl font-sora font-bold">
                 <div className="flex flex-col items-center">
                    <span className="text-sm text-muted-foreground font-sans font-normal mb-1">MI</span>
                    {liveScore.home}
                 </div>
                 <span className="text-muted-foreground italic opacity-50 text-xl pt-4">v</span>
                 <div className="flex flex-col items-center">
                    <span className="text-sm text-muted-foreground font-sans font-normal mb-1">CSK</span>
                    {liveScore.away}
                 </div>
              </div>
              
              <div className="bg-muted px-4 py-2 rounded-lg font-mono text-lg font-bold border">
                  Overs: <span className="text-primary">{liveScore.over.toFixed(1)}</span>
              </div>
          </CardContent>
      </Card>

      {/* Prize Pool & Payout Info */}
      <div className="grid grid-cols-2 gap-4">
          <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="text-muted-foreground text-sm mb-1">Prize Pool</div>
                  <div className="text-xl font-sora font-bold text-primary">$50,000 USDC</div>
              </CardContent>
          </Card>
          <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="text-muted-foreground text-sm mb-1">Your Est. Winnings</div>
                  <div className="text-xl font-sora font-bold text-secondary font-mono tracking-tighter">
                      {leaderboard.find(l => l.user.includes("You"))?.rank === 1 ? '$25,000' : 
                       leaderboard.find(l => l.user.includes("You"))!.rank <= 3 ? '$5,000' : '$0'}
                  </div>
              </CardContent>
          </Card>
      </div>

      {/* Leaderboard */}
      <div>
         <div className="flex items-center justify-between mb-4 mt-2 border-b border-border/50 pb-2">
             <h2 className="text-xl font-sora font-semibold flex items-center gap-2">
                 <Trophy className="w-5 h-5 text-gold" style={{ color: '#F59E0B' }}/>
                 Live Leaderboard
             </h2>
             <Badge variant="outline" className="font-mono text-xs">Updates Real-time</Badge>
         </div>
         
         <div className="flex flex-col gap-2">
             {leaderboard.map((entry) => (
                 <div key={entry.user} className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border ${entry.user.includes("You") ? 'bg-primary/10 border-primary shadow-sm' : 'bg-card'}`}>
                     <div className="flex items-center gap-4">
                         <div className="w-6 font-mono font-bold text-muted-foreground">
                             #{entry.rank}
                         </div>
                         <div className="flex flex-col">
                             <span className={`font-semibold ${entry.user.includes("You") ? 'text-primary' : ''}`}>
                                 {entry.user}
                             </span>
                         </div>
                     </div>
                     <div className="flex items-center gap-4">
                         <div className="font-sora font-bold text-lg w-16 text-right">
                             {entry.points.toFixed(1)}
                         </div>
                         <div className="w-4 h-4 flex items-center justify-center">
                             {entry.change === 'up' && <ArrowUpRight className="text-secondary w-4 h-4" />}
                             {entry.change === 'down' && <ArrowDownRight className="text-destructive w-4 h-4" />}
                             {entry.change === 'same' && <Minus className="text-muted-foreground opacity-50 w-4 h-4" />}
                         </div>
                     </div>
                 </div>
             ))}
         </div>
      </div>
      
    </div>
  );
}
