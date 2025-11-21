"use client";

import React, { useState, useEffect } from 'react';
import { Transaction } from '@/lib/game-engine';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, Zap, Pause, Users } from 'lucide-react';

interface TransactionFeedProps {
  transactions: Transaction[];
  networkName?: string;
}

const SolanaLogo = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.8 1.2H5.2C4.5 1.2 4.1 1.8 4.4 2.3L6.3 5.8C6.5 6.2 6.9 6.5 7.4 6.5H21C21.7 6.5 22.1 5.9 21.8 5.4L19.9 1.9C19.7 1.5 19.3 1.2 18.8 1.2Z" fill="#00FFA3"/>
    <path d="M18.8 17.5H5.2C4.5 17.5 4.1 18.1 4.4 18.6L6.3 22.1C6.5 22.5 6.9 22.8 7.4 22.8H21C21.7 22.8 22.1 22.2 21.8 21.7L19.9 18.2C19.7 17.8 19.3 17.5 18.8 17.5Z" fill="#9945FF"/>
    <path d="M5.2 9.3H18.8C19.5 9.3 19.9 8.7 19.6 8.2L17.7 4.7C17.5 4.3 17.1 4 16.6 4H3C2.3 4 1.9 4.6 2.2 5.1L4.1 8.6C4.3 9 4.7 9.3 5.2 9.3Z" fill="#14F195"/>
  </svg>
);

// Mock user list generator
const generateMockUsers = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: i,
        address: `${Math.random().toString(36).substr(2, 4)}...${Math.random().toString(36).substr(2, 4)}`,
        side: Math.random() > 0.5 ? 'bull' : 'bear',
        power: Math.floor(Math.random() * 5000) + 100
    }));
};

export const TransactionFeed: React.FC<TransactionFeedProps> = ({ transactions, networkName = "Sonic Testnet" }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'users'>('feed');
  const [isHovering, setIsHovering] = useState(false);
  const [displayTxs, setDisplayTxs] = useState<Transaction[]>([]);
  const [mockUsers, setMockUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!isHovering) {
        setDisplayTxs(transactions);
    }
  }, [transactions, isHovering]);

  // Init mock users
  useEffect(() => {
      setMockUsers(generateMockUsers(15));
      // Simulate active user changes
      const interval = setInterval(() => {
          setMockUsers(prev => {
              const next = [...prev];
              // Randomly update power or swap a user
              const idx = Math.floor(Math.random() * next.length);
              next[idx] = {
                  ...next[idx],
                  power: next[idx].power + Math.floor(Math.random() * 500)
              };
              return next.sort((a, b) => b.power - a.power); // Keep sorted by power
          });
      }, 2000);
      return () => clearInterval(interval);
  }, []);

  return (
    <div 
        className="flex flex-col h-full w-full overflow-hidden border-l border-white/5 pl-6 relative group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
    >
      {/* Header Tabs */}
      <div className="mb-4 flex items-center gap-4 border-b border-white/5 pb-2">
        <button 
            onClick={() => setActiveTab('feed')}
            className={`text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 pb-1 transition-colors ${activeTab === 'feed' ? 'text-white border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
        >
            <Zap className={networkName.includes("Mainnet") ? "w-3 h-3 text-green-500" : "w-3 h-3 text-orange-500"} /> 
            Mempool
        </button>
        <button 
            onClick={() => setActiveTab('users')}
            className={`text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 pb-1 transition-colors ${activeTab === 'users' ? 'text-white border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
        >
            <Users className="w-3 h-3" /> 
            Traders
        </button>
        
        <div className="flex-1 text-right">
             {activeTab === 'feed' && (
                <div className={`text-xs text-blue-400 transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
                    <Pause className="w-3 h-3 fill-current inline" />
                </div>
             )}
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative mask-linear-fade">
        
        {/* FEED VIEW */}
        {activeTab === 'feed' && (
            <div className="flex flex-col gap-2 pb-4">
                <AnimatePresence initial={false} mode='popLayout'>
                    {displayTxs.map((tx) => (
                        <motion.div
                            key={tx.id}
                            layout
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className={`
                                relative p-2.5 rounded-xl border backdrop-blur-md text-xs font-mono cursor-default
                                ${tx.user === 'You' 
                                    ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                                    : 'bg-neutral-900/60 border-white/5 hover:bg-neutral-800'}
                            `}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className={tx.user === 'You' ? 'text-blue-400 font-bold' : 'text-gray-400'}>
                                        {tx.user}
                                    </span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${tx.type === 'pump' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {tx.type}
                                    </span>
                                </div>
                                <div className="text-gray-600 text-[10px]">
                                    {tx.id}
                                </div>
                            </div>

                            <div className="flex items-center justify-between bg-black/20 rounded-lg p-1.5">
                                <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                    <SolanaLogo />
                                    <span>Solana</span>
                                </div>
                                <div className="flex-1 flex justify-center">
                                    <div className="h-px w-full bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800 relative">
                                        <motion.div 
                                            initial={{ x: '-100%' }}
                                            animate={{ x: '100%' }}
                                            transition={{ duration: 0.5, repeat: Infinity }}
                                            className="absolute top-0 left-0 w-1/3 h-full bg-blue-500/50 blur-[1px]"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-orange-400 font-bold">
                                    <span>Sonic SVM</span>
                                    <Zap className="w-3 h-3 fill-orange-500" />
                                </div>
                            </div>
                            
                            <div className="absolute -right-1 -top-1">
                                <div className="bg-green-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                                    ✓ <span className="opacity-80">{tx.latency}ms</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        )}

        {/* TRADERS VIEW */}
        {activeTab === 'users' && (
            <div className="flex flex-col gap-2">
                {mockUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-neutral-900/40 hover:bg-neutral-800 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${user.side === 'bull' ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="font-mono text-gray-300 text-xs">{user.address}</span>
                        </div>
                        <div className="text-xs font-mono font-bold text-gray-500">
                            {user.power} <span className="text-[10px] font-normal">PWR</span>
                        </div>
                    </div>
                ))}
            </div>
        )}

      </div>
    </div>
  );
};
