<script setup lang="ts">
import ListView from '@/components/global/ListView.vue';
import SectionHeader from '@/components/global/SectionHeader.vue';
import { Card } from '@/components/ui';
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
      <SectionHeader title="Liste des casters" :color="headerColor" icon="bs:info-circle" size-class="text-2xl" />
    </template>

    <ListView :data="casters" empty-title="Aucun caster inscrit pour le moment" :max-cols="1">
      <template #item="{ item }">
        <TournamentUserCard :player="item" :reminderSent="tournament.reminderSent" :tournament-started="new Date(tournament.date) < new Date()" />
      </template>
    </ListView>
  </Card>
</template>
