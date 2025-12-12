<script setup lang="ts">
import Avatar from '@/components/ui/Avatar.vue';
import { useUserStore } from '@/stores/userStore';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { computed, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { Button } from '../ui';
import { API_URL } from '@/utils';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const user = computed(() => userStore.user);
const isMenuOpen = ref(false);

const asideRoutes = computed(() =>
  router.getRoutes()
    .filter((r) => {
      const showInAside = r.meta.showInAside;
      const showInAdminBar = r.meta.showInAdminBar;
      if (route.path.startsWith('/admin')) {
        return showInAdminBar;
      }
      if (!user.value) return false;
      if (typeof showInAside === 'function') {
        return showInAside(user.value);
      }
      return showInAside === true;
    })
    .sort((a, b) => {
      const orderA = (a.meta.order as number) ?? 0;
      const orderB = (b.meta.order as number) ?? 0;
      return orderA - orderB;
    })
);

const logout = async () => {
  await userStore.logout();
  isMenuOpen.value = false;
  router.push('/');
};
</script>

<template>
  <div class="hidden lg:flex flex-col gap-8 px-6 py-8">
    <RouterLink to="/" class="flex items-center justify-center">
      <img src="/acs.avif" alt="ACS" class="h-16 w-auto drop-shadow-[0_25px_45px_rgba(0,0,0,0.35)]" />
    </RouterLink>

    <nav class="flex flex-col gap-2">
      <RouterLink
        v-for="route in asideRoutes"
        :key="route.path"
        :to="route.path"
        class="group flex items-center gap-3 rounded-2xl px-4 py-3 text-foam-200 transition"
        active-class="bg-white/5 text-white shadow-[0_25px_60px_rgba(0,0,0,0.45)]"
      >
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-accent-300 transition group-hover:bg-white/10">
          <VueIcon v-if="route.meta.icon" :name="route.meta.icon" class="size-5" />
        </div>
        <div class="flex flex-col">
          <span class="font-semibold">{{ route.name }}</span>
          <span class="text-xs uppercase tracking-widest text-foam-300/60" v-if="route.meta.title">{{ route.meta.title }}</span>
        </div>
      </RouterLink>
    </nav>

    <div class="mt-auto space-y-3">
      <div v-if="userStore.isLoggedIn && userStore.user" class="rounded-[var(--radius-lg)] border border-white/10 bg-gradient-to-br from-accent-500/10 to-blush-500/10 p-3">
        <RouterLink to="/profile" class="group/profile flex items-center gap-3 text-left">
          <div class="relative">
            <Avatar :src="userStore.user.avatarUrl" class="size-10 ring-2 ring-accent-400/50 group-hover/profile:ring-accent-300" />
            <div class="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">
              <VueIcon name="bs:check" class="text-[10px]" />
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="truncate font-semibold text-white group-hover/profile:text-accent-300 transition-colors">{{ userStore.user.username }}</p>
            <p class="text-xs truncate text-foam-300/70">{{ userStore.user.scrimium.balance }} <img src="/scrimium.svg" title="Scrimium" alt="Scrimium" class="size-3 inline"/></p>
          </div>
          <VueIcon name="bs:chevron-right" class="flex-shrink-0 text-foam-300/50 group-hover/profile:text-accent-300 transition" />
        </RouterLink>
      </div>

      <div v-if="userStore.isLoggedIn" class="space-y-1">
        <RouterLink to="/player-levels" class="group/nav flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foam-200 hover:bg-white/5 transition">
          <VueIcon name="bs:mountains" class="text-accent-300" />
          <span class="group-hover/nav:text-white transition">Mes niveaux</span>
        </RouterLink>
      </div>

      <div v-if="userStore.isLoggedIn" class="border-t border-white/10 pt-3">
        <button @click="logout" class="group/nav w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-blush-300 hover:bg-blush-500/10 transition">
          <VueIcon name="bs:box-arrow-right" />
          <span class="group-hover/nav:text-blush-200 transition">Déconnexion</span>
        </button>
      </div>

      <Button v-else color="accent" class="w-full justify-center text-sm" :to="`${API_URL}/auth/discord`">
        <VueIcon name="ak:discord-fill" class="text-lg" />
        <span>Discord</span>
      </Button>
    </div>
  </div>
</template>

<style scoped>
/* No additional scoped styles needed; global theme handles visuals. */
</style>