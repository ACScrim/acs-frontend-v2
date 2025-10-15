<template>
  <span>
    <slot>
      <!-- Contenu par défaut si aucun slot -->
      <span v-if="$slots.default === undefined">Badge</span>
    </slot>
  </span>
</template>
