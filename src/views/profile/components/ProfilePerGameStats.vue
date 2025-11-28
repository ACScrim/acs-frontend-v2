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
    <ListView
      :data="user.perGameStats.sort((a, b) => (b.victoriesCount / b.tournamentsCount) - (a.victoriesCount / a.tournamentsCount))"
      title="Performance par jeu"
      :paginate="true"
      :items-per-page="3"
      :max-cols="1"
    >
      <template #item="{ item }">
        <Card class="flex flex-col gap-4 border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between">
          <div class="flex items-center gap-4">
            <img :src="item.game.imageUrl" :alt="item.game.name" class="size-16 rounded-2xl object-cover" />
            <div>
              <h3 class="text-lg font-semibold text-white">{{ item.game.name }}</h3>
              <p class="text-sm text-foam-300/70">
                {{ item.victoriesCount }}V · {{ item.tournamentsCount - item.victoriesCount }}D
              </p>
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <p class="text-lg font-semibold text-white">
              <span class="text-accent-200">{{ (item.victoriesCount / item.tournamentsCount * 100).toFixed(0) }}%</span>
              <span class="text-sm text-foam-300/70"> taux de victoire</span>
            </p>
            <ProgressBar :max="100" :current="item.victoriesCount / item.tournamentsCount * 100" class="w-48 md:w-64" force-bar-color-class="bg-gradient-to-r from-accent-500 via-blush-500 to-emerald-500" :show-percentage="false" />
          </div>
        </Card>
      </template>
    </ListView>
  </Card>
</template>