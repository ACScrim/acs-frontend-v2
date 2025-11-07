<script setup lang="ts">
import useAdminStore from '@/stores/adminStore';
import type { Tournament, TournamentFormData } from '@/types/models';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TournamentTeamsCreation from './components/TournamentTeamsCreation.vue';
import TournamentTeamsDisplay from './components/TournamentTeamsDisplay.vue';
import { whenever } from '@vueuse/core';
import TournamentForm from '@/components/forms/TournamentForm.vue';
import { useToastStore } from '@/stores/toastStore';

const router = useRouter();
const route = useRoute();
const adminStore = useAdminStore();

const tournament = computed(() => adminStore.tournaments.find(t => t.id === route.params.id) as Tournament);
const editingTeams = ref(!tournament.value.teamsPublished);

whenever(tournament, () => {
  editingTeams.value = !tournament.value?.teamsPublished;
});

onMounted(() => {
  adminStore.fetchTournamentDetails(route.params.id as string);
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
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2 text-christmas-gold">{{ tournament.name }}</h1>
      <div class="grid grid-cols-4 gap-4 text-christmas-gold-light">
        <div><strong>Joueurs:</strong> {{ tournament.players.length }} / {{ tournament.playerCap }}</div>
        <div><strong>Date:</strong> {{ new Date(tournament.date).toLocaleDateString() }}</div>
        <div><strong>Équipes publiées:</strong> {{ tournament.teamsPublished ? 'Oui' : 'Non' }}</div>
        <div><strong>Terminé:</strong> {{ tournament.finished ? 'Oui' : 'Non' }}</div>
      </div>
    </div>

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

    <TournamentForm 
      :tournament="tournament"
      @submit="handleSubmit"
    />
  </div>
</template>