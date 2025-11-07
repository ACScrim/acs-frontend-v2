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

// Initialiser les joueurs disponibles (non assignés à une équipe)
const availablePlayers = computed(() => {
  const assignedPlayerIds = new Set(
    teams.value.flatMap(t => t.players.map(p => p.id))
  );
  return props.tournament.players.filter(p => !assignedPlayerIds.has(p.id)) ?? [];
});

// Calculer le tier moyen nécessaire par équipe
const averageTierPerTeam = computed(() => {
  if (teams.value.length === 0 || props.tournament.players.length === 0) return 0;
  const totalTier = props.tournament.players.reduce((sum, p) => sum + parseInt(p.tier), 0);
  return (totalTier / teams.value.length).toFixed(2);
});

// Calculer le tier moyen de chaque équipe
const getTeamAverageTier = (team: Team) => {
  if (team.players.length === 0) return 0;
  const sum = team.players.reduce((acc, p) => acc + parseInt(p.tier), 0);
  return (sum / team.players.length).toFixed(2);
};

// Générer les équipes
const generateTeams = () => {
  teams.value = Array.from({ length: teamCount.value }, (_, i) => ({
    id: `team-${i}`,
    name: `Équipe ${i + 1}`,
    players: []
  }));
};

// Recalculer les équipes en fonction du nombre de joueurs
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

