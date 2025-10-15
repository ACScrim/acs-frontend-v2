import { type ApiResponse, type HomeStats } from "@/types/models";
import api from "@/utils/api";
import { defineStore } from "pinia";

const useStatsStore = defineStore('stats', {
  state: () => ({
    homeStats: {
      tournaments: 0,
      users: 0,
      gamesPlayed: 0
    } as HomeStats
  }),
  getters: {
    
  },
  actions: {
    async fetchHomeStats() {
      const response = await api.get<ApiResponse<HomeStats>>('/stats/home');
      this.homeStats = response.data.data;
    }
  },
});

export default useStatsStore;