<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useTransition, TransitionPresets } from '@vueuse/core';
import CollectibleCard from "@/views/games/card-creator/CollectibleCard.vue";
import type { CollectibleCard as Card} from "@/types/models";

interface Props {
  isOpen: boolean;
  cards?: Card[];
}

interface Particle {
  id: number;
  x: number;
  size: number;
  delay: number;
  hueShift: number;
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  cards: () => []
});

const emit = defineEmits(['close']);
const modalRef = ref<HTMLDivElement | null>(null);

const boosterState = ref<'closed' | 'pulling' | 'opened'>('closed');
const pullingProgress = ref(0);
const pullStartY = ref(0);
const pullStartX = ref(0);
const isPointerDown = ref(false);
const tearThreshold = 0.72;

const tiltInput = ref(0);
const wobbleInput = ref(0);
const tiltSpring = useTransition(tiltInput, {
  duration: 220,
  transition: TransitionPresets.easeOutBack,
});
const wobbleSpring = useTransition(wobbleInput, {
  duration: 240,
  transition: TransitionPresets.easeOutBack,
});
const tearSpring = useTransition(pullingProgress, {
  duration: 260,
  transition: TransitionPresets.easeOutExpo,
});
const tiltMotion = computed(() => tiltSpring.value);
const wobbleMotion = computed(() => wobbleSpring.value);
const tearMotion = computed(() => tearSpring.value);

const cinematicFlash = ref(false);
const shimmerProgress = ref(0);
const particles = ref<Particle[]>([]);
let shimmerRaf: number | null = null;

const glowColorMap = {
  common: 'rgba(200, 200, 200, 0.65)',
  uncommon: 'rgba(76, 175, 80, 0.75)',
  rare: 'rgba(86, 178, 255, 0.8)',
  epic: 'rgba(197, 128, 255, 0.9)',
  legendary: 'rgba(255, 215, 0, 0.95)',
};

const maxRarity = computed(() => {
  const order = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const rarityIndexes = props.cards.map((card) => order.indexOf(card.rarity ?? 'common'));
  return order[Math.max(...rarityIndexes)] as keyof typeof glowColorMap;
});

const glowColor = computed(() => glowColorMap[maxRarity.value]);

const tiltGuidance = computed(() => {
  if (pullingProgress.value >= tearThreshold) return 'Lâche pour ouvrir !';
  if (pullingProgress.value > 0.45) return 'Encore un peu…';
  if (pullingProgress.value > 0.2) return 'Continue vers la gauche';
  return 'Tire vers la gauche pour ouvrir';
});

const accessibilityStatus = computed(() => {
  if (!props.isOpen) return 'Booster fermé';
  if (boosterState.value === 'pulling') return 'Ouverture en cours';
  if (boosterState.value === 'opened') return 'Booster ouvert, cartes révélées';
  return 'Booster prêt à être ouvert';
});

const rarityTiltMap: Record<string, number> = {
  common: 2,
  uncommon: 4,
  rare: 6,
  epic: 8,
  legendary: 10,
};

const spawnParticles = () => {
  particles.value = Array.from({ length: 18 }, (_, index) => ({
    id: Date.now() + index,
    x: Math.random() * 100,
    size: 6 + Math.random() * 10,
    delay: index * 35,
    hueShift: (index * 20) % 360,
  }));
};

const resetPointerState = () => {
  isPointerDown.value = false;
  tiltInput.value = 0;
  wobbleInput.value = 0;
};

const completePullIfNeeded = () => {
  if (pullingProgress.value >= tearThreshold) {
    startOpeningAnimation();
  } else {
    pullingProgress.value = 0;
  }
};

const updateDrag = (clientY: number, clientX?: number) => {
  if (!isPointerDown.value || boosterState.value !== 'closed') return;

  // Déplacement vers la gauche = positif (comme arracher un booster)
  const resolvedX = clientX ?? pullStartX.value;
  const deltaX = pullStartX.value - resolvedX;
  pullingProgress.value = Math.max(0, Math.min(1, deltaX / 150));

  // Wobble basé sur le mouvement vertical
  const deltaY = clientY - pullStartY.value;
  tiltInput.value = Math.max(-1, Math.min(1, deltaY / 100));
  wobbleInput.value = Math.max(-1, Math.min(1, deltaX / 80));
};

