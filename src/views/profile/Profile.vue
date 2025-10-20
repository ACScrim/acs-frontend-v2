<script setup lang="ts">
import { Avatar, Card } from '@/components/ui';
import { useUserStore } from '@/stores/userStore';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const userStore = useUserStore();

const user = computed(() => {
  const userId = route.params.userId as string | undefined;
  if (userId) return null;
  return userStore.user;
});
</script>

<template>
  <Card class="bg-christmas-navy/50 p-6">
    <Avatar
      :src="user?.avatarUrl || ''"
      :alt="user ? `${user.username}` : 'Utilisateur inconnu'"
      class="mx-auto mb-4"
      :size="32"
    />
    <h1 class="text-3xl font-bold text-christmas-snow text-center mb-2">
      {{ user ? user.username : 'Utilisateur inconnu' }}
    </h1>
  </Card>
</template>