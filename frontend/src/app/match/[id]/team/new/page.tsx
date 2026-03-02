"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, UserPlus } from "lucide-react";
// import { useWallet } from "@solana/wallet-adapter-react"; // Real integration needed later

const MAX_PLAYERS = 11;
const MAX_CREDITS = 100;

export default function TeamBuilderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contestId = searchParams?.get('contest');
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [match, setMatch] = useState<{ team_home: string; team_away: string; squad: { home: any[], away: any[] } } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedPlayers, setSelectedPlayers] = useState<any[]>([]);
  const [captain, setCaptain] = useState<string | null>(null);
  const [viceCaptain, setViceCaptain] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1); // 1 = Select Players, 2 = Set C/VC

  // Fetch match details
  useEffect(() => {
    async function fetchMatch() {
        try {
            const res = await fetch(`/api/matches/${params.id}`);
            if (res.ok) setMatch(await res.json());
        } catch(e) { console.error(e) }
    }
    fetchMatch();
  }, [params.id]);

  if (!match) return <div className="p-10 text-center animate-pulse">Loading squads...</div>;

  const allPlayers = [...match.squad.home, ...match.squad.away];
  const creditsUsed = selectedPlayers.reduce((acc, p) => acc + (p.credits || 0), 0);
  const creditsRemaining = MAX_CREDITS - creditsUsed;
  
  const togglePlayer = (player: { id: string; name: string; role: string; credits: number; is_playing_xi: boolean }) => {
    const isSelected = selectedPlayers.find(p => p.id === player.id);
    if (isSelected) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
      if (captain === player.id) setCaptain(null);
      if (viceCaptain === player.id) setViceCaptain(null);
    } else {
      if (selectedPlayers.length >= MAX_PLAYERS) return; // Max reached
      if (creditsRemaining - (player.credits || 9) < 0) return; // Not enough credits
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const handleSaveTeam = async () => {
     if (selectedPlayers.length !== MAX_PLAYERS || !captain || !viceCaptain) return;

     const payload = {
        contest_id: contestId,
        user_id: "demo-user", // TODO: Replace with Privy/Wallet Adapter pubkey
        team_name: "My Squad",
        players: selectedPlayers.map(p => ({
            player_id: p.id,
            credits: p.credits,
            is_captain: captain === p.id,
            is_vice_captain: viceCaptain === p.id
        }))
     };

     try {
         const res = await fetch('/api/teams', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(payload)
         });
         
         if (res.ok) {
            alert('Team Created Successfully! (Sign Tx coming next)');
            // TODO: Initiate Solana Transaction here using Anchor to join_contest
            router.push(`/contest/${contestId}`);
         } else {
             const err = await res.json();
             alert(err.error);
         }
     } catch (e) {
         console.error(e);
     }
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Header Sticky */}
      <div className="sticky top-14 z-40 bg-background/95 backdrop-blur pt-2 pb-4 border-b border-border/50">
         <div className="flex justify-between items-center px-2">
            <div>
               <div className="text-xs text-muted-foreground">{match.team_home} vs {match.team_away}</div>
               <div className="font-sora font-semibold">
                  {step === 1 ? 'Select Players' : 'Choose Captains'}
               </div>
            </div>
            
            <div className="flex gap-4 items-center">
               <div className="flex flex-col items-end">
                  <div className="text-xs text-muted-foreground">Players</div>
                  <div className="font-bold font-sora"><span className="text-primary">{selectedPlayers.length}</span>/11</div>
               </div>
               <div className="flex flex-col items-end">
                  <div className="text-xs text-muted-foreground">Credits</div>
                  <div className="font-bold font-sora text-secondary">{creditsRemaining.toFixed(1)}</div>
               </div>
            </div>
         </div>
         
         {/* Progress Bar */}
         <div className="w-full bg-secondary/10 h-1 mt-3">
             <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(selectedPlayers.length / MAX_PLAYERS) * 100}%` }}></div>
         </div>
      </div>

      {step === 1 ? (
        // --- Step 1: Selection ---
        <div className="flex flex-col gap-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {allPlayers.map((p: any) => {
                const isSelected = selectedPlayers.find(sel => sel.id === p.id);
                const canSelect = isSelected || (selectedPlayers.length < MAX_PLAYERS && creditsRemaining >= (p.credits || 0));

                return (
                    <Card key={p.id} onClick={() => togglePlayer(p)} className={`cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/5' : canSelect ? 'hover:border-primary/30' : 'opacity-50 cursor-not-allowed'} shadow-none`}>
                        <CardContent className="p-3 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-muted rounded-full overflow-hidden flex items-center justify-center">
                                    <UserPlus className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <div className="font-semibold text-sm">{p.name}</div>
                                    <div className="text-xs text-muted-foreground">{p.role} • {p.team_side === 'home' ? match.team_home : match.team_away}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="font-sora font-semibold">{p.credits} <span className="text-xs text-muted-foreground font-sans font-normal">cr</span></div>
                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${isSelected ? 'bg-primary border-primary text-background' : 'border-border'}`}>
                                    {isSelected && <Check className="w-4 h-4" />}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
      ) : (
        // --- Step 2: Captains ---
        <div className="flex flex-col gap-2">
            <div className="p-4 bg-card rounded-lg border text-sm text-center mb-4">
               C gets 2x points. VC gets 1.5x points.
            </div>
            {selectedPlayers.map((p) => (
                <div key={p.id} className="flex justify-between items-center p-3 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-muted rounded-full"></div>
                        <div>
                            <div className="font-semibold text-sm">{p.name}</div>
                            <div className="text-xs text-muted-foreground">{p.role}</div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => { setCaptain(p.id); if (viceCaptain === p.id) setViceCaptain(null); }}
                            className={`w-8 h-8 rounded-full border font-sora text-sm font-bold flex items-center justify-center transition-colors ${captain === p.id ? 'bg-primary border-primary text-background' : 'hover:border-primary'}`}>
                            C
                        </button>
                        <button 
                            onClick={() => { setViceCaptain(p.id); if (captain === p.id) setCaptain(null); }}
                            className={`w-8 h-8 rounded-full border font-sora text-sm font-bold flex items-center justify-center transition-colors ${viceCaptain === p.id ? 'bg-secondary border-secondary text-background' : 'hover:border-secondary'}`}>
                            VC
                        </button>
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* Floating Action Buffer */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-background border-t border-border flex justify-between gap-4 z-50 pb-safe">
         {step === 2 && (
             <Button variant="outline" className="w-1/3" onClick={() => setStep(1)}>Back</Button>
         )}
         {step === 1 ? (
             <Button className="w-full" disabled={selectedPlayers.length !== MAX_PLAYERS} onClick={() => setStep(2)}>
                 Next (Choose C/VC)
             </Button>
         ) : (
             <Button className="w-full" disabled={!captain || !viceCaptain} onClick={handleSaveTeam}>
                 Save & Join Contest
             </Button>
         )}
      </div>

    </div>
  );
}
