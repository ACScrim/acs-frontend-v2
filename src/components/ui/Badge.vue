<template>
  <span class="px-2 rounded-lg">
    <slot>
      <!-- Contenu par défaut si aucun slot -->
      <span v-if="$slots.default === undefined">Badge</span>
    </slot>
  </span>
</template>
