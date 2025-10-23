<script setup lang="ts">
import ListView from '@/components/global/ListView.vue';
import LoaderACS from '@/components/global/LoaderACS.vue';
import PageHeader from '@/components/global/PageHeader.vue';
import TournamentCard from '@/components/global/TournamentCard.vue';
import { Button, Select } from '@/components/ui';
import useTournamentStore from '@/stores/tournamentStore';
import { getTournamentLink } from '@/utils';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { computed, onMounted, ref } from 'vue';

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
  <PageHeader title="Liste des tournois">
    <template #icon>
      <VueIcon name="bs:trophy" class="text-christmas-gold text-4xl" />
    </template>
    
    <form class="flex flex-col md:flex-row gap-4 items-center">
      <label for="gameFilter" class="text-christmas-gold-light font-semibold flex items-center gap-2">
        <VueIcon name="bs:funnel" class="text-christmas-gold" />
        Filtrer par jeu :
      </label>
      <Select 
        id="gameFilter"
        v-model="gameFilter"
        :options="games.map(game => ({ label: game.name, value: game.name })).concat([{ label: 'Tous les jeux', value: '' }])"
        default-option-label="Tous les jeux"
      />
    </form>
  </PageHeader>

  <!-- Tournois à venir -->
  <ListView 
    v-if="!tournamentStore.isLoading" 
    :title="'Tournois à venir'" 
    :data="upcomingTournaments" 
    empty-title="Aucun tournoi à venir" 
    empty-message="Il n'y a actuellement aucun tournoi prévu. Revenez plus tard pour découvrir les prochains événements !"
    :to="getTournamentLink"
  >
    <template #emptyIcon>
      <VueIcon name="bs:calendar-x" class="text-6xl text-christmas-gold/50 mx-auto mb-4" />
    </template>
    <template #item="{ item }">
      <TournamentCard 
        class="h-full transition-all duration-300 group-hover:-translate-y-2" 
        :tournament="item" 
      />
    </template>
  </ListView>

  <!-- Loader -->
  <LoaderACS v-else class="place-self-center" />

  <!-- Tournois terminés -->
  <ListView 
    v-if="showFinishedTournaments"
    :title="'Tournois terminés'"
    :data="finishedTournaments"
    empty-title="Aucun tournoi terminé"
    empty-message="Il n'y a actuellement aucun tournoi terminé. Revenez plus tard pour découvrir les résultats des événements en cours !"
    :to="getTournamentLink"
    :paginate="true"
    :items-per-page="6"
  >
    <template #emptyIcon>
      <VueIcon name="bs:calendar-x" class="text-6xl text-christmas-gold/50 mx-auto mb-4" />
    </template>
    <template #item="{ item }">
      <TournamentCard 
        class="h-full transition-all duration-300 group-hover:-translate-y-2" 
        :tournament="item" 
      />
    </template>
  </ListView>

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