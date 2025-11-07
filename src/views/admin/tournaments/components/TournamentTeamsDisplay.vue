<script setup lang="ts">
import { Button, Card } from '@/components/ui';
import useAdminStore from '@/stores/adminStore';
import { useToastStore } from '@/stores/toastStore';
import type { Tournament } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps<{
  tournament: Tournament;
}>();

const emit = defineEmits<{
  edit: [];
}>();

const route = useRoute();
const adminStore = useAdminStore();
const expandedTeams = ref<Set<string>>(new Set());
const editingTeamId = ref<string | null>(null);
const editingName = ref<string>('');
const editingScore = ref<number>(0);
const editingRanking = ref<number>(0);
const isSaving = ref(false);

const toggleTeam = (teamId: string) => {
  if (expandedTeams.value.has(teamId)) {
    expandedTeams.value.delete(teamId);
  } else {
    expandedTeams.value.add(teamId);
  }
};

const getTeamTierAverage = (teamId: string): number => {
  const team = props.tournament.teams.find(t => t.name === teamId);
  if (!team || team.users.length === 0) return 0;
  const totalTier = team.users.reduce((sum, user) => {
    const player = props.tournament.players.find(p => p.user.id === user.id);
    return sum + (player ? parseInt(player.tier) : 0);
  }, 0);
  return totalTier / team.users.length;
};

const startEditing = (teamId: string) => {
  const team = props.tournament.teams.find(t => t.name === teamId);
  if (team) {
    editingTeamId.value = teamId;
    editingName.value = team.name;
    editingScore.value = team.score;
    editingRanking.value = team.ranking;
  }
};

const cancelEditing = () => {
  editingTeamId.value = null;
};

const saveTeamDetails = async (teamId: string) => {
  try {
    isSaving.value = true;
    await adminStore.updateTeamDetails(route.params.id as string, teamId, {
      name: editingName.value,
      score: editingScore.value,
      ranking: editingRanking.value
    });
    useToastStore().success('Équipe mise à jour avec succès.');
    editingTeamId.value = null;
  } catch (error) {
    useToastStore().error('Erreur lors de la mise à jour de l\'équipe.');
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-christmas-gold flex items-center gap-2">
        <VueIcon name="bs:diagram-3" />
        Équipes publiées
      </h2>
      <Button @click="emit('edit')" class="flex items-center gap-1 text-sm">
        <VueIcon name="bs:pencil" />
        Modifier composition
      </Button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Card 
        v-for="team in tournament.teams"
        :key="team.name"
        class="p-3 cursor-pointer hover:border-christmas-gold transition-all"
        @click="!editingTeamId ? toggleTeam(team.name) : null"
      >
        <!-- Mode affichage -->
        <div v-if="editingTeamId !== team.name">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-bold text-christmas-gold">{{ team.name }}</h3>
            <div class="flex items-center gap-3">
              <div class="text-right">
                <p class="text-xs text-christmas-gold-light/70">Rang</p>
                <p class="text-lg font-bold text-christmas-gold">{{ team.ranking }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-christmas-gold-light/70">Score</p>
                <p class="text-lg font-bold text-christmas-gold">{{ team.score }}</p>
              </div>
              <VueIcon 
                :name="expandedTeams.has(team.name) ? 'bs:chevron-up' : 'bs:chevron-down'" 
                class="text-christmas-gold"
              />
            </div>
          </div>

          <!-- Info tier -->
          <div class="mb-2 p-2 bg-christmas-gold/10 border border-christmas-gold/30 rounded text-xs">
            <p class="text-christmas-gold-light">
              Joueurs: <span class="font-bold text-christmas-gold">{{ team.users.length }}</span> | 
              Tier moyen: <span class="font-bold text-christmas-gold">{{ getTeamTierAverage(team.name).toFixed(2) }}</span>
            </p>
          </div>

          <!-- Bouton édition -->
          <button 
            @click.stop="startEditing(team.name)"
            class="mb-2 text-xs text-christmas-gold hover:text-christmas-gold-light flex items-center gap-1 transition-colors"
          >
            <VueIcon name="bs:pencil" />
            Éditer détails
          </button>

          <!-- Liste des joueurs (dépliable) -->
          <transition name="expand">
            <div v-if="expandedTeams.has(team.name)" class="space-y-1 mt-2 pt-2 border-t border-christmas-gold/20">
              <div 
                v-for="player in team.users"
                :key="player.id"
                class="p-2 bg-christmas-navy/30 rounded flex items-center justify-between text-xs"
              >
                <span class="text-christmas-snow font-medium">{{ player.username }}</span>
                <span class="text-christmas-gold bg-christmas-gold/20 px-2 py-0.5 rounded">
                  {{ tournament.players.find(p => p.user.id === player.id)?.tier ?? '-' }}
                </span>
              </div>
            </div>
          </transition>
        </div>

        <!-- Mode édition -->
        <div v-else class="space-y-3">
          <div class="flex items-center justify-between mb-2">
            <VueIcon name="bs:pencil" class="text-christmas-gold" />
          </div>

          <div class="space-y-2">
            <div>
              <label class="block text-christmas-gold-light text-xs font-bold mb-1">Nom de l'équipe</label>
              <input 
                v-model="editingName"
                type="text"
                placeholder="Nom de l'équipe..."
                class="w-full bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-2 py-1.5 text-sm focus:border-christmas-gold outline-none placeholder-christmas-gold-light/30"
              />
            </div>

            <div>
              <label class="block text-christmas-gold-light text-xs font-bold mb-1">Classement</label>
              <input 
                v-model.number="editingRanking"
                type="number"
                min="1"
                class="w-full bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-2 py-1.5 text-sm focus:border-christmas-gold outline-none"
              />
            </div>

            <div>
              <label class="block text-christmas-gold-light text-xs font-bold mb-1">Score</label>
              <input 
                v-model.number="editingScore"
                type="number"
                min="0"
                class="w-full bg-christmas-navy border border-christmas-gold/30 text-christmas-gold rounded px-2 py-1.5 text-sm focus:border-christmas-gold outline-none"
              />
            </div>
          </div>

          <div class="flex gap-2">
            <Button 
              @click.stop="saveTeamDetails(team.name)"
              :disabled="isSaving"
              class="flex-1 flex items-center justify-center gap-1 text-sm"
            >
              <VueIcon name="bs:check-circle" />
              Sauvegarder
            </Button>
            <Button 
              @click.stop="cancelEditing"
              :disabled="isSaving"
              class="flex-1 flex items-center justify-center gap-1 text-sm bg-christmas-red/20 text-christmas-red hover:bg-christmas-red/30"
            >
              <VueIcon name="bs:x-circle" />
              Annuler
            </Button>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<style scoped>
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