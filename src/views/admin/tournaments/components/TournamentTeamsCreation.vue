<script setup lang="ts">
import { Button, Card } from '@/components/ui';
import useAdminStore from '@/stores/adminStore';
import { useToastStore } from '@/stores/toastStore';
import type { Tournament, TournamentPlayer } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { computed, onMounted, ref } from 'vue';

interface Team {
  name: string;
  players: TournamentPlayer[];
}

const props = defineProps<{ tournament: Tournament }>();

const emit = defineEmits<{
  saved: [];
}>();

const adminStore = useAdminStore();

onMounted(() => {
  recalculateTeamCount();
  teams.value = props.tournament.teams.map(t => ({
    name: t.name,
    players: props.tournament.players.filter(p => t.users.some(u => u.id === p.user.id))
  }));
});

// État local
const teams = ref<Team[]>([]);
const draggedPlayer = ref<TournamentPlayer | null>(null);
const playersPerTeam = ref<number>(5);
const teamCount = ref<number>(0);
const dragOverTeamIndex = ref<number | null>(null);

// Initialiser les joueurs disponibles
const availablePlayers = computed(() => {
  const assignedPlayerIds = new Set(
    teams.value.flatMap(t => t.players.map(p => p.id))
  );
  return props.tournament.players.filter(p => !assignedPlayerIds.has(p.id)) ?? [];
});

// Calculer le tier moyen nécessaire
const averageTierPerTeam = computed(() => {
  if (teams.value.length === 0 || props.tournament.players.length === 0) return 0;
  const totalTier = props.tournament.players.reduce((sum, p) => sum + parseInt(p.tier), 0);
  return (totalTier / teams.value.length).toFixed(2);
});

// Calculer le tier moyen d'une équipe
const getTeamAverageTier = (team: Team) => {
  if (team.players.length === 0) return 0;
  const sum = team.players.reduce((acc, p) => acc + parseInt(p.tier), 0);
  return (sum / team.players.length).toFixed(2);
};

// Calculer le tier total d'une équipe
const getTeamTotalTier = (team: Team) => {
  return team.players.reduce((sum, p) => sum + parseInt(p.tier), 0);
};

// Générer les équipes
const generateTeams = () => {
  teams.value = Array.from({ length: teamCount.value }, (_, i) => ({
    name: `Équipe ${i + 1}`,
    players: []
  }));
};

// Recalculer le nombre d'équipes
const recalculateTeamCount = () => {
  if (playersPerTeam.value > 0 && props.tournament) {
    teamCount.value = Math.max(2, Math.ceil(props.tournament.playerCap / playersPerTeam.value));
  }
};

// Drag & drop handlers
const onDragStart = (player: TournamentPlayer) => {
  draggedPlayer.value = player;
};

const onDragOver = (e: DragEvent) => {
  e.preventDefault();
};

const onDropToTeam = (team: Team, teamIndex: number) => {
  dragOverTeamIndex.value = null;
  if (!draggedPlayer.value) return;

  if (team.players.length >= playersPerTeam.value) {
    useToastStore().error(`L'équipe ${team.name} est pleine.`);
    return;
  }
  
  const alreadyInTeam = teams.value.some(t => 
    t.players.some(p => p.id === draggedPlayer.value!.id)
  );
  
  if (alreadyInTeam) {
    teams.value.forEach(t => {
      t.players = t.players.filter(p => p.id !== draggedPlayer.value!.id);
    });
  }

  team.players.push(draggedPlayer.value);
  draggedPlayer.value = null;
};

const onDropToAvailable = () => {
  if (!draggedPlayer.value) return;
  teams.value.forEach(team => {
    team.players = team.players.filter(p => p.id !== draggedPlayer.value!.id);
  });
  draggedPlayer.value = null;
};

const removePlayerFromTeam = (team: Team, playerId: string) => {
  team.players = team.players.filter(p => p.id !== playerId);
};

const updatePlayerTier = (player: TournamentPlayer, tier: string) => {
  player.tier = tier;
  adminStore.updateTournamentPlayer(props.tournament.id, player.id, { tier });
};

