<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  current: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  animated?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  showPercentage: true,
  animated: true,
});

const percentage = computed(() => {
  return props.max > 0 ? Math.round((props.current / props.max) * 100) : 0;
});

const barColor = computed(() => {
  if (percentage.value >= 90) {
    return 'bg-gradient-to-r from-christmas-red to-christmas-crimson shadow-christmas-red/50';
  } else if (percentage.value >= 70) {
    return 'bg-gradient-to-r from-christmas-gold to-christmas-gold-light shadow-christmas-gold/50';
  }
  return 'bg-gradient-to-r from-christmas-pine to-christmas-forest shadow-christmas-pine/50';
});
</script>

<template>
  <div class="space-y-2">
    <div v-if="label || showPercentage" class="flex justify-between items-center">
      <span v-if="label" class="text-sm font-semibold text-christmas-gold-light">
        {{ label }}
      </span>
      <span v-if="showPercentage" class="text-sm font-bold text-christmas-gold">
        {{ current }} / {{ max }} ({{ percentage }}%)
      </span>
    </div>
    <div class="w-full bg-christmas-navy/50 rounded-full h-3 overflow-hidden border-2 border-christmas-gold/30 shadow-lg">
      <div
        :class="['h-full transition-all rounded-full shadow-lg', barColor]"
        :style="{
          width: `${percentage}%`,
          transitionDuration: props.animated ? '500ms' : '0ms',
        }"
      ></div>
    </div>
  </div>
</template>