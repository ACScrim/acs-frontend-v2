import {defineStore} from "pinia";
import type {ApiResponse, Booster, BoosterShopItem} from "@/types/models";
import api from "@/utils/api.ts";
import {useToastStore} from "@/stores/toastStore.ts";

const useBoosterStore = defineStore('booster', {
  state: () => ({
    isOpening: false,
    boosterShop: [] as BoosterShopItem[]
  }),
  actions: {
    async fetchBoosterShop() {
      try {
        const response = await api.get<ApiResponse<BoosterShopItem[]>>('/boosters/shop');
        this.boosterShop = response.data.data;
      } catch (error: any) {
        useToastStore().error("Failed to fetch booster shop items:", error);
      }
    },
    async buyBooster(boosterId: string): Promise<Booster> {
      this.isOpening = true;
      try {
        const response = await api.post<ApiResponse<Booster>>('/boosters/buy', { boosterId });
        this.isOpening = false;
        return response.data.data;
      } catch (error: any) {
        useToastStore().error("Failed to buy booster:", error);
        this.isOpening = false;
        throw error;
      }
    }
  }
})

export default useBoosterStore;