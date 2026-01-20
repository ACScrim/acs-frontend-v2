<script setup lang="ts">
import { Avatar, Card } from '@/components/ui';
import type { UserWithStats } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { formatDate } from '@vueuse/core';
import { computed, ref, watch } from "vue";
import { useRoute } from 'vue-router';
import { useUserStore } from "@/stores/userStore.ts";

const props = defineProps<{
  user: UserWithStats;
}>();

const route = useRoute();
const userStore = useUserStore();
const me = userStore.user;

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
    value: props.user.lastActivity ? formatDate(new Date(props.user.lastActivity), 'DD MMMM YYYY') : "Aucune",
    footer: props.user.lastActivity ? 'Dernière fois' : '',
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
const isSaving = ref<boolean>(false);

// Utilisation d'un computed pour afficher la valeur la plus à jour
const displayTwitchUsername = computed(() => {
  return props.user.twitchUsername ?? 'Pas de nom Twitch défini';
});

// Surveiller les changements de l'utilisateur pour réinitialiser le champ d'édition
watch(() => props.user.twitchUsername, (newValue) => {
  twitchUsername.value = newValue;
  isEditingTwitchUsername.value = false;
  isSaving.value = false;
});

// Réinitialiser lors du changement d'utilisateur
watch(() => route.params.userId, () => {
  twitchUsername.value = props.user.twitchUsername;
  isEditingTwitchUsername.value = false;
  isSaving.value = false;
});

const canEdit = computed(() => {
  return me?.id === route.params.userId || !route.params.userId;
});

const handleSave = async () => {
  isSaving.value = true;
  try {
    await emit('saveTwitchUsername', twitchUsername.value);
    // L'édition sera fermée automatiquement par le watch sur props.user.twitchUsername
  } catch (error) {
    isSaving.value = false;
  }
};

const handleCancel = () => {
  twitchUsername.value = props.user.twitchUsername;
  isEditingTwitchUsername.value = false;
};
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
          <div v-if="!isEditingTwitchUsername" class="flex items-center justify-center gap-3">
            <div class="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-purple-400/30 transition-all">
              <VueIcon name="ak:twitch-fill" class="text-purple-400 text-lg" />
              <span class="text-sm font-medium text-foam-200">{{ displayTwitchUsername }}</span>
            </div>
            <button
              v-if="canEdit"
              @click="isEditingTwitchUsername = true"
              class="p-2 rounded-lg bg-white/5 border border-white/10 text-foam-300/60 hover:text-accent-300 hover:border-accent-300/50 hover:bg-accent-500/10 transition-all"
              title="Modifier le nom Twitch"
            >
              <VueIcon name="fa:pencil" class="text-sm" />
            </button>
          </div>
          <div v-else class="flex items-center justify-center gap-2">
            <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-purple-400/50 shadow-lg shadow-purple-500/10">
              <VueIcon name="ak:twitch-fill" class="text-purple-400 text-lg" />
              <input
                v-model="twitchUsername"
                placeholder="Nom Twitch"
                class="bg-transparent border-none outline-none text-sm font-medium text-foam-200 placeholder:text-foam-300/40 w-48"
                :disabled="isSaving"
                @keyup.enter="handleSave"
                @keyup.esc="handleCancel"
              />
            </div>
            <button
              @click="handleSave"
              :disabled="isSaving"
              class="p-2 rounded-lg bg-emerald-500/20 border border-emerald-400/50 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title="Enregistrer"
            >
              <VueIcon v-if="!isSaving" name="fa:check" class="text-lg" />
              <VueIcon v-else name="la:spinner-solid" class="text-lg animate-spin" />
            </button>
            <button
              @click="handleCancel"
              :disabled="isSaving"
              class="p-2 rounded-lg bg-blush-500/20 border border-blush-400/50 text-blush-400 hover:text-blush-300 hover:bg-blush-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title="Annuler"
            >
              <VueIcon name="fa:times" class="text-lg" />
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