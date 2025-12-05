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
  <aside class="hidden lg:flex flex-col gap-8 px-6 py-8">
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

    <div class="mt-auto space-y-4">
      <div v-if="userStore.isLoggedIn && userStore.user" class="rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-4">
        <button
          class="flex w-full items-center gap-3 text-left"
          @click="isMenuOpen = !isMenuOpen"
        >
          <Avatar :src="userStore.user.avatarUrl" class="size-12" />
          <div class="flex flex-col">
            <span class="font-semibold text-white">{{ userStore.user.username }}</span>
            <span class="text-xs uppercase tracking-[0.3em] text-foam-200/70">{{ userStore.user.scrimium.balance }}<img src="/scrimium.svg" title="Scrimium" alt="Scrimium" class="size-6 inline"/></span>
          </div>
          <VueIcon name="bs:chevron-down" :class="['ml-auto transition-all', isMenuOpen ? 'rotate-180' : '']" />
        </button>

        <div v-if="isMenuOpen" class="mt-4 space-y-2 text-sm text-foam-200">
          <RouterLink to="/profile" class="block rounded-xl px-3 py-2 hover:bg-white/10" @click="isMenuOpen = false">Profil</RouterLink>
          <RouterLink to="/player-levels" class="block rounded-xl px-3 py-2 hover:bg-white/10" @click="isMenuOpen = false">Mes niveaux</RouterLink>
          <button class="w-full rounded-xl px-3 py-2 text-left text-blush-300 hover:bg-blush-500/10" @click="logout">Déconnexion</button>
        </div>
      </div>

      <Button v-else color="accent" class="w-full justify-center" :to="`${API_URL}/auth/discord`">
        <VueIcon name="ak:discord-fill" class="text-2xl" />
        <span>Connexion Discord</span>
      </Button>
    </div>
  </aside>
</template>

<style scoped>
/* No additional scoped styles needed; global theme handles visuals. */
</style>