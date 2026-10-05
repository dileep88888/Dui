export type GameStatus = 'READY' | 'FIGHTING' | 'CRASHED' | 'CHECKED_OUT';

export type BattlePhase = 'STANDOFF' | 'ATTACKING' | 'STEP_WON' | 'WALKING_TO_NEXT';

export type ZombieType = 'basic' | 'conehead' | 'buckethead' | 'runner' | 'boss';

export interface Zombie {
  id: number;
  stageIndex: number;
  targetMultiplier: number;
  type: ZombieType;
  x: number;
  y: number;
  vx: number;
  width: number;
  height: number;
  isHit: boolean;
  hitTimer: number;
  isDying: boolean;
  deathTimer: number;
  headFlyVx?: number;
  headFlyVy?: number;
  headY?: number;
  headRotation?: number;
  walkFrame: number;
}

export interface Chicken {
  x: number;
  y: number;
  vx: number;
  targetY: number;
  width: number;
  height: number;
  isAttacking: boolean;
  attackTimer: number;
  invincibleTimer: number;
  missTimer: number;
  flappingFrame: number;
  cluckState: 'idle' | 'running' | 'attacking' | 'crashed' | 'cashout';
}

export interface Gravestone {
  index: number;
  x: number;
  multiplier: number;
  passed: boolean;
  glowTimer: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'spark' | 'feather' | 'coin' | 'text' | 'starburst' | 'smoke' | 'slime' | 'sun';
  text?: string;
  rotation?: number;
  vRot?: number;
}

export interface Sunflower {
  id: number;
  x: number;
  y: number;
  level: number;
  glowPhase: number;
  readySun: boolean;
  lastSunTime: number;
}

export interface StagePoint {
  index: number;
  multiplier: number;
  distanceX: number;
  zombieType: ZombieType;
  label: string;
  winChance: number; // e.g. 0.85 for 1.25x, down to 0.40 for high stages
}
