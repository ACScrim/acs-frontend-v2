<script setup lang="ts">
import ListView from '@/components/global/ListView.vue';
import SectionHeader from '@/components/global/SectionHeader.vue';
import { Card } from '@/components/ui';
import TournamentUserCard from './TournamentUserCard.vue';
import type { Tournament, User } from '@/types/models';
import { computed } from 'vue';
import { getGameColor } from '../composables/useGameColor';

interface Props {
  teams: Tournament['teams'];
  tournament: Tournament;
  maxCols?: number;
}

const props = withDefaults(defineProps<Props>(), {
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

const headerColor = computed((): string => {
  const gameId = props.tournament.gameId || 'default';
  return getGameColor(gameId);
});
</script>

<template>
  <Card class="glass-panel p-6 space-y-6">
    <template #header>
      <SectionHeader title="Liste des équipes" :color="headerColor" icon="bs:info-circle" size-class="text-2xl" />
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
