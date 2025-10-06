<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import type { ModalProps } from "@/types/ui";
import { useUIClasses } from "@/composables/useUIClasses";

// Props avec valeurs par défaut
const props = withDefaults(defineProps<ModalProps>(), {
  size: "md",
  closable: true,
  persistent: false,
  centered: true,
  scrollable: true,
  backdrop: true,
  backdropBlur: true,
});

// Model pour contrôler l'état ouvert/fermé
const modelValue = defineModel<boolean>({ default: false });

// Events
const emit = defineEmits<{
  opened: [];
  closed: [];
  backdropClick: [];
}>();

// Composable pour les classes
const { getAnimationClasses } = useUIClasses();

// Refs
const modalRef = ref<HTMLElement>();
const overlayRef = ref<HTMLElement>();

// Classes calculées
const overlayClasses = computed(() => [
  "fixed inset-0 z-50",
  props.backdrop
    ? "bg-black/70 dark:bg-black/85"
    : "bg-transparent pointer-events-none",
  // Réduire le backdrop blur qui peut causer des bugs visuels
  props.backdropBlur ? "backdrop-blur-[2px]" : "",
]);

const modalClasses = computed(() => {
  const baseClasses = [
    "relative w-full mx-auto",
    "bg-[var(--acs-bg-primary)]",
    "border border-[var(--acs-border-primary)]",
    "rounded-2xl shadow-[var(--acs-shadow-xl)]",
    // Retirer les transitions redondantes pour éviter les bugs
  ];

  // Tailles
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-none mx-4 h-[calc(100vh-2rem)]",
  };

  // Scrollable
  const scrollClasses = props.scrollable
    ? ["max-h-[calc(100vh-4rem)]", "overflow-y-auto"]
    : [];

  return [
    ...baseClasses,
    sizeClasses[props.size],
    ...scrollClasses,
    getAnimationClasses("glow"),
  ];
});

const containerClasses = computed(() => [
  "fixed inset-0 z-50",
  "flex items-center justify-center p-4",
  props.centered ? "items-center" : "items-start pt-20",
  props.scrollable ? "overflow-y-auto" : "overflow-hidden",
]);

// Méthodes
const closeModal = () => {
  if (!props.persistent) {
    modelValue.value = false;
  }
};

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === overlayRef.value) {
    emit("backdropClick");
    if (!props.persistent) {
      closeModal();
    }
  }
};

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === "Escape" && modelValue.value && props.closable) {
    closeModal();
  }
};

const focusModal = async () => {
  await nextTick();
  if (modalRef.value) {
    modalRef.value.focus();
  }
};

// Watchers
watch(
  () => modelValue.value,
  (isOpen) => {
    if (isOpen) {
      focusModal();
      emit("opened");
      // Empêcher le scroll du body
      document.body.style.overflow = "hidden";
    } else {
      emit("closed");
      // Restaurer le scroll du body
      document.body.style.overflow = "";
    }
  },
  { immediate: true }
);

// Lifecycle
onMounted(() => {
  document.addEventListener("keydown", handleEscapeKey);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleEscapeKey);
  // Restaurer le scroll du body au cas où
  document.body.style.overflow = "";
});
</script>

<template>
  <Teleport to="body">
    <!-- Transition simplifiée pour l'overlay -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        ref="overlayRef"
        :class="overlayClasses"
        @click="handleBackdropClick"
      >
        <div :class="containerClasses">
          <!-- Transition simplifiée pour le modal -->
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="modelValue"
              ref="modalRef"
              :class="modalClasses"
              tabindex="-1"
              role="dialog"
              aria-modal="true"
              @click.stop
            >
              <!-- Header -->
              <div
                v-if="$slots.header || closable"
                class="flex items-center justify-between p-6 border-b border-[var(--acs-border-secondary)]"
              >
                <div class="flex-1">
                  <slot name="header">
                    <h3
                      class="text-xl font-bold text-[var(--acs-text-primary)]"
                    >
                      Modal Gaming
                    </h3>
                  </slot>
                </div>

                <!-- Bouton fermer -->
                <button
                  v-if="closable"
                  class="ml-4 p-2 rounded-lg text-[var(--acs-text-muted)] hover:text-[var(--acs-text-primary)] hover:bg-[var(--acs-bg-secondary)] transition-colors duration-200"
                  @click="closeModal"
                >
                  <span class="text-xl">✕</span>
                </button>
              </div>

              <!-- Body -->
              <div class="p-6">
                <slot>
                  <p class="text-[var(--acs-text-secondary)]">
                    Contenu du modal gaming ACS...
                  </p>
                </slot>
              </div>

              <!-- Footer -->
              <div
                v-if="$slots.footer"
                class="flex items-center justify-end space-x-3 p-6 border-t border-[var(--acs-border-secondary)] bg-[var(--acs-bg-secondary)] rounded-b-2xl"
              >
                <slot name="footer" :close="closeModal">
                  <button
                    class="px-4 py-2 text-sm font-medium text-[var(--acs-text-muted)] hover:text-[var(--acs-text-primary)] transition-colors duration-200"
                    @click="closeModal"
                  >
                    Annuler
                  </button>
                </slot>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Styles pour le modal gaming */
.modal-gaming {
  background: linear-gradient(
    135deg,
    var(--acs-primary-900) 0%,
    var(--acs-primary-800) 100%
  );
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px var(--acs-primary-500), 0 0 20px var(--acs-primary-500/30);
}
</style>
