<script setup lang="ts">
import TournamentCard from '@/components/global/TournamentCard.vue';
import { Button, Card } from '@/components/ui';
import useStatsStore from '@/stores/statsStore';
import useTournamentStore from '@/stores/tournamentStore';
import { useUserStore } from '@/stores/userStore';
import { API_URL } from '@/utils';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { useMotion } from '@vueuse/motion';
import { computed, ref } from 'vue';

const isHovered = ref(false);

const userStore = useUserStore();
const statsStore = useStatsStore();
const tournamentStore = useTournamentStore();

const defaultText = "Tu veux jouer avec nous ?";
const hoverText = "Rejoins-nous sur discord !";
const hoverTextConnected = "Rejoins-nous pendant un ACS !";

const userConnected = computed(() => userStore.isLoggedIn);

const displayText = computed(() => isHovered.value ? userConnected ? hoverTextConnected : hoverText : defaultText);
const homeStats = computed(() => statsStore.homeStats);

const lastFinishedTournament = computed(() => {
  return tournamentStore.finishedTournaments.length > 0
    ? tournamentStore.finishedTournaments[0]
    : null;
});

const titleRef = ref<HTMLElement>();
const { variant, motionProperties } = useMotion(titleRef, {
  initial: {
    translateY: 0
  },
  enter: {
    translateY: 0,
    transition: {
      duration: 1000,
      onComplete() {
        setTimeout(() => {
          variant.value = 'animate'
        }, 2000)
      },
    }
  },
  animate: {
    translateY: -72,
    transition: {
      duration: 1000,
      repeat: Infinity,
      repeatType: 'mirror',
      repeatDelay: 10000
    }
  }
})

</script>

<template>
  <div class="flex flex-col-reverse items-center lg:flex-row gap-x-20 py-12">
    <!-- Carte principale -->
    <Card 
      class="p-8! relative w-full lg:w-auto lg:max-w-4xl flex flex-col justify-between space-y-6" 
      style="background: linear-gradient(135deg, #0A1B3D 0%, #1a2942 100%); border: 2px solid #D4AF37;"
    >
      <template #header>
        <h1 
          class="uppercase text-6xl font-bold overflow-hidden text-christmas-snow drop-shadow-lg" 
          :title="`Alors ça ${(motionProperties as any)['translateY'] === 0 ? 'Scrim' : 'Chill'} ?`"
        >
          <span class="bg-gradient-to-r from-christmas-gold via-christmas-gold-light to-christmas-gold bg-clip-text text-transparent">
            Alors Ca
          </span>
          <div class="inline-block h-[4.5rem] overflow-hidden relative align-top leading-none ml-2">
            <div ref="titleRef" class="flex flex-col">
              <span class="inline-block h-[4.5rem] leading-none bg-gradient-to-r from-christmas-red to-christmas-crimson bg-clip-text text-transparent">Scrim</span>
              <span class="inline-block h-[4.5rem] leading-none bg-gradient-to-r from-christmas-pine to-christmas-forest bg-clip-text text-transparent">Chill</span>
            </div>
          </div>
          ?
        </h1>
        <p class="text-christmas-gold-light text-lg mt-2 opacity-90">Rejoins la communauté gaming ultime</p>
      </template>

      <!-- Stats Grid -->
      <div class="grid grid-cols-3 gap-4 mt-6">
        <div class="bg-gradient-to-br from-christmas-gold to-christmas-gold-light rounded-lg p-4 flex flex-col items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
          <span class="text-3xl font-bold text-christmas-navy">{{ homeStats.tournaments }}</span>
          <span class="text-sm text-christmas-navy font-semibold mt-2">Tournois joués</span>
        </div>
        <div class="bg-gradient-to-br from-christmas-red to-christmas-crimson rounded-lg p-4 flex flex-col items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
          <span class="text-3xl font-bold text-christmas-snow">{{ homeStats.users }}</span>
          <span class="text-sm text-christmas-snow font-semibold mt-2">Joueurs</span>
        </div>
        <div class="bg-gradient-to-br from-christmas-pine to-christmas-forest rounded-lg p-4 flex flex-col items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
          <span class="text-3xl font-bold text-christmas-ice">{{ homeStats.gamesPlayed }}</span>
          <span class="text-sm text-christmas-snow font-semibold mt-2">Jeux</span>
        </div>
      </div>

      <!-- Footer Button -->
      <template #footer>
        <Button 
          :to="userConnected ? '/tournaments' : `${API_URL}/auth/discord`" 
          icon-position="l" 
          @mouseenter="isHovered = true"
          @mouseleave="isHovered = false" 
        >
          <template #icon v-if="isHovered">
            <VueIcon name="bs:discord" class="text-2xl" />
          </template>
          <template #icon v-else>
            <VueIcon name="bs:controller" class="text-2xl" />
          </template>
          <span class="letter-animation">
            <span 
              v-for="(char, index) in displayText" 
              :key="`${char}-${index}-${isHovered}`"
              class="inline-block letter uppercase" 
              :style="{ animationDelay: `${index * 0.03}s` }"
            >
              {{ char === ' ' ? '\u00A0' : char }}
            </span>
          </span>
        </Button>
      </template>
    </Card>

    <!-- Right Section - TODO: Last Tournament -->
    <div class="basis-1/3 lg:aspect-square relative">
      <h2 class="text-white text-2xl font-bold absolute bottom-full">Dernier tournoi</h2>
      <RouterLink
        :to="lastFinishedTournament ? `/tournaments/${lastFinishedTournament.id}` : '#'"
      >
        <TournamentCard 
          :tournament="lastFinishedTournament"
          v-if="lastFinishedTournament"
        />
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
@keyframes letterFlip {
  0% {
    transform: rotateX(90deg);
    opacity: 0;
  }

  100% {
    transform: rotateX(0deg);
    opacity: 1;
  }
}

.letter {
  opacity: 0;
  transform: rotateX(90deg);
  animation: letterFlip 0.5s ease-out forwards;
  transform-origin: center;
}
</style>