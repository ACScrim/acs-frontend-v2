<script setup lang="ts">
import { computed } from "vue";
import type { BadgeProps } from "@/types/ui";
import { useUIClasses } from "@/composables/useUIClasses";

// Props avec valeurs par défaut
const props = withDefaults(defineProps<BadgeProps>(), {
  variant: "solid",
  size: "sm",
  color: "primary",
  rounded: true,
  pulsing: false,
});

// Composable pour les classes
const { getAnimationClasses } = useUIClasses();

// Classes calculées
const badgeClasses = computed(() => {
  const baseClasses = [
    "inline-flex items-center justify-center",
    "font-medium",
    "transition-all duration-200",
    "select-none",
  ];

  // Tailles
  const sizeClasses = {
    xs: ["text-xs", "px-1.5", "py-0.5", "min-w-[1rem]", "h-4"],
    sm: ["text-xs", "px-2", "py-1", "min-w-[1.25rem]", "h-5"],
    md: ["text-sm", "px-2.5", "py-1", "min-w-[1.5rem]", "h-6"],
    lg: ["text-sm", "px-3", "py-1.5", "min-w-[1.75rem]", "h-7"],
    xl: ["text-base", "px-3", "py-2", "min-w-[2rem]", "h-8"],
  };

  // Bordure arrondie
  const roundedClasses = props.rounded
    ? props.variant === "dot"
      ? "rounded-full"
      : "rounded-full"
    : "rounded-md";

  // Couleurs selon le variant et la couleur
  const colorClasses = {
    primary: {
      solid: [
        "bg-[var(--acs-primary-500)]",
        "text-white",
        "shadow-[var(--acs-shadow-primary)]",
      ],
      outline: [
        "border border-[var(--acs-primary-500)]",
        "text-[var(--acs-primary-500)]",
        "bg-transparent",
      ],
      soft: [
        "bg-[var(--acs-primary-50)] dark:bg-[var(--acs-primary-950)]",
        "text-[var(--acs-primary-700)] dark:text-[var(--acs-primary-300)]",
      ],
      dot: ["bg-[var(--acs-primary-500)]"],
    },
    secondary: {
      solid: ["bg-[var(--acs-secondary-500)]", "text-white"],
      outline: [
        "border border-[var(--acs-secondary-500)]",
        "text-[var(--acs-secondary-500)]",
        "bg-transparent",
      ],
      soft: [
        "bg-[var(--acs-secondary-50)] dark:bg-[var(--acs-secondary-950)]",
        "text-[var(--acs-secondary-700)] dark:text-[var(--acs-secondary-300)]",
      ],
      dot: ["bg-[var(--acs-secondary-500)]"],
    },
    success: {
      solid: ["bg-[var(--acs-success-500)]", "text-white"],
      outline: [
        "border border-[var(--acs-success-500)]",
        "text-[var(--acs-success-500)]",
        "bg-transparent",
      ],
      soft: [
        "bg-[var(--acs-success-50)] dark:bg-[var(--acs-success-950)]",
        "text-[var(--acs-success-700)] dark:text-[var(--acs-success-300)]",
      ],
      dot: ["bg-[var(--acs-success-500)]"],
    },
    warning: {
      solid: ["bg-[var(--acs-warning-500)]", "text-white"],
      outline: [
        "border border-[var(--acs-warning-500)]",
        "text-[var(--acs-warning-500)]",
        "bg-transparent",
      ],
      soft: [
        "bg-[var(--acs-warning-50)] dark:bg-[var(--acs-warning-950)]",
        "text-[var(--acs-warning-700)] dark:text-[var(--acs-warning-300)]",
      ],
      dot: ["bg-[var(--acs-warning-500)]"],
    },
    danger: {
      solid: ["bg-[var(--acs-danger-500)]", "text-white"],
      outline: [
        "border border-[var(--acs-danger-500)]",
        "text-[var(--acs-danger-500)]",
        "bg-transparent",
      ],
      soft: [
        "bg-[var(--acs-danger-50)] dark:bg-[var(--acs-danger-950)]",
        "text-[var(--acs-danger-700)] dark:text-[var(--acs-danger-300)]",
      ],
      dot: ["bg-[var(--acs-danger-500)]"],
    },
    info: {
      solid: ["bg-[var(--acs-accent-500)]", "text-white"],
      outline: [
        "border border-[var(--acs-accent-500)]",
        "text-[var(--acs-accent-500)]",
        "bg-transparent",
      ],
      soft: [
        "bg-[var(--acs-accent-50)] dark:bg-[var(--acs-accent-950)]",
        "text-[var(--acs-accent-700)] dark:text-[var(--acs-accent-300)]",
      ],
      dot: ["bg-[var(--acs-accent-500)]"],
    },
    gray: {
      solid: ["bg-[var(--acs-gray-500)]", "text-white"],
      outline: [
        "border border-[var(--acs-gray-500)]",
        "text-[var(--acs-gray-500)]",
        "bg-transparent",
      ],
      soft: [
        "bg-[var(--acs-gray-50)] dark:bg-[var(--acs-gray-950)]",
        "text-[var(--acs-gray-700)] dark:text-[var(--acs-gray-300)]",
      ],
      dot: ["bg-[var(--acs-gray-500)]"],
    },
  };

  // Animation
  const animationClasses = props.pulsing ? [getAnimationClasses("pulse")] : [];

  // Classes spéciales pour le variant dot
  const dotClasses =
    props.variant === "dot"
      ? ["w-2", "h-2", "p-0", "border-2", "border-white", "shadow-sm"]
      : [];

  return [
    ...baseClasses,
    ...sizeClasses[props.size],
    roundedClasses,
    ...colorClasses[props.color][props.variant],
    ...animationClasses,
    ...dotClasses,
  ].flat();
});

// Conteneur pour les badges avec dot
const containerClasses = computed(() => {
  if (props.variant === "dot") {
    return ["relative", "inline-flex"];
  }
  return [];
});
</script>

<template>
  <span v-if="variant === 'dot'" :class="containerClasses">
    <slot />
    <span :class="badgeClasses" />
  </span>
  <span v-else :class="badgeClasses">
    <slot>
      <!-- Contenu par défaut si aucun slot -->
      <span v-if="$slots.default === undefined">Badge</span>
    </slot>
  </span>
</template>
