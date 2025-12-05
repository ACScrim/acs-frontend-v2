import {defineStore} from "pinia";
import type {CardCollection} from "@/types/models";
import api from "@/utils/api.ts";
import {useToastStore} from "@/stores/toastStore.ts";

const useCollectionStore = defineStore('collections', {
  state: () => ({
    collection: null as CardCollection | null
  }),
  actions: {
    async fetchCollection() {
      try {
        const response = await api.get('/card-collection/me');
        this.collection = response.data.data;
      } catch (error) {
        useToastStore().error("Erreur lors de la récupération de la collection de cartes.");
      }
    },

  }
})

export default useCollectionStore;