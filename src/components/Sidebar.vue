<template>
  <RouterLink to="/" class="p-4 mb-8">
    <img src="/acs.avif" width="200" />
  </RouterLink>
  <aside class="border rounded-tr-2xl border-blue-500 flex-1 flex flex-col items-center bg-blue-950 p-4 gap-4">
    <RouterLink v-for="route in asideRoutes" :key="route.path" :to="route.path"
      class="text-white hover:bg-blue-400 rounded-md flex flex-row gap-4 w-full p-2"
      active-class="bg-blue-400">
      <VueIcon v-if="route.meta.icon" :name="route.meta.icon" class="size-6" />
      <span>{{ route.name }}</span>
    </RouterLink>

    <div class="mt-auto">
      <Avatar v-if="userStore.isLoggedIn" :src="userStore.user?.avatarUrl" />
      <VueIcon name="ak:discord-fill" v-else class="text-white text-3xl" />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import Avatar from '@/components/ui/Avatar.vue';

const router = useRouter();
const asideRoutes = computed(() =>
  router.getRoutes().filter(
    (r) => r.meta.showInAside
  )
);

const userStore = useUserStore();
</script>