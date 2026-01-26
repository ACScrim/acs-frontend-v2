<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import useCollectionStore, {type CategoryOverviewData} from '@/stores/collectionStore';
import useFusionStore from '@/stores/fusionStore';
import type {CollectibleCard} from '@/types/models';
import CollectibleCardComponent from '@/views/games/card-creator/CollectibleCard.vue';
import {Button} from '@/components/ui';
import {useCardFusionAnimation} from '@/composables/useCardFusionAnimation';
import {useResponsiveCardGrid} from '@/composables/useResponsiveCardGrid';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import confetti from 'canvas-confetti';
import ACSSelect from "@/components/ui/ACSSelect.vue";

const collectionStore = useCollectionStore();
const fusionStore = useFusionStore();

const selectedCards = ref<Map<string, { card: CollectibleCard; count: number; maxCount: number }>>(new Map());
const searchQuery = ref('');
const selectedRarity = ref<string>('all');
const showAnimation = ref(false);

const {
  animationPhase,
  spiralCards,
  newCardOpacity,
  newCardScale,
  implosionProgress,
  playFusionAnimation,
  resetAnimation,
} = useCardFusionAnimation();

onMounted(async () => {
  await collectionStore.fetchCategoriesOverview();
});

// Obtenir toutes les cartes possédées de l'utilisateur
const allOwnedCards = computed(() => {
  const cards: { card: CollectibleCard; count: number }[] = [];

  collectionStore.categoriesOverview.forEach((category: CategoryOverviewData) => {
    category.ownedCards.forEach(ownedCard => {
      cards.push(ownedCard);
    });
  });

  return cards;
});

// Filtrer les cartes par rareté et recherche
const filteredCards = computed(() => {
  let cards = allOwnedCards.value;

  // Filtrer par rareté
  if (selectedRarity.value !== 'all') {
    cards = cards.filter(c => c.card.rarity === selectedRarity.value);
  }

  // Filtrer par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    cards = cards.filter(c => c.card.title.toLowerCase().includes(query));
  }

  // Ne montrer que les raretés fusionnables
  cards = cards.filter(c => fusionStore.canFuseRarity(c.card.rarity || 'common'));

  return cards;
});

// Compter les cartes sélectionnées par rareté
const selectedCardsGroupedByRarity = computed(() => {
  const grouped = new Map<string, CollectibleCard[]>();

  selectedCards.value.forEach(({ card, count }) => {
    const rarity = card.rarity || 'common';
    if (!grouped.has(rarity)) {
      grouped.set(rarity, []);
    }
    for (let i = 0; i < count; i++) {
      grouped.get(rarity)!.push(card);
    }
  });

  return grouped;
});

// Déterminer quelle fusion est possible
const fusionInfo = computed(() => {
  // Aucune sélection
  if (selectedCards.value.size === 0) return null;

  // Doit être une seule rareté
  if (selectedCardsGroupedByRarity.value.size > 1) {
    return {
      canFuse: false,
      error: 'Toutes les cartes doivent être de la même rareté'
    };
  }

  const entries = Array.from(selectedCardsGroupedByRarity.value.entries());
  if (entries.length === 0) return null;

  const [rarity, cards] = entries[0] as [string, CollectibleCard[]];
  const count = cards.length;
  const nextRarity = fusionStore.nextRarity(rarity);

  const ids: string[] = [];
  selectedCards.value.forEach(({ card, count }) => {
    for (let i = 0; i < count; i++) ids.push(card.id);
  });
  const uniqueIds = new Set(ids);

  // Règle: soit 3 cartes identiques, soit 5 cartes différentes (toujours même rareté)
  if (count === 3 || uniqueIds.size === 1) {
    // Vérifier qu'il s'agit de 3 exemplaires de la même carte
    if (uniqueIds.size !== 1) {
      return {
        canFuse: false,
        rarity,
        count,
        required: 3,
        nextRarity,
        error: 'Pour fusionner 3 cartes, sélectionnez 3 exemplaires d\'une même carte'
      };
    }

    return {
      canFuse: true,
      rarity,
      count,
      required: 3,
      nextRarity,
      cards
    };
  }

  if (count === 5) {
    return {
      canFuse: true,
      rarity,
      count,
      required: 5,
      nextRarity,
      cards
    };
  }

  // Cas intermédiaire: count <3 ou count == 4 ou >5 (UI limite à 5 mais on gère)
  if (count < 3) {
    return {
      canFuse: false,
      rarity,
      count,
      required: 3,
      nextRarity,
      error: `Sélectionnez au moins 3 cartes (${3 - count} de plus)`
    };
  }

  if (count === 4) {
    return {
      canFuse: false,
      rarity,
      count,
      required: 5,
      nextRarity,
      error: 'La sélection de 4 cartes n\'est pas acceptée — choisissez 3 exemplaires identiques ou 5 cartes différentes'
    };
  }

  if (count > 5) {
    return {
      canFuse: false,
      rarity,
      count,
      required: 5,
      nextRarity,
      error: 'Vous ne pouvez pas sélectionner plus de 5 cartes pour une fusion'
    };
  }

  return {
    canFuse: false,
    rarity,
    count,
    required: 3,
    nextRarity,
    error: 'Sélection invalide pour la fusion'
  };
});

