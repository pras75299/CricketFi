"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Coins, History, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export default function WalletProfilePage() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number>(0);
  
  // Dummy profile logic
  const txHistory = [
      { id: '1', type: 'deposit', amount: 50, date: '2025-05-10T10:00:00Z', status: 'success' },
      { id: '2', type: 'join_contest', amount: 10, contest: 'Mega League', date: '2025-05-11T14:30:00Z', status: 'success' },
      { id: '3', type: 'win', amount: 250, contest: 'H2H #992', date: '2025-05-12T22:00:00Z', status: 'success' },
      { id: '4', type: 'withdraw', amount: 100, date: '2025-05-13T09:15:00Z', status: 'pending' },
  ];

  useEffect(() => {
    if (publicKey) {
      connection.getBalance(publicKey).then((bal) => {
        setBalance(bal / LAMPORTS_PER_SOL);
      });
    }
  }, [publicKey, connection]);

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-4">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <Coins className="w-10 h-10 text-muted-foreground opacity-50" />
        </div>
        <h2 className="text-2xl font-sora font-semibold">Connect your Wallet</h2>
        <p className="text-muted-foreground max-w-sm">
          Please connect your Solana wallet to view your balances, transaction history, and active contests.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
       <div className="bg-card border rounded-2xl p-6 relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute top-0 right-0 p-4 opacity-5">
              <Trophy className="w-32 h-32" />
          </div>
          
          <div className="w-20 h-20 bg-primary/20 text-primary border-2 border-primary rounded-full flex items-center justify-center font-sora text-2xl font-bold mb-4 z-10">
              {publicKey?.toString().substring(0,2)}
          </div>
          <h2 className="text-xl font-sora font-semibold z-10 mb-1">
             {publicKey?.toString().substring(0, 4)}...{publicKey?.toString().substring(publicKey.toBase58().length - 4)}
          </h2>
          <Badge variant="outline" className="mb-6 z-10">Level 4 Pro</Badge>
          
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm z-10">
              <div className="bg-background rounded-xl p-4 border flex flex-col">
                  <span className="text-xs text-muted-foreground mb-1">SOL Balance</span>
                  <span className="font-sora font-bold text-xl">{balance.toFixed(2)}</span>
              </div>
              <div className="bg-background rounded-xl p-4 border flex flex-col">
                  <span className="text-xs text-muted-foreground mb-1">USDC Balance</span>
                  <span className="font-sora font-bold text-xl text-secondary">295.00</span>
              </div>
          </div>
       </div>

       <div className="flex gap-4">
           <Button className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90">
               <ArrowDownLeft className="w-4 h-4 mr-2" /> Deposit USDC
           </Button>
           <Button variant="outline" className="flex-1 border-primary/50 text-primary hover:bg-primary/10 hover:text-primary">
               <ArrowUpRight className="w-4 h-4 mr-2" /> Withdraw
           </Button>
       </div>

       <div>
           <h3 className="text-lg font-sora font-semibold mb-4 flex items-center gap-2">
               <History className="w-5 h-5 text-muted-foreground" />
               Recent Transactions
           </h3>
           <div className="flex flex-col gap-3">
               {txHistory.map(tx => (
                   <Card key={tx.id} className="shadow-none relative overflow-hidden">
                       {tx.status === 'pending' && <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>}
                       {tx.status === 'success' && tx.type === 'win' && <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>}
                       <CardContent className="p-4 pl-5 flex justify-between items-center bg-card/50">
                           <div className="flex flex-col">
                               <span className="font-semibold text-sm capitalize">{tx.type.replace('_', ' ')}</span>
                               {tx.contest && <span className="text-xs text-muted-foreground">{tx.contest}</span>}
                           </div>
                           <div className={`font-sora font-bold ${tx.type === 'win' || tx.type === 'deposit' ? 'text-secondary' : 'text-foreground'}`}>
                               {tx.type === 'win' || tx.type === 'deposit' ? '+' : '-'}${tx.amount}
                           </div>
                       </CardContent>
                   </Card>
               ))}
           </div>
       </div>
    </div>
  );
}
