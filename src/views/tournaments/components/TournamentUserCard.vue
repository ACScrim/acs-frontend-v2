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
  <div class="p-4 bg-christmas-navy/30 rounded-lg border border-christmas-gold/20 flex items-center justify-between">
    <RouterLink :to="`/profile/${player.id}`" class="flex items-center gap-4">
      <Avatar :src="player.avatarUrl" alt="Avatar" :fallback="player.username.charAt(0).toUpperCase()"
        class="size-12 rounded-full border-2 border-christmas-gold/30 overflow-hidden flex items-center justify-center" />
      <div>
        <p class="text-christmas-snow font-bold">{{ player.username }}</p>
        <p class="text-christmas-gold-light text-sm">{{ player.isCaster ? 'Caster' : player.inWaitlist ? 'En attente' : 'Joueur' }}</p>
      </div>
    </RouterLink>
    <div class="flex items-center gap-4">
      <RouterLink v-if="player.twitchSubscriptionId && player.twitchUsername" to="" :href="`https://www.twitch.tv/${player.twitchUsername}`" target="_blank">
        <VueIcon name="ak:twitch-fill" class="text-2xl text-purple-800" />
      </RouterLink>
      <VueIcon v-if="!tournamentStarted && reminderSent && player.hasCheckin" name="bs:check-2-circle" class="text-xl text-christmas-pine" />
      <VueIcon v-else-if="!tournamentStarted && reminderSent && !player.hasCheckin" name="bs:exclamation-circle" class="text-xl text-christmas-red" />
    </div>
  </div>
</template>