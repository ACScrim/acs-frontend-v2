import type { ApiResponse, Season } from "@/types/models";
import api from "@/utils/api";
import { defineStore } from "pinia";

const useSeasonStore = defineStore('season', {
  state: () => ({
    isLoading: false,
    seasons: [] as Season[]
  }),
  actions: {
    async fetchSeasons() {
      this.isLoading = true;
      const response = await api.get<ApiResponse<Season[]>>('/seasons');
      this.seasons = response.data.data;
      this.isLoading = false;
    }
  }
})

export default useSeasonStore;