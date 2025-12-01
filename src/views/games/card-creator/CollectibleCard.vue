<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { CardBackground, CardBorder } from '@/types/models';

const props = defineProps<{
  title: string;
  description: string;
  imageUrl: string;
  background: CardBackground | undefined;
  border: CardBorder | undefined;
  interactive?: boolean;
}>();

const cardRef = ref<HTMLElement | null>(null);
const rotateX = ref(0);
const rotateY = ref(0);
const isHovered = ref(false);
let animationFrameId: number | null = null;

const cardStyle = computed(() => {
  const bg = props.background?.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  const borderStyle = props.border?.style || '3px solid rgba(255, 255, 255, 0.3)';
  
  return {
    background: bg,
    border: borderStyle,
    transform: `perspective(1000px) rotateX(${rotateX.value}deg) rotateY(${rotateY.value}deg)`,
  };
});

// Special border styles that need additional handling
const specialBorderStyle = computed(() => {
  if (props.border?.id === 'border-4') {
    // Rainbow border
    return {
      backgroundImage: 'linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet, red)',
      backgroundSize: '400% 400%',
      animation: 'rainbow-border 3s linear infinite',
    };
  }
  if (props.border?.id === 'border-8') {
    // Gradient border
    return {
      backgroundImage: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c)',
    };
  }
  return null;
});

// Throttled mouse move handler using requestAnimationFrame
let pendingMouseEvent: MouseEvent | null = null;

const processMouseMove = () => {
  if (!pendingMouseEvent || !cardRef.value) {
    animationFrameId = null;
    return;
  }
  
  const event = pendingMouseEvent;
  pendingMouseEvent = null;
  
  const rect = cardRef.value.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  const mouseX = event.clientX - centerX;
  const mouseY = event.clientY - centerY;
  
  // Limit rotation to ±15 degrees
  rotateY.value = (mouseX / (rect.width / 2)) * 15;
  rotateX.value = -(mouseY / (rect.height / 2)) * 15;
  
  animationFrameId = null;
};

const handleMouseMove = (event: MouseEvent) => {
  if (!props.interactive || !cardRef.value) return;
  
  pendingMouseEvent = event;
  
  if (animationFrameId === null) {
    animationFrameId = requestAnimationFrame(processMouseMove);
  }
};

const handleMouseEnter = () => {
  if (!props.interactive) return;
  isHovered.value = true;
};

const handleMouseLeave = () => {
  if (!props.interactive) return;
  isHovered.value = false;
  rotateX.value = 0;
  rotateY.value = 0;
};

onMounted(() => {
  if (props.interactive) {
    window.addEventListener('mousemove', handleMouseMove);
  }
});

onUnmounted(() => {
  if (props.interactive) {
    window.removeEventListener('mousemove', handleMouseMove);
  }
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<template>
  <div
    ref="cardRef"
    class="collectible-card relative w-64 h-96 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 ease-out"
    :class="{ 'shadow-2xl scale-105': isHovered }"
    :style="cardStyle"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Special border overlay for rainbow/gradient borders -->
    <div 
      v-if="specialBorderStyle"
      class="absolute inset-0 rounded-2xl pointer-events-none special-border-overlay"
      :style="{ 
        ...specialBorderStyle,
        padding: '4px',
      }"
    />
    
    <!-- Card inner content -->
    <div class="relative h-full flex flex-col p-4">
      <!-- Image container -->
      <div class="flex-shrink-0 h-48 rounded-xl overflow-hidden bg-black/20 mb-3">
        <img 
          v-if="imageUrl"
          :src="imageUrl" 
          :alt="title"
          class="w-full h-full object-cover"
        />
        <div 
          v-else 
          class="w-full h-full flex items-center justify-center text-white/40"
        >
          <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      
      <!-- Title -->
      <h3 class="text-xl font-bold text-white mb-2 truncate drop-shadow-lg">
        {{ title || 'Titre de la carte' }}
      </h3>
      
      <!-- Description -->
      <p class="text-sm text-white/80 line-clamp-3 flex-grow drop-shadow-md">
        {{ description || 'Description de votre carte à collectionner...' }}
      </p>
      
      <!-- Shine effect -->
      <div 
        class="absolute inset-0 pointer-events-none rounded-2xl"
        :class="{ 'shine-effect': isHovered }"
      />
    </div>
  </div>
</template>

<style scoped>
.collectible-card {
  transform-style: preserve-3d;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}

.collectible-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 50%,
    rgba(0, 0, 0, 0.1) 100%
  );
  pointer-events: none;
  border-radius: inherit;
}

.shine-effect {
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(255, 255, 255, 0.3) 45%,
    rgba(255, 255, 255, 0.5) 50%,
    rgba(255, 255, 255, 0.3) 55%,
    transparent 60%
  );
  animation: shine 0.6s ease-in-out;
}

@keyframes shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes rainbow-border {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 400% 50%;
  }
}

.special-border-overlay {
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
