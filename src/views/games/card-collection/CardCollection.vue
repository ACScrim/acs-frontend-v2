<script setup lang="ts">
import useCollectionStore from "@/stores/collectionStore.ts";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import type { CollectibleCard as Card } from "@/types/models";
import { useCardFetchQueue } from "@/composables/useCardFetchQueue.ts";
import { usePerformanceMonitor } from "@/composables/usePerformanceMonitor.ts";
import { useCardCollectionFilters } from "@/composables/useCardCollectionFilters.ts";
import { storeToRefs } from "pinia";
import { useIntersectionObserver } from "@vueuse/core";
import CategoryGroup from "./CategoryGroup.vue";
import VueIcon from "@kalimahapps/vue-icons/VueIcon";
import CollectionPaginator from "@/views/games/card-collection/components/CollectionPaginator.vue";

const collectionStore = useCollectionStore();
const { categoriesOverview, collectionId } = storeToRefs(collectionStore);

// Initialize performance monitoring (only in dev mode)
const isDev = import.meta.env.DEV;
const { fps, memoryUsage } = usePerformanceMonitor({
  enabled: isDev,
  componentName: "CardCollection",
  logInterval: 10000, // Log every 10 seconds
});

// Initialize fetch queue with batching
const fetchQueue = useCardFetchQueue({
  batchSize: 40,
  batchDelay: 150,
  maxConcurrent: 2,
});

// Initialize pagination by category
const {
  currentCategoryIndex,
  currentCategory,
  goToNextCategory,
  goToPreviousCategory,
  totalPages,
} = useCardCollectionFilters(() => categoriesOverview.value);

// Track which cards need full data
const cardsNeedingFullData = ref<Set<string>>(new Set());

// Track active timeouts for cleanup
const activeTimeouts = new Set<number>();

// Search filter state
const searchText = ref("");

// Filter cards based on search text
const filteredCards = computed(() => {
  if (!currentCategory.value?.ownedCards) return [];

  if (!searchText.value.trim()) {
    return currentCategory.value.ownedCards;
  }

  const searchLower = searchText.value.toLowerCase();
  return currentCategory.value.ownedCards.filter((card) => {
    // Rechercher dans le title
    const titleMatch =
      card.card.title?.toLowerCase().includes(searchLower) || false;

    // Rechercher dans les customTexts
    const customTextsMatch =
      card.card.customTexts?.some((text) =>
        text.content?.toLowerCase().includes(searchLower)
      ) || false;

    return titleMatch || customTextsMatch;
  });
});

// Create a card lookup map - built from filtered cards
const cardsMap = computed(() => {
  const map = new Map<string, Card>();
  filteredCards.value.forEach((card) => map.set(card.card.id, card.card));
  return map;
});

const queueProcessInterval = ref<number | null>(null);

onMounted(async () => {
  // Charger les catégories avec les stats totales
  await collectionStore.fetchCategoriesOverview();

  queueProcessInterval.value = setInterval(() => {
    // Process queue if not busy
    if (!fetchQueue.processing.value && fetchQueue.activeRequests.value === 0) {
      fetchQueue
        .processBatch(async (cardId) => {
          try {
            await collectionStore.fetchFullCard(collectionId.value, cardId);
            cardsNeedingFullData.value.delete(cardId);
          } catch (error) {
            console.error("Error loading card:", cardId, error);
          }
        })
        .catch((error) => {
          console.error("Error processing visible card batch:", error);
        });
    }
  }, 1000);
});

onUnmounted(() => {
  fetchQueue.clear();
  // Clear all pending timeouts
  activeTimeouts.forEach((id) => clearTimeout(id));
  activeTimeouts.clear();
  if (queueProcessInterval.value !== null) {
    clearInterval(queueProcessInterval.value);
    queueProcessInterval.value = null;
  }
});

// Handle when card becomes visible in viewport
const handleItemVisible = (card: Card) => {
  if (!card.frontAsset && collectionId.value) {
    cardsNeedingFullData.value.add(card.id);
    // Add to queue with lower priority (just visible, not hovered)
    fetchQueue.enqueue(card.id, 1);
  }
};

const mainContainer = ref<HTMLElement>();

// Observe cards when container is mounted or updated
const observeCards = () => {
  if (!mainContainer.value) return;

  const cardElements = mainContainer.value.querySelectorAll("[data-card-id]");
  cardElements.forEach((element) => {
    useIntersectionObserver(
      element as HTMLElement,
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardId = (entry.target as HTMLElement).getAttribute(
              "data-card-id"
            );
            if (cardId) {
              const card = cardsMap.value.get(cardId);
              if (card) {
                handleItemVisible(card);
              }
            }
          }
        });
      },
      {
        threshold: 0.1,
      }
    );
  });
};

