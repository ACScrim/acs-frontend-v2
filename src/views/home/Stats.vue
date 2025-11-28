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
  <section ref="statsContainer" class="grid gap-6 md:grid-cols-3">
    <Card v-for="stat in [
      { value: tournaments, label: 'Tournois joués' },
      { value: members, label: 'Membres' },
      { value: games, label: 'Jeux' }
    ]" :key="stat.label" class="glass-panel border-white/5 bg-white/5 p-6 text-center">
      <p class="hero-title text-5xl">{{ stat.value }}</p>
      <p class="mt-3 text-sm uppercase tracking-[0.4em] text-foam-300/70">{{ stat.label }}</p>
    </Card>
  </section>
</template>

<style scoped>
</style>