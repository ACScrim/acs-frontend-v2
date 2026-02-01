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
  return userStore.user.dailyquizParticipatedToday;
});

const isAcsdleCompleted = computed(() => {
  if (!userStore.user) return false;
  return userStore.user.acsdleParticipatedToday;
});

const isThreeBoxesCompleted = computed(() => {
  if (!userStore.user) return false;
  return userStore.user.boxesParticipatedToday;
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
    <!-- Logo avec animation -->
    <RouterLink to="/" class="flex items-center justify-center group">
      <img
          src="/acs.avif"
          alt="ACS"
          class="h-16 w-auto drop-shadow-[0_25px_45px_rgba(0,0,0,0.35)] transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_30px_60px_rgba(123,109,255,0.4)]"
          width="142"
          height="64"
      />
    </RouterLink>

    <nav class="flex flex-col gap-3">
      <!-- Bouton retour en mode non-admin avec animation -->
      <RouterLink
          v-if="route.path.startsWith('/admin')"
          to="/"
          class="group flex items-center gap-4 rounded-2xl px-4 py-3.5 text-foam-200 transition-all duration-300 hover:bg-gradient-to-r hover:from-blush-500/10 hover:to-accent-500/10 border border-white/10 hover:border-blush-300/30 hover:shadow-[0_0_20px_rgba(255,95,143,0.15)]"
      >
        <div
            class="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-white/5 to-white/10 text-blush-300 transition-all duration-300 group-hover:from-blush-500/20 group-hover:to-blush-400/20 group-hover:scale-110 group-hover:text-blush-200 group-hover:shadow-lg"
        >
          <VueIcon name="bs:arrow-left" class="size-5"/>
        </div>
        <div class="flex flex-col">
          <span class="font-semibold group-hover:text-white transition-colors">Retour à l'app</span>
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

        <!-- Menu ScrimDeck avec effet de glow -->
        <div class="cursor-pointer" @click="toggleMenu('ScrimDeck')">
          <div :class="{
            'group flex items-center gap-4 rounded-2xl px-4 py-3.5 text-foam-200 transition-all duration-300': true,
            'bg-gradient-to-r from-accent-500/20 to-emerald-500/10 text-white shadow-[0_0_35px_rgba(123,109,255,0.25)] border border-accent-400/40': expandedMenus.has('ScrimDeck'),
            'hover:bg-white/5 hover:border-accent-400/30': !expandedMenus.has('ScrimDeck')
          }">
            <div
              :class="{
                'flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300': true,
                'bg-gradient-to-br from-accent-500/30 to-emerald-500/20 text-accent-200 shadow-lg scale-110': expandedMenus.has('ScrimDeck'),
                'bg-white/5 text-accent-300 group-hover:bg-gradient-to-br group-hover:from-accent-500/20 group-hover:to-emerald-500/10 group-hover:scale-105 group-hover:text-accent-200': !expandedMenus.has('ScrimDeck')
              }"
            >
              <VueIcon
                name="ch:cards"
                class="size-6"
              />
            </div>
            <div class="flex flex-col flex-1">
              <span class="font-semibold">ScrimDeck</span>
            </div>
            <VueIcon
              name="bs:chevron-down"
              :class="['transition-all duration-300', expandedMenus.has('ScrimDeck') ? 'rotate-180 text-accent-200' : 'rotate-0 text-foam-300']"
            />
          </div>
          <Transition name="expand">
            <ul v-if="expandedMenus.has('ScrimDeck')" class="mt-2 space-y-2 pl-4">
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
                  class="absolute -top-1 -right-1 inline-flex text-xs font-semibold p-1 px-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-white ring-2 ring-slate-800 animate-bounce shadow-[0_0_20px_rgba(20,220,180,0.5)]">
                  {{ Math.floor((userStore.user?.scrimium.balance ?? 0) / 250) }}
                </span>
              </li>
              <li>
                <SidebarLink :route="$router.getRoutes().find(r => r.name === 'CardTrades')" />
              </li>
              <li>
                <SidebarLink :route="$router.getRoutes().find(r => r.name === 'CardFusion')" />
              </li>
            </ul>
          </Transition>
        </div>

        <SidebarLink :route="$router.getRoutes().find(r => r.name === 'Classement')" />
        <SidebarLink :route="$router.getRoutes().find(r => r.name === 'Propositions de jeux')" />

        <!-- Menu Jeux du jour avec progression -->
        <div class="cursor-pointer" @click="toggleMenu('JeuxDuJour')">
          <div :class="{
            'group flex items-center gap-4 rounded-2xl px-4 py-3.5 text-foam-200 transition-all duration-300': true,
            'bg-gradient-to-r from-blush-500/20 to-amber-500/10 text-white shadow-[0_0_35px_rgba(255,95,143,0.25)] border border-blush-400/40': expandedMenus.has('JeuxDuJour'),
            'hover:bg-white/5 hover:border-blush-400/30': !expandedMenus.has('JeuxDuJour')
          }">
            <div
                :class="{
                  'flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300': true,
                  'bg-gradient-to-br from-blush-500/30 to-amber-500/20 text-blush-200 shadow-lg scale-110': expandedMenus.has('JeuxDuJour'),
                  'bg-white/5 text-blush-300 group-hover:bg-gradient-to-br group-hover:from-blush-500/20 group-hover:to-amber-500/10 group-hover:scale-105 group-hover:text-blush-200': !expandedMenus.has('JeuxDuJour')
                }"
            >
              <VueIcon
                  name="ca:game-console"
                  class="size-6"
              />
            </div>
            <div class="flex flex-col flex-1 min-w-0">
              <span class="font-semibold">Jeux du jour</span>
              <div class="flex items-center gap-2 mt-1">
                <div class="flex gap-1">
                  <div v-for="i in 3" :key="i" :class="{
                    'w-2 h-2 rounded-full transition-all duration-300': true,
                    'bg-emerald-400 shadow-[0_0_8px_rgba(20,220,180,0.6)]': i <= (Number(isDailyQuizCompleted) + Number(isAcsdleCompleted) + Number(isThreeBoxesCompleted)),
                    'bg-white/20': i > (Number(isDailyQuizCompleted) + Number(isAcsdleCompleted) + Number(isThreeBoxesCompleted))
                  }"></div>
                </div>
                <span class="text-xs text-foam-300/80">{{ Number(isDailyQuizCompleted) + Number(isAcsdleCompleted) + Number(isThreeBoxesCompleted) }}/3</span>
                <!-- Indicateur temps restant discret -->
                <span
                  v-if="(Number(isDailyQuizCompleted) + Number(isAcsdleCompleted) + Number(isThreeBoxesCompleted)) < 3"
                  :class="{
                    'text-[10px] ml-auto px-1.5 py-0.5 rounded font-medium': true,
                    'text-emerald-400/70': timeUntilMidnight > 3600000,
                    'text-yellow-400/90 animate-pulse': timeUntilMidnight <= 3600000 && timeUntilMidnight > 600000,
                    'text-red-400/90 animate-pulse': timeUntilMidnight <= 600000
                  }"
                >
                  {{ formatTimeLeft(timeUntilMidnight) }}
                </span>
                <span v-else class="text-[9px] ml-auto py-0.5 text-emerald-400/90">
                  Bonus récupéré !
                </span>
              </div>
            </div>
            <VueIcon
                name="bs:chevron-down"
                :class="['transition-all duration-300', expandedMenus.has('JeuxDuJour') ? 'rotate-180 text-blush-200' : 'rotate-0 text-foam-300']"
            />
          </div>
          <Transition name="expand">
            <ul v-if="expandedMenus.has('JeuxDuJour')" class="mt-2 space-y-2 pl-4">
              <li class="relative group/item">
                <SidebarLink :route="$router.getRoutes().find(r => r.name === 'Acsdle')">
                  <template #labelSuffix>
                    <div class="flex items-center gap-1.5 ml-auto">
                      <span v-if="!isAcsdleCompleted" class="text-[11px] font-semibold text-emerald-400/90">Max +150</span>
                      <span v-else class="text-[11px] font-semibold text-foam-300/70">Complété</span>
                      <img v-if="!isAcsdleCompleted" alt="scrimium" title="scrimium" src="/scrimium.svg" class="size-3 opacity-70"/>
                    </div>
                  </template>
                </SidebarLink>
              </li>
              <li class="relative group/item">
                <SidebarLink :route="$router.getRoutes().find(r => r.name === 'DailyQuiz')">
                  <template #labelSuffix>
                    <div class="flex items-center gap-1.5 ml-auto">
                      <span v-if="!isDailyQuizCompleted" class="text-[11px] font-semibold text-emerald-400/90">Max +150</span>
                      <span v-else class="text-[11px] font-semibold text-foam-300/70">Complété</span>
                      <img v-if="!isDailyQuizCompleted" alt="scrimium" title="scrimium" src="/scrimium.svg" class="size-3 opacity-70"/>
                    </div>
                  </template>
                </SidebarLink>
              </li>
              <li class="relative group/item">
                <SidebarLink :route="$router.getRoutes().find(r => r.name === 'ThreeBoxes')">
                  <template #labelSuffix>
                    <div class="flex items-center gap-1.5 ml-auto">
                      <span v-if="!isThreeBoxesCompleted" class="text-[11px] font-semibold text-emerald-400/90">Max +100</span>
                      <span v-else class="text-[11px] font-semibold text-foam-300/70">Complété</span>
                      <img v-if="!isThreeBoxesCompleted" alt="scrimium" title="scrimium" src="/scrimium.svg" class="size-3 opacity-70"/>
                    </div>
                  </template>
                </SidebarLink>
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
        class="w-full rounded-2xl border border-white/10 bg-gradient-to-br from-accent-500/10 to-blush-500/10 p-4 hover:from-accent-500/20 hover:to-blush-500/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(123,109,255,0.3)] hover:scale-[1.02]"
      >
        <div class="flex items-center gap-3 text-left">
          <div class="relative">
            <Avatar
              :src="userStore.user.avatarUrl"
              class="size-11 ring-2 ring-accent-400/50 transition-all duration-300 hover:ring-accent-300"
            />
            <div
              class="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-xs text-white shadow-[0_0_8px_rgba(20,220,180,0.6)]"
            >
              <VueIcon name="bs:check" class="text-[10px]"/>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="truncate font-semibold text-white text-sm">
              {{ userStore.user.username }}
            </p>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="text-xs text-foam-300/70 font-medium">{{ userStore.user.scrimium.balance }}</span>
              <img
                src="/scrimium.svg"
                title="Scrimium"
                alt="Scrimium"
                class="size-3.5 inline opacity-70"
              />
            </div>
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

<style>
aside::-webkit-scrollbar {
  width: 3px
}
</style>