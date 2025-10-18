<script setup lang="ts">
import ListView from '@/components/global/ListView.vue';
import { Avatar, Button, Card } from '@/components/ui';
import type { Tournament } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { computed } from 'vue';

const props = defineProps<{
  tournament: Tournament;
}>();

const sortedMvps = computed(() => {
  if (props.tournament.mvpVoteOpen) {
    return [];
  }
  return [...props.tournament.players].sort((a, b) => (b.mvpVotes.length || 0) - (a.mvpVotes.length || 0));
});

const isTournamentWinner = (playerId: string) => {
  return props.tournament.teams.some(team =>
    team.ranking === 1 && team.users.some(user => user.id === playerId)
  );
};
</script>

<template>
  <Card class="p-6" style="border: 2px solid #D4AF37;">
    <template #header>
      <h2 class="text-2xl font-bold bg-gradient-to-r from-christmas-gold via-christmas-gold-light to-christmas-gold bg-clip-text text-transparent flex items-center gap-2">
        <VueIcon name="bs:star-fill" class="text-christmas-gold" />
        <span>🏆 MVP du tournoi 🏆</span>
      </h2>
    </template>
    <!-- Mvp Vote -->
    <div v-if="tournament.mvpVoteOpen">
      <ListView :data="tournament.players">
        <template #item="{ item }">
          <div class="w-full flex items-center justify-between p-4 bg-christmas-navy/30 rounded-lg border border-christmas-gold/20">
            <div class="inline-flex gap-2 items-center">
              <Avatar :src="item.user.avatarUrl" alt="Avatar" :fallback="item.user.username.charAt(0).toUpperCase()"
              class="size-10 [&>img]:size-10 rounded-full border-2 border-christmas-gold/30 overflow-hidden flex items-center justify-center" />
              <span class="font-bold text-christmas-gold">{{ item.user.username }} <span v-if="isTournamentWinner(item.user.id)">🏆</span></span>
            </div>
            <Button class="px-2 py-1 text-md">Vote</Button>
          </div>
        </template>
      </ListView>
    </div>
    <!-- Mvp Results -->
    <div v-else>
      <ListView :data="sortedMvps.slice(0, 4)" :max-cols="3">
        <template #item="{ item }">
          <div class="w-full flex items-center justify-between p-4 bg-christmas-navy/30 rounded-lg border border-christmas-gold/20 first:col-span-1 md:first:col-span-2 2xl:first:col-span-3">
            <div class="inline-flex gap-2 items-center">
              <Avatar :src="item.user.avatarUrl" alt="Avatar" :fallback="item.user.username.charAt(0).toUpperCase()"
              class="size-10 [&>img]:size-10 rounded-full border-2 border-christmas-gold/30 overflow-hidden flex items-center justify-center" />
              <span class="font-bold text-christmas-gold">{{ item.user.username }} <span v-if="isTournamentWinner(item.user.id)">🏆</span></span>
            </div>
            <span class="font-medium text-christmas-snow">{{ item.mvpVotes.length || 0 }} vote(s)</span>
          </div>
        </template>
      </ListView>
    </div>
  </Card>
</template>