<script setup lang="ts">
import ListView from '@/components/global/ListView.vue';
import { Card } from '@/components/ui';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import TournamentUserCard from './TournamentUserCard.vue';
import type { Tournament, User } from '@/types/models';

interface Props {
  teams: Tournament['teams'];
  tournament: Tournament;
}

defineProps<Props>();

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
  <Card class="p-6 space-y-6 bg-christmas-navy/50" style="border: 2px solid #D4AF37;">
    <template #header>
      <h2 class="text-2xl font-bold text-christmas-gold flex items-center gap-2">
        <VueIcon name="bs:info-circle" />
        Liste des équipes
      </h2>
    </template>

    <ListView :data="teams" empty-title="Aucune équipe créée pour le moment" :max-cols="1">
      <template #item="{ item }">
        <div class="p-4 bg-christmas-navy/30 rounded-lg border border-christmas-gold/20">
          <h3 class="text-christmas-gold font-bold text-xl mb-2">{{ item.name }}</h3>
          <ListView :data="item.users" empty-title="Aucun joueur dans cette équipe" :max-cols="2">
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