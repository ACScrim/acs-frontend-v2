<script setup lang="ts">
import { Card } from '@/components/ui';
import useAdminStore from '@/stores/adminStore';
import { useToastStore } from '@/stores/toastStore';
import type { Tournament, TournamentFormData } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { whenever } from '@vueuse/core';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TournamentForm from './components/TournamentForm.vue';
import TournamentPlayers from './components/TournamentPlayers.vue';
import TournamentTeamsCreation from './components/TournamentTeamsCreation.vue';
import TournamentTeamsDisplay from './components/TournamentTeamsDisplay.vue';

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();

const tournament = computed(() => adminStore.getTournamentById(route.params.id as string) as Tournament);
const editingTeams = ref(!tournament.value?.teamsPublished);
const activeTab = ref<'teams' | 'details' | 'players'>('teams');

whenever(tournament, () => {
  editingTeams.value = !tournament.value?.teamsPublished;
});

whenever(activeTab, (tab) => {
  router.push({ query: { tab } });
});

onMounted(() => {
  adminStore.fetchTournamentDetails(route.params.id as string);

  const queryTab = route.query.tab as string;
  if (queryTab === 'teams' || queryTab === 'details' || queryTab === 'players') {
    activeTab.value = queryTab;
  }
});

const handleEditTeams = () => {
  adminStore.publishTournamentTeams(route.params.id as string, false)
    .then(() => {
      editingTeams.value = true;
    });
};

const handleTeamsSaved = () => {
  adminStore.fetchTournamentDetails(route.params.id as string);
};

const handleSubmit = async (formData: TournamentFormData) => {
  try {
    await adminStore.updateTournament(route.params.id as string, formData);
    useToastStore().success('Tournoi mis à jour avec succès.');
  } catch (error) {
    useToastStore().error('Erreur lors de la mise à jour du tournoi.');
  }
};
</script>

<template>
  <div v-if="tournament" class="space-y-6">
    <!-- Header -->
    <div class="space-y-4">
      <div class="flex items-center gap-4">
        <div class="p-3 bg-gradient-to-br from-christmas-gold to-christmas-gold-light rounded-lg">
          <VueIcon name="bs:trophy-fill" class="text-2xl text-christmas-navy" />
        </div>
        <div class="flex-1">
          <h1 class="text-4xl font-bold text-christmas-gold mb-2">{{ tournament.name }}</h1>
          <p class="text-christmas-gold-light text-sm">{{ tournament.game.name }} • {{ new Date(tournament.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card class="p-4 bg-christmas-navy border-2 border-christmas-gold">
          <p class="text-xs text-christmas-gold-light/70 mb-1 flex items-center gap-1">
            <VueIcon name="cl:users" />
            Joueurs
          </p>
          <p class="text-2xl font-bold text-christmas-gold">{{ tournament.players.length }}<span class="text-lg text-christmas-gold-light">/{{ tournament.playerCap === 0 ? '∞' : tournament.playerCap }}</span></p>
        </Card>
        <Card class="p-4 bg-christmas-navy border-2 border-christmas-gold">
          <p class="text-xs text-christmas-gold-light/70 mb-1 flex items-center gap-1">
            <VueIcon name="bs:diagram-3" />
            Équipes
          </p>
          <p class="text-2xl font-bold text-christmas-gold">{{ tournament.teams.length }}</p>
        </Card>
        <Card class="p-4 bg-christmas-navy border-2 border-christmas-gold">
          <p class="text-xs text-christmas-gold-light/70 mb-1 flex items-center gap-1">
            <VueIcon :name="tournament.teamsPublished ? 'bs:check-circle' : 'bs:clock'" />
            État équipes
          </p>
          <p :class="['text-sm font-bold', tournament.teamsPublished ? 'text-christmas-pine' : 'text-christmas-gold']">
            {{ tournament.teamsPublished ? 'Publiées' : 'Brouillon' }}
          </p>
        </Card>
        <Card class="p-4 bg-christmas-navy border-2 border-christmas-gold">
          <p class="text-xs text-christmas-gold-light/70 mb-1 flex items-center gap-1">
            <VueIcon :name="tournament.finished ? 'bs:check-circle' : 'bs:hourglass-split'" />
            Status
          </p>
          <p :class="['text-sm font-bold', tournament.finished ? 'text-christmas-crimson' : 'text-christmas-gold']">
            {{ tournament.finished ? 'Terminé' : 'En cours' }}
          </p>
        </Card>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 border-b border-christmas-gold/20">
      <button
        @click="activeTab = 'teams'"
        :class="[
          'px-4 py-3 font-bold flex items-center gap-2 transition-all',
          activeTab === 'teams'
            ? 'text-christmas-gold border-b-2 border-christmas-gold'
            : 'text-christmas-gold-light/70 hover:text-christmas-gold-light'
        ]"
      >
        <VueIcon name="bs:diagram-3" />
        Équipes
      </button>
      <button
        @click="activeTab = 'players'"
        :class="[
          'px-4 py-3 font-bold flex items-center gap-2 transition-all',
          activeTab === 'players'
            ? 'text-christmas-gold border-b-2 border-christmas-gold'
            : 'text-christmas-gold-light/70 hover:text-christmas-gold-light'
        ]"
      >
        <VueIcon name="cl:users" />
        Joueurs
      </button>
      <button
        @click="activeTab = 'details'"
        :class="[
          'px-4 py-3 font-bold flex items-center gap-2 transition-all',
          activeTab === 'details'
            ? 'text-christmas-gold border-b-2 border-christmas-gold'
            : 'text-christmas-gold-light/70 hover:text-christmas-gold-light'
        ]"
      >
        <VueIcon name="bs:pencil" />
        Détails
      </button>
    </div>

    <!-- Teams Tab -->
    <div v-show="activeTab === 'teams'" class="space-y-6 animate-in fade-in duration-200">
      <TournamentTeamsDisplay 
        v-if="tournament.teamsPublished && !editingTeams"
        :tournament="tournament"
        @edit="handleEditTeams"
      />

      <TournamentTeamsCreation 
        v-if="!tournament.teamsPublished || editingTeams"
        :tournament="tournament"
        @saved="handleTeamsSaved"
      />
    </div>

    <!-- Players Tab -->
    <div v-show="activeTab === 'players'" class="animate-in fade-in duration-200">
      <TournamentPlayers
        :tournament="tournament"
      />
    </div>

    <!-- Details Tab -->
    <div v-show="activeTab === 'details'" class="animate-in fade-in duration-200">
      <TournamentForm
        :tournament="tournament"
        @submit="handleSubmit"
      />
    </div>
  </div>
</template>