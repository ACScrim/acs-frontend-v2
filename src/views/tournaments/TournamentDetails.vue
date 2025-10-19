<script setup lang="ts">
import { whenever } from '@vueuse/core';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import useTournamentStore from '@/stores/tournamentStore';
import type { Tournament, User } from '@/types/models';
import TournamentDetailsHeader from './components/TournamentDetailsHeader.vue';
import TournamentPlayersList from './components/TournamentPlayersList.vue';
import TournamentTeamsList from './components/TournamentTeamsList.vue';
import TournamentActionsCard from './components/TournamentActionsCard.vue';
import TournamentCastersList from './components/TournamentCastersList.vue';
import TournamentLeaderboard from './components/TournamentLeaderboard.vue';
import TournamentMvp from './components/TournamentMvp.vue';
import TournamentClips from './components/TournamentClips.vue';

const route = useRoute();
const tournamentStore = useTournamentStore();
const tournament = computed(() => tournamentStore.getById(route.params.tournamentId as string));

const casters = computed(() =>
  tournament.value?.players.filter(p => p.isCaster) || []
);

const players = computed(() =>
  tournament.value?.players.filter(p => !p.isCaster).map(p => 
    mergeUserAndTournamentPlayerData(p.user, p)
  ) || []
);

const waitlist = computed(() =>
  tournament.value?.players.filter(p => p.inWaitlist && !p.isCaster).map(p =>
    mergeUserAndTournamentPlayerData(p.user, p)
  ) || []
);

const playerCount = computed(() => 
  tournament.value?.players.filter(p => !p.inWaitlist && !p.isCaster).length || 0
);

const getCasterCount = () => casters.value.length;

// Background
whenever(tournament, () => {
  const div = document.getElementsByClassName('view')[0] as HTMLDivElement;
  if (div && tournament.value) {
    div.style.setProperty('background', `linear-gradient(135deg, rgba(10, 27, 61, 0.85), rgba(26, 41, 66, 0.85)), url(${tournament.value.game.imageUrl}) no-repeat center/cover`);
  }
});

const mergeUserAndTournamentPlayerData = (user: User, tournamentPlayerData?: Tournament['players'][number]) => ({
  ...user,
  hasCheckin: tournamentPlayerData?.hasCheckin || false,
  isCaster: tournamentPlayerData?.isCaster || false,
  inWaitlist: tournamentPlayerData?.inWaitlist || false,
});

const handleRegister = () => {
  console.log('Register clicked');
  // TODO: Implémenter l'inscription
};
</script>

<template>
  <div v-if="tournament" class="space-y-8">
    <!-- Header -->
    <TournamentDetailsHeader 
      :tournament="tournament"
      :player-count="playerCount"
      :waitlist-count="waitlist.length"
      :caster-count="getCasterCount()"
    />

    <!-- Contenu principal -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Colonne principale -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Actions -->
        <TournamentActionsCard 
          v-if="!tournament.finished"
          :player-cap="tournament.playerCap"
          :current-player-count="playerCount"
          :is-finished="tournament.finished"
          class="lg:hidden"
          @register="handleRegister"
        />

        <!-- Leaderboard -->
        <TournamentLeaderboard v-if="tournament.finished" :tournament="tournament" />

        <!-- Liste des joueurs -->
        <TournamentPlayersList 
          v-if="!tournament.teamsPublished"
          :players="players"
          :waitlist="waitlist"
          :tournament="tournament"
        />

        <!-- Liste des équipes -->
        <TournamentTeamsList 
          v-else-if="!tournament.finished"
          :teams="tournament.teams"
          :tournament="tournament"
        />

        <!-- MVP -->
        <TournamentMvp v-if="tournament.finished" :tournament="tournament" />

        <!-- Clips -->
        <TournamentClips v-if="tournament.finished" :tournament="tournament" />
      </div>

      <!-- Colonne latérale -->
      <div class="space-y-6">
        <!-- Actions -->
        <TournamentActionsCard 
          v-if="!tournament.finished"
          :player-cap="tournament.playerCap"
          :current-player-count="playerCount"
          :is-finished="tournament.finished"
          class="hidden lg:block"
          @register="handleRegister"
        />

        <!-- Casters -->
        <TournamentCastersList 
          v-if="casters.length > 0"
          :casters="casters.map(c => mergeUserAndTournamentPlayerData(c.user, c))"
          :tournament="tournament"
        />

        <!-- Équipes (si terminé) -->
        <TournamentTeamsList 
          v-if="tournament.finished"
          :teams="tournament.teams"
          :tournament="tournament"
        />
      </div>
    </div>
  </div>
</template>