// Calculer le nombre total de cartes sélectionnées
const totalSelectedCardsCount = computed(() => {
  let total = 0;
  selectedCards.value.forEach(({ count }) => {
    total += count;
  });
  return total;
});

// Obtenir le maximum de cartes autorisé pour une rareté
const getMaxCardsForRarity = (rarity: string): number => {
  // On permet de sélectionner jusqu'à 5 cartes (nouvelle règle)
  return 5;
};

// Vérifier si on peut ajouter plus de cartes
const canAddMoreCards = (rarity: string): boolean => {
  const maxForRarity = getMaxCardsForRarity(rarity);
  return totalSelectedCardsCount.value < maxForRarity;
};

// Vérifier si une carte spécifique peut être sélectionnée
const canSelectCard = (card: CollectibleCard): boolean => {
  const rarity = card.rarity || 'common';

  // Si la carte est déjà sélectionnée, on peut toujours la désélectionner
  if (selectedCards.value.has(card.id)) {
    return true;
  }

  // Si on a déjà des cartes sélectionnées
  if (selectedCards.value.size > 0) {
    const firstSelectedCard = Array.from(selectedCards.value.values())[0];
    if (!firstSelectedCard) return false;

    const firstRarity = firstSelectedCard.card.rarity || 'common';

    // Vérifier que c'est la même rareté
    if (firstRarity !== rarity) {
      return false;
    }
  }

  // Vérifier qu'on n'a pas atteint la limite
  return canAddMoreCards(rarity);
};

const toggleCardSelection = (card: CollectibleCard, maxCount: number) => {
  const rarity = card.rarity || 'common';

  if (selectedCards.value.has(card.id)) {
    selectedCards.value.delete(card.id);
  } else {
    // Vérifier si on peut ajouter cette carte
    if (!canAddMoreCards(rarity)) {
      return; // Ne rien faire si on a atteint la limite
    }

    // Vérifier si toutes les cartes sélectionnées sont de la même rareté
    if (selectedCards.value.size > 0) {
      const firstSelectedCard = Array.from(selectedCards.value.values())[0];
      if (!firstSelectedCard) return;

      const firstRarity = firstSelectedCard.card.rarity || 'common';
      if (firstRarity !== rarity) {
        // Ne pas permettre de mélanger les raretés
        return;
      }
    }

    selectedCards.value.set(card.id, { card, count: 1, maxCount });
  }
};

const updateCardCount = (cardId: string, newCount: number) => {
  const cardData = selectedCards.value.get(cardId);
  if (!cardData) return;

  const rarity = cardData.card.rarity || 'common';
  const maxForRarity = getMaxCardsForRarity(rarity);

  // Calculer le total sans cette carte
  const totalWithoutThisCard = totalSelectedCardsCount.value - cardData.count;

  // Vérifier que le nouveau total ne dépasse pas la limite
  const newTotal = totalWithoutThisCard + newCount;

  if (newCount > 0 && newCount <= cardData.maxCount && newTotal <= maxForRarity) {
    cardData.count = newCount;
  }
};

const performFusion = async () => {
  if (!fusionInfo.value?.canFuse || !fusionInfo.value.cards) return;

  const cardIds: string[] = [];
  selectedCards.value.forEach(({ card, count }) => {
    for (let i = 0; i < count; i++) {
      cardIds.push(card.id);
    }
  });

  // Prendre seulement le nombre requis
  const cardsToFuse = cardIds.slice(0, fusionInfo.value.required);
  const cardsObjects = fusionInfo.value.cards.slice(0, fusionInfo.value.required);

  // Commencer l'animation
  showAnimation.value = true;
  await playFusionAnimation(cardsObjects);

  // Appeler l'API
  const result = await fusionStore.fuseCards(cardsToFuse);

  if (result) {
    // Confetti pour célébrer !
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Attendre un peu avant de fermer l'animation
    setTimeout(() => {
      showAnimation.value = false;
      resetAnimation();
      selectedCards.value.clear();
      fusionStore.clearLastFusionResult();
    }, 3000);
  } else {
    showAnimation.value = false;
    resetAnimation();
  }
};

