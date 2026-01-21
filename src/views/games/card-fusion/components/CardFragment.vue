<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  rarity: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

const props = defineProps<Props>();

const rarityColors: Record<string, string> = {
  common: '#808080',
  uncommon: '#22C55E',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#FBBF24',
};

const fragmentStyle = computed(() => ({
  position: 'absolute' as const,
  left: '50%',
  top: '50%',
  transform: `translate(${props.x}px, ${props.y}px) rotate(${props.rotation}deg) scale(${props.scale})`,
  width: '120px',
  height: '160px',
  background: `linear-gradient(135deg, ${rarityColors[props.rarity]}60, ${rarityColors[props.rarity]}20)`,
  border: `2px solid ${rarityColors[props.rarity]}`,
  borderRadius: '8px',
  boxShadow: `0 0 20px ${rarityColors[props.rarity]}40`,
  backdropFilter: 'blur(2px)',
  transition: 'all 0.016s linear',
  pointerEvents: 'none' as const,
}));

// Génération de pattern aléatoire pour simuler le déchirement
const clipPath = computed(() => {
  const points = [];
  const segments = 8;
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * 360;
    const radius = 40 + Math.random() * 20;
    const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
    const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
    points.push(`${x}% ${y}%`);
  }
  return `polygon(${points.join(', ')})`;
});
</script>

<template>
  <div :style="{ ...fragmentStyle, clipPath }" class="card-fragment">
    <div class="fragment-texture" />
  </div>
</template>

<style scoped>
.card-fragment {
  will-change: transform;
  transform-origin: center;
}

.fragment-texture {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(255, 255, 255, 0.05) 10px,
    rgba(255, 255, 255, 0.05) 20px
  );
  border-radius: inherit;
}
</style>
