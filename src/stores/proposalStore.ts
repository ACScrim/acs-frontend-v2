import type { ApiResponse, GameProposal } from "@/types/models";
import api from "@/utils/api";
import { defineStore } from "pinia";

const useProposalStore = defineStore('proposalStore', {
  state: () => ({
    isLoading: false,
    proposals: [] as GameProposal[],
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
        const response = await api.post<ApiResponse<GameProposal>>('/proposals', { id, vote });
        const updatedProposal = response.data.data;
        const index = this.proposals.findIndex(p => p.id === id);
        if (index !== -1) {
          this.proposals[index] = updatedProposal;
        }
      } catch (error) {
        console.error('Error voting on proposal:', error);
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
    }
  }
});

export default useProposalStore;