<script setup lang="ts">
import { Card } from '../ui';

withDefaults(defineProps<{
  title?: string,
  showHeader?: boolean
}>(), {
  showHeader: true
});
</script>

<template>
  <Card
    :class="`${!$slots?.default ? '[&>header]:mb-0' : ''} p-6`"
    style="background: linear-gradient(135deg, #0A1B3D 0%, #1a2942 100%); border: 2px solid #D4AF37;"
  >
    <template #header v-if="showHeader">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 class="uppercase text-4xl font-bold bg-gradient-to-r from-christmas-gold via-christmas-gold-light to-christmas-gold bg-clip-text text-transparent">
          <span class="inline-flex gap-2 items-center">
            <slot name="icon" />
            {{ title }}
          </span>
        </h2>
      </div>
    </template>

    <slot />
  </Card>
</template>