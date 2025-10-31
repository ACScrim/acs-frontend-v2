<script setup lang="ts">
import Avatar from '@/components/ui/Avatar.vue';
import { useUserStore } from '@/stores/userStore';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { computed, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import Separator from '../ui/Separator.vue';
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
);

const logout = async () => {
  await userStore.logout();
  isMenuOpen.value = false;
  router.push('/');
};
</script>

<template>
  <aside
    class="hidden lg:flex flex-1 flex-col items-center p-8 before:p-8 gap-4 rounded-xl before:rounded-xl m-4 before:m-4 before:shadow-lg before:shadow-christmas-gold/20">
    <RouterLink to="/" class="p-4">
      <img src="/acs.avif" width="200" style="filter: drop-shadow(5px 5px 10px rgba(212, 175, 55, 0.3))" />
    </RouterLink>
    <Separator />
    <div class="my-auto space-y-4 w-full">
      <RouterLink v-for="route in asideRoutes" :key="route.path" :to="route.path"
        class="font-bold px-6 py-4 border-2 border-transparent hover:text-christmas-snow hover:bg-christmas-red/20 hover:border-christmas-gold hover:shadow-lg hover:shadow-christmas-gold/30 rounded-md flex flex-row gap-4 w-full p-2 text-christmas-gold-light transition-all duration-300"
        active-class="bg-christmas-red/30 border-christmas-gold text-christmas-snow shadow-lg shadow-christmas-gold/40">
        <VueIcon v-if="route.meta.icon" :name="route.meta.icon" class="size-6" />
        <span>{{ route.name }}</span>
      </RouterLink>
    </div>

    <div class="mt-auto w-full">
      <div v-if="userStore.isLoggedIn && userStore.user" class="relative" @mouseleave="isMenuOpen = false">
        <!-- Bouton utilisateur -->
        <button 
          @click="isMenuOpen = !isMenuOpen"
          @mouseover="isMenuOpen = true"
          class="w-full gap-4 bg-gradient-to-r from-christmas-gold to-christmas-gold-light text-christmas-navy hover:from-christmas-red hover:to-christmas-crimson hover:text-christmas-snow transition-all duration-300 shadow-lg hover:shadow-xl px-4 py-3 rounded-lg font-bold flex items-center"
        >
          <Avatar :src="userStore.user.avatarUrl" class="size-10" />
          <div class="flex flex-col text-left flex-1">
            <span class="text-lg uppercase">{{ userStore.user.username }}</span>
            <span class="text-xs italic">Menu</span>
          </div>
          <VueIcon name="bs:chevron-up" :class="['transition-transform', isMenuOpen ? 'rotate-180' : '']" />
        </button>

        <!-- Menu déroulant -->
        <div 
          v-show="isMenuOpen"
          class="absolute bottom-full left-0 right-0 bg-christmas-navy border-2 border-christmas-gold border-b-0 rounded-t-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <RouterLink 
            to="/profile"
            @click="isMenuOpen = false"
            class="flex items-center gap-3 w-full px-4 py-3 text-christmas-gold-light hover:bg-christmas-gold/10 hover:text-christmas-snow border-b border-christmas-gold/20 transition-colors"
          >
            <VueIcon name="cd:account" class="text-lg" />
            <span>Profil</span>
          </RouterLink>

          <RouterLink 
            to="/profile?tab=game-levels"
            @click="isMenuOpen = false"
            class="flex items-center gap-3 w-full px-4 py-3 text-christmas-gold-light hover:bg-christmas-gold/10 hover:text-christmas-snow border-b border-christmas-gold/20 transition-colors"
          >
            <VueIcon name="bs:joystick" class="text-lg" />
            <span>Mes niveaux de jeu</span>
          </RouterLink>

          <RouterLink 
            to="/profile?tab=settings"
            @click="isMenuOpen = false"
            class="flex items-center gap-3 w-full px-4 py-3 text-christmas-gold-light hover:bg-christmas-gold/10 hover:text-christmas-snow border-b border-christmas-gold/20 transition-colors"
          >
            <VueIcon name="bs:gear" class="text-lg" />
            <span>Paramètres</span>
          </RouterLink>

          <button 
            @click="logout"
            class="flex items-center gap-3 w-full px-4 py-3 text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors font-bold"
          >
            <VueIcon name="bs:box-arrow-right" class="text-lg" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      <Button v-else class="w-full bg-gradient-to-r from-christmas-gold to-christmas-gold-light text-christmas-navy hover:from-christmas-red hover:to-christmas-crimson hover:text-christmas-snow transition-all duration-300 shadow-lg hover:shadow-xl" :to="`${API_URL}/auth/discord`">
        <VueIcon name="ak:discord-fill" class="text-3xl" />
        <span class="font-bold text-lg uppercase">Connexion</span>
      </Button>
    </div>
  </aside>
</template>

<style scoped>
aside::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.85;
  z-index: 0;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(196, 30, 58, 0.1) 50%, rgba(15, 76, 58, 0.1) 100%);
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-radius: inherit;
  backdrop-filter: blur(10px);
}

aside > * {
  z-index: 1;
}
</style>