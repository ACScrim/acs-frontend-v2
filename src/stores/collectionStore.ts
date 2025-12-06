import {defineStore} from "pinia";
import type {ApiResponse, CardCollection, CollectibleCard} from "@/types/models";
import api from "@/utils/api.ts";
import {useToastStore} from "@/stores/toastStore.ts";

const useCollectionStore = defineStore('collection', {
  state: () => ({
    collection: null as CardCollection | null,
    listCardLoaded: [] as string[]
  }),
  getters: {
    cards(state): CollectibleCard[] {
      return state.collection ? state.collection.cards as CollectibleCard[] : [];
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
    async fetchFullCard(collectionId: string, cardId: string) {
      try {
        const response = await api.get<ApiResponse<CollectibleCard>>(`/card-collection/${collectionId}/cards/${cardId}`);
        if (!this.collection) {
          useToastStore().error("Collection non chargée.");
          return null;
        }
        this.collection = {
          ...this.collection,
          cards: this.collection.cards.map(card =>
            (card as CollectibleCard).id === cardId ? response.data.data : card
          )
        }
        this.listCardLoaded.push(cardId);
        return response.data.data;
      } catch (error) {
        useToastStore().error("Erreur lors de la récupération de la carte.");
        return null;
      }
    },
    unloadFullCard(cardId: string) {
      if (!this.collection) {
        return;
      }
      this.collection = {
        ...this.collection,
        // @ts-ignore
        cards: this.collection.cards.map(card =>
          card.id === cardId
            ? { id: cardId, previewCardB64: (card as CollectibleCard).previewCardB64 }
            : card
        )
      }
      this.listCardLoaded = this.listCardLoaded.filter(id => id !== cardId);
    }
  }
})

export default useCollectionStore;