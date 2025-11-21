"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Zap, TrendingUp, Wallet } from 'lucide-react';

export const GameRules = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Auto-open on mount (simulate checking if first visit)
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
            {/* Close Button */}
            <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
                <X className="w-5 h-5" />
            </button>

            {/* Hero Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
                <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase mb-2">
                    Candle Wars
                </h2>
                <p className="text-blue-100 text-sm font-medium">
                    The fastest trading game on Sonic SVM
                </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                
                {/* Rule 1 */}
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm uppercase mb-1">Winner Takes All</h3>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            60s Rounds. If your team (Bull/Bear) wins, you split the ENTIRE jackpot based on your contribution. Losers get nothing.
                        </p>
                    </div>
                </div>

                {/* Rule 2 */}
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm uppercase mb-1">Early Bird Multiplier</h3>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            <strong>0s-3s:</strong> 5x Power & Impact. Be the first to move the market. <br/>
                            <strong>Last 5s:</strong> 0.5x Power. Don't be late.
                        </p>
                    </div>
                </div>

                {/* Rule 3 */}
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm uppercase mb-1">HyperGrid Mechanics</h3>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Sign transactions on <span className="text-white">Solana</span>. Executed instantly on <span className="text-white">Sonic SVM</span>. Experience true high-frequency trading.
                        </p>
                    </div>
                </div>

                {/* CTA */}
                <button 
                    onClick={() => setIsOpen(false)}
                    className="w-full bg-white text-black font-black py-3 rounded-xl hover:scale-105 transition-transform"
                >
                    I'M READY
                </button>
            </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
