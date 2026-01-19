<script setup lang="ts">
import { computed } from 'vue';
import { useLoadingState } from '@/composables/useLoadingState';

interface Props {
  loading?: boolean
  useGlobalLoading?: boolean
  iconPosition?: "r" | "l" | "lr"
  to?: string
  class?: string | string[]
  disabled?: boolean
  variant?: keyof typeof variantClasses
  color?: string
  size?: keyof typeof sizeClasses
}


const isExternalLink = (link: string) => link.startsWith('http');

const component = computed(() => {
  if (props.to) {
    if (isExternalLink(props.to)) return 'a';
    return "router-link";    
  };
  return "button";
});

// État global de chargement
const globalLoadingState = useLoadingState();

// Calculer l'état de chargement effectif
const effectiveLoading = computed(() => {
  if (props.loading) return true;
  if (props.useGlobalLoading) return globalLoadingState.isLoading.value;
  return false;
});

const componentProps = computed(() => {
  const baseProps: Record<string, unknown> = {
    disabled: props.disabled || effectiveLoading.value,
  };

  if (props.to) {
     if (isExternalLink(props.to)) {
      baseProps.href = props.to;
     } else {
      baseProps.to = props.to;
    }
  }
  return baseProps;
});


const props = withDefaults(defineProps<Props>(), {
  loading: false,
  useGlobalLoading: true,
  iconPosition: "r",
  to: undefined,
  class: "",
  disabled: false,
  variant: undefined,
  color: undefined,
  size: "md"
});

const variantClasses = {
  primary: "bg-gradient-to-r from-accent-500 to-blush-500 text-ink-900 shadow-[var(--shadow-glow)] hover:brightness-110",
  emerald: "bg-gradient-to-r from-emerald-600 to-emerald-400 text-ink-900 shadow-[var(--shadow-soft)] hover:brightness-110",
  danger: "bg-gradient-to-r from-red-500 via-red-400 to-red-500 text-white shadow-[0_25px_45px_rgba(255,95,143,0.35)]",
  secondary: "bg-white/5 text-white border border-white/10 hover:bg-white/10",
  outline: "border border-white/20 text-white hover:border-accent-400 hover:text-accent-200",
  ghost: "text-foam-200 hover:text-white hover:bg-white/5"
} as const;

const sizeClasses = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3",
  lg: "px-8 py-4 text-lg"
} as const;

const legacyColorToVariant: Record<string, keyof typeof variantClasses> = {
  gold: 'primary',
  red: 'danger',
  green: 'emerald',
  navy: 'secondary',
  ice: 'outline'
};

const appliedVariant = computed<keyof typeof variantClasses>(() => {
  if (props.variant && variantClasses[props.variant]) {
    return props.variant;
  }
  const normalizedColor = props.color?.replace(/^(christmas-|holiday-)/, '');
  if (normalizedColor && legacyColorToVariant[normalizedColor]) {
    return legacyColorToVariant[normalizedColor];
  }
  return 'primary';
});
</script>

<template>
  <component 
    :is="component"
    v-bind="componentProps"
    class="cursor-pointer inline-flex items-center justify-center gap-2 rounded-[var(--radius-lg)] font-semibold tracking-wide transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
    :class="`${variantClasses[appliedVariant]} ${sizeClasses[props.size]} ${props.class}`"
    v-tw-merge
  >
    <!-- Loading spinner -->
    <svg
      v-if="effectiveLoading"
      class="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>

    <!-- Icône gauche -->
    <span
      v-if="$slots.icon && iconPosition !== 'r' && !effectiveLoading"
      class="mr-2"
    >
      <slot name="icon"></slot>
    </span>

    <!-- Contenu du slot -->
    <slot></slot>

    <!-- Icône droite -->
    <span
      v-if="$slots.icon && iconPosition !== 'l' && !effectiveLoading"
      class="ml-2"
    >
      <slot name="icon"></slot>
    </span>
  </component>
</template>