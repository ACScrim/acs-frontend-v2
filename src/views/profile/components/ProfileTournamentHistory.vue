<script setup lang="ts">
import ListView from '@/components/global/ListView.vue';
import { Button, Card } from '@/components/ui';
import type { Tournament, UserWithStats } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';

const props = defineProps<{
  user: UserWithStats;
}>();

const getPlayerTeam = (tournament: Tournament): Tournament['teams'][number] | null => {
  for (const team of tournament.teams) {
    if (team.users.some(player => player.toString() === props.user.id)) {
      return team;
    }
  }
  return null;
};

const colorMedalsClass = (ranking: number | undefined): string => {
  switch (ranking) {
    case 1:
      return 'text-amber-400 border-amber-400 bg-amber-400/10';
    case 2:
      return 'text-foam-200 border-foam-200 bg-foam-200/10';
    case 3:
      return 'text-blush-300 border-blush-300 bg-blush-300/10';
    default:
      return 'text-white border-white/30 bg-white/5';
  }
};
</script>

<template>
  <Card class="glass-panel p-8 space-y-6">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="h-px w-16 bg-gradient-to-r from-blush-400 to-transparent" />
        <h2 class="hero-title font-display text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blush-300 to-accent-300">Tournois joués</h2>
      </div>
    </template>

    <ListView :data="user.tournamentHistory" empty-message="Aucun tournoi joué pour le moment."
      :max-cols="1" :paginate="true" :items-per-page="5">
      <template #item="{ item: tournament }">
        <Card class="flex flex-col lg:flex-row gap-4 border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 group hover:border-white/20 transition">
          <img :src="tournament.game.imageUrl" :alt="`Bannière du tournoi ${tournament.name}`"
            class="h-36 w-full rounded-2xl object-cover lg:h-auto lg:w-64" />
          <div class="flex flex-1 flex-col gap-4">
            <div class="flex flex-col gap-1">
              <span class="text-lg font-semibold text-white group-hover:text-accent-200 transition">{{ tournament.name }}</span>
              <span class="text-sm text-foam-300/70">
                {{ new Date(tournament.date).toLocaleDateString() }}
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <span class="inline-flex items-center gap-2 rounded-full border px-4 py-1 text-sm font-semibold" :class="colorMedalsClass(getPlayerTeam(tournament)?.ranking)">
                {{ getPlayerTeam(tournament)?.ranking ? `#${getPlayerTeam(tournament)?.ranking}` : 'N/A' }} / {{ tournament.teams.length }}
              </span>
              <Button :to="`/tournaments/${tournament.id}`" variant="outline" size="sm" class="gap-2">
                <template #icon>
                  <VueIcon name="bs:arrow-right-circle" />
                </template>
                Détails
              </Button>
            </div>
          </div>
        </Card>
      </template>
    </ListView>
  </Card>
</template>