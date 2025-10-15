import { type ApiResponse, type Tournament } from "@/types/models";
import api from "@/utils/api";
import { defineStore } from "pinia";

const useTournamentStore = defineStore('tournament', {
  state: () => ({
    tournaments: [] as Tournament[],
  }),
  getters: {
    nextTournaments: (state) => {
      return state.tournaments.filter(t => !t.finished).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3);
    }
  },
  actions: {
    async fetchTournaments() {
      const response = await api.get<ApiResponse<Tournament[]>>('/tournaments');
      this.tournaments = response.data.data;
    }
  },
});

export default useTournamentStore;