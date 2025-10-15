<script setup lang="ts">
import LoaderACS from '@/components/global/LoaderACS.vue';
import TournamentCard from '@/components/global/TournamentCard.vue';
import { Button, Card } from '@/components/ui';
import useTournamentStore from '@/stores/tournamentStore';
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

const showFinishedTournaments = ref(false);
const gameFilter = ref('');

const tournamentStore = useTournamentStore();

const finishedTournaments = computed(() => {
  return tournamentStore.finishedTournaments.filter(tournament => {
    return gameFilter.value ? tournament.game.name === gameFilter.value : true;
  });
});

const upcomingTournaments = computed(() => {
  return tournamentStore.upcomingTournaments.filter(tournament => {
    return gameFilter.value ? tournament.game.name === gameFilter.value : true;
  });
});

const games = computed(() => {
  return tournamentStore.gamesPlayed;
});

onMounted(() => {
  tournamentStore.fetchTournaments();
})
</script>

<template>
  <Card color="acs-orange-light" shadow-color="acs-orange-dark" class="p-4">
    <template #header>
      <div class="flex flex-row items-center justify-between text-acs-purple text-3xl font-bold">
        <h2 class="uppercase">Liste des tournois</h2>
        <div class="space-x-3 text-lg">
          <span>{{ upcomingTournaments.length }} à venir</span>
          <span>|</span>
          <span>{{ finishedTournaments.length }} terminés</span>
        </div>
      </div>
    </template>
    <select name="game" id="game" v-model="gameFilter"
      class="shadow-acs-button border-2 border-acs-orange-dark bg-acs-orange-light shadow-acs-orange-dark text-acs-purple px-4 py-2 rounded-lg">
      <option value="">Tous les jeux</option>
      <option v-for="game in games" :key="game.id" :value="game.name">{{ game.name }}</option>
    </select>
  </Card>


  <div v-if="!tournamentStore.isLoading" class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-x-8 gap-y-4">
    <h1 class="col-span-1 md:col-span-2 lg:col-span-3 text-acs-purple font-bold text-3xl">Tournois à venir ({{ upcomingTournaments.length }})</h1>
    <RouterLink v-if="upcomingTournaments.length > 0" v-for="tournament in upcomingTournaments" :key="tournament.id"
      :to="`/tournaments/${tournament.id}`">
      <TournamentCard class="h-full" :tournament="tournament" />
    </RouterLink>
    <div v-else class="col-span-1 md:col-span-2 lg:col-span-3">
      <Card color="acs-purple" shadow-color="acs-purple" class="p-6 text-center">
        <h2 class="text-2xl font-bold text-white mb-4">Aucun tournoi à venir</h2>
        <p class="text-gray-300">Il n'y a actuellement aucun tournoi programmé. Revenez plus tard pour découvrir les
          prochains événements !</p>
      </Card>
    </div>
  </div>

  <LoaderACS v-else class="place-self-center" />

  <div v-if="showFinishedTournaments" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    <h1 class="col-span-1 md:col-span-2 lg:col-span-3 text-acs-purple font-bold text-3xl">Tournois terminés ({{ finishedTournaments.length }})</h1>
    <TournamentCard v-for="tournament in finishedTournaments" :key="tournament.id" :tournament="tournament"
      class="mt-4" />
  </div>
  <Button v-else color="transparent" shadow-color="acs-purple" class="place-self-center"
    @click="showFinishedTournaments = true">
    Voir les tournois terminés ({{ finishedTournaments.length }})
  </Button>
</template>
