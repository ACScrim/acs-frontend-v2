<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { ToastProps } from "@/types/ui";
import { useUIClasses } from "@/composables/useUIClasses";

// Props avec valeurs par défaut
const props = withDefaults(defineProps<ToastProps>(), {
  type: "info",
  duration: 5000,
  position: "top-right",
  closable: true,
  persistent: false,
});

// Events
const emit = defineEmits<{
  close: [];
  action: [];
}>();

// État local
const visible = ref(true);
const timeoutId = ref<number | null>(null);

// Composable pour les classes
const { getAnimationClasses } = useUIClasses();

// Classes calculées
const toastClasses = computed(() => {
  const baseClasses = [
    "relative p-4 rounded-xl shadow-[var(--acs-shadow-lg)]",
    "border backdrop-blur-sm",
    "max-w-sm w-full",
    "acs-hover-lift",
  ];

  // Couleurs selon le type
  const typeClasses = {
    success: [
      "bg-[var(--acs-success-50)] dark:bg-[var(--acs-success-950)]",
      "border-[var(--acs-success-200)] dark:border-[var(--acs-success-800)]",
      "text-[var(--acs-success-800)] dark:text-[var(--acs-success-200)]",
    ],
    error: [
      "bg-[var(--acs-danger-50)] dark:bg-[var(--acs-danger-950)]",
      "border-[var(--acs-danger-200)] dark:border-[var(--acs-danger-800)]",
      "text-[var(--acs-danger-800)] dark:text-[var(--acs-danger-200)]",
    ],
    warning: [
      "bg-[var(--acs-warning-50)] dark:bg-[var(--acs-warning-950)]",
      "border-[var(--acs-warning-200)] dark:border-[var(--acs-warning-800)]",
      "text-[var(--acs-warning-800)] dark:text-[var(--acs-warning-200)]",
    ],
    info: [
      "bg-[var(--acs-accent-50)] dark:bg-[var(--acs-accent-950)]",
      "border-[var(--acs-accent-200)] dark:border-[var(--acs-accent-800)]",
      "text-[var(--acs-accent-800)] dark:text-[var(--acs-accent-200)]",
    ],
    gaming: [
      "bg-[var(--acs-primary-50)] dark:bg-[var(--acs-primary-950)]",
      "border-[var(--acs-primary-200)] dark:border-[var(--acs-primary-800)]",
      "text-[var(--acs-primary-800)] dark:text-[var(--acs-primary-200)]",
      getAnimationClasses("glow"),
    ],
  };

  return [
    ...baseClasses,
    ...typeClasses[props.type],
    visible.value ? "opacity-100" : "opacity-0",
  ].flat();
});

// Icon selon le type
const typeIcon = computed(() => {
  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
    gaming: "🎮",
  };
  return icons[props.type];
});

// Méthodes
const closeToast = () => {
  visible.value = false;
  setTimeout(() => {
    emit("close");
  }, 300); // Attendre la fin de l'animation
};

const startTimer = () => {
  if (!props.persistent && props.duration > 0) {
    timeoutId.value = setTimeout(() => {
      closeToast();
    }, props.duration);
  }
};

const clearTimer = () => {
  if (timeoutId.value) {
    clearTimeout(timeoutId.value);
    timeoutId.value = null;
  }
};

// Lifecycle
onMounted(() => {
  startTimer();
});
</script>

<template>
  <div
    v-if="visible"
    :class="toastClasses"
    @mouseenter="clearTimer"
    @mouseleave="startTimer"
  >
    <div class="flex items-start space-x-3">
      <!-- Icon -->
      <div
        class="flex-shrink-0 text-xl"
        :class="{
          'acs-animate-pulse': type === 'gaming',
        }"
      >
        {{ typeIcon }}
      </div>

      <!-- Contenu -->
      <div class="flex-1 min-w-0">
        <h4
          v-if="title"
          class="font-semibold text-sm mb-1"
          :class="{
            'acs-text-gradient-primary': type === 'gaming',
          }"
        >
          {{ title }}
        </h4>
        <p class="text-sm leading-relaxed">
          <slot>{{ message }}</slot>
        </p>

        <!-- Action button si fourni -->
        <div v-if="actionText" class="mt-3">
          <button
            :class="[
              'text-xs font-medium px-3 py-1 rounded-lg',
              'hover:bg-black/10 dark:hover:bg-white/10',
              'transition-colors duration-200',
              type === 'gaming' ? 'acs-text-gradient-primary' : '',
            ]"
            @click="$emit('action')"
          >
            {{ actionText }}
          </button>
        </div>
      </div>

      <!-- Bouton fermer -->
      <button
        v-if="closable"
        class="flex-shrink-0 text-lg opacity-60 hover:opacity-100 transition-opacity duration-200"
        @click="closeToast"
      >
        ✕
      </button>
    </div>

    <!-- Barre de progression pour le timer -->
    <div
      v-if="!persistent && duration > 0 && visible"
      class="absolute bottom-0 left-0 h-1 rounded-b-xl"
      :class="{
        'bg-[var(--acs-success-400)]': type === 'success',
        'bg-[var(--acs-danger-400)]': type === 'error',
        'bg-[var(--acs-warning-400)]': type === 'warning',
        'bg-[var(--acs-accent-400)]': type === 'info',
        'acs-bg-gradient-gaming': type === 'gaming',
      }"
      :style="{
        width: '100%',
        animation: `shrink ${duration}ms linear forwards`,
      }"
    />
  </div>
</template>

<style scoped>
@keyframes shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
</style>
