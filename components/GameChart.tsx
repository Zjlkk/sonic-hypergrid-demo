"use client";

import React, { useEffect, useState, useRef } from 'react';
import { GameState } from '@/lib/game-engine';

interface GameChartProps {
  gameState: GameState;
}

export const GameChart: React.FC<GameChartProps> = ({ gameState }) => {
  // Keep track of history for the SVG path
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const maxPoints = 50; // Number of points to show

  useEffect(() => {
    setPriceHistory(prev => {
      const newHistory = [...prev, gameState.currentPrice];
      if (newHistory.length > maxPoints) {
        return newHistory.slice(newHistory.length - maxPoints);
      }
      return newHistory;
    });
  }, [gameState.currentPrice]);

  // Calculate SVG Path
  const width = 100;
  const height = 100;
  
  const minPrice = Math.min(...priceHistory, gameState.oraclePrice) * 0.999;
  const maxPrice = Math.max(...priceHistory, gameState.oraclePrice) * 1.001;
  const range = maxPrice - minPrice || 1;

  const getY = (price: number) => {
    return height - ((price - minPrice) / range) * height;
  };

  const points = priceHistory.map((price, index) => {
    const x = (index / (maxPoints - 1)) * width;
    const y = getY(price);
    return `${x},${y}`;
  }).join(' ');

  // Oracle Line (Dashed)
  const oracleY = getY(gameState.oraclePrice);

  // Determine Color
  const isPump = gameState.currentPrice >= gameState.oraclePrice;
  const colorClass = isPump ? "text-green-500" : "text-red-500";
  const fillClass = isPump ? "from-green-500/50" : "from-red-500/50";
  
  // Create area path (close the loop for gradient fill)
  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div className="w-full h-[400px] relative rounded-xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-sm flex flex-col">
      
      {/* SVG Chart Container */}
      <div className="flex-1 w-full h-full relative p-4">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
            {/* Grid Lines (Optional) */}
            <line x1="0" y1="25" x2="100" y2="25" stroke="white" strokeOpacity="0.05" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeOpacity="0.05" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1="75" x2="100" y2="75" stroke="white" strokeOpacity="0.05" vectorEffect="non-scaling-stroke" />

            {/* Oracle Line */}
            <line 
                x1="0" y1={oracleY} x2="100" y2={oracleY} 
                stroke="#fbbf24" 
                strokeWidth="2" 
                strokeDasharray="4" 
                vectorEffect="non-scaling-stroke"
                className="transition-all duration-300 ease-linear"
            />

            {/* Price Area Fill */}
            <polygon 
                points={areaPoints} 
                fill="url(#gradient)" 
                className="transition-all duration-100 ease-linear"
            />
            
            {/* Price Line Stroke */}
            <polyline 
                points={points} 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" 
                vectorEffect="non-scaling-stroke"
                className={`${colorClass} transition-all duration-100 ease-linear drop-shadow-lg`} 
            />

            {/* Gradient Definition */}
            <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" className={isPump ? "stop-green-500" : "stop-red-500"} stopOpacity="0.5" />
                    <stop offset="100%" className={isPump ? "stop-green-500" : "stop-red-500"} stopOpacity="0" />
                </linearGradient>
            </defs>
        </svg>

        {/* Current Price Dot Indicator */}
        <div 
            className={`absolute right-0 w-3 h-3 rounded-full shadow-lg ${isPump ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'}`}
            style={{ 
                top: `${(getY(gameState.currentPrice) / 100) * 100}%`,
                transition: 'top 0.1s linear'
            }} 
        />
      </div>

      {/* Overlay Stats */}
      <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none z-10">
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full animate-pulse ${isPump ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm font-mono font-bold ${isPump ? 'text-green-400' : 'text-red-400'}`}>
                GAME: ${gameState.currentPrice.toFixed(2)}
            </span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-sm font-mono text-yellow-400">
                ORACLE: ${gameState.oraclePrice.toFixed(2)}
            </span>
        </div>
      </div>
      
    </div>
  );
};
