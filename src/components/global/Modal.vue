<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { Teleport, useTemplateRef } from 'vue';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const target = useTemplateRef<HTMLElement>('target')
onClickOutside(target, () => emit('close'));
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 backdrop-blur-lg text-white">
      <div
        ref="target"
        class="glass-panel w-full max-w-2xl rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-soft)]"
      >
        <button class="absolute right-6 top-6 text-foam-300/70 hover:text-white" @click="$emit('close')">
          &times;
        </button>
        <div class="hidden md:block">
          <slot name="header" />
        </div>
        <div class="mt-4 max-h-[70vh] overflow-y-auto">
          <slot />
        </div>
        <div class="mt-4 max-h-[70vh] overflow-y-auto">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
button {
  @apply transition;
}
</style>