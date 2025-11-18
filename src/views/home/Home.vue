<script setup lang="ts">
import Hero from './Hero.vue';
import NextTournaments from './NextTournaments.vue';
import useTournamentStore from "@/stores/tournamentStore.ts";
import useStatsStore from "@/stores/statsStore.ts";

// Fetch tournaments
useTournamentStore().fetchTournaments();

useStatsStore().fetchHomeStats();
</script>

<template>
  <div class="2k:h-full flex flex-col justify-center gap-8 py-5">
    <Hero />
    <NextTournaments />
  </div>
</template>