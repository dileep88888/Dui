import '../style.css';
import { sound } from './utils/audio';
import { STAGE_POINTS } from './utils/gameConstants';
import {
  drawBackground,
  drawCrazyChicken,
  drawZombie,
  drawParticle,
  drawStrikeZoneIndicator,
} from './utils/canvasRenderer';
import { Chicken, Zombie, Gravestone, Particle, Sunflower, GameStatus } from './types/game';
import confetti from 'canvas-confetti';

const STORAGE_KEY_MONEY = 'chicken_fight_money_v3';

// --- GAME STATE ---
let money = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_MONEY);
    if (saved) return Math.max(10, Number(saved));
  } catch {}
  return 100;
})();

let stake = 10;
let status: GameStatus = 'READY';
let currentMultiplier = 1.0;
let finalMultiplier = 1.0;
let finalPayout = 0;
let kills = 0;
let soundOn = true;
let musicOn = false;

// Internal 60fps game state
const gameState = {
  chicken: {
    x: 120,
    y: 350,
    vx: 0,
    targetY: 350,
    width: 56,
    height: 64,
    isAttacking: false,
    attackTimer: 0,
    invincibleTimer: 0,
    missTimer: 0,
    flappingFrame: 0,
    cluckState: 'idle' as const,
  } as Chicken,
  cameraX: 0,
  currentStageIndex: 0,
  targetChickenX: 250,
  isMoving: false,
  isResolvingFight: false,
  zombies: [] as Zombie[],
  gravestones: [] as Gravestone[],
  particles: [] as Particle[],
  sunflowers: [] as Sunflower[],
  screenShake: 0,
  nextParticleId: 1,
};

// --- DOM ELEMENTS ---
const headerBalanceEl = document.getElementById('header-balance')!;
const readyBalanceEl = document.getElementById('ready-balance-text')!;
const inputStakeEl = document.getElementById('input-stake') as HTMLInputElement;
const btnAddFundsEl = document.getElementById('btn-add-funds')!;
const btnToggleSoundEl = document.getElementById('btn-toggle-sound')!;
const btnToggleMusicEl = document.getElementById('btn-toggle-music')!;
const soundIconEl = document.getElementById('sound-icon')!;
const musicIconEl = document.getElementById('music-icon')!;
const btnOpenHelpEl = document.getElementById('btn-open-help')!;
const btnCloseInstructionsEl = document.getElementById('btn-close-instructions-modal')!;
const btnGotItEl = document.getElementById('btn-got-it')!;
const modalInstructionsEl = document.getElementById('modal-instructions')!;

const panelReadyEl = document.getElementById('panel-ready')!;
const panelFightingEl = document.getElementById('panel-fighting')!;
const panelFinishedEl = document.getElementById('panel-finished')!;

const btnPlayEl = document.getElementById('btn-play')!;
const btnFightEl = document.getElementById('btn-fight')!;
const btnClaimEl = document.getElementById('btn-claim')!;
const btnPlayAgainPanelEl = document.getElementById('btn-play-again-panel')!;
const btnPlayAgainModalEl = document.getElementById('btn-play-again-modal')!;
const btnCloseResultModalEl = document.getElementById('btn-close-result-modal')!;

const fightMultiplierTextEl = document.getElementById('fight-multiplier-text')!;
const fightBankableTextEl = document.getElementById('fight-bankable-text')!;
const fightStakeTextEl = document.getElementById('fight-stake-text')!;
const claimAmountBadgeEl = document.getElementById('claim-amount-badge')!;

const finishedIconBoxEl = document.getElementById('finished-icon-box')!;
const finishedTitleTextEl = document.getElementById('finished-title-text')!;
const finishedDescTextEl = document.getElementById('finished-desc-text')!;

