import React from 'react';
import { Volume2, VolumeX, Music, HelpCircle, PlusCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderNavProps {
  money: number;
  soundOn: boolean;
  setSoundOn: (on: boolean) => void;
  musicOn: boolean;
  setMusicOn: (on: boolean) => void;
  onOpenHelp: () => void;
  onAddFunds: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  money,
  soundOn,
  setSoundOn,
  musicOn,
  setMusicOn,
  onOpenHelp,
  onAddFunds,
}) => {
  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    sound.setSoundEnabled(next);
    if (next) sound.playClick();
  };

  const toggleMusic = () => {
    const next = !musicOn;
    setMusicOn(next);
    sound.setMusicEnabled(next);
    if (soundOn) sound.playClick();
  };

  return (
    <header className="flex items-center justify-between px-4 lg:px-8 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 z-30 sticky top-0">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2">
        <span className="font-comic text-xl lg:text-2xl text-amber-400 tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] whitespace-nowrap">
          🐔 Chicken Fight
        </span>
      </div>

      {/* Zone 3: Primary Actions: Balance, Audio, Help */}
      <div className="flex items-center gap-2.5">
        {/* Money Counter */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/90 border border-amber-500/40 rounded-xl shadow-sm">
          <span className="text-amber-400 text-sm font-bold">💰</span>
          <span className="font-comic text-base lg:text-lg text-amber-300 tabular-nums">
            ${money.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          {money < 5 && (
            <button
              onClick={() => {
                sound.playCoin();
                onAddFunds();
              }}
              title="Add $50 free coins"
              className="text-[11px] font-display font-bold px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3 h-3" />
              <span>+$50</span>
            </button>
          )}
        </div>

        {/* Audio controls */}
        <button
          onClick={toggleSound}
          title={soundOn ? 'Mute SFX' : 'Unmute SFX'}
          aria-label={soundOn ? 'Mute SFX' : 'Unmute SFX'}
          className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
        >
          {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
        </button>

        <button
          onClick={toggleMusic}
          title={musicOn ? 'Stop Music' : 'Play Music'}
          aria-label={musicOn ? 'Stop Music' : 'Play Music'}
          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
            musicOn
              ? 'bg-amber-500/20 border-amber-500/60 text-amber-400 hover:bg-amber-500/30'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <Music className="w-4 h-4" />
        </button>

        {/* Instructions */}
        <button
          onClick={onOpenHelp}
          title="Game Rules"
          aria-label="Game Rules"
          className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-400 hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
