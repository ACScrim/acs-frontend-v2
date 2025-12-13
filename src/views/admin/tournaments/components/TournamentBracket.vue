<script setup lang="ts">
import { Button, Card } from '@/components/ui';
import useAdminStore from '@/stores/adminStore';
import { useToastStore } from '@/stores/toastStore';
import type { Tournament, TournamentFormat, TournamentPhase } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps<{ tournament: Tournament }>();
const emit = defineEmits<{ saved: [] }>();

const route = useRoute();
const adminStore = useAdminStore();
const toast = useToastStore();

const showPhaseModal = ref(false);
const editingPhase = ref<TournamentPhase | null>(null);

const phases = computed(() => props.tournament.phases || []);

const getNextPhaseOrder = computed(() => (phases.value?.length || 0) + 1);

const formatOptions: { value: TournamentFormat; label: string; description: string }[] = [
  { value: 'single-elimination', label: 'Élimination simple', description: 'Une seule défaite élimine l\'équipe' },
  { value: 'double-elimination', label: 'Élimination double', description: 'Deux défaites pour être éliminé' },
  { value: 'round-robin', label: 'Round Robin', description: 'Tous contre tous' },
  { value: 'swiss', label: 'Système Suisse', description: 'Appariement par classement' },
  { value: 'group-stage', label: 'Phase de groupes', description: 'Groupes puis phases finales' }
];

const phaseForm = ref<Partial<TournamentPhase>>({
  name: '',
  format: 'single-elimination',
  status: 'not-started',
  teams: [],
  matches: [],
  order: getNextPhaseOrder.value
});

const showDeleteConfirm = ref(false);
const phaseToDelete = ref<string | null>(null);

const getFormatLabel = (format: TournamentFormat) => {
  return formatOptions.find(f => f.value === format)?.label || format;
};

const getStatusIcon = (status: TournamentPhase['status']) => {
  switch (status) {
    case 'not-started': return 'bs:clock';
    case 'in-progress': return 'bs:play-circle';
    case 'completed': return 'bs:check-circle';
  }
};

const getStatusColor = (status: TournamentPhase['status']) => {
  switch (status) {
    case 'not-started': return 'text-foam-300/70';
    case 'in-progress': return 'text-accent-300';
    case 'completed': return 'text-emerald-400';
  }
};

const openPhaseModal = (phase?: TournamentPhase) => {
  if (phase) {
    editingPhase.value = phase;
    phaseForm.value = { ...phase };
  } else {
    editingPhase.value = null;
    phaseForm.value = {
      name: phases.value.length === 0 ? 'Phase 1' : `Phase ${phases.value.length + 1}`,
      format: 'single-elimination',
      status: 'not-started',
      teams: [],
      matches: [],
      order: getNextPhaseOrder.value
    };
  }
  showPhaseModal.value = true;
};

const closePhaseModal = () => {
  showPhaseModal.value = false;
  editingPhase.value = null;
};

const handleSavePhase = async () => {
  if (!phaseForm.value.name?.trim()) {
    toast.error('Le nom de la phase est requis.');
    return;
  }

  if (!phaseForm.value.format) {
    toast.error('Le format de la phase est requis.');
    return;
  }

  try {
    const phaseData = {
      ...phaseForm.value,
      teams: phaseForm.value.teams || [],
      matches: phaseForm.value.matches || []
    } as TournamentPhase;

    const phaseId = editingPhase.value?.id;
    if (phaseId) {
      await adminStore.updateTournamentPhase(route.params.id as string, phaseId, phaseData);
      toast.success('Phase mise à jour avec succès.');
    } else {
      await adminStore.createTournamentPhase(route.params.id as string, phaseData);
      toast.success('Phase créée avec succès.');
    }
    
    closePhaseModal();
    emit('saved');
  } catch (error) {
    toast.error('Erreur lors de la sauvegarde de la phase.');
  }
};

const openDeleteConfirm = (phaseId: string) => {
  phaseToDelete.value = phaseId;
  showDeleteConfirm.value = true;
};

const closeDeleteConfirm = () => {
  showDeleteConfirm.value = false;
  phaseToDelete.value = null;
};

const handleDeletePhase = async () => {
  if (!phaseToDelete.value) return;

  try {
    await adminStore.deleteTournamentPhase(route.params.id as string, phaseToDelete.value);
    toast.success('Phase supprimée avec succès.');
    emit('saved');
  } catch (error) {
    toast.error('Erreur lors de la suppression de la phase.');
  } finally {
    closeDeleteConfirm();
  }
};

const canAddPhase = computed(() => {
  // Can always add a first phase
  if (!phases.value || phases.value.length === 0) return true;
  
  // Can add second phase even if first phase is in progress or completed
  if (phases.value.length === 1) return true;
  
  // Max 2 phases
  return phases.value.length < 2;
});

