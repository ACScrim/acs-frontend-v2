<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

interface Props {
  rarity: string;
  count: number;
}

const props = defineProps<Props>();

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  life: number;
}

const particles = ref<Particle[]>([]);
const animationId = ref<number | null>(null);

const rarityColors: Record<string, string> = {
  common: '#808080',
  uncommon: '#22C55E',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#FBBF24',
};

const color = computed(() => rarityColors[props.rarity] || '#ffffff');

const initParticles = () => {
  particles.value = Array.from({ length: props.count }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 30,
    y: 50 + (Math.random() - 0.5) * 30,
    size: 2 + Math.random() * 4,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    life: 1,
  }));
};

const animate = () => {
  particles.value = particles.value.map(p => ({
    ...p,
    x: p.x + p.vx,
    y: p.y + p.vy,
    vx: p.vx * 0.98,
    vy: p.vy * 0.98,
    life: p.life - 0.01,
  })).filter(p => p.life > 0);

  if (particles.value.length > 0) {
    animationId.value = requestAnimationFrame(animate);
  }
};

onMounted(() => {
  initParticles();
  animate();
});

onUnmounted(() => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value);
  }
});
</script>

<template>
  <div class="particles-container">
    <div
      v-for="particle in particles"
      :key="particle.id"
      class="particle"
      :style="{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        width: `${particle.size}px`,
        height: `${particle.size}px`,
        backgroundColor: color,
        opacity: particle.life,
        boxShadow: `0 0 ${particle.size * 3}px ${color}`,
      }"
    />
  </div>
</template>

<style scoped>
.particles-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  will-change: transform, opacity;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.3);
  }
}
</style>
