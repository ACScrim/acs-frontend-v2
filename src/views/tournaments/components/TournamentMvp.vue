<script setup lang="ts">
import ListView from "@/components/global/ListView.vue";
import { Avatar, Button, Card } from "@/components/ui";
import { useUserStore } from "@/stores/userStore";
import type { Tournament } from "@/types/models";
import VueIcon from "@kalimahapps/vue-icons/VueIcon";
import { computed } from "vue";
import { getGameColor } from "../composables/useGameColor";

const props = defineProps<{
  tournament: Tournament;
}>();

const emit = defineEmits<{
  vote: [playerId: string];
  closeVote: [];
}>();

const sortedMvps = computed(() => {
  if (props.tournament.mvpVoteOpen) {
    return [];
  }
  return [...props.tournament.players].sort(
    (a, b) => (b.mvpVotes.length || 0) - (a.mvpVotes.length || 0)
  );
});

const isTournamentWinner = (playerId: string) => {
  return props.tournament.teams.some(
    (team) =>
      team.ranking === 1 && team.users.some((user) => user.id === playerId)
  );
};

const userIdIVotedFor = computed(() => {
  const myUserId = useUserStore().user?.id;
  if (!myUserId) return null;
  return props.tournament.players.find((player) =>
    player.mvpVotes.includes(myUserId)
  )?.user.id;
});

const headerColor = computed((): string => {
  const gameId = props.tournament.gameId || "default";
  return getGameColor(gameId);
});
</script>

<template>
  <Card class="p-6">
    <template #header>
      <div class="flex items-center justify-between">
        <h2
          class="text-2xl font-bold bg-gradient-to-r from-accent-500 via-emerald-500 to-blush-500 bg-clip-text text-transparent flex items-center gap-2 pl-4 -ml-4 py-1 border-l-4"
          :style="{ borderLeftColor: headerColor }"
        >
          <VueIcon name="bs:star-fill" class="text-accent-300" />
          <span>🏆 MVP du tournoi 🏆</span>
        </h2>
        <Button
          variant="emerald"
          v-if="
            tournament.mvpVoteOpen &&
            useUserStore().user?.role.includes('admin')
          "
          @click="emit('closeVote')"
        >
          Fermer le vote
        </Button>
      </div>
    </template>
    <!-- Mvp Vote -->
    <div v-if="tournament.mvpVoteOpen">
      <ListView :data="tournament.players.filter(p => !p.inWaitlist && !p.isCaster)">
        <template #item="{ item }">
          <div
            @click="emit('vote', item.id)"
            class="w-full flex flex-row items-center justify-between p-4 rounded-lg border cursor-pointer transition-all duration-300 hover:scale-[1.02] transform"
            :class="{
              'bg-emerald-500/20 border-emerald-400/50 shadow-emerald-400/20 shadow-lg':
                userIdIVotedFor === item.user.id,
              'bg-ink-800/50 border-white/10 hover:bg-ink-700/50 hover:border-white/20':
                userIdIVotedFor !== item.user.id,
              'opacity-60': userIdIVotedFor && userIdIVotedFor !== item.user.id,
            }"
          >
            <div class="inline-flex gap-2 items-center">
              <Avatar
                :src="item.user.avatarUrl"
                alt="Avatar"
                :fallback="item.user.username.charAt(0).toUpperCase()"
                class="border-2 overflow-hidden flex items-center justify-center transition-all duration-300"
                :class="
                  userIdIVotedFor === item.user.id
                    ? 'border-emerald-400/70'
                    : 'border-accent-300/30'
                "
                :size="10"
              />
              <span
                class="font-bold transition-colors duration-300"
                :class="
                  userIdIVotedFor === item.user.id
                    ? 'text-emerald-200'
                    : 'text-foam-50'
                "
              >
                {{ item.user.username }}
                <span v-if="isTournamentWinner(item.user.id)">🏆</span>
              </span>
            </div>
            <div class="flex items-center gap-2">
              <VueIcon
                v-if="userIdIVotedFor === item.user.id"
                name="bs:check-circle-fill"
                class="text-emerald-400 text-lg animate-pulse"
              />
              <span v-else class="text-foam-300/60 text-sm"
                >Cliquez pour voter</span
              >
            </div>
          </div>
        </template>
      </ListView>
    </div>
    <!-- Mvp Results -->
    <div v-else>
      <div
        v-if="sortedMvps && sortedMvps.length > 0 && sortedMvps[0]"
        class="mb-6 flex flex-col items-center"
      >
        <Avatar
          :src="sortedMvps[0].user.avatarUrl"
          alt="Avatar"
          :fallback="sortedMvps[0].user.username.charAt(0).toUpperCase()"
          class="rounded-full border-4 border-accent-300/40 overflow-hidden flex items-center justify-center mb-4"
          :size="24"
        />
        <h3 class="text-2xl font-bold text-foam-50 mb-2">
          {{ sortedMvps[0].user.username }}
          <span v-if="isTournamentWinner(sortedMvps[0].user.id)">🏆</span>
        </h3>
        <p class="text-foam-200 text-lg">
          {{ sortedMvps[0].mvpVotes.length || 0 }} vote(s)
        </p>
      </div>
      <ListView :data="sortedMvps.slice(1, 4)" :max-cols="3">
        <template #item="{ item }">
          <div
            class="w-full flex flex-col items-center justify-between p-4 bg-ink-800/50 rounded-lg border border-white/10"
          >
            <div class="inline-flex gap-2 items-center">
              <Avatar
                :src="item.user.avatarUrl"
                alt="Avatar"
                :fallback="item.user.username.charAt(0).toUpperCase()"
                class="rounded-full border-2 border-accent-300/30 overflow-hidden flex items-center justify-center"
                :size="10"
              />
              <span class="font-bold text-foam-50"
                >{{ item.user.username }}
                <span v-if="isTournamentWinner(item.user.id)">🏆</span></span
              >
            </div>
            <span class="font-medium text-foam-200"
              >{{ item.mvpVotes.length || 0 }} vote(s)</span
            >
          </div>
        </template>
      </ListView>
    </div>
  </Card>
</template>
