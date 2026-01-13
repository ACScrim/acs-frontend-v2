<script setup lang="ts">
import Avatar from "@/components/ui/Avatar.vue";
import { useUserStore } from "@/stores/userStore";
import VueIcon from "@kalimahapps/vue-icons/VueIcon";
import { computed, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { Button } from "../ui";
import { API_URL } from "@/utils";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const user = computed(() => userStore.user);
const isMenuOpen = ref(false);
const profileButton = ref<HTMLButtonElement | null>(null);
const menuPosition = ref({ top: 0, left: 0 });
let closeMenuTimeout: ReturnType<typeof setTimeout> | null = null;

const asideRoutes = computed(() =>
  router
    .getRoutes()
    .filter((r) => {
      const showInAside = r.meta.showInAside;
      const showInAdminBar = r.meta.showInAdminBar;
      if (route.path.startsWith("/admin")) {
        return showInAdminBar;
      }
      if (!user.value) return false;
      if (typeof showInAside === "function") {
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
  router.push("/");
};

const updateMenuPosition = () => {
  if (profileButton.value) {
    const rect = profileButton.value.getBoundingClientRect();
    menuPosition.value = {
      top: rect.top + rect.height / 2,
      left: rect.width,
    };
  }
};

const handleMouseEnter = () => {
  if (closeMenuTimeout) {
    clearTimeout(closeMenuTimeout);
    closeMenuTimeout = null;
  }
  isMenuOpen.value = true;
  updateMenuPosition();
};

const handleMouseLeave = () => {
  closeMenuTimeout = setTimeout(() => {
    isMenuOpen.value = false;
  }, 100);
};
</script>

<template>
  <div class="hidden lg:flex flex-col gap-8 px-6 py-8 overflow-visible">
    <RouterLink to="/" class="flex items-center justify-center">
      <img
        src="/acs.avif"
        alt="ACS"
        class="h-16 w-auto drop-shadow-[0_25px_45px_rgba(0,0,0,0.35)]"
        width="142"
        height="64"
      />
    </RouterLink>

    <nav class="flex flex-col gap-2">
      <RouterLink
        v-for="route in asideRoutes"
        :key="route.path"
        :to="route.path"
        class="group flex items-center gap-3 rounded-2xl px-4 py-3 text-foam-200 transition hover:bg-white/5"
        active-class="bg-white/10 text-white shadow-[0_25px_60px_rgba(0,0,0,0.45)]"
      >
        <div
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-accent-300 transition group-hover:bg-white/10 group-hover:text-accent-200"
        >
          <VueIcon
            v-if="route.meta.icon"
            :name="route.meta.icon"
            class="size-5"
          />
        </div>
        <div class="flex flex-col">
          <span class="font-semibold">{{
            route.meta.title || route.name
          }}</span>
        </div>
      </RouterLink>
    </nav>

    <div class="mt-auto">
      <button
        v-if="userStore.isLoggedIn && userStore.user"
        ref="profileButton"
        id="profileButton"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        class="w-full rounded-[var(--radius-lg)] border border-white/10 bg-gradient-to-br from-accent-500/10 to-blush-500/10 p-3 hover:from-accent-500/20 hover:to-blush-500/20 transition"
      >
        <div class="flex items-center gap-3 text-left">
          <div class="relative">
            <Avatar
              :src="userStore.user.avatarUrl"
              class="size-10 ring-2 ring-accent-400/50"
            />
            <div
              class="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-xs text-white"
            >
              <VueIcon name="bs:check" class="text-[10px]" />
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="truncate font-semibold text-white">
              {{ userStore.user.username }}
            </p>
            <p class="text-xs truncate text-foam-300/70">
              {{ userStore.user.scrimium.balance }}
              <img
                src="/scrimium.svg"
                title="Scrimium"
                alt="Scrimium"
                class="size-3 inline"
              />
            </p>
          </div>
        </div>
      </button>

      <!-- Modal menu (teleported outside sidebar) -->
      <Teleport to="body">
        <Transition
          enter-active-class="transition-all duration-200"
          leave-active-class="transition-all duration-200"
          enter-from-class="opacity-0 -translate-x-2"
          enter-to-class="opacity-100 translate-x-0"
        >
          <div
            v-if="isMenuOpen && userStore.isLoggedIn && userStore.user"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
            class="fixed w-56 bg-slate-800/95 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg z-50"
            :style="{
              top: menuPosition.top + 'px',
              left: menuPosition.left + 'px',
              transform: 'translateY(-50%)',
            }"
          >
            <RouterLink
              to="/profile"
              @click="isMenuOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-sm text-foam-200 hover:bg-white/5 transition border-b border-white/10"
            >
              <VueIcon name="bs:person" class="text-accent-300 size-5" />
              <span>Profil</span>
            </RouterLink>

            <RouterLink
              to="/player-levels"
              @click="isMenuOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-sm text-foam-200 hover:bg-white/5 transition border-b border-white/10"
            >
              <VueIcon name="un:mountains" class="text-accent-300 size-5" />
              <span>Mes niveaux</span>
            </RouterLink>

            <RouterLink
              to="/badges"
              @click="isMenuOpen = false"
              class="flex items-center gap-3 px-4 py-3 text-sm text-foam-200 hover:bg-white/5 transition border-b border-white/10"
            >
              <VueIcon name="ph:thin-medal" class="text-accent-300 size-5" />
              <span>Mes badges</span>
            </RouterLink>

            <button
              @click="logout"
              class="w-full flex items-center gap-3 px-4 py-3 text-sm text-blush-300 hover:bg-blush-500/10 transition"
            >
              <VueIcon name="bs:box-arrow-right" class="size-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </Transition>
      </Teleport>

      <Button
        v-if="!userStore.isLoggedIn"
        color="accent"
        class="w-full justify-center text-sm"
        :to="`${API_URL}/auth/discord`"
      >
        <VueIcon name="ak:discord-fill" class="text-lg" />
        <span>Discord</span>
      </Button>
    </div>
  </div>
</template>

<style scoped>
/* No additional scoped styles needed; global theme handles visuals. */
</style>