const modalResultEl = document.getElementById('modal-result')!;
const modalBackdropGlowEl = document.getElementById('modal-backdrop-glow')!;
const modalResultIconEl = document.getElementById('modal-result-icon')!;
const modalResultTitleEl = document.getElementById('modal-result-title')!;
const modalResultSubtitleEl = document.getElementById('modal-result-subtitle')!;
const modalResultMultiplierEl = document.getElementById('modal-result-multiplier')!;
const modalResultCashLabelEl = document.getElementById('modal-result-cash-label')!;
const modalResultCashValueEl = document.getElementById('modal-result-cash-value')!;

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const canvasContainer = document.getElementById('canvas-container')!;
const ctx = canvas.getContext('2d')!;

// --- HELPER FUNCTIONS ---
function saveMoney() {
  try {
    localStorage.setItem(STORAGE_KEY_MONEY, String(money));
  } catch {}
}

function updateBalanceUI() {
  const formatted = `$${money.toFixed(2)}`;
  headerBalanceEl.textContent = formatted;
  readyBalanceEl.textContent = formatted;
  if (money < 5) {
    btnAddFundsEl.classList.remove('hidden');
  } else {
    btnAddFundsEl.classList.add('hidden');
  }
}

function updatePanelVisibility() {
  panelReadyEl.classList.add('hidden');
  panelFightingEl.classList.add('hidden');
  panelFinishedEl.classList.add('hidden');

  if (status === 'READY') {
    panelReadyEl.classList.remove('hidden');
    inputStakeEl.max = String(Math.max(1, money));
  } else if (status === 'FIGHTING') {
    panelFightingEl.classList.remove('hidden');
    updateFightUI();
  } else {
    panelFinishedEl.classList.remove('hidden');
    const isWin = status === 'CHECKED_OUT';
    finishedIconBoxEl.textContent = isWin ? '🏆' : '💥';
    finishedIconBoxEl.className = isWin
      ? 'w-12 h-12 rounded-xl flex items-center justify-center text-2xl border bg-emerald-500/20 border-emerald-500/50'
      : 'w-12 h-12 rounded-xl flex items-center justify-center text-2xl border bg-rose-500/20 border-rose-500/50';
    finishedTitleTextEl.textContent = isWin ? `CLAIMED: +$${finalPayout.toFixed(2)}!` : 'FIGHT LOST! CHICKEN CRASHED!';
    finishedDescTextEl.textContent = isWin
      ? `Won at ${finalMultiplier.toFixed(2)}x multiplier!`
      : 'Defeated by an aggressive zombie!';
  }
}

function updateFightUI() {
  const potential = Math.floor(stake * currentMultiplier * 100) / 100;
  fightMultiplierTextEl.textContent = `${currentMultiplier.toFixed(2)}x`;
  fightBankableTextEl.textContent = `$${potential.toFixed(2)}`;
  fightStakeTextEl.textContent = `$${stake.toFixed(2)}`;
  claimAmountBadgeEl.textContent = `$${potential.toFixed(2)}`;
}

function showResultModal(isWin: boolean) {
  modalResultEl.classList.remove('hidden');
  if (isWin) {
    modalBackdropGlowEl.className = 'absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none bg-emerald-500/20';
    modalResultIconEl.textContent = '🏆';
    modalResultTitleEl.textContent = 'SWEET CLAIM!';
    modalResultSubtitleEl.textContent = `Successfully claimed with a ${finalMultiplier.toFixed(2)}x multiplier!`;
    modalResultCashLabelEl.textContent = 'Cash Banked';
    modalResultCashValueEl.textContent = `+$${finalPayout.toFixed(2)}`;
    modalResultCashValueEl.className = 'font-comic text-2xl text-emerald-400';
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#f59e0b', '#10b981', '#38bdf8', '#ffffff'],
    });
  } else {
    modalBackdropGlowEl.className = 'absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none bg-rose-500/20';
    modalResultIconEl.textContent = '💥';
    modalResultTitleEl.textContent = 'CHICKEN DEFEATED!';
    modalResultSubtitleEl.textContent = 'The zombies overwhelmed the chicken! Better luck next time.';
    modalResultCashLabelEl.textContent = 'Cash Lost';
    modalResultCashValueEl.textContent = '$0.00';
    modalResultCashValueEl.className = 'font-comic text-2xl text-rose-400';
  }
  modalResultMultiplierEl.textContent = `${finalMultiplier.toFixed(2)}x`;
}

