<script setup lang="ts">
import { Card } from '@/components/ui';
import type { Tournament } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
defineProps<{ tournament: Tournament }>();
</script>

<template>
  <Card 
    v-if="tournament.finished"
    class="p-6 bg-christmas-navy/50"
    style="border: 2px solid #D4AF37;"
  >
    <template #header>
      <h2 class="text-2xl font-bold bg-gradient-to-r from-christmas-gold via-christmas-gold-light to-christmas-gold bg-clip-text text-transparent flex items-center gap-2">
        <VueIcon name="bs:trophy-fill" class="text-christmas-gold" />
        Résultats du tournoi
      </h2>
    </template>

    <div class="space-y-8">
      <!-- Podium -->
      <div class="flex items-end justify-center gap-2 md:gap-4 mb-8 px-4">
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
        <div class="flex-1 h-1 bg-gradient-to-r from-christmas-gold/0 via-christmas-gold to-christmas-gold/0 rounded-full"></div>
        <VueIcon name="bs:stars" class="text-christmas-gold text-2xl" />
        <div class="flex-1 h-1 bg-gradient-to-r from-christmas-gold/0 via-christmas-gold to-christmas-gold/0 rounded-full"></div>
      </div>

      <!-- Autres équipes (4+) -->
      <div v-if="tournament.teams.length > 3" class="space-y-4">
        <h3 class="text-lg font-bold bg-gradient-to-r from-christmas-gold to-christmas-gold-light bg-clip-text text-transparent flex items-center gap-2 px-4">
          <VueIcon name="bs:list-ul" class="text-christmas-gold" />
          Classement complet
        </h3>
        <div class="space-y-2 px-4">
          <div 
            v-for="(team, index) in tournament.teams.sort((a, b) => (a.ranking || 999) - (b.ranking || 999)).slice(3)"
            :key="team.id"
            class="flex items-center justify-between p-4 bg-gradient-to-r from-christmas-navy/40 to-christmas-midnight/40 rounded-lg border-l-4 border-christmas-gold/60 hover:border-christmas-gold hover:bg-gradient-to-r hover:from-christmas-gold/20 hover:to-christmas-red/20 transition-all shadow-md hover:shadow-lg"
          >
            <div class="flex items-center gap-4 flex-1">
              <div class="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-christmas-gold to-christmas-gold-light text-christmas-navy font-bold text-lg shadow-md">
                #{{ index + 4 }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-christmas-snow truncate">{{ team.name }}</p>
                <p class="text-xs text-christmas-gold-light">Classement : {{ team.ranking || '-' }}</p>
              </div>
            </div>
            <div class="ml-4 text-right">
              <span class="text-sm font-bold text-christmas-gold">Rang {{ team.ranking }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>