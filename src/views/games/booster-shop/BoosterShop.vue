<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useUserStore } from "@/stores/userStore";
import BoosterOpener from "@/components/games/BoosterOpener.vue";
import { useToastStore } from "@/stores/toastStore";
import type { CollectibleCard } from "@/types/models";
import useBoosterStore from "@/stores/boosterStore.ts";
import Button from "@/components/ui/Button.vue";
import Card from "@/components/ui/Card.vue";

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
});

// État
const selectedBooster = ref<BoosterOption | null>(null);
const isOpenerOpen = ref(false);
const isLoading = computed(() => boosterStore.isOpening);
const receivedCards = ref<CollectibleCard[]>([]);

// Suffisant de scrimium?
const hasEnoughScrimium = computed(() => {
  if (!selectedBooster.value) return false;
  return (
    (userStore.user?.scrimium?.balance || 0) >= selectedBooster.value.price
  );
});

const currentBalance = computed(() => userStore.user?.scrimium?.balance || 0);

// Acheter et ouvrir le booster
const buyAndOpenBooster = async () => {
  if (!selectedBooster.value) return;

  if (!hasEnoughScrimium.value) {
    toastStore.error(
      `Tu n'as pas assez de Scrimium. Il t'en manque ${
        selectedBooster.value.price - currentBalance.value
      }.`
    );
    return;
  }

  // Remplacer cette simulation par l'appel API réel
  const booster = await boosterStore.buyBooster(selectedBooster.value.id);
  receivedCards.value = booster.cards;
  toastStore.success(
    `Booster acheté! Tu as dépensé ${selectedBooster.value?.price} Scrimium.`
  );
  isOpenerOpen.value = true;
  userStore.fetchUser().then();
};

const handleOpenerClose = () => {
  isOpenerOpen.value = false;
  selectedBooster.value = null;
};

