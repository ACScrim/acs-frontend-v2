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

const onDropToTeam = (team: Team) => {
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
    if (!currentTeam) return;
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
    <Card class="glass-panel p-6">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.4em] text-foam-300/70">Configuration</p>
            <h3 class="hero-title text-2xl">Gestion des équipes</h3>
          </div>
          <div class="flex items-center gap-2 text-sm text-foam-300/80">
            <VueIcon name="bs:arrow-right" /> {{ teamCount }} équipe(s)
          </div>
        </div>
      </template>

      <div class="grid gap-4 md:grid-cols-3">
        <div>
          <label class="form-label">Joueurs par équipe</label>
          <input v-model.number="playersPerTeam" @change="recalculateTeamCount" type="number" min="1" class="form-input font-semibold" />
        </div>
        <div>
          <label class="form-label">Joueurs restants</label>
          <p class="text-3xl font-semibold text-white">{{ availablePlayers.length }}</p>
          <p class="text-xs text-foam-300/70">à assigner</p>
        </div>
        <div>
          <label class="form-label">Tier moyen/équipe</label>
          <p class="text-3xl font-semibold text-white">{{ averageTierPerTeam }}</p>
          <p class="text-xs text-foam-300/70">pour équilibre</p>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <Button v-if="teams.length === 0" class="gap-2" @click="generateTeams">
          <VueIcon name="bs:plus-circle" /> Générer équipes
        </Button>
        <Button v-if="teams.length > 0" class="gap-2" variant="secondary" @click="autoBalanceTeams">
          <VueIcon name="bs:arrow-left-right" /> Équilibrage auto
        </Button>
        <Button v-if="teams.length > 0" class="gap-2" variant="outline" @click="saveTournamentTeams">
          <VueIcon name="bs:check-circle" /> Sauvegarder
        </Button>
        <Button v-if="availablePlayers.length === 0 && teams.length > 0" class="gap-2" @click="publishTournamentTeams">
          <VueIcon name="bs:rocket" /> Publier
        </Button>
      </div>
    </Card>

    <div v-if="teams.length > 0" class="grid gap-6 lg:grid-cols-4">
      <Card class="glass-panel sticky top-6 max-h-[70vh] overflow-hidden p-4">
        <template #header>
          <h3 class="text-sm uppercase tracking-[0.3em] text-foam-300/70 flex items-center gap-2">
            <VueIcon name="cl:users" /> Disponibles
            <span class="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white">{{ availablePlayers.length }}</span>
          </h3>
        </template>
        <div class="flex-1 space-y-2 overflow-y-auto">
          <div v-for="player in availablePlayers" :key="player.id" draggable="true" @dragstart="onDragStart(player)" @dragover="onDragOver" @drop="onDropToAvailable" class="rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-3 text-sm">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-semibold text-white">{{ player.user.username }}</p>
                <p class="text-xs text-foam-300/70">{{ getPlayerLevel(player) }}</p>
              </div>
              <span class="rounded bg-white/10 px-2 py-1 text-xs text-white font-semibold">{{ player.tier }}</span>
            </div>
            <div class="mt-2 space-y-2">
              <input :value="player.tier" @input.stop="(e) => updatePlayerTier(player, (e.target as HTMLInputElement).value)" type="number" min="1" max="10" class="form-input text-xs" />
              <input :value="player.description ?? ''" @input.stop="(e) => updatePlayerDescription(player, (e.target as HTMLInputElement).value)" type="text" placeholder="Notes..." class="form-input text-xs" />
            </div>
          </div>
          <p v-if="availablePlayers.length === 0" class="py-6 text-center text-xs text-foam-300/60">Tous assignés 🎯</p>
        </div>
      </Card>

      <div class="lg:col-span-3 grid gap-4 md:grid-cols-2">
        <Card v-for="(team, index) in teams" :key="index" @dragover="onDragOver" @drop="onDropToTeam(team)" @dragenter="dragOverTeamIndex = index" @dragleave="dragOverTeamIndex = null" :class="['glass-panel p-4 min-h-[480px] transition', dragOverTeamIndex === index ? 'border-accent-300' : 'border-white/5']">
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <input v-model="team.name" class="form-input bg-transparent text-lg font-semibold" />
              <div class="text-right">
                <p class="text-xs text-foam-300/70">Joueurs</p>
                <p class="text-lg font-semibold text-white">{{ team.players.length }}/{{ playersPerTeam }}</p>
              </div>
            </div>
          </template>

          <div v-if="team.players.length > 0" class="mb-3 grid grid-cols-2 gap-2 rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-3 text-sm text-white">
            <div>
              <p class="text-xs text-foam-300/70">Tier moyen</p>
              <p class="font-semibold">{{ getTeamAverageTier(team) }}</p>
            </div>
            <div>
              <p class="text-xs text-foam-300/70">Tier total</p>
              <p class="font-semibold">{{ getTeamTotalTier(team) }}</p>
            </div>
          </div>

          <div class="flex-1 space-y-2 overflow-y-auto">
            <div v-for="player in team.players" :key="player.id" draggable="true" @dragstart="onDragStart(player)" class="rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-3 text-sm">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="font-semibold text-white">{{ player.user.username }}</p>
                  <p class="text-xs text-foam-300/70">{{ getPlayerLevel(player) }}</p>
                </div>
                <button class="text-foam-300/70 hover:text-white" @click="removePlayerFromTeam(team, player.id)">
                  <VueIcon name="bs:x-circle" />
                </button>
              </div>
              <div class="mt-2 flex gap-2 text-xs">
                <input :value="player.tier" @input.stop="(e) => updatePlayerTier(player, (e.target as HTMLInputElement).value)" type="number" min="1" max="10" class="form-input" />
                <input :value="player.description ?? ''" @input.stop="(e) => updatePlayerDescription(player, (e.target as HTMLInputElement).value)" type="text" placeholder="Notes..." class="form-input" />
              </div>
            </div>
            <p v-if="team.players.length === 0" class="py-4 text-center text-xs text-foam-300/60">Glissez un joueur ici</p>
          </div>
        </Card>
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