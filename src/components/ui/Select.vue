<script setup lang="ts">
defineProps<{
  modelValue?: string,
  options: Array<{ label: string, value: string }>
  defaultOptionLabel?: string
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
  >
    <option v-if="options.find(o => o.value.length === 0)" value="" class="bg-ink-900 text-foam-200">{{ defaultOptionLabel }}</option>
    <option v-for="option in options" :key="option.value" :value="option.value" class="bg-ink-900 text-foam-50">
      {{ option.label }}
    </option>
  </select>
</template>