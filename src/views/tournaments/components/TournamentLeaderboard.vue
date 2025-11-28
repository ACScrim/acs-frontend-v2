<script setup lang="ts">
import { Card } from '@/components/ui';
import type { Tournament } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
defineProps<{ tournament: Tournament }>();
</script>

<template>
  <Card v-if="tournament.finished" class="glass-panel p-6">
    <template #header>
      <h2 class="text-2xl font-semibold text-white flex items-center gap-2">
        <VueIcon name="bs:trophy-fill" /> Résultats du tournoi
      </h2>
    </template>

    <div class="space-y-8">
      <div class="flex items-end justify-center gap-4 mb-8 px-4">
        <!-- 2ème place -->
        <div class="flex flex-col items-center flex-1 max-w-xs">
          <div class="bg-gradient-to-b from-christmas-silver/80 to-christmas-silver/40 rounded-t-2xl p-4 md:p-6 w-full text-center border-4 border-christmas-silver shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
            <span class="text-3xl md:text-4xl block mb-2">🥈</span>
            <p class="font-bold text-christmas-navy truncate text-xs md:text-sm line-clamp-2">
              {{ tournament.teams.sort((a, b) => (a.ranking || 999) - (b.ranking || 999))[1]?.name || '-' }}
            </p>
            <p class="text-xs text-christmas-navy/70 mt-2">2ème place</p>
          </div>
          <div class="bg-gradient-to-b from-christmas-silver to-christmas-silver/60 w-full h-16 md:h-20 flex items-center justify-center border-4 border-t-0 border-christmas-silver shadow-md">
            <span class="text-4xl md:text-5xl font-black text-christmas-navy">2</span>
          </div>
        </div>

        <!-- 1ère place (plus grande) -->
        <div class="flex flex-col items-center flex-1 max-w-xs -mb-4 md:-mb-6">
          <div class="bg-gradient-to-b from-christmas-gold via-christmas-gold-light to-christmas-gold rounded-t-2xl p-6 md:p-8 w-full text-center border-4 border-christmas-gold shadow-2xl hover:shadow-2xl transition-all transform hover:scale-105">
            <span class="text-4xl md:text-5xl block mb-3">🥇</span>
            <p class="font-bold text-christmas-navy truncate text-sm md:text-base line-clamp-2">
              {{ tournament.teams.sort((a, b) => (a.ranking || 999) - (b.ranking || 999))[0]?.name || '-' }}
            </p>
            <p class="text-xs text-christmas-navy/70 mt-2">1ère place</p>
          </div>
          <div class="bg-gradient-to-b from-christmas-gold to-christmas-gold-light w-full h-24 md:h-32 flex items-center justify-center border-4 border-t-0 border-christmas-gold shadow-xl">
            <span class="text-6xl md:text-7xl font-black text-christmas-navy">1</span>
          </div>
        </div>

        <!-- 3ème place -->
        <div class="flex flex-col items-center flex-1 max-w-xs">
          <div class="bg-gradient-to-b from-christmas-crimson/80 to-christmas-red/40 rounded-t-2xl p-4 md:p-6 w-full text-center border-4 border-christmas-crimson shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
            <span class="text-3xl md:text-4xl block mb-2">🥉</span>
            <p class="font-bold text-christmas-snow truncate text-xs md:text-sm line-clamp-2">
              {{ tournament.teams.sort((a, b) => (a.ranking || 999) - (b.ranking || 999))[2]?.name || '-' }}
            </p>
            <p class="text-xs text-christmas-snow/70 mt-2">3ème place</p>
          </div>
          <div class="bg-gradient-to-b from-christmas-crimson to-christmas-red/60 w-full h-12 md:h-16 flex items-center justify-center border-4 border-t-0 border-christmas-crimson shadow-md">
            <span class="text-4xl md:text-5xl font-black text-christmas-snow">3</span>
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
            v-for="(team, index) in tournament.teams.sort((a, b) => (a.ranking || 999) - (b.ranking || 999)).slice(3)"
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