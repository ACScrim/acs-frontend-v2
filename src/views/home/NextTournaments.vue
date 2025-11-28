<script setup lang="ts">
import ListView from "@/components/global/ListView.vue";
import TournamentCard from "@/components/global/TournamentCard.vue";
import TextSvg from "@/components/ui/TextSvg.vue";
import useTournamentStore from "@/stores/tournamentStore";
import { getTournamentLink } from "@/utils";
import VueIcon from "@kalimahapps/vue-icons/VueIcon";
import { computed } from "vue";

const tournamentStore = useTournamentStore();
const tournaments = computed(() => tournamentStore.nextTournaments);

</script>

<template>
  <div class="space-y-8">
    <div>
      <p class="text-xs uppercase tracking-[0.4em] text-foam-300/60">Planning</p>
      <h2 class="hero-title">Les prochains tournois ?</h2>
    </div>

    <ListView 
      v-if="!tournamentStore.isLoading" 
      :data="tournaments.slice(0,3)" 
      empty-title="Aucun tournoi à venir" 
      empty-message="Il n'y a actuellement aucun tournoi prévu. Revenez plus tard pour découvrir les prochains événements !"
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
  </div>
</template>