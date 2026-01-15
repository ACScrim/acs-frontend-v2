<script setup lang="ts">
import { Avatar, Card } from '@/components/ui';
import type { UserWithStats } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { formatDate } from '@vueuse/core';
import {ref, watch} from "vue";
import { useRoute } from 'vue-router';
import {useUserStore} from "@/stores/userStore.ts";

const props = defineProps<{
  user: UserWithStats;
}>();

const route = useRoute();
const me = useUserStore().user

const emit = defineEmits<{
  'saveTwitchUsername': [twitchUsername: string | undefined];
}>();

const statsBlocks= [
  {
    id: '1',
    icon: 'lu:calendar-days',
    label: 'Membre',
    value: formatDate(new Date(props.user.createdAt), 'DD MMMM YYYY'),
    footer: 'Depuis',
    colorClass: 'text-accent-200',
  },
  {
    id: '2',
    icon: 'bs:lightning-fill',
    label: 'Activité',
    value: formatDate(new Date(props.user.lastActivity), 'DD MMMM YYYY'),
    footer: 'Dernière fois',
    colorClass: 'text-blush-300',
  },
  {
    id: '3',
    icon: 'cd:target',
    label: 'Participation',
    value: props.user.tournamentStats.tournamentsCount,
    footer: 'Tournois joués',
    colorClass: 'text-emerald-300',
  },
]

const twitchUsername = ref<string | undefined>(props.user.twitchUsername);
const isEditingTwitchUsername = ref<boolean>(false);

watch(() => [route.params.userId], () => {
  twitchUsername.value = props.user.twitchUsername;
});
</script>

<template>
  <Card class="glass-panel p-8 space-y-8">
    <div class="flex flex-col items-center gap-6 text-center">
      <div class="relative">
        <div class="absolute -inset-3 rounded-full bg-gradient-to-r from-accent-500 via-blush-500 to-emerald-500 opacity-20 blur-xl" />
        <Avatar :src="user.avatarUrl" :alt="`Avatar de ${user.username}`" :size="40" class="relative shadow-[var(--shadow-soft)] ring-2 ring-accent-400" />
      </div>
      <div class="space-y-4">
        <div>
          <p class="text-xs uppercase tracking-[0.4em] text-foam-300/80">Profil joueur</p>
          <h1 class="hero-title font-display text-transparent bg-clip-text bg-gradient-to-r from-accent-300 via-blush-300 to-emerald-300">{{ user.username }}</h1>
        </div>

        <!-- Twitch Username Section -->
        <div class="space-y-2">
          <div v-if="!isEditingTwitchUsername" class="flex items-center justify-center gap-2">
            <div class="flex items-center gap-2 text-foam-300/80">
              <VueIcon name="ak:twitch-fill" class="text-purple-400" />
              <span class="text-sm">{{ twitchUsername ?? 'Pas de nom Twitch défini' }}</span>
            </div>
            <button
              v-if="me?.id === route.params.userId || !route.params.userId"
              @click="isEditingTwitchUsername = true"
              class="text-foam-300/60 hover:text-accent-300 transition"
              title="Modifier le nom Twitch"
            >
              <VueIcon name="fa:pencil" class="text-sm" />
            </button>
          </div>
          <div v-else class="flex items-center justify-center gap-2">
            <VueIcon name="ak:twitch-fill" class="text-purple-400" />
            <input
              v-model="twitchUsername"
              placeholder="Nom Twitch"
              class="form-input max-w-xs"
            />
            <button
              @click="emit('saveTwitchUsername', twitchUsername); isEditingTwitchUsername = false"
              class="text-emerald-400 hover:text-emerald-300 transition"
              title="Enregistrer"
            >
              <VueIcon name="fa:check" class="cursor-pointer hover:scale-110 text-lg" />
            </button>
            <button
              @click="isEditingTwitchUsername = false"
              class="text-blush-400 hover:text-blush-300 transition"
              title="Annuler"
            >
              <VueIcon name="fa:times" class="cursor-pointer hover:scale-110 text-lg" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <Card v-for="item in statsBlocks" :key="item.id" class="glass-panel bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 p-6 text-center group hover:border-white/20 transition">
        <template #header>
          <div class="flex items-center justify-center gap-2 text-sm font-semibold mb-2" :class="item.colorClass">
            <VueIcon :name="item.icon" class="text-lg" />
            <span class="uppercase tracking-[0.3em] text-foam-200/70">{{ item.label }}</span>
          </div>
        </template>
        <p class="text-2xl font-semibold text-white group-hover:text-accent-200 transition">{{ item.value }}</p>
        <template #footer>
          <p class="text-xs uppercase tracking-[0.3em] text-foam-300/70 mt-2">{{ item.footer }}</p>
        </template>
      </Card>
    </div>
  </Card>
</template>