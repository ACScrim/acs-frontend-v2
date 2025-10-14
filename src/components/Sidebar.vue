<script setup lang="ts">
import Avatar from '@/components/ui/Avatar.vue';
import { useUserStore } from '@/stores/userStore';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import Separator from './ui/Separator.vue';

const router = useRouter();
const asideRoutes = computed(() =>
  router.getRoutes().filter(
    (r) => r.meta.showInAside
  )
);
const mobileFooterRoutes = computed(() =>
  router.getRoutes().filter(
    (r) => r.meta.showInMobileFooter
  )
);

const userStore = useUserStore();
</script>

<template>
  <aside
    class="hidden lg:flex flex-1 flex-col items-center p-8 before:p-8 gap-4 rounded-xl before:rounded-xl m-4 before:m-4 before:shadow-acs-card before:shadow-black">
    <RouterLink to="/" class="p-4">
      <img src="/acs.avif" width="200" style="filter: drop-shadow(5px 5px 0 black)" />
    </RouterLink>
    <Separator />
    <div class="my-auto">
      <RouterLink v-for="route in asideRoutes" :key="route.path" :to="route.path"
        class="font-bold px-6 py-4 border-2 border-transparent hover:text-white hover:bg-acs-purple/80 hover:border-acs-purple hover:shadow-acs-button hover:shadow-acs-purple rounded-md flex flex-row gap-4 w-full p-2"
        active-class="bg-acs-purple/80 border-acs-purple text-white shadow-acs-button shadow-acs-purple">
        <VueIcon v-if="route.meta.icon" :name="route.meta.icon" class="size-6" />
        <span>{{ route.name }}</span>
      </RouterLink>
    </div>

    <div class="mt-auto">
      <Avatar v-if="userStore.isLoggedIn" :src="userStore.user?.avatarUrl" />
      <VueIcon name="ak:discord-fill" v-else class="text-white text-3xl" />
    </div>
  </aside>
  <footer class="lg:hidden fixed bottom-0 w-full flex flex-row items-center h-14 backdrop-blur-sm p-10">
    <RouterLink v-for="route in mobileFooterRoutes" :key="route.path" :to="route.path"
      class="font-bold px-6 py-4 border-2 border-transparent hover:text-white hover:bg-acs-purple/80 hover:border-acs-purple hover:shadow-acs-button hover:shadow-acs-purple rounded-md flex flex-row justify-center gap-4 w-full p-2"
      active-class="bg-acs-purple/80 border-acs-purple text-white shadow-acs-button shadow-acs-purple">
      <VueIcon v-if="route.meta.icon" :name="route.meta.icon" class="size-6" />
    </RouterLink>
  </footer>
</template>

<style scoped>
aside::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.75;
  z-index: 0;
  background: linear-gradient(to left, var(--color-acs-orange-light), var(--color-acs-orange-dark) 0%);
}

aside>* {
  z-index: 1;
}
</style>