const handlePointerRelease = () => {
  if (!isPointerDown.value) return;
  resetPointerState();
  completePullIfNeeded();
};

const handleMouseDown = (event: MouseEvent) => {
  if (boosterState.value !== 'closed') return;
  event.preventDefault();
  isPointerDown.value = true;
  pullStartY.value = event.clientY;
  pullStartX.value = event.clientX;
};

const handleMouseMove = (event: MouseEvent) => updateDrag(event.clientY, event.clientX);
const handleMouseUp = () => handlePointerRelease();

const handleTouchStart = (event: TouchEvent) => {
  if (boosterState.value !== 'closed') return;
  const touch = event.touches[0];
  if (!touch) return;
  isPointerDown.value = true;
  pullStartY.value = touch.clientY;
  pullStartX.value = touch.clientX;
};

const handleTouchMove = (event: TouchEvent) => {
  if (!isPointerDown.value) return;
  const touch = event.touches[0];
  if (!touch) return;
  updateDrag(touch.clientY, touch.clientX);
};

const handleTouchEnd = () => handlePointerRelease();

const handleKeyboardShortcut = (event: KeyboardEvent) => {
  if (!props.isOpen) return;
  if (['Space', 'Enter'].includes(event.code)) {
    event.preventDefault();
    if (boosterState.value === 'closed') {
      pullingProgress.value = 1;
      startOpeningAnimation(true);
    } else if (boosterState.value === 'opened') {
      handleClose();
    }
  }
  if (event.code === 'Escape') {
    event.preventDefault();
    handleClose();
  }
};

const startOpeningAnimation = (instant = false) => {
  boosterState.value = 'pulling';
  cinematicFlash.value = true;
  spawnParticles();

  if (instant) {
    boosterState.value = 'opened';
    return;
  }

  setTimeout(() => {
    boosterState.value = 'opened';
  }, 480);
};

const handleClose = () => {
  boosterState.value = 'closed';
  pullingProgress.value = 0;
  cinematicFlash.value = false;
  particles.value = [];
  resetPointerState();
  emit('close');
};

watch(() => props.isOpen, async (opened) => {
  if (opened) {
    boosterState.value = 'closed';
    pullingProgress.value = 0;
    await nextTick();
    modalRef.value?.focus();
  } else {
    particles.value = [];
    cinematicFlash.value = false;
  }
});

watch(boosterState, (state) => {
  if (state === 'opened') {
    setTimeout(() => {
      cinematicFlash.value = false;
    }, 900);
  }
});

const shimmerLoop = () => {
  shimmerProgress.value = (shimmerProgress.value + 0.0075) % 1;
  shimmerRaf = requestAnimationFrame(shimmerLoop);
};

onMounted(() => {
  shimmerRaf = requestAnimationFrame(shimmerLoop);
  window.addEventListener('mouseup', handlePointerRelease);
  window.addEventListener('touchend', handlePointerRelease);
});

onBeforeUnmount(() => {
  if (shimmerRaf) cancelAnimationFrame(shimmerRaf);
  window.removeEventListener('mouseup', handlePointerRelease);
  window.removeEventListener('touchend', handlePointerRelease);
});
</script>

