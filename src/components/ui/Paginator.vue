<script setup lang="ts">
import { computed } from 'vue';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';

interface Props {
  total: number;
  itemsPerPage?: number;
  currentPage?: number;
  maxVisiblePages?: number;
}

const props = withDefaults(defineProps<Props>(), {
  itemsPerPage: 10,
  currentPage: 1,
  maxVisiblePages: 5,
});

const emit = defineEmits<{
  'update:currentPage': [page: number];
  'paginate': [{ limit: number; offset: number }];
}>();

const totalPages = computed(() => Math.ceil(props.total / props.itemsPerPage));

const currentPageComputed = computed({
  get: () => props.currentPage,
  set: (value: number) => {
    if (value >= 1 && value <= totalPages.value) {
      emit('update:currentPage', value);
      emit('paginate', {
        limit: props.itemsPerPage,
        offset: (value - 1) * props.itemsPerPage,
      });
    }
  },
});

const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const halfVisible = Math.floor(props.maxVisiblePages / 2);

  let startPage = Math.max(1, currentPageComputed.value - halfVisible);
  let endPage = Math.min(totalPages.value, startPage + props.maxVisiblePages - 1);

  if (endPage - startPage < props.maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - props.maxVisiblePages + 1);
  }

  if (startPage > 1) {
    pages.push(1);
    if (startPage > 2) {
      pages.push('...');
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (endPage < totalPages.value) {
    if (endPage < totalPages.value - 1) {
      pages.push('...');
    }
    pages.push(totalPages.value);
  }

  return pages;
});

const canGoPrevious = computed(() => currentPageComputed.value > 1);
const canGoNext = computed(() => currentPageComputed.value < totalPages.value);

const goToPage = (page: number | string) => {
  if (typeof page === 'number') {
    currentPageComputed.value = page;
  }
};

const goToPrevious = () => {
  if (canGoPrevious.value) {
    currentPageComputed.value = currentPageComputed.value - 1;
  }
};

const goToNext = () => {
  if (canGoNext.value) {
    currentPageComputed.value = currentPageComputed.value + 1;
  }
};
</script>

<template>
  <div class="flex items-center justify-center gap-2 flex-wrap">
    <!-- Bouton Précédent -->
    <button
      @click="goToPrevious"
      :disabled="!canGoPrevious"
      class="px-3 py-2 rounded-lg border border-white/10 text-foam-100 hover:text-white hover:border-accent-300 hover:bg-accent-300/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      :title="canGoPrevious ? 'Page précédente' : 'Vous êtes à la première page'"
    >
      <VueIcon name="bs:chevron-left" class="text-xl" />
    </button>

    <!-- Numéros de page -->
    <div class="flex items-center gap-1">
      <button
        v-for="(page, index) in visiblePages"
        :key="`${page}-${index}`"
        @click="goToPage(page)"
        :disabled="page === '...'"
        :class="[
          'px-3 py-2 rounded-lg border transition-all duration-200',
          page === currentPageComputed
            ? 'bg-gradient-to-r from-accent-500 to-emerald-500 text-ink-900 border-transparent font-bold shadow-[0_10px_30px_rgba(6,182,212,0.25)]'
            : page === '...'
            ? 'border-transparent text-foam-400 cursor-default'
            : 'border-white/10 text-foam-100 hover:text-white hover:border-accent-300 hover:bg-accent-300/10'
        ]"
      >
        {{ page }}
      </button>
    </div>

    <!-- Bouton Suivant -->
    <button
      @click="goToNext"
      :disabled="!canGoNext"
      class="px-3 py-2 rounded-lg border border-white/10 text-foam-100 hover:text-white hover:border-accent-300 hover:bg-accent-300/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      :title="canGoNext ? 'Page suivante' : 'Vous êtes à la dernière page'"
    >
      <VueIcon name="bs:chevron-right" class="text-xl" />
    </button>

    <!-- Informations de pagination -->
    <div class="text-foam-200 text-sm ml-4">
      Page {{ currentPageComputed }} sur {{ totalPages }}
    </div>
  </div>
</template>

<style scoped>
button:disabled {
  pointer-events: none;
}
</style>