function hideResultModal() {
  modalResultEl.classList.add('hidden');
}

// --- SETUP STAGES & ENTITIES ---
function setupStages(isStartingBattle: boolean) {
  gameState.cameraX = 0;
  gameState.currentStageIndex = 0;
  currentMultiplier = 1.0;
  gameState.screenShake = 0;
  gameState.particles = [];
  gameState.isResolvingFight = false;

  const firstStopX = STAGE_POINTS[0].distanceX - 110;
  gameState.targetChickenX = firstStopX;

  gameState.chicken = {
    x: 120,
    y: 350,
    vx: isStartingBattle ? 4.5 : 0,
    targetY: 350,
    width: 56,
    height: 64,
    isAttacking: false,
    attackTimer: 0,
    invincibleTimer: 0,
    missTimer: 0,
    flappingFrame: 0,
    cluckState: isStartingBattle ? 'running' : 'idle',
  };
  gameState.isMoving = isStartingBattle;

  gameState.sunflowers = [
    { id: 1, x: 50, y: 260, level: 1, glowPhase: 0, readySun: false, lastSunTime: 0 },
    { id: 2, x: 100, y: 260, level: 1, glowPhase: 1.2, readySun: false, lastSunTime: 0 },
  ];

  gameState.gravestones = STAGE_POINTS.map((pt) => ({
    index: pt.index,
    x: pt.distanceX,
    multiplier: pt.multiplier,
    passed: false,
    glowTimer: 0,
  }));

  gameState.zombies = STAGE_POINTS.map((pt, i) => ({
    id: i + 1,
    stageIndex: pt.index,
    targetMultiplier: pt.multiplier,
    type: pt.zombieType,
    x: pt.distanceX,
    y: 350,
    vx: 0,
    width: pt.zombieType === 'boss' ? 70 : 44,
    height: pt.zombieType === 'boss' ? 95 : 62,
    isHit: false,
    hitTimer: 0,
    isDying: false,
    deathTimer: 0,
    walkFrame: Math.random() * 8,
  }));

  currentMultiplier = 1.0;
  updateFightUI();
}

// --- GAME ACTIONS ---
function handlePlay() {
  if (money < stake) {
    sound.playCrash();
    return;
  }
  sound.playLaunch();
  money = Math.max(0, Math.round((money - stake) * 100) / 100);
  saveMoney();
  updateBalanceUI();

  status = 'FIGHTING';
  kills = 0;
  currentMultiplier = 1.0;
  hideResultModal();
  updatePanelVisibility();

  setupStages(true);
}

