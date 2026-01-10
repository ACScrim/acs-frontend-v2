import { defaultConfig } from './config';
import { nextId } from './ids';
import { clamp, circleHit, dist2, lerpAngleRad, normalize, rand } from './math';
import type {
  DangerZoneEntity,
  ExplosionParticle,
  GameConfig,
  GameState,
  LaserEntity,
  PickupEntity,
  PlayerEntity,
  PlayerId,
} from './types';

export function createInitialState(bestScore: number, cfg: GameConfig = defaultConfig): GameState {
  const me: PlayerEntity = {
    id: 'me',
    name: 'Moi',
    x: cfg.width / 2,
    y: cfg.height / 2,
    radius: cfg.playerRadius,
    color: '#7dd3fc',
    stunnedUntilMs: 0,
    shootCooldownUntilMs: 0,
    isBot: false,
    isAlive: true,
  };

  const bots: PlayerEntity[] = Array.from({ length: cfg.maxBots }).map((_, i) => ({
    id: `bot_${i + 1}`,
    name: `Bot ${i + 1}`,
    x: rand(40, cfg.width - 40),
    y: rand(40, cfg.height - 40),
    radius: cfg.botRadius,
    color: '#fda4af',
    stunnedUntilMs: 0,
    shootCooldownUntilMs: 0,
    isBot: true,
    isAlive: true,
  }));

  return {
    status: 'idle',
    startedAtMs: null,
    nowMs: 0,
    score: 0,
    bestScore,
    ammoShots: 0,
    meTargetX: me.x,
    meTargetY: me.y,
    players: [me, ...bots],
    projectiles: [],
    pickups: [],
    zones: [],
    lasers: [],
    explosions: [],
    lastPickupSpawnAtMs: 0,
    lastZoneSpawnAtMs: 0,
    lastLaserSpawnAtMs: 0,
  };
}

export function startGame(state: GameState) {
  state.status = 'running';
  state.startedAtMs = performance.now();
  state.nowMs = state.startedAtMs;
  state.score = 0;
  state.ammoShots = 0;
  state.projectiles = [];
  state.pickups = [];
  state.zones = [];
  state.lasers = [];
  state.explosions = [];
  state.lastPickupSpawnAtMs = state.startedAtMs;
  state.lastZoneSpawnAtMs = state.startedAtMs;
  state.lastLaserSpawnAtMs = state.startedAtMs;

  const me = getPlayer(state, 'me');
  me.x = defaultConfig.width / 2;
  me.y = defaultConfig.height / 2;
  state.meTargetX = me.x;
  state.meTargetY = me.y;

  for (const p of state.players) {
    p.stunnedUntilMs = 0;
    p.shootCooldownUntilMs = 0;
    p.isAlive = true;
    if (p.isBot) {
      p.x = rand(40, defaultConfig.width - 40);
      p.y = rand(40, defaultConfig.height - 40);
      p.velX = 0;
      p.velY = 0;
      p.wanderAngle = rand(-Math.PI, Math.PI);
    }
  }
}

export function togglePause(state: GameState) {
  if (state.status === 'running') state.status = 'paused';
  else if (state.status === 'paused') state.status = 'running';
}

export function setMeTarget(state: GameState, x: number, y: number) {
  const me = getPlayer(state, 'me');
  // Si le joueur est stun, on ne bouge pas la cible (évite l’énorme saut quand le stun se termine)
  if (state.nowMs < me.stunnedUntilMs) return;

  state.meTargetX = x;
  state.meTargetY = y;
}

export function tryShoot(state: GameState, cfg: GameConfig = defaultConfig) {
  if (state.status !== 'running') return;

  const now = state.nowMs;
  const me = getPlayer(state, 'me');
  if (now < me.stunnedUntilMs) return;
  if (state.ammoShots <= 0) return;
  if (now < me.shootCooldownUntilMs) return;

  const dir = normalize(state.meTargetX - me.x, state.meTargetY - me.y);
  if (dir.x === 0 && dir.y === 0) return;

  spawnProjectile(state, me.id, dir.x, dir.y, cfg);
  state.ammoShots -= 1;
  me.shootCooldownUntilMs = now + cfg.shootCooldownMs;
}

