<script setup lang="ts">
import ListView from '@/components/global/ListView.vue';
import { Card, ProgressBar } from '@/components/ui';
import type { UserWithStats } from '@/types/models';

defineProps<{
  user: UserWithStats;
}>();
</script>

<template>
  <Card class="p-6 bg-christmas-navy/80" style="--tw-border-color: var(--color-christmas-ice)">
    <ListView
      :data="user.perGameStats"
      title="Performance par jeu"
      :paginate="true"
      :items-per-page="3"
      :max-cols="1"
    >
      <template #item="{ item }">
        <Card class="flex flex-col md:flex-row gap-4   items-center justify-between border-christmas-gold border-1 p-4">
          <div class="flex items-center gap-4">
            <img :src="item.game.imageUrl" :alt="item.game.name" class="size-16 object-cover lg:mb-0 lg:mr-4" />
            <div class="flex flex-col gap-1">
              <h3 class="text-lg font-semibold">{{ item.game.name }}</h3>
              <p class="text-sm text-gray-400">
                <span class="text-christmas-forest">{{ item.victoriesCount }}V</span>
                |
                <span class="text-christmas-crimson">{{ item.tournamentsCount - item.victoriesCount }}D</span>
              </p>
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <p class="text-lg font-semibold"><span class="font-bold text-christmas-gold">{{ item.victoriesCount / item.tournamentsCount * 100 }}</span> % Taux de victoire</p>
            <ProgressBar :max="100" :current="item.victoriesCount / item.tournamentsCount * 100" class="w-48 md:w-64" force-bar-color-class="bg-gradient-to-r from-christmas-gold-light to-christmas-gold" :show-percentage="false" />
          </div>
        </Card>
      </template>
    </ListView>
  </Card>
</template>