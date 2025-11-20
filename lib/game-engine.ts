import { useState, useEffect, useRef } from 'react';

export type Transaction = {
  id: string;
  type: 'pump' | 'dump';
  user: string; 
  amount: number;
  timestamp: number;
  latency: number; 
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
};

// Default fallback price if API fails
const DEFAULT_PRICE = 150.00;
const ROUND_DURATION = 60;
const OVERDRIVE_THRESHOLD = 10;
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
  });

  const velocityRef = useRef<number>(0);
  const [userSide, setUserSide] = useState<'bull' | 'bear' | null>(null);
  
  // 1. Fetch Real Price on Mount
  useEffect(() => {
    const fetchPrice = async () => {
        try {
            const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
            const data = await res.json();
            const realPrice = data.solana.usd;
            if (realPrice) {
                setGameState(prev => ({
                    ...prev,
                    currentPrice: realPrice,
                    oraclePrice: realPrice
                }));
            }
        } catch (e) {
            console.error("Failed to fetch SOL price, using default.", e);
        }
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

  const potentialWinVal = calculatePotentialWin(gameState, userSide);
  const potentialWin = potentialWinVal.toFixed(4);
  const winningSide = gameState.currentPrice >= gameState.oraclePrice ? 'bull' : 'bear';

  const randomUser = () => {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    return chars.charAt(Math.floor(Math.random() * chars.length)) + 
           chars.charAt(Math.floor(Math.random() * chars.length)) + 
           '...' + 
           chars.charAt(Math.floor(Math.random() * chars.length)) + 
           chars.charAt(Math.floor(Math.random() * chars.length));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        let newTime = prev.timeLeft - 0.1; 
        
        if (newTime <= 0) {
          if (prev.status !== 'settled') {
             return { ...prev, timeLeft: 0, status: 'settled' };
          }
          if (newTime < -5) {
            velocityRef.current = 0; 
            return {
              ...prev,
              timeLeft: ROUND_DURATION,
              status: 'active',
              // Reset to current oracle price (which drifts slowly)
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

        const dist = prev.oraclePrice - prev.currentPrice;
        const gravityForce = dist * 0.05; 
        velocityRef.current *= 0.9; 
        let noise = 0;
        if (Math.abs(velocityRef.current) < 0.05) noise = (Math.random() - 0.5) * 0.02;
        velocityRef.current += gravityForce * 0.1;
        let newPrice = prev.currentPrice + velocityRef.current + noise;

        const otherUserClicks = Math.floor(Math.random() * 3); 
        const newTxs: Transaction[] = [];
        for(let i=0; i<otherUserClicks; i++) {
            newTxs.push({
                id: Math.random().toString(36).substr(2, 9),
                type: Math.random() > 0.5 ? 'pump' : 'dump',
                user: randomUser(),
                amount: 0.01,
                timestamp: Date.now(),
                latency: Math.floor(Math.random() * 100) + 380, 
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
            setGameState(prev => ({
                ...prev,
                lifetimeEarnings: prev.lifetimeEarnings + win
            }));
        }
    }
  }, [gameState.status]);

  const sendAction = async (side: 'bull' | 'bear', power: number) => {
    const USER_POWER_PER_CLICK = 100;
    const pushForce = side === 'bull' ? 0.15 : -0.15;
    velocityRef.current += pushForce;

    const myTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        type: side === 'bull' ? 'pump' : 'dump',
        user: 'You',
        amount: 0.01,
        timestamp: Date.now(),
        latency: 400 + Math.floor(Math.random() * 20), 
    };

    setGameState(prev => {
        const isFlip = userSide && userSide !== side;
        const newMyContribution = isFlip ? 1 : prev.myContribution + 1;
        const newMyPower = isFlip ? USER_POWER_PER_CLICK : prev.myPower + USER_POWER_PER_CLICK;

        return {
            ...prev,
            myContribution: newMyContribution,
            myPower: newMyPower,
            bullPower: side === 'bull' ? prev.bullPower + USER_POWER_PER_CLICK : prev.bullPower,
            bearPower: side === 'bear' ? prev.bearPower + USER_POWER_PER_CLICK : prev.bearPower,
            totalClicks: prev.totalClicks + 1,
            jackpot: prev.jackpot + (PRICE_PER_CLICK * JACKPOT_SHARE),
            recentTx: [myTx, ...prev.recentTx].slice(0, 7), 
        };
    });
    setUserSide(side);
  };

  return { gameState, userSide, sendAction, potentialWin, winningSide };
};
