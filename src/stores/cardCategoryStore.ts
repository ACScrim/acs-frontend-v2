import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { CardCategory } from '@/types/models';
import type { ApiResponse } from '@/types/models';
import api from "@/utils/api.ts";

export const useCardCategoryStore = defineStore('cardCategory', () => {
  const categories = ref<CardCategory[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchCategories = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get<ApiResponse<CardCategory[]>>('/card-categories');
      if (response.data.data) {
        categories.value = response.data.data;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la récupération des catégories';
      console.error(error.value);
    } finally {
      loading.value = false;
    }
  };

  const createCategory = async (name: string, description?: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.post<ApiResponse<CardCategory>>('/card-categories', {
        name,
        description,
      });
      if (response.data.data) {
        categories.value.push(response.data.data);
        return response.data.data;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la création de la catégorie';
      console.error(error.value);
    } finally {
      loading.value = false;
    }
  };

  const updateCategory = async (id: string, name: string, description?: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.put<ApiResponse<CardCategory>>(`/card-categories/${id}`, {
        name,
        description,
      });
      if (response.data.data) {
        const index = categories.value.findIndex(c => c.id === id);
        if (index !== -1) {
          categories.value[index] = response.data.data;
        }
        return response.data.data;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la catégorie';
      console.error(error.value);
    } finally {
      loading.value = false;
    }
  };

  const deleteCategory = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      await api.delete(`/card-categories/${id}`);
      categories.value = categories.value.filter(c => c.id !== id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la suppression de la catégorie';
      console.error(error.value);
    } finally {
      loading.value = false;
    }
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
});

