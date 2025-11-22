import { useState, useEffect, useRef } from 'react';

export type LootType = 'common' | 'rare' | 'legendary';

export type Transaction = {
  id: string;
  user: string; 
  amount: number; // Points earned
  timestamp: number;
  latency: number; 
  lootType: LootType;
  entropyValue: number;
};

export type GameState = {
  myScore: number;     
  totalVolume: number; // Global Points Mined
  recentTx: Transaction[]; 
  sonicEntropy: number; // Visualizer only
  activePlayers: number;
};

const randomAddress = () => {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  return chars.charAt(Math.floor(Math.random() * chars.length)) + '...' + chars.charAt(Math.floor(Math.random() * chars.length));
};

export const useGameEngine = () => {
  const [gameState, setGameState] = useState<GameState>({
    myScore: 0,
    totalVolume: 845200,
    recentTx: [],
    sonicEntropy: 50,
    activePlayers: 142,
  });

  // High-Freq Entropy Update
  useEffect(() => {
      const interval = setInterval(() => {
          setGameState(prev => {
              const noise = (Math.random() - 0.5) * 20; 
              let newEntropy = prev.sonicEntropy + noise;
              if (newEntropy > 100) newEntropy = 100;
              if (newEntropy < 0) newEntropy = 0;
              return { ...prev, sonicEntropy: newEntropy };
          });
      }, 200); 
      return () => clearInterval(interval);
  }, []);

  // Infinite Traffic Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        // Randomly spawn background transactions to show "Liveness"
        if (Math.random() > 0.6) { // 40% chance per tick -> busy network
            const entropy = Math.floor(Math.random() * 100);
            let botType: LootType = 'common';
            let points = 10;
            
            if (entropy > 90) { botType = 'legendary'; points = 500; }
            else if (entropy > 60) { botType = 'rare'; points = 50; }

            const botTx: Transaction = {
                id: Math.random().toString(36).substr(2, 6),
                user: 'User-' + randomAddress(),
                amount: points,
                timestamp: Date.now(),
                latency: Math.floor(Math.random() * 50) + 380,
                lootType: botType,
                entropyValue: entropy
            };
            
            return {
                ...prev,
                totalVolume: prev.totalVolume + points,
                recentTx: [botTx, ...prev.recentTx].slice(0, 10),
                activePlayers: prev.activePlayers + (Math.random() > 0.5 ? 1 : -1)
            };
        }
        return prev;
      });
    }, 150); // Fast tick
    return () => clearInterval(interval);
  }, []);

  const dig = async () => {
    const entropy = gameState.sonicEntropy;
    
    let lootType: LootType = 'common';
    let points = 10;

    if (entropy > 85) {
        lootType = 'legendary';
        points = 500;
    } else if (entropy > 60) {
        lootType = 'rare';
        points = 50;
    }

    const myTx: Transaction = {
        id: Math.random().toString(36).substr(2, 6),
        user: 'You',
        amount: points,
        timestamp: Date.now(),
        latency: 400 + Math.floor(Math.random() * 20),
        lootType: lootType,
        entropyValue: Math.floor(entropy)
    };

    setGameState(prev => ({
        ...prev,
        myScore: prev.myScore + points,
        totalVolume: prev.totalVolume + points,
        recentTx: [myTx, ...prev.recentTx].slice(0, 10), 
    }));
    
    return { lootType, points };
  };

  return { gameState, dig };
};
