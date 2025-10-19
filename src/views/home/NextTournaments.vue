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
    <TextSvg
      text="Les prochains tournois ?"
      class="uppercase text-4xl lg:text-6xl"
      strokeColor="#D4AF37"
      fillColor="url(#christmasGold)"
      :fontSize="100"
    />

    <ListView 
      v-if="!tournamentStore.isLoading" 
      :data="tournaments.slice(0,3)" 
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
  </div>
</template>