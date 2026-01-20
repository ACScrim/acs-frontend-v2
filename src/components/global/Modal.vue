<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { Teleport, useTemplateRef, watch, nextTick, onBeforeUnmount } from 'vue';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const target = useTemplateRef<HTMLElement>('target');
onClickOutside(target, () => emit('close'));

// Store the previously focused element
let previousActiveElement: HTMLElement | null = null;

// Focus trap implementation for accessibility
const handleKeyDown = (e: KeyboardEvent) => {
  if (!props.isOpen) return;
  
  // Close on Escape
  if (e.key === 'Escape') {
    emit('close');
    return;
  }

  // Trap Tab key focus within modal
  if (e.key === 'Tab' && target.value) {
    const focusableElements = target.value.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        lastElement?.focus();
        e.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        firstElement?.focus();
        e.preventDefault();
      }
    }
  }
};

// Manage focus and keyboard listeners
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    // Store current focus
    previousActiveElement = document.activeElement as HTMLElement;
    
    // Wait for DOM update
    await nextTick();
    
    // Focus first focusable element in modal
    if (target.value) {
      const firstFocusable = target.value.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusable?.focus();
    }
    
    // Add keyboard listener
    document.addEventListener('keydown', handleKeyDown);
  } else {
    // Remove keyboard listener
    document.removeEventListener('keydown', handleKeyDown);
    
    // Restore focus to previous element
    previousActiveElement?.focus();
    previousActiveElement = null;
  }
});

// Cleanup on unmount
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 backdrop-blur-lg text-white"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref="target"
        class="glass-panel w-full max-w-2xl rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-soft)]"
        tabindex="-1"
      >
        <button 
          class="absolute right-6 top-6 text-foam-300/70 hover:text-white" 
          @click="$emit('close')"
          aria-label="Close modal"
        >
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