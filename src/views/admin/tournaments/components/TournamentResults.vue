<script setup lang="ts">
import { Button, Card } from '@/components/ui';
import useAdminStore from '@/stores/adminStore';
import { useToastStore } from '@/stores/toastStore';
import type { Tournament } from '@/types/models';
import { computed, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps<{ tournament: Tournament }>();
const emit = defineEmits<{ saved: []; }>();
const route = useRoute();
const adminStore = useAdminStore();
const toast = useToastStore();

const saving = ref(false);
const formState = reactive<Record<string, { score: number | null; ranking: number | null; name: string }>>({});

const sortedTeams = computed(() => {
  return [...props.tournament.teams].sort((a, b) => (a.ranking ?? Number.POSITIVE_INFINITY) - (b.ranking ?? Number.POSITIVE_INFINITY));
});

const tournamentStarted = computed(() => new Date(props.tournament.date).getTime() <= Date.now());
const getTeamKey = (team: Tournament['teams'][number]) => (team as any).id ?? team.name;

const ensureEntry = (team: Tournament['teams'][number]) => {
  const key = getTeamKey(team);
  if (!formState[key]) {
    formState[key] = {
      name: team.name,
      score: team.score ?? null,
      ranking: team.ranking ?? null,
    };
  }
  return formState[key];
};

const teamsWithState = computed(() =>
  sortedTeams.value.map(team => {
    const key = getTeamKey(team);
    const state = ensureEntry(team);
    return { team, key, state };
  })
);

watch(
  () => props.tournament.teams,
  () => {
    sortedTeams.value.forEach(team => ensureEntry(team));
  },
  { immediate: true }
);

const handleSaveResults = async () => {
  if (!tournamentStarted.value) {
    toast.error('Le tournoi doit avoir commencé pour publier les résultats.');
    return;
  }

  const payload = teamsWithState.value.map(({ team, state }) => ({
    teamId: (team as any).id,
    name: state.name ?? team.name,
    score: Number(state.score ?? team.score ?? 0),
    ranking: Number(state.ranking ?? team.ranking ?? 0)
  }));

  if (payload.some(result => !result.ranking || result.ranking <= 0)) {
    toast.error('Chaque équipe doit avoir un classement valide.');
    return;
  }

  const seenRankings = new Set<number>();
  for (const result of payload) {
    if (seenRankings.has(result.ranking)) {
      toast.error('Chaque équipe doit avoir un classement unique.');
      return;
    }
    seenRankings.add(result.ranking);
  }

  try {
    saving.value = true;
    await adminStore.finalizeTournamentResults(route.params.id as string, {
      results: payload,
      openMvpVote: true,
    });
    toast.success('Résultats publiés et vote MVP ouvert.');
    emit('saved');
  } catch (error) {
    toast.error('Impossible de publier les résultats.');
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.4em] text-foam-300/70">Résultats</p>
        <h2 class="hero-title text-3xl">Classements & scores</h2>
      </div>
      <Button :disabled="saving || !tournamentStarted" @click="handleSaveResults">
        Publier les résultats
      </Button>
    </div>

    <p v-if="!tournamentStarted" class="text-sm text-foam-300/80">
      Le tournoi doit avoir commencé pour éditer les résultats.
    </p>

    <div class="grid gap-4 md:grid-cols-2" v-if="teamsWithState.length">
      <Card
        v-for="{ team, key, state } in teamsWithState"
        :key="key"
        class="glass-panel p-4 space-y-4"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 space-y-2">
            <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Nom</label>
            <input type="text" class="form-input" v-model="state.name" />
          </div>
          <div class="w-24 space-y-2">
            <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Classement</label>
            <input type="number" min="1" class="form-input text-center" v-model.number="state.ranking" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-2">
            <label class="text-xs uppercase tracking-[0.3em] text-foam-300/70">Score</label>
            <input type="number" min="0" class="form-input" v-model.number="state.score" />
          </div>
          <div class="rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-3">
            <p class="text-xs text-foam-300/70">Participants</p>
            <p class="text-base font-semibold text-white">{{ team.users.length }} joueurs</p>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>
