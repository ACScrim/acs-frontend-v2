<script setup lang="ts">
import { Button, Card } from '@/components/ui';
import { ProgressBar } from '@/components/ui';
import useTournamentStore from '@/stores/tournamentStore';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { whenever } from '@vueuse/core';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const tournamentStore = useTournamentStore();
const tournament = computed(() => tournamentStore.getById(route.params.tournamentId as string));

const div = document.getElementsByClassName('view')[0] as HTMLDivElement;
if (div && tournament.value) {
  div.style.setProperty('background', `linear-gradient(135deg, rgba(10, 27, 61, 0.85), rgba(26, 41, 66, 0.85)), url(${tournament.value.game.imageUrl}) no-repeat center/cover`);
}

whenever(tournament, () => {
  const div = document.getElementsByClassName('view')[0] as HTMLDivElement;
  if (div && tournament.value) {
    div.style.setProperty('background', `linear-gradient(135deg, rgba(10, 27, 61, 0.85), rgba(26, 41, 66, 0.85)), url(${tournament.value.game.imageUrl}) no-repeat center/cover`);
  }
})

const getPlayerCount = (waitlist: boolean = false) => {
  if (!tournament.value) return 0;
  return tournament.value.players.filter(p => p.inWaitlist === waitlist && !p.isCaster).length;
};

const getCasterCount = () => {
  if (!tournament.value) return 0;
  return tournament.value.players.filter(p => p.isCaster).length;
};
</script>

