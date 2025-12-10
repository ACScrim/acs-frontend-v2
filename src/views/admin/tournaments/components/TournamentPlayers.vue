<script setup lang="ts">
import {Badge, Button, Card} from '@/components/ui';
import useAdminStore from '@/stores/adminStore';
import { useToastStore } from '@/stores/toastStore';
import type { Tournament } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { computed, ref } from 'vue';

const props = defineProps<{
  tournament: Tournament;
}>();

const adminStore = useAdminStore();
const toastStore = useToastStore();

const searchQuery = ref<string>('');
const filterCheckin = ref<'all' | 'checkin' | 'no-checkin'>('all');
const showAddPlayer = ref(false);
const selectedUserToAdd = ref<string>('');
const isLoading = ref(false);

// Filtered players
const filteredPlayers = computed(() => {
  return props.tournament.players.filter(p => {
    const matchSearch = p.user.username.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchCheckin = 
      filterCheckin.value === 'all' ? true :
      filterCheckin.value === 'checkin' ? p.hasCheckin :
      !p.hasCheckin;
    return matchSearch && matchCheckin;
  });
});

// Available users to add (not already registered)
const availableUsersToAdd = computed(() => {
  const registeredIds = new Set(props.tournament.players.map(p => p.user.id));
  return (adminStore.users || []).filter(u => !registeredIds.has(u.id));
});

// Get player level
const getPlayerLevel = (userId: string): string => {
  return adminStore.playerLevels.find(l => 
    l.gameId === props.tournament.gameId && l.userId === userId
  )?.level ?? 'Non défini';
};

// Toggle check-in
const toggleCheckin = async (playerId: string, currentState: boolean) => {
  try {
    isLoading.value = true;
    await adminStore.updateTournamentPlayer(props.tournament.id, playerId, {
      hasCheckin: !currentState
    });
    toastStore.success(!currentState ? 'Check-in effectué.' : 'Check-in retiré.');
  } catch (error) {
    toastStore.error('Erreur lors de la modification du check-in.');
  } finally {
    isLoading.value = false;
  }
};

// Add player
const addPlayer = async () => {
  if (!selectedUserToAdd.value) {
    toastStore.error('Sélectionnez un joueur.');
    return;
  }

  try {
    isLoading.value = true;
    await adminStore.addTournamentPlayer(props.tournament.id, selectedUserToAdd.value);
    toastStore.success('Joueur ajouté au tournoi.');
    selectedUserToAdd.value = '';
    showAddPlayer.value = false;
  } catch (error) {
    toastStore.error('Erreur lors de l\'ajout du joueur.');
  } finally {
    isLoading.value = false;
  }
};

// Remove player
const removePlayer = async (playerId: string, playerName: string) => {
  if (confirm(`Êtes-vous sûr de vouloir retirer ${playerName} du tournoi ?`)) {
    try {
      isLoading.value = true;
      await adminStore.removeTournamentPlayer(props.tournament.id, playerId);
      toastStore.success('Joueur retiré du tournoi.');
    } catch (error) {
      toastStore.error('Erreur lors du retrait du joueur.');
    } finally {
      isLoading.value = false;
    }
  }
};

// Get registration date formatted
const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Count stats
const checkinCount = computed(() => props.tournament.players.filter(p => p.hasCheckin).length);
const waitlistCount = computed(() => props.tournament.players.filter(p => p.inWaitlist).length);
</script>

