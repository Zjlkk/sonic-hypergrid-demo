"use client";

import React, { useEffect, useState } from 'react';
import { GameChart } from '@/components/GameChart';
import { GameControls } from '@/components/GameControls';
import { TransactionFeed } from '@/components/TransactionFeed';
import { GameRules } from '@/components/GameRules';
import { useGameEngine } from '@/lib/game-engine';
import { Activity, Zap, Clock, Coins, Trophy, TrendingUp, AlertTriangle, Users, DollarSign, Wallet as WalletIcon, MonitorPlay, Globe, Info, HelpCircle, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWallet } from '@solana/wallet-adapter-react';

export default function Home() {
  const { gameState, sendAction, potentialWin, winningSide, userSide } = useGameEngine();
  const { connected } = useWallet();

  const [prevEarnings, setPrevEarnings] = useState(0);
  const [profitFlash, setProfitFlash] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [critFlash, setCritFlash] = useState(false); // Flash whole screen on Crit

  useEffect(() => {
    if (gameState.lifetimeEarnings > prevEarnings) {
        setProfitFlash(true);
        const timer = setTimeout(() => setProfitFlash(false), 2000);
        setPrevEarnings(gameState.lifetimeEarnings);
        return () => clearTimeout(timer);
    }
  }, [gameState.lifetimeEarnings]);

  const handleAction = async (side: 'bull' | 'bear') => {
      const result = await sendAction(side, 1);
      if (result?.isCrit) {
          setCritFlash(true);
          setTimeout(() => setCritFlash(false), 300);
      }
  };

  const myCost = (gameState.myContribution * 0.01).toFixed(2);
  const isWinning = userSide === winningSide;
  const isRisk = userSide && !isWinning;

  const leadPercent = Math.abs((gameState.currentPrice - gameState.oraclePrice) / gameState.oraclePrice * 100).toFixed(2);

  // Entropy UI Logic
  const entropy = gameState.sonicEntropy;
  const entropyColor = entropy > 80 ? "bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.6)]" : entropy < 20 ? "bg-orange-500" : "bg-blue-500";
  const entropyLabel = entropy > 80 ? "CHAOS (3x CRIT)" : entropy < 20 ? "STAGNANT (0.5x)" : "STABLE (1.0x)";
  const entropyText = entropy > 80 ? "text-purple-400 animate-pulse" : entropy < 20 ? "text-orange-400" : "text-blue-400";

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 font-sans selection:bg-green-500/30 overflow-hidden relative">
      
      <GameRules />

      {/* Crit Flash Effect */}
      {critFlash && <div className="absolute inset-0 bg-purple-500/20 z-[100] pointer-events-none mix-blend-overlay" />}

      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="w-full max-w-4xl flex items-end justify-between mb-6 z-10">
        <div>
            {/* Sonic Oracle Indicator */}
            <div className="mb-3 flex items-center gap-3">
                <div className="bg-neutral-900/80 border border-white/10 rounded-lg p-2 flex items-center gap-3 backdrop-blur-md">
                    <div className="flex flex-col">
                        <span className="text-[8px] uppercase tracking-widest font-bold text-gray-500 flex items-center gap-1">
                            <Globe className="w-3 h-3" /> Sonic Oracle State
                        </span>
                        <div className={cn("text-sm font-black font-mono", entropyText)}>
                            {entropyLabel}
                        </div>
                    </div>
                    {/* Entropy Bar */}
                    <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                            className={cn("h-full transition-all duration-200 ease-linear", entropyColor)}
                            style={{ width: `${entropy}%` }}
                        />
                    </div>
                    <div className="text-xs font-mono text-gray-400 w-8 text-right">{entropy.toFixed(0)}</div>
                </div>
            </div>
            
            <div className="flex items-center gap-3 relative">
                <h1 className="text-4xl font-black tracking-tighter italic uppercase">
                    Candle<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Wars</span>
                </h1>
                <button 
                    className="text-gray-500 hover:text-white transition-colors"
                    onMouseEnter={() => setShowRules(true)}
                    onMouseLeave={() => setShowRules(false)}
                >
                    <HelpCircle className="w-5 h-5" />
                </button>
                
                {/* Rules Hover */}
                {showRules && (
                    <div className="absolute left-full top-0 ml-4 w-72 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-2xl z-50 text-xs pointer-events-none animate-in fade-in slide-in-from-left-2">
                        <h4 className="font-bold text-blue-400 uppercase tracking-wider mb-2 border-b border-white/10 pb-1">Sonic Oracle Protocol</h4>
                        <ul className="space-y-2 text-gray-300">
                            <li className="flex gap-2">
                                <Globe className="w-3 h-3 mt-0.5 text-purple-400" />
                                <span><strong>Read-Only Oracle.</strong> Sonic generates high-frequency randomness.</span>
                            </li>
                            <li className="flex gap-2">
                                <Zap className="w-3 h-3 mt-0.5 text-yellow-400" />
                                <span><strong>Entropy > 80:</strong> CRITICAL HIT! 3x Power & Impact.</span>
                            </li>
                            <li className="flex gap-2">
                                <AlertTriangle className="w-3 h-3 mt-0.5 text-orange-400" />
                                <span><strong>Entropy {'<'} 20:</strong> Slippage. 0.5x Power.</span>
                            </li>
                            <li className="mt-2 pt-2 border-t border-white/10 text-[10px] text-gray-500">
                                Transactions signed on Solana. Outcomes determined by Sonic State.
                            </li>
                        </ul>
                    </div>
                )}
            </div>
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

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6 z-10">
        
        {/* LEFT: Game Card */}
        <div className={cn(
            "w-full rounded-3xl p-1 border shadow-2xl backdrop-blur-xl relative group transition-all duration-500",
            isRisk && connected ? "bg-red-900/20 border-red-500/50 shadow-red-900/20" : 
            isWinning && connected ? "bg-green-900/20 border-green-500/50 shadow-green-900/20" : 
            "bg-neutral-900/60 border-white/10"
        )}>
            
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
                        <div className={`text-lg font-mono font-bold ${gameState.timeLeft < 5 ? 'text-red-500 animate-pulse' : gameState.timeLeft < 10 ? 'text-yellow-400' : 'text-white'}`}>
                            {gameState.timeLeft.toFixed(0)}s
                        </div>
                    </div>
                    
                    <div className="bg-neutral-900/50 p-3 flex flex-col items-center justify-center relative overflow-hidden col-span-2">
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
                    <div className="flex justify-center mb-4">
                        <div className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-bold font-mono flex items-center gap-2 border shadow-lg transition-all duration-300",
                            winningSide === 'bull' 
                                ? "bg-green-900/30 text-green-400 border-green-500/30" 
                                : "bg-red-900/30 text-red-400 border-red-500/30"
                        )}>
                            {winningSide === 'bull' ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                            <span>
                                {winningSide === 'bull' ? "BULLS DOMINATING" : "BEARS CRUSHING"}
                            </span>
                            <span className="opacity-50">|</span>
                            <span>+{leadPercent}%</span>
                        </div>
                    </div>

                    <GameControls 
                        onPump={() => handleAction('bull')}
                        onDump={() => handleAction('bear')}
                        bullPower={gameState.bullPower}
                        bearPower={gameState.bearPower}
                        userSide={userSide}
                        currentMultiplier={1} 
                    />
                    
                    <div className="flex justify-between items-center mt-4 px-2">
                        <div className="text-[10px] text-gray-500 font-mono">
                            {connected && (
                                <>Round Cost: <span className="text-white font-bold">{myCost} SOL</span></>
                            )}
                        </div>
                        <div className="text-[10px] text-gray-600 font-mono opacity-50">
                            <Globe className="w-3 h-3 inline mr-1" />
                            Syncing Sonic SVM...
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* RIGHT: Live Feed */}
        <div className="hidden lg:flex flex-col h-[600px]">
            <TransactionFeed 
                transactions={gameState.recentTx} 
                networkName={connected ? "Sonic Mainnet" : "Sonic Testnet"} 
            />
        </div>

      </div>
    </main>
  );
}
