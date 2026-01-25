import { defineStore } from 'pinia';
import api from '@/utils/api';
import type { ApiResponse } from '@/types/models';
import { useToastStore } from './toastStore';

interface State {
  played: boolean;
  choice: number | null;
  reward: number | null;
  credited: boolean;
  loading: boolean;
  permutation?: number[];
}

export const useThreeBoxesStore = defineStore('threeBoxes', {
  state: (): State => ({
    played: false,
    choice: null,
    reward: null,
    credited: false,
    loading: false,
  }),
  actions: {
    async loadToday() {
      this.loading = true;
      try {
        const { data } = await api.get<ApiResponse<any>>('/games/threeBoxes/today');
        const payload = data.data ?? data; // backend may return raw object or ApiResponse.wrapper
        if (payload.played) {
          this.played = true;
          this.choice = payload.choice;
          this.reward = payload.reward;
          this.credited = payload.credited;
          this.permutation = payload.permutation;
        } else {
          this.played = false;
          this.choice = null;
          this.reward = null;
          this.credited = false;
          this.permutation = undefined;
        }
      } catch (e: any) {
        useToastStore().error("Erreur lors de la récupération du jeu du jour.", e.message || e);
      } finally {
        this.loading = false;
      }
    },

    async chooseBox(choice: number) {
      this.loading = true;
      try {
        const { data } = await api.post<ApiResponse<any>>('/games/threeBoxes/choose', { choice });
        const payload = data.data ?? data;
        if (payload) {
          const obj = payload; // depending on backend wrapper
          // If backend returned success wrapper, data might be nested
          const info = obj.data ?? obj;
          this.played = true;
          this.choice = info.choice ?? info.choice;
          this.reward = info.reward ?? info.reward;
          this.credited = info.credited ?? info.credited;
        }
      } catch (e: any) {
        useToastStore().error("Erreur lors du choix de la boîte.", e.message || e);
        throw e;
      } finally {
        this.loading = false;
      }
    }
  }
});

export default useThreeBoxesStore;
