<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';
import type {CollectibleCard} from "@/types/models";

// Taille de base de la carte (référence)
const BASE_WIDTH = 250;
const BASE_HEIGHT = 378;
const ASPECT_RATIO = BASE_HEIGHT / BASE_WIDTH; // ~1.512

const props = withDefaults(defineProps<{
  card: CollectibleCard,
  interactive?: boolean,
  maxWidth?: number, // Largeur maximale en pixels
  lazyLoad?: boolean // Enable lazy loading for performance
}>(), {
  interactive: false,
  lazyLoad: false
});

// Lazy loading state
const isVisible = ref(!props.lazyLoad); // If not lazy loading, always visible
const hasBeenVisible = ref(!props.lazyLoad); // Track if card has been visible at least once

// Calcul du scale factor basé sur maxWidth
const scaleFactor = computed(() => {
  const targetWidth = props.maxWidth ?? BASE_WIDTH;
  return targetWidth / BASE_WIDTH;
});

// Dimensions calculées
const cardWidth = computed(() => (props.maxWidth ?? BASE_WIDTH));
const cardHeight = computed(() => cardWidth.value * ASPECT_RATIO);

// Helper pour scaler une valeur en pixels
const scale = (value: number) => value * scaleFactor.value;

// Helper pour scaler une taille de police
const scaleFontSize = (basePx: number) => `${scale(basePx)}px`;

const cardRef = ref<HTMLElement | null>(null);
const rotateX = ref(0);
const rotateY = ref(0);
const isHovered = ref(false);
let animationFrameId: number | null = null;

// Holographic light position based on rotation
const holoLightX = computed(() => {
  // Map rotateY (-20 to 20) to light position (0 to 100)
  return 50 + (rotateY.value / 20) * 50;
});

const holoLightY = computed(() => {
  // Map rotateX (-20 to 20) to light position (0 to 100)
  return 50 + (-rotateX.value / 20) * 50;
});

const cardStyle = computed(() => {
  let bgStyle = 'transparent';

  // Custom asset takes precedence
  if (props.card.frontAsset) {
    if (props.card.frontAsset.type === 'solid' && props.card.frontAsset.solidColor) {
      bgStyle = props.card.frontAsset.solidColor;
    } else if (props.card.frontAsset.type === 'gradient') {
      bgStyle = `linear-gradient(${props.card.frontAsset.angle || 135}deg, ${props.card.frontAsset.color1 || '#667eea'} 0%, ${props.card.frontAsset.color2 || '#764ba2'} 100%)`;
    } else if (props.card.frontAsset.type === 'image' && props.card.frontAsset.imageBase64) {
      // Use dark background as base, img element will overlay
      bgStyle = '#1a1a2e';
    }
  }
  
  // Build border style from borderAsset
  let borderStyle = '0 solid transparent';
  let borderImageUrl = '';

  if (props.card.borderAsset) {
    if (props.card.borderAsset.type === 'solid' && props.card.borderAsset.solidColor) {
      borderStyle = `3px solid ${props.card.borderAsset.solidColor}`;
    } else if (props.card.borderAsset.type === 'gradient') {
      borderStyle = `3px solid transparent`;
    } else if (props.card.borderAsset.type === 'image' && props.card.borderAsset.imageBase64) {
      borderImageUrl = `url(data:${props.card.borderAsset.imageMimeType || 'image/png'};base64,${props.card.borderAsset.imageBase64})`;
    }
  }

  // Only apply 3D rotation on hover
  const transform = isHovered.value
    ? `perspective(1000px) rotateX(${rotateX.value}deg) rotateY(${rotateY.value}deg)`
    : 'perspective(1000px) rotateX(0deg) rotateY(0deg)';

  return {
    background: bgStyle,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    border: borderImageUrl ? 'none' : borderStyle,
    transform,
    transition: isHovered.value ? 'none' : 'transform 0.3s ease-out',
  };
});

