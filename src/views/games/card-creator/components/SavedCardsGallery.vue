<script setup lang="ts">
import { type Ref } from 'vue';
import { Button } from '@/components/ui';
import CollectibleCard from '../CollectibleCard.vue';
import type useCardStore from '@/stores/cardStore';
import { useUserStore } from '@/stores/userStore';

interface Props {
  cardStore: ReturnType<typeof useCardStore>;
  savedCardsContainer: Ref<HTMLElement | null>;
}

defineProps<Props>();

const userStore = useUserStore();

</script>

<template>
  <div v-if="cardStore.cardsPreview.length > 0" class="space-y-6">
    <div class="flex items-center gap-4">
      <div class="h-px w-16 bg-gradient-to-r from-white/0 via-white/40 to-white/0" />
      <div>
        <p class="text-xs uppercase tracking-[0.4em] text-foam-300/60">Collection</p>
        <h2 class="text-xl font-semibold text-white/90">
          Vos Cartes <span class="text-foam-200/60">({{ cardStore.cardsPreview.length }})</span>
        </h2>
      </div>
    </div>

    <div ref="savedCardsContainer" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <div
        v-for="card in cardStore.cardsPreview"
        :key="card.id"
        :data-saved-card-id="card.id"
        class="flex flex-col items-center min-w-64 w-64"
      >
        <CollectibleCard
          :card="cardStore.cards.find(c => c.id === card.id) || {
            id: card.id,
            title: 'Carte non chargée',
            createdAt: '',
            updatedAt: ''
          }"
          :lazy-load="!cardStore.cards.find(c => c.id === card.id)"
          interactive
        />
        <Button
          variant="danger"
          size="sm"
          class="mt-4"
          @click="cardStore.deleteCard(card.id)"
          :disabled="!userStore.isSuperAdmin"
        >
          Supprimer
        </Button>
      </div>
    </div>
  </div>
</template>
