<script setup lang="ts">
import { Avatar, Button, Card } from '@/components/ui';
import { ProgressBar } from '@/components/ui';
import useTournamentStore from '@/stores/tournamentStore';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { whenever } from '@vueuse/core';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import TournamentLeaderboard from './components/TournamentLeaderboard.vue';
import ListView from '@/components/global/ListView.vue';

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
          <div v-if="tournament.description" class="flex items-start gap-4 p-4 bg-christmas-navy/30 rounded-lg border border-christmas-gold/20">
            <VueIcon name="bs:file-text" class="text-christmas-gold text-2xl mt-1 flex-shrink-0" />
            <div>
              <p class="text-christmas-gold-light font-semibold mb-1">Description</p>
              <p class="text-christmas-snow">
                {{ tournament.description }}
              </p>
            </div>
          </div>
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
          class="p-6 bg-christmas-navy/50"
          style="border: 2px solid #D4AF37;"
        >
          <template #header>
            <h2 class="text-2xl font-bold text-christmas-gold flex items-center gap-2">
              <VueIcon name="bs:info-circle" />
              Liste des joueurs
            </h2>
          </template>

          <ListView
            :data="tournament.players"
            empty-title="Aucun joueur inscrit pour le moment"
            :max-cols="2"
          >
            <!-- TODO: Faire une UserCard -->
            <template #item="{ item }">
              <div 
                class="p-4 bg-christmas-navy/30 rounded-lg border border-christmas-gold/20 flex items-center justify-between"
              >
                <div class="flex items-center gap-4">
                  <Avatar 
                    :src="item.user.avatarUrl" 
                    alt="Avatar" 
                    :fallback="item.user.username.charAt(0).toUpperCase()"
                    class="size-12 rounded-full border-2 border-christmas-gold/30 overflow-hidden flex items-center justify-center"
                  />
                  <div>
                    <p class="text-christmas-snow font-bold">{{ item.user.username }}</p>
                    <p class="text-christmas-gold-light text-sm">
                      {{ item.inWaitlist ? 'En attente' : 'Joueur' }}
                    </p>
                  </div>
                </div>
              </div>
            </template>
          </ListView>
        </Card>

        <!-- Résultat si terminé -->
        <TournamentLeaderboard v-if="tournament.finished" :tournament="tournament" />
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
        <Card
          class="p-6 bg-christmas-navy/50"
          style="border: 2px solid #D4AF37;"
        >
          <template #header>
            <h2 class="text-2xl font-bold text-christmas-gold flex items-center gap-2">
              <VueIcon name="bs:info-circle" />
              Liste des casters
            </h2>
          </template>

          <ListView
            :data="tournament.players.filter(p => p.isCaster)"
            empty-title="Aucun caster inscrit pour le moment"
            :max-cols="1"
          >
            <!-- TODO: Faire une UserCard -->
            <template #item="{ item }">
              <div 
                class="p-4 bg-christmas-navy/30 rounded-lg border border-christmas-gold/20 flex items-center justify-between"
              >
                <div class="flex items-center gap-4">
                  <Avatar 
                    :src="item.user.avatarUrl" 
                    alt="Avatar" 
                    :fallback="item.user.username.charAt(0).toUpperCase()"
                    class="size-12 rounded-full border-2 border-christmas-gold/30 overflow-hidden flex items-center justify-center"
                  />
                  <div>
                    <p class="text-christmas-snow font-bold">{{ item.user.username }}</p>
                    <p class="text-christmas-gold-light text-sm">Caster</p>
                  </div>
                </div>
              </div>
            </template>
          </ListView>
        </Card>
      </div>
    </div>
  </div>
</template>