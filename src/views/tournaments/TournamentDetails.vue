<script lang="ts">
export default {
  beforeRouteEnter: (to: RouteLocationNormalizedGeneric, _: RouteLocationNormalizedLoadedGeneric, next: NavigationGuardNext) => {
    const tournamentStore = useTournamentStore();
    const tournamentId = to.params.tournamentId as string;
    if (tournamentStore.getById(tournamentId)) {
      next();
    } else {
      next({ path: '/not-found', query: { message: 'Tournoi non trouvé' } });
    }
  }
};
</script>

<script setup lang="ts">
import ListView from '@/components/global/ListView.vue';
import TournamentCard from '@/components/global/TournamentCard.vue';
import useTournamentStore from '@/stores/tournamentStore';
import type { Tournament, User } from '@/types/models';
import { getTournamentLink } from '@/utils';
import { whenever } from '@vueuse/core';
import { computed, onMounted, onUnmounted } from 'vue';
import { useRoute, type NavigationGuardNext, type RouteLocationNormalizedGeneric, type RouteLocationNormalizedLoadedGeneric } from 'vue-router';
import TournamentActionsCard from './components/TournamentActionsCard.vue';
import TournamentCastersList from './components/TournamentCastersList.vue';
import TournamentClips from './components/TournamentClips.vue';
import TournamentDetailsHeader from './components/TournamentDetailsHeader.vue';
import TournamentLeaderboard from './components/TournamentLeaderboard.vue';
import TournamentMvp from './components/TournamentMvp.vue';
import TournamentPlayersList from './components/TournamentPlayersList.vue';
import TournamentTeamsList from './components/TournamentTeamsList.vue';
import { useUserStore } from '@/stores/userStore';
import TournamentPlayerGameLevel from './components/TournamentPlayerGameLevel.vue';
import { useToastStore } from '@/stores/toastStore';

const route = useRoute();
const tournamentStore = useTournamentStore();
const userStore = useUserStore();
const tournament = computed(() => tournamentStore.getById(route.params.tournamentId as string));
const oldTournaments = computed(() => tournamentStore.tournaments.filter(t => t.finished && t.gameId === tournament.value?.gameId && t.id !== tournament.value.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
const currentUserId = computed(() => userStore.user?.id);

const casters = computed(() =>
  tournament.value?.players.filter(p => p.isCaster) || []
);

const players = computed(() =>
  tournament.value?.players.filter(p => !p.isCaster && !p.inWaitlist).map(p =>
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
    div.scrollTo(0, 0);
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
  try {
    if (!tournament.value?.game.currentPlayerLevel) {
      throw new Error('Vous devez définir votre niveau de jeu avant de pouvoir vous inscrire à ce tournoi.');
    }

    tournamentStore.registerToTournament(tournament.value!.id);
    useToastStore().success('Vous être inscrit au tournoi avec succès ! Pensez à mettre à jour votre niveau de jeu !');
  } catch (error: any) {
    useToastStore().error('Erreur lors de l\'inscription au tournoi :', error.message || error);
  }
};

const handleRegisterAsCaster = () => {
  try {
    tournamentStore.registerToTournament(tournament.value!.id, "caster");
  } catch (error: any) {
    useToastStore().error('Erreur lors de l\'inscription en tant que caster au tournoi :', error.message || error);
  }
};

const handleUnregister = () => {
  try {
    tournamentStore.unregisterFromTournament(tournament.value!.id);
  } catch (error: any) {
    useToastStore().error('Erreur lors de la désinscription du tournoi :', error.message || error);
  }
};

const handleAddClip = (clipUrl: string) => {
  try {
    tournamentStore.addClipToTournament(tournament.value!.id, clipUrl);
  } catch (error: any) {
    useToastStore().error('Erreur lors de l\'ajout du clip :', error.message || error);
  }
};

const handleVoteMvp = (playerId: string) => {
  try {
    tournamentStore.voteMvpInTournament(tournament.value!.id, playerId);
  } catch (error: any) {
    useToastStore().error('Erreur lors du vote MVP :', error.message || error);
  }
};

onMounted(() => {
  const view = document.getElementsByClassName('view')[0] as HTMLDivElement;
  if (view && tournament.value?.game.imageUrl) {
    view.style.setProperty('background', `linear-gradient(135deg, rgba(10, 27, 61, 0.85), rgba(26, 41, 66, 0.85)), url(${tournament.value.game.imageUrl}) no-repeat center/cover`);
  }
});

onUnmounted(() => {
  const view = document.getElementsByClassName('view')[0] as HTMLDivElement;
  if (view) {
    view.style.removeProperty('background');
  }
});
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
          :tournament="tournament"
          :current-player-count="playerCount"
          :is-registered="!!tournament.players.find(p => p.user.id === currentUserId)"
          class="lg:hidden"
          @register="handleRegister"
          @register-as-caster="handleRegisterAsCaster"
          @unregister="handleUnregister"
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
        <TournamentMvp v-if="tournament.finished" :tournament="tournament" @vote="handleVoteMvp" />

        <!-- Clips -->
        <TournamentClips v-if="tournament.finished" :tournament="tournament" @add-clip="handleAddClip" />
      </div>

      <!-- Colonne latérale -->
      <div class="space-y-6">
        <!-- Actions -->
        <TournamentActionsCard 
          v-if="!tournament.finished"
          :current-player-count="playerCount"
          :tournament="tournament"
          :is-registered="!!tournament.players.find(p => p.user.id === currentUserId)"
          class="hidden lg:block"
          @register="handleRegister"
          @register-as-caster="handleRegisterAsCaster"
          @unregister="handleUnregister"
        />
        
        <TournamentPlayerGameLevel :tournament="tournament" />

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
          :max-cols="1"
        />
      </div>
    </div>
    <ListView
      :data="oldTournaments"
      title="Anciens tournois"
      :to="getTournamentLink"
      v-if="oldTournaments.length > 0"
    >>
      <template #item="{ item }">
        <TournamentCard 
          class="h-full transition-all duration-300 group-hover:-translate-y-2" 
          :tournament="item" 
        />
      </template>
    </ListView>
  </div>
</template>