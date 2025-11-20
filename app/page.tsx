"use client";

import React, { useEffect, useState } from 'react';
import { GameChart } from '@/components/GameChart';
import { GameControls } from '@/components/GameControls';
import { TransactionFeed } from '@/components/TransactionFeed';
import { useGameEngine } from '@/lib/game-engine';
import { Activity, Zap, Clock, Coins, Trophy, TrendingUp, AlertTriangle, Users, DollarSign, Wallet as WalletIcon, MonitorPlay, Globe, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWallet } from '@solana/wallet-adapter-react';

export default function Home() {
  const { gameState, sendAction, potentialWin, winningSide, userSide } = useGameEngine();
  const { connected } = useWallet();

  const [prevEarnings, setPrevEarnings] = useState(0);
  const [profitFlash, setProfitFlash] = useState(false);

  useEffect(() => {
    if (gameState.lifetimeEarnings > prevEarnings) {
        setProfitFlash(true);
        const timer = setTimeout(() => setProfitFlash(false), 2000);
        setPrevEarnings(gameState.lifetimeEarnings);
        return () => clearTimeout(timer);
    }
  }, [gameState.lifetimeEarnings]);

  const myCost = (gameState.myContribution * 0.01).toFixed(2);
  const isWinning = userSide === winningSide;
  const isRisk = userSide && !isWinning;

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 font-sans selection:bg-green-500/30 overflow-hidden relative">
      
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="w-full max-w-4xl flex items-end justify-between mb-6 z-10">
        <div>
            <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                    "px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors duration-500",
                    connected 
                        ? "bg-green-500/20 border-green-500/30 text-green-400" 
                        : "bg-blue-500/20 border-blue-500/30 text-blue-400"
                )}>
                   <Globe className="w-3 h-3" /> {connected ? "Sonic Mainnet" : "Sonic Testnet"}
                </div>
                
                {connected ? (
                     <div className="px-2 py-1 rounded bg-green-500/20 border border-green-500/30 text-[10px] font-bold text-green-400 uppercase tracking-wider flex items-center gap-1 animate-pulse">
                        <Users className="w-3 h-3" /> {gameState.activePlayers} Players
                    </div>
                ) : (
                    <div className="px-2 py-1 rounded bg-yellow-500/20 border border-yellow-500/30 text-[10px] font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1">
                        <MonitorPlay className="w-3 h-3" /> Spectator Mode
                    </div>
                )}
            </div>
            <h1 className="text-4xl font-black tracking-tighter italic uppercase">
                Candle<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Wars</span>
            </h1>
        </div>
        
        <div className="flex flex-col items-end">
            <span className="text-xs text-yellow-500/80 uppercase font-bold flex items-center gap-1 mb-1">
                <Trophy className="w-3 h-3" /> Round Jackpot
            </span>
            <div className="text-3xl font-mono font-black text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.4)] flex items-baseline gap-1">
                {gameState.jackpot.toFixed(2)} <span className="text-sm text-yellow-600 font-bold">SOL</span>
            </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6 z-10">
        
        {/* LEFT: Game Card */}
        <div className="flex flex-col gap-6">
            <div className={cn(
                "w-full rounded-3xl p-1 border shadow-2xl backdrop-blur-xl relative group transition-all duration-500",
                isRisk && connected ? "bg-red-900/20 border-red-500/50 shadow-red-900/20" : 
                isWinning && connected ? "bg-green-900/20 border-green-500/50 shadow-green-900/20" : 
                "bg-neutral-900/60 border-white/10"
            )}>
                
                {/* WIN/LOSS Indicator */}
                {userSide && connected && (
                    <div className={cn(
                        "absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg border transition-all duration-300 z-20",
                        isWinning ? "bg-green-500 text-black border-green-400 scale-110" : "bg-red-500 text-white border-red-400 animate-bounce"
                    )}>
                        {isWinning ? (
                            <>🏆 You are Winning!</>
                        ) : (
                            <><AlertTriangle className="w-3 h-3" /> You are Losing! Push Harder!</>
                        )}
                    </div>
                )}

                <div className="relative bg-neutral-900/90 rounded-[22px] overflow-hidden">
                    {/* Stats Bar */}
                    <div className="grid grid-cols-4 gap-px bg-white/5 border-b border-white/5">
                        <div className="bg-neutral-900/50 p-3 flex flex-col items-center justify-center">
                            <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-bold uppercase mb-1 tracking-wider">
                                <Clock className="w-3 h-3" /> Time
                            </div>
                            <div className={`text-lg font-mono font-bold ${gameState.timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                                {gameState.timeLeft.toFixed(0)}s
                            </div>
                        </div>
                        
                        <div className="bg-neutral-900/50 p-3 flex flex-col items-center justify-center relative overflow-hidden col-span-2">
                            {isRisk && connected && <div className="absolute inset-0 bg-red-500/10 animate-pulse" />}
                            <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-bold uppercase mb-1 tracking-wider z-10">
                                <DollarSign className="w-3 h-3" /> Pending Rewards
                            </div>
                            <div className={cn("text-2xl font-mono font-black z-10 tracking-tight", isRisk && connected ? "text-gray-500" : "text-green-400")}>
                                {connected ? potentialWin : "---"} <span className="text-xs font-bold opacity-70">SOL</span>
                            </div>
                        </div>

                        <div className="bg-neutral-900/50 p-3 flex flex-col items-center justify-center relative overflow-hidden">
                            {profitFlash && <div className="absolute inset-0 bg-yellow-500/20 animate-pulse" />}

                            <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-bold uppercase mb-1 tracking-wider z-10">
                                <WalletIcon className="w-3 h-3" /> Profit
                            </div>
                            <div className={cn("text-lg font-mono font-bold z-10", profitFlash ? "text-yellow-400 scale-110 transition-transform" : "text-white")}>
                                {connected ? gameState.lifetimeEarnings.toFixed(2) : "0.00"}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 relative">
                        <div className="absolute top-6 right-6 z-10 bg-black/50 backdrop-blur px-2 py-1 rounded border border-white/10 text-[10px] font-mono text-gray-400">
                            SOL/USD Price
                        </div>
                        <GameChart gameState={gameState} />
                    </div>

                    <div className="p-4 pt-0 pb-6">
                        <GameControls 
                            onPump={() => sendAction('bull', 1)}
                            onDump={() => sendAction('bear', 1)}
                            bullPower={gameState.bullPower}
                            bearPower={gameState.bearPower}
                            userSide={userSide}
                        />
                        
                        <div className="flex justify-between items-center mt-4 px-2">
                            <div className="text-[10px] text-gray-500 font-mono">
                                {connected && (
                                    <>Round Cost: <span className="text-white font-bold">{myCost} SOL</span></>
                                )}
                            </div>
                            
                            <div className="text-[10px] text-gray-600 font-mono">
                                <span className={cn("font-bold", winningSide === 'bull' ? "text-green-500" : "text-red-500")}>
                                    LEADER: {winningSide?.toUpperCase()}S
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mission Protocol / Rules Card */}
            <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">
                    <Info className="w-3 h-3" /> Mission Protocol
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-1">Game Rules</h4>
                        <ul className="text-xs text-gray-300 space-y-1 list-disc pl-3">
                            <li>60s Rounds. Winner takes all.</li>
                            <li><span className="text-green-400">Bulls</span> win if Price {'>'} Oracle.</li>
                            <li><span className="text-red-400">Bears</span> win if Price {'<'} Oracle.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-1">Tech Highlight</h4>
                        <div className="text-xs text-gray-300">
                            Transactions signed on <span className="text-purple-400 font-bold">Solana</span>, executed instantly on <span className="text-orange-400 font-bold">Sonic SVM</span> via HyperGrid.
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* RIGHT: Live Feed */}
        <div className="hidden lg:flex flex-col h-full">
            <TransactionFeed 
                transactions={gameState.recentTx} 
                networkName={connected ? "Sonic Mainnet" : "Sonic Testnet"} 
            />
        </div>

      </div>
    </main>
  );
}
