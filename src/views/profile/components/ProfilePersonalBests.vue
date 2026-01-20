<script setup lang="ts">
import { computed } from 'vue';
import { Card } from '@/components/ui';
import type { UserWithStats } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';

const props = defineProps<{
  user: UserWithStats;
}>();

const isRankingCountedAsPodium = (rank: number, totalTeams: number): boolean => {
  if (rank === 1) return false;
  if (totalTeams >= 4) {
    return rank <= 3;
  }
  else if (totalTeams === 3) {
    return rank <= 2;
  }
  return false;
}

// Memoize expensive podium calculation
const podiumRate = computed(() => {
  if (props.user.tournamentStats.tournamentsCount === 0) return 0;
  
  const podiumCount = props.user.tournamentHistory.reduce((acc, t) => {
    const userTeam = t.teams.find(team => 
      (team.users as unknown as string[]).includes(props.user.id)
    );
    const ranking = userTeam?.ranking || 100;
    return acc + (isRankingCountedAsPodium(ranking, t.teams.length) ? 1 : 0);
  }, 0);
  
  return (podiumCount / props.user.tournamentStats.tournamentsCount) * 100;
});

const statsBlocks = computed(() => [
  {
    label: 'Série',
    icon: 'bs:fire',
    text: 'Victoires consécutives',
    value: props.user.tournamentStats.longuestWinStreak,
  },
  {
    label: 'Podium',
    icon: 'ca:trophy-filled',
    text: 'De podiums',
    value: podiumRate.value,
  },
  {
    label: 'Taux',
    icon: 'cd:graph',
    text: 'de victoire',
    value: props.user.tournamentStats.tournamentsCount ? (props.user.tournamentStats.firstPlaceCount / props.user.tournamentStats.tournamentsCount * 100) : 0,
  }
]);
</script>

<template>
  <Card class="glass-panel p-8 space-y-6">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="h-px w-16 bg-gradient-to-r from-accent-400 to-transparent" />
        <h2 class="hero-title font-display text-3xl text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-blush-300">Records personnels</h2>
      </div>
    </template>
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card
        v-for="stat in statsBlocks"
        :key="stat.label"
        class="glass-panel bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 p-6 text-center group hover:border-white/20 transition"
      >
        <template #header>
          <div class="flex items-center justify-center gap-2 text-sm font-semibold text-accent-200 mb-2">
            <VueIcon :name="stat.icon" class="text-xl" />
            <span>{{ stat.label }}</span>
          </div>
        </template>
        <p class="text-3xl font-semibold text-white group-hover:text-accent-200 transition">
          {{ stat.value.toFixed(0) }}<span v-if="stat.label !== 'Série'" class="text-lg">%</span>
        </p>
        <template #footer>
          <p class="text-xs uppercase tracking-[0.3em] text-foam-300/70 mt-2">{{ stat.text }}</p>
        </template>
      </Card>
    </div>
  </Card>
</template>