<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

interface Props {
  type?: "success" | "error" | "warning" | "info";
  title?: string;
  message?: string;
  actionText?: string;
  duration?: number; // en ms, 0 pour persistant
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  closable?: boolean;
  persistent?: boolean; // Si true, ne se ferme pas automatiquement
}

// Props avec valeurs par défaut
const props = withDefaults(defineProps<Props>(), {
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
    @mouseenter="clearTimer"
    @mouseleave="startTimer"
  >
    <div class="flex items-start space-x-3">
      <!-- Icon -->
      <div
        class="flex-shrink-0 text-xl"
      >
        {{ typeIcon }}
      </div>

      <!-- Contenu -->
      <div class="flex-1 min-w-0">
        <h4
          v-if="title"
          class="font-semibold text-sm mb-1"
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
