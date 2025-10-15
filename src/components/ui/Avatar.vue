<script setup lang="ts">
import { computed, ref } from "vue";

interface Props {
  src?: string;
  alt?: string;
  fallback?: string; // Texte ou emoji de fallback
}

// Props avec valeurs par défaut
const props = withDefaults(defineProps<Props>(), {
  alt: "Avatar",
  fallback: "👤"
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
  <div>
    <!-- Image -->
    <img
      v-if="shouldShowImage"
      :src="src"
      :alt="alt"
      @error="handleImageError"
      class="size-12"
    />

    <!-- Fallback -->
    <span v-else-if="shouldShowFallback" class="font-medium text-center">
      <slot name="fallback">{{ fallback }}</slot>
    </span>

    <!-- Slot pour contenu personnalisé -->
    <slot v-if="!src && !fallback" />

    <!-- Slot pour overlay (badges, etc.) -->
    <slot name="overlay" />
  </div>
</template>
