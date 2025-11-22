"use client";

import React, { useEffect, useState } from 'react';
import { Transaction } from '@/lib/game-engine';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles, Gem, Box, ArrowRight } from 'lucide-react';

interface TransactionFeedProps {
  transactions: Transaction[];
  networkName?: string;
}

export const TransactionFeed: React.FC<TransactionFeedProps> = ({ transactions }) => {
  const [displayTxs, setDisplayTxs] = useState<Transaction[]>([]);

  useEffect(() => {
      setDisplayTxs(transactions);
  }, [transactions]);

  return (
    <div className="flex flex-col h-full w-full relative">
      <div className="flex-1 overflow-y-auto relative mask-linear-fade">
        <div className="flex flex-col gap-2 pb-4">
            <AnimatePresence initial={false} mode='popLayout'>
                {displayTxs.map((tx) => (
                    <motion.div
                        key={tx.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`
                            relative p-3 rounded-xl border backdrop-blur-md text-xs font-mono cursor-default
                            ${tx.lootType === 'legendary' 
                                ? 'bg-purple-500/10 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                                : tx.lootType === 'rare'
                                    ? 'bg-blue-500/10 border-blue-500/30'
                                    : 'bg-neutral-800/40 border-white/5'}
                        `}
                    >
                        {/* Top Row: Request Context */}
                        <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-2">
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                <span className="text-gray-400">Solana</span>
                                <span className="text-gray-600 mx-1">→</span>
                                <span className="text-orange-400 font-bold">Sonic SVM</span>
                            </div>
                            <div className="text-[9px] text-gray-600">
                                {tx.latency}ms
                            </div>
                        </div>

                        {/* Middle Row: Data Read */}
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex flex-col">
                                <span className="text-[9px] text-gray-500 uppercase tracking-wider">Read State</span>
                                <div className="flex items-center gap-1 text-white">
                                    <Zap className="w-3 h-3 text-orange-400" />
                                    <span>Entropy: <span className="font-bold text-orange-300">{tx.entropyValue}</span></span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] text-gray-500 uppercase tracking-wider">Result</span>
                                <div className="flex items-center gap-1">
                                    {tx.lootType === 'legendary' ? (
                                        <span className="text-purple-400 font-bold flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" /> CRIT
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">Normal</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row: Loot */}
                        <div className={`
                            flex items-center justify-between p-1.5 rounded lg:rounded-md
                            ${tx.lootType === 'legendary' ? 'bg-purple-500/20 text-purple-200' : 'bg-black/20 text-gray-400'}
                        `}>
                            <div className="flex items-center gap-2">
                                {tx.lootType === 'legendary' ? <Gem className="w-3 h-3" /> : <Box className="w-3 h-3" />}
                                <span className="font-bold uppercase text-[10px]">{tx.lootType} Loot</span>
                            </div>
                            <span className="font-mono font-bold">+{tx.amount} PTS</span>
                        </div>

                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
