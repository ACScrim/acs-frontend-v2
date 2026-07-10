<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { useUserStore } from '@/stores/userStore';
import Footer from './Footer.vue';
import MobileMenu from './MobileMenu.vue';

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
    <div class="acs-ambient-layer absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)]" />
    </div>

    <aside class="relative hidden lg:flex flex-col border-r border-white/10 bg-gradient-to-b from-surface-700/80 to-surface-800/95 overflow-y-auto">
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
      <MobileMenu />
    </section>
  </main>
</template>

<style>
.acs-ambient-layer {
  background:
    radial-gradient(circle at 18% 18%, rgba(123, 109, 255, 0.14), transparent 28rem),
    radial-gradient(circle at 82% 38%, rgba(255, 95, 143, 0.1), transparent 30rem),
    radial-gradient(circle at 52% 82%, rgba(20, 220, 180, 0.08), transparent 32rem);
  contain: layout paint;
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
