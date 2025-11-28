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
  <footer class="fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-2.5rem)] max-w-3xl -translate-x-1/2 items-center rounded-[var(--radius-xl)] border border-white/10 bg-surface-900/80 px-4 py-3 shadow-[0_25px_55px_rgba(0,0,0,0.55)] backdrop-blur-2xl lg:hidden">
    <RouterLink
      v-for="route in mobileFooterRoutes"
      :key="route.path"
      :to="route.path"
      class="flex flex-1 flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-foam-300/60 transition"
      active-class="text-white bg-white/5 shadow-inner shadow-accent-500/40"
    >
      <VueIcon v-if="route.meta.icon" :name="route.meta.icon" class="size-5" />
    </RouterLink>
  </footer>
</template>