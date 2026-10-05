import React from 'react';
import { X, Play, Swords, DollarSign } from 'lucide-react';
import { sound } from '../utils/audio';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">📖</span>
          <h2 className="font-comic text-2xl text-slate-100">How to Play: Chicken Fight</h2>
        </div>
        <p className="text-xs font-display text-slate-400 mb-6">
          Simple 3-step action: Set your stake, fight oncoming zombies, and check out with multiplied cash!
        </p>

        {/* Steps */}
        <div className="space-y-4">
          {/* Step 1: PLAY */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h4 className="font-display font-bold text-slate-200 text-sm">1. Set Stake & Hit PLAY</h4>
              <p className="text-xs font-display text-slate-400 mt-0.5">
                Choose your battle stake and click <strong>PLAY</strong>. Your chicken walks up to the first zombie and <strong>STOPS</strong> face-to-face!
              </p>
            </div>
          </div>

          {/* Step 2: FIGHT */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-slate-200 text-sm">2. Click FIGHT (Attack & Advance)</h4>
              <p className="text-xs font-display text-slate-400 mt-0.5">
                Hit <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono text-[10px]">SPACE</kbd> or click <strong>FIGHT</strong>:
              </p>
              <ul className="text-xs text-slate-400 mt-2 space-y-1 list-disc list-inside">
                <li><strong className="text-amber-400">If You Win:</strong> Smashes the zombie, unlocks that checkpoint's multiplier (1.05x, 1.10x, 1.15x, 1.20x...), dashes to the next zombie, and <strong>STOPS</strong>!</li>
                <li><strong className="text-rose-400">If Countered:</strong> The zombie counters and crashes your chicken, ending the round.</li>
              </ul>
            </div>
          </div>

          {/* Step 3: CLAIM */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-yellow-500/20 text-yellow-400 shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-slate-200 text-sm">3. CLAIM (Bank Winnings Anytime)</h4>
              <p className="text-xs font-display text-slate-400 mt-0.5">
                While stopped at any multiplier milestone, click <strong>CLAIM</strong> (<kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300 font-mono text-[10px]">C</kbd>) to safely bank your multiplied earnings (Stake × Multiplier)!
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-comic text-lg shadow-lg cursor-pointer"
          >
            LET'S FIGHT!
          </button>
        </div>
      </div>
    </div>
  );
};
