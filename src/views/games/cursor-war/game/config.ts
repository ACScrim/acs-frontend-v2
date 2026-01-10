import type { GameConfig } from './types';

export const defaultConfig: GameConfig = {
  width: 900,
  height: 600,

  playerRadius: 10,
  botRadius: 10,
  maxBots: 6,

  stunMs: 900,
  shootCooldownMs: 900,

  projectileSpeedPxPerSec: 720,
  projectileRadius: 5,
  projectileTtlMs: 1400,

  pickupRadius: 10,
  pickupTtlMs: 9000,
  pickupSpawnEveryMs: 1600,

  zoneSpawnEveryMs: 800,
  zoneRadius: 28,
  zoneTtlMs: 2800,

  // randomisation zones
  zoneRadiusMin: 18,
  zoneRadiusMax: 55,
  zoneTtlMsMin: 1400,
  zoneTtlMsMax: 4200,
  zoneWarnMsMin: 450,
  zoneWarnMsMax: 1100,

  // bots
  botMaxSpeedPxPerSec: 175,
  botSeparationRadius: 34,
  botSeparationStrength: 1.15,
  botShootChancePerSec: 0.45,

  // bots (mouvement naturel)
  botWanderStrength: 0.9,
  botWanderJitter: 2.4,
  botSteerStrength: 6.5,

  // particules
  explosionParticles: 18,
  explosionTtlMs: 520,
  explosionSpeedMin: 90,
  explosionSpeedMax: 320,

  // difficulté (score => densité de pièges)
  zoneSpawnEveryMsMin: 260,
  scoreToMaxDifficulty: 140,

  // lasers
  laserSpawnEveryMs: 2600,
  laserSpawnEveryMsMin: 800,
  laserWarnMsMin: 600,
  laserWarnMsMax: 1100,
  laserTtlMsMin: 900,
  laserTtlMsMax: 1800,
  laserWidthMin: 18,
  laserWidthMax: 70,
  laserAvoidMarginWarning: 40,
  laserAvoidMarginActive: 18,

  maxDtMs: 50,
};