// Couleurs pour les raretés (utilisé pour les badges)
const rarityColors = {
  starter: "from-gray-600 to-gray-400",
  standard: "from-green-600 to-green-400",
  premium: "from-blue-600 to-blue-400",
  deluxe: "from-yellow-600 to-yellow-400",
};
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- En-tête avec titre principal -->
    <div class="text-center space-y-3 mb-8">
      <h1
        class="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-azure-400 to-accent-400 bg-clip-text text-transparent"
      >
        🎁 Boutique de Boosters
      </h1>
      <p class="text-foam-300 text-lg">
        Achète des boosters pour obtenir de nouvelles cartes!
      </p>
    </div>

    <!-- Solde de Scrimium avec Card -->
    <Card
      class="p-6 bg-gradient-to-br from-emerald-500/10 via-accent-500/10 to-blush-500/10 border border-emerald-500/30"
    >
      <div class="flex items-center justify-between">
        <div>
          <p
            class="text-sm font-medium text-emerald-300 uppercase tracking-widest mb-1"
          >
            💰 Solde Scrimium
          </p>
          <div class="flex items-center gap-3">
            <p class="text-3xl font-bold text-foam-50">
              {{ currentBalance.toLocaleString() }}
            </p>
            <img
              src="/scrimium.svg"
              width="40"
              height="40"
              alt="Scrimium"
              class="object-contain"
            />
          </div>
        </div>
        <div
          class="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-accent-500 flex items-center justify-center"
        >
          <img
            src="/scrimium.svg"
            width="32"
            height="32"
            alt="Scrimium"
            class="object-contain"
          />
        </div>
      </div>
    </Card>

    <!-- Grille de boosters avec Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card
        v-for="booster in boosterStore.boosterShop"
        :key="booster.id"
        class="cursor-pointer transition-all duration-300 transform hover:scale-105 border-2 overflow-hidden group"
        :class="{
          'ring-2 ring-accent-500 border-accent-500 shadow-2xl shadow-accent-500/25':
            selectedBooster?.id === booster.id,
          'border-white/10 hover:border-white/30 hover:shadow-xl':
            selectedBooster?.id !== booster.id,
        }"
        @click="selectedBooster = booster"
      >
        <!-- Fond gradient animé -->
        <div
          class="absolute inset-0 bg-gradient-to-br transition-all duration-500 rounded-[var(--radius-xl)]"
          :class="{
            'from-accent-500/20 via-emerald-500/20 to-blush-500/20':
              selectedBooster?.id === booster.id,
            'from-slate-800/20 via-slate-700/20 to-slate-800/20 group-hover:from-slate-700/30 group-hover:via-slate-600/30':
              selectedBooster?.id !== booster.id,
          }"
        ></div>

        <!-- Effet de brillance -->
        <div
          class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-[var(--radius-xl)]"
        ></div>

        <div class="relative p-6 flex flex-col gap-4 h-full">
          <!-- En-tête de la carte -->
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl transform group-hover:scale-110 transition-transform duration-300"
                :class="`${rarityColors[booster.id as keyof typeof rarityColors]}`"
              >
                🎁
              </div>
              <div>
                <h3 class="text-xl font-bold text-foam-50">
                  {{ booster.name }}
                </h3>
                <p class="text-foam-300 text-sm mt-1">
                  {{ booster.description }}
                </p>
              </div>
            </div>
            <div
              class="px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r backdrop-blur-sm border border-white/20"
              :class="`${rarityColors[booster.id as keyof typeof rarityColors]}`"
            >
              {{ booster.cardsCount }} cartes
            </div>
          </div>

          <!-- Séparateur -->
          <div class="h-px bg-gradient-to-r from-white/10 to-transparent" />

          <!-- Prix -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-3xl font-bold text-foam-50">{{
                booster.price
              }}</span>
              <img
                src="/scrimium.svg"
                width="30"
                height="30"
                alt="Scrimium"
                class="object-contain transform group-hover:rotate-12 transition-transform duration-300"
              />
            </div>

            <!-- Indicateur de sélection -->
            <div
              v-if="selectedBooster?.id === booster.id"
              class="flex items-center gap-2"
            >
              <div
                class="w-3 h-3 rounded-full bg-gradient-to-r from-accent-400 to-emerald-500 animate-pulse"
              ></div>
              <span class="text-accent-300 text-sm font-semibold"
                >Sélectionné</span
              >
            </div>
          </div>

          <!-- Statut d'accessibilité -->
          <div v-if="selectedBooster?.id === booster.id" class="mt-2">
            <div
              v-if="hasEnoughScrimium"
              class="flex items-center gap-2 text-emerald-400 text-sm font-medium"
            >
              <span>✓</span>
              <span>Vous pouvez acheter ce booster</span>
            </div>
            <div
              v-else
              class="flex items-center gap-2 text-red-400 text-sm font-medium"
            >
              <span>⚠</span>
              <span
                >Il vous manque
                {{ booster.price - currentBalance }} Scrimium</span
              >
            </div>
          </div>

          <!-- Bouton de sélection -->
          <Button
            class="w-full mt-auto"
            :variant="selectedBooster?.id === booster.id ? 'primary' : 'ghost'"
            :disabled="selectedBooster?.id === booster.id && !hasEnoughScrimium"
            @click.stop="selectedBooster = booster"
          >
            {{
              selectedBooster?.id === booster.id && !hasEnoughScrimium
                ? "Pas assez de Scrimium"
                : "Sélectionner"
            }}
          </Button>
        </div>
      </Card>
    </div>

    <!-- Zone d'achat avec Card et Buttons -->
    <Card
      v-if="selectedBooster"
      class="p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/20"
    >
      <div class="flex flex-col gap-4">
        <!-- Infos du booster sélectionné -->
        <div class="flex items-center gap-4 pb-4 border-b border-white/10">
          <div
            class="w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center text-2xl"
            :class="`${rarityColors[selectedBooster.id as keyof typeof rarityColors]}`"
          >
            🎁
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-white">
              {{ selectedBooster.name }}
            </h3>
            <p class="text-sm text-foam-300">
              {{ selectedBooster.cardsCount }} cartes •
              {{ selectedBooster.price }} Scrimium
            </p>
          </div>
        </div>

        <div class="flex gap-4">
          <Button
            variant="primary"
            size="lg"
            class="flex-1"
            :disabled="!hasEnoughScrimium || isLoading"
            :loading="isLoading"
            @click="buyAndOpenBooster"
          >
            <template v-if="!isLoading">
              Acheter {{ selectedBooster.name }} - {{ selectedBooster.price }} Ⓢ
            </template>
          </Button>

          <Button variant="secondary" size="lg" @click="selectedBooster = null">
            Annuler
          </Button>
        </div>

        <!-- Message d'erreur si pas assez de Scrimium -->
        <div
          v-if="!hasEnoughScrimium"
          class="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
        >
          <div class="flex items-center gap-2 text-red-400">
            <span>⚠️</span>
            <span class="font-medium">Scrimium insuffisant</span>
          </div>
          <p class="text-red-300 text-sm mt-1">
            Il vous manque
            <strong>{{ selectedBooster.price - currentBalance }}</strong>
            Scrimium pour acheter ce booster.
          </p>
        </div>
      </div>
    </Card>

    <!-- Message si aucun booster sélectionné -->
    <Card v-else class="text-center py-12">
      <div class="text-6xl mb-4">🎁</div>
      <h3 class="text-xl font-semibold text-white mb-2">
        Choisissez votre booster
      </h3>
      <p class="text-foam-400">
        Sélectionnez un booster ci-dessus pour commencer votre achat!
      </p>
    </Card>
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
