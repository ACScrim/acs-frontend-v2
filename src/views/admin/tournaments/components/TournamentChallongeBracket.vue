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
  groupStageEnabled: false,
  groupStage: {
    type: 'round robin',
    groupSize: undefined,
    participantCountToAdvancePerGroup: undefined,
    rrIterations: 1,
    rankedBy: '',
  },
  doubleElimination: {
    splitParticipants: false,
    grandFinalsModifier: '',
  },
  roundRobin: {
    iterations: 1,
    ranking: 'match wins',
    ptsForGameWin: 1,
    ptsForGameTie: 0,
    ptsForMatchWin: 1,
    ptsForMatchTie: 0,
  },
  swiss: {
    rounds: 1,
    ptsForGameWin: 1,
    ptsForGameTie: 0,
    ptsForMatchWin: 1,
    ptsForMatchTie: 0,
  },
  freeForAll: {
    maxParticipants: undefined,
  },
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

        <!-- Type de tournoi -->
        <div class="space-y-2">
          <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Type de tournoi</label>
          <select v-model="bracketSettings.tournamentType" class="form-input">
            <option value="single elimination">Simple élimination</option>
            <option value="double elimination">Double élimination</option>
            <option value="round robin">Round Robin</option>
            <option value="swiss">Swiss</option>
            <option value="free for all">Free for all</option>
          </select>
        </div>

        <!-- Phase de groupes -->
        <div class="space-y-3 pt-2">
          <label class="flex items-center gap-3 text-sm text-foam-200 cursor-pointer">
            <input
                type="checkbox"
                v-model="bracketSettings.groupStageEnabled"
                class="w-4 h-4 rounded border-white/20 bg-white/5 text-accent-500 focus:ring-accent-500"
            />
            Activer la phase de groupes
          </label>

          <!-- Paramètres de phase de groupes -->
          <div v-if="bracketSettings.groupStageEnabled" class="ml-6 space-y-3 p-4 bg-white/5 rounded-lg border border-white/10">
            <div class="space-y-2">
              <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Type de phase de groupes</label>
              <select v-model="bracketSettings.groupStage!.type" class="form-input">
                <option value="">Sélectionner...</option>
                <option value="round robin">Round Robin</option>
                <option value="swiss">Swiss</option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Taille des groupes</label>
              <input
                  type="number"
                  v-model.number="bracketSettings.groupStage!.groupSize"
                  class="form-input"
                  min="2"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Participants à avancer par groupe</label>
              <input
                  type="number"
                  v-model.number="bracketSettings.groupStage!.participantCountToAdvancePerGroup"
                  class="form-input"
                  min="1"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Itérations Round Robin</label>
              <input
                  type="number"
                  v-model.number="bracketSettings.groupStage!.rrIterations"
                  class="form-input"
                  min="1"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Classement par</label>
              <select v-model="bracketSettings.groupStage!.rankedBy" class="form-input">
                <option value="">Par défaut</option>
                <option value="match wins">Victoires de matchs</option>
                <option value="game wins">Victoires de jeux</option>
                <option value="game win percentage">Pourcentage de victoires de jeux</option>
                <option value="points scored">Points marqués</option>
                <option value="points difference">Différence de points</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Paramètres Double Élimination -->
        <div v-if="bracketSettings.tournamentType === 'double elimination'" class="space-y-3 p-4 bg-white/5 rounded-lg border border-white/10">
          <h4 class="text-sm font-semibold text-foam-200">Double élimination</h4>

          <label class="flex items-center gap-3 text-sm text-foam-200 cursor-pointer">
            <input
                type="checkbox"
                v-model="bracketSettings.doubleElimination!.splitParticipants"
                class="w-4 h-4 rounded border-white/20 bg-white/5 text-accent-500 focus:ring-accent-500"
            />
            Diviser les participants
          </label>

          <div class="space-y-2">
            <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Modifier les grandes finales</label>
            <select v-model="bracketSettings.doubleElimination!.grandFinalsModifier" class="form-input">
              <option value="">Aucun</option>
              <option value="skip">Ignorer</option>
              <option value="single match">Un seul match</option>
            </select>
          </div>
        </div>

        <!-- Paramètres Round Robin -->
        <div v-if="bracketSettings.tournamentType === 'round robin'" class="space-y-3 p-4 bg-white/5 rounded-lg border border-white/10">
          <h4 class="text-sm font-semibold text-foam-200">Round Robin</h4>

          <div class="space-y-2">
            <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Itérations</label>
            <input
                type="number"
                v-model.number="bracketSettings.roundRobin!.iterations"
                class="form-input"
                min="1"
                max="3"
            />
          </div>

          <div class="space-y-2">
            <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Classement par</label>
            <select v-model="bracketSettings.roundRobin!.ranking" class="form-input">
              <option value="">Par défaut</option>
              <option value="match wins">Victoires de matchs</option>
              <option value="game wins">Victoires de jeux</option>
              <option value="game win percentage">Pourcentage de victoires de jeux</option>
              <option value="points scored">Points marqués</option>
              <option value="points difference">Différence de points</option>
            </select>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <div class="space-y-2">
              <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Points victoire jeu</label>
              <input
                  type="number"
                  v-model.number="bracketSettings.roundRobin!.ptsForGameWin"
                  class="form-input"
                  min="0"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Points égalité jeu</label>
              <input
                  type="number"
                  v-model.number="bracketSettings.roundRobin!.ptsForGameTie"
                  class="form-input"
                  min="0"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Points victoire match</label>
              <input
                  type="number"
                  v-model.number="bracketSettings.roundRobin!.ptsForMatchWin"
                  class="form-input"
                  min="0"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Points égalité match</label>
              <input
                  type="number"
                  v-model.number="bracketSettings.roundRobin!.ptsForMatchTie"
                  class="form-input"
                  min="0"
              />
            </div>
          </div>
        </div>

        <!-- Paramètres Swiss -->
        <div v-if="bracketSettings.tournamentType === 'swiss'" class="space-y-3 p-4 bg-white/5 rounded-lg border border-white/10">
          <h4 class="text-sm font-semibold text-foam-200">Swiss</h4>

          <div class="space-y-2">
            <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Nombre de rounds</label>
            <input
                type="number"
                v-model.number="bracketSettings.swiss!.rounds"
                class="form-input"
                min="1"
            />
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <div class="space-y-2">
              <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Points victoire jeu</label>
              <input
                  type="number"
                  v-model.number="bracketSettings.swiss!.ptsForGameWin"
                  class="form-input"
                  min="0"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Points égalité jeu</label>
              <input
                  type="number"
                  v-model.number="bracketSettings.swiss!.ptsForGameTie"
                  class="form-input"
                  min="0"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Points victoire match</label>
              <input
                  type="number"
                  v-model.number="bracketSettings.swiss!.ptsForMatchWin"
                  class="form-input"
                  min="0"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Points égalité match</label>
              <input
                  type="number"
                  v-model.number="bracketSettings.swiss!.ptsForMatchTie"
                  class="form-input"
                  min="0"
              />
            </div>
          </div>
        </div>

        <!-- Paramètres Free for All -->
        <div v-if="bracketSettings.tournamentType === 'free for all'" class="space-y-3 p-4 bg-white/5 rounded-lg border border-white/10">
          <h4 class="text-sm font-semibold text-foam-200">Free for all</h4>

          <div class="space-y-2">
            <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Nombre maximal de participants</label>
            <input
                type="number"
                v-model.number="bracketSettings.freeForAll!.maxParticipants"
                class="form-input"
                min="2"
            />
          </div>
        </div>

        <!-- Boutons d'action -->
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
      </Card>

      <!-- Bracket Preview iframe -->
      <Card class="glass-panel p-6">
        <h3 class="text-lg font-bold text-white mb-4">Aperçu du bracket</h3>
        <div class="bracket-container">
          <iframe 
            v-if="tournament.challongeUrl"
            :src="tournament.challongeUrl + '/module'"
            class="absolute top-0 left-0 w-full h-full rounded-lg border-0"
            scrolling="auto"
          ></iframe>
        </div>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.bracket-container {
  @apply relative w-full;
  padding-bottom: 56.25%; /* 16:9 aspect ratio for iframe */
}
</style>
