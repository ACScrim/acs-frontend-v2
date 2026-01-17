import {defineStore} from "pinia";
import type {ApiResponse, CardAsset, CollectibleCard} from "@/types/models";
import {useToastStore} from "@/stores/toastStore.ts";
import api from "@/utils/api.ts";

const useCardStore = defineStore('cards', {
  state: () => ({
    cards: [] as CollectibleCard[],
    cardsPreview: [] as Pick<CollectibleCard, 'id' | 'status'>[],
    cardAssets: [] as CardAsset[],
    discordAvatars: [] as { id: string; username: string; avatarUrl: string }[],
    mainCardImages: [] as { publicId: string; url: string; secure_url: string }[],
    loading: false,
  }),
  actions: {
    async fetchCardsPreviews() {
      this.loading = true;
      try {
        const { data: { data: cards }} = await api.get<ApiResponse<Pick<CollectibleCard, 'id' | 'status'>[]>>("/games/card-creator/cards");
        this.cardsPreview = cards;
      } catch {
        useToastStore().error("Erreur lors de la récupération des cartes.");
      } finally {
        this.loading = false;
      }
    },

    async fetchFullCard(cardId: string) {
      this.loading = true;
      try {
        const { data: { data: card }} = await api.get<ApiResponse<CollectibleCard>>(`/games/card-creator/cards/${cardId}`);
        const existingIndex = this.cards.findIndex(c => c.id === cardId);
        if (existingIndex !== -1) {
          this.cards[existingIndex] = card;
        } else {
          this.cards.push(card);
        }
        return card;
      } catch {
        useToastStore().error("Erreur lors de la récupération de la carte.");
        return null;
      } finally {
        this.loading = false;
      }
    },

    clearFullCardPreview(cardId: string) {
      this.cards = this.cards.filter(c => c.id !== cardId);
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

    async fetchDiscordAvatars() {
      this.loading = true;
      try {
        const { data: { data: avatars }} = await api.get<ApiResponse<{ id: string; username: string; avatarUrl: string }[]>>("/games/card-creator/discord-avatars");
        this.discordAvatars = avatars;
      } catch {
        useToastStore().error("Erreur lors de la récupération des avatars Discord.");
      } finally {
        this.loading = false;
      }
    },

    async fetchMainCardImages() {
      this.loading = true;
      try {
        const { data: { data: images }} = await api.get<ApiResponse<{ publicId: string; url: string; secure_url: string }[]>>("/games/card-creator/main-images");
        this.mainCardImages = images;
      } catch {
        useToastStore().error("Erreur lors de la récupération des images principales des cartes.");
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

    async createCard(cardData: Omit<CollectibleCard, 'id' | 'createdAt'| 'updatedAt' | 'createdBy'>): Promise<CollectibleCard | null> {
      this.loading = true;
      try {
        const { data: { data: card }} = await api.post<ApiResponse<CollectibleCard>>("/games/card-creator/card", cardData);
        this.cards.push(card);
        useToastStore().success("Carte créée avec succès !");
        return card;
      } catch (error) {
        useToastStore().error("Erreur lors de la création de la carte.");
        return null;
      } finally {
        this.loading = false;
      }
    },

    async deleteCard(cardId: string) {
      this.loading = true;
      try {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette carte ? Cette action est irréversible.")) {
          await api.delete(`/games/card-creator/card/${cardId}`);

          this.cards = this.cards.filter(c => c.id !== cardId);
          useToastStore().success("Carte supprimée avec succès !");
        }
      } catch {
        useToastStore().error("Erreur lors de la suppression de la carte.");
      } finally {
        this.loading = false;
      }
    },

    async deleteAsset(assetId?: string) {
      this.loading = true;
      try {
        if (!assetId) {
          useToastStore().error("ID de l'asset invalide.");
          return;
        }
        if (confirm("Êtes-vous sûr de vouloir supprimer cet asset ? Cette action est irréversible.")) {
          await api.delete(`/games/card-creator/asset/${assetId}`);

          this.cardAssets = this.cardAssets.filter(a => a.id !== assetId);
          useToastStore().success("Asset supprimé avec succès !");
        }
      } catch(e: any) {
        const message = e.response.data.message;
        useToastStore().error("Erreur lors de la suppression de l'asset.", message ?? e.message);
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