export function tick(state: GameState, dtMsRaw: number, cfg: GameConfig = defaultConfig) {
  if (state.status !== 'running') return;

  const dtMs = Math.min(dtMsRaw, cfg.maxDtMs);
  state.nowMs += dtMs;
  state.score += dtMs / 1000;

  // Si joueur stun, on “recale” la cible sur sa position pour éviter toute téléportation
  const me = getPlayer(state, 'me');
  if (state.nowMs < me.stunnedUntilMs) {
    state.meTargetX = me.x;
    state.meTargetY = me.y;
  }

  stepMe(state, dtMs);
  stepBots(state, dtMs, cfg);
  stepSpawns(state, cfg);
  stepProjectiles(state, dtMs, cfg);
  stepExplosions(state, dtMs);
  cleanupExpired(state);
  resolveCollisions(state, cfg);
}

function stepMe(state: GameState, dtMs: number) {
  const me = getPlayer(state, 'me');
  if (state.nowMs < me.stunnedUntilMs) return;

  // Déplacement doux vers la cible (le curseur)
  const t = 1 - Math.pow(0.001, dtMs / 16.666);
  me.x = me.x + (state.meTargetX - me.x) * t;
  me.y = me.y + (state.meTargetY - me.y) * t;

  me.x = clamp(me.x, 0, defaultConfig.width);
  me.y = clamp(me.y, 0, defaultConfig.height);
}

function stepBots(state: GameState, dtMs: number, cfg: GameConfig) {
  const now = state.nowMs;
  const me = getPlayer(state, 'me');
  const t = dtMs / 1000;

  for (const bot of state.players) {
    if (!bot.isBot) continue;
    if (!bot.isAlive) continue;
    if (now < bot.stunnedUntilMs) continue;

    bot.velX ??= 0;
    bot.velY ??= 0;
    bot.wanderAngle ??= rand(-Math.PI, Math.PI);

    // Séparation
    let sepX = 0;
    let sepY = 0;
    for (const other of state.players) {
      if (other === bot) continue;
      if (!other.isBot || !other.isAlive) continue;

      const d = dist2(bot.x, bot.y, other.x, other.y);
      if (d > 0 && d < cfg.botSeparationRadius) {
        const push = normalize(bot.x - other.x, bot.y - other.y);
        const strength = (cfg.botSeparationRadius - d) / cfg.botSeparationRadius;
        sepX += push.x * strength;
        sepY += push.y * strength;
      }
    }

    // Objectif principal
    const nearest = findNearestPickup(state, bot.x, bot.y);

    // 1) si bot est dans une zone warning => fuite immédiate (avant activation)
    const fleeWarning = fleeFromWarningZones(state, bot.x, bot.y, now);

    // 2) sinon, aller vers un pickup si présent, sinon orbiter autour du joueur
    let desiredX = 0;
    let desiredY = 0;

    if (fleeWarning.x !== 0 || fleeWarning.y !== 0) {
      desiredX = fleeWarning.x;
      desiredY = fleeWarning.y;
    } else if (nearest) {
      const to = normalize(nearest.x - bot.x, nearest.y - bot.y);
      desiredX = to.x;
      desiredY = to.y;
    } else {
      const idHash = hash01(bot.id);
      const orbitAngle = idHash * Math.PI * 2;
      const orbitX = Math.cos(orbitAngle);
      const orbitY = Math.sin(orbitAngle);

      const away = normalize(bot.x - me.x, bot.y - me.y);
      const toward = normalize(me.x - bot.x, me.y - bot.y);
      const dist = dist2(bot.x, bot.y, me.x, me.y);

      const desired = dist < 120 ? away : toward;
      desiredX = desired.x * 0.85 + orbitX * 0.45;
      desiredY = desired.y * 0.85 + orbitY * 0.45;
    }

    // évitement "soft" des zones (warning + active) quand on n’est pas en fuite dédiée
    const avoid = avoidZones(state, bot.x, bot.y, cfg, now);

    // évitement des lasers (warning + actifs)
    const avoidLaser = avoidLasers(state, bot.x, bot.y, cfg, now);

    // wander: fait varier doucement la direction dans le temps
    bot.wanderAngle = lerpAngleRad(bot.wanderAngle, bot.wanderAngle + rand(-1, 1) * cfg.botWanderJitter * t, 0.35);
    const wanderX = Math.cos(bot.wanderAngle) * cfg.botWanderStrength;
    const wanderY = Math.sin(bot.wanderAngle) * cfg.botWanderStrength;

    const targetDir = normalize(
      desiredX + avoid.x + avoidLaser.x + sepX * cfg.botSeparationStrength + wanderX,
      desiredY + avoid.y + avoidLaser.y + sepY * cfg.botSeparationStrength + wanderY,
    );

    // steering: on ajuste la vélocité vers une vitesse cible
    const speed = cfg.botMaxSpeedPxPerSec * (0.85 + 0.3 * hash01(bot.id + '_s'));
    const targetVelX = targetDir.x * speed;
    const targetVelY = targetDir.y * speed;

    const steer = clamp(cfg.botSteerStrength * t, 0, 1);
    bot.velX = bot.velX + (targetVelX - bot.velX) * steer;
    bot.velY = bot.velY + (targetVelY - bot.velY) * steer;

    bot.x += bot.velX * t;
    bot.y += bot.velY * t;

    bot.x = clamp(bot.x, 0, cfg.width);
    bot.y = clamp(bot.y, 0, cfg.height);

    // Tir bot: chance par seconde, cible: joueur
    if (now >= bot.shootCooldownUntilMs && Math.random() < cfg.botShootChancePerSec * t) {
      const dir = normalize(me.x - bot.x, me.y - bot.y);
      if (dir.x !== 0 || dir.y !== 0) {
        spawnProjectile(state, bot.id, dir.x, dir.y, cfg);
        bot.shootCooldownUntilMs = now + cfg.shootCooldownMs * (0.9 + 0.4 * hash01(bot.id + '_cd'));
      }
    }
  }
}

