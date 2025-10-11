<script setup lang="ts">
import Card from '@/components/ui/Card.vue';
import { useIntersectionObserver } from '@vueuse/core';
import { ref, shallowRef, useTemplateRef } from 'vue';

// Valeurs cibles
const targetTournaments = 50;
const targetMembers = 120;
const targetGames = 15;

const tournaments = ref(0);
const members = ref(0);
const games = ref(0);

const animateCounter = (target: number, duration: number, callback: (value: number) => void) => {
  const startTime = performance.now();

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.round(easeOut * target);

    callback(currentValue);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
}

const statsContainer = useTemplateRef<HTMLElement>('statsContainer');
const hasAnimated = shallowRef(false);

useIntersectionObserver(
  statsContainer,
  ([entry]) => {
    if (entry?.isIntersecting && !hasAnimated.value) {
      hasAnimated.value = true;
      
      // Animer avec des délais différents
      setTimeout(() => animateCounter(targetTournaments, 2000, (v) => tournaments.value = v), 0);
      setTimeout(() => animateCounter(targetMembers, 2000, (v) => members.value = v), 200);
      setTimeout(() => animateCounter(targetGames, 2000, (v) => games.value = v), 400);
    }
  },
  { threshold: 0.3 }
);
</script>

<template>
  <div ref="statsContainer" class="grid grid-cols lg:grid-cols-3 gap-6">
    <Card variant="gaming" hoverable class="py-6!">
      <p class="text-6xl place-self-center font-bold">{{ tournaments }}</p>
      <p class="text-3xl place-self-center font-bold mt-5">Tournois joués</p>
    </Card>
    <Card variant="gaming" hoverable class="py-6!">
      <p class="text-6xl place-self-center font-bold">{{ members }}</p>
      <p class="text-3xl place-self-center font-bold mt-5">Membres</p>
    </Card>
    <Card variant="gaming" hoverable class="py-6!">
      <p class="text-6xl place-self-center font-bold">{{ games }}</p>
      <p class="text-3xl place-self-center font-bold mt-5">Jeux</p>
    </Card>
  </div>
</template>


<style scoped>
  .grid {
    & div {
      &:first-child {
        background: var(--color-vibrant-orange-500);
      }
      &:last-child {
        background: var(--color-vibrant-purple-500);
      }
      background: var(--color-gradient-vibrant-sunset);
    }
  }
</style>