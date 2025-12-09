<script setup lang="ts">
import { Card } from '../ui';

withDefaults(defineProps<{
  title?: string,
  showHeader?: boolean,
  subtitle?: string
}>(), {
  showHeader: true,
  subtitle: 'Plateforme tournois'
});
</script>

<template>
  <Card :class="`p-6 glass-panel ${!$slots?.default ? '[&>header]:mb-0' : ''}`">
    <template #header v-if="showHeader">
      <p class="text-xs uppercase tracking-[0.4em] text-foam-300/60">{{ subtitle }}</p>
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="hero-title flex items-center gap-3">
            <span class="text-accent-300"><slot name="icon" /></span>
            <span>{{ title }}</span>
          </h2>
        </div>
        <slot name="actions" />
      </div>
    </template>

    <slot />
  </Card>
</template>