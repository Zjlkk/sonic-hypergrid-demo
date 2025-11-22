"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Hammer, Sparkles, Lock } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface GameControlsProps {
  onDig: () => Promise<any>;
  disabled: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({ onDig, disabled }) => {
  const { connected } = useWallet();
  const [isClicking, setIsClicking] = useState(false);
  const [popups, setPopups] = useState<{id: number, text: string, color: string}[]>([]);

  const handleClick = async () => {
    if (!connected || disabled) return;
    
    setIsClicking(true);
    const res = await onDig();
    setIsClicking(false);

    // Visual Pop
    const id = Date.now();
    const color = res.lootType === 'legendary' ? 'text-purple-400' : res.lootType === 'rare' ? 'text-blue-400' : 'text-gray-400';
    const text = `+${res.points}`;
    
    setPopups(prev => [...prev, { id, text, color }]);
    setTimeout(() => setPopups(prev => prev.filter(p => p.id !== id)), 1000);
  };

  return (
    <div className="w-full mt-6 relative flex justify-center">
      
      {/* Floating Popups */}
      {popups.map(p => (
           <motion.div
             key={p.id}
             initial={{ opacity: 1, y: -20, scale: 0.8 }}
             animate={{ opacity: 0, y: -100, scale: 1.5 }}
             className={cn("absolute top-0 left-1/2 -translate-x-1/2 text-4xl font-black z-50 pointer-events-none", p.color)}
           >
             {p.text}
           </motion.div>
      ))}

      {!connected && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
              <div className="pointer-events-auto transform hover:scale-105 transition-transform duration-200 shadow-2xl shadow-blue-500/20">
                  <WalletMultiButton style={{ 
                      backgroundColor: '#2563eb', 
                      height: '48px',
                      borderRadius: '24px',
                      fontWeight: '800',
                  }}>
                      Connect to Dig
                  </WalletMultiButton>
              </div>
          </div>
      )}

      {/* THE BIG BUTTON */}
      <motion.button
          whileTap={connected ? { scale: 0.9, rotate: -5 } : {}}
          onClick={handleClick}
          disabled={!connected || disabled}
          className={cn(
              "w-64 h-64 rounded-full flex flex-col items-center justify-center gap-4 transition-all duration-200 border-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group",
              connected 
                  ? "bg-gradient-to-b from-neutral-800 to-neutral-950 border-neutral-700 hover:border-blue-500 active:border-purple-500" 
                  : "bg-neutral-900 border-neutral-800 opacity-50 blur-[2px]"
          )}
      >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          
          {/* Inner Glow */}
          <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 group-active:bg-purple-500/20 transition-colors duration-200" />

          <Hammer className={cn("w-24 h-24 transition-colors", isClicking ? "text-purple-400" : "text-gray-500 group-hover:text-blue-400")} />
          
          <div className="flex flex-col items-center z-10">
              <span className={cn("text-3xl font-black tracking-tighter uppercase", isClicking ? "text-purple-400" : "text-white")}>
                  MINE LOOT
              </span>
              <span className="text-xs font-mono text-gray-500 mt-1 group-hover:text-blue-300">
                  Tap to sign transaction
              </span>
          </div>
      </motion.button>
    </div>
  );
};
