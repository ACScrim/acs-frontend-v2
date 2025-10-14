<script setup lang="ts">
import { useFps } from '@vueuse/core';

const fps = useFps()
</script>

<template>
  <span class="absolute text-green-500">{{ fps }}</span>
  <main class="maincontainer bg-acs-orange-light">
    <div class="aside">
      <slot name="aside"></slot>
    </div>
    <div class="view">
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
  background-size: 40px 40px;
  background-image:
    linear-gradient(to right, #80808024 1px, transparent 1px),
    linear-gradient(to bottom, #80808024 1px, transparent 1px);
  z-index: -1;
}

.aside {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.aside > * {
  z-index: 1;
}

.view {
  height: 100%;
  scrollbar-color: var(--color-vibrant-cyan-500) transparent;
  scrollbar-width: thin;
  overflow-y: overlay;
  overflow-x: hidden;
}
</style>