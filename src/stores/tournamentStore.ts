import { type ApiResponse, type Game, type Tournament } from "@/types/models";
import api from "@/utils/api";
import { defineStore } from "pinia";

const useTournamentStore = defineStore('tournament', {
  state: () => ({
    tournaments: [] as Tournament[],
    isLoading: false,
  }),
  getters: {
    nextTournaments: (state) => {
      return state.tournaments.filter(t => !t.finished).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3);
    },
    finishedTournaments: (state) => {
      return state.tournaments.filter(t => t.finished).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];
    },
    upcomingTournaments: (state) => {
      return state.tournaments.filter(t => !t.finished).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];
    },
    gamesPlayed: (state) => {
      return state.tournaments.reduce((acc: Game[], tournament: Tournament) => {
        if (acc.includes(tournament.game)) {
          return acc;
        }
        return [...acc, tournament.game];
      }, []);
    }
  },
  actions: {
    async fetchTournaments() {
      this.isLoading = true;
      const response = await api.get<ApiResponse<Tournament[]>>('/tournaments');
      this.tournaments = response.data.data;
      await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate loading time
      this.isLoading = false;
    }
  },
});

export default useTournamentStore;