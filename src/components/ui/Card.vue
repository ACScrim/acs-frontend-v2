<template>
  <div 
    class="text-white rounded-xl border-christmas-lights" 
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
