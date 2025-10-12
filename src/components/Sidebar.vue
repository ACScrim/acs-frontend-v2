<template>
    <aside class="flex-1 flex flex-col items-center p-4 m-8 gap-4 bg-white mix-blend-difference rounded-xl">
      <RouterLink to="/" class="p-4 mb-8">
        <img src="/acs.avif" width="200" style="filter: drop-shadow(5px 5px 0 black)" />
      </RouterLink>
      <RouterLink v-for="route in asideRoutes" :key="route.path" :to="route.path"
        class="text-black font-bold border-2 border-transparent hover:bg-acs-purple hover:border-acs-purple hover:shadow-[5px_5px_0_var(--color-vibrant-purple-700)] rounded-md flex flex-row gap-4 w-full p-2"
        active-class="bg-vibrant-cyan-500 border-vibrant-cyan-700 shadow-[5px_5px_0_var(--color-vibrant-cyan-700)]">
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
import Avatar from '@/components/ui/Avatar.vue';
import { useUserStore } from '@/stores/userStore';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

const router = useRouter();
const asideRoutes = computed(() =>
  router.getRoutes().filter(
    (r) => r.meta.showInAside
  )
);

const userStore = useUserStore();
</script>