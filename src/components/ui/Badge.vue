<script setup lang="ts">
const props = withDefaults(defineProps<{
  tone?: 'accent' | 'emerald' | 'blush' | 'neutral'
  size?: 'sm' | 'md'
}>(), {
  tone: 'accent',
  size: 'sm'
});

const tones: Record<string, string> = {
  accent: 'bg-accent-500/15 text-accent-200 border border-accent-500/30',
  emerald: 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/30',
  blush: 'bg-blush-500/15 text-blush-200 border border-blush-500/30',
  neutral: 'bg-white/10 text-white border border-white/20'
};

const sizes = {
  sm: 'px-3 py-1 text-xs uppercase tracking-[0.25em]',
  md: 'px-4 py-2 text-sm font-semibold'
};
</script>

<template>
  <span class="inline-flex items-center rounded-full" :class="`${tones[props.tone]} ${sizes[props.size]}`" v-tw-merge>
    <slot>
      <!-- Contenu par défaut si aucun slot -->
      <span v-if="$slots.default === undefined">Badge</span>
    </slot>
  </span>
</template>
