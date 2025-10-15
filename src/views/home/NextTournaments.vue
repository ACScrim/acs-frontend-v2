<script setup lang="ts">
import TournamentCard from "@/components/global/TournamentCard.vue";
import TextSvg from "@/components/ui/TextSvg.vue";
import useTournamentStore from "@/stores/tournamentStore";
import { computed } from "vue";

const tournamentStore = useTournamentStore();
const tournaments = computed(() => tournamentStore.nextTournaments);
</script>

<template>
  <div class="space-y-8">
    <TextSvg
      text="Les prochains tournois ?"
      stroke-color="black"
      :stroke-width="3"
      class="uppercase text-4xl lg:text-6xl"
      fill-color="cyan"
    />

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
      <TournamentCard 
        v-for="tournament in tournaments" :key="tournament.id" :tournament="tournament"
      />
    </div>
  </div>
</template>