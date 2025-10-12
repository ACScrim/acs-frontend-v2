<script setup lang="ts">

const props = withDefaults(defineProps<{ cardClasses?: string, color?: string }>(), {
  cardClasses: "",
  color: "acs-orange-dark"
});

const colorClasses: Record<string, string> = {
  'acs-red': "bg-acs-red/75 border-acs-red",
  'acs-purple': "bg-acs-purple/75 border-acs-purple",
  'acs-yellow': "bg-acs-yellow/75 border-acs-yellow",
  'acs-orange-light': "bg-acs-orange-light/75 border-acs-orange-light",
  'acs-orange-dark': "bg-acs-orange-dark/75 border-acs-orange-dark"
}
</script>

<template>
  <div 
    class="text-white rounded-xl border-2 shadow-acs-card" 
    :class="`${colorClasses[props.color]} ${props.cardClasses}`" 
    :style="`--tw-shadow-color: var(--color-${props.color})`" v-tw-merge
  >
    <!-- Header slot -->
    <header v-if="$slots.header" class="mb-4">
      <slot name="header" />
    </header>

    <!-- Contenu principal -->
    <slot />

    <!-- Footer slot -->
    <footer v-if="$slots.footer" class="mt-4">
      <slot name="footer" />
    </footer>
  </div>
</template>
