<script setup lang="ts">

import useCollectionStore from "@/stores/collectionStore.ts";
import {computed, onMounted, ref, onUnmounted} from "vue";
import CollectibleCard from "@/views/games/card-creator/CollectibleCard.vue";
import VirtualGrid from "@/components/global/VirtualGrid.vue";
import type { CollectibleCard as Card } from "@/types/models";
import {useToastStore} from "@/stores/toastStore.ts";
import { useCardFetchQueue } from "@/composables/useCardFetchQueue.ts";
import { usePerformanceMonitor } from "@/composables/usePerformanceMonitor.ts";

const collectionStore = useCollectionStore();
const cards = computed(() => collectionStore.cards);

const isLoadingFullCard = ref<boolean>(false);

// Initialize performance monitoring (only in dev mode)
const isDev = import.meta.env.DEV;
const { fps, memoryUsage } = usePerformanceMonitor({
  enabled: isDev,
  componentName: 'CardCollection',
  logInterval: 10000, // Log every 10 seconds
});

// Initialize fetch queue with batching
const fetchQueue = useCardFetchQueue({
  batchSize: 3,
  batchDelay: 150,
  maxConcurrent: 2,
});

// Track which cards need full data
const cardsNeedingFullData = ref<Set<string>>(new Set());

onMounted(async () => {
  await collectionStore.fetchCollection();
});

onUnmounted(() => {
  fetchQueue.clear();
});

const handleMouseHoverPreview = async (card: Card) => {
  if (isLoadingFullCard.value) return useToastStore().info('Le chargement de la carte est en cours.');
  if (card.frontAsset) return; // Already loaded
  
  // Add to queue with high priority (user is hovering)
  fetchQueue.enqueue(card.id, 10);
  
  // Process the queue
  if (!fetchQueue.processing.value) {
    isLoadingFullCard.value = true;
    await fetchQueue.processBatch(async (cardId) => {
      if (!collectionStore.collection) return;
      const targetCard = cards.value.find(c => c.id === cardId);
      if (!targetCard || targetCard.frontAsset) return;
      
      await collectionStore.fetchFullCard(collectionStore.collection.id, cardId);
    });
    isLoadingFullCard.value = false;
  }
};

const handleMouseLeavePreview = (card: Card) => {
  // Remove from queue if still pending
  fetchQueue.dequeue(card.id);
  
  // Unload card data after a delay to free memory
  setTimeout(() => {
    if (collectionStore.listCardLoaded.length <= 3) return; // Keep at least 3 loaded
    const oldestLoadedCard = collectionStore.listCardLoaded[0];
    if (!oldestLoadedCard) return;
    collectionStore.unloadFullCard(oldestLoadedCard);
  }, 1000);
};

// Handle when card becomes visible in viewport
const handleItemVisible = (card: Card) => {
  if (!card.frontAsset && collectionStore.collection) {
    cardsNeedingFullData.value.add(card.id);
    
    // Add to queue with lower priority (just visible, not hovered)
    fetchQueue.enqueue(card.id, 1);
    
    // Process queue if not busy
    if (!fetchQueue.processing.value && fetchQueue.activeRequests.value === 0) {
      fetchQueue.processBatch(async (cardId) => {
        if (!collectionStore.collection) return;
        const targetCard = cards.value.find(c => c.id === cardId);
        if (!targetCard || targetCard.frontAsset) return;
        
        try {
          await collectionStore.fetchFullCard(collectionStore.collection.id, cardId);
          cardsNeedingFullData.value.delete(cardId);
        } catch {
          // Silently fail for background loads
        }
      });
    }
  }
};

// Calculate card dimensions with gap
const CARD_WIDTH = 250;
const CARD_HEIGHT = 378;
const CARD_GAP = 16;

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
    <div v-else class="flex-1 min-h-0">
      <VirtualGrid
        :items="cards"
        :item-width="CARD_WIDTH"
        :item-height="CARD_HEIGHT"
        :gap="CARD_GAP"
        :overscan="2"
        @item-visible="handleItemVisible"
      >
        <template #item="{ item: card }">
          <CollectibleCard
            v-if="(card as Card).frontAsset"
            :card="card as Card"
            interactive
            lazy-load
            @mouseleave="handleMouseLeavePreview(card)"
          />
          <img
            v-else
            :src="card.previewCardB64"
            alt="Aperçu de la carte"
            class="w-62.5 object-contain"
            :class="{ 'cursor-wait': isLoadingFullCard }"
            loading="lazy"
            @mouseover="handleMouseHoverPreview(card)"
          />
        </template>
      </VirtualGrid>
    </div>
  </div>
</template>