const updatePlayerDescription = (player: TournamentPlayer, description: string) => {
  player.description = description;
  adminStore.updateTournamentPlayer(props.tournament.id, player.id, { description });
};

const saveTournamentTeams = async () => {
  try {
    const formattedTeams = teams.value.map(team => ({
      name: team.name,
      users: team.players.map(p => p.user.id)
    }));
    await adminStore.saveTournamentTeams(props.tournament.id, formattedTeams);
    useToastStore().success('Équipes sauvegardées avec succès.');
  } catch (error) {
    useToastStore().error('Erreur lors de la sauvegarde des équipes.');
  }
};

const publishTournamentTeams = async () => {
  try {
    if (availablePlayers.value.length > 0) {
      useToastStore().error('Tous les joueurs doivent être assignés.');
      return;
    }
    await saveTournamentTeams();
    await adminStore.publishTournamentTeams(props.tournament.id, true);
    useToastStore().success('Équipes publiées avec succès.');
  } catch (error) {
    useToastStore().error('Erreur lors de la publication des équipes.');
  }
};

const getPlayerLevel = (player: TournamentPlayer): string => {
  return adminStore.playerLevels.find(l => 
    l.gameId === props.tournament.gameId && l.userId === player.user.id
  )?.level ?? 'Non défini';
};

// Auto-balance teams
const autoBalanceTeams = () => {
  const allPlayers = [...props.tournament.players].sort((a, b) => parseInt(b.tier) - parseInt(a.tier));
  teams.value.forEach(t => t.players = []);
  
  let teamIndex = 0;
  allPlayers.forEach((player, index) => {
    const currentTeam = teams.value[teamIndex];
    const found = props.tournament.players.find(p => p.id === player.id);
    if (found && currentTeam.players.length < playersPerTeam.value) {
      currentTeam.players.push(found);
    }
    if ((index + 1) % playersPerTeam.value === 0 && teamIndex < teams.value.length - 1) {
      teamIndex++;
    }
  });
  
  useToastStore().success('Équipes équilibrées automatiquement.');
};
</script>

