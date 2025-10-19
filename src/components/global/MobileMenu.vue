<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

const router = useRouter();
const mobileFooterRoutes = computed(() =>
  router.getRoutes().filter(
    (r) => r.meta.showInMobileFooter
  )
);

const userStore = useUserStore();
const API_URL = import.meta.env.VITE_API_URL
</script>

<template>
  <footer class="z-50 lg:hidden fixed bottom-0 left-0 right-0 flex flex-row items-center w-screen h-14 bg-gradient-to-r from-christmas-navy/95 via-christmas-midnight/95 to-christmas-navy/95 backdrop-blur-md border-t-2 border-christmas-gold/40 shadow-lg shadow-christmas-gold/20">
    <RouterLink v-for="route in mobileFooterRoutes" :key="route.path" :to="route.path"
      class="font-bold flex-1 h-full border-l border-christmas-gold/20 hover:bg-christmas-red/20 hover:text-christmas-gold transition-all duration-300 flex flex-col items-center justify-center gap-1 text-christmas-gold-light text-xs"
      active-class="bg-christmas-red/30 text-christmas-snow shadow-inner shadow-christmas-gold/30 border-l-2 border-christmas-gold">
      <VueIcon v-if="route.meta.icon" :name="route.meta.icon" class="size-6" />
      <!-- <span class="text-xs">{{ route.name }}</span> -->
    </RouterLink>
  </footer>
</template>