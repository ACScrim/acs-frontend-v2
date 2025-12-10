<script setup lang="ts">
import { Card } from '@/components/ui';
import type { Tournament } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { computed } from 'vue';
import { getGameColor } from '../composables/useGameColor';

const props = defineProps<{ tournament: Tournament }>();

const podium = computed(() => {
  const sorted = [...props.tournament.teams].sort((a, b) => (a.ranking || 999) - (b.ranking || 999));
  return {
    first: sorted[0],
    second: sorted[1],
    third: sorted[2],
    others: sorted.slice(3)
  };
});

const headerColor = computed((): string => {
  const gameId = props.tournament.gameId || 'default';
  return getGameColor(gameId);
});
</script>

<template>
  <Card v-if="tournament.finished" class="glass-panel p-6">
    <template #header>
      <h2
        class="text-2xl font-semibold text-white flex items-center gap-2 pl-4 -ml-4 py-1 border-l-4"
        :style="{ borderLeftColor: headerColor }"
      >
        <VueIcon name="bs:trophy-fill" /> Résultats du tournoi
      </h2>
    </template>

    <div class="space-y-8">
      <div class="flex items-end justify-center gap-4 mb-8 px-4">
        <!-- 2ème place -->
        <div class="flex flex-col items-center flex-1 max-w-xs">
          <div class="bg-gradient-to-b from-slate-200/80 to-slate-200/40 rounded-t-2xl p-4 md:p-6 w-full text-center border-4 border-slate-200 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
            <span class="text-3xl md:text-4xl block mb-2">🥈</span>
            <p class="font-bold text-slate-800 truncate text-xs md:text-sm line-clamp-2">
              {{ podium.second?.name || '-' }}
            </p>
            <p class="text-xs text-slate-800/70 mt-2">2ème place</p>
          </div>
          <div class="bg-gradient-to-b from-slate-200 to-slate-200/60 w-full h-16 md:h-20 flex items-center justify-center border-4 border-t-0 border-slate-200 shadow-md">
            <span class="text-4xl md:text-5xl font-black text-slate-800">2</span>
          </div>
        </div>

        <!-- 1ère place (plus grande) -->
        <div class="flex flex-col items-center flex-1 max-w-xs -mb-4 md:-mb-6">
          <div class="bg-gradient-to-b from-yellow-400 via-yellow-300 to-yellow-200 rounded-t-2xl p-6 md:p-8 w-full text-center border-4 border-yellow-400 shadow-2xl hover:shadow-2xl transition-all transform hover:scale-105">
            <span class="text-4xl md:text-5xl block mb-3">🥇</span>
            <p class="font-bold text-slate-800 truncate text-sm md:text-base line-clamp-2">
              {{ podium.first?.name || '-' }}
            </p>
            <p class="text-xs text-slate-800/70 mt-2">1ère place</p>
          </div>
          <div class="bg-gradient-to-b from-yellow-400 to-yellow-300 w-full h-24 md:h-32 flex items-center justify-center border-4 border-t-0 border-yellow-400 shadow-xl">
            <span class="text-6xl md:text-7xl font-black text-slate-800">1</span>
          </div>
        </div>

        <!-- 3ème place -->
        <div class="flex flex-col items-center flex-1 max-w-xs">
          <div class="bg-gradient-to-b from-red-400/80 to-red-400/40 rounded-t-2xl p-4 md:p-6 w-full text-center border-4 border-red-400 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
            <span class="text-3xl md:text-4xl block mb-2">🥉</span>
            <p class="font-bold text-white truncate text-xs md:text-sm line-clamp-2">
              {{ podium.third?.name || '-' }}
            </p>
            <p class="text-xs text-white/70 mt-2">3ème place</p>
          </div>
          <div class="bg-gradient-to-b from-red-400 to-red-300 w-full h-12 md:h-16 flex items-center justify-center border-4 border-t-0 border-red-400 shadow-md">
            <span class="text-4xl md:text-5xl font-black text-white">3</span>
          </div>
        </div>
      </div>

      <!-- Décoration entre podium et classement -->
      <div class="flex items-center gap-4 px-4" v-if="tournament.teams.length > 3">
        <div class="flex-1 h-px bg-gradient-to-r from-white/0 via-white/30 to-white/0" />
        <VueIcon name="bs:stars" class="text-accent-300 text-2xl" />
        <div class="flex-1 h-px bg-gradient-to-r from-white/0 via-white/30 to-white/0" />
      </div>

      <!-- Autres équipes (4+) -->
      <div v-if="tournament.teams.length > 3" class="space-y-4">
        <h3 class="text-lg font-semibold text-white flex items-center gap-2 px-4">
          <VueIcon name="bs:list-ul" /> Classement complet
        </h3>
        <div class="space-y-2 px-4">
          <div 
            v-for="(team, index) in podium.others"
            :key="team.id"
            class="flex items-center justify-between p-4 rounded-[var(--radius-lg)] border border-white/10 bg-white/5"
          >
            <div class="flex items-center gap-4 flex-1">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-semibold text-white">
                #{{ index + 4 }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-white truncate">{{ team.name }}</p>
                <p class="text-xs text-foam-300/70">Classement : {{ team.ranking || '-' }}</p>
              </div>
            </div>
            <span class="text-sm font-semibold text-accent-200">Rang {{ team.ranking }}</span>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>