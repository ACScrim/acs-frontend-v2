<script setup lang="ts">
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { computed, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

const router = useRouter();
const userStore = useUserStore();
const isAdminMenuOpen = ref(false);

const mobileFooterRoutes = computed(() =>
  router.getRoutes().filter(
    (r) => r.meta.showInMobileFooter
  )
);

const adminRoutes = computed(() =>
  router.getRoutes()
    .filter((r) => r.meta.showInAdminBar)
    .sort((a, b) => {
      const orderA = (a.meta.order as number) ?? 0;
      const orderB = (b.meta.order as number) ?? 0;
      return orderA - orderB;
    })
);

const isAdmin = computed(() => userStore.isAdmin);
</script>

<template>
  <div>
    <!-- Menu déroulant admin -->
    <transition
      v-if="isAdmin"
      name="slide-up"
      @enter="(el) => el.style.height = el.scrollHeight + 'px'"
      @leave="(el) => el.style.height = '0'"
    >
      <div
        v-show="isAdminMenuOpen"
        class="fixed bottom-24 left-1/2 z-50 w-[calc(100%-2.5rem)] max-w-3xl -translate-x-1/2 rounded-[var(--radius-xl)] border border-white/10 bg-gradient-to-r from-surface-700/60 to-surface-800/60 overflow-hidden shadow-[0_25px_55px_rgba(0,0,0,0.55)] backdrop-blur-2xl lg:hidden"
      >
        <nav class="p-3 space-y-1">
          <p class="text-xs uppercase tracking-[0.4em] text-foam-300/40 px-3 py-2 font-semibold">Administration</p>
          <RouterLink
            v-for="route in adminRoutes"
            :key="route.path"
            :to="route.path"
            class="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foam-200 hover:bg-white/5 transition"
            @click="isAdminMenuOpen = false"
          >
            <div v-if="route.meta.icon" class="flex h-5 w-5 items-center justify-center text-accent-300">
              <VueIcon :name="route.meta.icon" />
            </div>
            <span class="group-hover:text-white transition">{{ route.name }}</span>
          </RouterLink>
        </nav>
      </div>
    </transition>

    <!-- Barre de footer avec navigation -->
    <footer class="fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-2.5rem)] max-w-3xl -translate-x-1/2 items-center rounded-[var(--radius-xl)] border border-white/10 bg-gradient-to-r from-surface-700/40 to-surface-800/40 px-4 py-3 shadow-[0_25px_55px_rgba(0,0,0,0.55)] backdrop-blur-2xl lg:hidden">
      <RouterLink
        v-for="route in mobileFooterRoutes"
        :key="route.path"
        :to="route.path.split(':')[0]!"
        class="flex flex-1 flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-foam-300/60 transition"
        active-class="text-white bg-white/5 shadow-inner shadow-accent-500/40"
      >
        <VueIcon v-if="route.meta.icon" :name="route.meta.icon" class="size-5" />
      </RouterLink>
      <button
        v-if="isAdmin"
        @click="isAdminMenuOpen = !isAdminMenuOpen"
        class="flex flex-1 flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-foam-300/60 transition hover:bg-white/5"
        :class="{ 'text-white bg-white/5 shadow-inner shadow-accent-500/40': isAdminMenuOpen }"
      >
        <VueIcon name="bs:shield-lock" class="size-5" />
      </button>
    </footer>
  </div>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>