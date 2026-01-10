<script setup lang="ts">
import Confetti from "@/components/ui/Confetti.vue";
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { useUserStore } from '@/stores/userStore';
import Footer from './Footer.vue';
import MobileMenu from './MobileMenu.vue';

interface Orb {
  id: number;
  x: number;
  y: number;
  size: number;
  hue: number;
  delay: number;
}

const orbs = ref<Orb[]>(Array.from({ length: 5 }, (_, idx) => ({
  id: idx,
  x: Math.random() * 90,
  y: Math.random() * 90,
  size: 24 + Math.random() * 28,
  hue: 210 + Math.random() * 80,
  delay: Math.random() * 4,
})));

const userStore = useUserStore();
const router = useRouter();

const showAdminMenu = computed(() => userStore.isAdmin);
const isAdminMenuOpen = ref(false);
const adminButtonRef = ref<HTMLButtonElement | null>(null);

const adminRoutes = computed(() =>
  router.getRoutes()
    .filter((r) => r.meta.showInAdminBar)
    .sort((a, b) => {
      const orderA = (a.meta.order as number) ?? 0;
      const orderB = (b.meta.order as number) ?? 0;
      return orderA - orderB;
    })
);

const closeAdminMenu = () => {
  isAdminMenuOpen.value = false;
  adminButtonRef.value?.focus();
};

const onDocumentClick = (e: MouseEvent) => {
  if (!isAdminMenuOpen.value) return;
  const target = e.target as Node | null;
  if (!target) return;

  const dropdownEl = document.getElementById('acs-mobile-admin-dropdown');
  const buttonEl = adminButtonRef.value;

  if (dropdownEl?.contains(target)) return;
  if (buttonEl?.contains(target)) return;

  closeAdminMenu();
};

const onDocumentKeydown = (e: KeyboardEvent) => {
  if (!isAdminMenuOpen.value) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    closeAdminMenu();
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
  <main class="relative grid overflow-hidden h-dvh w-full grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] bg-ink-950 place-items-stretch">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        v-for="orb in orbs"
        :key="orb.id"
        class="absolute rounded-[999px] blur-[120px] opacity-60 mix-blend-screen"
        :style="{
          left: `${orb.x}%`,
          top: `${orb.y}%`,
          width: `${orb.size}rem`,
          height: `${orb.size}rem`,
          background: `radial-gradient(circle, hsl(${orb.hue}deg 90% 65% / 0.8), transparent)` ,
          animation: `float-orb ${16 + orb.id * 2}s ease-in-out ${orb.delay}s infinite alternate`
        }"
      />
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)]" />
    </div>

    <aside class="relative hidden lg:flex flex-col border-r border-white/10 bg-gradient-to-b from-surface-700/40 to-surface-800/60 backdrop-blur-2xl overflow-y-auto">
      <slot name="aside" />
    </aside>

    <section class="relative z-10 flex flex-col overflow-y-auto view" data-acs-scroll-region>
      <!-- Header mobile avec logo et liens admin -->
      <div class="lg:hidden fixed left-0 top-0 py-2 z-40 backdrop-blur-md w-full border-b border-white/10">
        <div class="flex items-center justify-between px-5">
          <RouterLink to="/" class="block w-fit">
            <img src="/acs.avif" alt="ACS" class="h-10 w-auto drop-shadow-[0_25px_45px_rgba(0,0,0,0.35)] hover:opacity-80 transition-opacity" />
          </RouterLink>

          <div v-if="showAdminMenu" class="relative">
            <button
              ref="adminButtonRef"
              type="button"
              class="flex items-center justify-center rounded-xl px-3 py-2 text-foam-300/70 hover:bg-white/5 hover:text-white transition"
              aria-label="Administration"
              aria-haspopup="menu"
              :aria-expanded="isAdminMenuOpen"
              aria-controls="acs-mobile-admin-dropdown"
              @click="isAdminMenuOpen = !isAdminMenuOpen"
            >
              <VueIcon name="bs:shield-lock" class="size-5" />
            </button>

            <transition
              name="slide-down"
              @enter="(el) => (el as any).style.height = el.scrollHeight + 'px'"
              @leave="(el) => (el as any).style.height = '0'"
            >
              <div
                v-show="isAdminMenuOpen"
                id="acs-mobile-admin-dropdown"
                class="absolute right-0 mt-2 z-50 w-[min(20rem,calc(100vw-2.5rem))] rounded-[var(--radius-xl)] border border-white/10 bg-gradient-to-r from-surface-700 to-surface-800 overflow-hidden shadow-[0_25px_55px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
                role="menu"
                aria-label="Administration"
              >
                <nav class="p-3 space-y-1">
                  <p class="text-xs uppercase tracking-[0.4em] text-foam-300/40 px-3 py-2 font-semibold">Administration</p>
                  <RouterLink
                    v-for="route in adminRoutes"
                    :key="route.path"
                    :to="route.path"
                    class="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foam-200 hover:bg-white/5 transition"
                    role="menuitem"
                    @click="closeAdminMenu"
                  >
                    <div v-if="route.meta.icon" class="flex h-5 w-5 items-center justify-center text-accent-300">
                      <VueIcon :name="route.meta.icon" />
                    </div>
                    <span class="group-hover:text-white transition">{{ route.name }}</span>
                  </RouterLink>
                </nav>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <div class="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-20 lg:py-5 lg:px-10">
        <slot name="view" />
      </div>
      <Footer />
      <Confetti manualstart :globalOptions="{ disableForReducedMotion: true }" class=" fixed top-0 left-0 right-0 bottom-0 h-screen overflow-y-auto pointer-events-none z-50" />
      <MobileMenu />
    </section>
  </main>
</template>

<style>
@keyframes float-orb {
  0% {
    transform: translate3d(0, 0, 0) scale(0.9);
    opacity: 0.6;
  }
  100% {
    transform: translate3d(8%, -10%, 0) scale(1.1);
    opacity: 0.9;
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>