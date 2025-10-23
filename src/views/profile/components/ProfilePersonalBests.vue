<script setup lang="ts">
import { Card } from '@/components/ui';
import type { UserWithStats } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';

const props = defineProps<{
  user: UserWithStats;
}>();

const statsBlocks = [
  {
    label: 'Série',
    icon: 'bs:fire',
    text: 'Victoires consécutives',
    value: 2 
  },
  {
    label: 'Top 25%',
    icon: 'fl:target-arrow',
    text: 'Des tournois',
    value: (props.user.tournamentStats.firstPlaceCount + props.user.tournamentStats.top25Count) / props.user.tournamentStats.tournamentsCount * 100,
  },
  {
    label: 'Taux',
    icon: 'cd:graph',
    text: 'de victoire',
    value: props.user.tournamentStats.firstPlaceCount / props.user.tournamentStats.tournamentsCount * 100,
  },
  {
    label: 'Podium',
    icon: 'ca:trophy-filled',
    text: 'De podiums',
    value: (props.user.tournamentStats.firstPlaceCount + props.user.tournamentStats.secondPlaceCount + props.user.tournamentStats.thirdPlaceCount) / props.user.tournamentStats.tournamentsCount * 100,
  }
];
</script>

<template>
  <Card class="p-6 bg-christmas-navy/80" style="--tw-border-color: var(--color-christmas-ice)">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="h-1 w-12 bg-gradient-to-r from-christmas-gold to-christmas-gold-light rounded-full"></div>
        <h2 class="text-4xl font-bold bg-gradient-to-r from-christmas-gold via-christmas-gold-light to-christmas-gold bg-clip-text text-transparent uppercase">Records personnels</h2>
      </div>
    </template>
    <div class="flex flex-row gap-2 flex-wrap">
      <Card
        v-for="stat in statsBlocks"
        :key="stat.label"
        class="flex-1 min-w-[250px] flex flex-col items-center justify-center p-4 border-christmas-gold border-1"
      >
        <template #header>
          <div class="flex items-center gap-2">
            <VueIcon :name="stat.icon" class="text-2xl text-christmas-gold" />
            <h3 class="text-2xl font-semibold">{{ stat.label }}</h3>
          </div>
        </template>
        <p class="text-4xl font-bold text-christmas-gold">
          {{ stat.value.toFixed(0) }}<span v-if="stat.label !== 'Série'" class="text-2xl">%</span>
        </p>
        <template #footer>
          <p class="text-sm text-gray-400">{{ stat.text }}</p>
        </template>
      </Card>
    </div>
  </Card>
</template>