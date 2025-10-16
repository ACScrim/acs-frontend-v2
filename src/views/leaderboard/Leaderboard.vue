<script setup lang="ts">
import { type ApiResponse, type LeaderboardEntry } from '@/types/models';
import api from '@/utils/api';
import { computed, onMounted, ref } from 'vue';


const leaderboard = ref<LeaderboardEntry[]>([]);
onMounted((async () => {
  try {
    const response = await api.get<ApiResponse<LeaderboardEntry[]>>('/leaderboard?season=3');
    leaderboard.value = response.data.data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
  }
}))
</script>

<template>
  <div class="flex flex-col lg:flex-row min-h-screen">
    <Sidebar />
    <main class="flex-1 p-4 lg:p-8">
      <h1 class="text-3xl font-bold mb-6">Classement</h1>
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr>
              <th class="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Position</th>
              <th class="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Utilisateur</th>
              <th class="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Points</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(entry, index) in leaderboard" :key="entry.user.id" :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'">
              <td class="px-6 py-4 border-b border-gray-200 text-sm text-gray-900">{{ index + 1 }}</td>
              <td class="px-6 py-4 border-b border-gray-200 text-sm text-gray-900 flex items-center gap-4">
                <img :src="entry.user.avatarUrl" alt="Avatar" class="w-10 h-10 rounded-full" />
                {{ entry.user.username }}
              </td>
              <td class="px-6 py-4 border-b border-gray-200 text-sm text-gray-900">{{ entry.points }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>