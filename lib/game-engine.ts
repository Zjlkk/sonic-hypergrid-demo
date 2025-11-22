import { useState, useEffect, useRef } from 'react';

export type Transaction = {
  id: string;
  type: 'pump' | 'dump';
  user: string; 
  amount: number;
  timestamp: number;
  latency: number; 
  entropyValue: number; // The Sonic Random Value used
  isCrit: boolean;      // Did it trigger a Critical Hit?
};

export type GameState = {
  currentPrice: number;
  oraclePrice: number;
  bullPower: number;
  bearPower: number;
  timeLeft: number;
  roundId: number;
  status: 'active' | 'overdrive' | 'settled';
  jackpot: number; 
  myContribution: number; 
  myPower: number; 
  totalClicks: number; 
  activePlayers: number;
  recentTx: Transaction[]; 
  lifetimeEarnings: number;
  
  // New Sonic Oracle States
  sonicEntropy: number;   // 0-100, represents randomness from Sonic
  entropyTrend: 'stable' | 'volatile';
};

const DEFAULT_PRICE = 150.00;
const ROUND_DURATION = 15; 
const OVERDRIVE_THRESHOLD = 3; 
const PRICE_PER_CLICK = 0.01; 
const JACKPOT_SHARE = 0.7; 

export const useGameEngine = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentPrice: DEFAULT_PRICE,
    oraclePrice: DEFAULT_PRICE,
    bullPower: 5000, 
    bearPower: 5000,
    timeLeft: ROUND_DURATION,
    roundId: 1,
    status: 'active',
    jackpot: 1240.50, 
    myContribution: 0,
    myPower: 0,
    totalClicks: 2000,
    activePlayers: 142,
    recentTx: [],
    lifetimeEarnings: 0,
    sonicEntropy: 50,
    entropyTrend: 'stable',
  });

  const velocityRef = useRef<number>(0);
  const [userSide, setUserSide] = useState<'bull' | 'bear' | null>(null);
  
  // Fetch Price Logic (Keep same)
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

  const calculatePotentialWin = (state: GameState, side: 'bull' | 'bear' | null) => {
      if (!side) return 0;
      const winning = state.currentPrice >= state.oraclePrice ? 'bull' : 'bear';
      if (side !== winning) return 0;
      const myTeamPower = side === 'bull' ? state.bullPower : state.bearPower;
      const denominator = myTeamPower > 0 ? myTeamPower : 1;
      return state.jackpot * (state.myPower / denominator);
  };

  const potentialWin = calculatePotentialWin(gameState, userSide).toFixed(4);
  const winningSide = gameState.currentPrice >= gameState.oraclePrice ? 'bull' : 'bear';

  // Simulate Sonic Oracle High-Frequency Updates
  useEffect(() => {
      const interval = setInterval(() => {
          setGameState(prev => {
              // Sonic produces "Chaos" values
              const noise = (Math.random() - 0.5) * 20; 
              let newEntropy = prev.sonicEntropy + noise;
              if (newEntropy > 100) newEntropy = 100;
              if (newEntropy < 0) newEntropy = 0;
              
              // Occasional "Trend" shifts
              const isVolatile = Math.abs(newEntropy - 50) > 30;

              return {
                  ...prev,
                  sonicEntropy: newEntropy,
                  entropyTrend: isVolatile ? 'volatile' : 'stable'
              };
          });
      }, 200); // Update every 200ms (5Hz)
      return () => clearInterval(interval);
  }, []);

  // Main Game Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        let newTime = prev.timeLeft - 0.1; 

        if (newTime <= 0) {
          if (prev.status !== 'settled') {
             return { ...prev, timeLeft: 0, status: 'settled' };
          }
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
              jackpot: prev.jackpot * 0.5,
              myContribution: 0,
              myPower: 0,
              totalClicks: 0,
              activePlayers: Math.floor(Math.random() * 50) + 100,
              recentTx: [],
            };
          }
          return { ...prev, timeLeft: Number(newTime.toFixed(1)) };
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

        // Bot Traffic (Also affected by Sonic Entropy!)
        const otherUserClicks = Math.floor(Math.random() * 3); 
        const newTxs: Transaction[] = [];
        for(let i=0; i<otherUserClicks; i++) {
            const botEntropy = Math.floor(Math.random() * 100);
            const isCrit = botEntropy > 80; // Bots get lucky too
            newTxs.push({
                id: Math.random().toString(36).substr(2, 9),
                type: Math.random() > 0.5 ? 'pump' : 'dump',
                user: 'Bot',
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
          jackpot: prev.jackpot + (otherUserClicks * PRICE_PER_CLICK * JACKPOT_SHARE),
          totalClicks: prev.totalClicks + otherUserClicks,
          activePlayers: newPlayers,
          recentTx: [...newTxs, ...prev.recentTx].slice(0, 7),
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (gameState.status === 'settled') {
        const win = calculatePotentialWin(gameState, userSide);
        if (win > 0) {
            setGameState(prev => ({ ...prev, lifetimeEarnings: prev.lifetimeEarnings + win }));
        }
    }
  }, [gameState.status]);

  const sendAction = async (side: 'bull' | 'bear', power: number) => {
    
    // --- READ SONIC STATE ---
    // In a real app, this would be: const entropy = await sonicConnection.getLatestVRF();
    const currentEntropy = gameState.sonicEntropy;
    
    // Determine Luck based on Sonic Entropy
    let entropyMultiplier = 1.0;
    let isCrit = false;

    if (currentEntropy > 80) {
        entropyMultiplier = 3.0; // CRITICAL HIT!
        isCrit = true;
    } else if (currentEntropy < 20) {
        entropyMultiplier = 0.5; // SLIPPAGE / BAD LUCK
    }

    // Calculate actual applied power
    const BASE_POWER = 100;
    const appliedPower = BASE_POWER * entropyMultiplier;

    const BASE_PUSH = 0.15;
    const pushForce = (side === 'bull' ? BASE_PUSH : -BASE_PUSH) * entropyMultiplier; // Crit also moves price harder
    
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
        const newMyContribution = isFlip ? 1 : prev.myContribution + 1;
        const newMyPower = isFlip ? appliedPower : prev.myPower + appliedPower;

        return {
            ...prev,
            myContribution: newMyContribution,
            myPower: newMyPower,
            bullPower: side === 'bull' ? prev.bullPower + appliedPower : prev.bullPower,
            bearPower: side === 'bear' ? prev.bearPower + appliedPower : prev.bearPower,
            totalClicks: prev.totalClicks + 1,
            jackpot: prev.jackpot + (PRICE_PER_CLICK * JACKPOT_SHARE),
            recentTx: [myTx, ...prev.recentTx].slice(0, 7), 
        };
    });
    setUserSide(side);
    
    // Return info for UI effects
    return { isCrit, multiplier: entropyMultiplier };
  };

  return { gameState, userSide, sendAction, potentialWin, winningSide };
};
