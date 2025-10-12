<script setup lang="ts">
import { Button, Card } from '@/components/ui';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { ref, computed } from 'vue';

const isHovered = ref(false);

const defaultText = "Alors ça scrim ?";
const hoverText = "Rejoins-nous sur discord !";

const displayText = computed(() => isHovered.value ? hoverText : defaultText);
</script>

<template>
  <div class="flex flex-col-reverse lg:flex-row gap-x-20">
    <Card card-classes="p-8! relative max-w-4xl flex flex-col justify-between" color="acs-purple">
      <template #header>
        <h1 class="uppercase text-xl font-bold">Viens jouer avec nous !</h1>
      </template>

      <p>
        Nous organisons tous les lundi un tournoi fun sur différents jeux avec des équipes équilibrées en fonction
        du niveau des joueurs !
      </p>

      <template #footer>
        <Button to="/join-discord" icon-position="l" @mouseenter="isHovered = true"
          @mouseleave="isHovered = false" class="relative overflow-hidden">
          <template #icon v-if="isHovered">
            <VueIcon name="bs:discord" class="text-2xl" />
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
  /* État initial : invisible et tourné */
  opacity: 0;
  transform: rotateX(90deg);

  /* Animation qui garde les valeurs finales */
  animation: letterFlip 0.5s ease-out forwards;
  transform-origin: center;
}
</style>