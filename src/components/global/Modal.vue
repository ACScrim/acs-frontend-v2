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
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 md:bg-black/50 text-christmas-ice"
    >
      <!-- Mobile: Action Sheet -->
      <div
        class="fixed bottom-0 left-0 right-0 md:static md:max-w-2xl bg-christmas-navy rounded-t-2xl md:rounded-lg shadow-lg w-full p-6 animate-in slide-in-from-bottom-5 md:animate-none"
        ref="target"
      >
        <button
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-200 md:block"
          @click="$emit('close')"
        >
          &times;
        </button>

        <!-- Handle for mobile -->
        <div class="flex justify-center mb-4 md:hidden">
          <div class="w-12 h-1 bg-christmas-gold/30 rounded-full"></div>
        </div>

        <slot name="header"></slot>
        <div class="modal-content mt-4">
          <slot></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@media (max-width: 768px) {
  /* Action sheet mobile styles */
  :deep(.modal-content) {
    max-height: 70vh;
    overflow-y: auto;
  }

  button {
    width: 100%;
    text-align: left;
    padding: 1rem;
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    border-bottom: 1px solid rgb(var(--color-christmas-gold-rgb) / 0.1);
  }

  button:last-child {
    border-bottom: none;
  }

  button:hover {
    background-color: rgb(var(--color-christmas-gold-rgb) / 0.05);
  }
}

@media (min-width: 768px) {
  div {
    animation: none;
  }
}
</style>