function handleFight() {
  if (
    status !== 'FIGHTING' ||
    gameState.isMoving ||
    gameState.isResolvingFight ||
    gameState.chicken.cluckState === 'crashed'
  ) {
    return;
  }

  const currentStage = STAGE_POINTS[gameState.currentStageIndex];
  if (!currentStage) return;

  const currentZombie = gameState.zombies.find((z) => z.stageIndex === currentStage.index);
  if (!currentZombie || currentZombie.isDying) return;

  gameState.isResolvingFight = true;
  gameState.chicken.isAttacking = true;
  gameState.chicken.attackTimer = 16;
  gameState.chicken.vx = 3.5;

  sound.playDashAttack();

  const isWin = Math.random() < currentStage.winChance;

  setTimeout(() => {
    if (status !== 'FIGHTING') return;

    if (isWin) {
      gameState.chicken.isAttacking = false;
      gameState.screenShake = 10;

      sound.playZombieHit();
      sound.playCluck();

      currentZombie.isDying = true;
      currentZombie.deathTimer = 25;
      currentZombie.headY = 0;
      currentZombie.headFlyVx = 6.5 + Math.random() * 4;
      currentZombie.headFlyVy = -9 - Math.random() * 4;
      currentZombie.headRotation = 0;

      currentMultiplier = currentStage.multiplier;
      kills++;
      updateFightUI();

      const matchingGrave = gameState.gravestones.find((g) => g.index === currentStage.index);
      if (matchingGrave) {
        matchingGrave.passed = true;
        matchingGrave.glowTimer = 50;
        sound.playCoin();
      }

      // Starburst
      gameState.particles.push({
        id: gameState.nextParticleId++,
        x: (gameState.chicken.x + currentZombie.x) / 2,
        y: gameState.chicken.y - 10,
        vx: 0,
        vy: 0,
        life: 18,
        maxLife: 18,
        color: '#fbbf24',
        size: 64,
        type: 'starburst',
        rotation: Math.random() * Math.PI,
      });

      // Text popup
      gameState.particles.push({
        id: gameState.nextParticleId++,
        x: currentZombie.x,
        y: currentZombie.y - 45,
        vx: 0,
        vy: -2,
        life: 30,
        maxLife: 30,
        color: '#facc15',
        size: 26,
        type: 'text',
        text: `★ ${currentMultiplier.toFixed(2)}x ★`,
      });

      // Coins
      for (let k = 0; k < 6; k++) {
        gameState.particles.push({
          id: gameState.nextParticleId++,
          x: currentZombie.x,
          y: currentZombie.y,
          vx: (Math.random() - 0.5) * 8,
          vy: -4 - Math.random() * 5,
          life: 25,
          maxLife: 25,
          color: '#facc15',
          size: 7,
          type: 'coin',
        });
      }

      // Advance to next zombie and STOP!
      const nextIndex = gameState.currentStageIndex + 1;
      if (nextIndex >= STAGE_POINTS.length) {
        handleClaim();
        return;
      }

      gameState.currentStageIndex = nextIndex;
      const nextStopX = STAGE_POINTS[nextIndex].distanceX - 110;
      gameState.targetChickenX = nextStopX;
      gameState.chicken.vx = 5.2;
      gameState.chicken.cluckState = 'running';
      gameState.isMoving = true;
      gameState.isResolvingFight = false;
    } else {
      // Counter / Crash
      gameState.chicken.isAttacking = false;
      gameState.chicken.cluckState = 'crashed';
      gameState.chicken.vx = -2.5;
      gameState.screenShake = 16;
      gameState.isResolvingFight = false;
      gameState.isMoving = false;

      sound.playCrash();
      sound.playZombieBite();

      gameState.particles.push({
        id: gameState.nextParticleId++,
        x: gameState.chicken.x,
        y: gameState.chicken.y - 40,
        vx: 0,
        vy: -2,
        life: 35,
        maxLife: 35,
        color: '#ef4444',
        size: 26,
        type: 'text',
        text: '💀 ZOMBIE COUNTERED! CRASH!',
      });

      status = 'CRASHED';
      finalMultiplier = currentMultiplier;
      finalPayout = 0;
      updatePanelVisibility();
      showResultModal(false);
    }
  }, 240);
}

function handleClaim() {
  if (status !== 'FIGHTING' || gameState.chicken.cluckState === 'crashed') return;

  status = 'CHECKED_OUT';
  gameState.chicken.cluckState = 'cashout';
  finalMultiplier = currentMultiplier;
  finalPayout = Math.floor(stake * finalMultiplier * 100) / 100;

  money = Math.round((money + finalPayout) * 100) / 100;
  saveMoney();
  updateBalanceUI();

  sound.playCashOut();
  updatePanelVisibility();
  showResultModal(true);
}

function handleResetRun() {
  status = 'READY';
  currentMultiplier = 1.0;
  hideResultModal();
  updatePanelVisibility();
  setupStages(false);
}

