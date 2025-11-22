/* Forced Update */
"use client";

import React, { useEffect, useState } from 'react';
import { GameControls } from '@/components/GameControls';
import { TransactionFeed } from '@/components/TransactionFeed';
import { GameRules } from '@/components/GameRules';
import { useGameEngine } from '@/lib/game-engine';
import { Zap, Trophy, Globe, HelpCircle, Hammer, Timer, Pickaxe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export default function Home() {
  const { gameState, dig } = useGameEngine();
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [critFlash, setCritFlash] = useState(false); 

  useEffect(() => {
      if (!publicKey) { setBalance(null); return; }
      const getBalance = async () => {
          try {
              const bal = await connection.getBalance(publicKey);
              setBalance(bal / LAMPORTS_PER_SOL);
          } catch (e) {}
      };
      getBalance();
  }, [publicKey, connection]);

  const handleDig = async () => {
      const result = await dig();
      if (result.lootType === 'legendary') {
          setCritFlash(true);
          setTimeout(() => setCritFlash(false), 500);
      }
  };

  const entropy = gameState.sonicEntropy;
  const entropyColor = entropy > 85 ? "bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.8)]" : entropy > 60 ? "bg-blue-500" : "bg-gray-600";
  const entropyLabel = entropy > 85 ? "LEGENDARY ODDS" : entropy > 60 ? "RARE ODDS" : "COMMON ODDS";

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center p-4 font-sans overflow-hidden relative selection:bg-purple-500/30">
      
      <GameRules />
      {critFlash && <div className="absolute inset-0 bg-purple-600/30 z-[100] pointer-events-none mix-blend-overlay animate-pulse" />}

      {/* Ambient Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <div className="w-full max-w-5xl flex items-start justify-between mb-8 z-10 mt-4">
        <div>
            <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-black tracking-tighter italic uppercase flex items-center gap-2">
                    <Pickaxe className="w-8 h-8 text-blue-500" />
                    Sonic<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Miner</span>
                </h1>
                <button className="text-gray-600 hover:text-white transition-colors" onClick={() => setShowRules(true)}>
                    <HelpCircle className="w-5 h-5" />
                </button>
            </div>
            <div className="text-xs font-mono text-gray-500">
                HyperGrid Loot Simulator v1.0
            </div>
        </div>
        
        {connected && (
            <div className="bg-neutral-900/80 border border-white/10 rounded-full px-4 py-2 flex items-center gap-3 backdrop-blur-md font-mono text-xs">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-gray-400">{publicKey?.toString().slice(0,4)}...{publicKey?.toString().slice(-4)}</span>
                 <span className="text-white font-bold border-l border-white/10 pl-3">{balance?.toFixed(3)} SOL</span>
            </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 z-10 flex-1">
        
        {/* LEFT: MINING AREA */}
        <div className="flex flex-col items-center justify-center relative min-h-[500px]">
            
            {/* Luck Meter */}
            <div className="absolute top-0 w-full max-w-md flex flex-col gap-2 items-center">
                <div className="flex justify-between w-full text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    <span><Globe className="w-3 h-3 inline mr-1"/> Sonic Entropy</span>
                    <span>{entropy.toFixed(0)}%</span>
                </div>
                <div className="w-full h-3 bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                    <div className={cn("h-full transition-all duration-200", entropyColor)} style={{ width: `${entropy}%` }} />
                </div>
                <div className={cn("text-xs font-black tracking-widest transition-colors", entropy > 85 ? "text-purple-400" : "text-gray-500")}>
                    {entropyLabel}
                </div>
            </div>

            {/* Central Stats */}
            <div className="absolute top-24 flex gap-12 text-center">
                 <div>
                     <div className="text-xs text-gray-500 font-bold uppercase mb-1">Session Score</div>
                     <div className="text-4xl font-black font-mono text-white tabular-nums">{gameState.myScore.toLocaleString()}</div>
                 </div>
                 <div>
                     <div className="text-xs text-gray-500 font-bold uppercase mb-1">Time Left</div>
                     <div className={cn("text-4xl font-black font-mono tabular-nums", gameState.timeLeft < 5 ? "text-red-500" : "text-white")}>
                         {gameState.timeLeft.toFixed(1)}s
                     </div>
                 </div>
            </div>

            <GameControls onDig={handleDig} disabled={gameState.timeLeft <= 0} />

            {gameState.status === 'settled' && (
                <div className="absolute bottom-20 bg-neutral-900/90 border border-white/10 px-6 py-3 rounded-xl text-center backdrop-blur animate-bounce">
                    <div className="text-xs text-gray-500 uppercase font-bold">Round Over</div>
                    <div className="text-xl font-black text-white">Resetting...</div>
                </div>
            )}
        </div>

        {/* RIGHT: LOOT FEED */}
        <div className="flex flex-col h-[600px] bg-neutral-900/30 rounded-3xl border border-white/5 overflow-hidden backdrop-blur-sm">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                    <Trophy className="w-3 h-3" /> Recent Loots
                </span>
                <div className="flex items-center gap-1 text-[10px] text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Live
                </div>
            </div>
            <div className="flex-1 overflow-hidden p-2">
                <TransactionFeed transactions={gameState.recentTx} />
            </div>
            <div className="p-3 border-t border-white/5 bg-black/20 text-center">
                <div className="text-[10px] text-gray-500 font-mono">
                    Total Mined: <span className="text-white font-bold">{gameState.totalVolume.toLocaleString()}</span> PTS
                </div>
            </div>
        </div>

      </div>
    </main>
  );
}
