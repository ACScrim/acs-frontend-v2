<script setup lang="ts">
import { Button, Card } from '@/components/ui';
import useAdminStore from '@/stores/adminStore';
import { useToastStore } from '@/stores/toastStore';
import type { Tournament, Game, TournamentFormData } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { computed, onMounted, ref, watch } from 'vue';

interface Props {
  tournament?: Tournament;
  isLoading?: boolean;
}

onMounted(() => {
  adminStore.fetchGames();
});

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
});

const emit = defineEmits<{
  submit: [data: TournamentFormData];
  cancel: [];
}>();

const adminStore = useAdminStore();
const toastStore = useToastStore();

const isSubmitting = ref(false);
const formData = ref<TournamentFormData>({
  name: '',
  gameId: '',
  date: '',
  playerCap: 0,
  description: '',
  discordChannelName: '',
  discordReminderDate: '',
  privateReminderDate: ''
});

const isEditMode = computed(() => !!props.tournament);

const availableGames = computed(() => adminStore.games);

// Initialiser le formulaire avec les données du tournoi si édition
watch(
  () => props.tournament,
  (tournament) => {
    if (tournament) {
      formData.value = {
        name: tournament.name,
        gameId: tournament.gameId,
        date: tournament.date.split('T')[0] ?? '',
        playerCap: tournament.playerCap,
        description: tournament.description,
        discordChannelName: tournament.discordChannelName,
        discordReminderDate: tournament.discordReminderDate?.split('T')[0] ?? '',
        privateReminderDate: tournament.privateReminderDate?.split('T')[0] ?? ''
      };
    }
  },
  { immediate: true }
);

const handleSubmit = async () => {
  // Validation
  if (!formData.value.name.trim()) {
    toastStore.error('Le nom du tournoi est requis.');
    return;
  }

  if (!formData.value.gameId) {
    toastStore.error('Un jeu doit être sélectionné.');
    return;
  }

  if (!formData.value.date) {
    toastStore.error('La date du tournoi est requise.');
    return;
  }

  if (formData.value.playerCap <= 0) {
    toastStore.error('Le nombre de joueurs doit être supérieur à 0.');
    return;
  }

  emit('submit', formData.value);
};

const handleCancel = () => {
  emit('cancel');
};

const getGameName = (gameId: string): string => {
  return availableGames.value.find(g => g.id === gameId)?.name ?? '';
};
</script>

<template>
  <Card class="p-6">
    <h2 class="text-2xl font-bold text-christmas-gold mb-6 flex items-center gap-2">
      <VueIcon :name="isEditMode ? 'bs:pencil' : 'bs:plus-circle'" />
      {{ isEditMode ? 'Éditer le tournoi' : 'Créer un tournoi' }}
    </h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Nom -->
      <div>
        <label class="block text-christmas-gold font-bold text-sm mb-2">Nom du tournoi *</label>
        <input
          v-model="formData.name"
          type="text"
          placeholder="Ex: Tournament S1 - CS2"
          class="w-full bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-3 py-2 text-sm focus:border-christmas-gold outline-none placeholder-christmas-gold-light/30"
        />
      </div>

      <!-- Jeu -->
      <div>
        <label class="block text-christmas-gold font-bold text-sm mb-2">Jeu *</label>
        <select
          v-model="formData.gameId"
          class="w-full bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-3 py-2 text-sm focus:border-christmas-gold outline-none"
        >
          <option value="">-- Sélectionner un jeu --</option>
          <option v-for="game in availableGames" :key="game.id" :value="game.id">
            {{ game.name }}
          </option>
        </select>
      </div>

      <!-- Grille 2 colonnes -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Date -->
        <div>
          <label class="block text-christmas-gold font-bold text-sm mb-2">Date du tournoi *</label>
          <input
            v-model="formData.date"
            type="date"
            class="w-full bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-3 py-2 text-sm focus:border-christmas-gold outline-none"
          />
        </div>

        <!-- Capacité joueurs -->
        <div>
          <label class="block text-christmas-gold font-bold text-sm mb-2">Nombre de joueurs *</label>
          <input
            v-model.number="formData.playerCap"
            type="number"
            min="1"
            placeholder="Ex: 32"
            class="w-full bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-3 py-2 text-sm focus:border-christmas-gold outline-none placeholder-christmas-gold-light/30"
          />
        </div>
      </div>

      <!-- Discord Channel Name -->
      <div>
        <label class="block text-christmas-gold font-bold text-sm mb-2">Salon Discord</label>
        <input
          v-model="formData.discordChannelName"
          type="text"
          placeholder="Ex: tournament-s1"
          class="w-full bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-3 py-2 text-sm focus:border-christmas-gold outline-none placeholder-christmas-gold-light/30"
        />
      </div>

      <!-- Description -->
      <div>
        <label class="block text-christmas-gold font-bold text-sm mb-2">Description</label>
        <textarea
          v-model="formData.description"
          rows="4"
          placeholder="Détails du tournoi..."
          class="w-full bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-3 py-2 text-sm focus:border-christmas-gold outline-none placeholder-christmas-gold-light/30 resize-none"
        />
      </div>

      <!-- Grille 2 colonnes pour les dates de rappel -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Discord Reminder Date -->
        <div>
          <label class="block text-christmas-gold font-bold text-sm mb-2">Rappel Discord</label>
          <input
            v-model="formData.discordReminderDate"
            type="date"
            class="w-full bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-3 py-2 text-sm focus:border-christmas-gold outline-none"
          />
          <p class="text-xs text-christmas-gold-light/70 mt-1">Rappel à envoyer sur Discord</p>
        </div>

        <!-- Private Reminder Date -->
        <div>
          <label class="block text-christmas-gold font-bold text-sm mb-2">Rappel privé</label>
          <input
            v-model="formData.privateReminderDate"
            type="date"
            class="w-full bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-3 py-2 text-sm focus:border-christmas-gold outline-none"
          />
          <p class="text-xs text-christmas-gold-light/70 mt-1">Rappel privé aux joueurs</p>
        </div>
      </div>

      <!-- Boutons -->
      <div class="flex gap-3 pt-4 border-t border-christmas-gold/20">
        <Button
          type="submit"
          :disabled="isSubmitting || props.isLoading"
          color="christmas-gold"
          class="flex-1 flex items-center justify-center gap-2"
        >
          <VueIcon :name="isEditMode ? 'bs:check-circle' : 'bs:plus-circle'" />
          {{ isEditMode ? 'Mettre à jour' : 'Créer' }}
        </Button>
        <Button
          v-if="!isEditMode"
          type="reset"
          @click="handleCancel"
          :disabled="isSubmitting || props.isLoading"
          class="flex-1 flex items-center justify-center gap-2 bg-christmas-red/20 text-christmas-red hover:bg-christmas-red/30"
        >
          <VueIcon name="bs:x-circle" />
          Annuler
        </Button>
      </div>

      <p class="text-xs text-christmas-gold-light/70 text-center">
        * Champs obligatoires
      </p>
    </form>
  </Card>
</template>

<style scoped>
select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23D4AF37' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  padding-right: 2rem;
}
</style>