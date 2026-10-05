import React, { useRef, useEffect, useCallback } from 'react';
import { Chicken, Zombie, Gravestone, Particle, GameStatus, Sunflower } from '../types/game';
import {
  drawBackground,
  drawCrazyChicken,
  drawZombie,
  drawParticle,
  drawStrikeZoneIndicator,
} from '../utils/canvasRenderer';
import { STAGE_POINTS } from '../utils/gameConstants';
import { sound } from '../utils/audio';

interface GameCanvasProps {
  status: GameStatus;
  stake: number;
  onCrash: (finalMultiplier: number, killedZombies: number) => void;
  onCheckOutSuccess: (finalMultiplier: number, payout: number, killedZombies: number) => void;
  onMultiplierUpdate: (mult: number) => void;
  fightTrigger: number;
  checkOutTrigger: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  status,
  stake,
  onCrash,
  onCheckOutSuccess,
  onMultiplierUpdate,
  fightTrigger,
  checkOutTrigger,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stable callback & value refs
  const onCrashRef = useRef(onCrash);
  onCrashRef.current = onCrash;

  const onCheckOutSuccessRef = useRef(onCheckOutSuccess);
  onCheckOutSuccessRef.current = onCheckOutSuccess;

  const onMultiplierUpdateRef = useRef(onMultiplierUpdate);
  onMultiplierUpdateRef.current = onMultiplierUpdate;

  const stakeRef = useRef(stake);
  stakeRef.current = stake;

  const statusRef = useRef(status);
  statusRef.current = status;

  // Track previous status
  const prevStatusRef = useRef<GameStatus>(status);

  // Mutable internal game state for 60fps loop
  const gameStateRef = useRef({
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
    targetChickenX: 250, // Where the chicken will STOP
    isMoving: false,     // True only while smoothly dashing to next station
    isResolvingFight: false,
    zombies: [] as Zombie[],
    gravestones: [] as Gravestone[],
    particles: [] as Particle[],
    sunflowers: [] as Sunflower[],
    killedZombiesCount: 0,
    currentMultiplier: 1.0,
    screenShake: 0,
    nextParticleId: 1,
  });

