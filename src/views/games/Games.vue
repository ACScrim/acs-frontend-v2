<script setup lang="ts">
import ListView from "@/components/global/ListView.vue";
import {Card} from "@/components/ui";


const games: any[] = [
  { id: 1, name: 'DailyQuiz', route: '/games/dailyquiz' },
  { id: 2, name: 'Créateur de Cartes', route: '/games/card-creator' },
  { id: 3, name: 'Collection de Cartes', route: '/games/card-collection' },
]

</script>

<template>
  <ListView  :data="games" title="Jeux disponibles" empty-message="Aucun jeu disponible pour le moment.">
    <template #item="{ item: game }">
      <Card :card="game" class="p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <span class="text-lg font-semibold text-white">{{ game.name }}</span>
          <router-link :to="game.route" class="inline-flex items-center gap-2 px-4 py-2 border border-white/30 rounded-full text-sm font-semibold text-white hover:bg-white/5 transition">
            Jouer
          </router-link>
        </div>
      </Card>
    </template>
  </ListView>
</template>