<template>
  <div class="space-y-6">
    <!-- Stats Cards -->
    <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Card class="glass-panel p-4 text-white">
        <p class="text-xs uppercase tracking-[0.4em] text-foam-300/70">Total</p>
        <p class="text-2xl font-semibold">{{ tournament.players.length }}</p>
      </Card>
      <Card class="glass-panel p-4 text-white">
        <p class="text-xs uppercase tracking-[0.4em] text-foam-300/70">Check-in</p>
        <p class="text-2xl font-semibold">{{ checkinCount }}</p>
      </Card>
      <Card class="glass-panel p-4 text-white">
        <p class="text-xs uppercase tracking-[0.4em] text-foam-300/70">Liste d'attente</p>
        <p class="text-2xl font-semibold">{{ waitlistCount }}</p>
      </Card>
      <Card class="glass-panel p-4 text-white">
        <p class="text-xs uppercase tracking-[0.4em] text-foam-300/70">Places libres</p>
        <p class="text-2xl font-semibold">{{ tournament.playerCap === 0 ? '∞' : tournament.playerCap - tournament.players.length }}</p>
      </Card>
    </div>

    <!-- Filters & Actions -->
    <Card class="glass-panel p-5">
      <div class="space-y-4">
        <div class="flex flex-col gap-4 md:flex-row md:items-end">
          <div class="flex-1">
            <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Rechercher</label>
            <div class="relative">
              <VueIcon name="bs:search" class="absolute left-3 top-3 text-foam-300/50" />
              <input v-model="searchQuery" type="text" placeholder="Nom du joueur..." class="form-input pl-10" />
            </div>
          </div>
          <div>
            <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Filtre</label>
            <select v-model="filterCheckin" class="form-input">
              <option value="all">Tous les joueurs</option>
              <option value="checkin">Check-in effectué</option>
              <option value="no-checkin">Pas de check-in</option>
            </select>
          </div>
          <Button @click="showAddPlayer = !showAddPlayer" class="gap-2">
            <VueIcon name="bs:person-plus" /> Ajouter joueur
          </Button>
        </div>

        <transition name="expand">
          <div v-if="showAddPlayer" class="rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-4 space-y-3">
            <div class="flex gap-2">
              <select v-model="selectedUserToAdd" :disabled="availableUsersToAdd.length === 0" class="form-input flex-1">
                <option value="">-- Sélectionnez un joueur --</option>
                <option v-for="user in availableUsersToAdd" :key="user.id" :value="user.id">{{ user.username }}</option>
              </select>
              <Button @click="addPlayer" :disabled="!selectedUserToAdd || isLoading" class="gap-2">
                <VueIcon name="bs:check-circle" /> Ajouter
              </Button>
              <Button variant="ghost" @click="showAddPlayer = false" :disabled="isLoading">
                <VueIcon name="bs:x-circle" />
              </Button>
            </div>
            <p v-if="availableUsersToAdd.length === 0" class="text-xs text-foam-300/70">Aucun joueur disponible à ajouter.</p>
          </div>
        </transition>
      </div>
    </Card>

    <!-- Players List -->
    <div class="space-y-3">
      <h3 class="text-sm uppercase tracking-[0.3em] text-foam-300/70 flex items-center gap-2">
        <VueIcon name="cl:users" /> Joueurs ({{ filteredPlayers.length }})
      </h3>
      <div v-if="filteredPlayers.length === 0" class="text-center text-foam-300/70">
        <Card class="glass-panel p-8">
          <VueIcon name="bs:inbox" class="mx-auto mb-4 text-4xl" /> Aucun joueur ne correspond à votre recherche.
        </Card>
      </div>
      <div v-else class="space-y-3">
        <Card v-for="player in filteredPlayers" :key="player.id" class="glass-panel border-white/10 bg-white/5 p-5">
          <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <h4 class="text-lg font-semibold text-white truncate">{{ player.user.username }}</h4>
                <Badge v-if="player.inWaitlist" tone="accent" size="sm">Liste d'attente</Badge>
              </div>
              <p class="text-sm text-foam-300/80 mt-2">
                Niveau <span class="text-white font-semibold">{{ getPlayerLevel(player.user.id) }}</span>
                · Tier <span class="text-white font-semibold">{{ player.tier }}</span>
              </p>
              <p v-if="player.description" class="text-xs text-foam-300/60 mt-1">📝 {{ player.description }}</p>
              <p class="text-xs text-foam-300/50 mt-2">Inscrit le {{ formatDate(player.registrationDate) }}</p>
            </div>
            <div class="flex flex-shrink-0 flex-col gap-2">
              <Button @click="toggleCheckin(player.id, player.hasCheckin)" :disabled="isLoading" :variant="player.hasCheckin ? 'secondary' : 'outline'" size="sm" class="gap-2">
                <VueIcon :name="player.hasCheckin ? 'bs:check-circle-fill' : 'bs:circle'" />
                {{ player.hasCheckin ? 'Check-in' : 'Pas check-in' }}
              </Button>
              <Button @click="removePlayer(player.id, player.user.username)" :disabled="isLoading" variant="danger" size="sm" class="gap-2">
                <VueIcon name="bs:trash" /> Retirer
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23D4AF37' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  padding-right: 2rem;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
