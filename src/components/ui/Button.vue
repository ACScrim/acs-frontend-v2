<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  loading?: boolean
  iconPosition?: "r" | "l" | "lr"
  to?: string
  class?: string
  disabled?: boolean
  color?: keyof typeof colorClasses
}

const component = computed(() => {
  if (props.to) return "router-link";
  return "button";
});

const componentProps = computed(() => {
  const baseProps: any = {
    class: props.class,
    disabled: props.disabled || props.loading,
  };

  if (props.to) {
    baseProps.to = props.to;
  }

  return baseProps;
});


const props = withDefaults(defineProps<Props>(), {
  loading: false,
  iconPosition: "r",
  to: undefined,
  class: "",
  disabled: false,
  color: "acs-orange-light"
});

const colorClasses: Record<string, string> = {
  'acs-red': "bg-acs-red/85 border-acs-red",
  'acs-purple': "bg-acs-purple/85 border-acs-purple",
  'acs-yellow': "bg-acs-yellow/85 border-acs-yellow",
  'acs-orange-light': "bg-acs-orange-light/85 border-acs-orange-light",
  'acs-orange-dark': "bg-acs-orange-dark/85 border-acs-orange-dark"
}

</script>

<template>
  <component 
    :is="component"
    v-bind="componentProps"
    class="cursor-pointer flex flex-row rounded-xl py-4 px-8 items-center justify-center shadow-acs-button hover:shadow-sm transition-all w-fit"
    :class="`${colorClasses[props.color]} ${props.class}`"
    :style="`--tw-shadow-color: var(--color-${props.color})`"
    v-tw-merge
  >
    <!-- Loading spinner -->
    <svg
      v-if="loading"
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
      v-if="$slots.icon && iconPosition !== 'r' && !loading"
      class="mr-2"
    >
      <slot name="icon"></slot>
    </span>

    <!-- Contenu du slot -->
    <slot></slot>

    <!-- Icône droite -->
    <span
      v-if="$slots.icon && iconPosition !== 'l' && !loading"
      class="ml-2"
    >
      <slot name="icon"></slot>
    </span>
  </component>
</template>