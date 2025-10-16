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
  <Card
    class="px-0! py-0! overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-2xs hover:shadow-cyan-500/20">
    <div class="flex flex-col h-full">
      <!-- Image avec overlay gradient -->
      <div class="relative overflow-hidden">
        <img :src="tournament.game.imageUrl" :alt="tournament.game.name"
          class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
          fetchpriority="high" loading="lazy"
        />
        <!-- Gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        <!-- Badge jour -->
        <Badge
          class="uppercase ml-auto absolute top-4 right-4 font-bold h-auto text-sm! bg-acs-purple/90 backdrop-blur-sm rounded-lg px-3 py-1">
          {{ formatDate(new Date(tournament.date), "dddd", { locales: "fr" }) }}
        </Badge>

        <!-- Badge statut -->
        <Badge v-if="!tournament.finished" :class="[
          'absolute bottom-4 left-4 font-bold text-xs uppercase tracking-wide rounded-lg px-2 py-1',
          tournament.playerCap > 0 && tournament.players.length >= tournament.playerCap
            ? 'bg-acs-red/90'
            : 'bg-acs-green/90'
        ]">
          {{ tournament.playerCap > 0 && tournament.players.length >= tournament.playerCap ? 'Complet' : 'Ouvert' }}
        </Badge>
      </div>

      <!-- Contenu -->
      <div class="flex-1 flex flex-col justify-between p-6 space-y-4">
        <div class="space-y-4">
          <h2 class="text-xl font-bold text-white group-hover:text-acs-yellow transition-colors line-clamp-1"
            :title="tournament.name">
            {{ tournament.name }}
          </h2>

          <div class="space-y-3">
            <div class="inline-flex gap-3 items-center text-gray-300">
              <VueIcon name="ak:calendar" class="text-acs-orange-light text-xl" />
              <span class="font-medium">
                {{ formatDate(new Date(tournament.date), "DD/MM/YYYY HH:mm") }} ( {{ useTimeAgoIntl(new Date(tournament.date), { locale: "fr" }) }} )
              </span>
            </div>

            <div class="space-y-2">
              <div class="inline-flex gap-3 items-center">
                <VueIcon name="cl:users" class="text-acs-orange-light text-xl" />
                <span class="font-medium text-gray-300">
                  {{ tournament.players.length }}
                  {{ tournament.playerCap > 0 ? `/ ${tournament.playerCap}` : '' }}
                  joueur{{ tournament.players.length > 1 ? 's' : '' }}
                </span>
              </div>

              <!-- Barre de progression si playerCap défini -->
              <div v-if="tournament.playerCap > 0 && !tournament.finished" class="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div class="h-full transition-all duration-500 rounded-full" 
                  :class="[
                    getPlayerPercentage(tournament.players.length, tournament.playerCap) >= 90 ? 'bg-acs-red' : '',
                    getPlayerPercentage(tournament.players.length, tournament.playerCap) >= 70 ? 'bg-acs-orange-dark' : '',
                    'bg-acs-green'
                  ]" 
                  :style="{
                    width: `${getPlayerPercentage(tournament.players.length, tournament.playerCap)}%`
                  }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bouton d'action -->
        <Button v-if="!tournament.finished" color="acs-orange-dark" shadow-color="acs-orange-light" class="w-full font-bold text-white" icon-position="lr">
          <template #icon>
            <VueIcon
              :name="tournament.playerCap > 0 && tournament.players.length >= tournament.playerCap ? 'bs:clock' : 'bs:controller'"
              class="transition-transform group-hover:scale-110 text-xl" />
          </template>
          <span class="line-clamp-1 text-left">
            {{ tournament.playerCap > 0 && tournament.players.length >= tournament.playerCap ? 'Rejoindre la liste d\'attente' : 'Je veux m\'inscrire !' }}
          </span>
        </Button>
        <Card v-else shadow-color="white" class="shadow-acs-button">
          <div class="text-center p-4">
            <span class="text-white font-medium inline-flex gap-1 items-center">Vainqueur <VueIcon name="bs:arrow-right" /> {{ tournament.teams.filter(team => team.ranking === 1)[0]?.name || "Aucun" }}</span>
          </div>
        </Card>
      </div>
    </div>
  </Card>
</template>