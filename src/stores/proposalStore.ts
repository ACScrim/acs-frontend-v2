import type { ApiResponse, GameProposal, RawgGame } from "@/types/models";
import api from "@/utils/api";
import { defineStore } from "pinia";
import { useToastStore } from "./toastStore";
import type { AxiosError } from "axios";

const useProposalStore = defineStore('proposalStore', {
  state: () => ({
    isLoading: false,
    proposals: [] as GameProposal[],
    rawgGames: [] as { id: number; name: string; background_image: string | null, release_date: string | null }[],
  }),
  actions: {
    async fetchProposals() {
      this.isLoading = true;
      try {
        const response = await api.get<ApiResponse<GameProposal[]>>('/proposals');
        this.proposals = response.data.data;
      } finally {
        this.isLoading = false;
      }
    },
    async voteOnProposal(id: string, vote: boolean) {
      try {
        const response = await api.post<ApiResponse<GameProposal>>('/proposals/vote', { id, vote });
        const updatedProposal = response.data.data;
        const index = this.proposals.findIndex(p => p.id === id);
        if (index !== -1) {
          this.proposals[index] = updatedProposal;
        }
      } catch (error: any) {
        useToastStore().error('Error voting on proposal:', error.message || error);
      }
    },
    async sortProposals(criteria: 'recent' | 'old' | 'popular') {
      if (criteria === 'recent') {
        this.proposals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (criteria === 'old') {
        this.proposals.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      } else if (criteria === 'popular') {
        this.proposals.sort((a, b) => b.totalVotes - a.totalVotes);
      }
    },
    async fetchRawgGames(query: string) {
      try {
        const response = await api.get<ApiResponse<{ id: number; name: string; background_image: string | null, release_date: string | null }[]>>('/proposals/rawg-games', {
          params: { q: query }
        });
        this.rawgGames = response.data.data;
      } catch (error: any) {
        useToastStore().error('Error fetching RAWG games:', error.message || error);
      }
    },
    async submitProposal(game: RawgGame, description: string) {
      try {
        const response = await api.post<ApiResponse<GameProposal>>('/proposals', {
          game,
          description
        });
        this.proposals.unshift(response.data.data);
        useToastStore().success('Proposition soumise avec succès !');
      } catch (error: AxiosError | any) {
        useToastStore().error('Erreur lors de la soumission de la proposition.', `${error.response?.data?.error || error.message} (${error.response?.status || ''})`);
      }
    }
  }
});

export default useProposalStore;