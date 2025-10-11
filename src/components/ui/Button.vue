<script setup lang="ts">
import { computed } from "vue";
import type { ButtonProps } from "@/types/ui";
import { useUIClasses } from "@/composables/useUIClasses";

interface Props extends ButtonProps {
  type?: "button" | "submit" | "reset";
  href?: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
  to?: string; // Pour Vue Router
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
  color: "primary",
  variant: "solid",
  type: "button",
  disabled: false,
  loading: false,
  fullWidth: false,
  rounded: false,
  iconPosition: "left",
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const { getButtonClasses } = useUIClasses();

// Classes calculées
const buttonClasses = computed(() =>
  getButtonClasses(
    props.size,
    props.color,
    props.variant,
    props.rounded,
    props.fullWidth
  )
);

// Détermine le tag à utiliser (button, a, router-link)
const component = computed(() => {
  if (props.href) return "a";
  if (props.to) return "router-link";
  return "button";
});

// Props pour le composant
const componentProps = computed(() => {
  const baseProps: any = {
    class: buttonClasses.value,
    disabled: props.disabled || props.loading,
  };

  if (props.href) {
    baseProps.href = props.href;
    baseProps.target = props.target;
  } else if (props.to) {
    baseProps.to = props.to;
  } else {
    baseProps.type = props.type;
  }

  return baseProps;
});

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit("click", event);
  }
};
</script>

<template>
  <component
    :is="component"
    v-bind="componentProps"
    @click="handleClick"
    class="cursor-pointer"
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
      v-if="$slots.icon && iconPosition === 'left' && !loading"
      class="mr-2"
    >
      <slot name="icon"></slot>
    </span>

    <!-- Contenu du slot -->
    <slot></slot>

    <!-- Icône droite -->
    <span
      v-if="$slots.icon && iconPosition === 'right' && !loading"
      class="ml-2"
    >
      <slot name="icon"></slot>
    </span>
  </component>
</template>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
