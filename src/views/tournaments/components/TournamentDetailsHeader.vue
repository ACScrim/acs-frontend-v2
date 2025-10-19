<script setup lang="ts">
import { Card, ProgressBar } from '@/components/ui';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { generateCalendarLink } from '@/utils/calendar';
import type { Tournament } from '@/types/models';

interface Props {
  tournament: Tournament;
  playerCount: number;
  waitlistCount: number;
  casterCount: number;
}

defineProps<Props>();
</script>

<template>
  <Card class="p-8 bg-christmas-navy/50" style="border: 2px solid #D4AF37;">
    <template #header>
      <div class="space-y-4">
        <h1 class="uppercase text-5xl font-bold bg-gradient-to-r from-christmas-gold via-christmas-gold-light to-christmas-gold bg-clip-text text-transparent">
          {{ tournament.name }}
        </h1>
        <p class="text-christmas-gold-light text-lg">{{ tournament.game.name }}</p>
        <div v-if="tournament.description" class="flex items-start gap-4 p-4 bg-christmas-navy/30 rounded-lg border border-christmas-gold/20">
          <VueIcon name="bs:file-text" class="text-christmas-gold text-2xl mt-1 flex-shrink-0" />
          <div>
            <p class="text-christmas-gold-light font-semibold mb-1">Description</p>
            <p class="text-christmas-snow">{{ tournament.description }}</p>
          </div>
        </div>
      </div>
    </template>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Date -->
      <div class="bg-gradient-to-br from-christmas-gold/20 to-christmas-gold-light/10 border-2 border-christmas-gold/30 rounded-lg p-4 flex justify-between">
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-christmas-gold font-semibold">
            <VueIcon name="bs:calendar-event" class="text-2xl" />
            Date
          </div>
          <p class="text-christmas-snow font-bold">
            {{ new Date(tournament.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) }}
          </p>
          <p class="text-christmas-gold-light text-sm">
            {{ new Date(tournament.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }}
          </p>
        </div>
        <div class="flex flex-col gap-3 text-xl">
          <a :href="generateCalendarLink(tournament, 'google')" target="_blank" rel="noopener noreferrer" title="Ajouter au calendrier Google">
            <VueIcon name="si:googlecalendar" class="text-2xl text-christmas-gold-light" />
          </a>
          <a :href="generateCalendarLink(tournament, 'outlook')" target="_blank" rel="noopener noreferrer" title="Ajouter au calendrier Outlook">
            <VueIcon name="ph:fill-microsoft-outlook-logo" class="text-2xl text-christmas-gold-light" />
          </a>
        </div>
      </div>

      <!-- Participants -->
      <div class="bg-gradient-to-br from-christmas-red/20 to-christmas-crimson/10 border-2 border-christmas-red/30 rounded-lg p-4 space-y-2">
        <div class="flex items-center gap-2 text-christmas-red font-semibold">
          <VueIcon name="cl:users" class="text-2xl" />
          Participants
        </div>
        <p class="text-christmas-snow font-bold text-2xl">
          {{ playerCount }}<span class="text-christmas-gold-light text-lg">/{{ tournament.playerCap }}</span>
        </p>
        <p class="text-christmas-gold-light text-sm">inscrit{{ playerCount > 1 ? 's' : '' }}</p>
      </div>

      <!-- Liste d'attente -->
      <div class="bg-gradient-to-br from-christmas-pine/20 to-christmas-forest/10 border-2 border-christmas-pine/30 rounded-lg p-4 space-y-2">
        <div class="flex items-center gap-2 text-christmas-pine font-semibold">
          <VueIcon name="bs:hourglass-split" class="text-2xl" />
          Attente
        </div>
        <p class="text-christmas-snow font-bold text-2xl">{{ waitlistCount }}</p>
        <p class="text-christmas-gold-light text-sm">en attente</p>
      </div>

      <!-- Casters -->
      <div class="bg-gradient-to-br from-christmas-ice/20 to-christmas-gold/10 border-2 border-christmas-ice/30 rounded-lg p-4 space-y-2">
        <div class="flex items-center gap-2 text-christmas-ice font-semibold">
          <VueIcon name="bs:camera-video" class="text-2xl" />
          Casters
        </div>
        <p class="text-christmas-snow font-bold text-2xl">{{ casterCount }}</p>
        <p class="text-christmas-gold-light text-sm">en direct</p>
      </div>
    </div>

    <!-- Barre de progression -->
    <template #footer>
      <ProgressBar v-if="tournament.playerCap > 0" :current="playerCount" :max="tournament.playerCap" label="Taux de remplissage" :show-percentage="true" />
    </template>
  </Card>
</template>