<script setup lang="ts">
import { Button, Card } from '@/components/ui';
import useAdminStore from '@/stores/adminStore';
import { useToastStore } from '@/stores/toastStore';
import type { ChallongeBracketSettings, Tournament } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { computed, reactive, ref } from 'vue';

const props = defineProps<{ tournament: Tournament }>();
const emit = defineEmits<{ updated: [] }>();

const adminStore = useAdminStore();
const toast = useToastStore();

const loading = ref(false);
const showCreateForm = ref(false);

const hasBracket = computed(() => !!props.tournament.challongeUrl);

const bracketSettings = reactive<ChallongeBracketSettings>({
  tournamentType: 'single elimination',
  showRounds: true,
  privateOnly: false,
  notifyUsersWhenMatchesOpen: true,
  notifyUsersWhenTheTournamentEnds: true,
  sequentialPairings: false,
  signupCap: props.tournament.playerCap || undefined,
  description: props.tournament.description || '',
});

const handleCreateBracket = async () => {
  if (!props.tournament.teamsPublished) {
    toast.error('Les équipes doivent être publiées avant de créer un bracket.');
    return;
  }

  try {
    loading.value = true;
    const response = await adminStore.createChallongeBracket(props.tournament.id, bracketSettings);
    toast.success('Bracket Challonge créé avec succès!');
    showCreateForm.value = false;
    emit('updated');
    
    // Open bracket URL in new tab
    if (response.bracketUrl) {
      window.open(response.bracketUrl, '_blank');
    }
  } catch (error) {
    toast.error('Erreur lors de la création du bracket Challonge.');
  } finally {
    loading.value = false;
  }
};

const handleUpdateBracket = async () => {
  try {
    loading.value = true;
    await adminStore.updateChallongeBracket(props.tournament.id);
    toast.success('Bracket Challonge mis à jour avec succès!');
    emit('updated');
  } catch (error) {
    toast.error('Erreur lors de la mise à jour du bracket.');
  } finally {
    loading.value = false;
  }
};

const handleStartBracket = async () => {
  if (!confirm('Êtes-vous sûr de vouloir démarrer le tournoi sur Challonge ? Cette action est irréversible.')) {
    return;
  }

  try {
    loading.value = true;
    await adminStore.startChallongeBracket(props.tournament.id);
    toast.success('Tournoi démarré sur Challonge!');
    emit('updated');
  } catch (error) {
    toast.error('Erreur lors du démarrage du tournoi.');
  } finally {
    loading.value = false;
  }
};

const handleFinalizeBracket = async () => {
  if (!confirm('Êtes-vous sûr de vouloir finaliser le tournoi sur Challonge ? Cette action est irréversible.')) {
    return;
  }

  try {
    loading.value = true;
    await adminStore.finalizeChallongeBracket(props.tournament.id);
    toast.success('Tournoi finalisé sur Challonge!');
    emit('updated');
  } catch (error) {
    toast.error('Erreur lors de la finalisation du tournoi.');
  } finally {
    loading.value = false;
  }
};

const handleSyncResults = async () => {
  try {
    loading.value = true;
    await adminStore.syncChallongeResults(props.tournament.id);
    toast.success('Résultats synchronisés depuis Challonge!');
    emit('updated');
  } catch (error) {
    toast.error('Erreur lors de la synchronisation des résultats.');
  } finally {
    loading.value = false;
  }
};

const handleDeleteBracket = async () => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer le bracket Challonge ? Cette action est irréversible.')) {
    return;
  }

  try {
    loading.value = true;
    await adminStore.deleteChallongeBracket(props.tournament.id);
    toast.success('Bracket Challonge supprimé avec succès!');
    emit('updated');
  } catch (error) {
    toast.error('Erreur lors de la suppression du bracket.');
  } finally {
    loading.value = false;
  }
};

