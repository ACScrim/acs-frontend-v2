<script setup lang="ts">
import Avatar from '@/components/ui/Avatar.vue';
import { useUserStore } from '@/stores/userStore';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import Separator from '../ui/Separator.vue';
import { Button } from '../ui';

const router = useRouter();
const asideRoutes = computed(() =>
  router.getRoutes().filter(
    (r) => r.meta.showInAside
  )
);
const userStore = useUserStore();
const API_URL = import.meta.env.VITE_API_URL
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
      <Button v-if="userStore.isLoggedIn && userStore.user" to="/profile" class="w-full gap-4 bg-gradient-to-r from-christmas-gold to-christmas-gold-light text-christmas-navy hover:from-christmas-red hover:to-christmas-crimson hover:text-christmas-snow transition-all duration-300 shadow-lg hover:shadow-xl">
        <Avatar :src="userStore.user.avatarUrl" />
        <div class="flex flex-col">
          <span class="font-bold text-lg uppercase text-left">{{ userStore.user.username }}</span>
          <span class="text-xs italic underline">Voir mon profil</span>
        </div>
      </Button>
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