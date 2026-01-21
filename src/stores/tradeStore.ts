import { defineStore } from "pinia";
import type { ApiResponse, CardTrade } from "@/types/models";
import api from "@/utils/api.ts";
import { useToastStore } from "@/stores/toastStore.ts";

const useTradeStore = defineStore('trades', {
  state: () => ({
    trades: [] as CardTrade[],
    myTrades: [] as CardTrade[],
    myProposals: [] as CardTrade[],
    currentTrade: null as CardTrade | null,
    loading: false,
  }),
  actions: {
    async fetchTrades() {
      this.loading = true;
      try {
        const { data: { data: trades } } = await api.get<ApiResponse<CardTrade[]>>("/card-trades");
        this.trades = trades;
      } catch (error) {
        useToastStore().error("Erreur lors de la récupération des offres d'échange.");
      } finally {
        this.loading = false;
      }
    },

    async fetchMyTrades() {
      this.loading = true;
      try {
        const { data: { data: trades } } = await api.get<ApiResponse<CardTrade[]>>("/card-trades/me");
        this.myTrades = trades;
      } catch (error) {
        useToastStore().error("Erreur lors de la récupération de vos offres.");
      } finally {
        this.loading = false;
      }
    },

    async fetchMyProposals() {
      this.loading = true;
      try {
        const { data: { data: trades } } = await api.get<ApiResponse<CardTrade[]>>("/card-trades/my-proposals");
        this.myProposals = trades;
      } catch (error) {
        useToastStore().error("Erreur lors de la récupération de vos propositions.");
      } finally {
        this.loading = false;
      }
    },

    async fetchTrade(id: string) {
      this.loading = true;
      try {
        const { data: { data: trade } } = await api.get<ApiResponse<CardTrade>>(`/card-trades/${id}`);
        this.currentTrade = trade;
        return trade;
      } catch (error) {
        useToastStore().error("Erreur lors de la récupération de l'offre.");
        return null;
      } finally {
        this.loading = false;
      }
    },

    async createTrade(offeredCards: { cardId: string; count: number }[]) {
      this.loading = true;
      try {
        const { data: { data: trade } } = await api.post<ApiResponse<CardTrade>>("/card-trades", {
          offeredCards
        });
        this.trades.unshift(trade);
        this.myTrades.unshift(trade);
        useToastStore().success("Offre d'échange créée avec succès !");
        return trade;
      } catch (error: any) {
        useToastStore().error(error.response?.data?.error || "Erreur lors de la création de l'offre.");
        return null;
      } finally {
        this.loading = false;
      }
    },

    async proposeTrade(tradeId: string, proposedCards: { cardId: string; count: number }[]) {
      this.loading = true;
      try {
        const { data: { data: trade } } = await api.post<ApiResponse<CardTrade>>(
          `/card-trades/${tradeId}/proposals`,
          { proposedCards }
        );

        // Mettre à jour l'offre dans les listes
        const tradeIndex = this.trades.findIndex(t => t.id === tradeId);
        if (tradeIndex !== -1) {
          this.trades[tradeIndex] = trade;
        }

        if (this.currentTrade?.id === tradeId) {
          this.currentTrade = trade;
        }

        useToastStore().success("Proposition envoyée avec succès !");
        return trade;
      } catch (error: any) {
        useToastStore().error(error.response?.data?.error || "Erreur lors de l'envoi de la proposition.");
        return null;
      } finally {
        this.loading = false;
      }
    },

    async acceptProposal(tradeId: string, proposalId: string) {
      this.loading = true;
      try {
        const { data: { data: trade } } = await api.post<ApiResponse<CardTrade>>(
          `/card-trades/${tradeId}/proposals/${proposalId}/accept`
        );

        // Mettre à jour l'offre dans les listes
        const myTradeIndex = this.myTrades.findIndex(t => t.id === tradeId);
        if (myTradeIndex !== -1) {
          this.myTrades[myTradeIndex] = trade;
        }

        if (this.currentTrade?.id === tradeId) {
          this.currentTrade = trade;
        }

        useToastStore().success("Échange effectué avec succès !");
        return trade;
      } catch (error: any) {
        // useToastStore().error(error.message || "Erreur lors de l'acceptation de la proposition.");
        return null;
      } finally {
        this.loading = false;
      }
    },

    async rejectProposal(tradeId: string, proposalId: string) {
      this.loading = true;
      try {
        const { data: { data: trade } } = await api.post<ApiResponse<CardTrade>>(
          `/card-trades/${tradeId}/proposals/${proposalId}/reject`
        );

        // Mettre à jour l'offre dans les listes
        const myTradeIndex = this.myTrades.findIndex(t => t.id === tradeId);
        if (myTradeIndex !== -1) {
          this.myTrades[myTradeIndex] = trade;
        }

        if (this.currentTrade?.id === tradeId) {
          this.currentTrade = trade;
        }

        useToastStore().success("Proposition rejetée.");
        return trade;
      } catch (error: any) {
        useToastStore().error(error.response?.data?.error || "Erreur lors du rejet de la proposition.");
        return null;
      } finally {
        this.loading = false;
      }
    },

    async cancelTrade(tradeId: string) {
      this.loading = true;
      try {
        await api.delete(`/card-trades/${tradeId}`);

        // Retirer l'offre des listes
        this.trades = this.trades.filter(t => t.id !== tradeId);
        this.myTrades = this.myTrades.filter(t => t.id !== tradeId);

        if (this.currentTrade?.id === tradeId) {
          this.currentTrade = null;
        }

        useToastStore().success("Offre annulée avec succès.");
        return true;
      } catch (error: any) {
        useToastStore().error(error.message || "Erreur lors de l'annulation de l'offre.");
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});

export default useTradeStore;
