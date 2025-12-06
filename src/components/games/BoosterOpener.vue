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

const tearSpring = useTransition(pullingProgress, {
  duration: 260,
  transition: TransitionPresets.easeOutExpo,
});
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
};

const completePullIfNeeded = () => {
  if (pullingProgress.value >= tearThreshold) {
    startOpeningAnimation();
  } else {
    pullingProgress.value = 0;
  }
};

const updateDrag = (clientX?: number) => {
  if (!isPointerDown.value || boosterState.value !== 'closed') return;

  // Déplacement vers la gauche = positif (comme arracher un booster)
  const resolvedX = clientX ?? pullStartX.value;
  const deltaX = pullStartX.value - resolvedX;
  pullingProgress.value = Math.max(0, Math.min(1, deltaX / 150));
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

const handleMouseMove = (event: MouseEvent) => updateDrag(event.clientX);
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
  updateDrag(touch.clientX);
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
            class="relative cursor-grab active:cursor-grabbing group overflow-x-hidden"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @touchstart.prevent="handleTouchStart"
            @touchmove.prevent="handleTouchMove"
            @touchend.prevent="handleTouchEnd"
          >
            <div class="size-1 rounded-full bg-white absolute top-1/3 left-1/2 -z-10" :style="{ boxShadow: `1px 1px 60px ${60 - (60 * (1 - tearMotion))}px ${glowColorMap[maxRarity]}` }" />
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 340" width="200" height="340">
              <defs>
                <radialGradient id="orbViolet" cx="30%" cy="30%" r="60%" fx="30%" fy="30%">
                  <stop offset="0%" style="stop-color:#8A2BE2;stop-opacity:0.7" />
                  <stop offset="100%" style="stop-color:#8A2BE2;stop-opacity:0" />
                </radialGradient>
                <radialGradient id="orbBlue" cx="80%" cy="70%" r="50%" fx="80%" fy="70%">
                  <stop offset="0%" style="stop-color:#4169E1;stop-opacity:0.6" />
                  <stop offset="100%" style="stop-color:#4169E1;stop-opacity:0" />
                </radialGradient>
                <linearGradient id="metallicSheen" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.1" />
                  <stop offset="50%" style="stop-color:#ffffff;stop-opacity:0" />
                  <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0.1" />
                </linearGradient>

                <path id="zigzagTopPath" d="M0,35 L5,5 L10,15 L15,5 L20,15 L25,5 L30,15 L35,5 L40,15 L45,5 L50,15 L55,5 L60,15 L65,5 L70,15 L75,5 L80,15 L85,5 L90,15 L95,5 L100,15 L105,5 L110,15 L115,5 L120,15 L125,5 L130,15 L135,5 L140,15 L145,5 L150,15 L155,5 L160,15 L165,5 L170,15 L175,5 L180,15 L185,5 L190,15 L195,5 L200,35" />

                <path id="zigzagBottomPath" d="M0,325 L5,335 L10,325 L15,335 L20,325 L25,335 L30,325 L35,335 L40,325 L45,335 L50,325 L55,335 L60,325 L65,335 L70,325 L75,335 L80,325 L85,335 L90,325 L95,335 L100,325 L105,335 L110,325 L115,335 L120,325 L125,335 L130,325 L135,335 L140,325 L145,335 L150,325 L155,335 L160,325 L165,335 L170,325 L175,335 L180,325 L185,335 L190,325 L195,335 L200,325" />

                <path id="fullBoosterOutline" d="M0,35 L200,35 L200,325 L195,335 L190,325 L185,335 L180,325 L175,335 L170,325 L165,335 L160,325 L155,335 L150,325 L145,335 L140,325 L135,335 L130,325 L125,335 L120,325 L115,335 L110,325 L105,335 L100,325 L95,335 L90,325 L85,335 L80,325 L75,335 L70,325 L65,335 L60,325 L55,335 L50,325 L45,335 L40,325 L35,335 L30,325 L25,335 L20,325 L15,335 L10,325 L5,335 L0,325 Z" />

                <clipPath id="boosterClip">
                  <use href="#fullBoosterOutline"/>
                </clipPath>
                <clipPath id="zigzagClip">
                  <use href="#zigzagTopPath" />
                </clipPath>
              </defs>
              <g>
                <g clip-path="url(#boosterClip)">
                  <rect x="0" y="0" width="200" height="340" fill="#03050b" />
                  <rect x="0" y="0" width="200" height="340" fill="url(#orbViolet)"/>
                  <rect x="0" y="0" width="200" height="340" fill="url(#orbBlue)"/>
                  <rect x="0" y="0" width="200" height="340" fill="url(#metallicSheen)"/>
                </g>

                <image
                  x="0"
                  y="70"
                  width="200"
                  height="200"
                  href="/Logo_ACS.png"
                  opacity="0.75"
                />
              </g>
              <!-- Top seal - animable indépendamment -->
              <g
                id="top-seal-group"
              >
                <!-- Rectangle du sceau clippé à la forme du zigzag et qui se réduit -->
                <rect
                  x="0"
                  y="0"
                  width="200"
                  height="35"
                  fill="#2a1f4e"
                  clip-path="url(#zigzagClip)"
                  :style="{
                    width: 100 - tearMotion * 100 + '%',
                    transformOrigin: 'top center',
                  }"
                />
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
