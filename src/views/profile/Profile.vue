<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { type ApiResponse, type UserWithStats } from '@/types/models';
import api from '@/utils/api';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const userStore = useUserStore();
const isLoading = ref(false);
const user = ref<UserWithStats | null>(null);

// Fonction pour charger le profil
const fetchUserProfile = async (userId: string) => {
  isLoading.value = true;
  try {
    const response = await api.get<ApiResponse<UserWithStats>>(`/users/profile/${userId}`);
    user.value = response.data.data;
    
    // Optionnel : ajouter au store si nécessaire
    if (!userStore.users.find(u => u.id === userId)) {
      userStore.users.push(response.data.data);
    }
  } catch (error) {
    console.error('Erreur lors du chargement du profil:', error);
    user.value = null;
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => route.params.userId,
  async (newUserId) => {
    if (newUserId) {
      await fetchUserProfile(newUserId as string);
    }
  },
  { immediate: true }
);
</script>

<template>
  <pre>
    {{ isLoading ? 'Loading...' : JSON.stringify(user, null, 2) }}
  </pre>
</template>