const phaseStatusLabel = (status: TournamentPhase['status']) => {
  switch (status) {
    case 'not-started': return 'Non démarré';
    case 'in-progress': return 'En cours';
    case 'completed': return 'Terminé';
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.4em] text-foam-300/70">Configuration</p>
        <h2 class="hero-title text-3xl">Arbre du tournoi</h2>
      </div>
      <Button 
        v-if="canAddPhase"
        @click="openPhaseModal()"
        class="gap-2"
      >
        <VueIcon name="bs:plus-circle" />
        Ajouter une phase
      </Button>
    </div>

    <p v-if="phases.length === 0" class="text-sm text-foam-300/80">
      Aucune phase configurée. Créez une première phase pour définir le format du tournoi.
    </p>

    <div v-if="phases.length > 0" class="grid gap-4">
      <Card
        v-for="phase in phases"
        :key="phase.id || phase.name"
        class="glass-panel p-5 space-y-4"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 space-y-2">
            <div class="flex items-center gap-3">
              <VueIcon :name="getStatusIcon(phase.status)" :class="['text-2xl', getStatusColor(phase.status)]" />
              <div>
                <h3 class="text-xl font-bold text-white">{{ phase.name }}</h3>
                <p class="text-sm text-foam-300/70">{{ getFormatLabel(phase.format) }}</p>
              </div>
            </div>
            
            <div class="flex items-center gap-6 text-sm">
              <div class="flex items-center gap-2">
                <VueIcon name="bs:diagram-3" class="text-foam-300/70" />
                <span class="text-white">{{ phase.teams?.length || 0 }} équipes</span>
              </div>
              <div class="flex items-center gap-2">
                <VueIcon name="bs:trophy" class="text-foam-300/70" />
                <span class="text-white">{{ phase.matches?.length || 0 }} matchs</span>
              </div>
              <div class="flex items-center gap-2">
                <span :class="['px-2 py-1 rounded text-xs font-semibold', getStatusColor(phase.status)]">
                  {{ phaseStatusLabel(phase.status) }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <Button variant="ghost" size="sm" @click="openPhaseModal(phase)">
              <VueIcon name="bs:pencil" />
            </Button>
            <Button 
              v-if="phase.status === 'not-started' && phase.id"
              variant="ghost" 
              size="sm" 
              @click="openDeleteConfirm(phase.id)"
              class="text-red-400 hover:text-red-300"
            >
              <VueIcon name="bs:trash" />
            </Button>
          </div>
        </div>
      </Card>
    </div>

    <!-- Phase Modal -->
    <div
      v-if="showPhaseModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      @click.self="closePhaseModal"
    >
      <Card class="glass-panel w-full max-w-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.4em] text-foam-300/70">
              {{ editingPhase ? 'Édition' : 'Création' }}
            </p>
            <h2 class="hero-title text-2xl">
              {{ editingPhase ? 'Modifier la phase' : 'Nouvelle phase' }}
            </h2>
          </div>
          <button @click="closePhaseModal" class="p-2 hover:bg-white/10 rounded-lg transition">
            <VueIcon name="bs:x" class="text-xl" />
          </button>
        </div>

        <form @submit.prevent="handleSavePhase" class="space-y-5">
          <!-- Nom de la phase -->
          <div>
            <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Nom de la phase *</label>
            <input
              v-model="phaseForm.name"
              type="text"
              placeholder="Ex: Phase 1, Playoffs, Finale"
              class="form-input"
            />
          </div>

          <!-- Format du tournoi -->
          <div>
            <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70 mb-3 block">
              Format de la phase *
            </label>
            <div class="grid gap-3">
              <label
                v-for="format in formatOptions"
                :key="format.value"
                class="relative flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all"
                :class="[
                  phaseForm.format === format.value
                    ? 'border-accent-300 bg-accent-300/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                ]"
              >
                <input
                  type="radio"
                  :value="format.value"
                  v-model="phaseForm.format"
                  class="mt-1"
                />
                <div class="flex-1">
                  <p class="font-semibold text-white">{{ format.label }}</p>
                  <p class="text-sm text-foam-300/70">{{ format.description }}</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Status (pour l'édition) -->
          <div v-if="editingPhase">
            <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Statut</label>
            <select v-model="phaseForm.status" class="form-input">
              <option value="not-started">Non démarré</option>
              <option value="in-progress">En cours</option>
              <option value="completed">Terminé</option>
            </select>
          </div>

          <div class="flex gap-3 border-t border-white/5 pt-4">
            <Button type="submit" class="flex-1">
              {{ editingPhase ? 'Mettre à jour' : 'Créer la phase' }}
            </Button>
            <Button type="button" variant="ghost" class="flex-1" @click="closePhaseModal">
              Annuler
            </Button>
          </div>
        </form>
      </Card>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      @click.self="closeDeleteConfirm"
    >
      <Card class="glass-panel w-full max-w-md p-6 space-y-6">
        <div class="flex items-start gap-3">
          <div class="p-3 bg-red-500/10 rounded-lg">
            <VueIcon name="bs:exclamation-triangle" class="text-2xl text-red-400" />
          </div>
          <div class="flex-1">
            <h2 class="hero-title text-xl text-white mb-2">Confirmer la suppression</h2>
            <p class="text-sm text-foam-300/80">
              Êtes-vous sûr de vouloir supprimer cette phase ? Cette action est irréversible.
            </p>
          </div>
        </div>

        <div class="flex gap-3 border-t border-white/5 pt-4">
          <Button 
            @click="handleDeletePhase"
            class="flex-1 bg-red-500 hover:bg-red-600"
          >
            Supprimer
          </Button>
          <Button 
            variant="ghost" 
            class="flex-1" 
            @click="closeDeleteConfirm"
          >
            Annuler
          </Button>
        </div>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.form-input {
  @apply w-full px-4 py-2 bg-surface-700/60 border border-white/10 rounded-lg text-white placeholder-foam-300/50 focus:outline-none focus:border-accent-300/50 transition-colors;
}
</style>
