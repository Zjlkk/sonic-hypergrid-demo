import { useState, useEffect, useRef } from 'react';

export type Transaction = {
  id: string;
  type: 'pump' | 'dump';
  user: string; 
  amount: number;
  timestamp: number;
  latency: number; 
  entropyValue: number; 
  isCrit: boolean;      
};

export type GameState = {
  currentPrice: number;
  oraclePrice: number;
  bullPower: number;
  bearPower: number;
  timeLeft: number;
  roundId: number;
  status: 'active' | 'overdrive' | 'settled';
  totalVolume: number; // Changed from jackpot to Volume/Points
  myScore: number;     // Changed from Earnings to Score
  totalClicks: number; 
  activePlayers: number;
  recentTx: Transaction[]; 
  
  // Sonic Oracle States
  sonicEntropy: number;   
  entropyTrend: 'stable' | 'volatile';
};

const DEFAULT_PRICE = 150.00;
const ROUND_DURATION = 15; 
const OVERDRIVE_THRESHOLD = 3; 

// Helper to generate fake address
const randomAddress = () => {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  return chars.charAt(Math.floor(Math.random() * chars.length)) + 
         chars.charAt(Math.floor(Math.random() * chars.length)) + '...' + 
         chars.charAt(Math.floor(Math.random() * chars.length)) + 
         chars.charAt(Math.floor(Math.random() * chars.length));
};

export const useGameEngine = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentPrice: DEFAULT_PRICE,
    oraclePrice: DEFAULT_PRICE,
    bullPower: 5000, 
    bearPower: 5000,
    timeLeft: ROUND_DURATION,
    roundId: 1,
    status: 'active',
    totalVolume: 124050, // Points
    myScore: 0,
    totalClicks: 2000,
    activePlayers: 142,
    recentTx: [],
    sonicEntropy: 50,
    entropyTrend: 'stable',
  });

  const velocityRef = useRef<number>(0);
  const [userSide, setUserSide] = useState<'bull' | 'bear' | null>(null);
  
  // Fetch Price Logic 
  useEffect(() => {
    const fetchPrice = async () => {
        try {
            const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
            const data = await res.json();
            if (data.solana.usd) {
                setGameState(prev => ({ ...prev, currentPrice: data.solana.usd, oraclePrice: data.solana.usd }));
            }
        } catch (e) {}
    };
    fetchPrice();
  }, []);

  const winningSide = gameState.currentPrice >= gameState.oraclePrice ? 'bull' : 'bear';

  // Simulate Sonic Oracle High-Frequency Updates
  useEffect(() => {
      const interval = setInterval(() => {
          setGameState(prev => {
              const noise = (Math.random() - 0.5) * 20; 
              let newEntropy = prev.sonicEntropy + noise;
              if (newEntropy > 100) newEntropy = 100;
              if (newEntropy < 0) newEntropy = 0;
              
              return {
                  ...prev,
                  sonicEntropy: newEntropy,
                  entropyTrend: Math.abs(newEntropy - 50) > 30 ? 'volatile' : 'stable'
              };
          });
      }, 200); 
      return () => clearInterval(interval);
  }, []);

  // Main Game Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        let newTime = prev.timeLeft - 0.1; 

        if (newTime <= 0) {
          if (newTime < -3) { 
            velocityRef.current = 0; 
            return {
              ...prev,
              timeLeft: ROUND_DURATION,
              status: 'active',
              currentPrice: prev.oraclePrice,
              oraclePrice: prev.oraclePrice, 
              bullPower: 5000,
              bearPower: 5000,
              roundId: prev.roundId + 1,
              // Keep score, reset volume slightly
              totalVolume: prev.totalVolume + 1000,
              activePlayers: Math.floor(Math.random() * 50) + 100,
              recentTx: [],
            };
          }
          return { ...prev, timeLeft: Number(newTime.toFixed(1)), status: 'settled' };
        }

        let newStatus = prev.status;
        if (newTime <= OVERDRIVE_THRESHOLD && newTime > 0) newStatus = 'overdrive';

        // Physics
        const dist = prev.oraclePrice - prev.currentPrice;
        const gravityForce = dist * 0.05; 
        velocityRef.current *= 0.9; 
        let noise = 0;
        if (Math.abs(velocityRef.current) < 0.05) noise = (Math.random() - 0.5) * 0.02;
        velocityRef.current += gravityForce * 0.1;
        let newPrice = prev.currentPrice + velocityRef.current + noise;

        // "Bot" Traffic -> Real looking users
        const otherUserClicks = Math.floor(Math.random() * 3); 
        const newTxs: Transaction[] = [];
        for(let i=0; i<otherUserClicks; i++) {
            const botEntropy = Math.floor(Math.random() * 100);
            const isCrit = botEntropy > 80; 
            newTxs.push({
                id: Math.random().toString(36).substr(2, 9),
                type: Math.random() > 0.5 ? 'pump' : 'dump',
                user: randomAddress(), // Realistic address
                amount: 0.01,
                timestamp: Date.now(),
                latency: Math.floor(Math.random() * 100) + 380, 
                entropyValue: botEntropy,
                isCrit: isCrit
            });
        }

        const playerChange = Math.floor(Math.random() * 3) - 1; 
        let newPlayers = prev.activePlayers + playerChange;
        if (newPlayers < 50) newPlayers = 50;

        return {
          ...prev,
          timeLeft: Number(newTime.toFixed(1)),
          status: newStatus as any,
          currentPrice: newPrice,
          oraclePrice: prev.oraclePrice + (Math.random() - 0.5) * 0.01,
          totalVolume: prev.totalVolume + (otherUserClicks * 100),
          totalClicks: prev.totalClicks + otherUserClicks,
          activePlayers: newPlayers,
          recentTx: [...newTxs, ...prev.recentTx].slice(0, 7),
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const sendAction = async (side: 'bull' | 'bear', power: number) => {
    const currentEntropy = gameState.sonicEntropy;
    
    let entropyMultiplier = 1.0;
    let isCrit = false;

    if (currentEntropy > 80) {
        entropyMultiplier = 3.0; 
        isCrit = true;
    } else if (currentEntropy < 20) {
        entropyMultiplier = 0.5; 
    }

    const BASE_POWER = 100;
    const pointsEarned = BASE_POWER * entropyMultiplier;
    const appliedPower = pointsEarned;

    const BASE_PUSH = 0.15;
    const pushForce = (side === 'bull' ? BASE_PUSH : -BASE_PUSH) * entropyMultiplier; 
    
    velocityRef.current += pushForce;

    const myTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        type: side === 'bull' ? 'pump' : 'dump',
        user: 'You',
        amount: 0.01,
        timestamp: Date.now(),
        latency: 400 + Math.floor(Math.random() * 20),
        entropyValue: Math.floor(currentEntropy),
        isCrit: isCrit 
    };

    setGameState(prev => {
        const isFlip = userSide && userSide !== side;
        // If flip, no penalty in Points Mode, just switch side force
        
        return {
            ...prev,
            myScore: prev.myScore + pointsEarned,
            bullPower: side === 'bull' ? prev.bullPower + appliedPower : prev.bullPower,
            bearPower: side === 'bear' ? prev.bearPower + appliedPower : prev.bearPower,
            totalClicks: prev.totalClicks + 1,
            totalVolume: prev.totalVolume + pointsEarned,
            recentTx: [myTx, ...prev.recentTx].slice(0, 7), 
        };
    });
    setUserSide(side);
    
    return { isCrit, multiplier: entropyMultiplier, points: pointsEarned };
  };

  return { gameState, userSide, sendAction, winningSide };
};