  // Setup stages and entities
  const setupStages = useCallback((isStartingBattle: boolean) => {
    const state = gameStateRef.current;
    state.cameraX = 0;
    state.currentStageIndex = 0;
    state.killedZombiesCount = 0;
    state.currentMultiplier = 1.0;
    state.screenShake = 0;
    state.particles = [];
    state.isResolvingFight = false;

    // Standoff position for first zombie (Stage 0 distanceX 360 - 110 = 250)
    const firstStopX = STAGE_POINTS[0].distanceX - 110;
    state.targetChickenX = firstStopX;

    // Chicken setup
    state.chicken = {
      x: 120,
      y: 350,
      // If battle starts, walk forward to first zombie and STOP!
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
    state.isMoving = isStartingBattle;

    // Sunflowers on left
    state.sunflowers = [
      { id: 1, x: 50, y: 260, level: 1, glowPhase: 0, readySun: false, lastSunTime: 0 },
      { id: 2, x: 100, y: 260, level: 1, glowPhase: 1.2, readySun: false, lastSunTime: 0 },
    ];

    // Build Gravestones & Aggressive Zombies at each point
    state.gravestones = STAGE_POINTS.map((pt) => ({
      index: pt.index,
      x: pt.distanceX,
      multiplier: pt.multiplier,
      passed: false,
      glowTimer: 0,
    }));

    state.zombies = STAGE_POINTS.map((pt, i) => ({
      id: i + 1,
      stageIndex: pt.index,
      targetMultiplier: pt.multiplier,
      type: pt.zombieType,
      x: pt.distanceX,
      y: 350,
      vx: 0, // Zombie stands ground guarding gravestone
      width: pt.zombieType === 'boss' ? 70 : 44,
      height: pt.zombieType === 'boss' ? 95 : 62,
      isHit: false,
      hitTimer: 0,
      isDying: false,
      deathTimer: 0,
      walkFrame: Math.random() * 8,
    }));

    // Inform parent
    onMultiplierUpdateRef.current(1.0);
  }, []);

  // ONLY re-setup when status transitions to FIGHTING or READY!
  useEffect(() => {
    if (status === 'FIGHTING' && prevStatusRef.current !== 'FIGHTING') {
      setupStages(true);
    } else if (status === 'READY') {
      setupStages(false);
    }
    prevStatusRef.current = status;
  }, [status, setupStages]);

  // Execute FIGHT: Attack current zombie, and if win, advance to next zombie and STOP!
  const performFight = useCallback(() => {
    const state = gameStateRef.current;
    if (
      statusRef.current !== 'FIGHTING' ||
      state.isMoving ||
      state.isResolvingFight ||
      state.chicken.cluckState === 'crashed'
    ) {
      return;
    }

    const currentStage = STAGE_POINTS[state.currentStageIndex];
    if (!currentStage) return;

    // Find the zombie guarding this stage
    const currentZombie = state.zombies.find((z) => z.stageIndex === currentStage.index);
    if (!currentZombie || currentZombie.isDying) return;

    state.isResolvingFight = true;
    state.chicken.isAttacking = true;
    state.chicken.attackTimer = 16;
    state.chicken.vx = 3.5; // strike lunge

    sound.playDashAttack();

    // Roll random win vs loss
    const isWin = Math.random() < currentStage.winChance;

    setTimeout(() => {
      if (statusRef.current !== 'FIGHTING') return;

      if (isWin) {
        // --- CHICKEN WINS! ZOMBIE DIES! ---
        state.chicken.isAttacking = false;
        state.screenShake = 10;

        sound.playZombieHit();
        sound.playCluck();

        // Kill current zombie
        currentZombie.isDying = true;
        currentZombie.deathTimer = 25;
        currentZombie.headY = 0;
        currentZombie.headFlyVx = 6.5 + Math.random() * 4;
        currentZombie.headFlyVy = -9 - Math.random() * 4;
        currentZombie.headRotation = 0;

        // Unlocked multiplier!
        const newMult = currentStage.multiplier;
        state.currentMultiplier = newMult;
        onMultiplierUpdateRef.current(newMult);
        state.killedZombiesCount++;

        // Light up gravestone
        const matchingGrave = state.gravestones.find((g) => g.index === currentStage.index);
        if (matchingGrave) {
          matchingGrave.passed = true;
          matchingGrave.glowTimer = 50;
          sound.playCoin();
        }

        // Comic Starburst Impact Explosion
        state.particles.push({
          id: state.nextParticleId++,
          x: (state.chicken.x + currentZombie.x) / 2,
          y: state.chicken.y - 10,
          vx: 0,
          vy: 0,
          life: 18,
          maxLife: 18,
          color: '#fbbf24',
          size: 64,
          type: 'starburst',
          rotation: Math.random() * Math.PI,
        });

        // Comic multiplier popup
        state.particles.push({
          id: state.nextParticleId++,
          x: currentZombie.x,
          y: currentZombie.y - 45,
          vx: 0,
          vy: -2,
          life: 30,
          maxLife: 30,
          color: '#facc15',
          size: 26,
          type: 'text',
          text: `★ ${newMult.toFixed(2)}x ★`,
        });

        // Flying coins
        for (let k = 0; k < 6; k++) {
          state.particles.push({
            id: state.nextParticleId++,
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

        // --- ADVANCE TO NEXT ZOMBIE AND STOP! ---
        const nextIndex = state.currentStageIndex + 1;
        if (nextIndex >= STAGE_POINTS.length) {
          // Reached final stage! Auto victory checkout!
          const finalMult = state.currentMultiplier;
          const payout = Math.floor(stakeRef.current * finalMult * 100) / 100;
          sound.playCashOut();
          onCheckOutSuccessRef.current(finalMult, payout, state.killedZombiesCount);
          return;
        }

        // Move smoothly to the next zombie's standoff position and STOP!
        state.currentStageIndex = nextIndex;
        const nextStopX = STAGE_POINTS[nextIndex].distanceX - 110;
        state.targetChickenX = nextStopX;
        state.chicken.vx = 5.2;
        state.chicken.cluckState = 'running';
        state.isMoving = true;
        state.isResolvingFight = false;
      } else {
        // --- CHICKEN LOSES! ZOMBIE COUNTERS AND CRASHES CHICKEN! ---
        state.chicken.isAttacking = false;
        state.chicken.cluckState = 'crashed';
        state.chicken.vx = -2.5;
        state.screenShake = 16;
        state.isResolvingFight = false;
        state.isMoving = false;

        sound.playCrash();
        sound.playZombieBite();

        state.particles.push({
          id: state.nextParticleId++,
          x: state.chicken.x,
          y: state.chicken.y - 40,
          vx: 0,
          vy: -2,
          life: 35,
          maxLife: 35,
          color: '#ef4444',
          size: 26,
          type: 'text',
          text: '💀 ZOMBIE COUNTERED! CRASH!',
        });

        onCrashRef.current(state.currentMultiplier, state.killedZombiesCount);
      }
    }, 240);
  }, []);

  // Execute CHECK OUT: bank cash anytime!
  const performCheckOut = useCallback(() => {
    const state = gameStateRef.current;
    if (statusRef.current !== 'FIGHTING' || state.chicken.cluckState === 'crashed') return;

    state.chicken.cluckState = 'cashout';
    const finalMult = state.currentMultiplier;
    const payout = Math.floor(stakeRef.current * finalMult * 100) / 100;

    sound.playCashOut();
    onCheckOutSuccessRef.current(finalMult, payout, state.killedZombiesCount);
  }, []);

  // Trigger hooks
  const lastFightTriggerRef = useRef(fightTrigger);
  useEffect(() => {
    if (fightTrigger > lastFightTriggerRef.current && status === 'FIGHTING') {
      performFight();
    }
    lastFightTriggerRef.current = fightTrigger;
  }, [fightTrigger, status, performFight]);

  const lastCheckOutTriggerRef = useRef(checkOutTrigger);
  useEffect(() => {
    if (checkOutTrigger > lastCheckOutTriggerRef.current && status === 'FIGHTING') {
      performCheckOut();
    }
    lastCheckOutTriggerRef.current = checkOutTrigger;
  }, [checkOutTrigger, status, performCheckOut]);

  useEffect(() => {
    if (status !== 'FIGHTING') {
      lastFightTriggerRef.current = fightTrigger;
      lastCheckOutTriggerRef.current = checkOutTrigger;
    }
  }, [status, fightTrigger, checkOutTrigger]);

  // Keyboard shortcut listener (Space = FIGHT, C = CHECK OUT)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'Space') {
        e.preventDefault();
        performFight();
      } else if (e.code === 'KeyC') {
        e.preventDefault();
        performCheckOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [performFight, performCheckOut]);

  // Main 60 FPS Canvas Game Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const state = gameStateRef.current;
      const { chicken } = state;

      // Handle responsive canvas scaling
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

      // --- 1. UPDATE PHYSICS & MOVEMENT (STOPPING AT EACH ZOMBIE) ---
      if (status === 'FIGHTING' && chicken.cluckState !== 'crashed' && chicken.cluckState !== 'cashout') {
        // If moving toward target standoff position:
        if (state.isMoving) {
          chicken.flappingFrame++;
          chicken.x += chicken.vx;

          // When chicken reaches target standoff position: STOP!
          if (chicken.x >= state.targetChickenX) {
            chicken.x = state.targetChickenX;
            chicken.vx = 0;
            chicken.cluckState = 'idle';
            state.isMoving = false;
          }
        } else if (chicken.isAttacking) {
          chicken.flappingFrame++;
          chicken.x += chicken.vx;
        }

        // Camera smoothly glides to center the chicken and current zombie standoff
        const targetCamX = Math.max(0, chicken.x - displayWidth * 0.35);
        state.cameraX += (targetCamX - state.cameraX) * 0.12;

        // Gravestone glow decay
        state.gravestones.forEach((g) => {
          if (g.glowTimer > 0) g.glowTimer--;
        });

        // Update Zombies
        for (let i = state.zombies.length - 1; i >= 0; i--) {
          const z = state.zombies[i];
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
              state.zombies.splice(i, 1);
              continue;
            }
          }
        }
      }

      // Update particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        if (p.vRot) p.rotation = (p.rotation || 0) + p.vRot;
        p.life--;
        if (p.life <= 0) {
          state.particles.splice(i, 1);
        }
      }

