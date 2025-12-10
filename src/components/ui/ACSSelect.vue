<script setup lang="ts">
defineProps<{
  modelValue?: string,
  options: Array<{ label: string, value: string }>
  defaultOptionLabel?: string
  customClass?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>();
</script>

<template>
  <select 
    :value="modelValue"
    @input="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    class="flex-1 md:w-auto bg-gradient-to-r from-ink-800/70 to-ink-900/70 border border-white/10 text-foam-50 rounded-lg px-4 py-2 font-semibold hover:border-accent-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-300/40 shadow-lg hover:shadow-xl hover:shadow-accent-300/20"
    :class="customClass"
    v-tw-merge
  >
    <option v-if="options.find(o => o.value.length === 0)" value="" class="bg-ink-900 text-foam-200">{{ defaultOptionLabel }}</option>
    <option v-for="option in options" :key="option.value" :value="option.value" class="bg-ink-900 text-foam-50">
      {{ option.label }}
    </option>
  </select>
</template>

<style scoped>
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='white'%3E%3Cpath fill-rule='evenodd' d='M10 12a1 1 0 01-.707-.293l-3-3a1 1 0 111.414-1.414L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3A1 1 0 0110 12z' clip-rule='evenodd'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1em;
}
</style>