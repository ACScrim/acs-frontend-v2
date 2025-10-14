<script setup lang="ts">
import { Button, Card } from '@/components/ui';
import useStatsStore from '@/stores/statsStore';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { useMotion } from '@vueuse/motion';
import { computed, ref } from 'vue';

const isHovered = ref(false);

const statsStore = useStatsStore();

const defaultText = "Tu veux jouer avec nous ?";
const hoverText = "Rejoins-nous sur discord !";

const displayText = computed(() => isHovered.value ? hoverText : defaultText);
const homeStats = computed(() => statsStore.homeStats);

const titleRef = ref<HTMLElement>();
const { variant } = useMotion(titleRef, {
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
    translateY: -72, // Hauteur d'une ligne de texte
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
  <div class="flex flex-col-reverse items-center lg:flex-row gap-x-20">
    <Card card-classes="p-8! relative max-w-4xl flex flex-col justify-between space-y-4" color="acs-purple">
      <template #header>
        <h1 class="uppercase text-6xl font-bold overflow-hidden">
          Alors Ca 
          <div class="inline-block h-[4.5rem] overflow-hidden relative align-top leading-none">
            <div ref="titleRef" class="flex flex-col">
              <span class="inline-block h-[4.5rem] leading-none">Scrim</span>
              <span class="inline-block h-[4.5rem] leading-none">Chill</span>
            </div>
          </div>
          ?
        </h1>
      </template>

      <div class="grid grid-cols-3 gap-4">
        <Card card-classes="shadow-acs-button flex flex-col items-center justify-center [&>footer]:mt-0 p-2" color="white">
          <span class="text-xl font-bold">{{ homeStats.tournaments }}</span>
          <template #footer>
            Tournois joués
          </template>
        </Card>
        <Card card-classes="shadow-acs-button flex flex-col items-center justify-center [&>footer]:mt-0 p-2" color="white">
          <span class="text-xl font-bold">{{ homeStats.users }}</span>
          <template #footer>
            Joueurs
          </template>
        </Card>
        <Card card-classes="shadow-acs-button flex flex-col items-center justify-center [&>footer]:mt-0 p-2" color="white">
          <span class="text-xl font-bold">{{ homeStats.gamesPlayed }}</span>
          <template #footer>
            Jeux
          </template>
        </Card>
      </div>

      <template #footer>
        <Button to="/join-discord" icon-position="l" @mouseenter="isHovered = true"
          @mouseleave="isHovered = false" class="relative overflow-hidden text-acs-purple font-bold">
          <template #icon v-if="isHovered">
            <VueIcon name="bs:discord" class="text-2xl" />
          </template>
          <template #icon v-else>
            <VueIcon name="bs:controller" class="text-2xl" />
          </template>
          <span class="letter-animation">
            <span v-for="(char, index) in displayText" :key="`${char}-${index}-${isHovered}`"
              class="inline-block letter uppercase" :style="{ animationDelay: `${index * 0.03}s` }">
              {{ char === ' ' ? '\u00A0' : char }}
            </span>
          </span>
        </Button>
      </template>
    </Card>
    <div class="basis-1/3 h-60 lg:aspect-square">
      <img src="/Logo_ACS.png" class="w-60 h-60 place-self-center" />
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