<script setup lang="ts">
import { computed, ref } from "vue";
import type { AvatarProps } from "@/types/ui";
import { useUIClasses } from "@/composables/useUIClasses";

// Props avec valeurs par défaut
const props = withDefaults(defineProps<AvatarProps>(), {
  size: "md",
  alt: "Avatar",
  fallback: "👤",
  statusPosition: "bottom-right",
  rounded: true,
  bordered: false,
});

// État pour gérer les erreurs d'image
const imageError = ref(false);

// Composable pour les classes
const { getAnimationClasses } = useUIClasses();

// Classes calculées
const avatarClasses = computed(() => {
  const baseClasses = [
    "relative inline-flex items-center justify-center",
    "overflow-hidden",
    "bg-[var(--acs-bg-secondary)]",
    "text-[var(--acs-text-muted)]",
    "transition-all duration-200",
    "select-none",
    "shrink-0",
  ];

  // Tailles
  const sizeClasses = {
    xs: ["w-6", "h-6", "text-xs"],
    sm: ["w-8", "h-8", "text-sm"],
    md: ["w-10", "h-10", "text-base"],
    lg: ["w-12", "h-12", "text-lg"],
    xl: ["w-16", "h-16", "text-xl"],
  };

  // Bordure arrondie
  const roundedClasses = props.rounded ? "rounded-full" : "rounded-lg";

  // Bordure
  const borderClasses = props.bordered
    ? [
        "ring-2",
        "ring-[var(--acs-border-primary)]",
        "ring-offset-2",
        "ring-offset-[var(--acs-bg-primary)]",
      ]
    : [];

  return [
    ...baseClasses,
    ...sizeClasses[props.size],
    roundedClasses,
    ...borderClasses,
  ].flat();
});

const imageClasses = computed(() => [
  "w-full",
  "h-full",
  "object-cover",
  "transition-all duration-200",
]);

const statusClasses = computed(() => {
  if (!props.status) return [];

  const baseClasses = [
    "absolute",
    "rounded-full",
    "border-2",
    "border-[var(--acs-bg-primary)]",
    "transition-all duration-200",
  ];

  // Tailles du status selon la taille de l'avatar
  const statusSizes = {
    xs: ["w-2", "h-2"],
    sm: ["w-2.5", "h-2.5"],
    md: ["w-3", "h-3"],
    lg: ["w-3.5", "h-3.5"],
    xl: ["w-4", "h-4"],
  };

  // Positions
  const positionClasses = {
    "top-right": ["-top-0.5", "-right-0.5"],
    "bottom-right": ["-bottom-0.5", "-right-0.5"],
    "top-left": ["-top-0.5", "-left-0.5"],
    "bottom-left": ["-bottom-0.5", "-left-0.5"],
  };

  // Couleurs selon le status
  const statusColors = {
    online: ["bg-[var(--acs-success-500)]", getAnimationClasses("pulse")],
    offline: ["bg-[var(--acs-gray-400)]"],
    away: ["bg-[var(--acs-warning-500)]"],
    busy: ["bg-[var(--acs-danger-500)]", getAnimationClasses("pulse")],
  };

  return [
    ...baseClasses,
    ...statusSizes[props.size],
    ...positionClasses[props.statusPosition],
    ...statusColors[props.status],
  ].flat();
});

// Méthodes
const handleImageError = () => {
  imageError.value = true;
};

// Computed pour déterminer ce qui doit être affiché
const shouldShowImage = computed(() => props.src && !imageError.value);
const shouldShowFallback = computed(() => !shouldShowImage.value);
</script>

<template>
  <div :class="avatarClasses">
    <!-- Image -->
    <img
      v-if="shouldShowImage"
      :src="src"
      :alt="alt"
      :class="imageClasses"
      @error="handleImageError"
    />

    <!-- Fallback -->
    <span v-else-if="shouldShowFallback" class="font-medium text-center">
      <slot name="fallback">{{ fallback }}</slot>
    </span>

    <!-- Slot pour contenu personnalisé -->
    <slot v-if="!src && !fallback" />

    <!-- Status indicator -->
    <span v-if="status" :class="statusClasses" :title="`Status: ${status}`" />

    <!-- Slot pour overlay (badges, etc.) -->
    <slot name="overlay" />
  </div>
</template>
