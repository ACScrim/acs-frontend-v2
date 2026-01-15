<script setup lang="ts">
interface Props {
  index?: number;
}

withDefaults(defineProps<Props>(), {
  index: 0,
});
</script>

<template>
  <div
    class="w-[250px] h-[378px] bg-gradient-to-br from-foam-900 to-foam-950 border-2 border-dashed border-foam-700 rounded-lg flex items-center justify-center cursor-default hover:border-foam-600 transition-colors"
  >
    <div class="text-center">
      <img src="/acs.avif" width="175" height="79" alt="Logo ACS" />
      <p class="text-foam-500 text-sm font-medium">Emplacement vide</p>
      <p class="text-foam-600 text-xs">#{{ String(index+1).padStart(3, '0') }}</p>
    </div>
  </div>
</template>

<style scoped>
/* Ajout d'une légère animation au survol */
div:hover {
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.1);
}
</style>
