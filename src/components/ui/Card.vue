<script setup lang="ts">

const props = withDefaults(defineProps<{ cardClasses?: string, color?: string, shadowColor?: string }>(), {
  cardClasses: "",
  color: "acs-orange-dark",
  shadowColor: undefined
});

const colorClasses: Record<string, string> = {
  'acs-red': "bg-acs-red/75",
  'acs-purple': "bg-acs-purple/75",
  'acs-yellow': "bg-acs-yellow/75",
  'acs-orange-light': "bg-acs-orange-light/75",
  'acs-orange-dark': "bg-acs-orange-dark/75"
}

const borderColorClasses: Record<string, string> = {
  'acs-red': "border-acs-red",
  'acs-purple': "border-acs-purple",
  'acs-yellow': "border-acs-yellow",
  'acs-orange-light': "border-acs-orange-light",
  'acs-orange-dark': "border-acs-orange-dark",
  'black': "border-black"
}
</script>

<template>
  <div 
    class="text-white rounded-xl border-2 shadow-acs-card" 
    :class="`${colorClasses[props.color]} ${borderColorClasses[props.shadowColor || props.color]} ${props.cardClasses}`" 
    :style="`--tw-shadow-color: var(--color-${props.shadowColor || props.color})`" v-tw-merge
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
