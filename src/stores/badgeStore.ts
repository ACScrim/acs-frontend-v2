import type { ApiResponse, Badge } from "@/types/models";
import api from "@/utils/api";
import { defineStore } from "pinia";
import { useToastStore } from "./toastStore";

export const useBadgeStore = defineStore('acs-badges', {
  state: () => ({
    badges: [] as Badge[],
    loading: false,
    error: null as string | null
  }),
  actions: {
    async fetchUserBadges() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get<ApiResponse<Badge[]>>("/badges");
        this.badges = response.data?.data ?? [];
      } catch (error: any) {
        this.error = error?.message || 'Erreur lors du chargement des badges';
        if (this.error) {
          useToastStore().error(this.error);
        }
        console.error('Error fetching badges:', error);
      } finally {
        this.loading = false;
      }
    }
  }
});