// Watch for container changes and re-observe
watch(mainContainer, (newContainer) => {
  if (newContainer) {
    // Small delay to ensure DOM is ready
    const timeout = window.setTimeout(observeCards, 100);
    activeTimeouts.add(timeout);
  }
});

// Watch category changes
watch(
  () => currentCategoryIndex,
  () => {
    // Small delay to ensure DOM is ready
    const timeout = window.setTimeout(observeCards, 100);
    activeTimeouts.add(timeout);
  }
);
</script>

<template>
  <div class="flex flex-col gap-5 h-full">
    <!-- Performance indicator (dev only) -->
    <div
      v-if="isDev"
      class="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded-lg z-50 font-mono"
    >
      <div>FPS: {{ fps }}</div>
      <div v-if="memoryUsage">Memory: {{ memoryUsage }}MB</div>
      <div>Queue: {{ fetchQueue.queue.value.length }}</div>
      <div>Active: {{ fetchQueue.activeRequests.value }}</div>
    </div>

    <!-- En-tête et titre -->
    <div class="text-center space-y-3 mb-8">
      <h1
        class="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-azure-400 to-accent-400 bg-clip-text text-transparent"
      >
        Ma collection de cartes
      </h1>
      <p class="text-foam-300 text-lg">
        Explorez et collectionnez vos cartes préférées
      </p>
    </div>

    <div class="space-y-4">
      <!-- Filtre de recherche -->
      <div class="flex gap-3 items-end">
        <div class="flex-1 space-y-2">
          <label class="form-label text-xs">Recherche</label>
          <div class="relative">
            <VueIcon
              name="io:sharp-search"
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-foam-400/50 pointer-events-none"
              size="16"
            />
            <input
              v-model="searchText"
              type="text"
              placeholder="Titre, contenu..."
              class="form-input pl-10 text-sm"
            />
          </div>
        </div>
        <transition name="slide-fade" mode="out-in">
          <button
            v-if="searchText"
            key="clear"
            @click="searchText = ''"
            class="px-3 py-2 rounded-lg bg-surface-700/60 hover:bg-surface-700 text-foam-50 transition-all duration-200 flex items-center gap-2 font-medium text-sm h-10"
          >
            <VueIcon name="io:close" size="16" />
            <span class="hidden sm:inline">Effacer</span>
          </button>
        </transition>
      </div>
    </div>

    <!-- Pagination EN HAUT -->
    <CollectionPaginator
      :totalPages="totalPages"
      :currentCategory="currentCategory"
      :currentCategoryIndex="currentCategoryIndex"
      :searchText="searchText"
      :filteredCards="filteredCards"
      @go-to-next-category="goToNextCategory"
      @go-to-previous-category="goToPreviousCategory"
    />

    <!-- Contenu principal -->
    <div
      v-if="categoriesOverview.length === 0"
      class="flex-1 flex items-center justify-center"
    >
      <div class="text-center space-y-2">
        <VueIcon
          name="io:sharp-warning"
          class="text-foam-400/50 mx-auto mb-2"
          size="48"
        />
        <p class="text-foam-300 font-medium">
          Aucune carte dans votre collection
        </p>
        <p class="text-foam-400/70 text-sm">
          Ouvrez des boosters pour commencer
        </p>
      </div>
    </div>

    <div v-else class="flex-1 min-h-0 flex flex-col">
      <!-- Zone de contenu - catégorie actuelle -->
      <div ref="mainContainer" class="flex-1 overflow-y-auto pb-2">
        <transition name="fade" mode="out-in">
          <template v-if="currentCategory">
            <CategoryGroup
              :category-name="currentCategory.categoryName"
              :cards="filteredCards"
              :total-cards="currentCategory.totalCards"
              :show-empty-slots="searchText.length === 0"
              @item-visible="handleItemVisible"
            />
          </template>
        </transition>
      </div>
    </div>

    <!-- Pagination EN BAS -->
    <CollectionPaginator
      :totalPages="totalPages"
      :currentCategory="currentCategory"
      :currentCategoryIndex="currentCategoryIndex"
      :searchText="searchText"
      :filteredCards="filteredCards"
      @go-to-next-category="goToNextCategory"
      @go-to-previous-category="goToPreviousCategory"
    />

    <!-- Pied de page -->
    <div class="text-center text-xs text-foam-400/60 py-2">
      <p>
        Vous avez des droits d'auteur à faire valoir ?
        <a
          href="mailto:acs.tournoi@gmail.com"
          class="text-foam-200 hover:text-foam-100 underline transition-colors"
          >Contactez-nous</a
        >
      </p>
    </div>
  </div>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 200ms ease;
}

.slide-fade-enter-from {
  transform: translateX(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
