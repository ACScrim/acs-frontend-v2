import { clamp } from './math';
import type { GameConfig, GameState, PlayerEntity } from './types';
import { defaultConfig } from './config';

export function render(ctx: CanvasRenderingContext2D, state: GameState, cfg: GameConfig = defaultConfig) {
  // background
  ctx.clearRect(0, 0, cfg.width, cfg.height);
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, cfg.width, cfg.height);

  // grid
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  const step = 50;
  for (let x = 0; x <= cfg.width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, cfg.height);
    ctx.stroke();
  }
  for (let y = 0; y <= cfg.height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(cfg.width, y);
    ctx.stroke();
  }
  ctx.restore();

  // zones
  for (const z of state.zones) {
    const age = state.nowMs - z.spawnedAtMs;
    const isActive = age >= z.warnMs;

    ctx.save();
    if (!isActive) {
      const t = clamp(age / Math.max(1, z.warnMs), 0, 1);
      ctx.globalAlpha = 0.15 + 0.35 * t;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      const t = clamp((age - z.warnMs) / Math.max(1, z.ttlMs - z.warnMs), 0, 1);
      ctx.globalAlpha = 0.28 * (1 - t) + 0.18;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // pickups
  for (const p of state.pickups) {
    ctx.save();
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#052e1a';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('1', p.x, p.y + 1);
    ctx.restore();
  }

  // projectiles
  for (const pr of state.projectiles) {
    ctx.save();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(pr.x, pr.y, pr.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // players
  for (const pl of state.players) {
    if (!pl.isAlive) continue;
    drawPlayer(ctx, state, pl);
  }

  // explosions (derrière les joueurs)
  for (const e of state.explosions) {
    const age = state.nowMs - e.spawnedAtMs;
    const t = clamp(age / Math.max(1, e.ttlMs), 0, 1);
    ctx.save();
    ctx.globalAlpha = 0.9 * (1 - t);
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius * (1 - t * 0.2), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // crosshair
  if (state.status === 'running') {
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    const s = 7;
    ctx.beginPath();
    ctx.moveTo(state.meTargetX - s, state.meTargetY);
    ctx.lineTo(state.meTargetX + s, state.meTargetY);
    ctx.moveTo(state.meTargetX, state.meTargetY - s);
    ctx.lineTo(state.meTargetX, state.meTargetY + s);
    ctx.stroke();
    ctx.restore();
  }

  // lasers
  for (const l of state.lasers ?? []) {
    const age = state.nowMs - l.spawnedAtMs;
    const isActive = age >= l.warnMs;

    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.rotate(l.angleRad);

    // Un rectangle très long pour couvrir l'arène
    const len = Math.hypot(cfg.width, cfg.height) * 1.6;
    const w = l.halfWidth * 2;

    if (!isActive) {
      const t = clamp(age / Math.max(1, l.warnMs), 0, 1);
      ctx.globalAlpha = 0.15 + 0.35 * t;
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 8]);
      ctx.strokeRect(-len / 2, -w / 2, len, w);
    } else {
      const t = clamp((age - l.warnMs) / Math.max(1, l.ttlMs - l.warnMs), 0, 1);
      ctx.globalAlpha = 0.30 * (1 - t) + 0.18;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-len / 2, -w / 2, len, w);
    }

    ctx.restore();
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, state: GameState, pl: PlayerEntity) {
  const stunned = state.nowMs < pl.stunnedUntilMs;

  ctx.save();
  ctx.fillStyle = pl.color;
  ctx.beginPath();
  ctx.arc(pl.x, pl.y, pl.radius, 0, Math.PI * 2);
  ctx.fill();

  if (stunned) {
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(pl.x, pl.y, pl.radius + 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '12px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(pl.name, pl.x, pl.y + pl.radius + 6);
  ctx.restore();
}
