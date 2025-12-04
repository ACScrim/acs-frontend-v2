<script setup lang="ts">
import LoaderACS from '@/components/global/LoaderACS.vue';
import { useUserStore } from '@/stores/userStore';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import ProfileHeader from './components/ProfileHeader.vue';
import ProfileTournamentHistory from './components/ProfileTournamentHistory.vue';
import ProfilePerGameStats from './components/ProfilePerGameStats.vue';
import ProfilePersonalBests from './components/ProfilePersonalBests.vue';
import { useToastStore } from '@/stores/toastStore';

const route = useRoute();
const userStore = useUserStore();
const isLoading = ref(false);
const user = computed(() => {
  const userId = (route.params.userId || userStore.user?.id) as string;
  return userStore.users[userId] || null;
});

const fetchUserProfile = async (userId: string) => {
  isLoading.value = user !== null ? false : true;
  try {
    await userStore.fetchUserById(userId);
  } catch (error: any) {
    useToastStore().error('Erreur lors du chargement du profil:', error.message || error);
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => [route.params.userId, userStore.user?.id],
  async (newParams) => {
    const newUserID = newParams[0] || newParams[1];
    if (newUserID) {
      await fetchUserProfile(newUserID as string);
    }
  },
  { immediate: true }
);

const handleSaveTwitchUsername = async (twitchUsername: string | undefined) => {
  if (!twitchUsername) return;
  try {
    await userStore.updateTwitchUsername(twitchUsername);
    useToastStore().success('Nom Twitch mis à jour avec succès.');
  } catch (error: any) {
    useToastStore().error('Erreur lors de la mise à jour du nom Twitch:', error.message || error);
  }
};
</script>

<template>
  <LoaderACS v-if="isLoading" />
  <template v-else-if="user">
    <div class="space-y-10">
      <ProfileHeader :user="user" @saveTwitchUsername="handleSaveTwitchUsername" />
      <ProfilePersonalBests :user="user" />
      <ProfileTournamentHistory :user="user" />
      <ProfilePerGameStats :user="user" />
    </div>
  </template>
</template>