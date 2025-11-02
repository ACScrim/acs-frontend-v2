import type { ApiResponse, Game, PlayerGameLevel } from "@/types/models";
import api from "@/utils/api";
import { defineStore } from "pinia";

const usePlayerLevelStore = defineStore('acs-playerLevels', {
  state: () => ({
    levels: [] as PlayerGameLevel[],
    isLoading: false
  }),
  actions: {
    async fetchPlayerGameLevels() {
      this.isLoading = true;
      const response = await api.get<ApiResponse<PlayerGameLevel[]>>(`/playergamelevels`);
      this.levels = response.data.data;
      this.isLoading = false;
    },
    async setGameLevel(game: Game, data: { level: string, selectedRoles: string[], gameUsername: string, isRanked: boolean, rank?: string, comment?: string }) {
      this.isLoading = true;
      await api.post<ApiResponse<any>>(`/playergamelevels/set-level`, {
        gameId: game.id,
        level: data.level,
        selectedRoles: data.selectedRoles,
        gameUsername: data.gameUsername,
        isRanked: data.isRanked,
        rank: data.rank,
        comment: data.comment
      });
      this.isLoading = false;
    }
  },
  persist: {
    storage: localStorage,
    pick: ['levels']
  }
})

export default usePlayerLevelStore;