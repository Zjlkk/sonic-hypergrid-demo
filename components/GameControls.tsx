"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Lock, Zap } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface GameControlsProps {
  onPump: () => void;
  onDump: () => void;
  bullPower: number;
  bearPower: number;
  userSide: 'bull' | 'bear' | null;
  currentMultiplier: number; // New Prop
}

export const GameControls: React.FC<GameControlsProps> = ({ onPump, onDump, bullPower, bearPower, userSide, currentMultiplier }) => {
  const { connected } = useWallet();
  const [lastClick, setLastClick] = useState<'pump' | 'dump' | null>(null);
  const [popText, setPopText] = useState("+POWER"); // Dynamic pop text
  
  useEffect(() => {
    if (connected) return;
    const interval = setInterval(() => {
        const rand = Math.random();
        if (rand > 0.7) {
            setLastClick('pump');
            setTimeout(() => setLastClick(null), 200);
        } else if (rand < 0.3) {
            setLastClick('dump');
            setTimeout(() => setLastClick(null), 200);
        }
    }, 800);
    return () => clearInterval(interval);
  }, [connected]);

  const handleAction = (action: 'pump' | 'dump') => {
    if (!connected) return;
    if (action === 'pump') onPump();
    else onDump();

    // Dynamic feedback
    const base = 100;
    const earned = (base * currentMultiplier).toFixed(0);
    setPopText(`+${earned} (${currentMultiplier.toFixed(1)}x)`);

    setLastClick(action);
    setTimeout(() => setLastClick(null), 200);
  };

  const totalPower = bullPower + bearPower || 1;
  const bullPct = (bullPower / totalPower) * 100;
  const bearPct = (bearPower / totalPower) * 100;

  // Multiplier Color Logic
  const multColor = currentMultiplier >= 2.0 ? "text-yellow-400" : currentMultiplier >= 1.0 ? "text-green-400" : "text-gray-400";

  return (
    <div className="w-full mt-8 relative">
      {/* Power Bar */}
      <div className="absolute -top-6 left-0 w-full h-1.5 bg-gray-800 rounded-full overflow-hidden flex">
        <div 
            className="h-full bg-green-500 transition-all duration-300 ease-out"
            style={{ width: `${bullPct}%` }}
        />
        <div 
            className="h-full bg-red-500 transition-all duration-300 ease-out"
            style={{ width: `${bearPct}%` }}
        />
      </div>

      {/* Multiplier Indicator (Centered) */}
      {connected && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Yield Power</div>
              <div className={cn("text-2xl font-black font-mono flex items-center gap-1", multColor)}>
                  <Zap className="w-4 h-4" /> {currentMultiplier.toFixed(1)}x
              </div>
          </div>
      )}

      <div className="grid grid-cols-2 gap-4 relative">
        
        {!connected && (
            <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] rounded-2xl" />
                <div className="pointer-events-auto transform hover:scale-105 transition-transform duration-200 shadow-2xl shadow-blue-500/20">
                    <WalletMultiButton style={{ 
                        backgroundColor: '#2563eb', 
                        height: '48px',
                        borderRadius: '24px',
                        fontWeight: '800',
                        fontSize: '14px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '0 32px'
                    }}>
                        Connect to Play
                    </WalletMultiButton>
                </div>
            </div>
        )}

        {/* PUMP */}
        <motion.div
            whileTap={connected ? { scale: 0.95 } : {}}
            onClick={() => handleAction('pump')}
            className={cn(
                "h-32 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-200 border-2 relative overflow-hidden select-none cursor-pointer",
                connected 
                    ? userSide === 'bull'
                        ? "bg-green-500/20 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]" 
                        : userSide === 'bear'
                            ? "bg-gray-900/50 border-gray-800 opacity-60 hover:opacity-100" 
                            : "bg-green-900/10 border-green-500/30 hover:bg-green-500/20 hover:border-green-400"
                    : "bg-gray-900/40 border-gray-800 opacity-50 blur-[1px]"
            )}
        >
            {!connected && (
                <div className="absolute top-2 right-2 text-xs font-bold text-gray-500 flex items-center gap-1 opacity-50">
                    <Lock className="w-3 h-3" />
                </div>
            )}
            
            <ArrowUp className={cn("w-12 h-12", (connected || lastClick === 'pump') ? "text-green-400" : "text-gray-600")} />
            <span className={cn("text-2xl font-black tracking-tighter", (connected || lastClick === 'pump') ? "text-green-400" : "text-gray-500")}>
                PUMP IT
            </span>
            
            {/* Pop Text */}
            {lastClick === 'pump' && (
                <motion.div 
                    initial={{ opacity: 1, y: 0, scale: 0.5 }} 
                    animate={{ opacity: 0, y: -50, scale: 1.2 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-300 font-black text-xl z-20 pointer-events-none whitespace-nowrap text-shadow-lg"
                >
                    {popText}
                </motion.div>
            )}
        </motion.div>

        {/* DUMP */}
        <motion.div
            whileTap={connected ? { scale: 0.95 } : {}}
            onClick={() => handleAction('dump')}
            className={cn(
                "h-32 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-200 border-2 relative overflow-hidden select-none cursor-pointer",
                connected 
                    ? userSide === 'bear'
                        ? "bg-red-500/20 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]" 
                        : userSide === 'bull'
                            ? "bg-gray-900/50 border-gray-800 opacity-60 hover:opacity-100" 
                            : "bg-red-900/10 border-red-500/30 hover:bg-red-500/20 hover:border-red-400"
                    : "bg-gray-900/40 border-gray-800 opacity-50 blur-[1px]"
            )}
        >
            {!connected && (
                <div className="absolute top-2 right-2 text-xs font-bold text-gray-500 flex items-center gap-1 opacity-50">
                    <Lock className="w-3 h-3" />
                </div>
            )}

            <ArrowDown className={cn("w-12 h-12", (connected || lastClick === 'dump') ? "text-red-400" : "text-gray-600")} />
            <span className={cn("text-2xl font-black tracking-tighter", (connected || lastClick === 'dump') ? "text-red-400" : "text-gray-500")}>
                DUMP IT
            </span>

            {lastClick === 'dump' && (
                <motion.div 
                    initial={{ opacity: 1, y: 0, scale: 0.5 }} 
                    animate={{ opacity: 0, y: -50, scale: 1.2 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-300 font-black text-xl z-20 pointer-events-none whitespace-nowrap text-shadow-lg"
                >
                    {popText}
                </motion.div>
            )}
        </motion.div>
      </div>
    </div>
  );
};
