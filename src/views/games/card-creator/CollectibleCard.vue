<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  title: string;
  description: string;
  imageUrl: string;
  interactive?: boolean;
  frontAsset?: {
    type: 'gradient' | 'solid' | 'image';
    color1?: string;
    color2?: string;
    angle?: number;
    solidColor?: string;
    imageBase64?: string;
    imageMimeType?: string;
  };
  borderAsset?: {
    type: 'gradient' | 'solid' | 'image';
    color1?: string;
    color2?: string;
    angle?: number;
    solidColor?: string;
    imageBase64?: string;
    imageMimeType?: string;
  };
}>();

const cardRef = ref<HTMLElement | null>(null);
const rotateX = ref(0);
const rotateY = ref(0);
const isHovered = ref(false);
let animationFrameId: number | null = null;

const cardStyle = computed(() => {
  let bgStyle = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  
  // Custom asset takes precedence
  if (props.frontAsset) {
    if (props.frontAsset.type === 'solid' && props.frontAsset.solidColor) {
      bgStyle = props.frontAsset.solidColor;
    } else if (props.frontAsset.type === 'gradient') {
      bgStyle = `linear-gradient(${props.frontAsset.angle || 135}deg, ${props.frontAsset.color1 || '#667eea'} 0%, ${props.frontAsset.color2 || '#764ba2'} 100%)`;
    } else if (props.frontAsset.type === 'image' && props.frontAsset.imageBase64) {
      // Use dark background as base, img element will overlay
      bgStyle = '#1a1a2e';
    }
  }
  
  // Build border style from borderAsset
  let borderStyle = '3px solid rgba(255, 255, 255, 0.3)';
  let borderImageUrl = '';

  if (props.borderAsset) {
    if (props.borderAsset.type === 'solid' && props.borderAsset.solidColor) {
      borderStyle = `3px solid ${props.borderAsset.solidColor}`;
    } else if (props.borderAsset.type === 'gradient') {
      borderStyle = `3px solid transparent`;
    } else if (props.borderAsset.type === 'image' && props.borderAsset.imageBase64) {
      borderImageUrl = `url(data:${props.borderAsset.imageMimeType || 'image/png'};base64,${props.borderAsset.imageBase64})`;
    }
  }

  return {
    background: bgStyle,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    border: borderImageUrl ? 'none' : borderStyle,
    transform: `perspective(1000px) rotateX(${rotateX.value}deg) rotateY(${rotateY.value}deg)`,
  };
});

