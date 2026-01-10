<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, reactive } from 'vue';
import { defaultConfig } from './game/config';
import { createInitialState, setMeTarget, startGame, tick, togglePause, tryShoot } from './game/engine';
import { render } from './game/render';

const BEST_SCORE_KEY = 'cursorWar.bestScore';

const containerEl = ref<HTMLDivElement | null>(null);
const canvasEl = ref<HTMLCanvasElement | null>(null);

const bestScore = Number.parseInt(localStorage.getItem(BEST_SCORE_KEY) ?? '0', 10) || 0;
const state = reactive(createInitialState(bestScore, defaultConfig));

const status = computed(() => state.status);
const score = computed(() => Math.floor(state.score));
const ammo = computed(() => state.ammoShots);

let rafId: number | null = null;
let lastFrameAt = 0;
let ctx: CanvasRenderingContext2D | null = null;

function resizeCanvas() {
  const canvas = canvasEl.value;
  if (!canvas) return;

  // Canvas en coordonnées "jeu" constantes, scaling via CSS
  canvas.width = defaultConfig.width;
  canvas.height = defaultConfig.height;
}

function loop(now: number) {
  if (!ctx) return;
  if (!lastFrameAt) lastFrameAt = now;
  const dt = now - lastFrameAt;
  lastFrameAt = now;

  tick(state, dt, defaultConfig);
  render(ctx, state, defaultConfig);

  if (state.status === 'gameover') {
    localStorage.setItem(BEST_SCORE_KEY, String(state.bestScore));
  }

  rafId = window.requestAnimationFrame(loop);
}

function toGameCoords(evt: PointerEvent) {
  const canvas = canvasEl.value;
  if (!canvas) return { x: state.meTargetX, y: state.meTargetY };

  const rect = canvas.getBoundingClientRect();
  const x = ((evt.clientX - rect.left) / rect.width) * defaultConfig.width;
  const y = ((evt.clientY - rect.top) / rect.height) * defaultConfig.height;
  return { x, y };
}

function onPointerMove(evt: PointerEvent) {
  if (state.status !== 'running') return;
  const p = toGameCoords(evt);
  setMeTarget(state, p.x, p.y);
}

function onPointerDown(evt: PointerEvent) {
  if (evt.button !== 0) return;
  if (state.status !== 'running') return;
  tryShoot(state, defaultConfig);
}

function onKeyDown(evt: KeyboardEvent) {
  if (evt.key === ' ' || evt.code === 'Space') {
    evt.preventDefault();
    if (state.status === 'idle' || state.status === 'gameover') {
      startGame(state);
      return;
    }
    togglePause(state);
  }

  if (evt.key.toLowerCase() === 'r') {
    if (state.status === 'running' || state.status === 'paused' || state.status === 'gameover') {
      startGame(state);
    }
  }

  if (evt.key.toLowerCase() === 'f') {
    // tir clavier
    tryShoot(state, defaultConfig);
  }
}

onMounted(() => {
  resizeCanvas();
  ctx = canvasEl.value?.getContext('2d') ?? null;

  window.addEventListener('keydown', onKeyDown);
  canvasEl.value?.addEventListener('pointermove', onPointerMove);
  canvasEl.value?.addEventListener('pointerdown', onPointerDown);

  // Par défaut, on démarre l’animation (même en idle) pour afficher l’écran
  rafId = window.requestAnimationFrame(loop);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
  canvasEl.value?.removeEventListener('pointermove', onPointerMove);
  canvasEl.value?.removeEventListener('pointerdown', onPointerDown);

  if (rafId) window.cancelAnimationFrame(rafId);
  rafId = null;
});
</script>

<template>
  <div ref="containerEl" class="w-full h-full relative flex items-center justify-center">
    <div class="absolute top-4 left-4 z-10 text-white text-sm space-y-1">
      <div class="font-semibold">Cursor War (MVP)</div>
      <div>Score: <span class="font-mono">{{ score }}</span> | Best: <span class="font-mono">{{ state.bestScore }}</span></div>
      <div>Shots: <span class="font-mono">{{ ammo }}</span> (ramasse les bonus verts)</div>
      <div class="opacity-80">Espace: pause\/start • R: restart • Clic/F: tirer</div>
    </div>

    <div v-if="status !== 'running'" class="absolute inset-0 z-20 flex items-center justify-center">
      <div class="bg-black/60 border border-white/10 rounded-xl px-6 py-5 text-white max-w-md w-[92%]">
        <div v-if="status === 'idle'" class="space-y-2">
          <div class="text-lg font-semibold">Prêt ?</div>
          <div class="text-sm opacity-90">Évite les zones rouges avec ton curseur. Ramasse les bonus verts pour tirer et stun les bots.</div>
          <div class="text-sm opacity-90">Appuie sur <span class="font-mono">Espace</span> pour commencer.</div>
        </div>
        <div v-else-if="status === 'paused'" class="space-y-2">
          <div class="text-lg font-semibold">Pause</div>
          <div class="text-sm opacity-90">Appuie sur <span class="font-mono">Espace</span> pour reprendre.</div>
        </div>
        <div v-else class="space-y-2">
          <div class="text-lg font-semibold">Game Over</div>
          <div class="text-sm opacity-90">Score: <span class="font-mono">{{ score }}</span></div>
          <div class="text-sm opacity-90">Appuie sur <span class="font-mono">R</span> pour rejouer.</div>
        </div>
      </div>
    </div>

    <canvas
      ref="canvasEl"
      class="max-w-[min(1100px,95vw)] max-h-[min(720px,75vh)] w-full h-auto rounded-xl border border-white/10 bg-slate-950 touch-none"
      :class="{ 'cursor-none': status === 'running' }"
    />
  </div>
</template>
