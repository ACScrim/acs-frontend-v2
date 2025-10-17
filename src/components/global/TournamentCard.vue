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
    class="px-0! py-0! overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-christmas-gold/30 border border-christmas-gold/30"
    color="navy"
  >
    <div class="flex flex-col h-full">
      <!-- Image avec overlay gradient -->
      <div class="relative overflow-hidden">
        <img :src="tournament.game.imageUrl" :alt="tournament.game.name"
          class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
          fetchpriority="high" loading="lazy"
        />
        <!-- Gradient overlay Noël -->
        <div class="absolute inset-0 bg-gradient-to-t from-christmas-navy/40 via-christmas-navy/20 to-transparent"></div>

        <!-- Badge jour -->
        <Badge
          class="uppercase ml-auto absolute top-4 right-4 font-bold h-auto text-sm! bg-gradient-to-r from-christmas-gold to-christmas-gold-light text-christmas-navy backdrop-blur-sm rounded-lg px-3 py-1 shadow-lg shadow-christmas-gold/40">
          {{ formatDate(new Date(tournament.date), "dddd", { locales: "fr" }) }}
        </Badge>

        <!-- Badge statut -->
        <Badge v-if="!tournament.finished" :class="[
          'absolute bottom-4 left-4 font-bold text-xs uppercase tracking-wide rounded-lg px-3 py-1 shadow-lg backdrop-blur-sm',
          tournament.playerCap > 0 && tournament.players.length >= tournament.playerCap
            ? 'bg-christmas-red/90 text-christmas-snow shadow-christmas-crimson/40'
            : 'bg-christmas-pine/90 text-christmas-snow shadow-christmas-forest/40'
        ]">
          {{ tournament.playerCap > 0 && tournament.players.length >= tournament.playerCap ? 'Complet' : 'Ouvert' }}
        </Badge>
      </div>

      <!-- Contenu -->
      <div class="flex-1 flex flex-col justify-between p-6 space-y-4 bg-gradient-to-br from-christmas-navy/50 to-christmas-midnight/50">
        <div class="space-y-4">
          <h2 class="text-xl font-bold text-christmas-snow group-hover:text-christmas-gold-light transition-colors line-clamp-1"
            :title="tournament.name">
            {{ tournament.name }}
          </h2>

          <div class="space-y-3">
            <div class="inline-flex gap-3 items-center text-christmas-gold-light">
              <VueIcon name="ak:calendar" class="text-christmas-gold text-xl" />
              <span class="font-medium">
                {{ formatDate(new Date(tournament.date), "DD/MM/YYYY HH:mm") }} ( {{ useTimeAgoIntl(new Date(tournament.date), { locale: "fr" }) }} )
              </span>
            </div>

            <div class="space-y-2">
              <div class="inline-flex gap-3 items-center">
                <VueIcon name="cl:users" class="text-christmas-gold text-xl" />
                <span class="font-medium text-christmas-gold-light">
                  {{ tournament.players.length }}
                  {{ tournament.playerCap > 0 ? `/ ${tournament.playerCap}` : '' }}
                  joueur{{ tournament.players.length > 1 ? 's' : '' }}
                </span>
              </div>

              <!-- Barre de progression si playerCap défini -->
              <div v-if="tournament.playerCap > 0 && !tournament.finished" class="w-full bg-christmas-navy/50 rounded-full h-2 overflow-hidden border border-christmas-gold/30">
                <div class="h-full transition-all duration-500 rounded-full shadow-lg" 
                  :class="[
                    getPlayerPercentage(tournament.players.length, tournament.playerCap) >= 90 ? 'bg-gradient-to-r from-christmas-red to-christmas-crimson shadow-christmas-red/50' : '',
                    getPlayerPercentage(tournament.players.length, tournament.playerCap) >= 70 ? 'bg-gradient-to-r from-christmas-gold to-christmas-gold-light shadow-christmas-gold/50' : '',
                    'bg-gradient-to-r from-christmas-pine to-christmas-forest shadow-christmas-pine/50'
                  ]" 
                  :style="{
                    width: `${getPlayerPercentage(tournament.players.length, tournament.playerCap)}%`
                  }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bouton d'action -->
        <Button v-if="!tournament.finished" class="w-full font-bold" icon-position="lr">
          <template #icon>
            <VueIcon
              :name="tournament.playerCap > 0 && tournament.players.length >= tournament.playerCap ? 'bs:clock' : 'bs:controller'"
              class="transition-transform group-hover:scale-110 text-xl" />
          </template>
          <span class="line-clamp-1 text-left">
            {{ tournament.playerCap > 0 && tournament.players.length >= tournament.playerCap ? 'Rejoindre la liste d\'attente' : 'Je veux m\'inscrire !' }}
          </span>
        </Button>
        <Card v-else class="bg-gradient-to-r from-christmas-gold to-christmas-gold-light shadow-lg shadow-christmas-gold/40">
          <div class="text-center p-4">
            <span class="text-christmas-navy font-bold inline-flex gap-1 items-center">Vainqueur <VueIcon name="bs:arrow-right" /> {{ tournament.teams.filter(team => team.ranking === 1)[0]?.name || "Aucun" }}</span>
          </div>
        </Card>
      </div>
    </div>
  </Card>
</template>