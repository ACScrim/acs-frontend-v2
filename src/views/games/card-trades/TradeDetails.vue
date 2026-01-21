<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import useTradeStore from '@/stores/tradeStore';
import useCollectionStore from '@/stores/collectionStore';
import {useUserStore} from '@/stores/userStore';
import type {CollectibleCard, TradeProposal} from '@/types/models';
import CollectibleCardComponent from '@/views/games/card-creator/CollectibleCard.vue';
import {Button} from '@/components/ui';
import {useResponsiveCardGrid} from "@/composables/useResponsiveCardGrid.ts";

const route = useRoute();
const router = useRouter();
const tradeStore = useTradeStore();
const collectionStore = useCollectionStore();
const userStore = useUserStore();

const tradeId = route.params.id as string;
const showProposalForm = ref(false);
const selectedCards = ref<Map<string, { card: CollectibleCard; count: number; maxCount: number }>>(new Map());
const searchQuery = ref('');

onMounted(async () => {
  await tradeStore.fetchTrade(tradeId);
  await collectionStore.fetchCategoriesOverview();
});

const trade = computed(() => tradeStore.currentTrade);
const isOwner = computed(() => trade.value?.offeredBy.id === userStore.user?.id);

const myPendingProposal = computed(() => {
  if (!trade.value || !userStore.user) return null;
  return trade.value.proposals.find(
    p => p.proposedBy.id === userStore.user?.id && p.status === 'pending'
  );
});

