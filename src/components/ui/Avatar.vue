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
  <div class="rounded-full" :style="`width: calc(var(--spacing) * ${props.size})`" v-tw-merge>
    <!-- Image -->
    <img v-if="shouldShowImage" :src="src" :alt="alt" @error="handleImageError" :style="`width: calc(var(--spacing) * ${props.size})`" class="object-cover" />

    <!-- Fallback -->
    <span v-else-if="shouldShowFallback" class="font-medium text-center size-full">
      <slot name="fallback">
        <div class="flex items-center justify-center bg-christmas-pine size-full">
          <span class="text-christmas-snow font-bold text-lg">
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