<template>
  <Teleport to="body" v-if="isOpen">
    <div
      ref="modalRef"
      tabindex="0"
      role="dialog"
      aria-modal="true"
      aria-label="Ouverture du booster"
      @keydown="handleKeyboardShortcut"
      class="fixed inset-0 bg-black/65 backdrop-blur-md z-50 flex items-center justify-center p-4"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    >
      <p class="sr-only" aria-live="polite">{{ accessibilityStatus }}</p>

      <div class="relative max-w-4xl w-full">
        <div
          v-if="cinematicFlash"
          class="flash-overlay"
          :style="{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 65%)` }"
        />

        <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
          <span
            v-for="particle in particles"
            :key="particle.id"
            class="particle"
            :style="{
              left: `${particle.x}%`,
              animationDelay: `${particle.delay}ms`,
              background: `hsl(${particle.hueShift}, 90%, 65%)`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }"
          />
        </div>

        <!-- État fermé -->
        <div v-if="boosterState === 'closed'" class="flex flex-col items-center gap-8">
          <div class="text-center">
            <h2 class="text-3xl font-bold text-foam-50 mb-2">Ouvre ton booster!</h2>
            <p class="text-foam-200">Attrape le haut du paquet et tire vers la gauche pour l'arracher.</p>
          </div>

          <div
            class="relative cursor-grab active:cursor-grabbing group"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @touchstart.prevent="handleTouchStart"
            @touchmove.prevent="handleTouchMove"
            @touchend.prevent="handleTouchEnd"
          >
            <div
              class="absolute inset-0 rounded-[32px] blur-3xl opacity-80 transition-all duration-200"
              :style="{
                background: `radial-gradient(circle, ${glowColor} ${tearMotion * 60}%, transparent 70%)`,
                filter: `blur(${14 + tearMotion * 10}px)`
              }"
            />

            <svg
              class="booster-svg"
              viewBox="0 0 180 260"
              role="img"
              aria-label="Booster ACS Premium"
              :style="{
                transform: `perspective(800px) rotateY(${tiltMotion * 5}deg) rotateX(${wobbleMotion * 2}deg)`,
                filter: `drop-shadow(0 20px 40px rgba(123, 109, 255, ${0.35 + tearMotion * 0.25}))`
              }"
            >
              <defs>
                <!-- Gradient de fond du paquet -->
                <linearGradient id="packBg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#2a1f4e" />
                  <stop offset="30%" stop-color="#1a1035" />
                  <stop offset="70%" stop-color="#251845" />
                  <stop offset="100%" stop-color="#1a1035" />
                </linearGradient>

                <!-- Gradient holographique pour la bordure -->
                <linearGradient id="holoBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#7b6dff" />
                  <stop offset="33%" stop-color="#ff5f8f" />
                  <stop offset="66%" stop-color="#14dcb4" />
                  <stop offset="100%" stop-color="#a48cff" />
                </linearGradient>

                <!-- Effet shimmer -->
                <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop :offset="`${Math.max(0, shimmerProgress * 100 - 30)}%`" stop-color="rgba(255,255,255,0)" />
                  <stop :offset="`${shimmerProgress * 100}%`" stop-color="rgba(255,255,255,0.25)" />
                  <stop :offset="`${Math.min(100, shimmerProgress * 100 + 30)}%`" stop-color="rgba(255,255,255,0)" />
                </linearGradient>

                <!-- Gradient pour le scellé du haut -->
                <linearGradient id="sealGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#9080cc" />
                  <stop offset="50%" stop-color="#7b6dff" />
                  <stop offset="100%" stop-color="#5a4ac8" />
                </linearGradient>

                <!-- Gradient pour la partie arrachée -->
                <linearGradient id="tornGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stop-color="#14dcb4" />
                  <stop offset="100%" stop-color="#7b6dff" />
                </linearGradient>

                <!-- Clip du paquet -->
                <clipPath id="packClip">
                  <rect x="5" y="5" width="170" height="250" rx="8" />
                </clipPath>

                <!-- Filtre ombre -->
                <filter id="shadow">
                  <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.5)" />
                </filter>
              </defs>

              <!-- === CORPS DU PAQUET === -->
              <g filter="url(#shadow)">
                <!-- Fond principal -->
                <rect x="5" y="5" width="170" height="250" rx="8" fill="url(#packBg)" />

                <!-- Bordure holographique -->
                <rect x="5" y="5" width="170" height="250" rx="8" fill="none" stroke="url(#holoBorder)" stroke-width="2.5" />
              </g>

              <!-- === CONTENU DU PAQUET === -->
              <g clip-path="url(#packClip)">

                <!-- Effets de fond dynamiques -->
                <g opacity="0.12">
                  <circle cx="90" cy="130" r="100" fill="none" stroke="#7b6dff" stroke-width="0.5" />
                  <circle cx="90" cy="130" r="80" fill="none" stroke="#ff5f8f" stroke-width="0.5" />
                  <circle cx="90" cy="130" r="60" fill="none" stroke="#14dcb4" stroke-width="0.5" />
                </g>

                <!-- Rayons de lumière -->
                <g opacity="0.08">
                  <line x1="90" y1="0" x2="90" y2="260" stroke="#fff" stroke-width="1" />
                  <line x1="0" y1="130" x2="180" y2="130" stroke="#fff" stroke-width="0.5" />
                  <line x1="20" y1="40" x2="160" y2="220" stroke="#14dcb4" stroke-width="0.5" />
                  <line x1="160" y1="40" x2="20" y2="220" stroke="#ff5f8f" stroke-width="0.5" />
                </g>

                <!-- Logo ACS -->
                <g transform="translate(90, 50)">
                  <text y="0" text-anchor="middle" class="logo-main">ACS</text>
                  <text y="16" text-anchor="middle" class="logo-sub">COLLECTION</text>
                </g>

                <!-- Illustration centrale - Silhouette de carte -->
                <g transform="translate(90, 135)">
                  <!-- Halo -->
                  <circle r="48" fill="rgba(123, 109, 255, 0.1)" />
                  <circle r="40" fill="rgba(20, 220, 180, 0.08)" />

                  <!-- Carte stylisée -->
                  <g transform="translate(0, -5)">
                    <rect x="-25" y="-38" width="50" height="72" rx="5"
                          fill="rgba(26, 16, 53, 0.9)"
                          stroke="rgba(20, 220, 180, 0.6)"
                          stroke-width="1.5" />
                    <rect x="-20" y="-33" width="40" height="50" rx="3"
                          fill="rgba(123, 109, 255, 0.15)" />
                    <text y="28" text-anchor="middle" class="card-question">?</text>
                  </g>
                </g>

                <!-- Badge édition -->
                <g transform="translate(90, 205)">
                  <rect x="-50" y="-12" width="100" height="24" rx="12"
                        fill="rgba(0,0,0,0.6)"
                        stroke="#14dcb4"
                        stroke-width="1" />
                  <text y="4" text-anchor="middle" class="edition-text">PREMIUM</text>
                </g>

                <!-- Info bas -->
                <text x="90" y="240" text-anchor="middle" class="info-text">5 CARTES · 1 RARE GARANTIE</text>

                <!-- Étoiles déco -->
                <text x="18" y="25" class="star">✦</text>
                <text x="162" y="25" text-anchor="end" class="star">✦</text>

                <!-- Effet shimmer qui traverse -->
                <rect x="5" y="5" width="170" height="250" fill="url(#shimmer)" />
              </g>

              <!-- === ZONE SCELLÉE DU HAUT (qui s'arrache) === -->
              <g class="seal-zone">
                <!-- Partie fixe (reste sur le paquet) - dentelure -->
                <g :style="{ opacity: tearMotion > 0.1 ? 1 : 0 }">
                  <path
                    d="M 5 22 L 12 18 L 20 22 L 28 18 L 36 22 L 44 18 L 52 22 L 60 18 L 68 22 L 76 18 L 84 22 L 92 18 L 100 22 L 108 18 L 116 22 L 124 18 L 132 22 L 140 18 L 148 22 L 156 18 L 164 22 L 172 18 L 175 22"
                    fill="none"
                    stroke="#7b6dff"
                    stroke-width="1"
                    :opacity="tearMotion"
                  />
                </g>

                <!-- Partie qui s'arrache -->
                <g
                  class="tear-part"
                  :style="{
                    transform: `translateX(${-tearMotion * 60}px) translateY(${-tearMotion * 15}px) rotate(${-tearMotion * 12}deg)`,
                    transformOrigin: '0% 100%',
                    opacity: 1 - tearMotion * 0.4
                  }"
                >
                  <!-- Fond du scellé -->
                  <rect x="5" y="5" width="170" height="18" rx="8" ry="8" fill="url(#sealGrad)" />

                  <!-- Ligne de soudure -->
                  <line x1="15" y1="14" x2="165" y2="14" stroke="rgba(255,255,255,0.25)" stroke-width="0.5" stroke-dasharray="3 2" />

                  <!-- Dentelure du bas -->
                  <path
                    d="M 5 23 L 12 20 L 20 23 L 28 20 L 36 23 L 44 20 L 52 23 L 60 20 L 68 23 L 76 20 L 84 23 L 92 20 L 100 23 L 108 20 L 116 23 L 124 20 L 132 23 L 140 20 L 148 23 L 156 20 L 164 23 L 172 20 L 175 23 L 175 5 L 5 5 Z"
                    fill="url(#sealGrad)"
                  />

                  <!-- Texte scellé -->
                  <text x="90" y="16" text-anchor="middle" class="seal-text">━━━ SEALED ━━━</text>
                </g>
              </g>

              <!-- === EFFET DE LUMIÈRE QUI S'ÉCHAPPE === -->
              <g v-if="tearMotion > 0.15" class="light-escape">
                <!-- Lueur principale -->
                <rect
                  x="5"
                  :y="20 - tearMotion * 8"
                  width="170"
                  :height="tearMotion * 20"
                  :fill="`rgba(20, 220, 180, ${tearMotion * 0.5})`"
                />

                <!-- Particules -->
                <g :opacity="tearMotion">
                  <circle
                    v-for="i in 6"
                    :key="'p' + i"
                    :cx="25 + (i - 1) * 28"
                    :cy="18 - tearMotion * (20 + i * 3)"
                    :r="2 + tearMotion * 2"
                    :fill="i % 2 === 0 ? '#14dcb4' : '#ff5f8f'"
                  />
                </g>

                <!-- Rayons qui sortent -->
                <g :opacity="tearMotion * 0.6">
                  <line
                    v-for="i in 5"
                    :key="'ray' + i"
                    :x1="36 * i"
                    :y1="20"
                    :x2="36 * i + (i % 2 === 0 ? -10 : 10)"
                    :y2="20 - tearMotion * 30"
                    stroke="#14dcb4"
                    stroke-width="1"
                  />
                </g>
              </g>

            </svg>
          </div>

          <div class="w-40 flex flex-col items-center gap-3">
            <div class="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-amber-300 via-rose-400 to-purple-500 transition-all duration-100"
                :style="{ width: `${tearMotion * 100}%` }"
              />
            </div>
            <div class="flex flex-col items-center text-xs text-foam-200 gap-1">
              <span>{{ Math.round(tearMotion * 100) }}%</span>
              <span class="inline-flex items-center gap-2 text-foam-100">
                <span class="inline-block h-[3px] w-12 rounded-full bg-gradient-to-r from-white/10 to-white/60" />
                {{ tiltGuidance }}
              </span>
            </div>
          </div>

          <p class="text-foam-300 text-sm text-center">
            💡 Glisse vers la gauche pour déchirer le haut du paquet, comme un vrai booster !
          </p>
        </div>

        <!-- État en train de s'ouvrir -->
        <div v-else-if="boosterState === 'pulling'" class="flex flex-col items-center justify-center gap-6 py-24">
          <div class="relative">
            <div class="w-40 h-40 rounded-full bg-white/5 border border-white/20 animate-[pulse_2s_infinite]" />
            <div class="absolute inset-0 flex items-center justify-center text-5xl">✨</div>
          </div>
          <div class="text-center space-y-2">
            <p class="text-foam-50 text-2xl font-bold tracking-wide">Ouverture en cours…</p>
            <p class="text-foam-300">Prépare-toi pour l'éclat de {{ maxRarity }}!</p>
          </div>
        </div>

        <!-- État ouvert - Affichage des cartes -->
        <div v-else class="flex flex-col gap-6 relative">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 class="text-3xl font-bold text-foam-50">Cartes révélées</h3>
              <p class="text-foam-300">Rareté maximale : <span class="font-bold capitalize" :style="{ color: glowColor }">{{ maxRarity }}</span></p>
            </div>
            <button @click="handleClose" class="text-foam-300 hover:text-white transition-colors text-3xl">
              ✕
            </button>
          </div>

          <div
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full pointer-events-none"
            :style="{ background: `radial-gradient(circle, ${glowColor.replace('0.9', '0.35')} 0%, transparent 70%)`, animation: 'auraPulse 6s ease-in-out infinite' }"
          />

          <div class="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-white/5 rounded-3xl border border-white/10 relative z-10">
            <div
              v-for="(card, idx) in props.cards"
              :key="card.id"
              class="card-reveal group"
              :style="{
                '--delay': `${idx * 80}ms`,
                '--tiltX': `${rarityTiltMap[card.rarity || 'common'] ?? 4}deg`,
                '--tiltY': `${idx % 2 === 0 ? -4 : 4}deg`,
              }"
            >
              <CollectibleCard
                :card="card"
                :maxWidth="120"
              />
            </div>
          </div>

          <button
            @click="handleClose"
            class="w-full relative py-4 px-6 font-bold text-lg rounded-2xl text-ink-900 shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition-transform hover:-translate-y-[2px]"
            :style="{
              backgroundImage: `linear-gradient(120deg, #fff6d2, ${glowColor}, #ffe1a2)` ,
              backgroundSize: '200% auto',
              backgroundPosition: `${shimmerProgress * 100}% 50%`,
            }"
          >
            Ajouter à ma collection
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes cardReveal {
  0% {
    opacity: 0;
    transform: translateY(25px) scale(0.7) rotateX(-30deg);
  }
  60% {
    opacity: 1;
    transform: translateY(-6px) scale(1.02) rotateX(5deg);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1) rotateX(var(--tiltX, 4deg)) rotateY(var(--tiltY, 0deg));
  }
}

