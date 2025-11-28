<script setup lang="ts">
import { Button, Card } from '@/components/ui';
import useAdminStore from '@/stores/adminStore';
import { useToastStore } from '@/stores/toastStore';
import type { Tournament, TournamentFormData } from '@/types/models';
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

// Fonction pour formater une date en datetime-local
const formatDateTime = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('sv-SE', { hour12: false }).replace(' ', 'T');
};

// Fonction pour calculer les dates de rappel
const calculateReminderDates = (tournamentDate: string) => {
  if (!tournamentDate) {
    return { discord: '', private: '' };
  }

  const date = new Date(tournamentDate);
  
  // Discord reminder: 2 jours avant à 12h
  const discordDate = new Date(date);
  discordDate.setDate(discordDate.getDate() - 2);
  discordDate.setHours(12, 0, 0, 0);
  
  // Private reminder: 1 jour avant à 12h
  const privateDate = new Date(date);
  privateDate.setDate(privateDate.getDate() - 1);
  privateDate.setHours(12, 0, 0, 0);

  return {
    discord: discordDate.toLocaleString('sv-SE', { hour12: false }).replace(' ', 'T'),
    private: privateDate.toLocaleString('sv-SE', { hour12: false }).replace(' ', 'T')
  };
};

// Initialiser le formulaire avec les données du tournoi si édition
watch(
  () => props.tournament,
  (tournament) => {
    if (tournament) {
      formData.value = {
        name: tournament.name,
        gameId: tournament.gameId,
        date: formatDateTime(tournament.date),
        playerCap: tournament.playerCap,
        description: tournament.description,
        discordChannelName: tournament.discordChannelName,
        discordReminderDate: formatDateTime(tournament.discordReminderDate),
        privateReminderDate: formatDateTime(tournament.privateReminderDate)
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

  if (!formData.value.discordChannelName) {
    toastStore.error('Le nom du salon discord est requis.');
    return;
  }

  emit('submit', formData.value);
};

const handleCancel = () => {
  emit('cancel');
};

// Watcher pour mettre à jour les dates de rappel quand la date du tournoi change
watch(
  () => formData.value.date,
  (newDate) => {
    if (newDate && !isEditMode.value) {
      const reminders = calculateReminderDates(newDate);
      formData.value.discordReminderDate = reminders.discord;
      formData.value.privateReminderDate = reminders.private;
    }
  }
);

// Fonction pour remplir manuellement les dates de rappel
const autoFillReminders = () => {
  if (!formData.value.date) {
    toastStore.error('Veuillez d\'abord sélectionner une date de tournoi.');
    return;
  }
  
  const reminders = calculateReminderDates(formData.value.date);
  formData.value.discordReminderDate = reminders.discord;
  formData.value.privateReminderDate = reminders.private;
  toastStore.success('Dates de rappel remplies automatiquement.');
};</script>

<template>
  <Card class="glass-panel p-6 space-y-6">
    <div class="flex items-center gap-3">
      <span class="rounded-2xl bg-white/5 p-3">
        <VueIcon :name="isEditMode ? 'bs:pencil' : 'bs:plus-circle'" class="text-accent-300" />
      </span>
      <div>
        <p class="text-xs uppercase tracking-[0.4em] text-foam-300/70">{{ isEditMode ? 'Mise à jour' : 'Création' }}</p>
        <h2 class="hero-title text-2xl">{{ isEditMode ? 'Éditer le tournoi' : 'Créer un tournoi' }}</h2>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-5">
      <!-- Nom -->
      <div>
        <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Nom du tournoi *</label>
        <input
          v-model="formData.name"
          type="text"
          placeholder="Ex: Tournament S1 - CS2"
          class="form-input"
        />
      </div>

      <!-- Jeu -->
      <div>
        <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Jeu *</label>
        <select v-model="formData.gameId" class="form-input">
          <option value="">-- Sélectionner un jeu --</option>
          <option v-for="game in availableGames" :key="game.id" :value="game.id">{{ game.name }}</option>
        </select>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Date du tournoi *</label>
          <input v-model="formData.date" type="datetime-local" class="form-input" />
        </div>
        <div>
          <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Nombre de joueurs *</label>
          <input v-model.number="formData.playerCap" type="number" min="0" class="form-input" />
        </div>
      </div>

      <div>
        <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Salon Discord *</label>
        <input v-model="formData.discordChannelName" type="text" class="form-input" placeholder="Ex: tournament-s1" />
      </div>

      <div>
        <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Description</label>
        <textarea v-model="formData.description" rows="4" class="form-input" placeholder="Détails du tournoi..."></textarea>
      </div>

      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Dates de rappel</p>
          <Button type="button" size="sm" variant="ghost" class="gap-2" @click="autoFillReminders">
            <VueIcon name="bs:lightning-fill" /> Remplir auto
          </Button>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Rappel Discord</label>
            <input v-model="formData.discordReminderDate" type="datetime-local" class="form-input" />
            <p class="mt-1 text-xs text-foam-300/60">Rappel à envoyer sur Discord</p>
          </div>
          <div>
            <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Rappel privé</label>
            <input v-model="formData.privateReminderDate" type="datetime-local" class="form-input" />
            <p class="mt-1 text-xs text-foam-300/60">Rappel privé aux joueurs</p>
          </div>
        </div>
      </div>

      <div class="flex gap-3 border-t border-white/5 pt-4">
        <Button type="submit" :disabled="isSubmitting || props.isLoading" class="flex-1 gap-2">
          <VueIcon :name="isEditMode ? 'bs:check-circle' : 'bs:plus-circle'" />
          {{ isEditMode ? 'Mettre à jour' : 'Créer' }}
        </Button>
        <Button v-if="!isEditMode" type="reset" variant="ghost" class="flex-1" :disabled="isSubmitting || props.isLoading" @click="handleCancel">
          Annuler
        </Button>
      </div>

      <p class="text-center text-xs text-foam-300/60">* Champs obligatoires</p>
    </form>
  </Card>
</template>

<style scoped>
select.form-input {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23cbd5f5' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2rem;
}
</style>