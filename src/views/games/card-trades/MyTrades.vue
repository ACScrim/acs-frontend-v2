<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import useTradeStore from '@/stores/tradeStore';
import { useUserStore } from '@/stores/userStore';
import type { CardTrade } from '@/types/models';
import CollectibleCardComponent from '@/views/games/card-creator/CollectibleCard.vue';
import { Button } from '@/components/ui';
import {useElementSize, useWindowSize} from "@vueuse/core";
import {useResponsiveCardGrid} from "@/composables/useResponsiveCardGrid.ts";

const router = useRouter();
const tradeStore = useTradeStore();
const userStore = useUserStore();

const activeTab = ref<'offers' | 'proposals'>('offers');

onMounted(async () => {
  await Promise.all([
    tradeStore.fetchMyTrades(),
    tradeStore.fetchMyProposals()
  ]);
});

const goToTrade = (trade: CardTrade) => {
  router.push(`/scrimdeck/trades/${trade.id}`);
};

const goToCreateTrade = () => {
  router.push('/scrimdeck/trades/create');
};

const goBack = () => {
  router.push('/scrimdeck/trades');
};

const myActiveTrades = computed(() => {
  return tradeStore.myTrades.filter(t => t.status === 'active');
});

const myCompletedTrades = computed(() => {
  return tradeStore.myTrades.filter(t => t.status === 'completed');
});

const myCancelledTrades = computed(() => {
  return tradeStore.myTrades.filter(t => t.status === 'cancelled');
});

const myActiveProposals = computed(() => {
  const proposals: Array<{ trade: CardTrade; proposal: any }> = [];

  for (const trade of tradeStore.myProposals) {
    const myProposal = trade.proposals.find(
      p => p.proposedBy.id === userStore.user?.id && p.status === 'pending'
    );
    if (myProposal) {
      proposals.push({ trade, proposal: myProposal });
    }
  }

  return proposals;
});

const cardsGrid = ref<HTMLElement |null>(null);
const { maxCardWidth } = useResponsiveCardGrid(cardsGrid, {
  breakpoints: {
    0: { cells: 3, gap: 8 }
  },
  defaultWidth: 150
});
</script>

