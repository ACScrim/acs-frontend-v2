<script setup lang="ts">
import TournamentCard from '@/components/global/TournamentCard.vue';
import { Button, Card } from '@/components/ui';
import useTournamentStore from '@/stores/tournamentStore';
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

const showFinishedTournaments = ref(false);

const tournamentStore = useTournamentStore();

const finishedTournaments = computed(() => {
  return tournamentStore.finishedTournaments;
});

const upcomingTournaments = computed(() => {
  return tournamentStore.upcomingTournaments;
});

onMounted(() => {
  tournamentStore.fetchTournaments();
})
</script>

<template>
  <Card color="acs-orange-light" shadow-color="acs-orange-dark" class="p-4">
    <template #header>
      <div class="flex flex-row items-center justify-between text-acs-purple font-bold">
        <h2 class="uppercase">Liste des tournois</h2>
        <div class="space-x-3">
          <span>{{ upcomingTournaments.length }} à venir</span>
          <span>|</span>
          <span>{{ finishedTournaments.length }} terminés</span>
        </div>
      </div>
    </template>
    <select name="game" id="game">
      <option value="">Tous les jeux</option>
      <option v-for="game in tournamentStore.gamesPlayed" :key="game.id" :value="game.name">{{ game.name }}</option>
    </select>
  </Card>


  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
    <h1 class="col-span-1 md:col-span-2 lg:col-span-3 text-acs-purple font-bold text-3xl">Tournois à venir ({{ upcomingTournaments.length }})</h1>
    <RouterLink v-for="tournament in upcomingTournaments" :key="tournament.id" :to="`/tournaments/${tournament.id}`">
      <TournamentCard class="h-full" :tournament="tournament" />
    </RouterLink>
  </div>

  <div v-if="showFinishedTournaments" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    <h1 class="col-span-1 md:col-span-2 lg:col-span-3 text-acs-purple font-bold text-3xl">Tournois terminés ({{ finishedTournaments.length }})</h1>
    <TournamentCard v-for="tournament in finishedTournaments" :key="tournament.id" :tournament="tournament" class="mt-4" />
  </div>
  <Button v-else color="transparent" shadow-color="acs-purple" class="place-self-center" @click="showFinishedTournaments = true">
    Voir les tournois terminés ({{ finishedTournaments.length }})
  </Button>
</template>