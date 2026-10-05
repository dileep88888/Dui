import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Play, X } from 'lucide-react';
import { sound } from '../utils/audio';

interface CrashResultModalProps {
  status: 'CRASHED' | 'CHECKED_OUT' | null;
  multiplier: number;
  payout: number;
  killedZombies: number;
  onPlayAgain: () => void;
  onClose: () => void;
}

export const CrashResultModal: React.FC<CrashResultModalProps> = ({
  status,
  multiplier,
  payout,
  killedZombies,
  onPlayAgain,
  onClose,
}) => {
  useEffect(() => {
    if (status === 'CHECKED_OUT') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#10b981', '#38bdf8', '#ffffff'],
      });
    }
  }, [status]);

  if (!status) return null;

  const isWin = status === 'CHECKED_OUT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-starburst">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl overflow-hidden text-center">
        {/* Backdrop glow */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
            isWin ? 'bg-emerald-500/20' : 'bg-rose-500/20'
          }`}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4 border shadow-inner">
          {isWin ? '🏆' : '💥'}
        </div>

        {/* Title */}
        <h3 className="font-comic text-2xl lg:text-3xl text-slate-100">
          {isWin ? 'SWEET CHECK OUT!' : 'CHICKEN DEFEATED!'}
        </h3>
        <p className="text-xs font-display text-slate-400 mt-1">
          {isWin
            ? `Successfully checked out with a ${multiplier.toFixed(2)}x multiplier!`
            : 'The zombies overwhelmed the crazy chicken! Time your hits accurately.'}
        </p>

        {/* Stats Showcase */}
        <div className="my-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-900/60 rounded-xl">
            <div className="text-[11px] font-display text-slate-400 uppercase font-semibold">Final Multiplier</div>
            <div className="font-comic text-2xl text-amber-300">
              {multiplier.toFixed(2)}x
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl">
            <div className="text-[11px] font-display text-slate-400 uppercase font-semibold">
              {isWin ? 'Cash Banked' : 'Cash Lost'}
            </div>
            <div className={`font-comic text-2xl ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isWin ? `+$${payout.toFixed(2)}` : '$0.00'}
            </div>
          </div>
        </div>

        {/* Single primary button: PLAY AGAIN */}
        <button
          onClick={() => {
            sound.playClick();
            onPlayAgain();
          }}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-comic text-xl flex items-center justify-center gap-2 shadow-lg cursor-pointer"
        >
          <Play className="w-6 h-6 fill-current" />
          <span>PLAY AGAIN</span>
        </button>
      </div>
    </div>
  );
};
