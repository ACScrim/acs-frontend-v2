<script setup lang="ts">
import { Button, Card, Avatar } from '@/components/ui';
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

const toggleTeam = (teamName: string) => {
  if (expandedTeams.value.has(teamName)) {
    expandedTeams.value.delete(teamName);
  } else {
    expandedTeams.value.add(teamName);
  }
};

const getTeamTierInfo = (team: Tournament['teams'][number]) => {
  if (team.users.length === 0) return { avg: 0, total: 0 };
  const tiers = team.users.map(user => {
    const player = props.tournament.players.find(p => p.user.id === user.id);
    return player ? parseInt(player.tier) : 0;
  });
  return {
    avg: (tiers.reduce((a, b) => a + b, 0) / tiers.length).toFixed(2),
    total: tiers.reduce((a, b) => a + b, 0)
  };
};

const startEditing = (teamName: string) => {
  const team = props.tournament.teams.find(t => t.name === teamName);
  if (team) {
    editingTeamId.value = teamName;
    editingName.value = team.name;
    editingScore.value = team.score;
    editingRanking.value = team.ranking;
  }
};

const cancelEditing = () => {
  editingTeamId.value = null;
};

const saveTeamDetails = async (teamName: string) => {
  try {
    isSaving.value = true;
    await adminStore.updateTeamDetails(route.params.id as string, teamName, {
      name: editingName.value,
      score: editingScore.value,
      ranking: editingRanking.value
    });
    useToastStore().success('Équipe mise à jour avec succès.');
    editingTeamId.value = null;
  } catch (error) {
    useToastStore().error('Erreur lors de la mise à jour.');
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-christmas-gold flex items-center gap-2">
        <VueIcon name="bs:trophy-fill" />
        Équipes publiées
      </h2>
      <Button @click="emit('edit')" class="flex items-center gap-2 text-sm">
        <VueIcon name="bs:pencil" />
        Modifier
      </Button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="team in tournament.teams" :key="team.name">
        <Card 
          :class="[
            'p-4 cursor-pointer transition-all border border-christmas-gold bg-christmas-navy',
            editingTeamId === team.name ? '' : 'hover:border-christmas-gold-light hover:shadow-lg hover:shadow-christmas-gold/20'
          ]"
          @click="!editingTeamId ? toggleTeam(team.name) : null"
        >
          <!-- Display Mode -->
          <div v-if="editingTeamId !== team.name" class="space-y-4">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1">
                <h3 class="text-xl font-bold text-christmas-gold mb-1">{{ team.name }}</h3>
                <p class="text-sm text-christmas-gold-light/70">{{ team.users.length }} joueurs</p>
              </div>
              <div class="text-right space-y-1">
                <div class="flex items-center gap-1 justify-end">
                  <VueIcon name="bs:medal-fill" class="text-christmas-gold" />
                  <span class="text-2xl font-bold text-christmas-gold">{{ team.ranking }}</span>
                </div>
                <p class="text-xs text-christmas-gold-light/70">Place</p>
              </div>
            </div>

            <!-- Stats Row -->
            <div class="grid grid-cols-3 gap-2 p-3 bg-gradient-to-r from-christmas-gold/10 to-christmas-red/5 rounded-lg">
              <div>
                <p class="text-xs text-christmas-gold-light/70">Score</p>
                <p class="font-bold text-christmas-gold text-lg">{{ team.score }}</p>
              </div>
              <div>
                <p class="text-xs text-christmas-gold-light/70">Tier moyen</p>
                <p class="font-bold text-christmas-gold text-lg">{{ getTeamTierInfo(team).avg }}</p>
              </div>
              <div>
                <p class="text-xs text-christmas-gold-light/70">Tier total</p>
                <p class="font-bold text-christmas-gold text-lg">{{ getTeamTierInfo(team).total }}</p>
              </div>
            </div>

            <!-- Edit Button -->
            <button 
              @click.stop="startEditing(team.name)"
              class="w-full py-2 px-3 text-sm font-bold text-christmas-gold hover:bg-christmas-gold/20 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <VueIcon name="bs:pencil" />
              Éditer détails
            </button>

            <!-- Players List -->
            <div class="space-y-2 pt-3 border-t border-christmas-gold/20">
              <div 
                v-for="player in team.users"
                :key="player.id"
                class="p-2 bg-christmas-midnight/50 rounded-lg flex items-center justify-between text-sm"
              >
                <div class="flex items-center gap-2">
                  <Avatar :src="player.avatarUrl" :alt="player.username" :size="10" class="rounded-full" />
                  <p class="font-bold text-christmas-snow">{{ player.username }}</p>
                </div>
                <span class="text-xs bg-christmas-gold/20 text-christmas-gold px-2 py-1 rounded font-bold">
                  {{ tournament.players.find(p => p.user.id === player.id)?.tier ?? '-' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Edit Mode -->
          <div v-else class="space-y-4">
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-bold text-christmas-gold-light mb-1">Nom de l'équipe</label>
                <input 
                  v-model="editingName"
                  type="text"
                  class="w-full bg-christmas-navy border-2 border-christmas-gold/30 text-christmas-gold rounded-lg px-3 py-2 focus:border-christmas-gold outline-none font-bold"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-christmas-gold-light mb-1">Classement</label>
                  <input 
                    v-model.number="editingRanking"
                    type="number"
                    min="1"
                    class="w-full bg-christmas-navy border-2 border-christmas-gold/30 text-christmas-gold rounded-lg px-3 py-2 focus:border-christmas-gold outline-none"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-christmas-gold-light mb-1">Score</label>
                  <input 
                    v-model.number="editingScore"
                    type="number"
                    min="0"
                    class="w-full bg-christmas-navy border-2 border-christmas-gold/30 text-christmas-gold rounded-lg px-3 py-2 focus:border-christmas-gold outline-none"
                  />
                </div>
              </div>
            </div>

            <div class="flex gap-2">
              <Button 
                @click.stop="saveTeamDetails(team.name)"
                :disabled="isSaving"
                color="christmas-gold"
                class="flex-1 flex items-center justify-center gap-1"
              >
                <VueIcon name="bs:check-circle" />
                Sauvegarder
              </Button>
              <Button 
                @click.stop="cancelEditing"
                :disabled="isSaving"
                class="flex-1 flex items-center justify-center gap-1 bg-christmas-red/20 text-christmas-red hover:bg-christmas-red/30"
              >
                <VueIcon name="bs:x-circle" />
                Annuler
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>