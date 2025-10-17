import type { ApiResponse, Season } from "@/types/models";
import api from "@/utils/api";
import { defineStore } from "pinia";

const useSeasonStore = defineStore('season', {
  state: () => ({
    seasons: [] as Season[]
  }),
  actions: {
    async fetchSeasons() {
      const response = await api.get<ApiResponse<Season[]>>('/seasons');
      this.seasons = response.data.data;
    }
  }
})

export default useSeasonStore;