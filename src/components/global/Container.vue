<script setup lang="ts">
import { useFps } from '@vueuse/core';
import { ref, onMounted } from 'vue';

const fps = useFps()

interface Snowflake {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

const snowflakes = ref<Snowflake[]>([]);

onMounted(() => {
  // Générer les flocons de neige
  for (let i = 0; i < 50; i++) {
    snowflakes.value.push({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 4,
      size: 10 + Math.random() * 15,
      opacity: 0.3 + Math.random() * 0.5
    });
  }
});
</script>

<template>
  <span class="absolute text-christmas-gold z-10 font-bold">{{ fps }} FPS</span>
  <main class="maincontainer bg-gradient-to-br from-christmas-navy via-christmas-midnight to-christmas-navy">
    <!-- Arrière-plan avec flocons de neige -->
    <div class="snowflakes-container">
      <div
        v-for="snowflake in snowflakes"
        :key="snowflake.id"
        class="snowflake"
        :style="{
          left: `${snowflake.left}%`,
          '--delay': `${snowflake.delay}s`,
          '--duration': `${snowflake.duration}s`,
          '--size': `${snowflake.size}px`,
          '--opacity': snowflake.opacity,
        }"
      >
        ❄
      </div>
    </div>

    <div class="aside z-10 bg-gradient-to-b from-christmas-navy/95 to-christmas-midnight/90">
      <slot name="aside"></slot>
    </div>
    <div class="view z-10">
      <div class="lg:h-full w-full mb-14 lg:mb-0 max-w-7xl mx-auto p-5 space-y-8">
        <slot name="view"></slot>
      </div>
    </div>
  </main>
</template>

<style scoped>
.maincontainer {
  display: grid;
  grid-template-columns: auto 1fr;
  height: 100dvh;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.snowflakes-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.snowflake {
  position: absolute;
  top: -20px;
  font-size: var(--size);
  color: var(--color-christmas-ice);
  opacity: var(--opacity);
  text-shadow: 0 0 10px rgba(232, 244, 248, 0.6),
               0 0 20px rgba(212, 175, 55, 0.2);
  animation: snowfall var(--duration) linear var(--delay) infinite;
  user-select: none;
  filter: drop-shadow(0 0 2px rgba(212, 175, 55, 0.3));
}

@keyframes snowfall {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: var(--opacity);
  }
  50% {
    transform: translateY(50vh) translateX(100px) rotate(180deg);
    opacity: var(--opacity);
  }
  100% {
    transform: translateY(100vh) translateX(-50px) rotate(360deg);
    opacity: 0;
  }
}

.aside {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  backdrop-filter: blur(10px);
}

.aside>* {
  z-index: 1;
}

.view {
  height: 100%;
  scrollbar-color: var(--color-christmas-gold) transparent;
  scrollbar-width: thin;
  overflow-y: overlay;
  overflow-x: hidden;
}

/* Scrollbar personnalisée pour les navigateurs WebKit */
.view::-webkit-scrollbar {
  width: 8px;
}

.view::-webkit-scrollbar-track {
  background: transparent;
}

.view::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, var(--color-christmas-gold), var(--color-christmas-red));
  border-radius: 4px;
}

.view::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, var(--color-christmas-gold-light), var(--color-christmas-crimson));
}
</style>