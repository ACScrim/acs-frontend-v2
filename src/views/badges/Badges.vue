<script setup lang="ts">
import {computed, onMounted} from 'vue';
import {Card} from '@/components/ui';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import type {Badge as BadgeType} from '@/types/models';
import {RouterLink} from 'vue-router';
import {useUserStore} from '@/stores/userStore';
import {useBadgeStore} from '@/stores/badgeStore';

const userStore = useUserStore();
const badgeStore = useBadgeStore();

onMounted(async () => {
  await badgeStore.fetchUserBadges();
});

// Regrouper par jeu (tournament.game.name)
const groupedByGame = computed(() => {
  const map = new Map<string, { gameName: string; gameImage: string; items: BadgeType[] }>();
  badgeStore.badges?.forEach(b => {
    const gameName = b.tournament?.game?.name ?? 'Inconnu';
    const gameImage = b.tournament?.game?.imageUrl ?? '';
    if (!map.has(gameName)) map.set(gameName, { gameName, gameImage, items: [] });
    map.get(gameName)!.items.push(b);
  });
  return Array.from(map.values());
});

const iconForType = (type: BadgeType["type"]) => {
  switch (type) {
    case 'victory':
      return { name: 'bs:trophy-fill', class: 'text-yellow-400' };
    case 'top25':
      return { name: 'ci:medal', class: 'text-amber-400' };
    case 'participation':
      // 'medaille chocolat' — on utilise une médaille brunâtre
      return { name: 'ci:medal', class: 'text-amber-700' };
    case 'mvp':
      return { name: 'bs:trophy', class: 'text-emerald-300' };
    default:
      return { name: 'ci:medal', class: 'text-foam-50' };
  }
};

// Trouve l'équipe contenant l'utilisateur courant pour un badge donné
const getUserTeam = (b: BadgeType) => {
  const teams = b.tournament?.teams;
  if (!teams || !userStore.user) return undefined;
  return teams.find(t => t.users?.some(u => u.id === userStore.user!.id));
};

const getTeamRanking = (b: BadgeType) => {
  const team = getUserTeam(b);
  if (!team) return '-';
  return team.ranking ?? '-';
};

const getTeamTeammates = (b: BadgeType) => {
  const team = getUserTeam(b);
  if (!team || !userStore.user) return [] as string[];
  return team.users.filter(u => u.id !== userStore.user!.id).map(u => u.username);
};

