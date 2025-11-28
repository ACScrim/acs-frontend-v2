<script setup lang="ts">
import LoaderACS from '@/components/global/LoaderACS.vue';
import PageHeader from '@/components/global/PageHeader.vue';
import { Select } from '@/components/ui';
import useSeasonStore from '@/stores/seasonStore';
import { useToastStore } from '@/stores/toastStore';
import { type ApiResponse, type LeaderboardEntry } from '@/types/models';
import api from '@/utils/api';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { whenever } from '@vueuse/core';
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

const seasonFilter = ref('');

const seasonStore = useSeasonStore();
const seasons = computed(() => seasonStore.seasons);

const leaderboard = ref<LeaderboardEntry[]>([]);
onMounted((async () => {
  try {
    const response = await api.get<ApiResponse<LeaderboardEntry[]>>(`/leaderboard?season=${seasonFilter.value}`);
    leaderboard.value = response.data.data;

    seasonStore.fetchSeasons();
  } catch (error: any) {
    useToastStore().error('Error fetching leaderboard:', error.message || error);
  }
}))

whenever(seasonFilter, async () => {
  try {
    const response = await api.get<ApiResponse<LeaderboardEntry[]>>(`/leaderboard?season=${seasonFilter.value}`);
    leaderboard.value = response.data.data;
  } catch (error: any) {
    useToastStore().error('Error fetching leaderboard:', error.message || error);
  }
});

whenever(seasons, () => {
  seasonFilter.value = seasonStore.seasons[0]?.number ? String(seasonStore.seasons[0].number) : '';
});

const medalColors = ['text-amber-400', 'text-foam-300', 'text-blush-400'];
const rowTones = ['from-emerald-500/5 to-transparent', 'from-accent-500/5 to-transparent'];

const getRowTone = (index: number) => rowTones[index % rowTones.length];
</script>

<template>
  <div class="space-y-10">
    <PageHeader title="Classement global" subtitle="Performance cumulée">
      <template #icon>
        <VueIcon name="ic:leaderboard-star" class="text-3xl text-accent-300" />
      </template>
      <template #actions>
        <Select v-model="seasonFilter"
          class="min-w-[220px]"
          :options="seasons.map(season => ({ label: `${season.number === 0 ? 'Alors ça chill' : `Saison ${season.number}`}`, value: String(season.number) }))"
          default-option-label="Toutes les saisons" />
      </template>
    </PageHeader>

    <LoaderACS v-if="seasonStore.isLoading" class="place-self-center" />

    <div v-else class="glass-panel overflow-hidden">
      <div class="hidden md:grid grid-cols-[80px_2fr_2fr_1fr] gap-4 px-6 py-4 text-xs uppercase tracking-[0.4em] text-foam-300/60">
        <span class="flex items-center gap-2"><VueIcon name="bs:trophy" />Position</span>
        <span class="flex items-center gap-2"><VueIcon name="bs:person-circle" />Utilisateur</span>
        <span class="flex items-center gap-2"><VueIcon name="bs:calendar-event" />Tournois</span>
        <span class="flex items-center gap-2"><VueIcon name="bs:star" />Points</span>
      </div>

      <div class="divide-y divide-white/5">
        <div v-for="(entry, index) in leaderboard" :key="entry.user.id" class="flex flex-col gap-4 px-4 py-5 md:grid md:grid-cols-[80px_2fr_2fr_1fr] md:items-center md:gap-6">
          <div class="flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <VueIcon v-if="index < 3" name="bs:award" :class="['text-xl', medalColors[index]]" />
              <span v-else class="text-lg font-semibold text-white/70">#{{ index + 1 }}</span>
            </div>
            <div class="hidden md:block text-sm text-white/70">#{{ index + 1 }}</div>
          </div>

          <RouterLink :to="`/profile/${entry.user.id}`" class="flex items-center gap-4 text-left">
            <img :src="entry.user.avatarUrl" alt="Avatar" class="size-14 rounded-2xl border border-white/10 object-cover" />
            <div>
              <p class="text-white font-semibold">{{ entry.user.username }}</p>
              <p class="text-xs uppercase tracking-[0.3em] text-foam-300/60">{{ entry.user.role }}</p>
            </div>
          </RouterLink>

          <div class="flex flex-wrap gap-3 text-sm text-foam-200/90">
            <span class="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <VueIcon name="bs:trophy" class="text-emerald-300" /> {{ entry.tournamentsCount }} tournois
            </span>
            <span class="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <VueIcon name="bs:check2-circle" class="text-accent-300" /> {{ entry.victoriesCount }} victoires
            </span>
            <span class="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <VueIcon name="io:podium" class="text-blush-400" /> {{ entry.top25Count }} top 25
            </span>
          </div>

          <div class="text-right text-2xl font-semibold text-white/90 md:text-left">
            {{ entry.points }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>