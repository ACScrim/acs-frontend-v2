<script setup lang="ts">
import { Avatar } from '@/components/ui';
import type { User } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { RouterLink } from 'vue-router';

defineProps<{
  player: User & {
    hasCheckin: boolean;
    isCaster: boolean;
    inWaitlist: boolean;
  };
  reminderSent?: boolean;
  tournamentStarted: boolean;
}>();
</script>

<template>
  <div class="flex items-center justify-between rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-4">
    <RouterLink :to="`/profile/${player.id}`" class="flex items-center gap-4">
      <Avatar :src="player.avatarUrl" :alt="player.username" :fallback="player.username.charAt(0).toUpperCase()" class="border border-white/20" />
      <div>
        <p class="text-white font-semibold">{{ player.username }}</p>
        <p class="text-xs uppercase tracking-[0.3em] text-foam-300/70">
          {{ player.isCaster ? 'Caster' : player.inWaitlist ? 'En attente' : 'Joueur' }}
        </p>
      </div>
    </RouterLink>
    <div class="flex items-center gap-3">
      <a v-if="player.twitchSubscriptionId && player.twitchUsername" :href="`https://www.twitch.tv/${player.twitchUsername}`" target="_blank" rel="noopener noreferrer" class="text-accent-300">
        <VueIcon name="ak:twitch-fill" class="text-2xl" />
      </a>
      <VueIcon v-if="!tournamentStarted && reminderSent && player.hasCheckin" name="bs:check2-circle" class="text-emerald-400 text-xl" />
      <VueIcon v-else-if="!tournamentStarted && reminderSent && !player.hasCheckin" name="bs:exclamation-circle" class="text-blush-400 text-xl" />
    </div>
  </div>
</template>