const getTypeTranslation = (type: BadgeType["type"]) => {
  switch (type) {
    case 'victory':
      return 'Victoire';
    case 'top25':
      return 'Top 25';
    case 'participation':
      return 'Participation';
    case 'mvp':
      return 'MVP';
    default:
      return type;
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <div class="h-px w-16 bg-gradient-to-r from-white/0 via-white/40 to-white/0" />
      <div>
        <p class="text-xs uppercase tracking-[0.4em] text-foam-300/60">Badges</p>
        <h1 class="text-2xl font-semibold text-white/90">Mes badges</h1>
      </div>
    </div>

    <Card v-if="badgeStore.loading" class="p-6 text-center">Chargement des badges…</Card>
    <Card v-else-if="badgeStore.error" class="p-6 text-center text-blush-300">Erreur: {{ badgeStore.error }}</Card>

    <template v-else>
      <div v-if="groupedByGame.length === 0">
        <Card class="p-6 text-center">Aucun badge pour le moment.</Card>
      </div>

      <div v-for="group in groupedByGame" :key="group.gameName" class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.4em] text-foam-300/60">Jeu</p>
            <h2 class="text-xl font-semibold">{{ group.gameName }} <span class="text-foam-200/60">({{ group.items.length }})</span></h2>
          </div>
        </div>

        <div class="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <div v-for="b in group.items" :key="b.id">
            <RouterLink v-if="b.tournament?.id" :to="`/tournaments/${b.tournament.id}`" class="group h-full">
              <Card class="p-6 flex flex-col items-center justify-between h-full group-hover:brightness-110 transition relative overflow-hidden bg-transparent">
                <!-- Fond dégradé subtil en arrière-plan -->
                <div class="absolute inset-0 opacity-5 pointer-events-none">
                  <div class="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-accent-300 rounded-full blur-3xl"></div>
                </div>

                <!-- Grand SVG du trophée/médaille -->
                <div class="relative z-10 flex-shrink-0 mb-4">
                  <VueIcon
                    :name="iconForType(b.type).name"
                    :class="`${iconForType(b.type).class} text-8xl drop-shadow-lg`"
                  />
                </div>

                <!-- Infos du badge -->
                <div class="relative z-10 text-center flex-1 flex flex-col justify-between w-full">
                  <div>
                    <p class="text-xs uppercase tracking-[0.3em] text-foam-300/70 font-bold mb-2">{{ getTypeTranslation(b.type) }}</p>
                    <p class="font-semibold text-white text-lg">{{ b.tournament?.name ?? 'Tournoi inconnu' }}</p>
                    <p class="text-xs text-foam-300/60 mt-1">{{ new Date(b.tournament?.date ?? '').toLocaleDateString('fr-FR') }}</p>
                  </div>

                  <!-- Rang en évidence -->
                  <div class="mt-4 py-3 px-4 rounded-lg bg-white/5 border border-white/10">
                    <p class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Classement</p>
                    <p class="text-2xl font-bold text-accent-300">{{ getTeamRanking(b) }} / {{ b.tournament.teams.length }}</p>
                  </div>

                  <!-- Team info -->
                  <div class="mt-4 w-full">
                    <template v-if="getUserTeam(b)">
                      <div class="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-xs">
                        <p class="font-semibold text-foam-50">{{ getUserTeam(b)?.name }}</p>
                        <p class="text-foam-300/70 text-xs mt-1">{{ getTeamTeammates(b).length > 0 ? getTeamTeammates(b).join(', ') : 'Solo' }}</p>
                      </div>
                    </template>
                  </div>
                </div>
              </Card>
            </RouterLink>

            <Card v-else class="p-6 flex flex-col items-center justify-between h-full relative overflow-hidden">
              <!-- Fond dégradé subtil en arrière-plan -->
              <div class="absolute inset-0 opacity-5 pointer-events-none">
                <div class="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-accent-300 rounded-full blur-3xl"></div>
              </div>

              <div class="relative z-10 flex-shrink-0 mb-4">
                <VueIcon
                  :name="iconForType(b.type).name"
                  :class="`${iconForType(b.type).class} text-8xl drop-shadow-lg`"
                />
              </div>

              <!-- Infos du badge -->
              <div class="relative z-10 text-center flex-1 flex flex-col justify-between w-full">
                <div>
                  <p class="text-xs uppercase tracking-[0.3em] text-foam-300/70 font-bold mb-2">{{ getTypeTranslation(b.type) }}</p>
                  <p class="font-semibold text-white text-lg">{{ b.tournament?.name ?? 'Tournoi inconnu' }}</p>
                  <p class="text-xs text-foam-300/60 mt-1">{{ new Date(b.tournament?.date ?? '').toLocaleDateString('fr-FR') }}</p>
                </div>

                <!-- Rang en évidence -->
                <div class="mt-4 py-3 px-4 rounded-lg bg-white/5 border border-white/10">
                  <p class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Classement</p>
                  <p class="text-2xl font-bold text-accent-300">{{ getTeamRanking(b) }}</p>
                </div>

                <!-- Team info -->
                <div class="mt-4 w-full" v-if="getUserTeam(b)">
                  <div class="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-xs">
                    <p class="font-semibold text-foam-50">{{ getUserTeam(b)?.name }}</p>
                    <p class="text-foam-300/70 text-xs mt-1">{{ getTeamTeammates(b).length > 0 ? getTeamTeammates(b).join(', ') : 'Solo' }}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>