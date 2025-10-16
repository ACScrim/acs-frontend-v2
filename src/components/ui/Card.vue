<script setup lang="ts">
const props = withDefaults(defineProps<{ cardClasses?: string, color?: string, shadowColor?: string }>(), {
  cardClasses: "",
  color: "acs-orange-dark",
  shadowColor: undefined
});

const colorClasses: Record<string, string> = {
  'navy': "bg-christmas-navy",
  'midnight': "bg-christmas-midnight",
  'gold': "bg-christmas-gold",
  'gold-light': "bg-christmas-gold-light",
  'crimson': "bg-christmas-crimson",
  'red': "bg-christmas-red",
  'pine': "bg-christmas-pine",
  'forest': "bg-christmas-forest",
  'snow': "bg-christmas-snow",
  'silver': "bg-christmas-silver",
  'ice': "bg-christmas-ice"
}

const borderColorClasses: Record<string, string> = {
  'acs-red': "border-acs-red",
  'acs-purple': "border-acs-purple",
  'acs-yellow': "border-acs-yellow",
  'acs-orange-light': "border-acs-orange-light",
  'acs-orange-dark': "border-acs-orange-dark",
  'black': "border-black",
  'white': "border-white",
}
</script>

<template>
  <div 
    class="text-white rounded-xl border-christmas-lights" 
    :class="`${colorClasses[props.color]} ${props.cardClasses}`" 
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
