<script setup lang="ts">
import ListView from '@/components/global/ListView.vue';
import { Card } from '@/components/ui';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import TournamentUserCard from './TournamentUserCard.vue';
import type { Tournament, User } from '@/types/models';

interface Props {
  teams: Tournament['teams'];
  tournament: Tournament;
  maxCols?: number;
}

withDefaults(defineProps<Props>(), {
  maxCols: 2,
});

const mergeUserAndTournamentPlayerData = (user: User, tournamentPlayerData?: Tournament['players'][number]) => {
  return {
    ...user,
    hasCheckin: tournamentPlayerData?.hasCheckin || false,
    isCaster: tournamentPlayerData?.isCaster || false,
    inWaitlist: tournamentPlayerData?.inWaitlist || false,
  };
};
</script>

<template>
  <Card class="glass-panel p-6 space-y-6">
    <template #header>
      <h2 class="text-2xl font-semibold text-white flex items-center gap-2">
        <VueIcon name="bs:info-circle" /> Liste des équipes
      </h2>
    </template>

    <ListView :data="teams.map((team, index) => ({ ...team, id: team.id ?? `${team.name}-${index}` }))" empty-title="Aucune équipe créée pour le moment" :max-cols="1">
      <template #item="{ item }">
        <div class="rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-4 space-y-4">
          <h3 class="text-white font-semibold text-xl">{{ item.name }}</h3>
          <ListView :data="item.users.map((user, index) => ({ ...user, id: user.id ?? `${item.name}-${index}` }))" empty-title="Aucun joueur dans cette équipe" :max-cols="maxCols">
            <template #item="{ item: player }">
              <TournamentUserCard 
                :player="mergeUserAndTournamentPlayerData(player, tournament.players.find(p => p.user.id === player.id))" 
                :reminderSent="tournament.reminderSent" 
                :tournament-started="new Date(tournament.date) < new Date()" 
              />
            </template>
          </ListView>
        </div>
      </template>
    </ListView>
  </Card>
</template>