@keyframes auraPulse {
  0%, 100% {
    transform: scale(0.9);
    opacity: 0.15;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.35;
  }
}

@keyframes flashBurst {
  0% {
    opacity: 0.9;
    transform: scale(0.8);
  }
  100% {
    opacity: 0;
    transform: scale(1.4);
  }
}

@keyframes particleRise {
  0% {
    transform: translate(-50%, 40px) scale(0.6);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -120px) scale(1.3);
    opacity: 0;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.flash-overlay {
  position: absolute;
  inset: -10%;
  animation: flashBurst 0.8s ease-out forwards;
  filter: blur(10px);
}

.particle {
  position: absolute;
  border-radius: 999px;
  opacity: 0;
  animation: particleRise 1.4s ease-out forwards;
}

.card-reveal {
  animation: cardReveal 0.7s ease-out forwards;
  animation-delay: var(--delay, 0ms);
}

.booster-svg {
  width: 200px;
  height: 290px;
  transition: transform 80ms ease, filter 120ms ease;
  transform-style: preserve-3d;
  cursor: grab;
  user-select: none;
}

.booster-svg:active {
  cursor: grabbing;
}

/* Textes du booster */
.logo-main {
  font-family: 'Space Grotesk', 'Plus Jakarta Sans', sans-serif;
  font-size: 28px;
  font-weight: 700;
  fill: #f8f9ff;
  letter-spacing: 0.12em;
}

.logo-sub {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 8px;
  fill: rgba(183, 194, 215, 0.85);
  letter-spacing: 0.25em;
  text-transform: uppercase;
}

.card-question {
  font-size: 28px;
  fill: rgba(20, 220, 180, 0.9);
  font-weight: bold;
}

.edition-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 11px;
  fill: #14dcb4;
  letter-spacing: 0.18em;
  font-weight: 600;
}

.info-text {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 6px;
  fill: rgba(183, 194, 215, 0.6);
  letter-spacing: 0.08em;
}

.star {
  font-size: 8px;
  fill: #ffd966;
}

.seal-text {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 7px;
  fill: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.1em;
}

.seal-zone {
  pointer-events: none;
}

.tear-part {
  transition: transform 60ms ease, opacity 100ms ease;
}

.light-escape {
  pointer-events: none;
}
</style>