// --- EVENT LISTENERS ---
btnPlayEl.addEventListener('click', handlePlay);
btnFightEl.addEventListener('click', handleFight);
btnClaimEl.addEventListener('click', handleClaim);
btnPlayAgainPanelEl.addEventListener('click', handleResetRun);
btnPlayAgainModalEl.addEventListener('click', handleResetRun);
btnCloseResultModalEl.addEventListener('click', hideResultModal);
canvasContainer.addEventListener('click', () => {
  if (status === 'FIGHTING') handleFight();
});

// Stake adjustments
inputStakeEl.addEventListener('input', () => {
  stake = Math.min(money, Math.max(1, Number(inputStakeEl.value) || 1));
  inputStakeEl.value = String(stake);
});

document.getElementById('btn-stake-half')?.addEventListener('click', () => {
  sound.playClick();
  stake = Math.min(money, Math.max(1, Math.floor(stake * 0.5)));
  inputStakeEl.value = String(stake);
});

document.getElementById('btn-stake-double')?.addEventListener('click', () => {
  sound.playClick();
  stake = Math.min(money, Math.max(1, Math.floor(stake * 2)));
  inputStakeEl.value = String(stake);
});

document.getElementById('btn-stake-max')?.addEventListener('click', () => {
  sound.playClick();
  stake = Math.max(1, Math.floor(money));
  inputStakeEl.value = String(stake);
});

document.querySelectorAll('.btn-preset-stake').forEach((chip) => {
  chip.addEventListener('click', (e) => {
    sound.playClick();
    const val = Number((e.currentTarget as HTMLElement).dataset.val || 10);
    stake = Math.min(money, Math.max(1, val));
    inputStakeEl.value = String(stake);
  });
});

btnAddFundsEl.addEventListener('click', () => {
  sound.playCoin();
  money += 50;
  saveMoney();
  updateBalanceUI();
});

// Sound & Music Toggles
btnToggleSoundEl.addEventListener('click', () => {
  soundOn = !soundOn;
  sound.setSoundEnabled(soundOn);
  soundIconEl.textContent = soundOn ? '🔊' : '🔇';
  if (soundOn) sound.playClick();
});

btnToggleMusicEl.addEventListener('click', () => {
  musicOn = !musicOn;
  sound.setMusicEnabled(musicOn);
  musicIconEl.textContent = musicOn ? '🎵' : '🔇';
  if (soundOn) sound.playClick();
});

// Help Modal
btnOpenHelpEl.addEventListener('click', () => {
  sound.playClick();
  modalInstructionsEl.classList.remove('hidden');
});

btnCloseInstructionsEl.addEventListener('click', () => {
  sound.playClick();
  modalInstructionsEl.classList.add('hidden');
});

btnGotItEl.addEventListener('click', () => {
  sound.playClick();
  modalInstructionsEl.classList.add('hidden');
});

// Keyboard controls (Space = FIGHT, C = CLAIM)
window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  if (e.code === 'Space') {
    e.preventDefault();
    if (status === 'READY') {
      handlePlay();
    } else if (status === 'FIGHTING') {
      handleFight();
    }
  } else if (e.code === 'KeyC') {
    e.preventDefault();
    if (status === 'FIGHTING') {
      handleClaim();
    }
  }
});

