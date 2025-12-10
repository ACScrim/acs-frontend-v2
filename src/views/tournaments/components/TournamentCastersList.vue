<script setup lang="ts">
import ListView from '@/components/global/ListView.vue';
import { Card } from '@/components/ui';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import TournamentUserCard from './TournamentUserCard.vue';
import type { User, Tournament } from '@/types/models';
import { computed } from 'vue';
import { getGameColor } from '../composables/useGameColor';

interface Props {
  casters: (User & { hasCheckin: boolean; isCaster: boolean; inWaitlist: boolean })[];
  tournament: Tournament;
}

const props = defineProps<Props>();

const headerColor = computed((): string => {
  const gameId = props.tournament.gameId || 'default';
  return getGameColor(gameId);
});
</script>

<template>
  <Card class="glass-panel p-6">
    <template #header>
      <h2
        class="text-2xl font-semibold text-white flex items-center gap-2 pl-4 -ml-4 py-1 border-l-4"
        :style="{ borderLeftColor: headerColor }"
      >
        <VueIcon name="bs:info-circle" /> Liste des casters
      </h2>
    </template>

    <ListView :data="casters" empty-title="Aucun caster inscrit pour le moment" :max-cols="1">
      <template #item="{ item }">
        <TournamentUserCard :player="item" :reminderSent="tournament.reminderSent" :tournament-started="new Date(tournament.date) < new Date()" />
      </template>
    </ListView>
  </Card>
</template>