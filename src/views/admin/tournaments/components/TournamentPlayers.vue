<script setup lang="ts">
import { Button, Card } from '@/components/ui';
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
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card class="p-4 bg-christmas-navy/30 border-2 border-christmas-gold/20">
        <p class="text-xs text-christmas-gold-light/70 mb-1 flex items-center gap-1">
          <VueIcon name="cl:users" />
          Total
        </p>
        <p class="text-2xl font-bold text-christmas-gold">{{ tournament.players.length }}</p>
      </Card>
      <Card class="p-4 bg-christmas-navy/30 border-2 border-christmas-gold/20">
        <p class="text-xs text-christmas-gold-light/70 mb-1 flex items-center gap-1">
          <VueIcon name="bs:check-circle" />
          Check-in
        </p>
        <p class="text-2xl font-bold text-christmas-gold">{{ checkinCount }}</p>
      </Card>
      <Card class="p-4 bg-christmas-navy/30 border-2 border-christmas-gold/20">
        <p class="text-xs text-christmas-gold-light/70 mb-1 flex items-center gap-1">
          <VueIcon name="bs:hourglass-split" />
          Liste d'attente
        </p>
        <p class="text-2xl font-bold text-christmas-gold">{{ waitlistCount }}</p>
      </Card>
      <Card class="p-4 bg-christmas-navy/30 border-2 border-christmas-gold/20">
        <p class="text-xs text-christmas-gold-light/70 mb-1 flex items-center gap-1">
          <VueIcon name="bs:person-plus" />
          Places libres
        </p>
        <p class="text-2xl font-bold text-christmas-gold">{{ tournament.playerCap - tournament.players.length }}</p>
      </Card>
    </div>

    <!-- Filters & Actions -->
    <Card class="p-4 bg-gradient-to-r from-christmas-gold/10 to-christmas-red/5 border-2 border-christmas-gold/30">
      <div class="space-y-3">
        <div class="flex flex-col md:flex-row gap-3 items-start md:items-end">
          <!-- Search -->
          <div class="flex-1 w-full">
            <label class="block text-christmas-gold font-bold text-sm mb-2">Rechercher</label>
            <div class="relative">
              <VueIcon name="bs:search" class="absolute left-3 top-2.5 text-christmas-gold-light/50" />
              <input 
                v-model="searchQuery"
                type="text"
                placeholder="Nom du joueur..."
                class="w-full bg-christmas-navy border-2 border-christmas-gold/30 text-christmas-gold rounded-lg pl-9 pr-3 py-2 focus:border-christmas-gold outline-none placeholder-christmas-gold-light/30"
              />
            </div>
          </div>

          <!-- Filter -->
          <div>
            <label class="block text-christmas-gold font-bold text-sm mb-2">Filtre</label>
            <select
              v-model="filterCheckin"
              class="bg-christmas-navy border-2 border-christmas-gold/30 text-christmas-gold rounded-lg px-3 py-2 focus:border-christmas-gold outline-none"
            >
              <option value="all">Tous les joueurs</option>
              <option value="checkin">Check-in effectué</option>
              <option value="no-checkin">Pas de check-in</option>
            </select>
          </div>

          <!-- Add Player Button -->
          <Button 
            @click="showAddPlayer = !showAddPlayer"
            :class="['flex items-center gap-2', showAddPlayer ? 'bg-christmas-red/20 text-christmas-red' : '']"
          >
            <VueIcon name="bs:person-plus" />
            Ajouter joueur
          </Button>
        </div>

        <!-- Add Player Form -->
        <transition name="expand">
          <div v-if="showAddPlayer" class="p-4 bg-christmas-navy/30 border border-christmas-gold/30 rounded-lg space-y-3">
            <div class="flex gap-2">
              <select
                v-model="selectedUserToAdd"
                :disabled="availableUsersToAdd.length === 0"
                class="flex-1 bg-christmas-navy border-2 border-christmas-gold/30 text-christmas-gold rounded-lg px-3 py-2 focus:border-christmas-gold outline-none"
              >
                <option value="">-- Sélectionnez un joueur --</option>
                <option v-for="user in availableUsersToAdd" :key="user.id" :value="user.id">
                  {{ user.username }}
                </option>
              </select>
              <Button 
                @click="addPlayer"
                :disabled="!selectedUserToAdd || isLoading"
                color="christmas-gold"
                class="flex items-center gap-2"
              >
                <VueIcon name="bs:check-circle" />
                Ajouter
              </Button>
              <Button 
                @click="showAddPlayer = false"
                :disabled="isLoading"
                class="bg-christmas-red/20 text-christmas-red hover:bg-christmas-red/30"
              >
                <VueIcon name="bs:x-circle" />
              </Button>
            </div>
            <p v-if="availableUsersToAdd.length === 0" class="text-xs text-christmas-gold-light/70">
              Aucun joueur disponible à ajouter.
            </p>
          </div>
        </transition>
      </div>
    </Card>

    <!-- Players List -->
    <div class="space-y-2">
      <h3 class="text-lg font-bold text-christmas-gold flex items-center gap-2">
        <VueIcon name="cl:users" />
        Joueurs ({{ filteredPlayers.length }})
      </h3>

      <div v-if="filteredPlayers.length === 0" class="flex items-center justify-center py-16">
        <Card class="p-8 text-center max-w-md border-2 border-christmas-gold/30">
          <VueIcon name="bs:inbox" class="text-6xl text-christmas-gold/30 mx-auto mb-4" />
          <h3 class="text-xl font-bold text-christmas-gold mb-2">Aucun joueur trouvé</h3>
          <p class="text-christmas-gold-light">Aucun joueur ne correspond à votre recherche.</p>
        </Card>
      </div>

      <div class="grid grid-cols-1 gap-2">
        <Card 
          v-for="player in filteredPlayers"
          :key="player.id"
          class="p-4 border-2 border-christmas-gold/30 hover:border-christmas-gold hover:shadow-lg hover:shadow-christmas-gold/20 transition-all bg-christmas-navy"
        >
          <div class="flex items-start justify-between gap-4">
            <!-- Player Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <h4 class="text-lg font-bold text-christmas-gold truncate">{{ player.user.username }}</h4>
                <span v-if="player.inWaitlist" class="text-xs bg-christmas-gold/20 text-christmas-gold px-2 py-1 rounded font-bold whitespace-nowrap">
                  Liste d'attente
                </span>
              </div>
              <p class="text-sm text-christmas-gold-light/70 mb-2">
                Niveau: <span class="font-bold text-christmas-gold">{{ getPlayerLevel(player.user.id) }}</span>
                • Tier: <span class="font-bold text-christmas-gold">{{ player.tier }}</span>
              </p>
              <p v-if="player.description" class="text-sm text-christmas-gold-light/70 italic mb-2">
                📝 {{ player.description }}
              </p>
              <p class="text-xs text-christmas-gold-light/50">
                Inscrit le {{ formatDate(player.registrationDate) }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex flex-col gap-2 flex-shrink-0">
              <Button 
                @click="toggleCheckin(player.id, player.hasCheckin)"
                :disabled="isLoading"
                :class="[
                  'flex items-center gap-1 text-sm px-3 py-2 rounded-lg transition-all',
                  player.hasCheckin
                    ? 'bg-christmas-pine/20 hover:bg-christmas-pine/30'
                    : 'bg-christmas-gold/20 hover:bg-christmas-gold/30'
                ]"
              >
                <VueIcon :name="player.hasCheckin ? 'bs:check-circle-fill' : 'bs:circle'" />
                {{ player.hasCheckin ? 'Check-in' : 'Pas check-in' }}
              </Button>
              <Button 
                @click="removePlayer(player.id, player.user.username)"
                :disabled="isLoading"
                class="flex items-center gap-1 text-sm px-3 py-2 bg-christmas-red/20 text-christmas-red hover:bg-christmas-red/30"
              >
                <VueIcon name="bs:trash" />
                Retirer
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
