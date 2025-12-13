<script setup lang="ts">

import useCollectionStore from "@/stores/collectionStore.ts";
import {computed, onMounted, ref} from "vue";
import CollectibleCard from "@/views/games/card-creator/CollectibleCard.vue";
import VirtualGrid from "@/components/global/VirtualGrid.vue";
import type { CollectibleCard as Card } from "@/types/models";
import {useToastStore} from "@/stores/toastStore.ts";

const collectionStore = useCollectionStore();
const cards = computed(() => collectionStore.cards);

const isLoadingFullCard = ref<boolean>(false);

const fullCardFetchQueue = ref<Set<string>>(new Set());

// Track which cards need full data
const cardsNeedingFullData = ref<Set<string>>(new Set());

onMounted(async () => {
  await collectionStore.fetchCollection();
});

const handleMouseHoverPreview = async (card: Card) => {
  if (isLoadingFullCard.value) return useToastStore().info('Le chargement de la carte est en cours.');
  if (fullCardFetchQueue.value.has(card.id)) return; // Déjà en cours de chargement
  fullCardFetchQueue.value.add(card.id);
  isLoadingFullCard.value = true;
  setTimeout(() => {
    if (!collectionStore.collection) return;
    if (card.frontAsset) return; // Déjà chargé
    if (!fullCardFetchQueue.value.has(card.id)) return;
    collectionStore.fetchFullCard(collectionStore.collection.id, card.id)
      .then(() => {
        isLoadingFullCard.value = false;
      })
      .catch(() => {
        isLoadingFullCard.value = false;
        useToastStore().error('Erreur lors du chargement de la carte complète.');
      })
      .finally(() => {
        isLoadingFullCard.value = false;
      });
  }, 500); // Reduced from 1000ms to 500ms for better responsiveness
};

const handleMouseLeavePreview = (card: Card) => {
  setTimeout(() => {
    fullCardFetchQueue.value.delete(card.id);
    if (collectionStore.listCardLoaded.length <= 1) return;
    const firstCardLoaded = collectionStore.listCardLoaded[0];
    if (!firstCardLoaded) return;
    collectionStore.unloadFullCard(firstCardLoaded);
  }, 500)
};

// Handle when card becomes visible in viewport
const handleItemVisible = (card: Card) => {
  if (!card.frontAsset && collectionStore.collection) {
    cardsNeedingFullData.value.add(card.id);
    // Preload card data when it becomes visible
    if (!fullCardFetchQueue.value.has(card.id)) {
      fullCardFetchQueue.value.add(card.id);
      collectionStore.fetchFullCard(collectionStore.collection.id, card.id)
        .then(() => {
          cardsNeedingFullData.value.delete(card.id);
          fullCardFetchQueue.value.delete(card.id);
        })
        .catch(() => {
          fullCardFetchQueue.value.delete(card.id);
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