const onDropToTeam = (team: Team) => {
  if (!draggedPlayer.value) return;

  if (team.players.length >= playersPerTeam.value) {
    // Équipe pleine
    useToastStore().error(`L'équipe ${team.name} est déjà pleine.`);
    return;
  }
  
  // Vérifier que le joueur n'est pas déjà dans une équipe
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

const onDropToAvailable = (player: TournamentPlayer) => {
  // Retirer le joueur de toutes les équipes
  teams.value.forEach(team => {
    team.players = team.players.filter(p => p.id !== player.id);
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
      useToastStore().error('Tous les joueurs doivent être assignés avant de publier les équipes.');
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
</script>

<template>
  <!-- Configuration et boutons -->
  <Card class="p-4 bg-christmas-navy/30 border-christmas-gold/30">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end mb-4">
      <div>
        <label class="block text-christmas-gold font-bold mb-2">Joueurs par équipe</label>
        <input 
          v-model.number="playersPerTeam"
          @change="recalculateTeamCount"
          type="number"
          min="1"
          class="w-full bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-3 py-2 focus:border-christmas-gold outline-none"
        />
        <p class="text-xs text-christmas-gold-light/70 mt-1">
          → {{ teamCount }} équipe(s) généré(es)
        </p>
      </div>

      <div class="flex w-full gap-2">
        <Button v-if="teams.length === 0" @click="generateTeams" color="christmas-gold" class="flex items-center gap-2 flex-1">
          <VueIcon name="bs:plus-circle" />
          Générer les équipes
        </Button>
        <Button v-if="teams.length > 0" @click="saveTournamentTeams" class="flex items-center gap-2 flex-1">
          <VueIcon name="bs:check-circle" />
          Sauvegarder les équipes
        </Button>
        <Button v-if="availablePlayers.length === 0" @click="publishTournamentTeams" class="flex items-center gap-2 flex-1">
          <VueIcon name="bs:check-circle" />
          Publier les équipes
        </Button>
      </div>
    </div>
  </Card>

  <!-- Info tier moyen -->
  <Card v-if="teams.length > 0" class="bg-christmas-gold/10 border-christmas-gold border-2 p-4">
    <p class="text-christmas-gold font-bold">
      Tier moyen nécessaire par équipe pour équilibre : <span class="text-2xl">{{ averageTierPerTeam }}</span>
    </p>
  </Card>

  <!-- Main layout -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Joueurs disponibles -->
    <div class="lg:col-span-1 space-y-4 h-fit sticky top-6">
      <h2 class="text-2xl font-bold text-christmas-gold flex items-center gap-2">
        <VueIcon name="cl:users" />
        Disponibles ({{ availablePlayers.length }})
      </h2>
      
      <div class="space-y-3">
        <div 
          v-for="player in availablePlayers"
          :key="player.id"
          draggable="true"
          @dragstart="onDragStart(player)"
          @dragover="onDragOver"
          @drop="onDropToAvailable(player)"
          class="p-4 bg-christmas-navy/50 border-2 border-christmas-gold/30 rounded-lg cursor-move hover:border-christmas-gold hover:bg-christmas-navy/70 transition-all"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="font-bold text-christmas-snow">{{ player.user.username }}</span>
            <span class="text-xs bg-christmas-gold/20 text-christmas-gold px-2 py-1 rounded">
              {{ getPlayerLevel(player) }}
            </span>
          </div>
          
          <div class="space-y-2 text-sm">
            <div>
              <label class="block text-christmas-gold-light/70 text-xs mb-1">Tier</label>
              <input 
                :value="player.tier"
                @input="(e) => updatePlayerTier(player, (e.target as HTMLInputElement).value)"
                type="number"
                min="1"
                max="10"
                class="w-full bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-2 py-1 text-xs focus:border-christmas-gold outline-none"
              />
            </div>
            
            <div>
              <label class="block text-christmas-gold-light/70 text-xs mb-1">Description</label>
              <input 
                :value="player.description ?? ''"
                @input="(e) => updatePlayerDescription(player, (e.target as HTMLInputElement).value)"
                type="text"
                placeholder="Notes..."
                class="w-full bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-2 py-1 text-xs focus:border-christmas-gold outline-none placeholder-christmas-gold-light/30"
              />
            </div>
          </div>
        </div>

        <div v-if="availablePlayers.length === 0" class="flex items-center justify-center h-24 text-christmas-gold-light/50">
          <VueIcon name="bs:check-all" class="text-2xl mr-2" />
          Tous les joueurs sont assignés
        </div>
      </div>
    </div>

    <!-- Équipes -->
    <div class="lg:col-span-2 space-y-4 h-fit sticky top-6">
      <h2 class="text-2xl font-bold text-christmas-gold flex items-center gap-2">
        <VueIcon name="bs:diagram-3" />
        Équipes
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          v-for="(team, index) in teams"
          :key="index"
          @dragover="onDragOver"
          @drop="onDropToTeam(team)"
          class="p-4 bg-christmas-navy/30 border-2 border-dashed border-christmas-gold/50 rounded-lg hover:border-christmas-gold hover:bg-christmas-navy/50 transition-all"
        >
          <div class="flex items-center justify-between mb-4">
            <input class="text-xl font-bold text-christmas-gold" v-model="team.name" />
            <div class="text-right">
              <p class="text-sm text-christmas-gold-light">Joueurs</p>
              <p class="text-2xl font-bold text-christmas-gold">{{ team.players.length }}</p>
            </div>
          </div>

          <!-- Info tier -->
          <div v-if="team.players.length > 0" class="mb-4 p-3 bg-christmas-gold/10 border border-christmas-gold/30 rounded">
            <p class="text-sm text-christmas-gold-light">Tier moyen : <span class="font-bold text-christmas-gold">{{ getTeamAverageTier(team) }}</span></p>
            <p class="text-sm text-christmas-gold-light">Total tiers : <span class="font-bold text-christmas-gold">{{ team.players.reduce((sum, p) => sum + parseInt(p.tier), 0) }}</span></p>
          </div>

          <!-- Joueurs de l'équipe -->
          <div class="space-y-2">
            <div 
              v-for="player in team.players"
              :key="player.id"
              draggable="true"
              @dragstart="onDragStart(player)"
              class="p-3 bg-gradient-to-r from-christmas-gold/10 to-christmas-red/10 border border-christmas-gold/30 rounded cursor-move hover:border-christmas-gold hover:from-christmas-gold/20 hover:to-christmas-red/20 transition-all group"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex-1">
                  <p class="font-bold text-christmas-snow">{{ player.user.username }}</p>
                  <p class="text-xs text-christmas-gold-light/70">{{ getPlayerLevel(player) }}</p>
                </div>
                <button
                  @click="removePlayerFromTeam(team, player.id)"
                  class="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-christmas-red/20 rounded text-christmas-red ml-2"
                >
                  <VueIcon name="bs:x-lg" />
                </button>
              </div>
              
              <!-- Tier et description éditables -->
              <div class="space-y-2 text-sm mb-2">
                <div class="flex gap-2">
                  <div class="flex-1">
                    <label class="block text-christmas-gold-light/70 text-xs mb-1">Tier</label>
                    <input 
                      :value="player.tier"
                      @input="(e) => updatePlayerTier(player, (e.target as HTMLInputElement).value)"
                      type="number"
                      min="1"
                      max="10"
                      class="w-full bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-2 py-1 text-xs focus:border-christmas-gold outline-none"
                    />
                  </div>
                </div>
                
                <div>
                  <label class="block text-christmas-gold-light/70 text-xs mb-1">Description</label>
                  <input 
                    :value="player.description ?? ''"
                    @input="(e) => updatePlayerDescription(player, (e.target as HTMLInputElement).value)"
                    type="text"
                    placeholder="Notes..."
                    class="w-full bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-2 py-1 text-xs focus:border-christmas-gold outline-none placeholder-christmas-gold-light/30"
                  />
                </div>
              </div>
            </div>

            <div v-if="team.players.length === 0" class="flex items-center justify-center h-24 text-christmas-gold-light/50">
              <VueIcon name="bs:inbox" class="text-2xl mr-2" />
              Glissez des joueurs ici
            </div>
          </div>
        </div>
      </div>
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