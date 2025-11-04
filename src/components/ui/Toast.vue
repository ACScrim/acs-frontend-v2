<script setup lang="ts">
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { computed } from 'vue';

interface Props {
  id: string;
  message: string;
  details?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 3000,
});

const emit = defineEmits<{
  'remove': [id: string];
}>();

const bgClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-500 border-green-500/50 text-white';
    case 'error':
      return 'bg-red-500 border-red-500/50 text-white';
    case 'warning':
      return 'bg-yellow-500 border-yellow-500/50 text-white';
    default:
      return 'bg-christmas-gold border-christmas-gold/50 text-white';
  }
});

const iconName = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bs:check-circle-fill';
    case 'error':
      return 'bs:exclamation-circle-fill';
    case 'warning':
      return 'bs:exclamation-triangle-fill';
    default:
      return 'bs:info-circle-fill';
  }
});

setTimeout(() => {
  emit('remove', props.id);
}, props.duration);
</script>

<template>
  <div
    :class="[
      'flex items-center gap-3 px-4 py-3 rounded-lg border-2 animate-in slide-in-from-top-2 fade-in duration-300',
      bgClass
    ]"
  >
    <VueIcon :name="iconName" class="text-xl flex-shrink-0" />
    <div>
      <p class="text-sm font-medium flex-1">{{ message }}</p>
      <p v-if="details" class="text-xs flex-1">{{ details }}</p>
    </div>
    <button
      @click="$emit('remove', id)"
      class="flex-shrink-0 hover:opacity-70 transition-opacity"
    >
      <VueIcon name="bs:x-lg" class="text-lg" />
    </button>
  </div>
</template>