const pendingProposals = computed(() => {
  if (!trade.value) return [];
  return trade.value.proposals.filter(p => p.status === 'pending');
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
      return;
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

const submitProposal = async () => {
  if (selectedCards.value.size === 0) return;

  const proposedCards = Array.from(selectedCards.value.values()).map(({ card, count }) => ({
    cardId: card.id,
    count
  }));

  const result = await tradeStore.proposeTrade(tradeId, proposedCards);
  if (result) {
    showProposalForm.value = false;
    selectedCards.value.clear();
  }
};

const acceptProposal = async (proposal: TradeProposal) => {
  if (confirm('Êtes-vous sûr de vouloir accepter cette proposition ? L\'échange sera immédiat.')) {
    await tradeStore.acceptProposal(tradeId, proposal._id!);
    router.push('/scrimdeck/trades/me');
  }
};

const rejectProposal = async (proposal: TradeProposal) => {
  await tradeStore.rejectProposal(tradeId, proposal._id!);
};

const cancelTrade = async () => {
  if (confirm('Êtes-vous sûr de vouloir annuler cette offre ?')) {
    const success = await tradeStore.cancelTrade(tradeId);
    if (success) {
      router.push('/scrimdeck/trades');
    }
  }
};

const goBack = () => {
  router.push('/scrimdeck/trades');
};

const cardsGrid = ref<HTMLElement | null>(null);
const { maxCardWidth } = useResponsiveCardGrid(cardsGrid, {
  breakpoints: {
    768: { cells: 5, gap: 16 },
    0: { cells: 2, gap: 16 }
  },
  defaultWidth: 150
});
</script>

<template>
  <div class="min-h-screen  text-white p-4 pb-20">
    <div class="max-w-7xl mx-auto">
      <!-- Loading -->
      <div v-if="tradeStore.loading && !trade" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <!-- Trade details -->
      <div v-else-if="trade">
        <!-- Header -->
        <div class="flex items-center gap-4 mb-6">
          <Button @click="goBack" variant="outline">
            ← Retour
          </Button>
          <h1 class="text-3xl font-bold">Détails de l'offre</h1>
          <div
            :class="[
              'ml-auto px-3 py-1 rounded-full text-sm font-semibold',
              trade.status === 'active' ? 'bg-green-600' :
              trade.status === 'completed' ? 'bg-blue-600' :
              'bg-gray-600'
            ]"
          >
            {{ trade.status === 'active' ? 'Active' :
               trade.status === 'completed' ? 'Complétée' : 'Annulée' }}
          </div>
        </div>

        <!-- Owner info -->
        <div class="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
          <div class="flex items-center gap-3">
            <img
              :src="trade.offeredBy.avatarUrl"
              :alt="trade.offeredBy.username"
              class="w-12 h-12 rounded-full"
            />
            <div>
              <p class="font-semibold text-lg">{{ trade.offeredBy.username }}</p>
              <p class="text-sm text-gray-400">
                Créée le {{ new Date(trade.createdAt).toLocaleDateString('fr-FR') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Offered cards -->
        <div class="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
          <h2 class="text-xl font-semibold mb-3">Cartes proposées à l'échange</h2>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4" ref="cardsGrid">
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
                class="absolute top-2 right-2 bg-black/75 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
              >
                {{ card.count }}
              </div>
            </div>
          </div>
        </div>

        <!-- Owner actions -->
        <div v-if="isOwner && trade.status === 'active'" class="mb-6">
          <Button @click="cancelTrade" variant="outline" class="text-red-500 border-red-500 hover:bg-red-500 hover:text-white">
            Annuler cette offre
          </Button>
        </div>

        <!-- Proposals section for owner -->
        <div v-if="isOwner" class="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
          <h2 class="text-xl font-semibold mb-3">
            Propositions reçues ({{ pendingProposals.length }})
          </h2>

          <div v-if="pendingProposals.length === 0" class="text-center py-8 text-gray-400">
            Aucune proposition pour le moment
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="proposal in pendingProposals"
              :key="proposal._id"
              class="bg-gray-900 rounded-lg p-4 border border-gray-700"
            >
              <!-- Proposer info -->
              <div class="flex items-center gap-3 mb-3">
                <img
                  :src="proposal.proposedBy.avatarUrl"
                  :alt="proposal.proposedBy.username"
                  class="w-10 h-10 rounded-full"
                />
                <div>
                  <p class="font-semibold">{{ proposal.proposedBy.username }}</p>
                  <p class="text-sm text-gray-400">
                    {{ new Date(proposal.createdAt).toLocaleDateString('fr-FR') }}
                  </p>
                </div>
              </div>

              <!-- Proposed cards -->
              <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                <div
                  v-for="(card, index) in proposal.proposedCards"
                  :key="index"
                  class="relative"
                >
                  <CollectibleCardComponent
                    :card="card.cardId"
                    :preview-only="true"
                    class="w-full"
                    :maxWidth="maxCardWidth - 12"
                  />
                  <div
                    v-if="card.count > 1"
                    class="absolute top-1 right-1 bg-black/75 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    {{ card.count }}
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-2">
                <Button
                  @click="acceptProposal(proposal)"
                  class="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Accepter
                </Button>
                <Button
                  @click="rejectProposal(proposal)"
                  variant="outline"
                  class="flex-1 text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                >
                  Refuser
                </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- Proposal form for non-owners -->
        <div v-if="!isOwner && trade.status === 'active'">
          <!-- Existing proposal notice -->
          <div v-if="myPendingProposal" class="bg-gray-800 rounded-lg p-4 border border-yellow-600 mb-6">
            <p class="text-yellow-500 font-semibold mb-2">Vous avez déjà fait une proposition sur cette offre</p>
            <p class="text-sm text-gray-400">Votre proposition est en attente de réponse du propriétaire.</p>
          </div>

          <!-- Proposal form -->
          <div v-else class="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div v-if="!showProposalForm">
              <Button @click="showProposalForm = true" class="w-full bg-blue-600 hover:bg-blue-700">
                Faire une proposition
              </Button>
            </div>

            <div v-else>
              <h2 class="text-xl font-semibold mb-3">Votre proposition</h2>

              <!-- Selected cards -->
              <div class="mb-4">
                <p class="text-sm text-gray-400 mb-2">
                  Cartes sélectionnées ({{ selectedCards.size }}/5)
                </p>

                <div v-if="selectedCards.size === 0" class="text-center py-4 text-gray-400 text-sm">
                  Sélectionnez des cartes ci-dessous
                </div>

                <div v-else class="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
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

                    <div class="mt-1 flex items-center gap-1 justify-center text-xs">
                      <button
                        @click="updateCardCount(cardId, cardData.count - 1)"
                        :disabled="cardData.count <= 1"
                        class="px-1 py-0.5 bg-gray-700 rounded disabled:opacity-50"
                      >
                        -
                      </button>
                      <span class="px-2">{{ cardData.count }}</span>
                      <button
                        @click="updateCardCount(cardId, cardData.count + 1)"
                        :disabled="cardData.count >= cardData.maxCount"
                        class="px-1 py-0.5 bg-gray-700 rounded disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>

                    <button
                      @click="selectedCards.delete(cardId)"
                      class="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>

              <!-- Search -->
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher une carte..."
                class="w-full px-3 py-2 mb-3 bg-gray-900 rounded border border-gray-700 focus:border-blue-500 outline-none text-sm"
              />

              <!-- Available cards -->
              <div class="mb-4">
                <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
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

                    <div class="absolute top-1 left-1 bg-black/75 text-white text-xs font-bold rounded px-1">
                      x{{ count }}
                    </div>

                    <div
                      v-if="selectedCards.has(card.id)"
                      class="absolute inset-0 flex items-center justify-center"
                    >
                      <div class="bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center">
                        <span class="text-lg">✓</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-2">
                <Button
                  @click="submitProposal"
                  :disabled="selectedCards.size === 0 || tradeStore.loading"
                  class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {{ tradeStore.loading ? 'Envoi...' : 'Envoyer la proposition' }}
                </Button>
                <Button @click="showProposalForm = false; selectedCards.clear()" variant="outline">
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Not found -->
      <div v-else class="text-center py-12">
        <p class="text-gray-400 text-lg mb-4">Offre d'échange introuvable</p>
        <Button @click="goBack">Retour au marché</Button>
      </div>
    </div>
  </div>
</template>
