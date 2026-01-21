<script setup lang="ts">
import Avatar from "@/components/ui/Avatar.vue";
import {useUserStore} from "@/stores/userStore";
import VueIcon from "@kalimahapps/vue-icons/VueIcon";
import {computed, ref} from "vue";
import {RouterLink, useRoute, useRouter} from "vue-router";
import {Button} from "../ui";
import {API_URL} from "@/utils";
import SidebarLink from "@/components/global/SidebarLink.vue";
import {useNow} from "@vueuse/core";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const user = computed(() => userStore.user);
const isMenuOpen = ref(false);
const profileButton = ref<HTMLButtonElement | null>(null);
const menuPosition = ref({top: 0, left: 0});
const expandedMenus = ref<Set<string>>(new Set());
let closeMenuTimeout: ReturnType<typeof setTimeout> | null = null;

const toggleMenu = (label: string) => {
  if (expandedMenus.value.has(label)) {
    expandedMenus.value.delete(label);
  } else {
    expandedMenus.value.add(label);
  }
};

const adminRoutes = computed(() => router
    .getRoutes()
    .filter((r) => {
      const showInAside = r.meta.showInAside;
      const showInAdminBar = r.meta.showInAdminBar;
      if (route.path.startsWith("/admin")) {
        if (typeof showInAdminBar === "function") {
          return showInAdminBar(user.value);
        }
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

const notifyBoosterAvailable = computed(() => userStore.user && userStore.user.scrimium.balance >= 250);

const isDailyQuizCompleted = computed(() => {
  if (!userStore.user) return false;
  return userStore.user.scrimium.transactions.filter(t => t.description === 'dailyquiz | participation' && new Date(t.date).toDateString() === new Date().toDateString()).length > 0;
});

const isAcsdleCompleted = computed(() => {
  if (!userStore.user) return false;
  return userStore.user.scrimium.transactions.filter(t => t.description === 'acsdle | completion' && new Date(t.date).toDateString() === new Date().toDateString()).length > 0;
});

const now = useNow({ interval: 1000 });
const timeUntilMidnight = computed(() => {
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.value.getTime();
});
const formatTimeLeft = (time: number) => {
  const hours = Math.floor(time / (1000 * 60 * 60));
  const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((time % (1000 * 60)) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
      <!-- Bouton retour en mode non-admin -->
      <RouterLink
          v-if="route.path.startsWith('/admin')"
          to="/"
          class="group flex items-center gap-3 rounded-2xl px-4 py-3 text-foam-200 transition hover:bg-white/5 border border-white/10"
      >
        <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-blush-300 transition group-hover:bg-white/10 group-hover:text-blush-200"
        >
          <VueIcon name="bs:arrow-left" class="size-5"/>
        </div>
        <div class="flex flex-col">
          <span class="font-semibold">Retour à l'app</span>
        </div>
      </RouterLink>

      <!-- Admin Routes -->
      <template v-if="$route.path.startsWith('/admin')">
        <SidebarLink
          v-for="route in adminRoutes"
          :key="route.path"
          :route="route"
        />
      </template>

      <template v-else>
        <SidebarLink :route="$router.getRoutes().find(r => r.name === 'Tournois')" />
        <div class="cursor-pointer" @click="toggleMenu('ScrimDeck')">
          <div :class="{'group flex items-center gap-3 rounded-2xl px-4 py-3 text-foam-200 transition hover:bg-white/5': true, 'bg-white/10 text-white shadow-[0_25px_60px_rgba(0,0,0,0.45)]': expandedMenus.has('ScrimDeck')}">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-accent-300 transition group-hover:bg-white/10 group-hover:text-accent-200"
            >
              <VueIcon
                name="ch:cards"
                class="size-5"
              />
            </div>
            <div class="flex flex-col">
              <span class="font-semibold">ScrimDeck</span>
            </div>
            <VueIcon
              name="bs:chevron-down"
              :class="['ml-auto transition-transform', expandedMenus.has('ScrimDeck') ? 'rotate-180' : 'rotate-0']"
            />
          </div>
          <Transition name="expand">
            <ul v-if="expandedMenus.has('ScrimDeck')" class="mt-2 space-y-1 pl-4">
              <li>
                <SidebarLink :route="$router.getRoutes().find(r => r.name === 'CardCreator')" />
              </li>
              <li>
                <SidebarLink :route="$router.getRoutes().find(r => r.name === 'CardCollection')" />
              </li>
              <li class="relative">
                <SidebarLink :route="$router.getRoutes().find(r => r.name === 'BoosterShop')" />
                <span
                  v-if="notifyBoosterAvailable"
                  class="absolute -top-1 -right-1 inline-flex text-xs p-1 px-2 rounded-full bg-emerald-500 ring-2 ring-slate-800 animate-pulse">
                  {{ Math.floor((userStore.user?.scrimium.balance ?? 0) / 250) }} disponible(s)
                </span>
              </li>
              <li>
                <SidebarLink :route="$router.getRoutes().find(r => r.name === 'CardTrades')" />
              </li>
            </ul>
          </Transition>
        </div>
        <SidebarLink :route="$router.getRoutes().find(r => r.name === 'Classement')" />
        <SidebarLink :route="$router.getRoutes().find(r => r.name === 'Propositions de jeux')" />
        <div class="cursor-pointer" @click="toggleMenu('JeuxDuJour')">
          <div :class="{'group flex items-center gap-3 rounded-2xl px-4 py-3 text-foam-200 transition hover:bg-white/5': true, 'bg-white/10 text-white shadow-[0_25px_60px_rgba(0,0,0,0.45)]': expandedMenus.has('ScrimDeck')}">
            <div
                class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-accent-300 transition group-hover:bg-white/10 group-hover:text-accent-200"
            >
              <VueIcon
                  name="ca:game-console"
                  class="size-5"
              />
            </div>
            <div class="flex flex-col">
              <span class="font-semibold">Jeux du jour ({{ Number(isDailyQuizCompleted) + Number(isAcsdleCompleted) }} / 2)</span>
            </div>
            <VueIcon
                name="bs:chevron-down"
                :class="['ml-auto transition-transform', expandedMenus.has('JeuxDuJour') ? 'rotate-180' : 'rotate-0']"
            />
          </div>
          <Transition name="expand">
            <ul v-if="expandedMenus.has('JeuxDuJour')" class="mt-2 space-y-1 pl-4">
              <li class="relative">
                <SidebarLink :route="$router.getRoutes().find(r => r.name === 'Acsdle')">
                  <template #labelSuffix>
                    <span
                        v-if="!isAcsdleCompleted"
                        class="inline-flex items-center px-2 py-0.5 font-medium text-white"
                    >
                      ( 150 <img alt="scrimium" title="scrimium" src="/scrimium.svg" class="inline size-3 ml-1"/>)
                    </span>
                  </template>
                </SidebarLink>
                <span
                  v-if="!isAcsdleCompleted"
                  :class="{
                    'absolute -top-1 -right-1 text-xs text-white px-1.5 py-0.5 rounded-full ring-2 ring-slate-800': true,
                    'bg-emerald-500': timeUntilMidnight > 3600000,
                    'bg-yellow-500': timeUntilMidnight <= 3600000 && timeUntilMidnight > 600000,
                    'bg-red-500 animate-pulse': timeUntilMidnight <= 600000
                  }"
                >
                  <VueIcon name="md:clock" />
                  {{ formatTimeLeft(timeUntilMidnight)  }}
                </span>
              </li>
              <li class="relative">
                <SidebarLink
                    :route="$router.getRoutes().find(r => r.name === 'DailyQuiz')"
                >
                  <template #labelSuffix>
                    <span
                        v-if="!isDailyQuizCompleted"
                        class="inline-flex items-center px-2 py-0.5 font-medium text-white"
                    >
                      ( 50 <img alt="scrimium" title="scrimium" src="/scrimium.svg" class="inline size-3 ml-1"/>)
                    </span>
                  </template>
                </SidebarLink>
                <span
                    v-if="!isDailyQuizCompleted"
                    :class="{
                    'absolute -top-1 -right-1 text-xs text-white px-1.5 py-0.5 rounded-full ring-2 ring-slate-800': true,
                    'bg-emerald-500': timeUntilMidnight > 3600000,
                    'bg-yellow-500': timeUntilMidnight <= 3600000 && timeUntilMidnight > 600000,
                    'bg-red-500 animate-pulse': timeUntilMidnight <= 600000
                  }"
                >
                  <VueIcon name="md:clock" />
                  {{ formatTimeLeft(timeUntilMidnight)  }}
                </span>
              </li>
            </ul>
          </Transition>
        </div>
        <SidebarLink :route="$router.getRoutes().find(r => r.name === 'Admin')" v-if="userStore.isAdmin" />
        <SidebarLink :route="$router.getRoutes().find(r => r.name === 'Gestion des cartes')" v-if="userStore.isCardAdmin" />
      </template>
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
              <VueIcon name="bs:check" class="text-[10px]"/>
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
              <VueIcon name="bs:person" class="text-accent-300 size-5"/>
              <span>Profil</span>
            </RouterLink>

            <RouterLink
                to="/player-levels"
                @click="isMenuOpen = false"
                class="flex items-center gap-3 px-4 py-3 text-sm text-foam-200 hover:bg-white/5 transition border-b border-white/10"
            >
              <VueIcon name="un:mountains" class="text-accent-300 size-5"/>
              <span>Mes niveaux</span>
            </RouterLink>

            <RouterLink
                to="/badges"
                @click="isMenuOpen = false"
                class="flex items-center gap-3 px-4 py-3 text-sm text-foam-200 hover:bg-white/5 transition border-b border-white/10"
            >
              <VueIcon name="ph:thin-medal" class="text-accent-300 size-5"/>
              <span>Mes badges</span>
            </RouterLink>

            <button
                @click="logout"
                class="w-full flex items-center gap-3 px-4 py-3 text-sm text-blush-300 hover:bg-blush-500/10 transition"
            >
              <VueIcon name="bs:box-arrow-right" class="size-5"/>
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
        <VueIcon name="ak:discord-fill" class="text-lg"/>
        <span>Discord</span>
      </Button>
    </div>
  </div>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