function stepSpawns(state: GameState, cfg: GameConfig) {
  const now = state.nowMs;
  const difficulty = computeDifficulty01(state, cfg);

  const zoneEvery = lerp(cfg.zoneSpawnEveryMs, cfg.zoneSpawnEveryMsMin, difficulty);
  const laserEvery = lerp(cfg.laserSpawnEveryMs, cfg.laserSpawnEveryMsMin, difficulty);

  if (now - state.lastPickupSpawnAtMs >= cfg.pickupSpawnEveryMs) {
    state.lastPickupSpawnAtMs = now;
    state.pickups.push(spawnPickup(now, cfg));
  }

  if (now - state.lastZoneSpawnAtMs >= zoneEvery) {
    state.lastZoneSpawnAtMs = now;
    state.zones.push(spawnZone(now, cfg));
  }

  if (now - state.lastLaserSpawnAtMs >= laserEvery) {
    state.lastLaserSpawnAtMs = now;
    state.lasers.push(spawnLaser(now, cfg));
  }
}

function spawnPickup(now: number, cfg: GameConfig): PickupEntity {
  return {
    id: nextId('pickup'),
    type: 'shot',
    x: rand(30, cfg.width - 30),
    y: rand(30, cfg.height - 30),
    radius: cfg.pickupRadius,
    spawnedAtMs: now,
    ttlMs: cfg.pickupTtlMs,
  };
}

function spawnZone(now: number, cfg: GameConfig): DangerZoneEntity {
  const radius = rand(cfg.zoneRadiusMin, cfg.zoneRadiusMax);
  const ttl = rand(cfg.zoneTtlMsMin, cfg.zoneTtlMsMax);
  const warnMs = rand(cfg.zoneWarnMsMin, cfg.zoneWarnMsMax);
  return {
    id: nextId('zone'),
    x: rand(radius + 5, cfg.width - radius - 5),
    y: rand(radius + 5, cfg.height - radius - 5),
    radius,
    spawnedAtMs: now,
    ttlMs: ttl,
    warnMs,
  };
}

function spawnLaser(now: number, cfg: GameConfig): LaserEntity {
  return {
    id: nextId('laser'),
    x: rand(0, cfg.width),
    y: rand(0, cfg.height),
    angleRad: rand(0, Math.PI * 2),
    halfWidth: rand(cfg.laserWidthMin, cfg.laserWidthMax) / 2,
    spawnedAtMs: now,
    ttlMs: rand(cfg.laserTtlMsMin, cfg.laserTtlMsMax),
    warnMs: rand(cfg.laserWarnMsMin, cfg.laserWarnMsMax),
  };
}

function stepProjectiles(state: GameState, dtMs: number, cfg: GameConfig) {
  const t = dtMs / 1000;
  for (const p of state.projectiles) {
    p.x += p.vx * t;
    p.y += p.vy * t;

    // Bounce sur les bords
    if (p.x < 0 || p.x > cfg.width) p.vx *= -1;
    if (p.y < 0 || p.y > cfg.height) p.vy *= -1;

    p.x = clamp(p.x, 0, cfg.width);
    p.y = clamp(p.y, 0, cfg.height);
  }
}

