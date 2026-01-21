<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import useTradeStore from '@/stores/tradeStore';
import type { CardTrade } from '@/types/models';
import CollectibleCardComponent from '@/views/games/card-creator/CollectibleCard.vue';
import { Button } from '@/components/ui';

const router = useRouter();
const tradeStore = useTradeStore();

const searchQuery = ref('');
const filterByUser = ref('');

onMounted(async () => {
  await tradeStore.fetchTrades();
});

const filteredTrades = computed(() => {
  let trades = tradeStore.trades.filter(t => t.status === 'active');

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    trades = trades.filter(t =>
      t.offeredBy.username.toLowerCase().includes(query) ||
      t.offeredCards.some(c => c.cardId.title.toLowerCase().includes(query))
    );
  }

  if (filterByUser.value) {
    trades = trades.filter(t => t.offeredBy.id === filterByUser.value);
  }

  return trades;
});

const goToCreateTrade = () => {
  router.push('/scrimdeck/trades/create');
};

const goToTrade = (trade: CardTrade) => {
  router.push(`/scrimdeck/trades/${trade.id}`);
};

const goToMyTrades = () => {
  router.push('/scrimdeck/trades/me');
};
</script>

<template>
  <div class="min-h-screen  text-white p-4 pb-20">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col gap-4 mb-6">
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold">Marché des échanges</h1>
          <div class="flex gap-2">
            <Button @click="goToMyTrades" variant="outline">
              Mes échanges
            </Button>
            <Button @click="goToCreateTrade" class="bg-blue-600 hover:bg-blue-700">
              Créer une offre
            </Button>
          </div>
        </div>

        <!-- Filters -->
        <div class="flex gap-2">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher par utilisateur ou carte..."
            class="flex-1 px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="tradeStore.loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <!-- Empty state -->
      <div v-else-if="filteredTrades.length === 0" class="text-center py-12">
        <p class="text-gray-400 text-lg">Aucune offre d'échange disponible pour le moment.</p>
        <Button @click="goToCreateTrade" class="mt-4 bg-blue-600 hover:bg-blue-700">
          Créer la première offre
        </Button>
      </div>

      <!-- Trades list -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="trade in filteredTrades"
          :key="trade.id"
          @click="goToTrade(trade)"
          class="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500 cursor-pointer transition-all flex flex-col"
        >
          <!-- Owner -->
          <div class="flex items-center gap-2 mb-3">
            <img
              :src="trade.offeredBy.avatarUrl"
              :alt="trade.offeredBy.username"
              class="w-8 h-8 rounded-full"
            />
            <span class="font-semibold">{{ trade.offeredBy.username }}</span>
            <span class="text-xs text-gray-400 ml-auto">
              {{ new Date(trade.createdAt).toLocaleDateString('fr-FR') }}
            </span>
          </div>

          <!-- Offered cards -->
          <div class="space-y-2 pb-3">
            <p class="text-sm text-gray-400">Propose :</p>
            <ul class="flex flex-row flex-wrap gap-1">
              <li
                v-for="(card) in trade.offeredCards"
                :key="card.cardId.id"
                class="bg-gray-700 rounded px-2 py-1 text-sm"
              >
                {{card.count}}x {{ card.cardId.title }}
              </li>
            </ul>
          </div>

          <!-- Proposals count -->
          <div class="mt-auto pt-3 border-t border-gray-700">
            <p class="text-sm text-gray-400">
              {{ trade.proposals.filter(p => p.status === 'pending').length }} proposition(s)
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