      // Screen shake decay
      let shakeOffsetX = 0;
      let shakeOffsetY = 0;
      if (state.screenShake > 0) {
        shakeOffsetX = (Math.random() - 0.5) * state.screenShake * 2;
        shakeOffsetY = (Math.random() - 0.5) * state.screenShake * 2;
        state.screenShake *= 0.86;
        if (state.screenShake < 0.5) state.screenShake = 0;
      }

      // --- 2. RENDER THE SCENE ---
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      // Draw Background
      drawBackground(
        ctx,
        displayWidth,
        displayHeight,
        state.cameraX,
        state.gravestones,
        state.sunflowers
      );

      // Identify current zombie
      const currentStage = STAGE_POINTS[state.currentStageIndex];
      const activeZombie = state.zombies.find((z) => !z.isDying && z.stageIndex === currentStage?.index);

      // Render Aggressive Zombies
      state.zombies.forEach((z) => {
        const screenX = z.x - state.cameraX;
        if (screenX > -100 && screenX < displayWidth + 100) {
          const zombieCopy = { ...z, x: screenX + shakeOffsetX, y: z.y + shakeOffsetY };
          drawZombie(ctx, zombieCopy);

          // Draw strike zone indicator only when stopped face-to-face with target zombie
          if (
            activeZombie &&
            z.id === activeZombie.id &&
            !state.isMoving &&
            !state.isResolvingFight &&
            status === 'FIGHTING'
          ) {
            drawStrikeZoneIndicator(ctx, screenX + shakeOffsetX, z.y + shakeOffsetY, true);
          }
        }
      });

      // Render Crazy Chicken Hero
      const chickenScreenX = chicken.x - state.cameraX;
      const shouldDrawChicken = chicken.invincibleTimer <= 0 || Math.floor(chicken.invincibleTimer / 4) % 2 === 0;
      if (shouldDrawChicken) {
        const chickenCopy = { ...chicken, x: chickenScreenX };
        drawCrazyChicken(ctx, chickenCopy, { x: shakeOffsetX, y: shakeOffsetY });
      }

      // Render Particles
      state.particles.forEach((p) => {
        const screenP = { ...p, x: p.x - state.cameraX + shakeOffsetX, y: p.y + shakeOffsetY };
        drawParticle(ctx, screenP);
      });

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [status]);

  return (
    <div
      onClick={() => {
        if (status === 'FIGHTING') performFight();
      }}
      className="relative w-full overflow-hidden rounded-2xl border-4 border-slate-800 bg-slate-950 shadow-2xl cursor-pointer"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-[380px] sm:h-[460px] lg:h-[500px] block"
      />
    </div>
  );
};