<template>
  <div v-if="tournament" class="space-y-8">
    <!-- Header -->
    <Card
      class="p-8 bg-christmas-navy/50"
      style="border: 2px solid #D4AF37;"
    >
      <template #header>
        <div class="space-y-4">
          <h1 class="uppercase text-5xl font-bold bg-gradient-to-r from-christmas-gold via-christmas-gold-light to-christmas-gold bg-clip-text text-transparent">
            {{ tournament.name }}
          </h1>
          <p class="text-christmas-gold-light text-lg">{{ tournament.game.name }}</p>
        </div>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Date -->
        <div class="bg-gradient-to-br from-christmas-gold/20 to-christmas-gold-light/10 border-2 border-christmas-gold/30 rounded-lg p-4 space-y-2">
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

        <!-- Participants -->
        <div class="bg-gradient-to-br from-christmas-red/20 to-christmas-crimson/10 border-2 border-christmas-red/30 rounded-lg p-4 space-y-2">
          <div class="flex items-center gap-2 text-christmas-red font-semibold">
            <VueIcon name="cl:users" class="text-2xl" />
            Participants
          </div>
          <p class="text-christmas-snow font-bold text-2xl">
            {{ getPlayerCount() }}<span class="text-christmas-gold-light text-lg">/{{ tournament.playerCap }}</span>
          </p>
          <p class="text-christmas-gold-light text-sm">inscrit{{ getPlayerCount() > 1 ? 's' : '' }}</p>
        </div>

        <!-- Liste d'attente -->
        <div class="bg-gradient-to-br from-christmas-pine/20 to-christmas-forest/10 border-2 border-christmas-pine/30 rounded-lg p-4 space-y-2">
          <div class="flex items-center gap-2 text-christmas-pine font-semibold">
            <VueIcon name="bs:hourglass-split" class="text-2xl" />
            Attente
          </div>
          <p class="text-christmas-snow font-bold text-2xl">
            {{ getPlayerCount(true) }}
          </p>
          <p class="text-christmas-gold-light text-sm">en attente</p>
        </div>

        <!-- Casters -->
        <div class="bg-gradient-to-br from-christmas-ice/20 to-christmas-gold/10 border-2 border-christmas-ice/30 rounded-lg p-4 space-y-2">
          <div class="flex items-center gap-2 text-christmas-ice font-semibold">
            <VueIcon name="bs:camera-video" class="text-2xl" />
            Casters
          </div>
          <p class="text-christmas-snow font-bold text-2xl">
            {{ getCasterCount() }}
          </p>
          <p class="text-christmas-gold-light text-sm">en direct</p>
        </div>
      </div>

      <!-- Barre de progression -->
      <template #footer>
        <ProgressBar 
          v-if="!tournament.finished && tournament.playerCap > 0"
          :current="getPlayerCount()"
          :max="tournament.playerCap"
          label="Taux de remplissage"
          :show-percentage="true"
        />
      </template>
    </Card>

    <!-- Description et détails -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Colonne principale -->
      <div class="lg:col-span-2 space-y-6">
        <Card
          class="p-6"
          style="background: linear-gradient(135deg, rgba(10, 27, 61, 0.5) 0%, rgba(26, 41, 66, 0.5) 100%); border: 2px solid #D4AF37;"
        >
          <template #header>
            <h2 class="text-2xl font-bold text-christmas-gold flex items-center gap-2">
              <VueIcon name="bs:info-circle" />
              Détails du tournoi
            </h2>
          </template>

          <div class="space-y-4 text-christmas-snow">
            <div class="flex items-start gap-4 p-4 bg-christmas-navy/30 rounded-lg border border-christmas-gold/20">
              <VueIcon name="bs:file-text" class="text-christmas-gold text-2xl mt-1 flex-shrink-0" />
              <div>
                <p class="text-christmas-gold-light font-semibold mb-1">Description</p>
                <p class="text-christmas-snow">
                  {{ tournament.description || 'Aucune description disponible' }}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <!-- Résultat si terminé -->
        <Card 
          v-if="tournament.finished"
          class="p-6 bg-christmas-navy/50"
          style="border: 2px solid #D4AF37;"
        >
          <template #header>
            <h2 class="text-2xl font-bold bg-gradient-to-r from-christmas-gold via-christmas-gold-light to-christmas-gold bg-clip-text text-transparent flex items-center gap-2">
              <VueIcon name="bs:trophy-fill" class="text-christmas-gold" />
              Résultats du tournoi
            </h2>
          </template>

          <div class="space-y-8">
            <!-- Podium -->
            <div class="flex items-end justify-center gap-2 md:gap-4 mb-8 px-4">
              <!-- 2ème place -->
              <div class="flex flex-col items-center flex-1 max-w-xs">
                <div class="bg-gradient-to-b from-christmas-silver/80 to-christmas-silver/40 rounded-t-2xl p-4 md:p-6 w-full text-center border-4 border-christmas-silver shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                  <span class="text-3xl md:text-4xl block mb-2">🥈</span>
                  <p class="font-bold text-christmas-navy truncate text-xs md:text-sm line-clamp-2">
                    {{ tournament.teams.sort((a, b) => (a.ranking || 999) - (b.ranking || 999))[1]?.name || '-' }}
                  </p>
                  <p class="text-xs text-christmas-navy/70 mt-2">2ème place</p>
                </div>
                <div class="bg-gradient-to-b from-christmas-silver to-christmas-silver/60 w-full h-16 md:h-20 flex items-center justify-center border-4 border-t-0 border-christmas-silver shadow-md">
                  <span class="text-4xl md:text-5xl font-black text-christmas-navy">2</span>
                </div>
              </div>

              <!-- 1ère place (plus grande) -->
              <div class="flex flex-col items-center flex-1 max-w-xs -mb-4 md:-mb-6">
                <div class="bg-gradient-to-b from-christmas-gold via-christmas-gold-light to-christmas-gold rounded-t-2xl p-6 md:p-8 w-full text-center border-4 border-christmas-gold shadow-2xl hover:shadow-2xl transition-all transform hover:scale-105">
                  <span class="text-4xl md:text-5xl block mb-3">🥇</span>
                  <p class="font-bold text-christmas-navy truncate text-sm md:text-base line-clamp-2">
                    {{ tournament.teams.sort((a, b) => (a.ranking || 999) - (b.ranking || 999))[0]?.name || '-' }}
                  </p>
                  <p class="text-xs text-christmas-navy/70 mt-2">1ère place</p>
                </div>
                <div class="bg-gradient-to-b from-christmas-gold to-christmas-gold-light w-full h-24 md:h-32 flex items-center justify-center border-4 border-t-0 border-christmas-gold shadow-xl">
                  <span class="text-6xl md:text-7xl font-black text-christmas-navy">1</span>
                </div>
              </div>

              <!-- 3ème place -->
              <div class="flex flex-col items-center flex-1 max-w-xs">
                <div class="bg-gradient-to-b from-christmas-crimson/80 to-christmas-red/40 rounded-t-2xl p-4 md:p-6 w-full text-center border-4 border-christmas-crimson shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                  <span class="text-3xl md:text-4xl block mb-2">🥉</span>
                  <p class="font-bold text-christmas-snow truncate text-xs md:text-sm line-clamp-2">
                    {{ tournament.teams.sort((a, b) => (a.ranking || 999) - (b.ranking || 999))[2]?.name || '-' }}
                  </p>
                  <p class="text-xs text-christmas-snow/70 mt-2">3ème place</p>
                </div>
                <div class="bg-gradient-to-b from-christmas-crimson to-christmas-red/60 w-full h-12 md:h-16 flex items-center justify-center border-4 border-t-0 border-christmas-crimson shadow-md">
                  <span class="text-4xl md:text-5xl font-black text-christmas-snow">3</span>
                </div>
              </div>
            </div>

            <!-- Décoration entre podium et classement -->
            <div class="flex items-center gap-4 px-4">
              <div class="flex-1 h-1 bg-gradient-to-r from-christmas-gold/0 via-christmas-gold to-christmas-gold/0 rounded-full"></div>
              <VueIcon name="bs:stars" class="text-christmas-gold text-2xl" />
              <div class="flex-1 h-1 bg-gradient-to-r from-christmas-gold/0 via-christmas-gold to-christmas-gold/0 rounded-full"></div>
            </div>

            <!-- Autres équipes (4+) -->
            <div v-if="tournament.teams.length > 3" class="space-y-4">
              <h3 class="text-lg font-bold bg-gradient-to-r from-christmas-gold to-christmas-gold-light bg-clip-text text-transparent flex items-center gap-2 px-4">
                <VueIcon name="bs:list-ul" class="text-christmas-gold" />
                Classement complet
              </h3>
              <div class="space-y-2 px-4">
                <div 
                  v-for="(team, index) in tournament.teams.sort((a, b) => (a.ranking || 999) - (b.ranking || 999)).slice(3)"
                  :key="team.id"
                  class="flex items-center justify-between p-4 bg-gradient-to-r from-christmas-navy/40 to-christmas-midnight/40 rounded-lg border-l-4 border-christmas-gold/60 hover:border-christmas-gold hover:bg-gradient-to-r hover:from-christmas-gold/20 hover:to-christmas-red/20 transition-all shadow-md hover:shadow-lg"
                >
                  <div class="flex items-center gap-4 flex-1">
                    <div class="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-christmas-gold to-christmas-gold-light text-christmas-navy font-bold text-lg shadow-md">
                      #{{ index + 4 }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-christmas-snow truncate">{{ team.name }}</p>
                      <p class="text-xs text-christmas-gold-light">Classement : {{ team.ranking || '-' }}</p>
                    </div>
                  </div>
                  <div class="ml-4 text-right">
                    <span class="text-sm font-bold text-christmas-gold">Rang {{ team.ranking }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Message si peu de teams -->
            <div v-else class="text-center py-4 px-4">
              <p class="text-christmas-gold-light">Podium complet avec {{ tournament.teams.length }} équipe{{ tournament.teams.length > 1 ? 's' : '' }}</p>
            </div>
          </div>
        </Card>
      </div>

      <!-- Colonne latérale -->
      <div class="space-y-6">
        <!-- Actions -->
        <Card
          class="p-6 bg-christmas-navy/50"
          style="border: 2px solid #D4AF37;"
        >
          <template #header>
            <h2 class="text-xl font-bold text-christmas-gold">Actions</h2>
          </template>

          <Button 
            v-if="!tournament.finished"
            class="w-full mb-3"
            :color="tournament.playerCap > 0 && getPlayerCount() >= tournament.playerCap ? 'christmas-red' : 'christmas-gold'"
          >
            <template #icon>
              <VueIcon 
                :name="tournament.playerCap > 0 && getPlayerCount() >= tournament.playerCap ? 'bs:clock' : 'bs:controller'"
                class="text-xl"
              />
            </template>
            {{ tournament.playerCap > 0 && getPlayerCount() >= tournament.playerCap ? "Rejoindre l'attente" : "M'inscrire" }}
          </Button>

          <Button 
            v-else
            class="w-full"
            color="christmas-green"
          >
            <template #icon>
              <VueIcon name="bs:check2-circle" class="text-xl" />
            </template>
            Tournoi terminé
          </Button>
        </Card>
      </div>
    </div>
  </div>
</template>