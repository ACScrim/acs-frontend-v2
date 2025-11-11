<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  loading?: boolean
  iconPosition?: "r" | "l" | "lr"
  to?: string
  class?: string | string[]
  disabled?: boolean
  color?: keyof typeof bgColorClasses
  shadowColor?: string
}


const isExternalLink = (link: string) => link.startsWith('http');

const component = computed(() => {
  if (props.to) {
    if (isExternalLink(props.to)) return 'a';
    return "router-link";    
  };
  return "button";
});

const componentProps = computed(() => {
  const baseProps: any = {
    class: props.class,
    disabled: props.disabled || props.loading,
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
  iconPosition: "r",
  to: undefined,
  class: "",
  disabled: false,
  color: "christmas-gold"
});

const bgColorClasses: Record<string, string> = {
  'christmas-gold': "bg-gradient-to-r from-christmas-gold to-christmas-gold-light not-disabled:hover:from-christmas-pine not-disabled:hover:to-christmas-forest",
  'christmas-red': "bg-gradient-to-r from-christmas-red to-christmas-crimson not-disabled:hover:from-christmas-crimson not-disabled:hover:to-christmas-red",
  'christmas-green': "bg-gradient-to-r from-christmas-pine to-christmas-forest not-disabled:hover:from-christmas-forest not-disabled:hover:to-christmas-pine",
  'christmas-navy': "bg-gradient-to-r from-christmas-navy to-christmas-midnight not-disabled:hover:from-christmas-gold not-disabled:hover:to-christmas-gold-light",
  'christmas-ice': "bg-gradient-to-r from-christmas-ice to-christmas-snow not-disabled:hover:from-christmas-gold not-disabled:hover:to-christmas-gold-light",
}

const borderColorClasses: Record<string, string> = {
  'christmas-gold': "border-christmas-gold not-disabled:hover:border-christmas-forest",
  'christmas-red': "border-christmas-red not-disabled:hover:border-christmas-crimson",
  'christmas-green': "border-christmas-pine not-disabled:hover:border-christmas-forest",
  'christmas-navy': "border-christmas-navy not-disabled:hover:border-christmas-gold",
  'christmas-ice': "border-christmas-ice not-disabled:hover:border-christmas-gold",
}

const textColorClasses: Record<string, string> = {
  'christmas-gold': "text-christmas-navy not-disabled:hover:text-christmas-snow",
  'christmas-red': "text-christmas-snow",
  'christmas-green': "text-christmas-snow",
  'christmas-navy': "text-christmas-gold-light not-disabled:hover:text-christmas-gold",
  'christmas-ice': "text-christmas-navy not-disabled:hover:text-christmas-navy",
}
</script>

<template>
  <component 
    :is="component"
    v-bind="componentProps"
    class="cursor-pointer flex flex-row rounded-xl py-4 px-8 items-center justify-center shadow-lg not-disabled:hover:shadow-xl transition-all w-fit border-2 gap-2 font-bold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
    :class="`${bgColorClasses[props.color]} ${borderColorClasses[props.color]} ${textColorClasses[props.color]} ${props.class}`"
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