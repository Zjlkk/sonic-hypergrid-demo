"use client";

import React, { useEffect, useState } from 'react';
import { Transaction } from '@/lib/game-engine';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles, Gem, Box } from 'lucide-react';

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
      <div className="flex-1 overflow-y-auto relative mask-linear-fade" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>

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
                            relative p-3 rounded-xl border backdrop-blur-md text-xs font-mono cursor-default flex items-center justify-between
                            ${tx.lootType === 'legendary' 
                                ? 'bg-purple-500/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                                : tx.lootType === 'rare'
                                    ? 'bg-blue-500/10 border-blue-500/30'
                                    : 'bg-neutral-800/40 border-white/5'}
                        `}
                    >
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className={tx.user === 'You' ? 'text-white font-bold' : 'text-gray-500'}>
                                    {tx.user}
                                </span>
                                {tx.lootType === 'legendary' && <span className="text-[8px] bg-purple-500 text-white px-1 rounded font-bold flex items-center gap-1"><Sparkles className="w-2 h-2"/> LEGENDARY</span>}
                                {tx.lootType === 'rare' && <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1 rounded font-bold">RARE</span>}
                            </div>
                            <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                <Zap className="w-3 h-3 text-orange-400" />
                                Read from Sonic
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {tx.lootType === 'legendary' ? <Gem className="w-4 h-4 text-purple-400" /> : <Box className="w-4 h-4 text-gray-600" />}
                            <span className={`font-bold ${tx.lootType === 'legendary' ? 'text-purple-300' : 'text-gray-400'}`}>
                                +{tx.amount}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    </div>
  );
};
