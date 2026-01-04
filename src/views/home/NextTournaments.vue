<script setup lang="ts">
import ListView from "@/components/global/ListView.vue";
import TournamentCard from "@/components/global/TournamentCard.vue";
import {getTournamentLink} from "@/utils";
import VueIcon from "@kalimahapps/vue-icons/VueIcon";
import {computed} from "vue";
import useHomeStore from "@/stores/homeStore.ts";

const homeStore = useHomeStore();
const tournaments = computed(() => homeStore.nextTournaments);

</script>

<template>
  <div class="space-y-8">
    <div>
      <p class="text-xs uppercase tracking-[0.4em] text-foam-300/60">Planning</p>
      <h2 class="hero-title font-display">Les prochains tournois ?</h2>
    </div>

    <ListView
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