function cleanupExpired(state: GameState) {
  const now = state.nowMs;
  state.pickups = state.pickups.filter((p) => now - p.spawnedAtMs <= p.ttlMs);
  state.zones = state.zones.filter((z) => now - z.spawnedAtMs <= z.ttlMs);
  state.projectiles = state.projectiles.filter((p) => now - p.spawnedAtMs <= p.ttlMs);
  state.explosions = state.explosions.filter((e) => now - e.spawnedAtMs <= e.ttlMs);
  state.lasers = state.lasers.filter((l) => now - l.spawnedAtMs <= l.ttlMs);
}

function resolveCollisions(state: GameState, cfg: GameConfig) {
  const now = state.nowMs;
  const me = getPlayer(state, 'me');

  // Lasers actifs: joueur gameover
  for (const l of state.lasers) {
    const isActive = now - l.spawnedAtMs >= l.warnMs;
    if (!isActive) continue;

    if (circleHitsLaser(me.x, me.y, me.radius, l, cfg)) {
      state.status = 'gameover';
      state.bestScore = Math.max(state.bestScore, Math.floor(state.score));
      spawnExplosion(state, me.x, me.y, me.color, cfg);
      return;
    }
  }

  // Lasers actifs: bots éliminés
  for (const l of state.lasers) {
    const isActive = now - l.spawnedAtMs >= l.warnMs;
    if (!isActive) continue;

    for (const bot of state.players) {
      if (!bot.isBot) continue;
      if (!bot.isAlive) continue;
      if (circleHitsLaser(bot.x, bot.y, bot.radius, l, cfg)) {
        bot.isAlive = false;
        state.score += 3;
        spawnExplosion(state, bot.x, bot.y, bot.color, cfg);
      }
    }
  }

  // Zones actives: joueur gameover
  for (const z of state.zones) {
    const isActive = now - z.spawnedAtMs >= z.warnMs;
    if (!isActive) continue;

    if (circleHit(me.x, me.y, me.radius, z.x, z.y, z.radius)) {
      state.status = 'gameover';
      state.bestScore = Math.max(state.bestScore, Math.floor(state.score));
      spawnExplosion(state, me.x, me.y, me.color, cfg);
      return;
    }
  }

  // Zones actives: bots éliminés
  for (const z of state.zones) {
    const isActive = now - z.spawnedAtMs >= z.warnMs;
    if (!isActive) continue;

    for (const bot of state.players) {
      if (!bot.isBot) continue;
      if (!bot.isAlive) continue;
      if (circleHit(bot.x, bot.y, bot.radius, z.x, z.y, z.radius)) {
        bot.isAlive = false;
        state.score += 3;
        spawnExplosion(state, bot.x, bot.y, bot.color, cfg);
      }
    }
  }

  // Pickups: joueur et bots
  for (const pickup of [...state.pickups]) {
    if (circleHit(me.x, me.y, me.radius, pickup.x, pickup.y, pickup.radius)) {
      state.ammoShots += 1;
      state.pickups = state.pickups.filter((p) => p.id !== pickup.id);
      continue;
    }

    for (const bot of state.players) {
      if (!bot.isBot) continue;
      if (!bot.isAlive) continue;
      if (circleHit(bot.x, bot.y, bot.radius, pickup.x, pickup.y, pickup.radius)) {
        bot.shootCooldownUntilMs = Math.max(0, bot.shootCooldownUntilMs - cfg.shootCooldownMs * 0.4);
        state.pickups = state.pickups.filter((p) => p.id !== pickup.id);
        break;
      }
    }
  }

  // Projectiles: stun des cibles (si vivantes)
  for (const proj of [...state.projectiles]) {
    for (const target of state.players) {
      if (!target.isAlive) continue;
      if (target.id === proj.ownerId) continue;
      if (circleHit(proj.x, proj.y, proj.radius, target.x, target.y, target.radius)) {
        target.stunnedUntilMs = now + cfg.stunMs;
        state.projectiles = state.projectiles.filter((p) => p.id !== proj.id);
        if (proj.ownerId === 'me' && target.isBot) state.score += 2;
        break;
      }
    }
  }
}

function stepExplosions(state: GameState, dtMs: number) {
  const t = dtMs / 1000;
  for (const p of state.explosions) {
    p.x += p.vx * t;
    p.y += p.vy * t;
  }
}

function spawnExplosion(state: GameState, x: number, y: number, baseColor: string, cfg: GameConfig) {
  const now = state.nowMs;
  for (let i = 0; i < cfg.explosionParticles; i++) {
    const a = rand(0, Math.PI * 2);
    const sp = rand(cfg.explosionSpeedMin, cfg.explosionSpeedMax);
    const part: ExplosionParticle = {
      id: nextId('fx'),
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      radius: rand(1.5, 3.6),
      color: baseColor,
      spawnedAtMs: now,
      ttlMs: cfg.explosionTtlMs,
    };
    state.explosions.push(part);
  }
}