// --- MAIN 60 FPS RENDER LOOP ---
function gameLoop() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const displayWidth = Math.floor(rect.width);
  const displayHeight = Math.floor(rect.height || 480);

  if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
  }

  ctx.save();
  ctx.scale(dpr, dpr);

  const { chicken } = gameState;

  // 1. UPDATE PHYSICS
  if (status === 'FIGHTING' && chicken.cluckState !== 'crashed' && chicken.cluckState !== 'cashout') {
    if (gameState.isMoving) {
      chicken.flappingFrame++;
      chicken.x += chicken.vx;

      if (chicken.x >= gameState.targetChickenX) {
        chicken.x = gameState.targetChickenX;
        chicken.vx = 0;
        chicken.cluckState = 'idle';
        gameState.isMoving = false;
      }
    } else if (chicken.isAttacking) {
      chicken.flappingFrame++;
      chicken.x += chicken.vx;
    }

    const targetCamX = Math.max(0, chicken.x - displayWidth * 0.35);
    gameState.cameraX += (targetCamX - gameState.cameraX) * 0.12;

    gameState.gravestones.forEach((g) => {
      if (g.glowTimer > 0) g.glowTimer--;
    });

    for (let i = gameState.zombies.length - 1; i >= 0; i--) {
      const z = gameState.zombies[i];
      z.walkFrame += 0.12;

      if (z.isDying) {
        z.deathTimer--;
        if (z.headY !== undefined && z.headFlyVy !== undefined && z.headFlyVx !== undefined) {
          z.headY += z.headFlyVy;
          z.x += z.headFlyVx;
          z.headFlyVy += 0.45;
          z.headRotation = (z.headRotation || 0) + 0.2;
        }
        if (z.deathTimer <= 0) {
          gameState.zombies.splice(i, 1);
          continue;
        }
      }
    }
  }

  for (let i = gameState.particles.length - 1; i >= 0; i--) {
    const p = gameState.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.12;
    if (p.vRot) p.rotation = (p.rotation || 0) + p.vRot;
    p.life--;
    if (p.life <= 0) {
      gameState.particles.splice(i, 1);
    }
  }

  let shakeOffsetX = 0;
  let shakeOffsetY = 0;
  if (gameState.screenShake > 0) {
    shakeOffsetX = (Math.random() - 0.5) * gameState.screenShake * 2;
    shakeOffsetY = (Math.random() - 0.5) * gameState.screenShake * 2;
    gameState.screenShake *= 0.86;
    if (gameState.screenShake < 0.5) gameState.screenShake = 0;
  }

  // 2. RENDER SCENE
  ctx.clearRect(0, 0, displayWidth, displayHeight);

  drawBackground(
    ctx,
    displayWidth,
    displayHeight,
    gameState.cameraX,
    gameState.gravestones,
    gameState.sunflowers
  );

  const currentStage = STAGE_POINTS[gameState.currentStageIndex];
  const activeZombie = gameState.zombies.find((z) => !z.isDying && z.stageIndex === currentStage?.index);

  gameState.zombies.forEach((z) => {
    const screenX = z.x - gameState.cameraX;
    if (screenX > -100 && screenX < displayWidth + 100) {
      const zombieCopy = { ...z, x: screenX + shakeOffsetX, y: z.y + shakeOffsetY };
      drawZombie(ctx, zombieCopy);

      if (
        activeZombie &&
        z.id === activeZombie.id &&
        !gameState.isMoving &&
        !gameState.isResolvingFight &&
        status === 'FIGHTING'
      ) {
        drawStrikeZoneIndicator(ctx, screenX + shakeOffsetX, z.y + shakeOffsetY, true);
      }
    }
  });

  const chickenScreenX = chicken.x - gameState.cameraX;
  const shouldDrawChicken = chicken.invincibleTimer <= 0 || Math.floor(chicken.invincibleTimer / 4) % 2 === 0;
  if (shouldDrawChicken) {
    const chickenCopy = { ...chicken, x: chickenScreenX };
    drawCrazyChicken(ctx, chickenCopy, { x: shakeOffsetX, y: shakeOffsetY });
  }

  gameState.particles.forEach((p) => {
    const screenP = { ...p, x: p.x - gameState.cameraX + shakeOffsetX, y: p.y + shakeOffsetY };
    drawParticle(ctx, screenP);
  });

  ctx.restore();

  requestAnimationFrame(gameLoop);
}

// Initial boot
updateBalanceUI();
updatePanelVisibility();
setupStages(false);
requestAnimationFrame(gameLoop);
