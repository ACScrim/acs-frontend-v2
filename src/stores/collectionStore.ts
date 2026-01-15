import {defineStore} from "pinia";
import type {ApiResponse, CardCollection, CollectibleCard} from "@/types/models";
import api from "@/utils/api.ts";
import {useToastStore} from "@/stores/toastStore.ts";

export interface CategoryOverviewData {
  categoryId: string;
  categoryName: string;
  totalCards: number;
  ownedCards: {count: number, card: CollectibleCard}[];
}

const useCollectionStore = defineStore('collection', {
  state: () => ({
    collection: null as CardCollection | null,
    listCardLoaded: [] as string[],
    categoriesOverview: [] as CategoryOverviewData[],
    collectionId: '' as string
  }),
  getters: {
    cards(state): CollectibleCard[] {
      return state.collection ? state.collection.cardIds.map(id => {
        const card = state.collection?.cards.find(c => c.id === id);
        if (card && (card as CollectibleCard).frontAsset) {
          return card as CollectibleCard;
        }
        return {
          id,
          title: "Carte non chargée",
          customTexts: [
            {
              content: "Si la carte ne se charge pas, essayez de cliquer dessus",
              posY: 75,
              posX: 50,
              align: "center",
              width: "w-full"
            }
          ],
          rarity: "common",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as CollectibleCard;
      }) : [];
    }
  },
  actions: {
    async fetchCollection() {
      try {
        const response = await api.get<ApiResponse<CardCollection>>('/card-collection/me');
        this.collection = response.data.data;
      } catch (error) {
        useToastStore().error("Erreur lors de la récupération de la collection de cartes.");
      }
    },

    async fetchCategoriesOverview() {
      try {
        const response = await api.get<ApiResponse<{
          categories: CategoryOverviewData[];
          collectionId: string;
        }>>('/card-collection/me/categories-overview');
        this.categoriesOverview = response.data.data.categories;
        this.collectionId = response.data.data.collectionId;
      } catch (error) {
        useToastStore().error("Erreur lors de la récupération des catégories.");
        console.error(error);
      }
    },

    async fetchFullCard(collectionId: string, cardId: string) {
      try {
        const response = await api.get<ApiResponse<CollectibleCard>>(
          `/card-collection/${collectionId}/cards/${cardId}`
        );
        if (!this.collection) {
          useToastStore().error("Collection non chargée.");
          return null;
        }

        const fetched = response.data.data;
        const existingCards = Array.isArray(this.collection.cards) ? this.collection.cards : [];

        // Remplacer si trouvé, sinon préparer insertion
        let found = false;
        const newCards = existingCards.map(card => {
          if (String((card as CollectibleCard).id) === String(cardId)) {
            found = true;
            return fetched;
          }
          return card;
        });

        if (!found) {
          // Insérer à la position correspondant à cardIds si possible, sinon en fin
          const idx = this.collection.cardIds.indexOf(cardId);
          if (idx >= 0 && idx <= newCards.length) {
            newCards.splice(idx, 0, fetched);
          } else {
            newCards.push(fetched);
          }
        }

        // Affectation directe pour conserver la réactivité Pinia
        this.collection.cards = newCards;

        if (!this.listCardLoaded.includes(cardId)) {
          this.listCardLoaded.push(cardId);
        }

        return fetched;
      } catch (error) {
        useToastStore().error("Erreur lors de la récupération de la carte.");
        return null;
      }
    }
  }
})

export default useCollectionStore;