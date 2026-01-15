<script setup lang="ts">
import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import CollectibleCard from "@/views/games/card-creator/CollectibleCard.vue";
import type {CollectibleCard as Card} from "@/types/models";

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
const isPointerDown = ref(false);
const tearThreshold = 0.72;

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

const handlePointerRelease = () => {
  if (!isPointerDown.value) return;
  resetPointerState();
  completePullIfNeeded();
};

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
    >
      <p class="sr-only" aria-live="polite">{{ accessibilityStatus }}</p>

      <div class="relative max-w-7xl w-full">
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

        <div class="relative flex flex-col gap-6">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 class="text-2xl sm:text-3xl font-bold text-foam-50 text-center md:text-left">Cartes révélées</h3>
              <p class="text-foam-300 text-center md:text-left">
                Rareté maximale :
                <span class="font-bold capitalize" :style="{ color: glowColor }">{{ maxRarity }}</span>
                <span class="text-foam-300/70 mx-2">·</span>
                <span class="text-foam-100/80">{{ props.cards.length }} carte(s)</span>
                <span class="text-foam-300/70 mx-2">·</span>
                <span class="text-foam-100/80">{{ props.cards.reduce((acc, c) => c.isNew ?  true : acc, false) ? "Nouvelle carte" : "" }}</span>
              </p>
            </div>
            <button @click="handleClose" class="text-foam-300 hover:text-white transition-colors text-3xl">
              ✕
            </button>
          </div>

          <div
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[26rem] h-[26rem] sm:w-[32rem] sm:h-[32rem] rounded-full pointer-events-none"
            :style="{ background: `radial-gradient(circle, ${glowColor.replace('0.9', '0.35')} 0%, transparent 70%)`, animation: 'auraPulse 6s ease-in-out infinite' }"
          />

          <!--
            Cartes:
            - Mobile: bandeau horizontal scrollable + snap (lisible même avec 10+ cartes)
            - Desktop: grille scrollable avec hauteur max (évite que le modal dépasse l'écran)
          -->
          <div class="relative z-10 rounded-3xl border border-white/10 bg-white/5">
            <!-- Mobile -->
            <div class="block md:hidden">
              <div class="px-4 pt-4">
                <p class="text-xs uppercase tracking-[0.35em] text-foam-300/60">Faites défiler</p>
              </div>
              <div class="cards-scroll-x px-4 pb-4 pt-3">
                <div class="flex gap-4 w-max snap-x snap-mandatory">
                  <div
                    v-for="(card, idx) in props.cards"
                    :key="card.id"
                    class="card-reveal group snap-start shrink-0 relative"
                    :style="{
                      '--delay': `${idx * 80}ms`,
                      '--tiltX': `${rarityTiltMap[card.rarity || 'common'] ?? 4}deg`,
                      '--tiltY': `${idx % 2 === 0 ? -4 : 4}deg`,
                    }"
                  >
                    <CollectibleCard :card="card" :maxWidth="200" lazy-load :interactive="false" />
                    <div
                      v-if="card.isNew !== undefined || card.ownedCount !== undefined"
                      class="flex justify-center w-[200px] mt-2"
                    >
                      <!-- Badge "Nouvelle" -->
                      <p
                        v-if="card.isNew === true"
                        class="px-2 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-black text-xs font-bold rounded-full shadow-lg"
                      >
                        ✨ Nouvelle
                      </p>
                      <!-- Nombre de possessions -->
                      <p
                        v-if="card.ownedCount !== undefined && card.ownedCount > 0"
                        class="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full shadow-lg border border-white/30"
                      >
                        ×{{ card.ownedCount }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Desktop -->
            <div class="hidden md:block p-4">
              <div class="cards-grid-scroll grid grid-cols-5 gap-4 justify-items-center">
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
                  <CollectibleCard :card="card" :maxWidth="200" lazy-load />
                  <div
                      v-if="card.isNew !== undefined || card.ownedCount !== undefined"
                      class="flex justify-center w-[200px] mt-2"
                  >
                    <!-- Badge "Nouvelle" -->
                    <p
                        v-if="card.isNew === true"
                        class="px-2 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-black text-xs font-bold rounded-full shadow-lg"
                    >
                        ✨ Nouvelle
                      </p>
                    <!-- Nombre de possessions -->
                    <p
                        v-if="card.ownedCount !== undefined && card.ownedCount > 0"
                        class="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full shadow-lg border border-white/30"
                    >
                        ×{{ card.ownedCount }}
                      </p>
                  </div>
                </div>
              </div>
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
  /* Valeurs par défaut explicites pour satisfaire l'analyse statique (overrides via :style inline). */
  --delay: 0ms;
  --tiltX: 4deg;
  --tiltY: 0deg;

  animation: cardReveal 0.7s ease-out forwards;
  animation-delay: var(--delay, 0ms);
}

/* Styles du booster SVG supprimés (non utilisés dans ce composant). */

.cards-scroll-x {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.25) transparent;
}

.cards-scroll-x::-webkit-scrollbar {
  height: 10px;
}

.cards-scroll-x::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 999px;
}

.cards-scroll-x::-webkit-scrollbar-track {
  background: transparent;
}

.cards-grid-scroll {
  max-height: min(52vh, 520px);
  overflow-y: auto;
  padding-right: 6px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.25) transparent;
}

.cards-grid-scroll::-webkit-scrollbar {
  width: 10px;
}

.cards-grid-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 999px;
}

.cards-grid-scroll::-webkit-scrollbar-track {
  background: transparent;
}
</style>
