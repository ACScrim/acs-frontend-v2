<script setup lang="ts">
import PageHeader from '@/components/global/PageHeader.vue';
import useTournamentStore from '@/stores/tournamentStore';
import { whenever } from '@vueuse/core';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const tournamentStore = useTournamentStore();
const tournament = computed(() => tournamentStore.getById(route.params.tournamentId as string));

const div = document.getElementsByClassName('maincontainer')[0] as HTMLDivElement;
if (div) {
  div.style.setProperty('background', tournament.value ? `url(${tournament.value.game.imageUrl}) no-repeat center/cover` : '');
}

whenever(tournament, () => {
  const div = document.getElementsByClassName('maincontainer')[0] as HTMLDivElement;
  if (div) {
    div.style.setProperty('background', tournament.value ? `url(${tournament.value.game.imageUrl}) no-repeat center/cover` : '');
  }
})

const getPlayerPercentage = (current: number, cap: number) => {
  return cap > 0 ? Math.round((current / cap) * 100) : 0;
};
</script>

<template>
  <PageHeader
    v-if="tournament"
    :title="tournament.name"
    class="bg-opacity-50"
  >
    <ul>
      <li>
        <p class="text-white text-lg mb-2">
          Jeu : <span class="font-semibold">{{ tournament.game.name }}</span>
        </p>
        <p class="text-white text-lg mb-2">
          Date de début : <span class="font-semibold">{{ new Date(tournament.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</span>
        </p>
        <p>
          Participants inscrits : <span class="font-semibold text-white">{{ tournament.players.filter(p => !p.inWaitlist && !p.isCaster).length }} / {{ tournament.playerCap }}</span>
          <div v-if="tournament.playerCap > 0 && !tournament.finished" class="w-full bg-christmas-navy/50 rounded-full h-2 overflow-hidden border border-christmas-gold/30">
            <div class="h-full
             transition-all duration-500 rounded-full shadow-lg" 
            :class="[
              getPlayerPercentage(tournament.players.length, tournament.playerCap) >= 90 ? 'bg-gradient-to-r from-christmas-red to-christmas-crimson shadow-christmas-red/50' : '',
              getPlayerPercentage(tournament.players.length, tournament.playerCap) >= 70 ? 'bg-gradient-to-r from-christmas-gold to-christmas-gold-light shadow-christmas-gold/50' : '',
              'bg-gradient-to-r from-christmas-pine to-christmas-forest shadow-christmas-pine/50'
            ]" 
            :style="{
              width: `${getPlayerPercentage(tournament.players.length, tournament.playerCap)}%`
            }"></div>
          </div>
        </p>
      </li>
    </ul>
  </PageHeader>
</template>