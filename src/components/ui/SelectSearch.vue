<script setup lang="ts" generic="T extends { value: string; label: string }">
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { onClickOutside } from '@vueuse/core';
import { computed, ref } from 'vue';

interface Props {
  id?: string;
  modelValue?: string;
  options: T[];
  placeholder?: string;
  searchable?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
}

interface Emits {
  'update:modelValue': [value: string];
  'search': [query: string];
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Sélectionner...',
  searchable: true,
  isLoading: false,
  disabled: false
});

const emit = defineEmits<Emits>();

const isOpen = ref(false);
const searchQuery = ref('');
const containerRef = ref<HTMLElement | null>(null);

const selectedOption = computed(() => {
  return props.options.find(opt => opt.value === props.modelValue);
});

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options;
  
  return props.options.filter(opt =>
    opt.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const handleSelect = (value: string) => {
  emit('update:modelValue', value);
  isOpen.value = false;
  searchQuery.value = '';
};

const handleSearch = (query: string) => {
  searchQuery.value = query;
  emit('search', query);
};

// Utilise onClickOutside de @vueuse/core
onClickOutside(containerRef, () => {
  isOpen.value = false;
  searchQuery.value = '';
});
</script>

<template>
  <div ref="containerRef" class="relative w-full">
    <!-- Bouton trigger -->
    <button
      :id="id"
      type="button"
      @click="isOpen = !isOpen"
      :disabled="disabled"
      class="w-full px-4 py-2.5 text-left bg-ink-900 border border-white/10 text-foam-50 rounded-lg focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
    >
      <span :class="selectedOption ? 'text-foam-50' : 'text-foam-300/60'">
        {{ selectedOption?.label || placeholder }}
      </span>
      <VueIcon 
        name="bs:chevron-down" 
        :class="['transition-transform', isOpen ? 'rotate-180' : '']" 
      />
    </button>

    <!-- Dropdown menu -->
    <div
      v-show="isOpen"
      class="absolute top-full left-0 right-0 mt-1 bg-ink-900 border border-white/10 rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <!-- Search input toujours accessible -->
      <div v-if="searchable" class="p-3 border-b border-white/10">
        <input
          type="text"
          :value="searchQuery"
          @input="handleSearch(($event.target as HTMLInputElement).value)"
          @click.stop
          placeholder="Rechercher..."
          class="w-full px-3 py-2 bg-ink-800/80 border border-white/10 text-foam-50 placeholder:text-foam-300/50 rounded focus:border-accent-300 focus:outline-none focus:ring-1 focus:ring-accent-300/20 transition-all"
          autofocus
        />
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="px-4 py-6 text-center">
        <VueIcon name="bs:hourglass-split" class="text-accent-300 animate-spin mx-auto text-xl" />
      </div>

      <!-- Options list -->
      <ul
        v-else-if="filteredOptions.length"
        class="max-h-64 overflow-y-auto"
      >
        <li v-for="option in filteredOptions" :key="option.value">
          <!-- Default slot pour personnaliser les items -->
          <slot name="item" :option="option" :isSelected="option.value === modelValue" :onSelect="handleSelect">
            <button
              type="button"
              @click="handleSelect(option.value)"
              @click.stop
              :class="[
                'w-full text-left px-4 py-2.5 hover:bg-white/5 transition-colors flex items-center justify-between',
                option.value === modelValue
                  ? 'bg-accent-500/15 border-l-2 border-accent-400 text-foam-50 font-bold'
                  : 'text-foam-200 hover:text-foam-50'
              ]"
            >
              <span>{{ option.label }}</span>
              <VueIcon v-if="option.value === modelValue" name="bs:check-lg" class="text-accent-300" />
            </button>
          </slot>
        </li>
      </ul>

      <!-- Empty state -->
      <div v-else class="px-4 py-6 text-center text-foam-300/50 text-sm">
        Aucun résultat trouvé
      </div>
    </div>
  </div>
</template>