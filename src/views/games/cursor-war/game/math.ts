import type { Vec2 } from './types';

export function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function len2(x: number, y: number) {
  return Math.sqrt(x * x + y * y);
}

export function normalize(x: number, y: number): Vec2 {
  const l = len2(x, y);
  if (l <= 1e-6) return { x: 0, y: 0 };
  return { x: x / l, y: y / l };
}

export function dist2(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

export function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function randInt(min: number, maxInclusive: number) {
  return Math.floor(rand(min, maxInclusive + 1));
}

export function circleHit(ax: number, ay: number, ar: number, bx: number, by: number, br: number) {
  return dist2(ax, ay, bx, by) <= ar + br;
}

export function wrapAngleRad(a: number) {
  const pi2 = Math.PI * 2;
  a = a % pi2;
  if (a < -Math.PI) a += pi2;
  if (a > Math.PI) a -= pi2;
  return a;
}

export function lerpAngleRad(a: number, b: number, t: number) {
  const d = wrapAngleRad(b - a);
  return a + d * t;
}
