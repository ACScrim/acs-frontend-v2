<script setup lang="ts">
import ListView from '@/components/global/ListView.vue';
import { Button, Card, ProgressBar } from '@/components/ui';
import useTournamentStore from '@/stores/tournamentStore';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { whenever } from '@vueuse/core';
import { computed, Fragment } from 'vue';
import { useRoute } from 'vue-router';
import TournamentLeaderboard from './components/TournamentLeaderboard.vue';
import TournamentUserCard from './components/TournamentUserCard.vue';
import type { Tournament, User } from '@/types/models';
import { generateCalendarLink } from '@/utils/calendar';
import TournamentMvp from './components/TournamentMvp.vue';

const route = useRoute();
const tournamentStore = useTournamentStore();
const tournament = computed(() => tournamentStore.getById(route.params.tournamentId as string));
const casters = computed(() => {
  if (!tournament.value) return [];
  return tournament.value.players.filter(p => p.isCaster);
});
const players = computed(() => {
  if (!tournament.value) return [];
  return tournament.value.players.filter(p => !p.isCaster);
});
const waitlist = computed(() => {
  if (!tournament.value) return [];
  return tournament.value.players.filter(p => p.inWaitlist && !p.isCaster);
});

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

const mergeUserAndTournamentPlayerData = (user: User, tournamentPlayerData?: Tournament['players'][number]) => {
  return {
    ...user,
    hasCheckin: tournamentPlayerData?.hasCheckin || false,
    isCaster: tournamentPlayerData?.isCaster || false,
    inWaitlist: tournamentPlayerData?.inWaitlist || false,
  };
};
</script>

