<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import type { DropdownProps, DropdownItem } from "@/types/ui";

// Props avec valeurs par défaut
const props = withDefaults(defineProps<DropdownProps>(), {
  items: () => [],
  placeholder: "Sélectionner...",
  disabled: false,
  searchable: false,
  multiple: false,
  size: "md",
});

// Model values
const modelValue = defineModel<string | number | (string | number)[]>();

// Events
const emit = defineEmits<{
  change: [value: string | number | (string | number)[]];
  search: [query: string];
  open: [];
  close: [];
}>();

// État local
const isOpen = ref(false);
const searchQuery = ref("");
const dropdownRef = ref<HTMLElement>();
const triggerRef = ref<HTMLElement>();
const menuRef = ref<HTMLElement>();

// Items filtrés pour la recherche
const filteredItems = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.items;
  }

  return props.items.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Valeur sélectionnée affichée
const displayValue = computed(() => {
  if (!modelValue.value) return props.placeholder;

  if (props.multiple && Array.isArray(modelValue.value)) {
    if (modelValue.value.length === 0) return props.placeholder;
    if (modelValue.value.length === 1) {
      const firstValue = modelValue.value[0];
      const item = props.items.find((i) => i.value === firstValue);
      return item?.label || String(firstValue);
    }
    return `${modelValue.value.length} éléments sélectionnés`;
  }

  const item = props.items.find((i) => i.value === modelValue.value);
  return item?.label || String(modelValue.value);
});

// Classes calculées
const triggerClasses = computed(() => {
  const baseClasses = [
    "relative w-full",
    "flex items-center justify-between",
    "px-3 py-2",
    "bg-[var(--acs-bg-primary)]",
    "border border-[var(--acs-border-primary)]",
    "rounded-lg",
    "text-[var(--acs-text-primary)]",
    "transition-all duration-200",
    "cursor-pointer",
    "select-none",
  ];

  // Tailles
  const sizeClasses = {
    sm: ["text-sm", "px-2", "py-1.5"],
    md: ["text-sm", "px-3", "py-2"],
    lg: ["text-base", "px-4", "py-3"],
  };

  // États
  const stateClasses = [];
  if (props.disabled) {
    stateClasses.push(
      "opacity-50",
      "cursor-not-allowed",
      "bg-[var(--acs-bg-disabled)]"
    );
  } else {
    stateClasses.push(
      "hover:border-[var(--acs-border-hover)]",
      "focus:outline-none",
      "focus:ring-2",
      "focus:ring-[var(--acs-primary-500)]",
      "focus:border-[var(--acs-primary-500)]"
    );
  }

  if (isOpen.value && !props.disabled) {
    stateClasses.push(
      "border-[var(--acs-primary-500)]",
      "ring-2",
      "ring-[var(--acs-primary-500)]"
    );
  }

  return [...baseClasses, ...sizeClasses[props.size], ...stateClasses];
});

const menuClasses = computed(() => [
  "absolute z-50 mt-1 w-full",
  "bg-[var(--acs-bg-primary)]",
  "border border-[var(--acs-border-primary)]",
  "rounded-lg",
  "shadow-[var(--acs-shadow-xl)]",
  "backdrop-blur-sm",
  "max-h-60",
  "overflow-auto",
  "py-1",
]);

const itemClasses = (item: DropdownItem, isSelected: boolean) => [
  "flex items-center px-3 py-2",
  "text-sm",
  "cursor-pointer",
  "transition-colors duration-150",
  item.disabled
    ? "opacity-50 cursor-not-allowed text-[var(--acs-text-muted)]"
    : isSelected
    ? "bg-[var(--acs-primary-500)] text-white"
    : "text-[var(--acs-text-primary)] hover:bg-[var(--acs-bg-secondary)]",
];

// Méthodes
const toggleDropdown = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
};

const closeDropdown = () => {
  isOpen.value = false;
  searchQuery.value = "";
};

const selectItem = (item: DropdownItem) => {
  if (item.disabled) return;

  if (props.multiple) {
    const currentValues = Array.isArray(modelValue.value)
      ? modelValue.value
      : [];
    const newValues = currentValues.includes(item.value)
      ? currentValues.filter((v) => v !== item.value)
      : [...currentValues, item.value];

    modelValue.value = newValues;
    emit("change", newValues);
  } else {
    modelValue.value = item.value;
    emit("change", item.value);
    closeDropdown();
  }
};

const isSelected = (item: DropdownItem) => {
  if (props.multiple && Array.isArray(modelValue.value)) {
    return modelValue.value.includes(item.value);
  }
  return modelValue.value === item.value;
};

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown();
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (!isOpen.value) return;

  switch (event.key) {
    case "Escape":
      closeDropdown();
      break;
    case "ArrowDown":
      event.preventDefault();
      // TODO: Navigation au clavier
      break;
    case "ArrowUp":
      event.preventDefault();
      // TODO: Navigation au clavier
      break;
    case "Enter":
      event.preventDefault();
      // TODO: Sélection avec Enter
      break;
  }
};

const handleSearch = (event: Event) => {
  const target = event.target as HTMLInputElement;
  searchQuery.value = target.value;
  emit("search", target.value);
};

// Watchers
watch(isOpen, (newValue) => {
  if (newValue) {
    emit("open");
    nextTick(() => {
      if (props.searchable && menuRef.value) {
        const searchInput = menuRef.value.querySelector("input");
        if (searchInput) {
          searchInput.focus();
        }
      }
    });
  } else {
    emit("close");
  }
});

// Lifecycle
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <!-- Trigger -->
    <div
      ref="triggerRef"
      :class="triggerClasses"
      @click="toggleDropdown"
      @keydown.enter.space.prevent="toggleDropdown"
      tabindex="0"
      role="combobox"
      :aria-expanded="isOpen"
      :aria-disabled="disabled"
    >
      <span class="truncate">{{ displayValue }}</span>
      <svg
        class="w-4 h-4 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>

    <!-- Menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div v-if="isOpen" ref="menuRef" :class="menuClasses">
        <!-- Champ de recherche -->
        <div
          v-if="searchable"
          class="px-3 py-2 border-b border-[var(--acs-border-secondary)]"
        >
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher..."
            class="w-full px-2 py-1 text-sm bg-[var(--acs-bg-secondary)] border border-[var(--acs-border-primary)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--acs-primary-500)]"
            @input="handleSearch"
            @click.stop
          />
        </div>

        <!-- Items -->
        <div v-if="filteredItems.length > 0">
          <template v-for="(item, index) in filteredItems" :key="item.value">
            <!-- Divider -->
            <hr
              v-if="item.divider && index > 0"
              class="my-1 border-[var(--acs-border-secondary)]"
            />

            <!-- Item -->
            <div
              v-if="!item.divider"
              :class="itemClasses(item, isSelected(item))"
              @click="selectItem(item)"
            >
              <!-- Icon -->
              <span v-if="item.icon" class="mr-2 text-base">{{
                item.icon
              }}</span>

              <!-- Label -->
              <span class="flex-1 truncate">{{ item.label }}</span>

              <!-- Checkmark pour multiple -->
              <svg
                v-if="multiple && isSelected(item)"
                class="w-4 h-4 ml-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </template>
        </div>

        <!-- Aucun résultat -->
        <div
          v-else
          class="px-3 py-2 text-sm text-[var(--acs-text-muted)] text-center"
        >
          {{
            searchable && searchQuery
              ? "Aucun résultat trouvé"
              : "Aucun élément disponible"
          }}
        </div>
      </div>
    </Transition>
  </div>
</template>
