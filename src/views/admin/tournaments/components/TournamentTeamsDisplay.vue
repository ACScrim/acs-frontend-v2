<script setup lang="ts">
import { Button, Card, Avatar } from '@/components/ui';
import useAdminStore from '@/stores/adminStore';
import { useToastStore } from '@/stores/toastStore';
import type { Tournament } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps<{
  tournament: Tournament;
}>();

const emit = defineEmits<{
  edit: [];
}>();

const route = useRoute();
const adminStore = useAdminStore();
const editableTeams = ref<Record<string, { name: string }>>({});
const savingTeamKey = ref<string | null>(null);

const getTeamKey = (team: Tournament['teams'][number]) => {
  return (team as any).id ?? team.name;
};

watch(
  () => props.tournament.teams,
  (teams) => {
    const snapshot: Record<string, { name: string }> = {};
    teams.forEach(team => {
      const key = getTeamKey(team);
      snapshot[key] = {
        name: team.name,
      };
    });
    editableTeams.value = snapshot;
  },
  { immediate: true, deep: true }
);

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

const resetTeamFields = (team: Tournament['teams'][number]) => {
  const key = getTeamKey(team);
  const sourceTeam = props.tournament.teams.find(t => getTeamKey(t) === key);
  if (team) {
    editableTeams.value[key] = {
      name: sourceTeam?.name ?? team.name,
    };
  }
};

const saveTeamDetails = async (team: Tournament['teams'][number]) => {
  const key = getTeamKey(team);
  const fields = editableTeams.value[key];
  if (!fields) return;

  try {
    savingTeamKey.value = key;
    await adminStore.updateTeamDetails(route.params.id as string, team.name, {
      name: fields.name,
    });
    useToastStore().success('Équipe mise à jour avec succès.');
  } catch (error) {
    useToastStore().error('Erreur lors de la mise à jour.');
  } finally {
    savingTeamKey.value = null;
  }
};
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-xs uppercase tracking-[0.4em] text-foam-300/70">Publication</p>
        <h2 class="hero-title text-2xl">Équipes publiées</h2>
      </div>
      <Button @click="emit('edit')" class="gap-2">
        <VueIcon name="bs:pencil" /> Modifier
      </Button>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <Card v-for="team in tournament.teams" :key="getTeamKey(team)" class="glass-panel p-4">
        <div class="space-y-4">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1">
               <input
                v-model="editableTeams[getTeamKey(team)]!.name"
                 type="text"
                 class="form-input"
               />
              <p class="text-sm text-foam-300/70">{{ team.users.length }} joueurs</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-foam-300/70">Classement</p>
              <p class="text-lg font-semibold text-white">{{ team.ranking ?? '-' }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-3 text-sm text-white">
            <div>
              <p class="text-xs text-foam-300/70">Score</p>
              <p class="text-lg font-semibold">{{ team.score ?? '-' }}</p>
            </div>
            <div>
              <p class="text-xs text-foam-300/70">Tier moyen</p>
              <p class="font-semibold">{{ getTeamTierInfo(team).avg }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <Button
              class="flex-1 gap-2"
              :disabled="savingTeamKey === getTeamKey(team)"
              @click.stop="saveTeamDetails(team)"
            >
              <VueIcon name="bs:check-circle" /> Renommer
            </Button>
            <Button
              class="flex-1"
              variant="ghost"
              :disabled="savingTeamKey === getTeamKey(team)"
              @click.stop="resetTeamFields(team)"
            >
              Réinitialiser
            </Button>
          </div>
          <div class="space-y-2 border-t border-white/5 pt-3">
            <div v-for="player in team.users" :key="player.id" class="flex items-center justify-between rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-2 text-sm">
              <div class="flex items-center gap-2">
                <Avatar :src="player.avatarUrl" :alt="player.username" :size="10" />
                <p class="text-white font-semibold">{{ player.username }}</p>
              </div>
              <span class="rounded bg-white/10 px-2 py-0.5 text-xs text-white font-semibold">
                {{ tournament.players.find(p => p.user.id === player.id)?.tier ?? '-' }}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>