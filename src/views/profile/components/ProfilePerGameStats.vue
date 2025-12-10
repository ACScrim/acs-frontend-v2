<script setup lang="ts">
import ListView from '@/components/global/ListView.vue';
import { Card, ProgressBar } from '@/components/ui';
import type { UserWithStats } from '@/types/models';

defineProps<{
  user: UserWithStats;
}>();
</script>

<template>
  <Card class="glass-panel p-8 space-y-6">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="h-px w-16 bg-gradient-to-r from-emerald-400 to-transparent" />
        <h2 class="hero-title font-display text-3xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-blush-300">Performance par jeu</h2>
      </div>
    </template>

    <ListView
      :data="user.perGameStats.sort((a, b) => (b.victoriesCount / b.tournamentsCount) - (a.victoriesCount / a.tournamentsCount))"
      empty-message="Aucune statistique de jeu disponible."
      :paginate="true"
      :items-per-page="3"
      :max-cols="1"
    >
      <template #item="{ item }">
        <Card class="flex flex-col gap-4 border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 group hover:border-white/20 transition md:flex-row md:items-center md:justify-between">
          <div class="flex items-center gap-4">
            <img :src="item.game.imageUrl" :alt="item.game.name" class="size-16 rounded-2xl object-cover ring-2 ring-accent-400/50 group-hover:ring-accent-300" />
            <div>
              <h3 class="text-lg font-semibold text-white group-hover:text-accent-200 transition">{{ item.game.name }}</h3>
              <p class="text-sm text-foam-300/70">
                {{ item.victoriesCount }}V · {{ item.tournamentsCount - item.victoriesCount }}D
              </p>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <p class="text-lg font-semibold text-white">
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-emerald-300">{{ (item.victoriesCount / item.tournamentsCount * 100).toFixed(0) }}%</span>
              <span class="text-sm text-foam-300/70"> taux de victoire</span>
            </p>
            <ProgressBar :max="100" :current="item.victoriesCount / item.tournamentsCount * 100" class="w-48 md:w-64" force-bar-color-class="bg-gradient-to-r from-accent-500 via-blush-500 to-emerald-500" :show-percentage="false" />
          </div>
        </Card>
      </template>
    </ListView>
  </Card>
</template>