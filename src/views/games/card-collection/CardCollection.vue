<script setup lang="ts">

import useCollectionStore from "@/stores/collectionStore.ts";
import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import CollectibleCard from "@/views/games/card-creator/CollectibleCard.vue";
import type {CollectibleCard as Card} from "@/types/models";
import {useCardFetchQueue} from "@/composables/useCardFetchQueue.ts";
import {usePerformanceMonitor} from "@/composables/usePerformanceMonitor.ts";
import {storeToRefs} from "pinia";
import ListView from "@/components/global/ListView.vue";
import {useIntersectionObserver} from "@vueuse/core";

const collectionStore = useCollectionStore();
const { cards } = storeToRefs(collectionStore);
const page = ref(1);

// Initialize performance monitoring (only in dev mode)
const isDev = import.meta.env.DEV;
const { fps, memoryUsage } = usePerformanceMonitor({
  enabled: isDev,
  componentName: 'CardCollection',
  logInterval: 10000, // Log every 10 seconds
});

// Initialize fetch queue with batching
const fetchQueue = useCardFetchQueue({
  batchSize: 40,
  batchDelay: 150,
  maxConcurrent: 2,
});

// Track which cards need full data
const cardsNeedingFullData = ref<Set<string>>(new Set());

// Track active timeouts for cleanup
const activeTimeouts = new Set<number>();

// Create a card lookup map for O(1) access
const cardsMap = computed(() => {
  const map = new Map<string, Card>();
  cards.value.forEach(card => map.set(card.id, card));
  return map;
});

const queueProcessInterval = ref<number | null>(null);

onMounted(async () => {
  await collectionStore.fetchCollection();

  queueProcessInterval.value = setInterval(() => {
    // Process queue if not busy
    if (!fetchQueue.processing.value && fetchQueue.activeRequests.value === 0) {
      fetchQueue.processBatch(async (cardId) => {
        if (!collectionStore.collection) return;
        const targetCard = cardsMap.value.get(cardId);
        if (!targetCard || targetCard.frontAsset) return;

        try {
          await collectionStore.fetchFullCard(collectionStore.collection.id, cardId);
          cardsNeedingFullData.value.delete(cardId);
        } catch (error) {
          console.error('Error loading card:', cardId, error);
          // Silently fail for background loads
        }
      }).catch(error => {
        console.error('Error processing visible card batch:', error);
      });
    }
  }, 1000);
});

onUnmounted(() => {
  fetchQueue.clear();
  // Clear all pending timeouts
  activeTimeouts.forEach(id => clearTimeout(id));
  activeTimeouts.clear();
  if (queueProcessInterval.value !== null) {
    clearInterval(queueProcessInterval.value);
    queueProcessInterval.value = null;
  }
});

// Handle when card becomes visible in viewport
const handleItemVisible = (card: Card) => {
  if (!card.frontAsset && collectionStore.collection) {
    cardsNeedingFullData.value.add(card.id);
    // Add to queue with lower priority (just visible, not hovered)
    fetchQueue.enqueue(card.id, 1);
  }
};

const cardsContainer = ref<HTMLElement>();

// Observe cards when container is mounted or updated
const observeCards = () => {
  if (!cardsContainer.value) return;

  const cardElements = cardsContainer.value.querySelectorAll('[data-card-id]');
  console.log(cardElements)
  cardElements.forEach(element => {
    useIntersectionObserver(
      element as HTMLElement,
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const cardId = (entry.target as HTMLElement).getAttribute('data-card-id');
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
watch(cardsContainer, (newContainer) => {
  if (newContainer) {
    // Small delay to ensure DOM is ready
    const timeout = window.setTimeout(observeCards, 100);
    activeTimeouts.add(timeout);
  }
});

watch(page, (newPage) => {
  if (newPage) {
    // Small delay to ensure DOM is ready
    const timeout = window.setTimeout(observeCards, 100);
    activeTimeouts.add(timeout);
  }
});
</script>

<template>
  <div class="flex flex-col gap-6 h-full">
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
    
    <h1 class="text-3xl font-bold text-foam-50">Ma collection de cartes</h1>
    <div v-if="!collectionStore.collection" class="text-foam-300">
      Vous n'avez pas encore de cartes dans votre collection.
    </div>
    <div v-else class="flex-1 min-h-0" ref="cardsContainer">
      <ListView
        :data="cards"
        paginate
        :itemsPerPage="9"
        :max-cols="3"
        @updateCurrentPage="p => page = p"
        justify-center
      >
        <template #item="{ item: card }">
          <div class="w-[250px]">
            <CollectibleCard
              :card="card"
              :data-card-id="card.id"
              interactive
              @click="handleItemVisible(card)"
            />
            <p class="text-end">{{ card.count }} exemplaire{{ (card.count ?? 0) > 1 ? "s" : ""}}</p>
          </div>
        </template>
      </ListView>
    </div>
  </div>
</template>