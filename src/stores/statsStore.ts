import api from "@/utils/api";
import { defineStore } from "pinia";

const useStatsStore = defineStore('stats', {
  state: () => ({
    homeStats: {
      tournaments: 0,
      users: 0,
      gamesPlayed: 0
    }
  }),
  getters: {
    
  },
  actions: {
    async fetchHomeStats() {
      const response = await api.get('/stats/home');
      this.homeStats = response.data;
    }
  },
});

export default useStatsStore;