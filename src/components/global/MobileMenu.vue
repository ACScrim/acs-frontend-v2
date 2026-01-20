<script setup lang="ts">
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { RouterLink, useRouter, type RouteRecordNormalized } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { API_URL } from '@/utils';

const router = useRouter();
const userStore = useUserStore();

const isMenuOpen = ref(false);
const menuButtonRef = ref<HTMLButtonElement | null>(null);

const mobileFooterRoutes = computed(() =>
  router.getRoutes().filter(
    (r: RouteRecordNormalized) => r.meta.showInMobileFooter
  ).sort((a, b) => (a.meta.mobileFooterOrder as number ?? 100) - (b.meta.mobileFooterOrder as number ?? 100))
);

const menuRoutes = computed(() => [
  { label: 'Propositions de jeux', to: '/game-proposals', icon: 'bx:upvote' },
  { label: 'Acsdle', to: '/games/acsdle', icon: 'ca:game-console' },
  { label: 'Daily Quiz', to: '/games/dailyQuiz', icon: 'md:outlined-quiz' },
  { label: 'Collection de cartes', to: '/scrimdeck/collection', icon: 'ch:cards' },
  { label: 'Boutique de boosters', to: '/scrimdeck/booster', icon: 'ci:shop' },
]);

const closeMenu = () => {
  isMenuOpen.value = false;
  menuButtonRef.value?.focus();
};

const onDocumentClick = (e: MouseEvent) => {
  if (!isMenuOpen.value) return;
  const target = e.target as Node | null;
  if (!target) return;

  const dropdownEl = document.getElementById('acs-mobile-menu-dropdown');
  const buttonEl = menuButtonRef.value;
  if (dropdownEl?.contains(target)) return;
  if (buttonEl?.contains(target)) return;

  closeMenu();
};

const onDocumentKeydown = (e: KeyboardEvent) => {
  if (!isMenuOpen.value) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    closeMenu();
  }
};

onMounted(() => {
  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', onDocumentKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick);
  document.removeEventListener('keydown', onDocumentKeydown);
});
</script>

<template>
  <div>
    <!-- Dropdown menu -->
    <transition
      name="slide-up"
      @enter="(el) => (el as any).style.height = el.scrollHeight + 'px'"
      @leave="(el) => (el as any).style.height = '0'"
    >
      <div
        v-show="isMenuOpen"
        id="acs-mobile-menu-dropdown"
        class="fixed bottom-24 left-1/2 z-50 w-[calc(100%-2.5rem)] max-w-3xl -translate-x-1/2 rounded-[var(--radius-xl)] border border-white/10 bg-gradient-to-r from-surface-700/60 to-surface-800/60 overflow-hidden shadow-[0_25px_55px_rgba(0,0,0,0.55)] backdrop-blur-2xl lg:hidden"
        role="menu"
        aria-label="Menu"
      >
        <nav class="p-3 space-y-1">
          <p class="text-xs uppercase tracking-[0.4em] text-foam-300/40 px-3 py-2 font-semibold">Menu</p>
          <RouterLink
            v-for="route in menuRoutes"
            :key="route.to"
            :to="route.to"
            class="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foam-200 hover:bg-white/5 transition"
            role="menuitem"
            @click="closeMenu"
          >
            <div class="flex h-5 w-5 items-center justify-center text-accent-300">
              <VueIcon :name="route.icon" />
            </div>
            <span class="group-hover:text-white transition">{{ route.label }}</span>
          </RouterLink>
        </nav>
      </div>
    </transition>

    <!-- Barre de footer -->
    <footer class="fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-2.5rem)] max-w-3xl -translate-x-1/2 items-center rounded-[var(--radius-xl)] border border-white/10 bg-gradient-to-r from-surface-700/40 to-surface-800/40 px-4 py-3 shadow-[0_25px_55px_rgba(0,0,0,0.55)] backdrop-blur-2xl lg:hidden">

      <!-- Bouton de connexion Discord si non connecté -->
      <a
        v-if="!userStore.isLoggedIn"
        :href="`${API_URL}/auth/discord`"
        class="flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4 text-sm font-semibold bg-accent-500/30 text-white hover:bg-accent-500/40 transition border border-accent-500/50 shadow-lg shadow-accent-500/20"
        aria-label="Se connecter avec Discord"
      >
        <VueIcon name="bs:discord" class="size-6" />
        <span>Se connecter avec Discord</span>
      </a>

      <!-- Navigation normale si connecté -->
      <template v-else>
        <RouterLink
          v-for="route in mobileFooterRoutes"
          :key="route.path"
          :to="route.path.split(':')[0]!"
          class="flex flex-1 flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-foam-300/60 transition"
          active-class="text-white bg-white/5 shadow-inner shadow-accent-500/40"
          :aria-label="String(route.meta.title ?? route.name ?? route.path)"
        >
          <VueIcon v-if="route.meta.icon" :name="route.meta.icon" class="size-5" />
        </RouterLink>

        <button
          ref="menuButtonRef"
          type="button"
          class="flex flex-1 flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-foam-300/60 transition hover:bg-white/5"
          :class="{ 'text-white bg-white/5 shadow-inner shadow-accent-500/40': isMenuOpen }"
          aria-haspopup="menu"
          :aria-expanded="isMenuOpen"
          aria-controls="acs-mobile-menu-dropdown"
          aria-label="Menu"
          @click="isMenuOpen = !isMenuOpen"
        >
          <VueIcon name="bx:menu" class="size-5" />
        </button>
      </template>
    </footer>
  </div>
</template>

<style scoped>
/* stylelint-disable selector-class-pattern */
/*noinspection CssUnusedSymbol */
:deep(.slide-up-enter-active),
/*noinspection CssUnusedSymbol */
:deep(.slide-up-leave-active) {
  transition: all 0.3s ease;
}

/*noinspection CssUnusedSymbol */
:deep(.slide-up-enter-from) {
  opacity: 0;
  transform: translateY(10px);
}

/*noinspection CssUnusedSymbol */
:deep(.slide-up-leave-to) {
  opacity: 0;
  transform: translateY(10px);
}
/* stylelint-enable selector-class-pattern */
</style>