function fleeFromWarningZones(state: GameState, x: number, y: number, now: number) {
  let fx = 0;
  let fy = 0;
  for (const z of state.zones) {
    const age = now - z.spawnedAtMs;
    const isWarning = age >= 0 && age < z.warnMs;
    if (!isWarning) continue;

    if (circleHit(x, y, 1, z.x, z.y, z.radius)) {
      const away = normalize(x - z.x, y - z.y);
      // super fort pour sortir vite
      fx += away.x * 3.0;
      fy += away.y * 3.0;
    }
  }
  return { x: fx, y: fy };
}

function avoidZones(state: GameState, x: number, y: number, cfg: GameConfig, now: number) {
  let ax = 0;
  let ay = 0;
  for (const z of state.zones) {
    const age = now - z.spawnedAtMs;
    const isActive = age >= z.warnMs;

    // marge plus grande en warning pour anticiper
    const baseMargin = z.radius + cfg.botRadius + (isActive ? 10 : 35);
    const d = dist2(x, y, z.x, z.y);
    if (d < baseMargin && d > 0) {
      const away = normalize(x - z.x, y - z.y);
      const strength = (baseMargin - d) / baseMargin;
      const mult = isActive ? 2.2 : 1.8;
      ax += away.x * strength * mult;
      ay += away.y * strength * mult;
    }
  }
  return { x: ax, y: ay };
}

function avoidLasers(state: GameState, x: number, y: number, cfg: GameConfig, now: number) {
  let ax = 0;
  let ay = 0;

  for (const l of state.lasers) {
    const age = now - l.spawnedAtMs;
    const isActive = age >= l.warnMs;

    // distance point->droite
    const dx = x - l.x;
    const dy = y - l.y;
    const sin = Math.sin(l.angleRad);
    const cos = Math.cos(l.angleRad);

    const nx = -sin;
    const ny = cos;

    const signedDist = dx * nx + dy * ny;
    const dist = Math.abs(signedDist);

    const margin = l.halfWidth + cfg.botRadius + (isActive ? cfg.laserAvoidMarginActive : cfg.laserAvoidMarginWarning);

    if (dist < margin) {
      // pousser selon la normale du bon côté
      const side = signedDist >= 0 ? 1 : -1;
      const strength = (margin - dist) / margin;
      const mult = isActive ? 3.2 : 2.2;
      ax += nx * side * strength * mult;
      ay += ny * side * strength * mult;
    }
  }

  return { x: ax, y: ay };
}

function hash01(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // 0..1
  return (h >>> 0) / 4294967295;
}

function getPlayer(state: GameState, id: PlayerId) {
  const p = state.players.find((x) => x.id === id);
  if (!p) throw new Error(`Player not found: ${id}`);
  return p;
}

function spawnProjectile(state: GameState, ownerId: PlayerId, dirX: number, dirY: number, cfg: GameConfig) {
  const now = state.nowMs;
  const owner = getPlayer(state, ownerId);

  const speed = cfg.projectileSpeedPxPerSec;
  state.projectiles.push({
    id: nextId('proj'),
    ownerId,
    x: owner.x,
    y: owner.y,
    vx: dirX * speed,
    vy: dirY * speed,
    radius: cfg.projectileRadius,
    spawnedAtMs: now,
    ttlMs: cfg.projectileTtlMs,
  });
}

function findNearestPickup(state: GameState, x: number, y: number) {
  let best: PickupEntity | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const p of state.pickups) {
    const d = dist2(x, y, p.x, p.y);
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }
  return best;
}

function circleHitsLaser(x: number, y: number, radius: number, l: LaserEntity, cfg: GameConfig) {
  // Laser infini traversant l’arène : on calcule la distance point->droite (repère laser)
  const dx = x - l.x;
  const dy = y - l.y;
  const cos = Math.cos(l.angleRad);
  const sin = Math.sin(l.angleRad);

  // axe normal au laser
  const nx = -sin;
  const ny = cos;

  const dist = Math.abs(dx * nx + dy * ny);
  return dist <= l.halfWidth + radius;
}

function computeDifficulty01(state: GameState, cfg: GameConfig) {
  // score est en secondes (vu plus haut), donc on mappe sur scoreToMaxDifficulty
  return clamp(state.score / Math.max(1, cfg.scoreToMaxDifficulty), 0, 1);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