<template>
  <div class="space-y-6">
    <!-- Configuration Panel -->
    <Card class="p-6 bg-gradient-to-r from-christmas-gold/10 to-christmas-red/5 border-christmas-gold/30">
      <template #header>
        <h3 class="text-lg font-bold text-christmas-gold flex items-center gap-2">
          <VueIcon name="bs:sliders" />
          Configuration des équipes
        </h3>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-christmas-gold font-bold text-sm mb-2">Joueurs par équipe</label>
          <input 
            v-model.number="playersPerTeam"
            @change="recalculateTeamCount"
            type="number"
            min="1"
            class="w-full bg-christmas-navy border-2 border-christmas-gold/30 text-christmas-gold rounded-lg px-3 py-2 focus:border-christmas-gold outline-none font-bold text-lg"
          />
          <p class="text-xs text-christmas-gold-light/70 mt-2">
            <VueIcon name="bs:arrow-right" class="inline" />
            {{ teamCount }} équipe(s)
          </p>
        </div>

        <div>
          <label class="block text-christmas-gold font-bold text-sm mb-2">Joueurs restants</label>
          <div class="text-3xl font-bold text-christmas-gold">{{ availablePlayers.length }}</div>
          <p class="text-xs text-christmas-gold-light/70 mt-2">à assigner</p>
        </div>

        <div>
          <label class="block text-christmas-gold font-bold text-sm mb-2">Tier moyen/équipe</label>
          <div class="text-3xl font-bold text-christmas-gold">{{ averageTierPerTeam }}</div>
          <p class="text-xs text-christmas-gold-light/70 mt-2">pour équilibre</p>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <Button v-if="teams.length === 0" @click="generateTeams" color="christmas-gold" class="flex items-center gap-2">
          <VueIcon name="bs:plus-circle" />
          Générer équipes
        </Button>
        <Button v-if="teams.length > 0" @click="autoBalanceTeams" class="flex items-center gap-2 bg-christmas-pine/20 text-christmas-pine hover:bg-christmas-pine/30">
          <VueIcon name="bs:arrow-left-right" />
          Équilibrage auto
        </Button>
        <Button v-if="teams.length > 0" @click="saveTournamentTeams" class="flex items-center gap-2">
          <VueIcon name="bs:check-circle" />
          Sauvegarder
        </Button>
        <Button v-if="availablePlayers.length === 0 && teams.length > 0" @click="publishTournamentTeams" color="christmas-gold" class="flex items-center gap-2">
          <VueIcon name="bs:rocket" />
          Publier
        </Button>
      </div>
    </Card>

    <!-- Main Grid Layout -->
    <div v-if="teams.length > 0" class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Players Available - Left Sidebar -->
      <div class="lg:col-span-1">
        <Card class="p-4 sticky top-6 max-h-[70vh] overflow-hidden flex flex-col">
          <template #header>
            <h3 class="font-bold text-christmas-gold flex items-center gap-2">
              <VueIcon name="cl:users" />
              Disponibles
              <span class="ml-auto bg-christmas-gold text-christmas-navy rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {{ availablePlayers.length }}
              </span>
            </h3>
          </template>

          <div class="flex-1 overflow-y-auto space-y-2">
            <div 
              v-for="player in availablePlayers"
              :key="player.id"
              draggable="true"
              @dragstart="onDragStart(player)"
              @dragover="onDragOver"
              @drop="onDropToAvailable"
              class="p-3 bg-christmas-navy/50 border-2 border-christmas-gold/30 rounded-lg cursor-grab hover:border-christmas-gold hover:bg-christmas-navy/70 hover:shadow-lg hover:shadow-christmas-gold/20 transition-all active:cursor-grabbing"
            >
              <div class="flex items-start justify-between gap-2 mb-2">
                <div class="flex-1 min-w-0">
                  <p class="font-bold text-christmas-snow text-sm truncate">{{ player.user.username }}</p>
                  <p class="text-xs text-christmas-gold-light/70">{{ getPlayerLevel(player) }}</p>
                </div>
                <span class="flex-shrink-0 text-xs bg-christmas-gold/20 text-christmas-gold px-2 py-1 rounded font-bold">
                  {{ player.tier }}
                </span>
              </div>
              
              <div class="space-y-2 text-xs">
                <div>
                  <input 
                    :value="player.tier"
                    @input.stop="(e) => updatePlayerTier(player, (e.target as HTMLInputElement).value)"
                    type="number"
                    min="1"
                    max="10"
                    class="w-full bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-2 py-1 focus:border-christmas-gold outline-none"
                  />
                </div>
                
                <input 
                  :value="player.description ?? ''"
                  @input.stop="(e) => updatePlayerDescription(player, (e.target as HTMLInputElement).value)"
                  type="text"
                  placeholder="Notes..."
                  class="w-full bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-2 py-1 text-xs focus:border-christmas-gold outline-none placeholder-christmas-gold-light/30"
                />
              </div>
            </div>

            <div v-if="availablePlayers.length === 0" class="flex items-center justify-center h-32 text-christmas-gold-light/50 text-center">
              <div>
                <VueIcon name="bs:check-circle" class="text-3xl mb-2 mx-auto" />
                <p class="text-sm font-medium">Tous assignés!</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Teams Grid - Main Content -->
      <div class="lg:col-span-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card 
            v-for="(team, index) in teams"
            :key="index"
            @dragover="onDragOver"
            @drop="onDropToTeam(team, index)"
            @dragenter="dragOverTeamIndex = index"
            @dragleave="dragOverTeamIndex = null"
            :class="[
              'p-4 flex flex-col min-h-[500px] transition-all',
              dragOverTeamIndex === index ? 'border-christmas-gold bg-christmas-gold/5 shadow-lg shadow-christmas-gold/30' : 'border-dashed'
            ]"
          >
            <template #header>
              <div class="flex items-center justify-between w-full gap-3 mb-3">
                <input 
                  v-model="team.name" 
                  class="text-lg font-bold bg-transparent text-christmas-gold border-0 border-b-2 border-christmas-gold/30 focus:border-christmas-gold outline-none flex-1"
                />
                <div class="text-right">
                  <p class="text-xs text-christmas-gold-light/70">Joueurs</p>
                  <p class="text-2xl font-bold text-christmas-gold">{{ team.players.length }}/{{ playersPerTeam }}</p>
                </div>
              </div>
            </template>

            <!-- Stats -->
            <div v-if="team.players.length > 0" class="mb-4 p-3 bg-gradient-to-r from-christmas-gold/10 to-christmas-red/5 border border-christmas-gold/20 rounded-lg">
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p class="text-christmas-gold-light/70 text-xs">Tier moyen</p>
                  <p class="font-bold text-christmas-gold text-lg">{{ getTeamAverageTier(team) }}</p>
                </div>
                <div>
                  <p class="text-christmas-gold-light/70 text-xs">Total tiers</p>
                  <p class="font-bold text-christmas-gold text-lg">{{ getTeamTotalTier(team) }}</p>
                </div>
              </div>
            </div>

            <!-- Players List -->
            <div class="flex-1 space-y-2 overflow-y-auto">
              <div 
                v-for="player in team.players"
                :key="player.id"
                draggable="true"
                @dragstart="onDragStart(player)"
                class="group p-3 bg-gradient-to-r from-christmas-gold/15 to-christmas-red/10 border border-christmas-gold/30 rounded-lg cursor-grab hover:border-christmas-gold hover:from-christmas-gold/25 hover:to-christmas-red/20 hover:shadow-lg hover:shadow-christmas-gold/20 transition-all active:cursor-grabbing"
              >
                <div class="flex items-start justify-between gap-2 mb-2">
                  <div class="flex-1 min-w-0">
                    <p class="font-bold text-christmas-snow text-sm truncate">{{ player.user.username }}</p>
                    <p class="text-xs text-christmas-gold-light/70">{{ getPlayerLevel(player) }}</p>
                  </div>
                  <button
                    @click="removePlayerFromTeam(team, player.id)"
                    class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-christmas-red/30 rounded text-christmas-red"
                  >
                    <VueIcon name="bs:x-circle" class="text-lg" />
                  </button>
                </div>
                
                <div class="space-y-1.5 text-xs">
                  <div class="flex gap-2">
                    <input 
                      :value="player.tier"
                      @input.stop="(e) => updatePlayerTier(player, (e.target as HTMLInputElement).value)"
                      type="number"
                      min="1"
                      max="10"
                      class="flex-1 bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-2 py-1 focus:border-christmas-gold outline-none"
                      title="Tier"
                    />
                    <div class="px-2 py-1 bg-christmas-gold/20 text-christmas-gold rounded font-bold">
                      {{ player.tier }}
                    </div>
                  </div>
                  
                  <input 
                    :value="player.description ?? ''"
                    @input.stop="(e) => updatePlayerDescription(player, (e.target as HTMLInputElement).value)"
                    type="text"
                    placeholder="Notes..."
                    class="w-full bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-2 py-1 focus:border-christmas-gold outline-none placeholder-christmas-gold-light/30"
                  />
                </div>
              </div>

              <div v-if="team.players.length === 0" class="flex items-center justify-center h-32 text-christmas-gold-light/50">
                <div class="text-center">
                  <VueIcon name="bs:inbox" class="text-3xl mb-2 mx-auto" />
                  <p class="text-sm font-medium">Glissez des joueurs ici</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex items-center justify-center py-16">
      <Card class="p-8 text-center max-w-md">
        <VueIcon name="bs:diagram-3" class="text-6xl text-christmas-gold/30 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-christmas-gold mb-2">Aucune équipe générée</h3>
        <p class="text-christmas-gold-light mb-4">Configurez les paramètres et générez les équipes pour commencer.</p>
        <Button @click="generateTeams" color="christmas-gold" class="w-full">Générer équipes</Button>
      </Card>
    </div>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #D4AF37;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #E8C547;
}
</style>