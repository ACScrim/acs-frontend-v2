<script setup lang="ts">
import {Button, Card} from '@/components/ui';
import {useToastStore} from '@/stores/toastStore';
import type {Season} from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import {computed, ref, watch} from 'vue';
import useAdminStore from "@/stores/adminStore.ts";

interface Props {
  isLoading?: boolean;
  isEditing?: boolean;
  editingSeason?: Season;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  isEditing: false,
});

const emit = defineEmits<{
  submit: [data: { number: number; tournamentIds: string[] }];
  cancel: [];
}>();

const adminStore = useAdminStore();
const toastStore = useToastStore();

const seasonNumber = ref('');
const selectedTournaments = ref<string[]>([]);

// Initialiser avec les données si en édition
watch(() => props.editingSeason, (season) => {
  if (season && props.isEditing) {
    seasonNumber.value = String(season.number);
    selectedTournaments.value = season.tournaments.map(t => {
      return (t as any).id || '';
    });
  }
}, { immediate: true });

const availableTournaments = computed(() => {
  return adminStore.tournaments
      .filter(tournament => {
        return !adminStore.seasons.find(s => s.tournaments.map(t => t.id).includes(tournament.id));
      });
});

const toggleTournament = (tournamentId: string) => {
  const index = selectedTournaments.value.indexOf(tournamentId);
  if (index > -1) {
    selectedTournaments.value.splice(index, 1);
  } else {
    selectedTournaments.value.push(tournamentId);
  }
};

const handleSubmit = async () => {
  if (!seasonNumber.value) {
    toastStore.error('Le numéro de saison est requis.');
    return;
  }

  const number = parseInt(seasonNumber.value);
  if (isNaN(number) || number < 0) {
    toastStore.error('Le numéro de saison doit être un nombre positif.');
    return;
  }

  emit('submit', {
    number,
    tournamentIds: selectedTournaments.value
  });

  if (!props.isEditing) {
    seasonNumber.value = '';
    selectedTournaments.value = [];
  }
};

const handleCancel = () => {
  seasonNumber.value = '';
  selectedTournaments.value = [];
  emit('cancel');
};
</script>

<template>
  <Card class="glass-panel p-6 space-y-6">
    <template #header>
      <div class="flex items-center gap-3">
        <span class="rounded-2xl bg-white/5 p-3">
          <VueIcon :name="isEditing ? 'bs:pencil-square' : 'bs:plus-circle'" class="text-accent-300" />
        </span>
        <div>
          <p class="text-xs uppercase tracking-[0.4em] text-foam-300/70">{{ isEditing ? 'Modification' : 'Création' }}</p>
          <h2 class="hero-title text-2xl">{{ isEditing ? 'Modifier la saison' : 'Ajouter une saison' }}</h2>
        </div>
      </div>
    </template>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label class="form-label">Numéro de saison *</label>
        <input v-model="seasonNumber" type="number" min="0" placeholder="Ex: 1" class="form-input" :disabled="isEditing" />
      </div>

      <div class="space-y-3">
        <div class="flex items-center gap-2 text-sm text-foam-300/80">
          <VueIcon name="bs:trophy-fill" /> Tournois de la saison
        </div>

        <!-- Tournois sélectionnés -->
        <div v-if="selectedTournaments.length > 0" class="space-y-2">
          <p class="text-xs font-semibold text-accent-300 uppercase tracking-[0.2em]">Sélectionnés ({{ selectedTournaments.length }})</p>
          <div class="space-y-2">
            <div v-for="tournamentId in selectedTournaments" :key="tournamentId" class="flex items-center gap-3 rounded-[var(--radius-lg)] border border-accent-300/30 bg-accent-300/10 p-3">
              <VueIcon name="bs:check-circle" class="text-accent-300 flex-shrink-0" />
              <div class="flex-1">
                <p class="text-white font-semibold">{{ adminStore.tournaments.find(t => t.id === tournamentId)?.name }}</p>
                <p class="text-xs text-foam-300/70">{{ new Date(adminStore.tournaments.find(t => t.id === tournamentId)?.date || '').toLocaleDateString('fr-FR') }} • {{ adminStore.tournaments.find(t => t.id === tournamentId)?.playerCap }} joueurs</p>
              </div>
              <button type="button" @click="toggleTournament(tournamentId)" class="text-foam-300/50 hover:text-red-400 transition">
                <VueIcon name="bs:x-circle" />
              </button>
            </div>
          </div>
        </div>

        <!-- Tournois disponibles -->
        <div v-if="availableTournaments.length === 0" class="rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-4 text-sm text-foam-300/70">
          Aucun tournoi disponible. Créez d'abord des tournois.
        </div>
        <div v-else class="space-y-2">
          <p class="text-xs font-semibold text-foam-300/70 uppercase tracking-[0.2em]">Disponibles</p>
          <div class="max-h-64 space-y-2 overflow-y-auto">
            <label v-for="tournament in availableTournaments" :key="tournament.id" class="flex cursor-pointer items-center gap-3 rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-3 hover:border-white/20 transition">
              <input type="checkbox" class="form-checkbox" :checked="selectedTournaments.includes(tournament.id)" @change="toggleTournament(tournament.id)" />
              <div class="flex-1">
                <p class="text-white font-semibold">{{ tournament.name }}</p>
                <p class="text-xs text-foam-300/70">{{ new Date(tournament.date).toLocaleDateString('fr-FR') }} • {{ tournament.playerCap }} joueurs</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3 border-t border-white/5 pt-4">
        <Button type="button" variant="ghost" @click="handleCancel">Annuler</Button>
        <Button type="submit" :disabled="isLoading || !seasonNumber">{{ isLoading ? 'En cours…' : isEditing ? 'Modifier' : 'Ajouter' }}</Button>
      </div>
    </form>
  </Card>
</template>