import React from 'react';
import { GameStatus } from '../types/game';
import { Play, DollarSign, Swords } from 'lucide-react';
import { sound } from '../utils/audio';

interface ControlPanelProps {
  status: GameStatus;
  stake: number;
  setStake: (stake: number) => void;
  money: number;
  multiplier: number;
  onPlay: () => void;
  onFight: () => void;
  onCheckOut: () => void;
  onReset: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  status,
  stake,
  setStake,
  money,
  multiplier,
  onPlay,
  onFight,
  onCheckOut,
  onReset,
}) => {
  const potentialPayout = Math.floor(stake * multiplier * 100) / 100;

  const adjustStake = (amount: number) => {
    sound.playClick();
    setStake(Math.min(money, Math.max(1, amount)));
  };

  const multiplyStake = (factor: number) => {
    sound.playClick();
    setStake(Math.min(money, Math.max(1, Math.floor(stake * factor))));
  };

  return (
    <div className="w-full bg-slate-900/95 border-2 border-slate-800 rounded-2xl p-4 lg:p-6 shadow-xl backdrop-blur-md">
      {status === 'READY' ? (
        // --- 1. READY STATE: STAKE & "PLAY" ---
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Stake Input */}
          <div className="flex-1 w-full space-y-2">
            <div className="flex items-center justify-between text-xs font-display text-slate-400">
              <span className="font-semibold uppercase tracking-wider">Battle Stake ($)</span>
              <span>Balance: ${money.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 font-bold">$</span>
                <input
                  type="number"
                  min="1"
                  max={money}
                  value={stake}
                  onChange={(e) => setStake(Math.min(money, Math.max(1, Number(e.target.value) || 1)))}
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-lg font-comic text-amber-300 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Quick stake multipliers */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => multiplyStake(0.5)}
                  className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-display font-bold text-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  ½
                </button>
                <button
                  onClick={() => multiplyStake(2)}
                  className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-display font-bold text-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  2×
                </button>
                <button
                  onClick={() => adjustStake(money)}
                  className="px-2.5 py-2 bg-slate-800 hover:bg-amber-600/40 text-xs font-display font-bold text-amber-400 rounded-lg transition-colors cursor-pointer"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Quick Stake Buttons */}
            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
              {[5, 10, 25, 50, 100].map((preset) => (
                <button
                  key={preset}
                  onClick={() => adjustStake(preset)}
                  className={`px-3 py-1 rounded-md text-xs font-display font-semibold transition-all cursor-pointer ${
                    stake === preset
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>

          {/* THE "PLAY" BUTTON */}
          <div className="w-full md:w-auto flex flex-col items-center gap-2">
            <button
              onClick={() => {
                if (money < stake) {
                  sound.playCrash();
                  return;
                }
                sound.playLaunch();
                onPlay();
              }}
              disabled={money < 1}
              className={`w-full md:w-64 py-4 px-8 rounded-2xl font-comic text-2xl tracking-wider transition-all transform active:scale-95 shadow-xl cursor-pointer flex items-center justify-center gap-3 ${
                money < stake
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 text-slate-950 hover:brightness-110 shadow-emerald-500/30 border-2 border-emerald-300'
              }`}
            >
              <Play className="w-7 h-7 fill-current" />
              <span>PLAY</span>
            </button>
            <span className="text-[11px] font-display text-slate-400">
              Fight zombies to multiply stake · Check out anytime
            </span>
          </div>
        </div>
      ) : status === 'FIGHTING' ? (
        // --- 2. FIGHTING: FIGHT AND CHECK OUT (NO STEP-BY-STEP, NO DEFAULT ZOMBIE NUMBERS) ---
        <div className="space-y-4">
          {/* Battle Info Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            {/* Multiplier */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-500/10 border-l-4 border-amber-400 rounded-r-lg">
              <div>
                <div className="text-[11px] font-display text-slate-400 uppercase font-semibold">Current Multiplier</div>
                <div className="font-comic text-2xl lg:text-3xl text-amber-300 tracking-tight flex items-baseline gap-1.5">
                  <span>{multiplier.toFixed(2)}x</span>
                  <span className="text-xs text-amber-500 font-bold animate-ping">▲</span>
                </div>
              </div>
            </div>

            {/* Current Bankable Cash */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-emerald-500/10 border-l-4 border-emerald-400 rounded-r-lg">
              <div>
                <div className="text-[11px] font-display text-slate-400 uppercase font-semibold">Bankable Cash</div>
                <div className="font-comic text-2xl lg:text-3xl text-emerald-400 tracking-tight">
                  ${potentialPayout.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Current Stake */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-cyan-500/10 border-l-4 border-cyan-400 rounded-r-lg">
              <div>
                <div className="text-[11px] font-display text-slate-400 uppercase font-semibold">Current Stake</div>
                <div className="font-comic text-2xl lg:text-3xl text-cyan-300 tracking-tight">
                  ${stake.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS: FIGHT & CLAIM IN ONE ROW */}
          <div className="flex flex-row items-center gap-2 sm:gap-4 pt-1 w-full">
            {/* 1. FIGHT BUTTON */}
            <button
              onClick={onFight}
              className="flex-1 py-3.5 sm:py-4 px-3 sm:px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-comic text-lg sm:text-xl lg:text-2xl shadow-xl shadow-rose-600/35 border-2 border-rose-300 active:scale-95 transition-all flex items-center justify-center gap-2 sm:gap-3 cursor-pointer"
            >
              <Swords className="w-5 h-5 sm:w-7 sm:h-7 shrink-0" />
              <span>FIGHT</span>
              <kbd className="hidden lg:inline text-xs bg-rose-900/80 px-2 py-0.5 rounded text-rose-200 font-mono">
                SPACE
              </kbd>
            </button>

            {/* 2. CLAIM BUTTON */}
            <button
              onClick={onCheckOut}
              className="flex-1 py-3.5 sm:py-4 px-3 sm:px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-comic text-lg sm:text-xl lg:text-2xl shadow-xl shadow-emerald-500/35 border-2 border-emerald-300 active:scale-95 transition-all flex items-center justify-center gap-2 sm:gap-3 cursor-pointer"
            >
              <DollarSign className="w-5 h-5 sm:w-7 sm:h-7 shrink-0" />
              <span>CLAIM</span>
              <span className="text-xs sm:text-sm bg-emerald-950/80 text-emerald-300 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded font-mono font-bold whitespace-nowrap">
                ${potentialPayout.toFixed(2)}
              </span>
            </button>
          </div>
        </div>
      ) : (
        // --- 3. ROUND FINISHED STATE ---
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${
              status === 'CHECKED_OUT' ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-rose-500/20 border-rose-500/50'
            }`}>
              {status === 'CHECKED_OUT' ? '🏆' : '💥'}
            </div>
            <div>
              <div className="font-comic text-xl text-slate-100">
                {status === 'CHECKED_OUT'
                  ? `CHECKED OUT: +$${potentialPayout.toFixed(2)}!`
                  : 'FIGHT LOST! CHICKEN CRASHED!'}
              </div>
              <div className="text-xs font-display text-slate-400">
                {status === 'CHECKED_OUT'
                  ? `Won at ${multiplier.toFixed(2)}x multiplier!`
                  : 'Defeated by an aggressive zombie!'}
              </div>
            </div>
          </div>

          <button
            onClick={onReset}
            className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-comic text-xl flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>PLAY AGAIN</span>
          </button>
        </div>
      )}
    </div>
  );
};
