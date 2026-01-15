<script setup lang="ts">
import { computed } from 'vue';
import type { CollectibleCard } from '@/types/models';
import CollectibleCardComponent from '@/views/games/card-creator/CollectibleCard.vue';
import EmptyCardSlot from './EmptyCardSlot.vue';

interface Props {
  categoryName: string;
  cards: {count: number, card: CollectibleCard}[];
  totalCards?: number;
  showEmptySlots?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showEmptySlots: true,
  totalCards: 0,
});

const emit = defineEmits<{
  'item-visible': [card: CollectibleCard];
}>();

// Utiliser le nombre total de cartes du système, ou faire un calcul si non fourni
const totalCardsInCollection = computed(() => {
  return props.totalCards > 0 ? props.totalCards : props.cards.length;
});

// Créer la liste avec emplacements vides
const displayedCards = computed(() => {
  const result: (CollectibleCard | { id: string; isEmpty: true; index: number })[] = [
    ...props.cards.flatMap(c => c.card),
  ];

  if (props.showEmptySlots) {
    const emptyCount = Math.max(0, props.totalCards - props.cards.length);
    for (let i = 0; i < emptyCount; i++) {
      result.push({
        id: `empty-${props.categoryName}-${i}`,
        isEmpty: true,
        index: props.cards.length + i,
      });
    }
  }

  return result;
});

const isEmptySlot = (
  card: CollectibleCard | { id: string; isEmpty: true; index: number }
): card is { id: string; isEmpty: true; index: number } => {
  return 'isEmpty' in card && card.isEmpty;
};
</script>

<template>
  <div class="mb-8">
    <!-- En-tête de catégorie -->
    <div class="mb-4 flex items-center gap-3 border-b border-foam-700 pb-3">
      <div
        class="h-2 w-2 rounded-full bg-gradient-to-r from-foam-400 to-foam-300"
      ></div>
      <h2 class="text-xl font-bold text-foam-50">{{ categoryName }}</h2>
      <span class="text-sm text-foam-400 ml-auto">
        {{ cards.length }}/{{ totalCardsInCollection }}
      </span>
    </div>

    <!-- Grille de cartes -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center"
    >
      <template v-for="card in displayedCards" :key="card.id">
        <!-- Carte existante -->
        <template v-if="!isEmptySlot(card)">
          <div class="w-[250px]">
            <CollectibleCardComponent
              :card="card"
              :data-card-id="card.id"
              interactive
              @click="emit('item-visible', card)"
            />
            <p class="text-end text-sm text-foam-400 mt-1">
              {{ cards.find(c => c.card.id === card.id)?.count }} exemplaire{{ (cards.find(c => c.card.id === card.id)?.count ?? 0) > 1 ? 's' : '' }}
            </p>
          </div>
        </template>

        <!-- Emplacement vide -->
        <template v-else>
          <EmptyCardSlot :index="card.index" />
        </template>
      </template>
    </div>
  </div>
</template>
