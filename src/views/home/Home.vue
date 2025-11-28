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
  <div class="space-y-12 py-8">
    <Hero />
    <NextTournaments />
  </div>
</template>