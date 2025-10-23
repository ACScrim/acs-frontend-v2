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
      return 'text-christmas-gold bg-christmas-gold/10 border-christmas-gold border-1 rounded-md px-2 py-1';
    case 2:
      return 'text-christmas-silver bg-christmas-silver/10 border-christmas-silver border-1 rounded-md px-2 py-1';
    case 3:
      return 'text-christmas-bronze bg-christmas-bronze/10 border-christmas-bronze border-1 rounded-md px-2 py-1';
    default:
      return 'text-christmas-gold-light bg-christmas-gold-light/10 border-christmas-gold-light border-1 rounded-md px-2 py-1';
  }
};
</script>

<template>
  <Card class="p-6 bg-christmas-navy/80" style="--tw-border-color: var(--color-christmas-ice)">
    <ListView :data="user.tournamentHistory" title="Tournois joués" empty-message="Aucun tournoi joué pour le moment."
      :max-cols="1" :paginate="true" :items-per-page="5">
      <template #item="{ item: tournament }">
        <Card class="flex flex-col lg:flex-row lg:items-center border-christmas-gold border-1">
          <img :src="tournament.game.imageUrl" :alt="`Bannière du tournoi ${tournament.name}`"
            class="w-full lg:w-64 h-32 object-cover rounded-l-xl rounded-r-xl lg:rounded-r-none mb-2 md:mb-0" />
          <div class="px-4 flex flex-col lg:flex-row justify-between items-center flex-1">
            <div class="flex flex-col">
              <span class="font-bold text-lg">{{ tournament.name }}</span>
              <span class="text-sm text-gray-400">
                {{ new Date(tournament.date).toLocaleDateString() }}
              </span>
            </div>

            <div class="flex flex-col xl:flex-row gap-2 xl:gap-6 mb-3 lg:mb-0 items-center">
              <span class="font-bold" :class="colorMedalsClass(getPlayerTeam(tournament)?.ranking)">
                {{ getPlayerTeam(tournament)?.ranking === 1 ? '🏆 1er' 
                : getPlayerTeam(tournament)?.ranking === 2 ? '🥈 2ème' 
                : getPlayerTeam(tournament)?.ranking === 3 ? '🥉 3ème' 
                : getPlayerTeam(tournament)?.ranking + "ème" || 'N/A' }}
                / {{ tournament.teams.length }}
              </span>
            
              <Button :to="`/tournaments/${tournament.id}`" variant="outline" size="sm">
                Détails
                <template #icon>
                  <VueIcon name="bs:arrow-right-circle" />
                </template>
              </Button>
            </div>
          </div>
        </Card>
      </template>
    </ListView>
  </Card>
</template>