<template>
  <div class="min-h-screen text-white p-4 pb-20">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <Button @click="goBack" variant="outline">
          ← Retour
        </Button>
        <h1 class="text-3xl font-bold">Mes échanges</h1>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6 border-b border-gray-700">
        <button
          @click="activeTab = 'offers'"
          :class="[
            'px-4 py-2 font-semibold transition-colors',
            activeTab === 'offers'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          ]"
        >
          Mes offres ({{ myActiveTrades.length }})
        </button>
        <button
          @click="activeTab = 'proposals'"
          :class="[
            'px-4 py-2 font-semibold transition-colors',
            activeTab === 'proposals'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          ]"
        >
          Mes propositions ({{ myActiveProposals.length }})
        </button>
      </div>

      <!-- Loading -->
      <div v-if="tradeStore.loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <!-- Offers tab -->
      <div v-else-if="activeTab === 'offers'">
        <!-- Active offers -->
        <div class="mb-8">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-semibold">Offres actives</h2>
            <Button @click="goToCreateTrade" class="bg-blue-600 hover:bg-blue-700">
              Créer une offre
            </Button>
          </div>

          <div v-if="myActiveTrades.length === 0" class="text-center py-8 bg-gray-800 rounded-lg border border-gray-700">
            <p class="text-gray-400 mb-4">Vous n'avez aucune offre active</p>
            <Button @click="goToCreateTrade" class="bg-blue-600 hover:bg-blue-700">
              Créer votre première offre
            </Button>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="trade in myActiveTrades"
              :key="trade.id"
              @click="goToTrade(trade)"
              class="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500 cursor-pointer transition-all flex flex-col"
            >
              <!-- Date -->
              <div class="flex justify-between items-center mb-3">
                <span class="text-sm text-gray-400">
                  {{ new Date(trade.createdAt).toLocaleDateString('fr-FR') }}
                </span>
                <span class="text-xs bg-green-600 px-2 py-1 rounded-full">Active</span>
              </div>

              <!-- Offered cards -->
              <div class="space-y-2 pb-3">
                <p class="text-sm text-gray-400">Vos cartes :</p>
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
                <p class="text-sm font-semibold">
                  {{ trade.proposals.filter(p => p.status === 'pending').length }} proposition(s) en attente
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Completed offers -->
        <div v-if="myCompletedTrades.length > 0" class="mb-8">
          <h2 class="text-2xl font-semibold mb-4">Échanges complétés</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="trade in myCompletedTrades"
              :key="trade.id"
              @click="goToTrade(trade)"
              class="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500 cursor-pointer transition-all opacity-75"
            >
              <div class="flex justify-between items-center mb-3">
                <span class="text-sm text-gray-400">
                  {{ new Date(trade.createdAt).toLocaleDateString('fr-FR') }}
                </span>
                <span class="text-xs bg-blue-600 px-2 py-1 rounded-full">Complétée</span>
              </div>

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
          </div>
        </div>

        <!-- Cancelled offers -->
        <div v-if="myCancelledTrades.length > 0">
          <h2 class="text-2xl font-semibold mb-4">Offres annulées</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="trade in myCancelledTrades"
              :key="trade.id"
              class="bg-gray-800 rounded-lg p-4 border border-gray-700 opacity-50"
            >
              <div class="flex justify-between items-center mb-3">
                <span class="text-sm text-gray-400">
                  {{ new Date(trade.createdAt).toLocaleDateString('fr-FR') }}
                </span>
                <span class="text-xs bg-gray-600 px-2 py-1 rounded-full">Annulée</span>
              </div>

              <div class="grid grid-cols-5 gap-2">
                <div
                  v-for="(card, index) in trade.offeredCards"
                  :key="index"
                  class="relative"
                >
                  <CollectibleCardComponent
                    :card="card.cardId"
                    :preview-only="true"
                    class="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Proposals tab -->
      <div v-else-if="activeTab === 'proposals'">
        <h2 class="text-2xl font-semibold mb-4">Mes propositions en attente</h2>

        <div v-if="myActiveProposals.length === 0" class="text-center py-8 bg-gray-800 rounded-lg border border-gray-700">
          <p class="text-gray-400">Vous n'avez aucune proposition en attente</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="({ trade, proposal }) in myActiveProposals"
            :key="trade.id"
            @click="goToTrade(trade)"
            class="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500 cursor-pointer transition-all"
          >
            <!-- Owner info -->
            <div class="flex items-center gap-3 mb-3">
              <img
                :src="trade.offeredBy.avatarUrl"
                :alt="trade.offeredBy.username"
                class="w-10 h-10 rounded-full"
              />
              <div>
                <p class="font-semibold">Offre de {{ trade.offeredBy.username }}</p>
                <p class="text-xs text-gray-400">
                  Proposé le {{ new Date(proposal.createdAt).toLocaleDateString('fr-FR') }}
                </p>
              </div>
              <span class="ml-auto text-xs bg-yellow-600 px-2 py-1 rounded-full">En attente</span>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <!-- Their cards -->
              <div>
                <p class="text-sm text-gray-400 mb-2">Leurs cartes :</p>
                <div class="grid grid-cols-3 gap-2" ref="cardsGrid">
                  <div
                    v-for="(card, index) in trade.offeredCards"
                    :key="index"
                    class="relative"
                  >
                    <CollectibleCardComponent
                      :card="card.cardId"
                      :preview-only="true"
                      class="w-full"
                      :maxWidth="maxCardWidth"
                    />
                    <div
                      v-if="card.count > 1"
                      class="absolute top-1 right-1 bg-black/75 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      {{ card.count }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Your proposed cards -->
              <div>
                <p class="text-sm text-gray-400 mb-2">Vos cartes :</p>
                <div class="grid grid-cols-3 gap-2">
                  <div
                    v-for="(card, index) in proposal.proposedCards"
                    :key="index"
                    class="relative"
                  >
                    <CollectibleCardComponent
                      :card="card.cardId"
                      :preview-only="true"
                      class="w-full"
                      :maxWidth="maxCardWidth"
                    />
                    <div
                      v-if="card.count > 1"
                      class="absolute top-1 right-1 bg-black/75 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      {{ card.count }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
