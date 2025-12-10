<script setup lang="ts">
import { Card, ProgressBar } from '@/components/ui';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { generateCalendarLink } from '@/utils';
import type { Tournament } from '@/types/models';
import { computed } from 'vue';
import { getGameColor } from '../composables/useGameColor';

interface Props {
  tournament: Tournament;
  playerCount: number;
  waitlistCount: number;
  casterCount: number;
}

const props = defineProps<Props>();

const headerColor = computed((): string => {
  const gameId = props.tournament.gameId || 'default';
  return getGameColor(gameId);
});
</script>

<template>
  <Card class="glass-panel space-y-6 p-8">
    <template #header>
      <div class="space-y-3">
        <p class="text-xs uppercase tracking-[0.4em] text-foam-300/70">Tournoi hebdo</p>
        <h1 class="hero-title">{{ tournament.name }}</h1>
        <p class="text-foam-200">{{ tournament.game.name }}</p>
        <div v-if="tournament.description" class="rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-4 text-sm text-foam-200">
          {{ tournament.description }}
        </div>
      </div>
    </template>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
        <p class="text-xs uppercase tracking-[0.3em] font-semibold flex items-center gap-2" :style="{ color: headerColor }">
          <VueIcon name="bs:calendar-event" /> Date
        </p>
        <p class="text-xl font-semibold text-white">
          {{ new Date(tournament.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) }}
        </p>
        <p class="muted">{{ new Date(tournament.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }}</p>
        <div class="flex gap-3 text-lg text-foam-300">
          <a :href="generateCalendarLink(tournament, 'google')" target="_blank" rel="noopener noreferrer"><img src="/gcalendar.svg" alt="Logo Google Calendar" width="20" height="20" class="hover:scale-110" title="Ajouter sur Google Calendar" /></a>
          <a :href="generateCalendarLink(tournament, 'outlook')" target="_blank" rel="noopener noreferrer"><img src="/outlook.svg" alt="Logo Google Calendar" width="20" height="20" class="hover:scale-110" title="Ajouter sur Outlook" /></a>
        </div>
      </div>
      <div class="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
        <p class="text-xs uppercase tracking-[0.3em] font-semibold flex items-center gap-2" :style="{ color: headerColor }">
          <VueIcon name="cl:users" /> Participants
        </p>
        <p class="text-xl font-semibold text-white">{{ playerCount }}<span v-if="tournament.playerCap > 0" class="text-foam-200/70 text-base">/{{ tournament.playerCap }}</span></p>
        <p class="muted">inscrit{{ playerCount > 1 ? 's' : '' }}</p>
      </div>
      <div class="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
        <p class="text-xs uppercase tracking-[0.3em] font-semibold flex items-center gap-2" :style="{ color: headerColor }">
          <VueIcon name="bs:hourglass-split" /> Attente
        </p>
        <p class="text-xl font-semibold text-white">{{ waitlistCount }}</p>
        <p class="muted">en attente</p>
      </div>
      <div class="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
        <p class="text-xs uppercase tracking-[0.3em] font-semibold flex items-center gap-2" :style="{ color: headerColor }">
          <VueIcon name="bs:camera-video" /> Casters
        </p>
        <p class="text-xl font-semibold text-white">{{ casterCount }}</p>
        <p class="muted">prévu{{ casterCount > 1 ? 's' : '' }}</p>
      </div>
    </div>

    <template #footer>
      <ProgressBar v-if="tournament.playerCap > 0" :current="playerCount" :max="tournament.playerCap" label="Taux de remplissage" :show-percentage="true" />
    </template>
  </Card>
</template>