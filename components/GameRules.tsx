"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Trophy, ArrowRightLeft } from 'lucide-react';

interface GameRulesProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameRules: React.FC<GameRulesProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-neutral-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
            </button>

            <div className="p-8">
                <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
                    <span className="text-blue-400">Candle</span>Wars Rules
                </h2>
                <p className="text-gray-400 text-sm mb-6">
                    A high-frequency battle powered by HyperGrid technology.
                </p>

                <div className="space-y-6">
                    {/* Feature 1: The Bridge */}
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                            <ArrowRightLeft className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-base mb-1">Solana Assets, Sonic Speed</h3>
                            <p className="text-gray-400 text-xs leading-relaxed">
                                You sign transactions with your <strong className="text-white">Solana Wallet</strong>. 
                                The logic executes instantly on <strong className="text-white">Sonic SVM</strong>.
                                No bridging required.
                            </p>
                        </div>
                    </div>

                    {/* Feature 2: The Game */}
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 border border-green-500/30">
                            <Zap className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-base mb-1">Pump vs Dump</h3>
                            <p className="text-gray-400 text-xs leading-relaxed">
                                Choose a side. If the <strong className="text-green-400">Green Line</strong> ends 
                                higher than the Yellow Oracle Line, Bulls win. Otherwise, Bears win.
                            </p>
                        </div>
                    </div>

                    {/* Feature 3: The Prize */}
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0 border border-yellow-500/30">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-base mb-1">Winner Takes All</h3>
                            <p className="text-gray-400 text-xs leading-relaxed">
                                70% of all gas fees go into the Jackpot. Winners split the pot based on their contribution.
                                Losers get nothing.
                            </p>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={onClose}
                    className="mt-8 w-full py-3 bg-white text-black font-black rounded-xl hover:bg-gray-200 transition-colors"
                >
                    GOT IT
                </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
