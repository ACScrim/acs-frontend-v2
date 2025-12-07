<script setup lang="ts">
import { computed, ref } from "vue";

interface Props {
  src?: string;
  alt?: string;
  fallback?: string; // Texte ou emoji de fallback
  size?: number;
}

// Props avec valeurs par défaut
const props = withDefaults(defineProps<Props>(), {
  alt: "Avatar",
  fallback: "👤",
  size: 12
});

const imageError = ref(false);

// Méthodes
const handleImageError = () => {
  imageError.value = true;
};

// Computed pour déterminer ce qui doit être affiché
const shouldShowImage = computed(() => props.src && !imageError.value);
const shouldShowFallback = computed(() => !shouldShowImage.value);
</script>

<template>
  <div class="rounded-full overflow-hidden" :style="`width: calc(var(--spacing) * ${props.size}); height: calc(var(--spacing) * ${props.size})`" v-tw-merge>
    <!-- Image -->
    <img v-if="shouldShowImage" :src="src" :alt="alt" fetchpriority="high" @error="handleImageError" :style="`width: calc(var(--spacing) * ${props.size}); height: calc(var(--spacing) * ${props.size})`" class="object-cover rounded-full" />

    <!-- Fallback -->
    <span v-else-if="shouldShowFallback" class="font-medium text-center size-full">
      <slot name="fallback">
        <div class="flex items-center justify-center bg-ink-700 text-foam-50 size-full">
          <span class="font-bold text-lg">
            {{ fallback }}
          </span>
        </div>
      </slot>
    </span>

    <!-- Slot pour contenu personnalisé -->
    <slot v-if="!src && !fallback" />

    <!-- Slot pour overlay (badges, etc.) -->
    <slot name="overlay" />
  </div>
</template>
