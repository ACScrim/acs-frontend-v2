<script setup lang="ts">
import {onUnmounted, ref, watch} from 'vue';
import {useIntersectionObserver} from '@vueuse/core';
import CollectibleCard from '../CollectibleCard.vue';
import {Button} from '@/components/ui';
import useCardStore from '@/stores/cardStore';
import {useUserStore} from '@/stores/userStore';

const cardStore = useCardStore();
const userStore = useUserStore();

const savedCardsContainer = ref<HTMLElement | null>(null);
const activeTimeouts = new Set<number>();

// Handle saved card visibility with intersection observer
const handleSavedCardVisible = (cardId: string) => {
  const card = cardStore.cardsPreview.find(c => c.id === cardId);
  if (card && !cardStore.cards.find(c => c.id === cardId)?.frontAsset) {
    cardStore.fetchFullCard(cardId);
  }
};

// Observe saved cards when container is mounted or updated
const observeSavedCards = () => {
  if (!savedCardsContainer.value) return;

  const cardElements = savedCardsContainer.value.querySelectorAll('[data-saved-card-id]');
  cardElements.forEach(element => {
    useIntersectionObserver(
      element as HTMLElement,
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const cardId = (entry.target as HTMLElement).getAttribute('data-saved-card-id');
            if (cardId) {
              handleSavedCardVisible(cardId);
            }
          }
        });
      },
      {
        threshold: 0.1,
      }
    );
  });
};

// Reobserve saved cards when they change
watch(() => cardStore.cardsPreview.length, () => {
  const timeout = window.setTimeout(observeSavedCards, 100);
  activeTimeouts.add(timeout);
});

// Cleanup timeouts on unmount
onUnmounted(() => {
  activeTimeouts.forEach(timeout => clearTimeout(timeout));
  activeTimeouts.clear();
});

const deleteButtonDisabled = (card: typeof cardStore.cardsPreview[0]) => {
  if (userStore.isSuperAdmin) {
    return false;
  }
  if (card.status === "active") return true;
};
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
          :disabled="deleteButtonDisabled(card)"
        >
          Supprimer
        </Button>
      </div>
    </div>
  </div>
</template>
