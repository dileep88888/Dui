import React, { useState, useEffect, useCallback } from 'react';
import { GameStatus } from './types/game';
import { INITIAL_MONEY } from './utils/gameConstants';
import { HeaderNav } from './components/HeaderNav';
import { GameCanvas } from './components/GameCanvas';
import { ControlPanel } from './components/ControlPanel';
import { CrashResultModal } from './components/CrashResultModal';
import { InstructionsModal } from './components/InstructionsModal';

const STORAGE_KEY_MONEY = 'cvz_player_money_v2';

export default function App() {
  // Player Balance
  const [money, setMoney] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MONEY);
      if (saved) return Math.max(10, Number(saved));
    } catch {}
    return INITIAL_MONEY;
  });

  // Audio settings
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [musicOn, setMusicOn] = useState<boolean>(false);

  // Instructions modal
  const [helpOpen, setHelpOpen] = useState<boolean>(false);

  // Gameplay Run State: READY, FIGHTING, CRASHED, CHECKED_OUT
  const [status, setStatus] = useState<GameStatus>('READY');
  const [stake, setStake] = useState<number>(10);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);
  const [finalMultiplier, setFinalMultiplier] = useState<number>(1.0);
  const [finalPayout, setFinalPayout] = useState<number>(0);
  const [kills, setKills] = useState<number>(0);

  // Result Modal
  const [resultModalStatus, setResultModalStatus] = useState<'CRASHED' | 'CHECKED_OUT' | null>(null);

  // Action Triggers
  const [fightTrigger, setFightTrigger] = useState<number>(0);
  const [checkOutTrigger, setCheckOutTrigger] = useState<number>(0);

  // Persist balance
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MONEY, String(money));
    } catch {}
  }, [money]);

  // 1. PLAY (Starts the continuous battle)
  const handlePlay = useCallback(() => {
    if (money < stake) return;

    // Deduct stake
    setMoney((prev) => Math.max(0, Math.round((prev - stake) * 100) / 100));

    setFightTrigger(0);
    setCheckOutTrigger(0);
    setKills(0);
    setCurrentMultiplier(1.0);
    setStatus('FIGHTING');
    setResultModalStatus(null);
  }, [money, stake]);

  // 2. FIGHT (Triggered by FIGHT button, Space, or canvas click)
  const handleFight = useCallback(() => {
    if (status === 'FIGHTING') {
      setFightTrigger((t) => t + 1);
    }
  }, [status]);

  // 3. CHECK OUT (Bank multiplied winnings)
  const handleCheckOut = useCallback(() => {
    if (status === 'FIGHTING') {
      setCheckOutTrigger((t) => t + 1);
    }
  }, [status]);

  // Handle successful check out
  const handleCheckOutSuccess = useCallback((mult: number, payout: number, killedZombies: number) => {
    setStatus('CHECKED_OUT');
    setFinalMultiplier(mult);
    setFinalPayout(payout);
    setKills(killedZombies);
    setResultModalStatus('CHECKED_OUT');

    // Add payout to balance
    setMoney((prev) => Math.round((prev + payout) * 100) / 100);
  }, []);

  // Handle defeat / crash
  const handleCrash = useCallback((mult: number, killedZombies: number) => {
    setStatus('CRASHED');
    setFinalMultiplier(mult);
    setFinalPayout(0);
    setKills(killedZombies);
    setResultModalStatus('CRASHED');
  }, []);

  // Multiplier callback
  const handleMultiplierUpdate = useCallback((mult: number) => {
    setCurrentMultiplier(mult);
  }, []);

  // Reset to Ready state for new round
  const handleResetRun = useCallback(() => {
    setStatus('READY');
    setResultModalStatus(null);
    setCurrentMultiplier(1.0);
    setFightTrigger(0);
    setCheckOutTrigger(0);
  }, []);

  // Free refill if out of coins
  const handleAddFunds = useCallback(() => {
    setMoney((prev) => prev + 50);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-body">
      {/* Clean Header: Brand & Balance */}
      <HeaderNav
        money={money}
        soundOn={soundOn}
        setSoundOn={setSoundOn}
        musicOn={musicOn}
        setMusicOn={setMusicOn}
        onOpenHelp={() => setHelpOpen(true)}
        onAddFunds={handleAddFunds}
      />

      {/* Main Battle Arena */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Game Canvas (The Graveyard Battlefield) */}
        <GameCanvas
          status={status}
          stake={stake}
          onCrash={handleCrash}
          onCheckOutSuccess={handleCheckOutSuccess}
          onMultiplierUpdate={handleMultiplierUpdate}
          fightTrigger={fightTrigger}
          checkOutTrigger={checkOutTrigger}
        />

        {/* The Action Controls (Clean FIGHT & CHECK OUT) */}
        <ControlPanel
          status={status}
          stake={stake}
          setStake={setStake}
          money={money}
          multiplier={currentMultiplier}
          onPlay={handlePlay}
          onFight={handleFight}
          onCheckOut={handleCheckOut}
          onReset={handleResetRun}
        />
      </main>

      {/* Round Finished Victory / Defeat Modal */}
      <CrashResultModal
        status={resultModalStatus}
        multiplier={finalMultiplier}
        payout={finalPayout}
        killedZombies={kills}
        onPlayAgain={handleResetRun}
        onClose={() => setResultModalStatus(null)}
      />

      {/* Instructions Modal */}
      <InstructionsModal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500 font-display">
        <span>Chicken Fight · Fight and Check Out</span>
      </footer>
    </div>
  );
}
