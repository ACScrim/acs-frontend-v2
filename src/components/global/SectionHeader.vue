<script setup lang="ts">
import { computed } from 'vue';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';

const props = withDefaults(defineProps<{
  title: string;
  color: string;
  icon?: string;
  sizeClass?: string;
  iconClass?: string;
  titleClass?: string;
}>(), {
  sizeClass: 'text-xl',
  iconClass: '',
  titleClass: ''
});

const BASE_HEADING_CLASSES = 'flex items-center gap-2 pl-4 -ml-4 py-1 border-l-4';
const BASE_TEXT_CLASSES = 'font-semibold text-white';

const headingClasses = computed(() => [
  BASE_HEADING_CLASSES,
  BASE_TEXT_CLASSES,
  props.sizeClass,
  props.titleClass
]);
</script>

<template>
  <h2 :class="headingClasses" :style="{ borderLeftColor: color }">
    <VueIcon v-if="icon" :name="icon" :class="iconClass" />
    <slot>{{ title }}</slot>
  </h2>
</template>
