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
import TournamentResults from './components/TournamentResults.vue';
import TournamentChallongeBracket from './components/TournamentChallongeBracket.vue';

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();

const tournament = computed(() => adminStore.getTournamentById(route.params.id as string) as Tournament);
const editingTeams = ref(!tournament.value?.teamsPublished);
const activeTab = ref<'teams' | 'details' | 'players' | 'results' | 'bracket'>('teams');
const tournamentStarted = computed(() => new Date(tournament.value?.date ?? '').getTime() <= Date.now());

whenever(tournament, () => {
  editingTeams.value = !tournament.value?.teamsPublished;
});

whenever(activeTab, (tab) => {
  router.push({ query: { tab } });
});

onMounted(() => {
  adminStore.fetchTournamentDetails(route.params.id as string);

  const queryTab = route.query.tab as string;
  if (queryTab === 'teams' || queryTab === 'details' || queryTab === 'players' || queryTab === 'results' || queryTab === 'bracket') {
    activeTab.value = queryTab;
  }
});

const handleEditTeams = () => {
  adminStore.publishTournamentTeams(route.params.id as string, false)
    .then(() => {
      editingTeams.value = true;
    });
};

const handleToggleDraft = async () => {
  if (tournament.value?.isDraft && tournament.value?.draftStatus === 'in_progress') {
    useToastStore().error('Impossible de désactiver le mode draft : la draft est en cours.');
    return;
  }
  await adminStore.toggleDraftMode(route.params.id as string, !tournament.value?.isDraft);
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
        <div class="p-3 bg-gradient-to-br from-accent-500 to-emerald-400 rounded-lg">
          <VueIcon name="bs:trophy-fill" class="text-2xl text-ink-900" />
        </div>
        <div class="flex-1">
          <h1 class="text-4xl font-bold text-white mb-2">{{ tournament.name }}</h1>
          <p class="text-foam-200 text-sm">{{ tournament.game.name }} • {{ new Date(tournament.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card class="p-4 bg-ink-900/70 border border-white/10">
          <p class="text-xs text-foam-300/70 mb-1 flex items-center gap-1">
            <VueIcon name="cl:users" />
            Joueurs
          </p>
          <p class="text-2xl font-bold text-white">{{ tournament.players.filter(p => !p.inWaitlist && !p.isCaster).length }}<span class="text-lg text-foam-300">/{{ tournament.playerCap === 0 ? '∞' : tournament.playerCap }}</span></p>
        </Card>
        <Card class="p-4 bg-ink-900/70 border border-white/10">
          <p class="text-xs text-foam-300/70 mb-1 flex items-center gap-1">
            <VueIcon name="bs:diagram-3" />
            Équipes
          </p>
          <p class="text-2xl font-bold text-white">{{ tournament.teams.length }}</p>
        </Card>
        <Card class="p-4 bg-ink-900/70 border border-white/10">
          <p class="text-xs text-foam-300/70 mb-1 flex items-center gap-1">
            <VueIcon :name="tournament.teamsPublished ? 'bs:check-circle' : 'bs:clock'" />
            État équipes
          </p>
          <p :class="['text-sm font-bold', tournament.teamsPublished ? 'text-emerald-300' : 'text-amber-300']">
            {{ tournament.teamsPublished ? 'Publiées' : 'Brouillon' }}
          </p>
        </Card>
        <Card class="p-4 bg-ink-900/70 border border-white/10">
          <p class="text-xs text-foam-300/70 mb-1 flex items-center gap-1">
            <VueIcon :name="tournament.finished ? 'bs:check-circle' : 'bs:hourglass-split'" />
            Status
          </p>
          <p :class="['text-sm font-bold', tournament.finished ? 'text-blush-400' : 'text-foam-100']">
            {{ tournament.finished ? 'Terminé' : 'En cours' }}
          </p>
        </Card>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 border-b border-white/10">
      <button
        @click="activeTab = 'teams'"
        :class="[
          'px-4 py-3 font-bold flex items-center gap-2 transition-all',
          activeTab === 'teams'
            ? 'text-white border-b-2 border-accent-300'
            : 'text-foam-300/70 hover:text-white'
        ]"
      >
        <VueIcon name="bs:diagram-3" />
        Équipes
      </button>
      <button
        @click="activeTab = 'bracket'"
        :class="[
          'px-4 py-3 font-bold flex items-center gap-2 transition-all',
          activeTab === 'bracket'
            ? 'text-white border-b-2 border-accent-300'
            : 'text-foam-300/70 hover:text-white'
        ]"
      >
        <VueIcon name="bs:diagram-2" />
        Bracket
      </button>
      <button
        @click="activeTab = 'players'"
        :class="[
          'px-4 py-3 font-bold flex items-center gap-2 transition-all',
          activeTab === 'players'
            ? 'text-white border-b-2 border-accent-300'
            : 'text-foam-300/70 hover:text-white'
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
            ? 'text-white border-b-2 border-accent-300'
            : 'text-foam-300/70 hover:text-white'
        ]"
      >
        <VueIcon name="bs:pencil" />
        Détails
      </button>
      <button
        v-if="tournamentStarted"
        @click="activeTab = 'results'"
        :class="[
          'px-4 py-3 font-bold flex items-center gap-2 transition-all',
          activeTab === 'results'
            ? 'text-white border-b-2 border-accent-300'
            : 'text-foam-300/70 hover:text-white'
        ]"
      >
        <VueIcon name="bs:bar-chart" />
        Résultats
      </button>
    </div>

    <!-- Teams Tab -->
    <div v-show="activeTab === 'teams'" class="space-y-6 animate-in fade-in duration-200">
      <div class="flex items-center gap-3">
        <button
          @click="handleToggleDraft"
          :disabled="tournament.isDraft && tournament.draftStatus === 'in_progress'"
          :class="[
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all border',
            tournament.isDraft
              ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 hover:bg-amber-500/30'
              : 'bg-white/5 border-white/10 text-foam-300/70 hover:text-white hover:bg-white/10',
            (tournament.isDraft && tournament.draftStatus === 'in_progress') ? 'opacity-50 cursor-not-allowed' : ''
          ]"
        >
          <VueIcon :name="tournament.isDraft ? 'bs:shuffle' : 'bs:people-fill'" />
          {{ tournament.isDraft ? 'Mode draft (bot Discord)' : 'Mode normal' }}
        </button>
        <span v-if="tournament.isDraft && tournament.draftStatus === 'in_progress'" class="text-xs text-amber-400/80">
          Draft en cours — modification des équipes désactivée
        </span>
        <span v-else-if="tournament.isDraft" class="text-xs text-foam-300/60">Les équipes sont gérées par le bot Discord</span>
      </div>

      <TournamentTeamsDisplay 
        v-if="tournament.teamsPublished && !editingTeams"
        :tournament="tournament"
        @edit="handleEditTeams"
      />

      <TournamentTeamsCreation 
        v-if="!tournament.teamsPublished || editingTeams"
        :tournament="tournament"
        :draft-mode="tournament.isDraft"
        @saved="handleTeamsSaved"
      />

      <div
        v-if="tournament.isDraft && (!tournament.teamsPublished || editingTeams)"
        class="rounded-xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-200/80"
      >
        <VueIcon name="bs:info-circle" class="inline mr-2" />
        Définissez le tier de chaque joueur avant de lancer la draft via le bot Discord.
      </div>
    </div>

    <!-- Players Tab -->
    <div v-show="activeTab === 'players'" class="animate-in fade-in duration-200">
      <TournamentPlayers
        :tournament="tournament"
      />
    </div>

    <!-- Bracket Tab -->
    <div v-show="activeTab === 'bracket'" class="animate-in fade-in duration-200">
      <TournamentChallongeBracket
        :tournament="tournament"
        @updated="handleTeamsSaved"
      />
    </div>

    <!-- Details Tab -->
    <div v-show="activeTab === 'details'" class="animate-in fade-in duration-200">
      <TournamentForm
        :tournament="tournament"
        @submit="handleSubmit"
      />
    </div>

    <!-- Results Tab -->
    <div v-show="activeTab === 'results'" class="animate-in fade-in duration-200" v-if="tournamentStarted">
      <TournamentResults :tournament="tournament" @saved="handleTeamsSaved" />
    </div>
  </div>
</template>