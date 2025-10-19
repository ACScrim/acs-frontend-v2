<script setup lang="ts">
import ListView from '@/components/global/ListView.vue';
import { Card } from '@/components/ui';
import type { Tournament, User } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import TournamentUserCard from './TournamentUserCard.vue';

interface Props {
  players: (User & { hasCheckin: boolean; isCaster: boolean; inWaitlist: boolean })[];
  waitlist: (User & { hasCheckin: boolean; isCaster: boolean; inWaitlist: boolean })[];
  tournament: Tournament;
}

defineProps<Props>();
</script>

<template>
  <Card class="p-6 space-y-6 bg-christmas-navy/50" style="border: 2px solid #D4AF37;">
    <template #header>
      <h2 class="text-2xl font-bold text-christmas-gold flex items-center gap-2">
        <VueIcon name="bs:info-circle" />
        Liste des joueurs
      </h2>
    </template>

    <ListView :data="players" empty-title="Aucun joueur inscrit pour le moment" :max-cols="2">
      <template #item="{ item }">
        <TournamentUserCard :player="item" :reminderSent="tournament.reminderSent" :tournament-started="new Date(tournament.date) < new Date()" />
      </template>
    </ListView>

    <template v-if="waitlist.length > 0">
      <h2 class="text-2xl font-bold text-christmas-gold flex items-center gap-2">
        <VueIcon name="bs:info-circle" />
        Liste d'attente
      </h2>
      <ListView :data="waitlist" empty-title="Aucun joueur inscrit pour le moment" :max-cols="2">
        <template #item="{ item }">
          <TournamentUserCard :player="item" :reminderSent="tournament.reminderSent" :tournament-started="new Date(tournament.date) < new Date()" />
        </template>
      </ListView>
    </template>
  </Card>
</template>