<template>
  <div v-if="tournament" class="space-y-8">
    <!-- Header -->
    <Card class="p-8 bg-christmas-navy/50" style="border: 2px solid #D4AF37;">
      <template #header>
        <div class="space-y-4">
          <h1
            class="uppercase text-5xl font-bold bg-gradient-to-r from-christmas-gold via-christmas-gold-light to-christmas-gold bg-clip-text text-transparent">
            {{ tournament.name }}
          </h1>
          <p class="text-christmas-gold-light text-lg">{{ tournament.game.name }}</p>
          <div v-if="tournament.description"
            class="flex items-start gap-4 p-4 bg-christmas-navy/30 rounded-lg border border-christmas-gold/20">
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
        <div
          class="bg-gradient-to-br from-christmas-gold/20 to-christmas-gold-light/10 border-2 border-christmas-gold/30 rounded-lg p-4 flex justify-between">
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
        <div
          class="bg-gradient-to-br from-christmas-red/20 to-christmas-crimson/10 border-2 border-christmas-red/30 rounded-lg p-4 space-y-2">
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
        <div
          class="bg-gradient-to-br from-christmas-pine/20 to-christmas-forest/10 border-2 border-christmas-pine/30 rounded-lg p-4 space-y-2">
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
        <div
          class="bg-gradient-to-br from-christmas-ice/20 to-christmas-gold/10 border-2 border-christmas-ice/30 rounded-lg p-4 space-y-2">
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
        <ProgressBar v-if="!tournament.finished && tournament.playerCap > 0" :current="getPlayerCount()"
          :max="tournament.playerCap" label="Taux de remplissage" :show-percentage="true" />
      </template>
    </Card>
    
    <!-- Description et détails -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Colonne principale -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Résultat si terminé -->
        <TournamentLeaderboard v-if="tournament.finished" :tournament="tournament" />
        <!-- Liste des joueurs -->
        <Card v-if="!tournament.teamsPublished" class="p-6 space-y-6 bg-christmas-navy/50" style="border: 2px solid #D4AF37;">
          <template #header>
            <h2 class="text-2xl font-bold text-christmas-gold flex items-center gap-2">
              <VueIcon name="bs:info-circle" />
              Liste des joueurs
            </h2>
          </template>

          <ListView :data="players"
            empty-title="Aucun joueur inscrit pour le moment" :max-cols="2">
            <template #item="{ item }">
              <TournamentUserCard :player="mergeUserAndTournamentPlayerData(item.user, item)" :reminderSent="tournament.reminderSent" :tournament-started="new Date(tournament.date) < new Date()" />
            </template>
          </ListView>
          <Fragment v-if="waitlist.length > 0">
            <h2 class="text-2xl font-bold text-christmas-gold flex items-center gap-2">
              <VueIcon name="bs:info-circle" />
              Liste d'attente
            </h2>
            <ListView :data="waitlist"
              empty-title="Aucun joueur inscrit pour le moment" :max-cols="2">
              <template #item="{ item }">
                <TournamentUserCard :player="mergeUserAndTournamentPlayerData(item.user, item)" :reminderSent="tournament.reminderSent" :tournament-started="new Date(tournament.date) < new Date()" />
              </template>
            </ListView>
          </Fragment>
        </Card>
        <!-- Liste des équipes -->
        <Card v-else-if="!tournament.finished" class="p-6 space-y-6 bg-christmas-navy/50" style="border: 2px solid #D4AF37;">
          <template #header>
            <h2 class="text-2xl font-bold text-christmas-gold flex items-center gap-2">
              <VueIcon name="bs:info-circle" />
              Liste des équipes
            </h2>
          </template>

          <ListView :data="tournament.teams" empty-title="Aucune équipe créée pour le moment" :max-cols="1">
            <template #item="{ item }">
              <div class="p-4 bg-christmas-navy/30 rounded-lg border border-christmas-gold/20">
                <h3 class="text-christmas-gold font-bold text-xl mb-2">{{ item.name }}</h3>
                <ListView :data="item.users" empty-title="Aucun joueur dans cette équipe" :max-cols="2">
                  <template #item="{ item: player }">
                    <TournamentUserCard :player="mergeUserAndTournamentPlayerData(player, tournament.players.find(p => p.user.id === player.id))" :reminderSent="tournament.reminderSent" :tournament-started="new Date(tournament.date) < new Date()" />
                  </template>
                </ListView>
              </div>
            </template>
          </ListView>
        </Card>

        <!-- MVP -->
        <TournamentMvp v-if="tournament.finished" :tournament="tournament" />

        <!-- CLIPS -->
      </div>

      <!-- Colonne latérale -->
      <div class="space-y-6">
        <!-- Actions -->
        <Card class="p-6 bg-christmas-navy/50" style="border: 2px solid #D4AF37;" v-if="!tournament.finished">
          <template #header>
            <h2 class="text-xl font-bold text-christmas-gold">Actions</h2>
          </template>
  
          <Button v-if="!tournament.finished" class="w-full mb-3"
            :color="tournament.playerCap > 0 && getPlayerCount() >= tournament.playerCap ? 'christmas-red' : 'christmas-gold'">
            <template #icon>
              <VueIcon
                :name="tournament.playerCap > 0 && getPlayerCount() >= tournament.playerCap ? 'bs:clock' : 'bs:controller'"
                class="text-xl" />
            </template>
            {{ tournament.playerCap > 0 && getPlayerCount() >= tournament.playerCap ? "Rejoindre l'attente" : "M'inscrire" }}
          </Button>
  
          <Button v-else class="w-full" color="christmas-green">
            <template #icon>
              <VueIcon name="bs:check2-circle" class="text-xl" />
            </template>
            Tournoi terminé
          </Button>
        </Card>
        <!-- Liste des casters -->
        <Card class="p-6 bg-christmas-navy/50" style="border: 2px solid #D4AF37;" v-if="casters.length > 0">
          <template #header>
            <h2 class="text-2xl font-bold text-christmas-gold flex items-center gap-2">
              <VueIcon name="bs:info-circle" />
              Liste des casters
            </h2>
          </template>

          <ListView :data="casters" empty-title="Aucun caster inscrit pour le moment"
            :max-cols="1">
            <template #item="{ item }">
              <TournamentUserCard :player="mergeUserAndTournamentPlayerData(item.user, item)" :reminderSent="tournament.reminderSent" :tournament-started="new Date(tournament.date) < new Date()" />
            </template>
          </ListView>
        </Card>
        <!-- Liste des équipes si tournoi terminé -->
        <Card v-if="tournament.finished" class="p-6 space-y-6 bg-christmas-navy/50" style="border: 2px solid #D4AF37;">
          <template #header>
            <h2 class="text-2xl font-bold text-christmas-gold flex items-center gap-2">
              <VueIcon name="bs:info-circle" />
              Liste des équipes
            </h2>
          </template>

          <ListView :data="tournament.teams" empty-title="Aucune équipe créée pour le moment" :max-cols="1">
            <template #item="{ item }">
              <div class="p-4 bg-christmas-navy/30 rounded-lg border border-christmas-gold/20">
                <h3 class="text-christmas-gold font-bold text-xl mb-2">{{ item.name }}</h3>
                <ListView :data="item.users" empty-title="Aucun joueur dans cette équipe" :max-cols="1">
                  <template #item="{ item: player }">
                    <TournamentUserCard :player="mergeUserAndTournamentPlayerData(player, tournament.players.find(p => p.user.id === player.id))" :reminderSent="tournament.reminderSent" :tournament-started="new Date(tournament.date) < new Date()" />
                  </template>
                </ListView>
              </div>
            </template>
          </ListView>
        </Card>
      </div>
    </div>
  </div>
</template>