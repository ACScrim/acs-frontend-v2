<script setup lang="ts">
import { computed } from "vue";
import type { ProgressProps } from "@/types/ui";
import { useUIClasses } from "@/composables/useUIClasses";

// Props avec valeurs par défaut
const props = withDefaults(defineProps<ProgressProps>(), {
  value: 0,
  max: 100,
  size: "md",
  color: "primary",
  variant: "linear",
  animated: false,
  striped: false,
  showPercentage: false,
});

// Composable pour les classes
const { getGradientClasses, getAnimationClasses } = useUIClasses();

// Calculs
const percentage = computed(() => {
  const percent = Math.min(Math.max((props.value / props.max) * 100, 0), 100);
  return Math.round(percent);
});

const isComplete = computed(() => percentage.value >= 100);

// Classes pour la barre linéaire
const linearClasses = computed(() => {
  const baseClasses = [
    "relative overflow-hidden",
    "bg-[var(--acs-bg-secondary)]",
    "border border-[var(--acs-border-secondary)]",
    "rounded-full",
  ];

  // Tailles
  const sizeClasses = {
    xs: ["h-1"],
    sm: ["h-2"],
    md: ["h-3"],
    lg: ["h-4"],
    xl: ["h-6"],
  };

  return [...baseClasses, ...sizeClasses[props.size]];
});

const progressBarClasses = computed(() => {
  const baseClasses = [
    "h-full",
    "rounded-full",
    "transition-all duration-500 ease-out",
    "relative overflow-hidden",
  ];

  // Couleurs
  const colorClasses = {
    primary: ["bg-[var(--acs-primary-500)]"],
    secondary: ["bg-[var(--acs-secondary-500)]"],
    success: ["bg-[var(--acs-success-500)]"],
    warning: ["bg-[var(--acs-warning-500)]"],
    danger: ["bg-[var(--acs-danger-500)]"],
    info: ["bg-[var(--acs-accent-500)]"],
    gray: ["bg-[var(--acs-gray-500)]"],
  };

  // Animations
  const animationClasses = [];
  if (props.animated) {
    animationClasses.push(getAnimationClasses("pulse"));
  }

  // Rayures
  const stripedClasses = props.striped
    ? [
        "bg-gradient-to-r",
        "from-transparent",
        "via-white/20",
        "to-transparent",
        "bg-[length:20px_100%]",
        props.animated ? "animate-[shimmer_2s_linear_infinite]" : "",
      ]
    : [];

  // Gradient gaming pour primary
  const gradientClasses =
    props.color === "primary" && isComplete.value
      ? [getGradientClasses("gaming")]
      : colorClasses[props.color];

  return [
    ...baseClasses,
    ...gradientClasses,
    ...animationClasses,
    ...stripedClasses,
  ].flat();
});

// Classes pour la barre circulaire
const circularClasses = computed(() => {
  const sizeClasses = {
    xs: ["w-8", "h-8"],
    sm: ["w-12", "h-12"],
    md: ["w-16", "h-16"],
    lg: ["w-20", "h-20"],
    xl: ["w-24", "h-24"],
  };

  return [
    "relative",
    "inline-flex",
    "items-center",
    "justify-center",
    ...sizeClasses[props.size],
  ];
});

// Paramètres SVG pour le cercle
const circularParams = computed(() => {
  const sizes = {
    xs: { radius: 12, strokeWidth: 2 },
    sm: { radius: 18, strokeWidth: 3 },
    md: { radius: 24, strokeWidth: 4 },
    lg: { radius: 30, strokeWidth: 5 },
    xl: { radius: 36, strokeWidth: 6 },
  };

  const { radius, strokeWidth } = sizes[props.size];
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage.value / 100) * circumference;

  return {
    radius,
    strokeWidth,
    circumference,
    offset,
    center: radius + strokeWidth,
    viewBox: `0 0 ${(radius + strokeWidth) * 2} ${(radius + strokeWidth) * 2}`,
  };
});

// Couleurs pour le SVG
const strokeColor = computed(() => {
  const colors = {
    primary: "var(--acs-primary-500)",
    secondary: "var(--acs-secondary-500)",
    success: "var(--acs-success-500)",
    warning: "var(--acs-warning-500)",
    danger: "var(--acs-danger-500)",
    info: "var(--acs-accent-500)",
    gray: "var(--acs-gray-500)",
  };
  return colors[props.color];
});
</script>

<template>
  <div class="w-full">
    <!-- Label -->
    <div
      v-if="label || showPercentage"
      class="flex items-center justify-between mb-2"
    >
      <span
        v-if="label"
        class="text-sm font-medium text-[var(--acs-text-primary)]"
      >
        {{ label }}
      </span>
      <span
        v-if="showPercentage"
        class="text-sm font-medium text-[var(--acs-text-secondary)]"
        :class="{
          'acs-text-gradient-primary': isComplete,
        }"
      >
        {{ percentage }}%
      </span>
    </div>

    <!-- Barre de progression linéaire -->
    <div v-if="variant === 'linear'" :class="linearClasses">
      <div :class="progressBarClasses" :style="{ width: `${percentage}%` }">
        <!-- Effet de brillance pour le gaming -->
        <div
          v-if="color === 'primary' && animated"
          class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_linear_infinite]"
        />
      </div>

      <!-- Slot pour contenu superposé -->
      <slot name="overlay" />
    </div>

    <!-- Barre de progression circulaire -->
    <div v-else-if="variant === 'circular'" :class="circularClasses">
      <svg
        :width="circularParams.center * 2"
        :height="circularParams.center * 2"
        :viewBox="circularParams.viewBox"
        class="transform -rotate-90"
      >
        <!-- Cercle de fond -->
        <circle
          :cx="circularParams.center"
          :cy="circularParams.center"
          :r="circularParams.radius"
          :stroke-width="circularParams.strokeWidth"
          stroke="var(--acs-border-secondary)"
          fill="transparent"
        />

        <!-- Cercle de progression -->
        <circle
          :cx="circularParams.center"
          :cy="circularParams.center"
          :r="circularParams.radius"
          :stroke-width="circularParams.strokeWidth"
          :stroke="strokeColor"
          :stroke-dasharray="circularParams.circumference"
          :stroke-dashoffset="circularParams.offset"
          stroke-linecap="round"
          fill="transparent"
          class="transition-all duration-500 ease-out"
          :class="{
            'animate-pulse': animated,
          }"
        />
      </svg>

      <!-- Contenu central -->
      <div class="absolute inset-0 flex items-center justify-center">
        <slot>
          <span
            v-if="showPercentage"
            class="text-sm font-bold text-[var(--acs-text-primary)]"
            :class="{
              'acs-text-gradient-primary': isComplete,
            }"
          >
            {{ percentage }}%
          </span>
        </slot>
      </div>
    </div>

    <!-- Slot pour contenu supplémentaire -->
    <slot name="footer" />
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
