<script setup lang="ts">

import VueIcon from "@kalimahapps/vue-icons/VueIcon";

defineProps({
  currentCategoryIndex: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  currentCategory: {
    type: Object as () => { categoryName: string } | null,
    required: false,
    default: null,
  },
  searchText: {
    type: String,
    required: false,
    default: '',
  },
  filteredCards: {
    type: Array as () => any[],
    required: false,
    default: () => [],
  },
});

const emit = defineEmits<{
  'go-to-previous-category': [void];
  'go-to-next-category': [void];
}>();
const goToPreviousCategory = () => {
  emit('go-to-previous-category');
};
const goToNextCategory = () => {
  emit('go-to-next-category');
};

</script>

<template>
  <div class="glass-panel flex items-center justify-between gap-4 px-4 py-3">
    <!-- Bouton Précédent -->
    <button
      @click="goToPreviousCategory"
      class="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-700/60 hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed text-foam-50 transition-all duration-200 font-medium text-sm disabled:hover:bg-surface-700/60"
    >
      <VueIcon name="io:sharp-chevron-back" size="18" />
      <span class="hidden sm:inline">Précédent</span>
    </button>

    <!-- Indicateur de page et catégorie -->
    <div class="text-center flex-1 min-w-0">
      <div class="flex items-center justify-center gap-1 text-xs text-foam-400/80 mb-1">
        <span>Page</span>
        <span class="font-semibold text-foam-200">{{ currentCategoryIndex + 1 }}</span>
        <span>/</span>
        <span class="font-semibold text-foam-200">{{ totalPages }}</span>
      </div>
      <div class="text-sm font-medium text-foam-100 truncate px-2">
        {{ currentCategory?.categoryName }}
      </div>
      <transition name="fade" mode="out-in">
        <div v-if="searchText" :key="searchText" class="text-xs text-emerald-400/80 mt-1">
          {{ filteredCards?.length ?? 0 }} résultat{{ (filteredCards?.length ?? 0) > 1 ? 's' : '' }}
        </div>
      </transition>
    </div>

    <!-- Bouton Suivant -->
    <button
      @click="goToNextCategory"
      class="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-700/60 hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed text-foam-50 transition-all duration-200 font-medium text-sm disabled:hover:bg-surface-700/60"
    >
      <span class="hidden sm:inline">Suivant</span>
      <VueIcon name="io:sharp-chevron-forward" size="18" />
    </button>
  </div>
</template>
<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 150ms ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
