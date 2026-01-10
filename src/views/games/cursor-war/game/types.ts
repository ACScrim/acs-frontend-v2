export type Vec2 = { x: number; y: number };

export type PlayerId = 'me' | string;

export interface PlayerEntity {
  id: PlayerId;
  name: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  stunnedUntilMs: number;
  shootCooldownUntilMs: number;
  isBot: boolean;
  isAlive: boolean;

  // bots: mouvement plus naturel
  velX?: number;
  velY?: number;
  wanderAngle?: number;
}

export type PickupType = 'shot';

export interface PickupEntity {
  id: string;
  type: PickupType;
  x: number;
  y: number;
  radius: number;
  spawnedAtMs: number;
  ttlMs: number;
}

export interface ProjectileEntity {
  id: string;
  ownerId: PlayerId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  spawnedAtMs: number;
  ttlMs: number;
}

export type ZonePhase = 'warning' | 'active';

export interface DangerZoneEntity {
  id: string;
  x: number;
  y: number;
  radius: number;
  spawnedAtMs: number;
  ttlMs: number;
  warnMs: number;
}

export interface GameConfig {
  width: number;
  height: number;
  playerRadius: number;
  botRadius: number;
  maxBots: number;
  stunMs: number;
  shootCooldownMs: number;
  projectileSpeedPxPerSec: number;
  projectileRadius: number;
  projectileTtlMs: number;
  pickupRadius: number;
  pickupTtlMs: number;
  pickupSpawnEveryMs: number;
  zoneSpawnEveryMs: number;
  zoneRadius: number;
  zoneTtlMs: number;

  zoneRadiusMin: number;
  zoneRadiusMax: number;
  zoneTtlMsMin: number;
  zoneTtlMsMax: number;
  zoneWarnMsMin: number;
  zoneWarnMsMax: number;

  botMaxSpeedPxPerSec: number;
  botSeparationRadius: number;
  botSeparationStrength: number;
  botShootChancePerSec: number;

  // bots (mouvement naturel)
  botWanderStrength: number;
  botWanderJitter: number;
  botSteerStrength: number;

  // particules
  explosionParticles: number;
  explosionTtlMs: number;
  explosionSpeedMin: number;
  explosionSpeedMax: number;

  // difficulté (score => densité de pièges)
  zoneSpawnEveryMsMin: number;
  scoreToMaxDifficulty: number;

  // lasers
  laserSpawnEveryMs: number;
  laserSpawnEveryMsMin: number;
  laserWarnMsMin: number;
  laserWarnMsMax: number;
  laserTtlMsMin: number;
  laserTtlMsMax: number;
  laserWidthMin: number;
  laserWidthMax: number;
  laserAvoidMarginWarning: number;
  laserAvoidMarginActive: number;

  maxDtMs: number;
}

export interface LaserEntity {
  id: string;
  // centre
  x: number;
  y: number;
  // direction
  angleRad: number;
  // half-width (épaisseur/2)
  halfWidth: number;
  spawnedAtMs: number;
  ttlMs: number;
  warnMs: number;
}

export type GameStatus = 'idle' | 'running' | 'paused' | 'gameover';

export interface ExplosionParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  spawnedAtMs: number;
  ttlMs: number;
}

export interface GameState {
  status: GameStatus;
  startedAtMs: number | null;
  nowMs: number;
  score: number;
  bestScore: number;
  ammoShots: number;

  meTargetX: number;
  meTargetY: number;

  players: PlayerEntity[];
  projectiles: ProjectileEntity[];
  pickups: PickupEntity[];
  zones: DangerZoneEntity[];
  lasers: LaserEntity[];

  explosions: ExplosionParticle[];

  lastPickupSpawnAtMs: number;
  lastZoneSpawnAtMs: number;
  lastLaserSpawnAtMs: number;
}
