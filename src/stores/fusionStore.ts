import { defineStore } from "pinia";
import type { ApiResponse, CollectibleCard } from "@/types/models";
import api from "@/utils/api.ts";
import { useToastStore } from "@/stores/toastStore.ts";
import useCollectionStore from "@/stores/collectionStore.ts";

export interface FusionResult {
  success: boolean;
  fusedCardIds: string[];
  fusedCount: number;
  fusedRarity: string;
  newCard: CollectibleCard;
  newRarity: string;
}

const useFusionStore = defineStore('fusion', {
  state: () => ({
    loading: false,
    fusionInProgress: false,
    lastFusionResult: null as FusionResult | null,
  }),
  getters: {
    fusionCost: () => {
      return (rarity: string): number => {
        const costs: Record<string, number> = {
          common: 5,
          uncommon: 4,
          rare: 3,
          epic: 3
        };
        return costs[rarity] || 5;
      };
    },
    nextRarity: () => {
      return (currentRarity: string): string | null => {
        const upgrade: Record<string, string> = {
          common: 'uncommon',
          uncommon: 'rare',
          rare: 'epic',
          epic: 'legendary'
        };
        return upgrade[currentRarity] || null;
      };
    },
    canFuseRarity: () => {
      return (rarity: string): boolean => {
        return rarity !== 'legendary';
      };
    }
  },
  actions: {
    async fuseCards(cardIds: string[]): Promise<FusionResult | null> {
      this.loading = true;
      this.fusionInProgress = true;
      const toastStore = useToastStore();
      const collectionStore = useCollectionStore();

      try {
        const { data: { data: result } } = await api.post<ApiResponse<FusionResult>>(
          "/card-collection/fusion",
          { cardIds }
        );

        this.lastFusionResult = result;

        // Rafraîchir la collection après la fusion
        await collectionStore.fetchCategoriesOverview();

        toastStore.success(`Fusion réussie ! Vous avez obtenu une carte ${result.newRarity} !`);
        return result;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Erreur lors de la fusion des cartes.";
        toastStore.error(errorMessage);
        return null;
      } finally {
        this.loading = false;
        // Keep fusionInProgress true for animation
        setTimeout(() => {
          this.fusionInProgress = false;
        }, 5000);
      }
    },
    clearLastFusionResult() {
      this.lastFusionResult = null;
    }
  }
});

export default useFusionStore;
