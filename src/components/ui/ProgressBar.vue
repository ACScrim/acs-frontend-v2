<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  current: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  animated?: boolean;
  forceBarColorClass?: string;
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
  if (props.forceBarColorClass) {
    return props.forceBarColorClass;
  }
  if (percentage.value >= 90) {
    return 'bg-gradient-to-r from-blush-500 to-blush-400 shadow-[0_5px_20px_rgba(255,95,143,0.35)]';
  } else if (percentage.value >= 70) {
    return 'bg-gradient-to-r from-accent-500 to-emerald-500 shadow-[0_5px_20px_rgba(124,58,237,0.35)]';
  }
  return 'bg-gradient-to-r from-emerald-500 to-emerald-300 shadow-[0_5px_20px_rgba(20,220,180,0.35)]';
});
</script>

<template>
  <div class="space-y-2">
    <div v-if="label || showPercentage" class="flex justify-between items-center">
      <span v-if="label" class="text-sm font-semibold text-foam-200/80">
        {{ label }}
      </span>
      <span v-if="showPercentage" class="text-sm font-bold text-foam-50">
        {{ current }} / {{ max }} ({{ percentage }}%)
      </span>
    </div>
    <div class="w-full bg-ink-800 rounded-full h-3 overflow-hidden border border-white/10 shadow-inner">
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