"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Zap, TrendingUp, Globe } from 'lucide-react';

export const GameRules = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Auto-open on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      >
        <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative"
        >
            <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
                <X className="w-5 h-5" />
            </button>

            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
                <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase mb-2">
                    Candle Wars
                </h2>
                <p className="text-blue-100 text-sm font-medium">
                    Sonic Entropy Mode
                </p>
            </div>

            <div className="p-6 space-y-6">
                
                {/* Rule 1: Chaos Mode */}
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                        <Globe className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm uppercase mb-1">Watch the Entropy</h3>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Sonic SVM generates real-time randomness.
                            <br/>
                            <span className="text-purple-400 font-bold">Entropy &gt; 80 (Purple):</span> <strong>3x CRIT!</strong> Spam click now!
                            <br/>
                            <span className="text-orange-400 font-bold">Entropy &lt; 20 (Orange):</span> <strong>0.5x Slip.</strong> Don't click.
                        </p>
                    </div>
                </div>

                {/* Rule 2: Points */}
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm uppercase mb-1">Score Points</h3>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            No SOL cost. Just sign transactions to earn points. Higher entropy = More points per click.
                        </p>
                    </div>
                </div>

                {/* Rule 3: Architecture */}
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm uppercase mb-1">Hybrid Architecture</h3>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            <strong>Sign on Solana. Read from Sonic.</strong> <br/>
                            Experience frictionless cross-chain state reading.
                        </p>
                    </div>
                </div>

                <button 
                    onClick={() => setIsOpen(false)}
                    className="w-full bg-white text-black font-black py-3 rounded-xl hover:scale-105 transition-transform"
                >
                    START TRADING
                </button>
            </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
