<script setup lang="ts">
import { Card, Select } from '@/components/ui';
import useSeasonStore from '@/stores/seasonStore';
import { type ApiResponse, type LeaderboardEntry } from '@/types/models';
import api from '@/utils/api';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { whenever } from '@vueuse/core';
import { computed, onMounted, ref } from 'vue';

const seasonFilter = ref('');

const seasonStore = useSeasonStore();
const seasons = computed(() => seasonStore.seasons);

const leaderboard = ref<LeaderboardEntry[]>([]);
onMounted((async () => {
  try {
    const response = await api.get<ApiResponse<LeaderboardEntry[]>>(`/leaderboard?season=${seasonFilter.value}`);
    leaderboard.value = response.data.data;

    seasonStore.fetchSeasons();
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
  }
}))

whenever(seasonFilter, async () => {
  try {
    const response = await api.get<ApiResponse<LeaderboardEntry[]>>(`/leaderboard?season=${seasonFilter.value}`);
    leaderboard.value = response.data.data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
  }
});

const getMedalIcon = (index: number) => {
  if (index === 0) return 'bs:award';
  if (index === 1) return 'bs:award';
  if (index === 2) return 'bs:award';
  return '';
};

const getMedalColor = (index: number) => {
  if (index === 0) return 'text-christmas-gold';
  if (index === 1) return 'text-christmas-silver';
  if (index === 2) return 'text-christmas-crimson';
  return '';
};
</script>

<template>
  <Card 
    card-classes="p-6!"
    style="background: linear-gradient(135deg, #0A1B3D 0%, #1a2942 100%); border: 2px solid #D4AF37;"
  >
    <template #header>
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 class="uppercase text-4xl font-bold bg-gradient-to-r from-christmas-gold via-christmas-gold-light to-christmas-gold bg-clip-text text-transparent">
          <span class="inline-flex gap-2 items-center">
            <VueIcon name="ic:leaderboard-star" class="text-christmas-gold text-4xl" />
            Classement
          </span>
        </h2>
      </div>
    </template>

    <div class="flex flex-col md:flex-row gap-4 items-center">
      <label class="text-christmas-gold-light font-semibold flex items-center gap-2">
        <VueIcon name="bs:funnel" class="text-christmas-gold" />
        Filtrer par saison :
      </label>
      <Select
        v-model="seasonFilter"
        :options="seasons.map(season => ({ label: `${season.number === 0 ? 'Alors ça chill' : `Saison ${season.number}`}`, value: String(season.number) }))"
      />
    </div>
  </Card>

  <div class="overflow-x-auto">
    <table class="min-w-full shadow-lg rounded-lg overflow-hidden border-2 border-christmas-gold/30">
      <thead>
        <tr class="bg-gradient-to-r from-christmas-gold via-christmas-gold-light to-christmas-gold">
          <th class="px-6 py-4 border-b-2 border-christmas-gold/50 text-left text-sm font-bold text-christmas-navy uppercase tracking-wide">
            <span class="inline-flex items-center gap-2">
              <VueIcon name="bs:trophy" />
              Position
            </span>
          </th>
          <th class="px-6 py-4 border-b-2 border-christmas-gold/50 text-left text-sm font-bold text-christmas-navy uppercase tracking-wide">
            <span class="inline-flex items-center gap-2">
              <VueIcon name="bs:person-circle" />
              Utilisateur
            </span>
          </th>
          <th class="px-6 py-4 border-b-2 border-christmas-gold/50 text-left text-sm font-bold text-christmas-navy uppercase tracking-wide">
            <span class="inline-flex items-center gap-2">
              <VueIcon name="bs:calendar-event" />
              Tournois
            </span>
          </th>
          <th class="px-6 py-4 border-b-2 border-christmas-gold/50 text-left text-sm font-bold text-christmas-navy uppercase tracking-wide">
            <span class="inline-flex items-center gap-2">
              <VueIcon name="bs:star" />
              Points
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="(entry, index) in leaderboard" 
          :key="entry.user.id" 
          :class="[
            'transition-all duration-300 hover:scale-105 hover:shadow-lg',
            index === 0 ? 'bg-gradient-to-r from-christmas-gold/20 to-christmas-gold-light/10 border-l-4 border-christmas-gold shadow-md hover:shadow-xl hover:shadow-christmas-gold/40' : 
            index === 1 ? 'bg-gradient-to-r from-christmas-silver/20 to-christmas-gold/10 border-l-4 border-christmas-silver' :
            index === 2 ? 'bg-gradient-to-r from-christmas-red/20 to-christmas-crimson/10 border-l-4 border-christmas-red' :
            index % 2 === 0 ? 'bg-christmas-navy/30 border-l-4 border-christmas-navy/50' : 'bg-christmas-midnight/30 border-l-4 border-christmas-midnight/50'
          ]"
        >
          <td class="px-6 py-4 border-b border-christmas-gold/20 text-sm font-bold">
            <div class="flex items-center gap-3">
              <VueIcon 
                v-if="getMedalIcon(index)"
                :name="getMedalIcon(index)"
                :class="[
                  'text-2xl',
                  getMedalColor(index)
                ]"
              />
              <span class="bg-gradient-to-r from-christmas-gold to-christmas-gold-light bg-clip-text text-transparent font-black text-lg">
                #{{ index + 1 }}
              </span>
            </div>
          </td>
          <td class="px-6 py-4 border-b border-christmas-gold/20 text-sm text-christmas-snow font-semibold flex items-center gap-4">
            <img 
              :src="entry.user.avatarUrl" 
              alt="Avatar" 
              class="w-12 h-12 rounded-full border-2 border-christmas-gold shadow-lg hover:shadow-xl hover:shadow-christmas-gold/50 transition-all" 
            />
            <span class="hover:text-christmas-gold-light transition-colors">{{ entry.user.username }}</span>
          </td>
          <td class="px-6 py-4 border-b border-christmas-gold/20 text-sm text-christmas-gold-light font-semibold">
            <div class="flex gap-4">
              <span class="inline-flex items-center gap-1 bg-christmas-red/20 px-3 py-1 rounded-lg border border-christmas-red/50">
                <VueIcon name="bs:trophy" class="text-christmas-red" />
                {{ entry.tournamentsCount }}
              </span>
              <span class="inline-flex items-center gap-1 bg-christmas-green/20 px-3 py-1 rounded-lg border border-christmas-green/50">
                <VueIcon name="bs:check2-circle" class="text-christmas-green" />
                {{ entry.victoriesCount }}W
              </span>
              <span class="inline-flex items-center gap-1 bg-christmas-gold/20 px-3 py-1 rounded-lg border border-christmas-gold/50">
                <VueIcon name="io:podium" class="text-christmas-gold" />
                {{ entry.top25Count }}
              </span>
            </div>
          </td>
          <td class="px-6 py-4 border-b border-christmas-gold/20 text-sm font-black">
            <span class="bg-gradient-to-r from-christmas-gold via-christmas-gold-light to-christmas-gold bg-clip-text text-transparent text-lg">
              {{ entry.points }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>