const backgroundLayerStyle = computed(() => {
  if (props.card.frontAsset?.type === 'image' && props.card.frontAsset.imageBase64) {
    const mimeType = props.card.frontAsset.imageMimeType || 'image/png';
    return {
      backgroundImage: `url(data:${mimeType};base64,${props.card.frontAsset.imageBase64})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      mask: 'unset',
      WebkitMask: 'unset',
    };
  }

  return null;
});

const hasImageBorder = computed(() => {
  return props.card.borderAsset?.type === 'image' && !!props.card.borderAsset.imageBase64;
});

const borderImageUrl = computed(() => {
  if (props.card.borderAsset?.type === 'image' && props.card.borderAsset.imageBase64) {
    const mimeType = props.card.borderAsset.imageMimeType || 'image/png';
    return `data:${mimeType};base64,${props.card.borderAsset.imageBase64}`;
  }
  return '';
});

const hasImageBackground = computed(() => {
  return props.card.frontAsset?.type === 'image' && !!props.card.frontAsset.imageBase64;
});

const showHolographic = computed(() => {
  const shouldShow = hasImageBorder.value || props.card.holographicEffect;
  return shouldShow && (!props.interactive || isHovered.value);
});

// Holographic intensity (0 to 1)
const holoIntensity = computed(() => {
  return Math.max(0, Math.min(1, props.card.holographicIntensity ?? 0.6));
});

// Computed styles for image positioning and scale
const imageStyle = computed(() => {
  const x = props.card.imagePosX ?? 50;
  const y = props.card.imagePosY ?? 30;
  const imageScale = props.card.imageScale ?? 1;
  const width = props.card.imageWidth ?? 160;
  const height = props.card.imageHeight ?? 160;

  return {
    left: `${x}%`,
    top: `${y}%`,
    transform: `translate(-50%, -50%) scale(${imageScale})`,
    transformOrigin: 'center',
    width: `${scale(width)}px`,
    height: `${scale(height)}px`,
  };
});

// Computed object-fit for image
const imageObjectFit = computed(() => {
  return props.card.imageObjectFit ?? 'cover';
});

// Computed rarity icon and color
const rarityInfo = computed(() => {
  const r = props.card.rarity ?? 'common';
  const rarityMap: Record<string, { icon: string; color: string; label: string }> = {
    common: { icon: '⚪', color: '#808080', label: 'Commun' },
    uncommon: { icon: '🟩', color: '#22C55E', label: 'Peu commun' },
    rare: { icon: '🟦', color: '#3B82F6', label: 'Rare' },
    epic: { icon: '🟪', color: '#A855F7', label: 'Épique' },
    legendary: { icon: '🟨', color: '#FBBF24', label: 'Légendaire' },
  };
  return rarityMap[r] || rarityMap.common;
});

// Special border styles that need additional handling
const specialBorderStyle = computed(() => {
  // Image-based borders are handled separately
  if (props.card.borderAsset?.type === 'image') {
    return null;
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
  // Gradual reset with transition
  setTimeout(() => {
    rotateX.value = 0;
    rotateY.value = 0;
  }, 50);
};

onMounted(() => {
  if (props.lazyLoad && cardRef.value) {
    useIntersectionObserver(
      cardRef,
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          isVisible.value = true;
          hasBeenVisible.value = true;
        } else if (entry) {
          isVisible.value = false;
        }
      },
      {
        threshold: 0.01,
        rootMargin: '50px'
      }
    );
  }
  
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
    class="collectible-card relative rounded-md overflow-hidden cursor-pointer transition-all duration-200 ease-out"
    :class="[
      { 'shadow-2xl scale-105': isHovered },
      { 'card-loading': !hasBeenVisible }
    ]"
    :style="{
      ...cardStyle,
      width: `${cardWidth}px`,
      height: `${cardHeight}px`,
      contain: 'layout style paint'
    }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Loading skeleton -->
    <div v-if="!hasBeenVisible" class="absolute inset-0 bg-white/5 animate-pulse" />
    
    <!-- Card content - only render if visible or has been visible -->
    <template v-if="hasBeenVisible">
    <!-- Image-based background (for UI Kit backgrounds like Nebula, Hex, Amber Liquid) -->
    <div
      v-if="hasImageBackground && backgroundLayerStyle"
      class="absolute inset-0 rounded-md pointer-events-none z-0"
      :style="backgroundLayerStyle"
      aria-hidden="true"
    />
    
    <!-- Holographic overlay effect for UI Kit items -->
    <div 
      v-if="showHolographic && isVisible"
      class="holographic-overlay absolute inset-0 pointer-events-none z-40 rounded-md"
      :style="{
        opacity: holoIntensity,
        '--holo-light-x': `${holoLightX}%`,
        '--holo-light-y': `${holoLightY}%`
      }"
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
      v-if="specialBorderStyle !== null"
      class="absolute inset-0 rounded-md pointer-events-none special-border-overlay z-30"
      :style="{ padding: `${scale(4)}px` }"
    />
    
    <!-- Card inner content -->
    <div
      class="relative h-full flex flex-col z-20"
      :style="{ padding: `${scale(16)}px` }"
    >
      <!-- Image container -->
      <div class="absolute" :style="imageStyle">
        <img
          v-if="card.imageUrl || (props.card.imageBase64 && props.card.imageMimeType)"
          :src="card.imageUrl || `data:${props.card.imageMimeType};base64,${props.card.imageBase64}`"
          :alt="card.title"
          class="w-full h-full rounded-lg"
          :style="{ objectFit: imageObjectFit }"
          :class="{ 'remove-bg-image': props.card.removeImageBg }"
          loading="lazy"
          decoding="async"
        />
        <div 
          v-else 
          class="w-full h-full flex items-center justify-center text-white/40 bg-black/20 rounded-lg"
        >
          <svg
            class="w-16 h-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            :style="{ width: `${scale(64)}px`, height: `${scale(64)}px` }"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      <!-- Rarity Icon (bottom of image) -->
      <div
        class="absolute right-1 flex flex-row items-center gap-1"
        :style="{
          top: `95%`,
          fontSize: scaleFontSize(10),
          zIndex: 30,
          textShadow: '0 2px 4px rgba(0,0,0,0.8)',
        }"
      >
        <!-- Category Name -->
        <span v-if="props.card.category?.name" class="text-xs font-semibold text-white bg-black/50 px-1.5 py-0.5 rounded whitespace-nowrap">
          {{ props.card.category.name }}
        </span>
        <!-- Rarity Icon -->
        <span>{{ rarityInfo?.icon ?? '⚪' }}</span>
      </div>

      <!-- Title (positional) -->
      <h3
        class="font-bold text-white drop-shadow-lg absolute"
        :class="props.card.titleWidth ?? 'w-full'"
        :style="{
          left: `${props.card.titlePosX ?? 50}%`,
          top: `${props.card.titlePosY ?? 10}%`,
          textAlign: props.card.titleAlign ?? 'center',
          color: props.card.titleColor ?? '#ffffff',
          transform: 'translateX(-50%)',
          fontSize: scaleFontSize(props.card.titleFontSize ?? 18),
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
        }"
      >
        {{ card.title || 'Titre de la carte' }}
      </h3>
      

      <!-- Custom Texts (positional) -->
      <p
        v-for="(customText, index) in props.card.customTexts"
        :key="`custom-text-${index}`"
        class="drop-shadow-md absolute"
        :class="customText.width"
        :style="{
          left: `${customText.posX}%`,
          top: `${customText.posY}%`,
          textAlign: customText.align,
          color: customText.color,
          transform: 'translateX(-50%)',
          fontSize: scaleFontSize(customText.fontSize ?? 14),
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
        }"
      >
        {{ customText.content }}
      </p>
    </div>
    </template>
  </div>
</template>

<style scoped>
.collectible-card {
  transform-style: preserve-3d;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  /* CSS containment for better performance */
  contain: layout style paint;
}

.card-loading {
  pointer-events: none;
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

/* Holographic shader effect - dynamic light following card rotation */
.holographic-overlay {
  background:
    /* Main holographic sheen that follows light direction */
    radial-gradient(
      circle at var(--holo-light-x, 50%) var(--holo-light-y, 50%),
      rgba(255, 255, 255, 0.25) 0%,
      rgba(255, 200, 255, 0.15) 15%,
      rgba(100, 200, 255, 0.1) 30%,
      transparent 60%
    ),
    /* Secondary rainbow sheen layer */
    linear-gradient(
      125deg,
      transparent 0%,
      rgba(255, 0, 255, 0.08) 20%,
      rgba(0, 255, 255, 0.08) 40%,
      rgba(255, 255, 0, 0.08) 60%,
      rgba(0, 255, 100, 0.08) 80%,
      transparent 100%
    );
  background-size: 100% 100%, 400% 400%;
  background-position: 0 0, 0% 50%;
  mix-blend-mode: overlay;
  animation: holo-shift 4s ease-in-out infinite;
  pointer-events: none;
  /* Pause animation if user prefers reduced motion */
  will-change: filter, background-position;
}

@media (prefers-reduced-motion: reduce) {
  .holographic-overlay {
    animation: none;
  }
}

@keyframes holo-shift {
  0% {
    background-position: 0 0, 0% 50%;
    filter: hue-rotate(0deg);
  }
  50% {
    background-position: 0 0, 100% 50%;
    filter: hue-rotate(180deg);
  }
  100% {
    background-position: 0 0, 0% 50%;
    filter: hue-rotate(360deg);
  }
}

.remove-bg-image {
  mix-blend-mode: lighten;
  filter: saturate(1.3) contrast(1.15) brightness(1.05);
  background: transparent;
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
</style>
