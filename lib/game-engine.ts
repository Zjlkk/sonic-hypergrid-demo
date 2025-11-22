import { useState, useEffect, useRef } from 'react';

export type LootType = 'common' | 'rare' | 'legendary';

export type Transaction = {
  id: string;
  user: string; 
  amount: number; // Points earned
  timestamp: number;
  latency: number; 
  lootType: LootType;
};

export type GameState = {
  myScore: number;     
  timeLeft: number;
  roundId: number;
  status: 'active' | 'settled';
  totalVolume: number; // Global Points Mined
  recentTx: Transaction[]; 
  sonicEntropy: number; // Visualizer only
};

const ROUND_DURATION = 30; // 30s Blitz Round

const randomAddress = () => {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  return 'User-' + chars.substring(0, 4);
};

export const useGameEngine = () => {
  const [gameState, setGameState] = useState<GameState>({
    myScore: 0,
    timeLeft: ROUND_DURATION,
    roundId: 1,
    status: 'active',
    totalVolume: 845200,
    recentTx: [],
    sonicEntropy: 50,
  });

  // High-Freq Entropy Update (Visual only now)
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

  // Timer Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        let newTime = prev.timeLeft - 0.1; 

        if (newTime <= 0) {
           // Auto Restart Round for endless fun
           if (newTime < -2) {
               return {
                   ...prev,
                   timeLeft: ROUND_DURATION,
                   status: 'active',
                   myScore: 0, // Reset score for new round
                   roundId: prev.roundId + 1,
                   recentTx: [],
               };
           }
           return { ...prev, timeLeft: 0, status: 'settled' };
        }

        // Fake Global Activity
        if (Math.random() > 0.7) {
            const botType = Math.random() > 0.95 ? 'legendary' : Math.random() > 0.8 ? 'rare' : 'common';
            const points = botType === 'legendary' ? 500 : botType === 'rare' ? 50 : 10;
            
            const botTx: Transaction = {
                id: Math.random().toString(36).substr(2, 6),
                user: randomAddress(),
                amount: points,
                timestamp: Date.now(),
                latency: Math.floor(Math.random() * 50) + 380,
                lootType: botType
            };
            
            return {
                ...prev,
                timeLeft: Number(newTime.toFixed(1)),
                totalVolume: prev.totalVolume + points,
                recentTx: [botTx, ...prev.recentTx].slice(0, 8)
            };
        }

        return { ...prev, timeLeft: Number(newTime.toFixed(1)) };
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const dig = async () => {
    // The Core Logic: Read Sonic State
    const entropy = gameState.sonicEntropy;
    
    let lootType: LootType = 'common';
    let points = 10;

    // Simple Probability Map
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
        lootType: lootType
    };

    setGameState(prev => ({
        ...prev,
        myScore: prev.myScore + points,
        totalVolume: prev.totalVolume + points,
        recentTx: [myTx, ...prev.recentTx].slice(0, 8), 
    }));
    
    return { lootType, points };
  };

  return { gameState, dig };
};
