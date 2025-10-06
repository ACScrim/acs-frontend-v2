<script setup lang="ts">
import { computed, ref, useSlots } from "vue";
import type { InputProps } from "@/types/ui";
import { useUIClasses } from "@/composables/useUIClasses";

interface Props extends InputProps {
  modelValue?: string | number;
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search";
  autocomplete?: string;
  maxlength?: number;
  minlength?: number;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
  variant: "outline",
  state: "default",
  type: "text",
  disabled: false,
  readonly: false,
  required: false,
  iconPosition: "left",
});

const emit = defineEmits<{
  "update:modelValue": [value: string | number];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  input: [event: Event];
}>();

const slots = useSlots();
const inputRef = ref<HTMLInputElement>();
const { getInputClasses } = useUIClasses();

// Classes calculées
const inputClasses = computed(() =>
  getInputClasses(props.size, props.variant, props.state)
);

// Gestion de la valeur
const localValue = computed({
  get: () => props.modelValue ?? "",
  set: (value) => emit("update:modelValue", value),
});

// Méthodes
const focus = () => inputRef.value?.focus();
const blur = () => inputRef.value?.blur();

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
  emit("input", event);
};

const handleFocus = (event: FocusEvent) => emit("focus", event);
const handleBlur = (event: FocusEvent) => emit("blur", event);

// Exposer les méthodes
defineExpose({
  focus,
  blur,
  inputRef,
});
</script>

<template>
  <div class="w-full">
    <!-- Label -->
    <label
      v-if="label"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Input wrapper -->
    <div class="relative">
      <!-- Icône gauche -->
      <div
        v-if="icon && iconPosition === 'left'"
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
      >
        <span class="text-gray-400 text-sm">{{ icon }}</span>
      </div>

      <!-- Input principal -->
      <input
        ref="inputRef"
        :type="type"
        :value="localValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :maxlength="maxlength"
        :minlength="minlength"
        :min="min"
        :max="max"
        :step="step"
        :pattern="pattern"
        :class="[
          inputClasses,
          icon && iconPosition === 'left' ? 'pl-10' : '',
          icon && iconPosition === 'right' ? 'pr-10' : '',
        ]"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <!-- Icône droite -->
      <div
        v-if="icon && iconPosition === 'right'"
        class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
      >
        <span class="text-gray-400 text-sm">{{ icon }}</span>
      </div>

      <!-- Slot pour contenu personnalisé (ex: bouton clear) -->
      <div
        v-if="slots.append"
        class="absolute inset-y-0 right-0 flex items-center pr-3"
      >
        <slot name="append" />
      </div>
    </div>

    <!-- Message d'aide ou d'erreur -->
    <div class="mt-1 text-sm">
      <p
        v-if="errorMessage && state === 'error'"
        class="text-red-600 dark:text-red-400"
      >
        {{ errorMessage }}
      </p>
      <p v-else-if="helperText" class="text-gray-500 dark:text-gray-400">
        {{ helperText }}
      </p>
    </div>
  </div>
</template>