// Mapper les raretés aux couleurs
const rarityColors: Record<string, string> = {
  common: '#808080',
  uncommon: '#22C55E',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#FBBF24',
};

const rarityLabels: Record<string, string> = {
  common: 'Commun',
  uncommon: 'Peu commun',
  rare: 'Rare',
  epic: 'Épique',
  legendary: 'Légendaire',
};

const cardsGrid = ref<HTMLElement | null>(null);
const { maxCardWidth } = useResponsiveCardGrid(cardsGrid, {
  breakpoints: {
    1024: { cells: 5, gap: 16 },
    768: { cells: 4, gap: 16 },
    640: { cells: 3, gap: 16 },
    0: { cells: 2, gap: 16 }
  },
  defaultWidth: 150
});
</script>

<template>
  <div class="flex h-full w-full flex-col gap-6 p-6">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold text-white">Fusion de cartes</h1>
      <p class="text-sm text-foam-300">Fusionnez plusieurs cartes pour obtenir une carte de rareté supérieure</p>
    </div>

    <!-- Fusion Info Panel -->
    <div v-if="fusionInfo" class="rounded-xl bg-surface-800/50 p-4 border border-surface-700">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm text-foam-300">Cartes sélectionnées:</span>
            <span
              v-if="fusionInfo.rarity && fusionInfo.count !== undefined && fusionInfo.required !== undefined"
              class="text-lg font-bold"
              :style="{ color: rarityColors[fusionInfo.rarity] }"
            >
              {{ fusionInfo.count }} / {{ fusionInfo.required }} {{ rarityLabels[fusionInfo.rarity] }}
            </span>
          </div>

          <VueIcon name="bs:arrow-right" class="size-5 text-foam-400" />

          <div class="flex items-center gap-2">
            <span class="text-sm text-foam-300">Résultat:</span>
            <span v-if="fusionInfo.nextRarity" class="text-lg font-bold" :style="{ color: rarityColors[fusionInfo.nextRarity] }">
              1 {{ rarityLabels[fusionInfo.nextRarity] }}
            </span>
          </div>
        </div>

        <Button
          @click="performFusion"
          :disabled="!fusionInfo.canFuse || fusionStore.loading"
          class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <VueIcon name="bx:merge" class="size-5 mr-2" />
          Fusionner {{ fusionInfo.required }} cartes
        </Button>
      </div>

      <p v-if="!fusionInfo.canFuse && fusionInfo.error" class="mt-2 text-sm text-red-400">
        {{ fusionInfo.error }}
      </p>

      <!-- Barre de progression -->
      <div v-if="fusionInfo.count !== undefined && fusionInfo.count > 0 && fusionInfo.required !== undefined && fusionInfo.rarity" class="mt-3">
        <div class="h-2 bg-surface-700 rounded-full overflow-hidden">
          <div
            class="h-full transition-all duration-300"
            :style="{
              width: `${(fusionInfo.count / fusionInfo.required) * 100}%`,
              backgroundColor: rarityColors[fusionInfo.rarity]
            }"
          />
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex gap-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher une carte..."
        class="form-input"
      />

      <ACSSelect
        v-model="selectedRarity"
        :options=" [
            { label: 'Toutes les raretés', value: 'all' },
            { label: 'Commun', value: 'common' },
            { label: 'Peu commun', value: 'uncommon' },
            { label: 'Rare', value: 'rare' },
            { label: 'Épique', value: 'epic' }
        ]"
      />
    </div>

    <!-- Selected Cards -->
    <div v-if="selectedCards.size > 0" class="rounded-lg bg-surface-800/30 pb-8 pt-4">
      <h3 class="mb-3 ml-3 text-sm font-semibold text-white">Cartes sélectionnées ({{ selectedCards.size }})</h3>
      <div class="grid grid-cols-2 gap-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 p-2">
        <div
          v-for="[cardId, { card, count, maxCount }] of selectedCards"
          :key="cardId"
          class="relative"
        >
          <div class="cursor-pointer transition hover:scale-105" @click="toggleCardSelection(card, maxCount)">
            <CollectibleCardComponent :card="card" :interactive="false" :maxWidth="maxCardWidth" />
          </div>
          <div class="absolute translate-x-1/2 right-1/2 -bottom-8 flex items-center gap-1 rounded-lg bg-surface-900 px-2 py-1 text-xs">
            <button @click.stop="updateCardCount(cardId, Math.max(1, count - 1))" class="text-foam-400 hover:text-white">
              <VueIcon name="bs:dash" class="size-3" />
            </button>
            <span class="text-white font-bold">{{ count }}</span>
            <button @click.stop="updateCardCount(cardId, Math.min(maxCount, count + 1))" class="text-foam-400 hover:text-white">
              <VueIcon name="bs:plus" class="size-3" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Available Cards Grid -->
    <div class="flex-1 overflow-y-auto">
      <div ref="cardsGrid" class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 p-2">
        <div
          v-for="ownedCard in filteredCards"
          :key="ownedCard.card.id"
          class="relative transition"
          :class="{
            'ring-2 ring-accent-500 rounded-md': selectedCards.has(ownedCard.card.id),
            'cursor-pointer hover:scale-105': canSelectCard(ownedCard.card),
            'opacity-50 cursor-not-allowed': !canSelectCard(ownedCard.card)
          }"
          @click="canSelectCard(ownedCard.card) && toggleCardSelection(ownedCard.card, ownedCard.count)"
        >
          <CollectibleCardComponent :card="ownedCard.card" :maxWidth="maxCardWidth" :interactive="false" />
          <div class="absolute right-2 top-2 rounded-full bg-base-900/80 px-2 py-1 text-xs font-bold text-white">
            x{{ ownedCard.count }}
          </div>
        </div>
      </div>

      <div v-if="filteredCards.length === 0" class="flex h-full items-center justify-center text-foam-400">
        <div class="text-center">
          <VueIcon name="bs:inbox" class="mx-auto size-12 mb-4" />
          <p>Aucune carte fusionnable trouvée</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Animation Modal -->
  <Teleport to="body">
    <div
      v-if="showAnimation"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
    >
      <!-- Spirale d'aspiration -->
      <div v-if="animationPhase === 'spiraling' || animationPhase === 'imploding'" class="relative h-screen w-screen overflow-hidden">
        <!-- Effet de vortex au centre -->
        <div
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          :style="{
            width: `${200 * (1 - implosionProgress)}px`,
            height: `${200 * (1 - implosionProgress)}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${fusionInfo?.nextRarity ? rarityColors[fusionInfo.nextRarity] : '#fff'}40, transparent)`,
            boxShadow: `0 0 ${100 * (1 + implosionProgress)}px ${fusionInfo?.nextRarity ? rarityColors[fusionInfo.nextRarity] : '#fff'}80`,
            opacity: animationPhase === 'imploding' ? implosionProgress : 0.5,
          }"
        />

        <!-- Cartes en spirale -->
        <div
          v-for="spiralCard in spiralCards"
          :key="spiralCard.id"
          class="absolute left-1/2 top-1/2"
          :style="{
            transform: `
              translate(-50%, -50%)
              rotate(${spiralCard.angle}deg)
              translateX(${spiralCard.radius}px)
              rotate(${-spiralCard.angle}deg)
              scale(${spiralCard.scale})
            `,
            opacity: spiralCard.opacity,
            transition: 'none',
            width: '150px',
            filter: `blur(${(1 - spiralCard.scale) * 2}px)`,
          }"
        >
          <CollectibleCardComponent
            :card="spiralCard.card"
            :scale="0.6"
            :interactive="false"
          />
        </div>
      </div>

      <!-- Révélation de la nouvelle carte -->
      <div
        v-if="animationPhase === 'revealing' || animationPhase === 'complete'"
        class="flex flex-col items-center gap-6"
      >
        <div
          :style="{
            opacity: newCardOpacity,
            transform: `scale(${newCardScale})`,
            transition: 'all 0.3s ease-out',
          }"
        >
          <CollectibleCardComponent
            v-if="fusionStore.lastFusionResult"
            :card="fusionStore.lastFusionResult.newCard"
            :scale="1.5"
            :interactive="false"
          />
        </div>

        <div
          v-if="animationPhase === 'complete' && fusionStore.lastFusionResult"
          class="text-center"
          :style="{
            opacity: newCardOpacity,
            transition: 'opacity 0.5s ease-in',
          }"
        >
          <h2 class="text-3xl font-bold text-white mb-2">Félicitations !</h2>
          <p class="text-xl" :style="{ color: rarityColors[fusionStore.lastFusionResult.newRarity] }">
            Vous avez obtenu : {{ fusionStore.lastFusionResult.newCard.title }}
          </p>
          <p class="text-sm text-foam-300 mt-2">
            Rareté : {{ rarityLabels[fusionStore.lastFusionResult.newRarity] }}
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>
