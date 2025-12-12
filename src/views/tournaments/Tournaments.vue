<script setup lang="ts">
import ListView from '@/components/global/ListView.vue';
import LoaderACS from '@/components/global/LoaderACS.vue';
import PageHeader from '@/components/global/PageHeader.vue';
import TournamentCard from '@/components/global/TournamentCard.vue';
import {AcsSelect} from '@/components/ui';
import useTournamentStore from '@/stores/tournamentStore';
import {getTournamentLink} from '@/utils';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import {computed, onMounted, ref} from 'vue';

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
  <div class="space-y-12">
    <PageHeader title="Tournois hebdo" subtitle="Calendrier ACS">
      <template #icon>
        <VueIcon name="bs:trophy" class="text-3xl text-accent-300" />
      </template>

      <form class="mt-6 rounded-[var(--radius-xl)] border border-white/10 bg-white/5 p-3 md:p-4">
        <label for="gameFilter" class="flex flex-wrap items-center gap-2 text-xs md:text-sm uppercase tracking-[0.3em] text-foam-300/70">
          <VueIcon name="bs:funnel" class="text-accent-300" /> Filtrer par jeu
        </label>
        <div class="mt-2 md:mt-3 max-w-sm">
          <AcsSelect
            id="gameFilter"
            v-model="gameFilter"
            :options="games.map(game => ({ label: game.name, value: game.name })).concat([{ label: 'Tous les jeux', value: '' }])"
            default-option-label="Tous les jeux"
          />
        </div>
      </form>
    </PageHeader>

    <section class="space-y-8">
      <ListView
        v-if="!tournamentStore.isLoading"
        title="Tournois à venir"
        :data="upcomingTournaments"
        empty-title="Aucun tournoi à venir"
        empty-message="Revenez bientôt pour découvrir les prochains rendez-vous."
        :to="getTournamentLink"
      >
        <template #emptyIcon>
          <VueIcon name="bs:calendar-x" class="mx-auto mb-4 text-4xl text-foam-300/60" />
        </template>
        <template #item="{ item }">
          <TournamentCard
            class="h-full"
            :tournament="item"
          />
        </template>
      </ListView>
      <LoaderACS v-else class="place-self-center" />
    </section>

    <section class="space-y-8">
      <ListView
        title="Tournois terminés"
        :data="finishedTournaments"
        empty-title="Aucun tournoi terminé"
        empty-message="Encore aucun récap disponible ici."
        :to="getTournamentLink"
        :paginate="true"
        :items-per-page="6"
      >
        <template #emptyIcon>
          <VueIcon name="bs:calendar-x" class="mx-auto mb-4 text-4xl text-foam-300/60" />
        </template>
        <template #item="{ item }">
          <TournamentCard
            class="h-full"
            :tournament="item"
          />
        </template>
      </ListView>
    </section>
  </div>
</template>