<template>
  <div 
    class="glass-panel text-foam-50 rounded-[var(--radius-xl)] shadow-[var(--shadow-soft)] border border-white/5"
    v-tw-merge
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
