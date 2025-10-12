<script setup lang="ts">
import TextSvg from '@/components/ui/TextSvg.vue';
import Hero from './Hero.vue';
import Stats from './Stats.vue';
import NextTournaments from './NextTournaments.vue';
</script>

<template>
  <div class="lg:h-full flex flex-col justify-center gap-8 py-5">
    <Hero />
    <NextTournaments />
  </div>
  <TextSvg text="Quelques stats ?" stroke-color="black" :stroke-width="3" class="uppercase"
    fill-color="var(--color-vibrant-cyan-500)" />
  <Stats />
</template>