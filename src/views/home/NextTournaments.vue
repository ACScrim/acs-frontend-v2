<script setup lang="ts">
import { Badge, Button, Card } from "@/components/ui";
import TextSvg from "@/components/ui/TextSvg.vue";
import useTournamentStore from "@/stores/tournamentStore";
import VueIcon from "@kalimahapps/vue-icons/VueIcon";
import { formatDate } from "@vueuse/core";
import { computed } from "vue";

const tournamentStore = useTournamentStore();
const tournaments = computed(() => tournamentStore.nextTournaments);

// Fonction pour calculer le pourcentage de joueurs
const getPlayerPercentage = (current: number, cap: number) => {
  return cap > 0 ? Math.round((current / cap) * 100) : 0;
};

// Fonction pour déterminer la couleur selon le taux de remplissage
const getPlayerCountColor = (current: number, cap: number) => {
  if (cap === 0) return 'text-vibrant-cyan-500';
  const percentage = getPlayerPercentage(current, cap);
  if (percentage >= 90) return 'text-red-500';
  if (percentage >= 70) return 'text-orange-500';
  return 'text-green-500';
};
</script>

<template>
  <div class="space-y-8">
    <TextSvg
      text="Les prochains tournois ?"
      stroke-color="black"
      :stroke-width="3"
      class="uppercase text-4xl lg:text-6xl"
      fill-color="cyan"
    />
    
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <Card
        variant="gaming"
        hoverable
        v-for="tournament in tournaments"
        :key="tournament.id"
        class="px-0! py-0! overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20"
      >
        <div class="flex flex-col h-full">
          <!-- Image avec overlay gradient -->
          <div class="relative overflow-hidden">
            <img
              :src="tournament.game.imageUrl"
              :alt="tournament.game.name"
              class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <!-- Gradient overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            
            <!-- Badge jour -->
            <Badge
              class="uppercase ml-auto absolute top-4 right-4 font-bold h-auto text-sm! bg-vibrant-purple-500/90 backdrop-blur-sm rounded-lg px-3 py-1 shadow-lg"
            >
              {{ formatDate(new Date(tournament.date), "dddd") }}
            </Badge>

            <!-- Badge statut -->
            <Badge
              :class="[
                'absolute bottom-4 left-4 font-bold text-xs uppercase tracking-wide',
                tournament.playerCap > 0 && tournament.players.length >= tournament.playerCap 
                  ? 'bg-red-500/90' 
                  : 'bg-green-500/90'
              ]"
            >
              {{ tournament.playerCap > 0 && tournament.players.length >= tournament.playerCap ? 'Complet' : 'Ouvert' }}
            </Badge>
          </div>

          <!-- Contenu -->
          <div class="flex-1 flex flex-col justify-between p-6 space-y-4">
            <div class="space-y-4">
              <h2 class="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                {{ tournament.name }}
              </h2>
              
              <div class="space-y-3">
                <div class="inline-flex gap-3 items-center text-gray-300">
                  <VueIcon name="ak:calendar" class="text-cyan-400 text-xl" />
                  <span class="font-medium">
                    {{ formatDate(new Date(tournament.date), "DD/MM/YYYY HH:mm") }}
                  </span>
                </div>
                
                <div class="space-y-2">
                  <div class="inline-flex gap-3 items-center">
                    <VueIcon name="cl:users-group" class="text-cyan-400 text-xl" />
                    <span :class="['font-medium', getPlayerCountColor(tournament.players.length, tournament.playerCap)]">
                      {{ tournament.players.length }}
                      {{ tournament.playerCap > 0 ? `/ ${tournament.playerCap}` : '' }}
                      joueur{{ tournament.players.length > 1 ? 's' : '' }}
                    </span>
                  </div>
                  
                  <!-- Barre de progression si playerCap défini -->
                  <div v-if="tournament.playerCap > 0" class="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      class="h-full transition-all duration-500 rounded-full"
                      :class="[
                        getPlayerPercentage(tournament.players.length, tournament.playerCap) >= 90 ? 'bg-red-500' : '',
                        getPlayerPercentage(tournament.players.length, tournament.playerCap) >= 70 ? 'bg-orange-500' : '',
                        'bg-green-500'
                      ]"
                      :style="{ width: `${getPlayerPercentage(tournament.players.length, tournament.playerCap)}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bouton d'action -->
            <Button
              variant="gaming"
              size="lg"
              color="primary"
              :full-width="true"
              type="button"
              class="font-bold transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="[
                tournament.playerCap > 0 && tournament.players.length >= tournament.playerCap ? 'bg-vibrant-orange-400' : ''
              ]"
            >
              <template #icon>
                <VueIcon 
                  :name="tournament.playerCap > 0 && tournament.players.length >= tournament.playerCap ? 'bs:lock' : 'bs:controller'" 
                  class="transition-transform group-hover:scale-110 text-lg"
                />
              </template>
              {{ tournament.playerCap > 0 && tournament.players.length >= tournament.playerCap ? 'Rejoindre la liste d\'attente' : 'Je veux jouer !' }}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>