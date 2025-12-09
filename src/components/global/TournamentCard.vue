<script setup lang="ts">
import type { Tournament } from '@/types/models';
import { formatDate, useTimeAgoIntl } from '@vueuse/core';
import { defineProps } from 'vue';
import { Card, Button, Badge } from '../ui';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';

interface Props {
  tournament: Tournament;
}
defineProps<Props>();

// Fonction pour calculer le pourcentage de joueurs
const getPlayerPercentage = (current: number, cap: number) => {
  return cap > 0 ? Math.round((current / cap) * 100) : 0;
};
</script>

<template>
  <Card class="group overflow-hidden border-white/10 transition hover:-translate-y-1 hover:shadow-[0_35px_80px_rgba(0,0,0,0.45)]">
    <div class="flex h-full flex-col">
      <div class="relative h-48 overflow-hidden">
        <img :src="tournament.game.imageUrl" :alt="tournament.game.name" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
        <div class="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />
        <div class="absolute top-4 right-4 flex flex-col items-end gap-3">
          <Badge tone="neutral" size="md">{{ formatDate(new Date(tournament.date), "dddd", { locales: "fr" }) }}</Badge>
          <Badge v-if="!tournament.finished" :tone="tournament.playerCap > 0 && tournament.players.length >= tournament.playerCap ? 'blush' : 'emerald'" size="md">
            {{ tournament.playerCap > 0 && tournament.players.length >= tournament.playerCap ? 'Complet' : 'Ouvert' }}
          </Badge>
        </div>
      </div>

      <div class="flex flex-1 flex-col justify-between gap-5 bg-gradient-to-b from-surface-700/50 to-surface-800/40 p-6">
        <div class="space-y-4">
          <div class="flex items-start justify-between gap-3">
            <h2 class="text-xl font-semibold text-white line-clamp-2 font-display flex-1" :title="tournament.name">{{ tournament.name }}</h2>
          </div>

          <div class="space-y-3 text-sm text-foam-200/80">
            <div class="flex items-center gap-2">
              <VueIcon name="ak:calendar" class="text-accent-300" />
              <span>{{ formatDate(new Date(tournament.date), "DD/MM/YYYY HH:mm") }} · {{ useTimeAgoIntl(new Date(tournament.date), { locale: "fr" }) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <VueIcon name="bx:game" class="text-amber-400" />
                <span>Jeu</span>
              </div>
              <Badge tone="neutral" size="sm">{{ tournament.game.name }}</Badge>
            </div>
            <div class="flex items-center gap-2">
              <VueIcon name="cl:users" class="text-emerald-400" />
              <span>
                {{ tournament.players.length }}
                <template v-if="tournament.playerCap > 0">/ {{ tournament.playerCap }}</template>
                joueur{{ tournament.players.length > 1 ? 's' : '' }}
              </span>
            </div>
            <div v-if="tournament.playerCap > 0" class="rounded-full border border-white/10 bg-white/5 p-1">
              <div class="h-2 rounded-full bg-gradient-to-r from-accent-500 via-blush-500 to-emerald-500" :style="{ width: `${getPlayerPercentage(tournament.players.length, tournament.playerCap)}%` }" />
            </div>
          </div>
        </div>

        <Button v-if="!tournament.finished" class="w-full justify-between" icon-position="lr" :variant="tournament.playerCap > 0 && tournament.players.length >= tournament.playerCap ? 'outline' : 'primary'">
          <template #icon>
            <VueIcon :name="tournament.playerCap > 0 && tournament.players.length >= tournament.playerCap ? 'bs:clock' : 'bs:controller'" />
          </template>
          <span class="text-left">
            {{ tournament.playerCap > 0 && tournament.players.length >= tournament.playerCap ? 'Rejoindre la liste d\'attente' : 'Je veux m\'inscrire !' }}
          </span>
        </Button>
        <div v-else class="rounded-lg border-2 border-amber-400 bg-gradient-to-r from-amber-500/10 to-amber-400/10 p-4">
          <div class="text-center">
            <p class="text-xs uppercase tracking-[0.3em] text-amber-300/70 mb-2">Vainqueur</p>
            <p class="text-lg font-semibold text-amber-300">{{ tournament.teams.find(team => team.ranking === 1)?.name ?? 'NC' }}</p>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>