<script setup lang="ts">
import LoaderACS from '@/components/global/LoaderACS.vue';
import TournamentCard from '@/components/global/TournamentCard.vue';
import { Button, Card, Select } from '@/components/ui';
import useTournamentStore from '@/stores/tournamentStore';
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';

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
  <Card 
    card-classes="p-6!"
    style="background: linear-gradient(135deg, #0A1B3D 0%, #1a2942 100%); border: 2px solid #D4AF37;"
  >
    <template #header>
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 class="uppercase text-4xl font-bold bg-gradient-to-r from-christmas-gold via-christmas-gold-light to-christmas-gold bg-clip-text text-transparent">
          <span class="inline-flex gap-2 items-center">
            <VueIcon name="bs:trophy" class="text-christmas-gold text-4xl" />
            Liste des tournois
          </span>
        </h2>
        <div class="space-x-4 text-lg text-christmas-gold-light font-semibold flex flex-wrap justify-center md:justify-end">
          <span class="inline-flex items-center gap-2">
            <VueIcon name="bs:calendar" class="text-christmas-gold" />
            {{ upcomingTournaments.length }} à venir
          </span>
          <span class="text-christmas-gold">|</span>
          <span class="inline-flex items-center gap-2">
            <VueIcon name="bs:check2-circle" class="text-christmas-green" />
            {{ finishedTournaments.length }} terminés
          </span>
        </div>
      </div>
    </template>

    <div class="flex flex-col md:flex-row gap-4 items-center">
      <label class="text-christmas-gold-light font-semibold flex items-center gap-2">
        <VueIcon name="bs:funnel" class="text-christmas-gold" />
        Filtrer par jeu :
      </label>
      <Select 
        v-model="gameFilter"
        :options="games.map(game => ({ label: game.name, value: game.name }))"
      />
    </div>
  </Card>

  <!-- Tournois à venir -->
  <div v-if="!tournamentStore.isLoading" class="space-y-6">
    <div class="flex items-center gap-3">
      <div class="h-1 w-12 bg-gradient-to-r from-christmas-gold to-christmas-gold-light rounded-full"></div>
      <h1 class="text-4xl font-bold bg-gradient-to-r from-christmas-gold via-christmas-gold-light to-christmas-gold bg-clip-text text-transparent uppercase">
        Tournois à venir
      </h1>
      <span class="text-2xl font-bold text-christmas-red ml-auto">{{ upcomingTournaments.length }}</span>
    </div>

    <div v-if="upcomingTournaments.length > 0" class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
      <RouterLink 
        v-for="tournament in upcomingTournaments" 
        :key="tournament.id"
        :to="`/tournaments/${tournament.id}`"
        class="group"
      >
        <TournamentCard class="h-full transition-all duration-300 group-hover:-translate-y-2" :tournament="tournament" />
      </RouterLink>
    </div>

    <div v-else class="col-span-1 md:col-span-2 lg:col-span-3">
      <Card 
        card-classes="p-8! text-center border-dashed border-2"
        style="background: linear-gradient(135deg, rgba(15, 76, 58, 0.1) 0%, rgba(196, 30, 58, 0.1) 100%); border-color: #D4AF37;"
      >
        <VueIcon name="bs:calendar-x" class="text-6xl text-christmas-gold/50 mx-auto mb-4" />
        <h2 class="text-2xl font-bold text-christmas-snow mb-2">Aucun tournoi à venir</h2>
        <p class="text-christmas-gold-light">Il n'y a actuellement aucun tournoi programmé. Revenez plus tard pour découvrir les prochains événements !</p>
      </Card>
    </div>
  </div>

  <!-- Loader -->
  <LoaderACS v-else class="place-self-center" />

  <!-- Tournois terminés -->
  <div v-if="showFinishedTournaments" class="space-y-6">
    <div class="flex items-center gap-3">
      <div class="h-1 w-12 bg-gradient-to-r from-christmas-red to-christmas-crimson rounded-full"></div>
      <h1 class="text-4xl font-bold bg-gradient-to-r from-christmas-red via-christmas-crimson to-christmas-red bg-clip-text text-transparent uppercase">
        Tournois terminés
      </h1>
      <span class="text-2xl font-bold text-christmas-gold ml-auto">{{ finishedTournaments.length }}</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
      <RouterLink 
        v-for="tournament in finishedTournaments" 
        :key="tournament.id"
        :to="`/tournaments/${tournament.id}`"
        class="group"
      >
        <TournamentCard 
          class="h-full transition-all duration-300 group-hover:-translate-y-2" 
          :tournament="tournament" 
        />
      </RouterLink>
    </div>
  </div>

  <!-- Bouton voir tournois terminés -->
  <Button 
    v-else 
    @click="showFinishedTournaments = true"
    class="place-self-center mt-8"
  >
    <VueIcon name="bs:archive" class="text-2xl" />
    Voir les tournois terminés ({{ finishedTournaments.length }})
  </Button>
</template>