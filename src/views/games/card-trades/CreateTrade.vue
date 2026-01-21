<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import { useRouter } from 'vue-router';
import useCollectionStore from '@/stores/collectionStore';
import useTradeStore from '@/stores/tradeStore';
import type { CollectibleCard } from '@/types/models';
import CollectibleCardComponent from '@/views/games/card-creator/CollectibleCard.vue';
import { Button } from '@/components/ui';
import {useElementSize, useWindowSize} from "@vueuse/core";

const router = useRouter();
const collectionStore = useCollectionStore();
const tradeStore = useTradeStore();

const selectedCards = ref<Map<string, { card: CollectibleCard; count: number; maxCount: number }>>(new Map());
const searchQuery = ref('');

onMounted(async () => {
  await collectionStore.fetchCategoriesOverview();
});

const availableCards = () => {
  const cards: { card: CollectibleCard; count: number }[] = [];

  for (const category of collectionStore.categoriesOverview) {
    for (const ownedCard of category.ownedCards) {
      if (ownedCard.count > 0) {
        cards.push({
          card: ownedCard.card,
          count: ownedCard.count
        });
      }
    }
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    return cards.filter(c => c.card.title.toLowerCase().includes(query));
  }

  return cards;
};

const toggleCardSelection = (card: CollectibleCard, maxCount: number) => {
  if (selectedCards.value.has(card.id)) {
    selectedCards.value.delete(card.id);
  } else {
    if (selectedCards.value.size >= 5) {
      return; // Maximum 5 cartes
    }
    selectedCards.value.set(card.id, { card, count: 1, maxCount });
  }
};

const updateCardCount = (cardId: string, newCount: number) => {
  const cardData = selectedCards.value.get(cardId);
  if (cardData && newCount > 0 && newCount <= cardData.maxCount) {
    cardData.count = newCount;
  }
};

const canCreateTrade = () => {
  return selectedCards.value.size > 0 && selectedCards.value.size <= 5;
};

const createTrade = async () => {
  if (!canCreateTrade()) return;

  const offeredCards = Array.from(selectedCards.value.values()).map(({ card, count }) => ({
    cardId: card.id,
    count
  }));

  const trade = await tradeStore.createTrade(offeredCards);
  if (trade) {
    router.push(`/scrimdeck/trades/${trade.id}`);
  }
};

const cancel = () => {
  router.push('/scrimdeck/trades');
};

const { width: windowWidth } = useWindowSize();
const cardsGrid = ref<HTMLElement |null>(null);
const { width: gridWidth } = useElementSize(cardsGrid);
const maxCardWidth = computed(() => {
  if (windowWidth.value >= 1024) {
    return (cardsGrid ? (gridWidth.value / 6) : 150) - 14; // Large screens
  } else if (windowWidth.value >= 768) {
    return (cardsGrid ? (gridWidth.value / 4) : 150) - 12; // Medium screens
  } else {
    return (cardsGrid ? (gridWidth.value / 2) : 150) - 8; // Small screens
  }
})
</script>

<template>
  <div class="min-h-screen  text-white p-4 pb-20">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold mb-2">Créer une offre d'échange</h1>
        <p class="text-gray-400">Sélectionnez jusqu'à 5 cartes à proposer à l'échange</p>
      </div>

      <!-- Selected cards -->
      <div class="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
        <h2 class="text-xl font-semibold mb-3">
          Cartes sélectionnées ({{ selectedCards.size }}/5)
        </h2>

        <div v-if="selectedCards.size === 0" class="text-center py-8 text-gray-400">
          Sélectionnez des cartes ci-dessous
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div
            v-for="[cardId, cardData] in selectedCards"
            :key="cardId"
            class="relative"
          >
            <CollectibleCardComponent
              :card="cardData.card"
              :preview-only="true"
              class="w-full"
              :maxWidth="maxCardWidth"
            />

            <!-- Quantity selector -->
            <div class="mt-2 flex items-center gap-2 justify-center">
              <button
                @click="updateCardCount(cardId, cardData.count - 1)"
                :disabled="cardData.count <= 1"
                class="px-2 py-1 bg-gray-700 rounded disabled:opacity-50"
              >
                -
              </button>
              <span class="px-3">{{ cardData.count }}</span>
              <button
                @click="updateCardCount(cardId, cardData.count + 1)"
                :disabled="cardData.count >= cardData.maxCount"
                class="px-2 py-1 bg-gray-700 rounded disabled:opacity-50"
              >
                +
              </button>
            </div>

            <button
              @click="selectedCards.delete(cardId)"
              class="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 mt-4 pt-4 border-t border-gray-700">
          <Button
            @click="createTrade"
            :disabled="!canCreateTrade() || tradeStore.loading"
            class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {{ tradeStore.loading ? 'Création...' : 'Créer l\'offre' }}
          </Button>
          <Button @click="cancel" variant="outline">
            Annuler
          </Button>
        </div>
      </div>

      <!-- Search -->
      <div class="mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher une carte..."
          class="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 outline-none"
        />
      </div>

      <!-- Available cards -->
      <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h2 class="text-xl font-semibold mb-3">Vos cartes disponibles</h2>

        <div v-if="availableCards().length === 0" class="text-center py-8 text-gray-400">
          Aucune carte disponible
        </div>

        <div v-else ref="cardsGrid" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div
            v-for="({ card, count }) in availableCards()"
            :key="card.id"
            @click="toggleCardSelection(card, count)"
            :class="[
              'relative cursor-pointer transition-all',
              selectedCards.has(card.id)
                ? 'ring-2 ring-blue-500 opacity-50'
                : 'hover:ring-2 hover:ring-gray-600'
            ]"
          >
            <CollectibleCardComponent
              :card="card"
              :preview-only="true"
              class="w-full"
              :maxWidth="maxCardWidth"
            />

            <!-- Count badge -->
            <div class="absolute top-2 left-2 bg-black/75 text-white text-xs font-bold rounded-full px-2 py-1">
              x{{ count }}
            </div>

            <!-- Selected checkmark -->
            <div
              v-if="selectedCards.has(card.id)"
              class="absolute inset-0 flex items-center justify-center"
            >
              <div class="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center">
                <span class="text-2xl">✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
