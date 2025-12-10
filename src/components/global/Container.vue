<script setup lang="ts">
import { ref } from 'vue';
import MobileMenu from './MobileMenu.vue';
import Footer from './Footer.vue';
import Confetti from "@/components/ui/Confetti.vue";

interface Orb {
  id: number;
  x: number;
  y: number;
  size: number;
  hue: number;
  delay: number;
}

const orbs = ref<Orb[]>(Array.from({ length: 5 }, (_, idx) => ({
  id: idx,
  x: Math.random() * 90,
  y: Math.random() * 90,
  size: 24 + Math.random() * 28,
  hue: 210 + Math.random() * 80,
  delay: Math.random() * 4,
})));
</script>

<template>
  <main class="relative grid overflow-hidden h-dvh w-full grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] bg-ink-950 place-items-stretch">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        v-for="orb in orbs"
        :key="orb.id"
        class="absolute rounded-[999px] blur-[120px] opacity-60 mix-blend-screen"
        :style="{
          left: `${orb.x}%`,
          top: `${orb.y}%`,
          width: `${orb.size}rem`,
          height: `${orb.size}rem`,
          background: `radial-gradient(circle, hsl(${orb.hue}deg 90% 65% / 0.8), transparent)` ,
          animation: `float-orb ${16 + orb.id * 2}s ease-in-out ${orb.delay}s infinite alternate`
        }"
      />
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)]" />
    </div>

    <aside class="relative hidden lg:flex flex-col border-r border-white/10 bg-gradient-to-b from-surface-700/40 to-surface-800/60 backdrop-blur-2xl overflow-y-auto">
      <slot name="aside" />
    </aside>

    <section class="relative z-10 flex flex-col overflow-y-auto view" data-acs-scroll-region>
      <div class="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-20 lg:py-5 lg:px-10">
        <slot name="view" />
      </div>
      <Footer />
      <Confetti manualstart :globalOptions="{ disableForReducedMotion: true }" class=" fixed top-0 left-0 right-0 bottom-0 h-screen overflow-y-auto pointer-events-none z-50" />
      <MobileMenu />
    </section>
  </main>
</template>

<style>
@keyframes float-orb {
  0% {
    transform: translate3d(0, 0, 0) scale(0.9);
    opacity: 0.6;
  }
  100% {
    transform: translate3d(8%, -10%, 0) scale(1.1);
    opacity: 0.9;
  }
}
</style>