const backgroundLayerStyle = computed(() => {
  // Check custom asset first
  if (props.frontAsset?.type === 'image' && props.frontAsset.imageBase64) {
    const mimeType = props.frontAsset.imageMimeType || 'image/png';
    return {
      backgroundImage: `url(data:${mimeType};base64,${props.frontAsset.imageBase64})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      mask: 'unset',
      WebkitMask: 'unset',
    };
  }

  return null;
});

// Check if border uses an image
const hasImageBorder = computed(() => {
  return props.borderAsset?.type === 'image' && !!props.borderAsset.imageBase64;
});

// Get border image URL (base64)
const borderImageUrl = computed(() => {
  if (props.borderAsset?.type === 'image' && props.borderAsset.imageBase64) {
    const mimeType = props.borderAsset.imageMimeType || 'image/png';
    return `data:${mimeType};base64,${props.borderAsset.imageBase64}`;
  }
  return '';
});

// Check if background uses an image (custom base64)
const hasImageBackground = computed(() => {
  return props.frontAsset?.type === 'image' && !!props.frontAsset.imageBase64;
});

// Check if using UI Kit backgrounds (for animations)
const isUIKitBackground = computed(() => {
  return ['bg-nebula', 'bg-hex', 'bg-amber-liquid'].includes(props.background?.id || '');
});

// Get animation class for UI Kit backgrounds
const backgroundAnimationClass = computed(() => {
  switch (props.background?.id) {
    case 'bg-nebula': return 'animate-nebula';
    case 'bg-hex': return 'animate-hex';
    case 'bg-amber-liquid': return 'animate-amber-liquid';
    default: return '';
  }
});

// Get animation class for UI Kit borders
const borderAnimationClass = computed(() => {
  switch (props.border?.id) {
    case 'border-lightning': return 'animate-lightning';
    case 'border-blue-ring': return 'animate-blue-ring';
    case 'border-tech-frame': return 'animate-tech-frame';
    default: return '';
  }
});

// Check if holographic effect should be shown (for UI Kit items)
const showHolographic = computed(() => {
  return isUIKitBackground.value || hasImageBorder.value;
});

// Special border styles that need additional handling
const specialBorderStyle = computed(() => {
  // Image-based borders are handled separately
  if (props.border?.imageUrl) {
    return null;
  }
  
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

// Maximum rotation angle to prevent card from flipping
const MAX_ROTATION = 20;

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
  
  // Calculate rotation with strict limits to prevent flipping
  let newRotateY = (mouseX / (rect.width / 2)) * MAX_ROTATION;
  let newRotateX = -(mouseY / (rect.height / 2)) * MAX_ROTATION;
  
  // Clamp rotation values to prevent excessive rotation
  rotateY.value = Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, newRotateY));
  rotateX.value = Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, newRotateX));
  
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
    :class="[
      { 'shadow-2xl scale-105': isHovered }
    ]"
    :style="cardStyle"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Image-based background (for UI Kit backgrounds like Nebula, Hex, Amber Liquid) -->
    <div
      v-if="hasImageBackground && backgroundLayerStyle"
      class="absolute inset-0 rounded-2xl pointer-events-none z-0"
      :class="backgroundAnimationClass"
      :style="backgroundLayerStyle"
      aria-hidden="true"
    />
    
    <!-- Holographic overlay effect for UI Kit items -->
    <div 
      v-if="showHolographic"
      class="holographic-overlay absolute inset-0 pointer-events-none z-40 rounded-2xl"
      :class="{ 'holographic-active': isHovered }"
    />
    
    <!-- Image-based border overlay (from borderAsset) -->
    <img
      v-if="hasImageBorder && borderImageUrl"
      :src="borderImageUrl"
      class="absolute inset-0 w-full h-full pointer-events-none z-30"
      alt=""
    />
    
    <!-- Special border overlay for rainbow/gradient borders -->
    <div 
      v-if="specialBorderStyle"
      class="absolute inset-0 rounded-2xl pointer-events-none special-border-overlay z-30"
      :style="{
        ...specialBorderStyle,
        padding: '4px',
      }"
    />
    
    <!-- Card inner content -->
    <div class="relative h-full flex flex-col p-4 z-20">
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

/* Holographic shader effect */
.holographic-overlay {
  background: linear-gradient(
    125deg,
    transparent 0%,
    rgba(255, 0, 255, 0.1) 20%,
    rgba(0, 255, 255, 0.1) 40%,
    rgba(255, 255, 0, 0.1) 60%,
    rgba(0, 255, 0, 0.1) 80%,
    transparent 100%
  );
  background-size: 400% 400%;
  opacity: 0;
  transition: opacity 0.3s ease;
  mix-blend-mode: overlay;
}

.holographic-overlay.holographic-active {
  opacity: 1;
  animation: holographic-shift 3s ease infinite;
}

@keyframes holographic-shift {
  0% {
    background-position: 0% 50%;
    filter: hue-rotate(0deg);
  }
  50% {
    background-position: 100% 50%;
    filter: hue-rotate(180deg);
  }
  100% {
    background-position: 0% 50%;
    filter: hue-rotate(360deg);
  }
}

/* Background animations */
.animate-nebula {
  animation: nebula-pulse 8s ease-in-out infinite;
}

@keyframes nebula-pulse {
  0%, 100% {
    filter: brightness(1) saturate(1);
  }
  50% {
    filter: brightness(1.2) saturate(1.3);
  }
}

.animate-hex {
  animation: hex-glow 4s ease-in-out infinite;
}

@keyframes hex-glow {
  0%, 100% {
    filter: brightness(1) drop-shadow(0 0 0px transparent);
  }
  50% {
    filter: brightness(1.1) drop-shadow(0 0 10px rgba(0, 255, 136, 0.3));
  }
}

.animate-amber-liquid {
  animation: amber-flow 6s ease-in-out infinite;
}

@keyframes amber-flow {
  0%, 100% {
    filter: brightness(1) hue-rotate(0deg);
  }
  33% {
    filter: brightness(1.15) hue-rotate(10deg);
  }
  66% {
    filter: brightness(1.1) hue-rotate(-5deg);
  }
}

/* Border animations */
.animate-lightning {
  animation: lightning-flicker 0.5s ease-in-out infinite;
}

@keyframes lightning-flicker {
  0%, 100% {
    opacity: 1;
    filter: brightness(1) drop-shadow(0 0 5px rgba(153, 69, 255, 0.8));
  }
  25% {
    opacity: 0.8;
    filter: brightness(1.3) drop-shadow(0 0 15px rgba(20, 241, 149, 1));
  }
  50% {
    opacity: 1;
    filter: brightness(1.5) drop-shadow(0 0 20px rgba(153, 69, 255, 1));
  }
  75% {
    opacity: 0.9;
    filter: brightness(1.2) drop-shadow(0 0 10px rgba(20, 241, 149, 0.9));
  }
}

.animate-blue-ring {
  animation: blue-ring-pulse 2s ease-in-out infinite;
}

@keyframes blue-ring-pulse {
  0%, 100% {
    filter: brightness(1) drop-shadow(0 0 5px rgba(0, 212, 255, 0.5));
    transform: scale(1);
  }
  50% {
    filter: brightness(1.3) drop-shadow(0 0 20px rgba(0, 212, 255, 1)) drop-shadow(0 0 40px rgba(0, 153, 255, 0.5));
    transform: scale(1.02);
  }
}

.animate-tech-frame {
  animation: tech-scan 3s linear infinite;
}

@keyframes tech-scan {
  0% {
    filter: brightness(1) drop-shadow(0 0 3px rgba(0, 255, 136, 0.5));
  }
  25% {
    filter: brightness(1.2) drop-shadow(0 0 8px rgba(0, 212, 255, 0.8));
  }
  50% {
    filter: brightness(1.3) drop-shadow(0 0 12px rgba(255, 0, 255, 0.8));
  }
  75% {
    filter: brightness(1.2) drop-shadow(0 0 8px rgba(0, 212, 255, 0.8));
  }
  100% {
    filter: brightness(1) drop-shadow(0 0 3px rgba(0, 255, 136, 0.5));
  }
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
