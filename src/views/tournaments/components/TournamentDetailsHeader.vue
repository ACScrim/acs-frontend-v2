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
  <Card class="glass-panel space-y-6 p-4 md:p-8">
    <template #header>
      <div class="space-y-2 md:space-y-3">
        <p class="text-xs uppercase tracking-[0.4em] text-foam-300/70">Tournoi hebdo</p>
        <h1 class="text-2xl md:hero-title">{{ tournament.name }}</h1>
        <p class="text-sm md:text-base text-foam-200">{{ tournament.game.name }}</p>
        <div v-if="tournament.description" class="rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-3 md:p-4 text-xs md:text-sm text-foam-200 line-clamp-2 md:line-clamp-none">
          {{ tournament.description }}
        </div>
      </div>
    </template>

    <div class="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-2xl border border-white/10 bg-white/5 p-3 md:p-4 space-y-1 md:space-y-2">
        <p class="text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold flex items-center gap-2" :style="{ color: headerColor }">
          <VueIcon name="bs:calendar-event" class="text-sm md:text-base" /> <span class="hidden md:inline">Date</span>
        </p>
        <p class="text-lg md:text-xl font-semibold text-white">
          {{ new Date(tournament.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }) }}
        </p>
        <p class="muted text-xs">{{ new Date(tournament.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }}</p>
        <div class="flex gap-2 text-lg text-foam-300 pt-1">
          <a :href="generateCalendarLink(tournament, 'google')" target="_blank" rel="noopener noreferrer"><img src="/gcalendar.svg" alt="Logo Google Calendar" width="16" height="16" class="hover:scale-110 md:w-5 md:h-5" title="Ajouter sur Google Calendar" /></a>
          <a :href="generateCalendarLink(tournament, 'outlook')" target="_blank" rel="noopener noreferrer"><img src="/outlook.svg" alt="Logo Google Calendar" width="16" height="16" class="hover:scale-110 md:w-5 md:h-5" title="Ajouter sur Outlook" /></a>
        </div>
      </div>
      <div class="rounded-2xl border border-white/10 bg-white/5 p-3 md:p-4 space-y-1 md:space-y-2">
        <p class="text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold flex items-center gap-2" :style="{ color: headerColor }">
          <VueIcon name="cl:users" class="text-sm md:text-base" /> <span class="hidden md:inline">Participants</span>
        </p>
        <p class="text-lg md:text-xl font-semibold text-white">{{ playerCount }}<span v-if="tournament.playerCap > 0" class="text-foam-200/70 text-base md:text-lg">/{{ tournament.playerCap }}</span></p>
        <p class="muted text-xs">inscrit{{ playerCount > 1 ? 's' : '' }}</p>
      </div>
      <div class="rounded-2xl border border-white/10 bg-white/5 p-3 md:p-4 space-y-1 md:space-y-2">
        <p class="text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold flex items-center gap-2" :style="{ color: headerColor }">
          <VueIcon name="bs:hourglass-split" class="text-sm md:text-base" /> <span class="hidden md:inline">Attente</span>
        </p>
        <p class="text-lg md:text-xl font-semibold text-white">{{ waitlistCount }}</p>
        <p class="muted text-xs">en attente</p>
      </div>
      <div class="rounded-2xl border border-white/10 bg-white/5 p-3 md:p-4 space-y-1 md:space-y-2">
        <p class="text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold flex items-center gap-2" :style="{ color: headerColor }">
          <VueIcon name="bs:camera-video" class="text-sm md:text-base" /> <span class="hidden md:inline">Casters</span>
        </p>
        <p class="text-lg md:text-xl font-semibold text-white">{{ casterCount }}</p>
        <p class="muted text-xs">prévu{{ casterCount > 1 ? 's' : '' }}</p>
      </div>
    </div>

    <template #footer>
      <ProgressBar v-if="tournament.playerCap > 0" :current="playerCount" :max="tournament.playerCap" label="Taux de remplissage" :show-percentage="true" />
    </template>
  </Card>
</template>