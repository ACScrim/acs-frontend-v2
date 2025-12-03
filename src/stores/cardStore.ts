import { defineStore } from "pinia";
import type {ApiResponse, CardAsset, CollectibleCard} from "@/types/models";
import { useToastStore } from "@/stores/toastStore.ts";
import api from "@/utils/api.ts";

const useCardStore = defineStore('cards', {
  state: () => ({
    cards: [] as CollectibleCard[],
    cardAssets: [] as CardAsset[],
    loading: false,
  }),
  actions: {
    async fetchCards() {
      this.loading = true;
      try {
        const { data: { data: cards }} = await api.get<ApiResponse<CollectibleCard[]>>("/games/card-creator/cards");
        this.cards = cards;
      } catch {
        useToastStore().error("Erreur lors de la récupération des cartes.");
      } finally {
        this.loading = false;
      }
    },

    async fetchCardAssets() {
      this.loading = true;
      try {
        const { data: { data: assets }} = await api.get<ApiResponse<CardAsset[]>>("/games/card-creator/assets");
        this.cardAssets = assets;
      } catch {
        useToastStore().error("Erreur lors de la récupération des assets.");
      } finally {
        this.loading = false;
      }
    },

    // Mock API: Create a new card asset
    async createCardAsset(assetData: Omit<CardAsset, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<CardAsset | null> {
      this.loading = true;
      try {
        const { data: { data: asset }} = await api.post<ApiResponse<CardAsset>>("/games/card-creator/asset", assetData);
        this.cardAssets.push(asset);
        useToastStore().success("Asset créé avec succès !");
        return asset;
      } catch {
        useToastStore().error("Erreur lors de la création de l'asset.");
        return null;
      } finally {
        this.loading = false;
      }
    },

    // Mock API: Create a new card
    async createCard(cardData: Omit<CollectibleCard, 'id' | 'createdAt'| 'updatedAt' | 'createdBy'>): Promise<CollectibleCard | null> {
      this.loading = true;
      try {
        // In real implementation:
        const { data: { data: card }} = await api.post<ApiResponse<CollectibleCard>>("/games/card-creator/card", cardData);
        this.cards.push(card);
        useToastStore().success("Carte créée avec succès !");
        return card;
      } catch {
        useToastStore().error("Erreur lors de la création de la carte.");
        return null;
      } finally {
        this.loading = false;
      }
    },

    // Mock API: Delete a card
    async deleteCard(cardId: string) {
      this.loading = true;
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        // In real implementation:
        // await api.delete(`/cards/${cardId}`);
        
        this.cards = this.cards.filter(c => c.id !== cardId);
        useToastStore().success("Carte supprimée avec succès !");
      } catch {
        useToastStore().error("Erreur lors de la suppression de la carte.");
      } finally {
        this.loading = false;
      }
    },

    // Get card asset by ID
    getCardAssetById(id: string): CardAsset | undefined {
      return this.cardAssets.find(asset => asset.id === id);
    },

    // Get card assets by category
    getCardAssetsByCategory(category: 'background' | 'border'): CardAsset[] {
      return this.cardAssets.filter(asset => asset.category === category);
    },
  }
});

export default useCardStore;
