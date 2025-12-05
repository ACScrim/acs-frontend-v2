<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import { useUserStore } from '@/stores/userStore';
import BoosterOpener from '@/components/games/BoosterOpener.vue';
import { useToastStore } from '@/stores/toastStore';
import type { CollectibleCard } from '@/types/models';
import useBoosterStore from "@/stores/boosterStore.ts";

interface BoosterOption {
  id: string;
  name: string;
  price: number;
  cardsCount: number;
  description: string;
  discount?: number;
}

const userStore = useUserStore();
const toastStore = useToastStore();
const boosterStore = useBoosterStore();

onMounted(async () => {
  await boosterStore.fetchBoosterShop();
})

// État
const selectedBooster = ref<BoosterOption | null>(null);
const isOpenerOpen = ref(false);
const isLoading = computed(() => boosterStore.isOpening);
const receivedCards = ref<CollectibleCard[]>([]);

// Suffisant de scrimium?
const hasEnoughScrimium = computed(() => {
  if (!selectedBooster.value) return false;
  return (userStore.user?.scrimium?.balance || 0) >= selectedBooster.value.price;
});

const currentBalance = computed(() => userStore.user?.scrimium?.balance || 0);

// Acheter et ouvrir le booster
const buyAndOpenBooster = async () => {
  if (!selectedBooster.value) return;

  if (!hasEnoughScrimium.value) {
    toastStore.error(`Tu n'as pas assez de Scrimium. Il t'en manque ${selectedBooster.value.price - currentBalance.value}.`);
    return;
  }

  // Remplacer cette simulation par l'appel API réel
  const booster = await boosterStore.buyBooster(selectedBooster.value.id);
  receivedCards.value = booster.cards;
  toastStore.success(`Booster acheté! Tu as dépensé ${selectedBooster.value?.price} Scrimium.`);
  isOpenerOpen.value = true;
  userStore.fetchUser().then();
};

const handleOpenerClose = () => {
  isOpenerOpen.value = false;
  selectedBooster.value = null;
};

// Couleurs pour les raretés (utilisé pour les badges)
const rarityColors = {
  starter: 'from-gray-600 to-gray-400',
  standard: 'from-green-600 to-green-400',
  premium: 'from-blue-600 to-blue-400',
  deluxe: 'from-yellow-600 to-yellow-400',
};
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- En-tête -->
    <div class="flex flex-col gap-2">
      <h2 class="text-2xl font-bold text-foam-50">Boutique de Boosters</h2>
      <p class="text-foam-300">Achète des boosters pour obtenir de nouvelles cartes!</p>
    </div>

    <!-- Solde de Scrimium -->
    <div class="glass-panel p-4 rounded-xl border border-white/10 flex items-center justify-between">
      <div>
        <p class="text-sm text-foam-300">Solde Scrimium</p>
        <p class="text-2xl font-bold text-foam-50">
          {{ currentBalance.toLocaleString() }}
          <span class="text-sm text-foam-300 ml-1">Ⓢ</span>
        </p>
      </div>
      <div class="text-4xl opacity-20">💰</div>
    </div>

    <!-- Grille de boosters -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
          v-for="booster in boosterStore.boosterShop"
          :key="booster.id"
          class="glass-panel rounded-xl border border-white/10 overflow-hidden cursor-pointer transition-all duration-300"
          :class="{
          'ring-2 ring-accent-500 border-accent-500': selectedBooster?.id === booster.id,
          'hover:border-white/20': selectedBooster?.id !== booster.id,
        }"
          @click="selectedBooster = booster"
      >
        <div class="p-6 flex flex-col gap-4 h-full">
          <!-- En-tête de la carte -->
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="text-xl font-bold text-foam-50">{{ booster.name }}</h3>
              <p class="text-foam-300 text-sm mt-1">{{ booster.description }}</p>
            </div>
            <div
                class="px-3 py-1 rounded-full text-xs font-semibold text-white"
                :class="`bg-gradient-to-r ${rarityColors[booster.id as keyof typeof rarityColors]}`"
            >
              {{ booster.cardsCount }} cartes
            </div>
          </div>

          <!-- Séparateur -->
          <div class="h-px bg-gradient-to-r from-white/10 to-transparent" />

          <!-- Prix et réduction -->
          <div class="flex items-baseline gap-3">
            <span class="text-3xl font-bold text-foam-50">
              {{ booster.price }}
              <span class="text-sm text-foam-300 ml-1">Ⓢ</span>
            </span>
          </div>

          <!-- Bouton d'achat -->
          <button
              class="w-full mt-auto py-3 px-4 font-semibold rounded-lg transition-all duration-200"
              :class="{
              'bg-gradient-to-r from-accent-500 to-blush-500 text-ink-900 hover:brightness-110': selectedBooster?.id === booster.id,
              'bg-white/5 text-foam-300 hover:bg-white/10': selectedBooster?.id !== booster.id,
              'opacity-50 cursor-not-allowed': !hasEnoughScrimium && selectedBooster?.id === booster.id,
            }"
              :disabled="selectedBooster?.id === booster.id && !hasEnoughScrimium"
              @click.stop="selectedBooster = booster"
          >
            {{ selectedBooster?.id === booster.id && !hasEnoughScrimium ? 'Pas assez de Scrimium' : 'Sélectionner' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Bouton d'achat final -->
    <div v-if="selectedBooster" class="flex gap-4">
      <button
          class="flex-1 py-4 px-6 bg-gradient-to-r from-accent-500 to-blush-500 text-ink-900 font-bold text-lg rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!hasEnoughScrimium || isLoading"
          @click="buyAndOpenBooster"
      >
        <span v-if="!isLoading">
          Acheter {{ selectedBooster.name }} - {{ selectedBooster.price }} Ⓢ
        </span>
        <span v-else class="flex items-center justify-center gap-2">
          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Traitement en cours...
        </span>
      </button>
      <button
          class="px-6 py-4 bg-white/5 text-foam-300 font-semibold rounded-lg hover:bg-white/10 transition-all"
          @click="selectedBooster = null"
      >
        Annuler
      </button>
    </div>

    <!-- Message si aucun booster sélectionné -->
    <div v-else class="text-center py-8 text-foam-400">
      <p>Sélectionne un booster pour commencer</p>
    </div>
  </div>

  <!-- Composant d'ouverture du booster -->
  <BoosterOpener
      :isOpen="isOpenerOpen"
      :cards="receivedCards"
      @close="handleOpenerClose"
  />
</template>

<style scoped>
.glass-panel {
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(10px);
}
</style>

