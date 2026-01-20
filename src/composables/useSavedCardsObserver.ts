import { onMounted, onUnmounted, watch, type Ref } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';
import type useCardStore from '@/stores/cardStore';

export function useSavedCardsObserver(
  savedCardsContainer: Ref<HTMLElement | null>,
  cardStore: ReturnType<typeof useCardStore>
) {
  const activeTimeouts = new Set<number>();

  /**
   * Handle saved card visibility with intersection observer
   */
  const handleSavedCardVisible = (cardId: string) => {
    const card = cardStore.cardsPreview.find((c) => c.id === cardId);
    if (card && !cardStore.cards.find((c) => c.id === cardId)?.frontAsset) {
      cardStore.fetchFullCard(cardId);
    }
  };

  /**
   * Observe saved cards when container is mounted or updated
   */
  const observeSavedCards = () => {
    if (!savedCardsContainer.value) return;

    const cardElements = savedCardsContainer.value.querySelectorAll('[data-saved-card-id]');
    cardElements.forEach((element) => {
      useIntersectionObserver(
        element as HTMLElement,
        (entries) => {
          entries.forEach((entry) => {
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
  watch(
    () => cardStore.cardsPreview.length,
    () => {
      const timeout = window.setTimeout(observeSavedCards, 100);
      activeTimeouts.add(timeout);
    }
  );

  onMounted(() => {
    // Initial observation of saved cards
    observeSavedCards();
  });

  onUnmounted(() => {
    // Cleanup timeouts
    activeTimeouts.forEach((id) => clearTimeout(id));
    activeTimeouts.clear();
  });

  return {
    handleSavedCardVisible,
    observeSavedCards,
  };
}
