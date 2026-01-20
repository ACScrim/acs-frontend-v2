import {type ApiResponse, type HomeStats, type Tournament} from "@/types/models";
import api from "@/utils/api";
import { defineStore } from "pinia";

const useHomeStore = defineStore('home', {
  state: () => ({
    homeStats: {
      tournaments: 0,
      users: 0,
      gamesPlayed: 0
    } as HomeStats,
    nextTournaments: [] as Tournament[],
    lastTournament: null as Tournament | null,
    currentTournament: null as Tournament | null,
  }),
  actions: {
    async fetchHomeStats() {
      const response = await api.get<ApiResponse<HomeStats>>('/home/stats');
      this.homeStats = response.data.data;
    },
    async fetchNextTournaments() {
      const response = await api.get<ApiResponse<Tournament[]>>('/home/next-tournaments');
      this.nextTournaments = response.data.data;
    },
    async fetchLastTournament() {
      const response = await api.get<ApiResponse<Tournament>>('/home/last-tournament');
      this.lastTournament = response.data.data;
    },
    async fetchCurrentTournament() {
      const response = await api.get<ApiResponse<Tournament>>('/home/current-tournament');
      this.currentTournament = response.data.data;
    }
  },
});

export default useHomeStore;