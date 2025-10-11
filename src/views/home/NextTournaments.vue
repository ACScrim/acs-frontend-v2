<script setup lang="ts">
import { Badge, Button, Card } from '@/components/ui';
import TextSvg from '@/components/ui/TextSvg.vue';
import useTournamentStore from '@/stores/tournamentStore';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { formatDate } from '@vueuse/core';
import { computed } from 'vue';

const tournamentStore = useTournamentStore();
const tournaments = computed(() => tournamentStore.nextTournaments)
</script>

<template>
  <div>
    <TextSvg text="Les prochains tournois ?" stroke-color="black" :stroke-width="3" class="uppercase"
      fill-color="cyan" />
    <div class="grid grid-cols-3 gap-4">
      <Card variant="gaming" hoverable v-for="tournament in tournaments" class="px-0! py-0! overflow-hidden">
        <div class="flex flex-col">
          <div class="relative">
            <img :src="tournament.game.imageUrl" class="cover w-full h-50 aspect-video" />
            <Badge class="uppercase ml-auto absolute bottom-0 right-0 font-bold h-auto text-lg! bg-vibrant-purple-500 rounded-none rounded-tl-xl ">{{ formatDate(new Date(tournament.date), "dddd") }}</Badge>
          </div>
          <div class="space-y-4 p-2">
            <h2 class="text-xl font-bold">{{ tournament.name }}</h2>
            <ul class="flex flex-col">
              <li class="inline-flex gap-2 items-center"><VueIcon name="ak:calendar" /><span>{{ formatDate(new Date(tournament.date), "DD/MM/YYYY HH:mm") }}</span></li>
              <li class="inline-flex gap-2 items-center"><VueIcon name="cl:users-group" />{{ `${tournament.players.length} ${tournament.playerCap > 0 ? '/ ' + tournament.playerCap : ''}` }} joueurs</li>
            </ul>
            <Button variant="gaming" class="w-full text-xl">
              Je veux jouer !
            </Button>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>