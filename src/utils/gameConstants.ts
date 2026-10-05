import { StagePoint } from '../types/game';

export const INITIAL_MONEY = 100;

export const STAGE_POINTS: StagePoint[] = [
  { index: 0, multiplier: 1.05, distanceX: 360, zombieType: 'basic', label: '1.05x', winChance: 0.94 },
  { index: 1, multiplier: 1.10, distanceX: 660, zombieType: 'basic', label: '1.10x', winChance: 0.91 },
  { index: 2, multiplier: 1.15, distanceX: 960, zombieType: 'basic', label: '1.15x', winChance: 0.88 },
  { index: 3, multiplier: 1.20, distanceX: 1260, zombieType: 'basic', label: '1.20x', winChance: 0.85 },
  { index: 4, multiplier: 1.25, distanceX: 1560, zombieType: 'basic', label: '1.25x', winChance: 0.83 },
  { index: 5, multiplier: 1.30, distanceX: 1860, zombieType: 'runner', label: '1.30x', winChance: 0.81 },
  { index: 6, multiplier: 1.35, distanceX: 2160, zombieType: 'runner', label: '1.35x', winChance: 0.79 },
  { index: 7, multiplier: 1.40, distanceX: 2460, zombieType: 'conehead', label: '1.40x', winChance: 0.77 },
  { index: 8, multiplier: 1.50, distanceX: 2780, zombieType: 'conehead', label: '1.50x', winChance: 0.75 },
  { index: 9, multiplier: 1.65, distanceX: 3100, zombieType: 'buckethead', label: '1.65x', winChance: 0.73 },
  { index: 10, multiplier: 1.80, distanceX: 3440, zombieType: 'buckethead', label: '1.80x', winChance: 0.71 },
  { index: 11, multiplier: 2.00, distanceX: 3800, zombieType: 'buckethead', label: '2.00x', winChance: 0.69 },
  { index: 12, multiplier: 2.25, distanceX: 4180, zombieType: 'runner', label: '2.25x', winChance: 0.67 },
  { index: 13, multiplier: 2.47, distanceX: 4580, zombieType: 'conehead', label: '2.47x', winChance: 0.65 },
  { index: 14, multiplier: 2.70, distanceX: 5000, zombieType: 'buckethead', label: '2.70x', winChance: 0.63 },
  { index: 15, multiplier: 3.00, distanceX: 5440, zombieType: 'boss', label: '3.00x', winChance: 0.60 },
  { index: 16, multiplier: 3.50, distanceX: 5900, zombieType: 'runner', label: '3.50x', winChance: 0.56 },
  { index: 17, multiplier: 4.20, distanceX: 6380, zombieType: 'buckethead', label: '4.20x', winChance: 0.52 },
  { index: 18, multiplier: 5.00, distanceX: 6880, zombieType: 'boss', label: '5.00x', winChance: 0.48 },
  { index: 19, multiplier: 7.50, distanceX: 7420, zombieType: 'boss', label: '7.50x', winChance: 0.42 },
  { index: 20, multiplier: 10.00, distanceX: 8000, zombieType: 'boss', label: '10.00x', winChance: 0.35 },
];

export const MULTIPLIER_MILESTONES = STAGE_POINTS.map((s) => s.multiplier);
