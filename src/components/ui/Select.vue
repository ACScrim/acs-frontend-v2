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
    class="flex-1 md:w-auto bg-gradient-to-r from-christmas-navy/50 to-christmas-midnight/50 border-2 border-christmas-gold/50 text-christmas-gold-light rounded-lg px-4 py-2 font-semibold hover:border-christmas-gold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-christmas-gold/50 shadow-lg hover:shadow-xl hover:shadow-christmas-gold/20"
  >
    <option v-if="options.find(o => o.value.length === 0)" value="" class="bg-christmas-navy text-christmas-gold-light">{{ defaultOptionLabel }}</option>
    <option v-for="option in options" :key="option.value" :value="option.value" class="bg-christmas-navy text-christmas-gold-light">
      {{ option.label }}
    </option>
  </select>
</template>