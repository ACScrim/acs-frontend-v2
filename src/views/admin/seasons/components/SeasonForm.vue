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
  console.log(seasonNumber.value)
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
  <Card class="bg-christmas-navy/50 border-2 border-christmas-gold/30 p-6">
    <template #header>
      <h2 class="text-2xl font-bold bg-gradient-to-r from-christmas-gold via-christmas-gold-light to-christmas-gold bg-clip-text text-transparent flex items-center gap-2">
        <VueIcon :name="isEditing ? 'bs:pencil-square' : 'bs:plus-circle'" class="text-christmas-gold" />
        {{ isEditing ? 'Modifier la saison' : 'Ajouter une saison' }}
      </h2>
    </template>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Numéro de saison -->
      <div>
        <label class="block text-christmas-gold font-bold text-sm mb-2">Numéro de saison *</label>
        <input
          v-model="seasonNumber"
          type="number"
          placeholder="Ex: 1, 2, 3..."
          min="0"
          class="w-full bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-3 py-2 text-sm focus:border-christmas-gold outline-none placeholder-christmas-gold-light/30"
          :disabled="isEditing"
        />
      </div>

      <!-- Sélection des tournois -->
      <div class="border-t border-christmas-gold/20 pt-4">
        <h3 class="text-christmas-gold font-bold text-sm mb-3 flex items-center gap-2">
          <VueIcon name="bs:trophy-fill" />
          Tournois de la saison
        </h3>

        <div v-if="availableTournaments.length === 0" class="text-christmas-gold-light/50 text-sm italic p-4 bg-christmas-navy/30 rounded">
          Aucun tournoi disponible. Créez d'abord des tournois.
        </div>

        <div v-else class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="tournament in availableTournaments"
            :key="tournament.id"
            class="flex items-center gap-3 p-3 bg-christmas-navy/30 rounded-lg border border-christmas-gold/20 hover:border-christmas-gold/50 transition-colors cursor-pointer"
            @click="toggleTournament(tournament.id)"
          >
            <input
              type="checkbox"
              :checked="selectedTournaments.includes(tournament.id)"
              class="w-4 h-4 cursor-pointer"
              @change="toggleTournament(tournament.id)"
            />
            <div class="flex-1">
              <p class="text-christmas-gold font-medium">{{ tournament.name }}</p>
              <p class="text-xs text-christmas-gold-light/70">
                {{ new Date(tournament.date).toLocaleDateString('fr-FR') }} • {{ tournament.playerCap }} joueurs
              </p>
            </div>
            <span
              v-if="selectedTournaments.includes(tournament.id)"
              class="text-christmas-gold"
            >
              <VueIcon name="bs:check-circle-fill" />
            </span>
          </div>
        </div>

        <p class="text-xs text-christmas-gold-light/70 mt-2 flex items-center gap-2">
          <VueIcon name="bs:info-circle" />
          {{ selectedTournaments.length }} tournoi(s) sélectionné(s)
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3 pt-4 border-t border-christmas-gold/20">
        <Button
          type="button"
          @click="handleCancel"
          color="christmas-red"
          class="flex items-center gap-2"
        >
          <VueIcon name="bs:x-circle" />
          Annuler
        </Button>
        <Button
          type="submit"
          :disabled="isLoading || !seasonNumber"
          class="flex items-center gap-2"
        >
          <VueIcon :name="isLoading ? 'bs:hourglass-split' : (isEditing ? 'bs:check-circle' : 'bs:plus-circle')" :class="{ 'animate-spin': isLoading }" />
          {{ isLoading ? 'En cours...' : (isEditing ? 'Modifier' : 'Ajouter') }}
        </Button>
      </div>
    </form>
  </Card>
</template>