const openBracket = () => {
  if (props.tournament.challongeUrl) {
    window.open(props.tournament.challongeUrl, '_blank');
  }
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.4em] text-foam-300/70">Bracket Challonge</p>
        <h2 class="hero-title text-3xl">Gestion du bracket</h2>
      </div>
      <Button 
        v-if="hasBracket" 
        @click="openBracket"
        class="flex items-center gap-2"
      >
        <VueIcon name="bs:box-arrow-up-right" />
        Ouvrir le bracket
      </Button>
    </div>

    <!-- No Bracket Created -->
    <div v-if="!hasBracket" class="space-y-4">
      <Card class="glass-panel p-6 space-y-4">
        <div class="flex items-start gap-4">
          <div class="p-3 bg-gradient-to-br from-accent-500 to-emerald-400 rounded-lg">
            <VueIcon name="bs:diagram-3" class="text-2xl text-ink-900" />
          </div>
          <div class="flex-1">
            <h3 class="text-xl font-bold text-white mb-2">Aucun bracket créé</h3>
            <p class="text-foam-300/80 text-sm mb-4">
              Créez un bracket sur Challonge pour gérer automatiquement les matchs du tournoi.
            </p>
            <Button 
              @click="showCreateForm = !showCreateForm"
              :disabled="!tournament.teamsPublished || loading"
              class="flex items-center gap-2"
            >
              <VueIcon name="bs:plus-lg" />
              {{ showCreateForm ? 'Annuler' : 'Créer un bracket' }}
            </Button>
            <p v-if="!tournament.teamsPublished" class="text-amber-300 text-xs mt-2">
              Les équipes doivent être publiées avant de créer un bracket.
            </p>
          </div>
        </div>
      </Card>

      <!-- Create Form -->
      <Card v-if="showCreateForm" class="glass-panel p-6 space-y-4">
        <h3 class="text-lg font-bold text-white mb-4">Configuration du bracket</h3>
        
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Type de tournoi</label>
            <!-- Note: option values must be in English as required by Challonge API -->
            <select v-model="bracketSettings.tournamentType" class="form-input">
              <option value="single elimination">Simple élimination</option>
              <option value="double elimination">Double élimination</option>
              <option value="round robin">Round Robin</option>
              <option value="swiss">Swiss</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Limite de joueurs</label>
            <input 
              type="number" 
              v-model.number="bracketSettings.signupCap" 
              class="form-input"
              min="2"
            />
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Description</label>
          <textarea 
            v-model="bracketSettings.description" 
            class="form-input min-h-[100px]"
            placeholder="Description du tournoi sur Challonge..."
          ></textarea>
        </div>

        <div class="space-y-3 pt-2">
          <label class="flex items-center gap-3 text-sm text-foam-200 cursor-pointer">
            <input 
              type="checkbox" 
              v-model="bracketSettings.showRounds"
              class="w-4 h-4 rounded border-white/20 bg-white/5 text-accent-500 focus:ring-accent-500"
            />
            Afficher les rounds
          </label>

          <label class="flex items-center gap-3 text-sm text-foam-200 cursor-pointer">
            <input 
              type="checkbox" 
              v-model="bracketSettings.privateOnly"
              class="w-4 h-4 rounded border-white/20 bg-white/5 text-accent-500 focus:ring-accent-500"
            />
            Bracket privé
          </label>

          <label class="flex items-center gap-3 text-sm text-foam-200 cursor-pointer">
            <input 
              type="checkbox" 
              v-model="bracketSettings.notifyUsersWhenMatchesOpen"
              class="w-4 h-4 rounded border-white/20 bg-white/5 text-accent-500 focus:ring-accent-500"
            />
            Notifier les utilisateurs à l'ouverture des matchs
          </label>

          <label class="flex items-center gap-3 text-sm text-foam-200 cursor-pointer">
            <input 
              type="checkbox" 
              v-model="bracketSettings.notifyUsersWhenTheTournamentEnds"
              class="w-4 h-4 rounded border-white/20 bg-white/5 text-accent-500 focus:ring-accent-500"
            />
            Notifier les utilisateurs à la fin du tournoi
          </label>

          <label class="flex items-center gap-3 text-sm text-foam-200 cursor-pointer">
            <input 
              type="checkbox" 
              v-model="bracketSettings.sequentialPairings"
              class="w-4 h-4 rounded border-white/20 bg-white/5 text-accent-500 focus:ring-accent-500"
            />
            Appariements séquentiels
          </label>
        </div>

        <div class="flex gap-3 pt-4">
          <Button 
            @click="handleCreateBracket"
            :disabled="loading"
            class="flex-1 flex items-center justify-center gap-2"
          >
            <VueIcon v-if="!loading" name="bs:check-lg" />
            <VueIcon v-else name="ri:loader-4-line" class="animate-spin" />
            {{ loading ? 'Création en cours...' : 'Créer le bracket' }}
          </Button>
          <Button 
            @click="showCreateForm = false"
            variant="secondary"
            :disabled="loading"
          >
            Annuler
          </Button>
        </div>
      </Card>
    </div>

    <!-- Bracket Exists -->
    <div v-else class="space-y-4">
      <Card class="glass-panel p-6">
        <div class="flex items-start gap-4 mb-6">
          <div class="p-3 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-lg">
            <VueIcon name="bs:check-circle-fill" class="text-2xl text-ink-900" />
          </div>
          <div class="flex-1">
            <h3 class="text-xl font-bold text-white mb-2">Bracket actif</h3>
            <p class="text-foam-300/80 text-sm mb-2">
              Le bracket Challonge est créé et accessible.
            </p>
            <div class="flex items-center gap-2 text-sm">
              <span class="text-foam-400">URL:</span>
              <a 
                :href="tournament.challongeUrl" 
                target="_blank"
                class="text-accent-300 hover:text-accent-200 underline flex items-center gap-1"
              >
                {{ tournament.challongeUrl }}
                <VueIcon name="bs:box-arrow-up-right" class="text-xs" />
              </a>
            </div>
          </div>
        </div>

        <!-- Bracket Actions -->
        <div class="grid gap-3 md:grid-cols-2">
          <Button 
            @click="handleUpdateBracket"
            :disabled="loading"
            class="flex items-center justify-center gap-2"
            variant="secondary"
          >
            <VueIcon name="bs:arrow-repeat" />
            Mettre à jour
          </Button>

          <Button 
            @click="handleStartBracket"
            :disabled="loading"
            class="flex items-center justify-center gap-2"
          >
            <VueIcon name="bs:play-fill" />
            Démarrer le tournoi
          </Button>

          <Button 
            @click="handleSyncResults"
            :disabled="loading"
            class="flex items-center justify-center gap-2"
            variant="secondary"
          >
            <VueIcon name="bs:arrow-down-up" />
            Synchroniser résultats
          </Button>

          <Button 
            @click="handleFinalizeBracket"
            :disabled="loading"
            class="flex items-center justify-center gap-2"
          >
            <VueIcon name="bs:flag-fill" />
            Finaliser
          </Button>

          <Button 
            @click="handleDeleteBracket"
            :disabled="loading"
            class="flex items-center justify-center gap-2 md:col-span-2"
            variant="secondary"
          >
            <VueIcon name="bs:trash" />
            Supprimer le bracket
          </Button>
        </div>
      </Card>

      <!-- Bracket Preview iframe -->
      <Card class="glass-panel p-6">
        <h3 class="text-lg font-bold text-white mb-4">Aperçu du bracket</h3>
        <div class="bracket-container">
          <iframe 
            v-if="tournament.challongeUrl"
            :src="tournament.challongeUrl + '/module'"
            class="absolute top-0 left-0 w-full h-full rounded-lg border border-white/10"
            frameborder="0"
            scrolling="auto"
            allowtransparency="true"
          ></iframe>
        </div>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.form-input {
  @apply w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-foam-300/50 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all;
}

.bracket-container {
  @apply relative w-full;
  padding-bottom: 56.25%; /* 16:9 aspect ratio for iframe */
}
</style>
