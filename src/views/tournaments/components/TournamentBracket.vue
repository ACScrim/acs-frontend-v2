<script setup lang="ts">
import { Card } from '@/components/ui';
import type { Tournament } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { computed } from 'vue';

const props = defineProps<{ tournament: Tournament }>();

const hasBracket = computed(() => !!props.tournament.challongeUrl);
</script>

<template>
  <div v-if="hasBracket" class="space-y-4">
    <Card class="glass-panel p-6">
      <div class="flex items-start justify-between gap-4 mb-4">
        <div>
          <p class="text-xs uppercase tracking-[0.4em] text-foam-300/70 mb-2">Bracket</p>
          <h2 class="text-2xl font-bold text-white">Bracket du tournoi</h2>
        </div>
        <a 
          :href="tournament.challongeUrl" 
          target="_blank"
          class="px-4 py-2 bg-gradient-to-br from-accent-500 to-emerald-400 text-ink-900 font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <VueIcon name="bs:box-arrow-up-right" />
          Voir sur Challonge
        </a>
      </div>

      <!-- Bracket iframe -->
      <div class="bracket-container">
        <iframe 
          :src="tournament.challongeUrl + '/module'"
          class="absolute top-0 left-0 w-full h-full rounded-lg border border-white/10 bg-ink-900/30"
          frameborder="0"
          scrolling="auto"
          allowtransparency="true"
        ></iframe>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.bracket-container {
  @apply relative w-full;
  padding-bottom: 56.25%; /* 16:9 aspect ratio for iframe */
}
</style>
