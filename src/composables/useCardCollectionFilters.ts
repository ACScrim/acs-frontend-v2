import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { CollectibleCard } from '@/types/models';

export interface CategoryGroupData {
  categoryId: string;
  categoryName: string;
  totalCards: number;
  ownedCards: {count: number, card: CollectibleCard}[];
}

export interface FilterState {
  currentCategoryIndex: number;
}

export function useCardCollectionFilters(categories: () => CategoryGroupData[]) {
  const router = useRouter();
  const route = useRoute();

  // État des filtres - pagination
  const currentCategoryIndex = ref(
    Math.max(0, Math.min(parseInt(route.query.page as string) || 0, categories().length - 1))
  );

  // Synchroniser avec l'URL
  const setCurrentCategoryIndex = (index: number) => {
    currentCategoryIndex.value = Math.max(0, Math.min(index, categories().length - 1));
    router.push({
      query: {
        page: currentCategoryIndex.value.toString()
      }
    });
  };

  // Catégorie actuelle
  const currentCategory = computed(() => {
    const cats = categories();
    return cats[currentCategoryIndex.value] || null;
  });

  // Navigation
  const goToNextCategory = () => {
    if (currentCategoryIndex.value + 1 < categories().length) {
      setCurrentCategoryIndex(currentCategoryIndex.value + 1);
    } else {
      setCurrentCategoryIndex(0);
    }
  };

  const goToPreviousCategory = () => {
    if (currentCategoryIndex.value > 0) {
      setCurrentCategoryIndex(currentCategoryIndex.value - 1);
    } else {
      setCurrentCategoryIndex(categories().length - 1);
    }
  };

  const goToCategory = (index: number) => {
    setCurrentCategoryIndex(index);
  };

  const canGoNext = computed(() => currentCategoryIndex.value < categories().length - 1);
  const canGoPrevious = computed(() => currentCategoryIndex.value > 0);
  const totalPages = computed(() => categories().length);

  return {
    currentCategoryIndex,
    currentCategory,
    goToNextCategory,
    goToPreviousCategory,
    goToCategory,
    canGoNext,
    canGoPrevious,
    totalPages,
    setCurrentCategoryIndex
  };
}
